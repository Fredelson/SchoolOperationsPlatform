/* =========================================================
   ARAB UNITY SCHOOL OPERATIONS PLATFORM
   IT Asset Assignment Repository

   Atomic Assignment / Return with:
   - ITAssets update
   - ITAssetAssignments insert/update
   - ITAssetStatusHistory insert
   - ActivityTimeline insert
   - AuditLogs insert
========================================================= */

const sql = require("mssql");
const { poolPromise } = require("../../../../config/db");
const {
  insertPartRequirements,
} = require("../../shared/repositories/assetPartRequirementRepository");

/* =========================================================
   Lookup Helpers
========================================================= */

const getStatusByKey = async (statusKey) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("StatusKey", sql.NVarChar(200), statusKey)
    .query(`
      SELECT TOP 1
        ITAssetStatusId,
        StatusKey,
        StatusName
      FROM dbo.ITAssetStatuses
      WHERE StatusKey = @StatusKey;
    `);

  return result.recordset[0];
};

const getConditionById = async (conditionId) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("ConditionId", sql.Int, Number(conditionId))
    .query(`
      SELECT TOP 1
        ITAssetConditionId,
        ConditionKey,
        ConditionName
      FROM dbo.ITAssetConditions
      WHERE ITAssetConditionId = @ConditionId;
    `);

  return result.recordset[0];
};

const getUserById = async (userId) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("UserId", sql.Int, userId)
    .query(`
      SELECT TOP 1
        UserId,
        FullName,
        EmployeeId,
        SchoolEmail
      FROM dbo.Users
      WHERE UserId = @UserId
        AND IsActive = 1
        AND IsDeleted = 0;
    `);

  return result.recordset[0];
};

const getAssetById = async (assetId) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("AssetId", sql.Int, assetId)
    .query(`
      SELECT TOP 1
        a.*,
        c.CategoryKey,
        c.CategoryName,
        s.StatusKey,
        s.StatusName
      FROM dbo.ITAssets a
      LEFT JOIN dbo.ITAssetCategories c
        ON a.ITAssetCategoryId = c.ITAssetCategoryId
      LEFT JOIN dbo.ITAssetStatuses s ON a.ITAssetStatusId = s.ITAssetStatusId
      WHERE a.AssetId = @AssetId
        AND a.IsDeleted = 0;
    `);

  return result.recordset[0];
};

const getActiveAssignment = async (assetId) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("AssetId", sql.Int, assetId)
    .query(`
      SELECT TOP 1 *
      FROM dbo.ITAssetAssignments
      WHERE AssetId = @AssetId
        AND ReturnedAt IS NULL
      ORDER BY AssignedAt DESC;
    `);

  return result.recordset[0];
};

const getAssignmentHistory = async (assetId) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("AssetId", sql.Int, assetId)
    .query(`
      SELECT
        aa.*,
        u.FullName AS AssignedToUserName,
        byUser.FullName AS AssignedByUserName,
        d.DepartmentName,
        l.LocationName,
        r.RoomName
      FROM dbo.ITAssetAssignments aa
      LEFT JOIN dbo.Users u
        ON aa.AssignedToUserId = u.UserId
      LEFT JOIN dbo.Users byUser
        ON aa.AssignedByUserId = byUser.UserId
      LEFT JOIN dbo.Departments d
        ON aa.DepartmentId = d.DepartmentId
      LEFT JOIN dbo.Locations l
        ON aa.LocationId = l.LocationId
      LEFT JOIN dbo.Rooms r
        ON aa.RoomId = r.RoomId
      WHERE aa.AssetId = @AssetId
      ORDER BY aa.AssignedAt DESC;
    `);

  return result.recordset;
};

/* =========================================================
   Internal Transaction Audit Helper
========================================================= */

const insertAuditLog = async ({
  transaction,
  userId,
  actionType,
  entityType,
  entityId,
  description,
  oldValue = null,
  newValue = null,
  ipAddress = null,
}) => {
  return new sql.Request(transaction)
    .input("UserId", sql.Int, userId || null)
    .input("ActionType", sql.NVarChar(200), actionType)
    .input("EntityType", sql.NVarChar(200), entityType)
    .input("EntityId", sql.NVarChar(200), String(entityId))
    .input("Description", sql.NVarChar(sql.MAX), description)
    .input("OldValue", sql.NVarChar(sql.MAX), oldValue ? JSON.stringify(oldValue) : null)
    .input("NewValue", sql.NVarChar(sql.MAX), newValue ? JSON.stringify(newValue) : null)
    .input("IpAddress", sql.NVarChar(100), ipAddress || null)
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
};

