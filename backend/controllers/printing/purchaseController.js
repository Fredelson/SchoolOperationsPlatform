// ============================================
// ARAB UNITY SCHOOL
// Paper Purchase Controller
// Handles paper purchases, stock increase,
// and inventory transaction logging
// ============================================

const { sql, poolPromise } = require("../../config/db");

// ============================================
// GET /api/purchases
// Get all paper purchase records
// ============================================
const getPurchases = async (req, res) => {
  try {
    const pool = await poolPromise;

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

    return res.json(result.recordset);
  } catch (error) {
    console.error("Get purchases error:", error);

    return res.status(500).json({
      message: "Server error while fetching purchases",
    });
  }
};

// ============================================
// POST /api/purchases
// Add paper purchase, increase inventory,
// and log transaction as PURCHASE
// ============================================
const addPurchase = async (req, res) => {
  const { paperType, quantityBoxes, purchaseDate } = req.body;

  // ============================================
  // Basic validation
  // ============================================
  if (!paperType || !quantityBoxes || !purchaseDate) {
    return res.status(400).json({
      message: "Paper type, quantity boxes, and purchase date are required",
    });
  }

  if (!["A4", "A3"].includes(paperType)) {
    return res.status(400).json({
      message: "Paper type must be A4 or A3",
    });
  }

  if (Number(quantityBoxes) <= 0) {
    return res.status(400).json({
      message: "Quantity boxes must be greater than 0",
    });
  }

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // ============================================
    // Step 1: Get current stock before purchase
    // Used for PreviousStock in InventoryTransactions
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

      return res.status(404).json({
        message: `${paperType} inventory record not found.`,
      });
    }

    const inventory = inventoryResult.recordset[0];
    const previousStock = Number(inventory.CurrentStock || 0);

    // ============================================
    // Step 2: Insert purchase record
    // TotalBundles and TotalSheets are computed columns
    // from your SQL table:
    // TotalBundles = QuantityBoxes * 5
    // TotalSheets = QuantityBoxes * 5 * 500
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
    // Step 3: Add purchased sheets to PaperInventory
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
    // Step 4: Log inventory transaction as PURCHASE
    // This allows the Inventory Transaction Logs page
    // to show purchase/add-stock history
    // ============================================
    await new sql.Request(transaction)
      .input("paperType", sql.VarChar(10), paperType)
      .input("transactionType", sql.VarChar(50), "PURCHASE")
      .input("quantity", sql.Int, totalSheets)
      .input("previousStock", sql.Int, previousStock)
      .input("newStock", sql.Int, newStock)
      .input("referenceId", sql.Int, purchase.PurchaseId)
      .input(
        "remarks",
        sql.VarChar(255),
        `Purchased ${purchase.QuantityBoxes} boxes of ${paperType} = ${purchase.TotalBundles} bundles = ${purchase.TotalSheets} sheets`
      )
      .input("createdBy", sql.Int, req.user?.id || req.user?.UserId || 1)
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
          @paperType,
          @transactionType,
          @quantity,
          @previousStock,
          @newStock,
          @referenceId,
          @remarks,
          @createdBy
        )
      `);

    // ============================================
    // Step 5: Commit all changes
    // Purchase + Inventory update + Transaction log
    // ============================================
    await transaction.commit();

    return res.status(201).json({
      message: "Paper purchase added, inventory updated, and transaction logged.",
      purchase: {
        ...purchase,
        PreviousStock: previousStock,
        NewStock: newStock,
      },
    });
  } catch (error) {
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error("Purchase rollback error:", rollbackError);
    }

    console.error("Add purchase error:", error);

    return res.status(500).json({
      message: "Server error while adding purchase",
      error: error.message,
    });
  }
};

module.exports = {
  getPurchases,
  addPurchase,
};