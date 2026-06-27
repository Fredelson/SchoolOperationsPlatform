// ============================================
// ARAB UNITY SCHOOL
// Audit Logger Utility
// Reusable function for recording system actions
// ============================================

const sql = require("mssql");
const { poolPromise } = require("../../config/db");

// ============================================
// Create Audit Log
// ============================================

const createAuditLog = async ({
  userId = null,
  action,
  moduleKey = null,
  recordId = null,
  oldValue = null,
  newValue = null,
  ipAddress = null,
}) => {
  try {
    const pool = await poolPromise;

    await pool
      .request()
      .input("UserId", sql.Int, userId)
      .input("Action", sql.NVarChar(150), action)
      .input("ModuleKey", sql.NVarChar(100), moduleKey)
      .input("RecordId", sql.NVarChar(100), recordId)
      .input("OldValue", sql.NVarChar(sql.MAX), oldValue)
      .input("NewValue", sql.NVarChar(sql.MAX), newValue)
      .input("IPAddress", sql.NVarChar(50), ipAddress)
      .query(`
        INSERT INTO AuditLogs
        (
          UserId,
          Action,
          ModuleKey,
          RecordId,
          OldValue,
          NewValue,
          IPAddress
        )
        VALUES
        (
          @UserId,
          @Action,
          @ModuleKey,
          @RecordId,
          @OldValue,
          @NewValue,
          @IPAddress
        );
      `);
  } catch (error) {
    console.error("Create audit log error:", error);
  }
};

module.exports = {
  createAuditLog,
};