/* =========================================================
   Notification Read State Repository
   ========================================================= */

const sql = require("mssql");
const { executeQuery } = require("../../../shared/database/executeQuery");

const getUserReadAt = async (userId) => {
  if (!userId) return null;
  const result = await executeQuery(
    `SELECT ReadAt FROM dbo.UserNotificationReads WHERE UserId = @UserId;`,
    [{ name: "UserId", type: sql.Int, value: Number(userId) }]
  );
  return result.recordset[0]?.ReadAt || null;
};

const upsertUserReadAt = async (userId) => {
  if (!userId) return null;
  const result = await executeQuery(
    `
      DECLARE @ReadAt datetime = GETDATE();

      MERGE dbo.UserNotificationReads WITH (HOLDLOCK) AS target
      USING (SELECT @UserId AS UserId) AS source
      ON target.UserId = source.UserId
      WHEN MATCHED THEN
        UPDATE SET ReadAt = @ReadAt
      WHEN NOT MATCHED THEN
        INSERT (UserId, ReadAt) VALUES (@UserId, @ReadAt)
      OUTPUT INSERTED.ReadAt;
    `,
    [{ name: "UserId", type: sql.Int, value: Number(userId) }]
  );
  return result.recordset[0]?.ReadAt || null;
};

module.exports = {
  getUserReadAt,
  upsertUserReadAt,
};
