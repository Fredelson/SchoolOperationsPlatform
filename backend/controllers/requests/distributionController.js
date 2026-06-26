// ============================================
// ARAB UNITY SCHOOL
// Paper Distribution Controller
// Handles paper bundle distribution
// Search user by Employee ID / Name
// Auto-fills Department and Issued To
// Deducts sheets from PaperInventory
// ============================================

const { sql, poolPromise } = require("../../config/db");

// ============================================
// GET /api/distributions/users/search?query=
// Search users by EmployeeId or FullName
// ============================================
const searchDistributionUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.json([]);
    }

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("Search", sql.VarChar, `%${query}%`)
      .query(`
        SELECT TOP 10
          u.UserId,
          u.FullName,
          u.EmployeeId,
          u.DepartmentId,
          d.DepartmentName,
          u.Role
        FROM Users u
        LEFT JOIN Departments d
          ON u.DepartmentId = d.DepartmentId
        WHERE
          u.IsActive = 1
          AND (
            u.EmployeeId LIKE @Search
            OR u.FullName LIKE @Search
          )
        ORDER BY u.FullName
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Search distribution users error:", error);

    res.status(500).json({
      message: "Server error while searching users",
    });
  }
};

// ============================================
// GET /api/distributions
// Get all paper distribution records
// ============================================
const getDistributions = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        pd.DistributionId,
        pd.PaperType,
        pd.BundlesIssued,
        pd.IssuedTo,
        pd.ReceivedByName,
        pd.RequestedByUserId,
        pd.DepartmentId,
        u.EmployeeId,
        u.FullName AS RequestedByFullName,
        d.DepartmentName,
        pd.IssuedDate,
        pd.CreatedAt,
        (pd.BundlesIssued * 500) AS TotalSheets
      FROM PaperDistributions pd
      LEFT JOIN Users u
        ON pd.RequestedByUserId = u.UserId
      LEFT JOIN Departments d
        ON pd.DepartmentId = d.DepartmentId
      ORDER BY pd.IssuedDate DESC, pd.DistributionId DESC
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Get distributions error:", error);

    res.status(500).json({
      message: "Server error while fetching distributions",
    });
  }
};

// ============================================
// POST /api/distributions
// Add distribution and deduct inventory
// ============================================
const addDistribution = async (req, res) => {
  const {
    paperType,
    bundlesIssued,
    issuedTo,
    receivedByName,
    requestedByUserId,
    departmentId,
    issuedDate,
  } = req.body;

  // ============================================
  // Basic validation
  // ============================================
  if (!paperType || !bundlesIssued || !issuedTo || !issuedDate) {
    return res.status(400).json({
      message:
        "Paper type, bundles issued, department, and issued date are required",
    });
  }

  if (!["A4", "A3"].includes(paperType)) {
    return res.status(400).json({
      message: "Paper type must be A4 or A3",
    });
  }

  if (Number(bundlesIssued) <= 0) {
    return res.status(400).json({
      message: "Bundles issued must be greater than 0",
    });
  }

  // 1 bundle = 500 sheets
  const totalSheets = Number(bundlesIssued) * 500;

  const transaction = new sql.Transaction(await poolPromise);

  try {
    await transaction.begin();

    // ============================================
    // Step 1: Check inventory stock
    // ============================================
    const stockResult = await new sql.Request(transaction)
      .input("PaperType", sql.VarChar(10), paperType)
      .query(`
        SELECT
          InventoryId,
          CurrentStock
        FROM PaperInventory
        WHERE PaperType = @PaperType
      `);

    if (stockResult.recordset.length === 0) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Paper type not found in inventory",
      });
    }

    const inventoryItem = stockResult.recordset[0];
    const inventoryId = inventoryItem.InventoryId;
    const currentStock = Number(inventoryItem.CurrentStock || 0);

    if (currentStock < totalSheets) {
      await transaction.rollback();

      return res.status(400).json({
        message: "Not enough stock available",
        currentStock,
        requiredSheets: totalSheets,
      });
    }

    // ============================================
    // Step 2: Insert distribution record
    // issuedTo = Department Name
    // receivedByName = Person issued to
    // requestedByUserId = Selected user UserId
    // departmentId = Selected user's DepartmentId
    // ============================================
    const insertResult = await new sql.Request(transaction)
      .input("PaperType", sql.VarChar(10), paperType)
      .input("BundlesIssued", sql.Int, Number(bundlesIssued))
      .input("IssuedTo", sql.VarChar(100), issuedTo)
      .input(
        "ReceivedByName",
        sql.VarChar(100),
        receivedByName || null
      )
      .input(
        "RequestedByUserId",
        sql.Int,
        requestedByUserId || null
      )
      .input(
        "DepartmentId",
        sql.Int,
        departmentId || null
      )
      .input("IssuedDate", sql.Date, issuedDate)
      .query(`
        INSERT INTO PaperDistributions (
          PaperType,
          BundlesIssued,
          IssuedTo,
          ReceivedByName,
          RequestedByUserId,
          DepartmentId,
          IssuedDate
        )
        OUTPUT
          INSERTED.DistributionId,
          INSERTED.PaperType,
          INSERTED.BundlesIssued,
          INSERTED.IssuedTo,
          INSERTED.ReceivedByName,
          INSERTED.RequestedByUserId,
          INSERTED.DepartmentId,
          INSERTED.IssuedDate,
          INSERTED.CreatedAt
        VALUES (
          @PaperType,
          @BundlesIssued,
          @IssuedTo,
          @ReceivedByName,
          @RequestedByUserId,
          @DepartmentId,
          @IssuedDate
        )
      `);

    const distribution = insertResult.recordset[0];

    // ============================================
    // Step 3: Deduct inventory
    // ============================================
    await new sql.Request(transaction)
      .input("PaperType", sql.VarChar(10), paperType)
      .input("TotalSheets", sql.Int, totalSheets)
      .query(`
        UPDATE PaperInventory
        SET
          CurrentStock = CurrentStock - @TotalSheets,
          LastUpdated = GETDATE()
        WHERE PaperType = @PaperType
      `);

      // ============================================
    // Step 4: Log inventory transaction
    // This records paper distribution in InventoryTransactions
    // ============================================
    const previousStock = currentStock;
    const newStock = currentStock - totalSheets;

    await new sql.Request(transaction)
      .input("paperType", sql.VarChar(10), paperType)
      .input("transactionType", sql.VarChar(50), "DISTRIBUTION")
      .input("quantity", sql.Int, totalSheets)
      .input("previousStock", sql.Int, previousStock)
      .input("newStock", sql.Int, newStock)
      .input("referenceId", sql.Int, distribution.DistributionId)
      .input(
        "remarks",
        sql.VarChar(255),
        `Distributed ${totalSheets} sheets of ${paperType} to ${issuedTo}${
          receivedByName ? ` - Received by ${receivedByName}` : ""
        }`
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

    await transaction.commit();

    res.status(201).json({
      message: "Paper distribution added and stock deducted successfully",
      distribution: {
        ...distribution,
        TotalSheets: totalSheets,
      },
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Add distribution error:", error);

    res.status(500).json({
      message: "Server error while adding distribution",
    });
  }
};

module.exports = {
  searchDistributionUsers,
  getDistributions,
  addDistribution,
};