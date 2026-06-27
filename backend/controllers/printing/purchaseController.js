// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Paper Purchase Controller
//
// Purpose:
// - Get paper purchase records
// - Add paper purchases
// - Increase paper inventory
// - Log inventory transactions
//
// Module:
// Printing Management
// ============================================

const { sql, poolPromise } = require("../../config/db");
const asyncHandler = require("../../shared/helpers/asyncHandler");
const {
  sendSuccess,
  sendError,
} = require("../../shared/helpers/apiResponse");

// ============================================
// GET PURCHASES
// Route: GET /api/purchases
// ============================================

const getPurchases = asyncHandler(async (req, res) => {
  // Connect to SQL Server
  const pool = await poolPromise;

  // Load paper purchase records, newest first
  const result = await pool.request().query(`
    SELECT
      PurchaseId,
      PaperType,
      QuantityBoxes,
      TotalBundles,
      TotalSheets,
      PurchaseDate,
      CreatedAt
    FROM PaperPurchases
    ORDER BY PurchaseDate DESC, PurchaseId DESC
  `);

  return sendSuccess(
    res,
    "Paper purchases loaded successfully.",
    result.recordset
  );
});

// ============================================
// ADD PURCHASE
// Route: POST /api/purchases
// ============================================

const addPurchase = asyncHandler(async (req, res) => {
  const { paperType, quantityBoxes, purchaseDate } = req.body;

  // Validate required fields
  if (!paperType || !quantityBoxes || !purchaseDate) {
    return sendError(
      res,
      "Paper type, quantity boxes, and purchase date are required.",
      400
    );
  }

  // Validate allowed paper type
  if (!["A4", "A3"].includes(paperType)) {
    return sendError(res, "Paper type must be A4 or A3.", 400);
  }

  // Validate positive quantity
  if (Number(quantityBoxes) <= 0) {
    return sendError(res, "Quantity boxes must be greater than 0.", 400);
  }

  // Create transaction because this operation affects:
  // 1. PaperPurchases
  // 2. PaperInventory
  // 3. InventoryTransactions
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // ============================================
    // Step 1: Get Current Inventory
    // ============================================

    const inventoryResult = await new sql.Request(transaction)
      .input("PaperType", sql.VarChar(10), paperType)
      .query(`
        SELECT
          InventoryId,
          CurrentStock
        FROM PaperInventory
        WHERE PaperType = @PaperType
      `);

    if (inventoryResult.recordset.length === 0) {
      await transaction.rollback();

      return sendError(
        res,
        `${paperType} inventory record not found.`,
        404
      );
    }

    const inventory = inventoryResult.recordset[0];
    const previousStock = Number(inventory.CurrentStock || 0);

    // ============================================
    // Step 2: Insert Purchase Record
    // ============================================

    const insertResult = await new sql.Request(transaction)
      .input("PaperType", sql.VarChar(10), paperType)
      .input("QuantityBoxes", sql.Int, Number(quantityBoxes))
      .input("PurchaseDate", sql.Date, purchaseDate)
      .query(`
        INSERT INTO PaperPurchases (
          PaperType,
          QuantityBoxes,
          PurchaseDate
        )
        OUTPUT
          INSERTED.PurchaseId,
          INSERTED.PaperType,
          INSERTED.QuantityBoxes,
          INSERTED.TotalBundles,
          INSERTED.TotalSheets,
          INSERTED.PurchaseDate,
          INSERTED.CreatedAt
        VALUES (
          @PaperType,
          @QuantityBoxes,
          @PurchaseDate
        )
      `);

    const purchase = insertResult.recordset[0];
    const totalSheets = Number(purchase.TotalSheets || 0);
    const newStock = previousStock + totalSheets;

    // ============================================
    // Step 3: Increase Paper Inventory
    // ============================================

    await new sql.Request(transaction)
      .input("PaperType", sql.VarChar(10), paperType)
      .input("TotalSheets", sql.Int, totalSheets)
      .query(`
        UPDATE PaperInventory
        SET
          CurrentStock = CurrentStock + @TotalSheets,
          LastUpdated = GETDATE()
        WHERE PaperType = @PaperType
      `);

    // ============================================
    // Step 4: Log Inventory Transaction
    // ============================================

    await new sql.Request(transaction)
      .input("PaperType", sql.VarChar(10), paperType)
      .input("TransactionType", sql.VarChar(50), "PURCHASE")
      .input("Quantity", sql.Int, totalSheets)
      .input("PreviousStock", sql.Int, previousStock)
      .input("NewStock", sql.Int, newStock)
      .input("ReferenceId", sql.Int, purchase.PurchaseId)
      .input(
        "Remarks",
        sql.VarChar(255),
        `Purchased ${purchase.QuantityBoxes} boxes of ${paperType} = ${purchase.TotalBundles} bundles = ${purchase.TotalSheets} sheets`
      )
      .input("CreatedBy", sql.Int, req.user?.id || req.user?.UserId || 1)
      .query(`
        INSERT INTO InventoryTransactions
        (
          PaperType,
          TransactionType,
          Quantity,
          PreviousStock,
          NewStock,
          ReferenceId,
          Remarks,
          CreatedBy
        )
        VALUES
        (
          @PaperType,
          @TransactionType,
          @Quantity,
          @PreviousStock,
          @NewStock,
          @ReferenceId,
          @Remarks,
          @CreatedBy
        )
      `);

    // Commit only after all steps succeed
    await transaction.commit();

    return sendSuccess(
      res,
      "Paper purchase added, inventory updated, and transaction logged.",
      {
        ...purchase,
        PreviousStock: previousStock,
        NewStock: newStock,
      },
      201
    );
  } catch (error) {
    // Roll back inventory/purchase changes if anything fails
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error("Purchase rollback error:", rollbackError);
    }

    // Throw to global error middleware through asyncHandler
    throw error;
  }
});

// ============================================
// Exports
// ============================================

module.exports = {
  getPurchases,
  addPurchase,
};
