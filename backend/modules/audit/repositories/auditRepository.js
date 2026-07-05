/* =========================================================
   Enterprise Audit Repository
   Repository → Service → Controller → Routes

   Purpose:
   Handles all SQL writes for:
   - AuditLogs
   - ActivityTimeline

   This repository is reusable across the whole AUS Operations Platform.
========================================================= */

const { poolPromise, sql } = require("../../../config/db");

/**
 * Insert a technical audit log.
 * Used for compliance, old/new value tracking, and security review.
 */
const createAuditLog = async ({
  userId = null,
  actionType,
  entityType = null,
  entityId = null,
  description,
  oldValue = null,
  newValue = null,
  ipAddress = null,
}) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("UserId", sql.Int, userId)
    .input("ActionType", sql.NVarChar(200), actionType)
    .input("EntityType", sql.NVarChar(200), entityType)
    .input("EntityId", sql.NVarChar(200), entityId ? String(entityId) : null)
    .input("Description", sql.NVarChar(sql.MAX), description)
    .input("OldValue", sql.NVarChar(sql.MAX), oldValue ? JSON.stringify(oldValue) : null)
    .input("NewValue", sql.NVarChar(sql.MAX), newValue ? JSON.stringify(newValue) : null)
    .input("IpAddress", sql.NVarChar(100), ipAddress)
    .query(`
      INSERT INTO dbo.AuditLogs
      (
        UserId,
        ActionType,
        EntityType,
        EntityId,
        Description,
        OldValue,
        NewValue,
        IpAddress,
        CreatedAt
      )
      OUTPUT INSERTED.*
      VALUES
      (
        @UserId,
        @ActionType,
        @EntityType,
        @EntityId,
        @Description,
        @OldValue,
        @NewValue,
        @IpAddress,
        GETDATE()
      );
    `);

  return result.recordset[0];
};

/**
 * Insert a user-friendly timeline activity.
 * Used for history panels, recent activity cards, and entity timeline views.
 */
const createActivityTimeline = async ({
  userId = null,
  moduleKey = null,
  entityType,
  entityId = null,
  activityType,
  activityTitle,
  activityDescription = null,
}) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("UserId", sql.Int, userId)
    .input("ModuleKey", sql.NVarChar(200), moduleKey)
    .input("EntityType", sql.NVarChar(200), entityType)
    .input("EntityId", sql.NVarChar(200), entityId ? String(entityId) : null)
    .input("ActivityType", sql.NVarChar(200), activityType)
    .input("ActivityTitle", sql.NVarChar(510), activityTitle)
    .input("ActivityDescription", sql.NVarChar(sql.MAX), activityDescription)
    .query(`
      INSERT INTO dbo.ActivityTimeline
      (
        UserId,
        ModuleKey,
        EntityType,
        EntityId,
        ActivityType,
        ActivityTitle,
        ActivityDescription,
        CreatedAt
      )
      OUTPUT INSERTED.*
      VALUES
      (
        @UserId,
        @ModuleKey,
        @EntityType,
        @EntityId,
        @ActivityType,
        @ActivityTitle,
        @ActivityDescription,
        GETDATE()
      );
    `);

  return result.recordset[0];
};

module.exports = {
  createAuditLog,
  createActivityTimeline,
};