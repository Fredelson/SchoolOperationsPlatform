/* =========================================================
   ARAB UNITY SCHOOL OPERATIONS PLATFORM
   IT Asset Disposal Repository
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

const getDisposalById = async (disposalId) => {
  const result = await executeQuery(
    `
      SELECT TOP 1 *
      FROM dbo.ITAssetDisposals
      WHERE DisposalId = @DisposalId;
    `,
    [{ name: "DisposalId", type: sql.Int, value: Number(disposalId) }]
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

const requestDisposal = async ({ payload, requestedBy }) => {
  const result = await executeQuery(
    `
      INSERT INTO dbo.ITAssetDisposals
      (
        AssetId,
        DisposalStatus,
        Reason,
        RequestedBy,
        RequestedAt
      )
      OUTPUT INSERTED.*
      VALUES
      (
        @AssetId,
        'PENDING',
        @Reason,
        @RequestedBy,
        GETDATE()
      );
    `,
    [
      { name: "AssetId", type: sql.Int, value: Number(payload.assetId) },
      { name: "Reason", type: sql.NVarChar(sql.MAX), value: payload.reason || null },
      { name: "RequestedBy", type: sql.Int, value: requestedBy || null },
    ]
  );

  return firstOrNull(result);
};

const approveDisposal = async ({ disposalId, approvedBy }) => {
  const result = await executeQuery(
    `
      UPDATE dbo.ITAssetDisposals
      SET
        DisposalStatus = 'APPROVED',
        ApprovedBy = @ApprovedBy,
        ApprovedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE DisposalId = @DisposalId
        AND DisposalStatus = 'PENDING';
    `,
    [
      { name: "DisposalId", type: sql.Int, value: Number(disposalId) },
      { name: "ApprovedBy", type: sql.Int, value: approvedBy || null },
    ]
  );

  return firstOrNull(result);
};

const rejectDisposal = async ({ disposalId, approvedBy }) => {
  const result = await executeQuery(
    `
      UPDATE dbo.ITAssetDisposals
      SET
        DisposalStatus = 'REJECTED',
        ApprovedBy = @ApprovedBy,
        ApprovedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE DisposalId = @DisposalId
        AND DisposalStatus = 'PENDING';
    `,
    [
      { name: "DisposalId", type: sql.Int, value: Number(disposalId) },
      { name: "ApprovedBy", type: sql.Int, value: approvedBy || null },
    ]
  );

  return firstOrNull(result);
};

const completeDisposal = async ({
  disposal,
  asset,
  disposedStatusId,
  actionByUserId,
  ipAddress = null,
}) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const disposalResult = await new sql.Request(transaction)
      .input("DisposalId", sql.Int, disposal.DisposalId)
      .query(`
        UPDATE dbo.ITAssetDisposals
        SET
          DisposalStatus = 'DISPOSED',
          DisposedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE DisposalId = @DisposalId
          AND DisposalStatus = 'APPROVED';
      `);

    const assetResult = await new sql.Request(transaction)
      .input("AssetId", sql.Int, asset.AssetId)
      .input("DisposedStatusId", sql.Int, disposedStatusId)
      .query(`
        UPDATE dbo.ITAssets
        SET
          ITAssetStatusId = @DisposedStatusId,
          IsActive = 0,
          UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE AssetId = @AssetId
          AND IsDeleted = 0;
      `);

    await new sql.Request(transaction)
      .input("AssetId", sql.Int, asset.AssetId)
      .input("OldStatusId", sql.Int, asset.ITAssetStatusId)
      .input("NewStatusId", sql.Int, disposedStatusId)
      .input("ChangedBy", sql.Int, actionByUserId || null)
      .input("Notes", sql.NVarChar(sql.MAX), disposal.Reason || "Asset disposed.")
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

    const updatedDisposal = disposalResult.recordset[0];
    const updatedAsset = assetResult.recordset[0];

    await new sql.Request(transaction)
      .input("UserId", sql.Int, actionByUserId || null)
      .input("ActionType", sql.NVarChar(200), "ASSET_DISPOSED")
      .input("EntityType", sql.NVarChar(200), "ITAsset")
      .input("EntityId", sql.NVarChar(200), String(asset.AssetId))
      .input("Description", sql.NVarChar(sql.MAX), `Asset ${asset.AssetTag} was disposed.`)
      .input("OldValue", sql.NVarChar(sql.MAX), JSON.stringify({ asset, disposal }))
      .input("NewValue", sql.NVarChar(sql.MAX), JSON.stringify({ asset: updatedAsset, disposal: updatedDisposal }))
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
      .input("EntityType", sql.NVarChar(200), "ITAsset")
      .input("EntityId", sql.NVarChar(200), String(asset.AssetId))
      .input("ActivityType", sql.NVarChar(200), "ASSET_DISPOSED")
      .input("ActivityTitle", sql.NVarChar(510), "Asset Disposed")
      .input("ActivityDescription", sql.NVarChar(sql.MAX), `Asset ${asset.AssetTag} was disposed.`)
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

    return { disposal: updatedDisposal, asset: updatedAsset };
  } catch (error) {
    if (transaction._aborted !== true) await transaction.rollback();
    throw error;
  }
};

/**
 * Get asset disposal records.
 *
 * Enterprise rule:
 * - Disposal module shows disposal workflow records.
 * - Deleted assets are excluded.
 * - Disposed assets remain in database for audit/history.
 * - Asset Management will exclude disposed assets separately.
 */
const getDisposals = async ({ status = null, assetId = null }) => {
  const result = await executeQuery(
    `
      SELECT
        d.*,

        a.AssetId,
        a.AssetTag,
        a.AssetCode,
        a.ModelDescription,
        a.ITAssetStatusId,
        a.IsActive,

        assetStatus.StatusKey,
        assetStatus.StatusName,

        requestedBy.FullName AS RequestedByName,
        approvedBy.FullName AS ApprovedByName
      FROM dbo.ITAssetDisposals d
      INNER JOIN dbo.ITAssets a
        ON d.AssetId = a.AssetId
      LEFT JOIN dbo.ITAssetStatuses assetStatus
        ON a.ITAssetStatusId = assetStatus.ITAssetStatusId
      LEFT JOIN dbo.Users requestedBy
        ON d.RequestedBy = requestedBy.UserId
      LEFT JOIN dbo.Users approvedBy
        ON d.ApprovedBy = approvedBy.UserId
      WHERE a.IsDeleted = 0
        AND (@Status IS NULL OR d.DisposalStatus = @Status)
        AND (@AssetId IS NULL OR d.AssetId = @AssetId)
      ORDER BY d.RequestedAt DESC;
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
  getDisposalById,
  getStatusByKey,
  requestDisposal,
  approveDisposal,
  rejectDisposal,
  completeDisposal,
  getDisposals,
};