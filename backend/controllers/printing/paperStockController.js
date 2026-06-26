// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Paper Stock Controller
//
// Purpose:
// - Get current paper stock
// - Update A4/A3 paper stock
//
// Module:
// Printing Management
// ============================================

const { sql, poolPromise } = require("../../config/db");
const asyncHandler = require("../../utils/asyncHandler");
const {
  sendSuccess,
  sendError,
} = require("../../utils/apiResponse");

// ============================================
// GET PAPER STOCK
// Route: GET /api/paper-stock
// ============================================

const getPaperStock = asyncHandler(async (req, res) => {
  // Connect to SQL Server
  const pool = await poolPromise;

  // Load all paper inventory records
  const result = await pool.request().query(`
    SELECT
      InventoryId,
      PaperType,
      CurrentStock,
      LastUpdated
    FROM PaperInventory
    ORDER BY PaperType
  `);

  // Return standardized success response
  return sendSuccess(
    res,
    "Paper stock loaded successfully.",
    result.recordset
  );
});

// ============================================
// UPDATE PAPER STOCK
// Route: PUT /api/paper-stock
// ============================================

const updatePaperStock = asyncHandler(async (req, res) => {
  const { paperType, currentStock } = req.body;

  // Validate required fields
  if (!paperType || currentStock === undefined || currentStock === null) {
    return sendError(
      res,
      "Paper type and current stock are required.",
      400
    );
  }

  // Connect to SQL Server
  const pool = await poolPromise;

  // Update stock for selected paper type
  await pool
    .request()
    .input("PaperType", sql.VarChar, paperType)
    .input("CurrentStock", sql.Int, Number(currentStock))
    .query(`
      UPDATE PaperInventory
      SET
        CurrentStock = @CurrentStock,
        LastUpdated = GETDATE()
      WHERE PaperType = @PaperType
    `);

  // Return standardized success response
  return sendSuccess(
    res,
    "Paper stock updated successfully."
  );
});

// ============================================
// Exports
// ============================================

module.exports = {
  getPaperStock,
  updatePaperStock,
};