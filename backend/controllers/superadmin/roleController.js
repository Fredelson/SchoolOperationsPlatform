// ============================================
// ARAB UNITY SCHOOL
// Super Admin - Role Controller
// ============================================

const sql = require("mssql");
const { poolPromise } = require("../../config/db");

// ============================================
// @desc    Get all roles
// @route   GET /api/superadmin/roles
// @access  SuperAdmin / Role.View
// ============================================================

const getRoles = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        RoleId,
        RoleKey,
        RoleName,
        Description,
        IsSystemRole,
        IsActive,
        CreatedAt
      FROM Roles
      ORDER BY RoleName;
    `);

    return res.status(200).json({
      roles: result.recordset,
    });
  } catch (error) {
    console.error("Get roles error:", error);
    return res.status(500).json({
      message: "Failed to load roles.",
    });
  }
};

module.exports = {
  getRoles,
};
