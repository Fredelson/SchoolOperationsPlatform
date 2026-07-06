/* =========================================================
   ARAB UNITY SCHOOL OPERATIONS PLATFORM
   IT Asset Issues Repository
========================================================= */

const sql = require("mssql");
const { poolPromise } = require("../../../../config/db");
const { executeQuery } = require("../../../../shared/database/executeQuery");
const { firstOrNull, rows } = require("../../../../shared/database/repositoryBase");

const getAssetById = async (assetId) => {
  const result = await executeQuery(
    `
      SELECT TOP 1 *
      FROM dbo.ITAssets
      WHERE AssetId = @AssetId
        AND IsDeleted = 0;
    `,
    [{ name: "AssetId", type: sql.Int, value: Number(assetId) }]
  );

  return firstOrNull(result);
};

const getIssueById = async (issueLogId) => {
  const result = await executeQuery(
    `
      SELECT TOP 1 *
      FROM dbo.ITAssetIssueLogs
      WHERE IssueLogId = @IssueLogId;
    `,
    [{ name: "IssueLogId", type: sql.Int, value: Number(issueLogId) }]
  );

  return firstOrNull(result);
};

const getStatusByKey = async (statusKey) => {
  const result = await executeQuery(
    `
      SELECT TOP 1 *
      FROM dbo.ITAssetStatuses
      WHERE StatusKey = @StatusKey;
    `,
    [{ name: "StatusKey", type: sql.NVarChar(100), value: statusKey }]
  );

  return firstOrNull(result);
};

const reportIssue = async ({
  asset,
  payload,
  faultyStatusId,
  actionByUserId,
  ipAddress = null,
}) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const issueResult = await new sql.Request(transaction)
      .input("AssetId", sql.Int, asset.AssetId)
      .input("IssueTypeId", sql.Int, payload.issueTypeId)
      .input("ReportedByUserId", sql.Int, actionByUserId || null)
      .input("AssignedToUserId", sql.Int, payload.assignedToUserId || null)
      .input("IssueStatus", sql.NVarChar(50), payload.assignedToUserId ? "ASSIGNED" : "OPEN")
      .input("Priority", sql.NVarChar(50), payload.priority || "MEDIUM")
      .input("Description", sql.NVarChar(sql.MAX), payload.description || null)
      .query(`
        INSERT INTO dbo.ITAssetIssueLogs
        (
          AssetId,
          IssueTypeId,
          ReportedByUserId,
          AssignedToUserId,
          IssueStatus,
          Priority,
          Description,
          ReportedAt
        )
        OUTPUT INSERTED.*
        VALUES
        (
          @AssetId,
          @IssueTypeId,
          @ReportedByUserId,
          @AssignedToUserId,
          @IssueStatus,
          @Priority,
          @Description,
          GETDATE()
        );
      `);

    const assetResult = await new sql.Request(transaction)
      .input("AssetId", sql.Int, asset.AssetId)
      .input("FaultyStatusId", sql.Int, faultyStatusId)
      .query(`
        UPDATE dbo.ITAssets
        SET
          ITAssetStatusId = @FaultyStatusId,
          UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE AssetId = @AssetId
          AND IsDeleted = 0;
      `);

    await new sql.Request(transaction)
      .input("AssetId", sql.Int, asset.AssetId)
      .input("OldStatusId", sql.Int, asset.ITAssetStatusId)
      .input("NewStatusId", sql.Int, faultyStatusId)
      .input("ChangedBy", sql.Int, actionByUserId || null)
      .input("Notes", sql.NVarChar(sql.MAX), payload.description || "Asset issue reported.")
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

    const issue = issueResult.recordset[0];
    const updatedAsset = assetResult.recordset[0];

    await new sql.Request(transaction)
      .input("UserId", sql.Int, actionByUserId || null)
      .input("ActionType", sql.NVarChar(200), "ISSUE_REPORTED")
      .input("EntityType", sql.NVarChar(200), "ITAssetIssue")
      .input("EntityId", sql.NVarChar(200), String(issue.IssueLogId))
      .input("Description", sql.NVarChar(sql.MAX), `Issue reported for asset ${asset.AssetTag}.`)
      .input("OldValue", sql.NVarChar(sql.MAX), JSON.stringify(asset))
      .input("NewValue", sql.NVarChar(sql.MAX), JSON.stringify({ asset: updatedAsset, issue }))
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

    await new sql.Request(transaction)
      .input("UserId", sql.Int, actionByUserId || null)
      .input("ModuleKey", sql.NVarChar(200), "IT_ASSETS")
      .input("EntityType", sql.NVarChar(200), "ITAssetIssue")
      .input("EntityId", sql.NVarChar(200), String(issue.IssueLogId))
      .input("ActivityType", sql.NVarChar(200), "ISSUE_REPORTED")
      .input("ActivityTitle", sql.NVarChar(510), "Asset Issue Reported")
      .input("ActivityDescription", sql.NVarChar(sql.MAX), `Issue reported for asset ${asset.AssetTag}.`)
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

    await transaction.commit();

    return { issue, asset: updatedAsset };
  } catch (error) {
    if (transaction._aborted !== true) await transaction.rollback();
    throw error;
  }
};

