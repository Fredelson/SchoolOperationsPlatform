// ============================================
// ARAB UNITY SCHOOL
// Paper Inventory Controller
// Simple A4 / A3 stock only
// ============================================

const { sql, poolPromise } = require("../../config/db");

// ============================================
// GET PAPER STOCK
// ============================================
const getPaperStock = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        InventoryId,
        PaperType,
        CurrentStock,
        LastUpdated
      FROM dbo.PaperInventory
      WHERE PaperType IN ('A4', 'A3')
      ORDER BY PaperType
    `);

    res.status(200).json({
      success: true,
      stock: result.recordset,
    });
  } catch (error) {
    console.error("Get Paper Stock Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// UPDATE PAPER STOCK
// Body: { a4Stock: 100, a3Stock: 20 }
// ============================================
const updatePaperStock = async (req, res) => {
  try {
    const { a4Stock, a3Stock } = req.body;

    const pool = await poolPromise;

    await pool
      .request()
      .input("a4Stock", sql.Int, Number(a4Stock))
      .input("a3Stock", sql.Int, Number(a3Stock))
      .query(`
        UPDATE dbo.PaperInventory
        SET
          CurrentStock = CASE
            WHEN PaperType = 'A4' THEN @a4Stock
            WHEN PaperType = 'A3' THEN @a3Stock
            ELSE CurrentStock
          END,
          LastUpdated = GETDATE()
        WHERE PaperType IN ('A4', 'A3')
      `);

    res.status(200).json({
      success: true,
      message: "Paper stock updated successfully",
    });
  } catch (error) {
    console.error("Update Paper Stock Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getPaperStock,
  updatePaperStock,
};