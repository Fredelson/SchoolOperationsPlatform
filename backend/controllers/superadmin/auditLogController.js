// ============================================
// ARAB UNITY SCHOOL
// Super Admin - Audit Log Controller
// View system audit history
// ============================================

const sql = require("mssql");
const { poolPromise } = require("../../config/db");

// GET /api/superadmin/audit-logs
const getAuditLogs = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT TOP 200
        a.AuditId,
        a.UserId,
        u.FullName,
        u.EmployeeId,
        a.Action,
        a.ModuleKey,
        a.RecordId,
        a.OldValue,
        a.NewValue,
        a.IPAddress,
        a.CreatedAt
      FROM AuditLogs a
      LEFT JOIN Users u
        ON u.UserId = a.UserId
      ORDER BY a.CreatedAt DESC;
    `);

    return res.status(200).json({
      auditLogs: result.recordset,
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    return res.status(500).json({
      message: "Failed to load audit logs.",
    });
  }
};

module.exports = {
  getAuditLogs,
};