/* =========================================================
   Internal Transaction Activity Timeline Helper
========================================================= */

const insertActivityTimeline = async ({
  transaction,
  userId,
  moduleKey,
  entityType,
  entityId,
  activityType,
  activityTitle,
  activityDescription,
}) => {
  return new sql.Request(transaction)
    .input("UserId", sql.Int, userId || null)
    .input("ModuleKey", sql.NVarChar(200), moduleKey)
    .input("EntityType", sql.NVarChar(200), entityType)
    .input("EntityId", sql.NVarChar(200), String(entityId))
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
};

/* =========================================================
   Assign Asset
========================================================= */

const assignAsset = async ({
  asset,
  assignedToUser,
  payload,
  assignedByUserId,
  assignedStatusId,
  ipAddress = null,
}) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const assignmentResult = await new sql.Request(transaction)
      .input("AssetId", sql.Int, asset.AssetId)
      .input(
        "AssignmentTargetType",
        sql.NVarChar(100),
        payload.assignmentTargetType ||
          (payload.assignedToUserId || payload.assignedToName
            ? "USER"
            : payload.roomId
            ? "ROOM"
            : payload.departmentId
            ? "DEPARTMENT"
            : "LOCATION")
      )
      .input("AssignedToUserId", sql.Int, assignedToUser?.UserId || null)
      .input("AssignedToName", sql.NVarChar(510), payload.assignedToName || assignedToUser?.FullName || null)
      .input("AssignedToEmail", sql.NVarChar(510), payload.assignedToEmail || assignedToUser?.SchoolEmail || null)
      .input("AssignedToEmployeeCode", sql.NVarChar(100), payload.assignedToEmployeeCode || assignedToUser?.EmployeeId || null)
      .input("RoomId", sql.Int, payload.roomId || null)
      .input("DepartmentId", sql.Int, payload.departmentId || null)
      .input("LocationId", sql.Int, payload.locationId || null)
      .input("AssignedByUserId", sql.Int, assignedByUserId || null)
      .input("Notes", sql.NVarChar(sql.MAX), payload.notes || null)
      .query(`
        INSERT INTO dbo.ITAssetAssignments
        (
          AssetId,
          AssignmentTargetType,
          AssignedToUserId,
          AssignedToName,
          AssignedToEmail,
          AssignedToEmployeeCode,
          RoomId,
          DepartmentId,
          LocationId,
          AssignedByUserId,
          AssignedAt,
          ReturnedAt,
          Notes
        )
        OUTPUT INSERTED.*
        VALUES
        (
          @AssetId,
          @AssignmentTargetType,
          @AssignedToUserId,
          @AssignedToName,
          @AssignedToEmail,
          @AssignedToEmployeeCode,
          @RoomId,
          @DepartmentId,
          @LocationId,
          @AssignedByUserId,
          GETDATE(),
          NULL,
          @Notes
        );
      `);

    const assetResult = await new sql.Request(transaction)
      .input("AssetId", sql.Int, asset.AssetId)
      .input("AssignedStatusId", sql.Int, assignedStatusId)
      .input("CurrentAssignedUserId", sql.Int, assignedToUser?.UserId || null)
      .input("CurrentAssignedName", sql.NVarChar(510), payload.assignedToName || assignedToUser?.FullName || null)
      .input("CurrentAssignedEmployeeCode", sql.NVarChar(100), payload.assignedToEmployeeCode || assignedToUser?.EmployeeId || null)
      .input("CurrentAssignedEmail", sql.NVarChar(510), payload.assignedToEmail || assignedToUser?.SchoolEmail || null)
      .input("CurrentRoomId", sql.Int, payload.roomId || null)
      .input("CurrentDepartmentId", sql.Int, payload.departmentId || null)
      .input("CurrentLocationId", sql.Int, payload.locationId || null)
      .query(`
        UPDATE dbo.ITAssets
        SET
          ITAssetStatusId = @AssignedStatusId,
          CurrentAssignedUserId = @CurrentAssignedUserId,
          CurrentAssignedName = @CurrentAssignedName,
          CurrentAssignedEmployeeCode = @CurrentAssignedEmployeeCode,
          CurrentAssignedEmail = @CurrentAssignedEmail,
          CurrentRoomId = @CurrentRoomId,
          CurrentDepartmentId = @CurrentDepartmentId,
          CurrentLocationId = @CurrentLocationId,
          UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE AssetId = @AssetId
          AND IsDeleted = 0;
      `);

    await new sql.Request(transaction)
      .input("AssetId", sql.Int, asset.AssetId)
      .input("OldStatusId", sql.Int, asset.ITAssetStatusId)
      .input("NewStatusId", sql.Int, assignedStatusId)
      .input("ChangedBy", sql.Int, assignedByUserId || null)
      .input("Notes", sql.NVarChar(sql.MAX), payload.notes || "Asset assigned.")
      .query(`
        INSERT INTO dbo.ITAssetStatusHistory
        (
          AssetId,
          OldStatusId,
          NewStatusId,
          ChangedBy,
          ChangedAt,
          Notes
        )
        VALUES
        (
          @AssetId,
          @OldStatusId,
          @NewStatusId,
          @ChangedBy,
          GETDATE(),
          @Notes
        );
      `);

    const assignment = assignmentResult.recordset[0];
    const updatedAsset = assetResult.recordset[0];
    const labelResult = await new sql.Request(transaction)
      .input("AssignedToName", sql.NVarChar(510), assignment.AssignedToName || null)
      .input("AssignedToUserId", sql.Int, assignment.AssignedToUserId || null)
      .input("RoomId", sql.Int, assignment.RoomId || null)
      .input("DepartmentId", sql.Int, assignment.DepartmentId || null)
      .input("LocationId", sql.Int, assignment.LocationId || null)
      .query(`
        SELECT COALESCE(
          NULLIF(LTRIM(RTRIM(@AssignedToName)), ''),
          assignedUser.FullName,
          room.RoomName,
          department.DepartmentName,
          location.LocationName,
          'Unspecified assignment'
        ) AS AssignmentLabel
        FROM (SELECT 1 AS AnchorRow) anchorRow
        LEFT JOIN dbo.Users assignedUser
          ON assignedUser.UserId = @AssignedToUserId
        LEFT JOIN dbo.Rooms room
          ON room.RoomId = @RoomId
        LEFT JOIN dbo.Departments department
          ON department.DepartmentId = @DepartmentId
        LEFT JOIN dbo.Locations location
          ON location.LocationId = @LocationId;
      `);
    const assignmentLabel =
      labelResult.recordset[0]?.AssignmentLabel || "Unspecified assignment";

    await insertAuditLog({
      transaction,
      userId: assignedByUserId,
      actionType: "ASSET_ASSIGNED",
      entityType: "ITAsset",
      entityId: asset.AssetId,
      description: `Asset ${asset.AssetTag} was assigned to ${assignmentLabel}.`,
      oldValue: asset,
      newValue: {
        asset: updatedAsset,
        assignment,
      },
      ipAddress,
    });

    await insertActivityTimeline({
      transaction,
      userId: assignedByUserId,
      moduleKey: "IT_ASSETS",
      entityType: "ITAsset",
      entityId: asset.AssetId,
      activityType: "ASSET_ASSIGNED",
      activityTitle: "Asset Assigned",
      activityDescription: `Asset ${asset.AssetTag} was assigned to ${assignmentLabel}.`,
    });

    await transaction.commit();

    return {
      assignment,
      asset: updatedAsset,
    };
  } catch (error) {
    if (transaction._aborted !== true) {
      await transaction.rollback();
    }

    throw error;
  }
};

