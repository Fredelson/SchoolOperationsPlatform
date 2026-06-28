// ============================================================
// Arab Unity School Operations Platform
// Audit Helper
// ============================================================

const { sql, executeQuery } = require("../database");

function toJson(value) {
  if (value === undefined || value === null) return null;
  return JSON.stringify(value);
}

async function writeAuditLog({
  userId = null,
  actionType,
  entityType = null,
  entityId = null,
  description,
  oldValue = null,
  newValue = null,
  ipAddress = null,
}) {
  await executeQuery(
    `
      INSERT INTO dbo.AuditLogs (
        UserId,
        ActionType,
        EntityType,
        EntityId,
        Description,
        OldValue,
        NewValue,
        IpAddress
      )
      VALUES (
        @UserId,
        @ActionType,
        @EntityType,
        @EntityId,
        @Description,
        @OldValue,
        @NewValue,
        @IpAddress
      );
    `,
    [
      { name: "UserId", type: sql.Int, value: userId },
      { name: "ActionType", type: sql.NVarChar(100), value: actionType },
      { name: "EntityType", type: sql.NVarChar(100), value: entityType },
      { name: "EntityId", type: sql.NVarChar(100), value: entityId ? String(entityId) : null },
      { name: "Description", type: sql.NVarChar(sql.MAX), value: description },
      { name: "OldValue", type: sql.NVarChar(sql.MAX), value: toJson(oldValue) },
      { name: "NewValue", type: sql.NVarChar(sql.MAX), value: toJson(newValue) },
      { name: "IpAddress", type: sql.NVarChar(50), value: ipAddress },
    ]
  );
}

module.exports = {
  writeAuditLog,
};