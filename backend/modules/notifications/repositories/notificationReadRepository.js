/* =========================================================
   Notification Read State Repository
   ========================================================= */

const sql = require("mssql");
const { poolPromise } = require("../../../config/db");
const { executeQuery } = require("../../../shared/database/executeQuery");

const getUserReadAt = async (userId) => {
  if (!userId) return null;
  try {
    const result = await executeQuery(
      `SELECT ReadAt FROM dbo.UserNotificationReads WHERE UserId = @UserId;`,
      [{ name: "UserId", type: sql.Int, value: Number(userId) }]
    );
    return result.recordset[0]?.ReadAt || null;
  } catch (error) {
    return null;
  }
};

const upsertUserReadAt = async (userId) => {
  if (!userId) return;
  try {
    await executeQuery(
      `
        MERGE dbo.UserNotificationReads AS target
        USING (SELECT @UserId AS UserId) AS source
        ON target.UserId = source.UserId
        WHEN MATCHED THEN
          UPDATE SET ReadAt = GETDATE()
        WHEN NOT MATCHED THEN
          INSERT (UserId, ReadAt) VALUES (@UserId, GETDATE());
      `,
      [{ name: "UserId", type: sql.Int, value: Number(userId) }]
    );
  } catch (error) {
    // Table may not exist yet; mark-as-read is best-effort.
  }
};

module.exports = {
  getUserReadAt,
  upsertUserReadAt,
};