const assignIssue = async ({ issueLogId, assignedToUserId }) => {
  const result = await executeQuery(
    `
      UPDATE dbo.ITAssetIssueLogs
      SET
        AssignedToUserId = @AssignedToUserId,
        IssueStatus = 'ASSIGNED'
      OUTPUT INSERTED.*
      WHERE IssueLogId = @IssueLogId
        AND IssueStatus IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS');
    `,
    [
      { name: "IssueLogId", type: sql.Int, value: Number(issueLogId) },
      { name: "AssignedToUserId", type: sql.Int, value: Number(assignedToUserId) },
    ]
  );

  return firstOrNull(result);
};

const resolveIssue = async ({
  issue,
  asset,
  availableStatusId,
  payload,
  actionByUserId,
  ipAddress = null,
}) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const issueResult = await new sql.Request(transaction)
      .input("IssueLogId", sql.Int, issue.IssueLogId)
      .input("Resolution", sql.NVarChar(sql.MAX), payload.resolution || null)
      .query(`
        UPDATE dbo.ITAssetIssueLogs
        SET
          IssueStatus = 'RESOLVED',
          Resolution = @Resolution,
          ResolvedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE IssueLogId = @IssueLogId;
      `);

    const assetResult = await new sql.Request(transaction)
      .input("AssetId", sql.Int, asset.AssetId)
      .input("AvailableStatusId", sql.Int, availableStatusId)
      .query(`
        UPDATE dbo.ITAssets
        SET
          ITAssetStatusId = @AvailableStatusId,
          UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE AssetId = @AssetId
          AND IsDeleted = 0;
      `);

    await new sql.Request(transaction)
      .input("AssetId", sql.Int, asset.AssetId)
      .input("OldStatusId", sql.Int, asset.ITAssetStatusId)
      .input("NewStatusId", sql.Int, availableStatusId)
      .input("ChangedBy", sql.Int, actionByUserId || null)
      .input("Notes", sql.NVarChar(sql.MAX), payload.resolution || "Asset issue resolved.")
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

    const updatedIssue = issueResult.recordset[0];
    const updatedAsset = assetResult.recordset[0];

    await new sql.Request(transaction)
      .input("UserId", sql.Int, actionByUserId || null)
      .input("ActionType", sql.NVarChar(200), "ISSUE_RESOLVED")
      .input("EntityType", sql.NVarChar(200), "ITAssetIssue")
      .input("EntityId", sql.NVarChar(200), String(issue.IssueLogId))
      .input("Description", sql.NVarChar(sql.MAX), `Issue resolved for asset ${asset.AssetTag}.`)
      .input("OldValue", sql.NVarChar(sql.MAX), JSON.stringify({ asset, issue }))
      .input("NewValue", sql.NVarChar(sql.MAX), JSON.stringify({ asset: updatedAsset, issue: updatedIssue }))
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

    await new sql.Request(transaction)
      .input("UserId", sql.Int, actionByUserId || null)
      .input("ModuleKey", sql.NVarChar(200), "IT_ASSETS")
      .input("EntityType", sql.NVarChar(200), "ITAssetIssue")
      .input("EntityId", sql.NVarChar(200), String(issue.IssueLogId))
      .input("ActivityType", sql.NVarChar(200), "ISSUE_RESOLVED")
      .input("ActivityTitle", sql.NVarChar(510), "Asset Issue Resolved")
      .input("ActivityDescription", sql.NVarChar(sql.MAX), `Issue resolved for asset ${asset.AssetTag}.`)
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

    await transaction.commit();

    return { issue: updatedIssue, asset: updatedAsset };
  } catch (error) {
    if (transaction._aborted !== true) await transaction.rollback();
    throw error;
  }
};

const getIssues = async ({ status = null, assetId = null }) => {
  const result = await executeQuery(
    `
      SELECT
        il.*,
        a.AssetTag,
        a.ModelDescription,
        it.IssueTypeName,
        reportedBy.FullName AS ReportedByName,
        assignedTo.FullName AS AssignedToName
      FROM dbo.ITAssetIssueLogs il
      INNER JOIN dbo.ITAssets a ON il.AssetId = a.AssetId
      INNER JOIN dbo.ITAssetIssueTypes it ON il.IssueTypeId = it.IssueTypeId
      LEFT JOIN dbo.Users reportedBy ON il.ReportedByUserId = reportedBy.UserId
      LEFT JOIN dbo.Users assignedTo ON il.AssignedToUserId = assignedTo.UserId
      WHERE a.IsDeleted = 0
        AND (@Status IS NULL OR il.IssueStatus = @Status)
        AND (@AssetId IS NULL OR il.AssetId = @AssetId)
      ORDER BY il.ReportedAt DESC;
    `,
    [
      { name: "Status", type: sql.NVarChar(50), value: status || null },
      { name: "AssetId", type: sql.Int, value: assetId ? Number(assetId) : null },
    ]
  );

  return rows(result);
};

module.exports = {
  getAssetById,
  getIssueById,
  getStatusByKey,
  reportIssue,
  assignIssue,
  resolveIssue,
  getIssues,
};