/* =========================================================
   Return Asset
========================================================= */

const returnAsset = async ({
  asset,
  activeAssignment,
  returnedStatusId,
  changedByUserId,
  notes = null,
  returnCondition,
  returnConditionId = null,
  requiredParts = [],
  ipAddress = null,
}) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  const conditionName = String(returnCondition?.ConditionName || "");

  try {
    await transaction.begin();

    const assignmentResult = await new sql.Request(transaction)
      .input("AssetAssignmentId", sql.Int, activeAssignment.AssetAssignmentId)
      .input("ReturnNotes", sql.NVarChar(sql.MAX), notes || null)
      .input("ReturnConditionId", sql.Int, returnConditionId || null)
      .input(
        "ReturnIssueTypeIdsJson",
        sql.NVarChar(sql.MAX),
        null
      )
      .query(`
        UPDATE dbo.ITAssetAssignments
        SET
          ReturnedAt = GETDATE(),
          ReturnNotes = @ReturnNotes,
          ReturnConditionId = @ReturnConditionId,
          ReturnIssueTypeIdsJson = @ReturnIssueTypeIdsJson
        OUTPUT INSERTED.*
        WHERE AssetAssignmentId = @AssetAssignmentId;
      `);

    const assetResult = await new sql.Request(transaction)
      .input("AssetId", sql.Int, asset.AssetId)
      .input("ReturnedStatusId", sql.Int, returnedStatusId)
      .input("ReturnConditionId", sql.Int, returnConditionId || null)
      .input(
        "PreviousOwner",
        sql.NVarChar(510),
        activeAssignment.AssignedToName ||
          activeAssignment.AssignedToUserName ||
          asset.CurrentAssignedName ||
          asset.CurrentAssignedUserName ||
          null
      )
      .query(`
        UPDATE dbo.ITAssets
        SET
          ITAssetStatusId = @ReturnedStatusId,
          ITAssetConditionId = @ReturnConditionId,
          PreviousOwner = COALESCE(@PreviousOwner, PreviousOwner),
          CurrentAssignedUserId = NULL,
          CurrentAssignedName = NULL,
          CurrentAssignedEmployeeCode = NULL,
          CurrentAssignedEmail = NULL,
          CurrentRoomId = NULL,
          CurrentDepartmentId = NULL,
          CurrentLocationId = NULL,
          UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE AssetId = @AssetId
          AND IsDeleted = 0;
      `);

    await new sql.Request(transaction)
      .input("AssetId", sql.Int, asset.AssetId)
      .input("OldStatusId", sql.Int, asset.ITAssetStatusId)
      .input("NewStatusId", sql.Int, returnedStatusId)
      .input("ChangedBy", sql.Int, changedByUserId || null)
      .input(
        "Notes",
        sql.NVarChar(sql.MAX),
        notes || `Asset returned with condition: ${conditionName}.`
      )
      .query(`
        INSERT INTO dbo.ITAssetStatusHistory
        (
          AssetId,
          OldStatusId,
          NewStatusId,
          ChangedBy,
          ChangedAt,
          Notes
        )
        VALUES
        (
          @AssetId,
          @OldStatusId,
          @NewStatusId,
          @ChangedBy,
          GETDATE(),
          @Notes
        );
      `);

    const assignment = assignmentResult.recordset[0];
    const updatedAsset = assetResult.recordset[0];
    const partRequirements = await insertPartRequirements({
      transaction,
      assetId: asset.AssetId,
      assetAssignmentId: assignment.AssetAssignmentId,
      parts: requiredParts,
      requestedByUserId: changedByUserId,
      notes,
    });

    await insertAuditLog({
      transaction,
      userId: changedByUserId,
      actionType: "ASSET_RETURNED",
      entityType: "ITAsset",
      entityId: asset.AssetId,
      description: `Asset ${asset.AssetTag} was returned with condition ${conditionName}.`,
      oldValue: {
        asset,
        assignment: activeAssignment,
      },
      newValue: {
        asset: updatedAsset,
        assignment,
        partRequirements,
      },
      ipAddress,
    });

    await insertActivityTimeline({
      transaction,
      userId: changedByUserId,
      moduleKey: "IT_ASSETS",
      entityType: "ITAsset",
      entityId: asset.AssetId,
      activityType: "ASSET_RETURNED",
      activityTitle: "Asset Returned",
      activityDescription: `Asset ${asset.AssetTag} was returned with condition ${conditionName}.`,
    });

    await transaction.commit();

    return {
      assignment,
      asset: updatedAsset,
      partRequirements,
    };
  } catch (error) {
    if (transaction._aborted !== true) {
      await transaction.rollback();
    }

    throw error;
  }
};

/* =========================================================
   Exports
========================================================= */

module.exports = {
  getStatusByKey,
  getConditionById,
  getUserById,
  getAssetById,
  getActiveAssignment,
  getAssignmentHistory,
  assignAsset,
  returnAsset,
};
