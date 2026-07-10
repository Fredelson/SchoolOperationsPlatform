/* =========================================================
   IT Asset Audit Repository
========================================================= */

const sql = require("mssql");
const { executeQuery } = require("../../../../shared/database/executeQuery");
const { rows } = require("../../../../shared/database/repositoryBase");

const getAuditByAssetId = async (assetId) => {
  const result = await executeQuery(
    `
      SELECT
        al.AuditLogId,
        al.UserId,
        u.FullName AS PerformedByName,
        u.EmployeeId AS PerformedByEmployeeCode,
        u.SchoolEmail AS PerformedByEmail,
        r.RoleName,
        r.DisplayName AS RoleDisplayName,
        al.ActionType,
        al.EntityType,
        al.EntityId,
        al.Description,
        al.OldValue,
        al.NewValue,
        al.IpAddress,
        al.CreatedAt
      FROM dbo.AuditLogs al
      LEFT JOIN dbo.Users u
        ON al.UserId = u.UserId
      LEFT JOIN dbo.Roles r
        ON u.RoleId = r.RoleId
      WHERE
        al.EntityType = 'ITAsset'
        AND al.EntityId = CONVERT(NVARCHAR(200), @AssetId)
      ORDER BY al.CreatedAt DESC;
    `,
    [{ name: "AssetId", type: sql.Int, value: Number(assetId) }]
  );

  return rows(result);
};

module.exports = {
  getAuditByAssetId,
};