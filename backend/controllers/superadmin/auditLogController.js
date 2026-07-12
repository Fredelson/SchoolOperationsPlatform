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

    const role=String(req.user?.roleKey||req.user?.role||"").replace(/[\s_-]/g,"").toLowerCase();
    const limit=Math.min(Math.max(Number(req.query.limit)||50,1),200);
    const result = await pool.request().input("Limit",sql.Int,limit).input("UserId",sql.Int,req.user?.id||req.user?.UserId).input("IsSuper",sql.Bit,role==="superadmin").query(`
      SELECT TOP (@Limit)
        a.AuditLogId,
        a.UserId,
        u.FullName,
        u.EmployeeId,
        a.ActionType,
        a.EntityType,
        a.EntityId,
        a.Description,
        a.OldValue,
        a.NewValue,
        a.IpAddress,
        a.CreatedAt
      FROM dbo.AuditLogs a
      LEFT JOIN dbo.Users u
        ON u.UserId = a.UserId
      WHERE @IsSuper=1 OR a.UserId=@UserId
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
