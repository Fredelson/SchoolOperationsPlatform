/* =========================================================
   ARAB UNITY SCHOOL OPERATIONS PLATFORM
   IT Asset Maintenance Repository
========================================================= */

const sql = require("mssql");
const { poolPromise } = require("../../../../config/db");
const { executeQuery } = require("../../../../shared/database/executeQuery");
const { firstOrNull, rows } = require("../../../../shared/database/repositoryBase");

const getAssetById = async (assetId) => {
  const result = await executeQuery(
    `
      SELECT TOP 1 a.*, s.StatusKey, s.StatusName
      FROM dbo.ITAssets a
      LEFT JOIN dbo.ITAssetStatuses s ON a.ITAssetStatusId = s.ITAssetStatusId
      WHERE a.AssetId = @AssetId
        AND a.IsDeleted = 0;
    `,
    [{ name: "AssetId", type: sql.Int, value: Number(assetId) }]
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

const createMaintenanceLog = async ({
  asset,
  payload,
  maintenanceStatusId,
  actionByUserId,
  ipAddress = null,
}) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const maintenanceResult = await new sql.Request(transaction)
      .input("AssetId", sql.Int, asset.AssetId)
      .input("MaintenanceType", sql.NVarChar(100), payload.maintenanceType)
      .input("Description", sql.NVarChar(sql.MAX), payload.description || null)
      .input("PerformedBy", sql.Int, actionByUserId || null)
      .input("Cost", sql.Decimal(18, 2), payload.cost || null)
      .input("PerformedAt", sql.DateTime, payload.performedAt || new Date())
      .input("NextDueAt", sql.DateTime, payload.nextDueAt || null)
      .query(`
        INSERT INTO dbo.ITAssetMaintenanceLogs
        (
          AssetId,
          MaintenanceType,
          Description,
          PerformedBy,
          Cost,
          PerformedAt,
          NextDueAt
        )
        OUTPUT INSERTED.*
        VALUES
        (
          @AssetId,
          @MaintenanceType,
          @Description,
          @PerformedBy,
          @Cost,
          @PerformedAt,
          @NextDueAt
        );
      `);

    const assetResult = await new sql.Request(transaction)
      .input("AssetId", sql.Int, asset.AssetId)
      .input("MaintenanceStatusId", sql.Int, maintenanceStatusId)
      .query(`
        UPDATE dbo.ITAssets
        SET
          ITAssetStatusId = @MaintenanceStatusId,
          UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE AssetId = @AssetId
          AND IsDeleted = 0;
      `);

    await new sql.Request(transaction)
      .input("AssetId", sql.Int, asset.AssetId)
      .input("OldStatusId", sql.Int, asset.ITAssetStatusId)
      .input("NewStatusId", sql.Int, maintenanceStatusId)
      .input("ChangedBy", sql.Int, actionByUserId || null)
      .input("Notes", sql.NVarChar(sql.MAX), payload.description || "Asset maintenance recorded.")
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

    const maintenance = maintenanceResult.recordset[0];
    const updatedAsset = assetResult.recordset[0];

    await new sql.Request(transaction)
      .input("UserId", sql.Int, actionByUserId || null)
      .input("ActionType", sql.NVarChar(200), "ASSET_MAINTENANCE_RECORDED")
      .input("EntityType", sql.NVarChar(200), "ITAsset")
      .input("EntityId", sql.NVarChar(200), String(asset.AssetId))
      .input("Description", sql.NVarChar(sql.MAX), `Maintenance recorded for asset ${asset.AssetTag}.`)
      .input("OldValue", sql.NVarChar(sql.MAX), JSON.stringify(asset))
      .input("NewValue", sql.NVarChar(sql.MAX), JSON.stringify({ asset: updatedAsset, maintenance }))
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
      .input("ActivityType", sql.NVarChar(200), "ASSET_MAINTENANCE_RECORDED")
      .input("ActivityTitle", sql.NVarChar(510), "Asset Maintenance Recorded")
      .input("ActivityDescription", sql.NVarChar(sql.MAX), `Maintenance recorded for asset ${asset.AssetTag}.`)
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

    return { maintenance, asset: updatedAsset };
  } catch (error) {
    if (transaction._aborted !== true) {
      await transaction.rollback();
    }

    throw error;
  }
};

const getMaintenanceLogs = async ({ assetId = null }) => {
  const result = await executeQuery(
    `
      WITH MaintenanceRows AS (
        SELECT
          ml.MaintenanceLogId,
          ml.AssetId,
          ml.MaintenanceType,
          ml.Description,
          ml.PerformedBy,
          ml.Cost,
          ml.PerformedAt,
          ml.NextDueAt,
          a.AssetTag,
          a.ModelDescription,
          u.FullName AS PerformedByName,
          s.StatusKey AS AssetStatusKey,
          s.StatusName AS AssetStatusName,
          CAST(0 AS bit) AS IsSyntheticMaintenance,
          ROW_NUMBER() OVER (
            PARTITION BY ml.AssetId
            ORDER BY ml.PerformedAt DESC, ml.MaintenanceLogId DESC
          ) AS MaintenanceSequence
        FROM dbo.ITAssetMaintenanceLogs ml
        INNER JOIN dbo.ITAssets a ON ml.AssetId = a.AssetId
        LEFT JOIN dbo.Users u ON ml.PerformedBy = u.UserId
        LEFT JOIN dbo.ITAssetStatuses s ON a.ITAssetStatusId = s.ITAssetStatusId
        WHERE a.IsDeleted = 0
          AND (@AssetId IS NULL OR ml.AssetId = @AssetId)

        UNION ALL

        SELECT
          -a.AssetId AS MaintenanceLogId,
          a.AssetId,
          'Maintenance Review' AS MaintenanceType,
          'Asset is under repair and requires maintenance review.' AS Description,
          NULL AS PerformedBy,
          NULL AS Cost,
          COALESCE(a.UpdatedAt, a.CreatedAt, GETDATE()) AS PerformedAt,
          NULL AS NextDueAt,
          a.AssetTag,
          a.ModelDescription,
          NULL AS PerformedByName,
          s.StatusKey AS AssetStatusKey,
          s.StatusName AS AssetStatusName,
          CAST(1 AS bit) AS IsSyntheticMaintenance,
          1 AS MaintenanceSequence
        FROM dbo.ITAssets a
        LEFT JOIN dbo.ITAssetStatuses s ON a.ITAssetStatusId = s.ITAssetStatusId
        WHERE a.IsDeleted = 0
          AND (@AssetId IS NULL OR a.AssetId = @AssetId)
          AND UPPER(REPLACE(REPLACE(ISNULL(s.StatusKey, s.StatusName), ' ', ''), '-', '')) IN
            ('UNDERREPAIR', 'UNDERMAINTENANCE', 'MAINTENANCE')
          AND NOT EXISTS (
            SELECT 1
            FROM dbo.ITAssetMaintenanceLogs existingLog
            WHERE existingLog.AssetId = a.AssetId
          )
      )
      SELECT *
      FROM MaintenanceRows
      ORDER BY PerformedAt DESC, MaintenanceLogId DESC;
    `,
    [{ name: "AssetId", type: sql.Int, value: assetId ? Number(assetId) : null }]
  );

  return rows(result);
};

const getMaintenanceDue = async () => {
  const result = await executeQuery(`
    SELECT
      ml.*,
      a.AssetTag,
      a.ModelDescription,
      s.StatusKey AS AssetStatusKey,
      s.StatusName AS AssetStatusName,
      ROW_NUMBER() OVER (
        PARTITION BY ml.AssetId
        ORDER BY ml.PerformedAt DESC, ml.MaintenanceLogId DESC
      ) AS MaintenanceSequence
    FROM dbo.ITAssetMaintenanceLogs ml
    INNER JOIN dbo.ITAssets a ON ml.AssetId = a.AssetId
    LEFT JOIN dbo.ITAssetStatuses s ON a.ITAssetStatusId = s.ITAssetStatusId
    WHERE a.IsDeleted = 0
      AND ml.NextDueAt IS NOT NULL
      AND ml.NextDueAt <= GETDATE()
    ORDER BY ml.NextDueAt ASC;
  `);

  return rows(result);
};

const getMaintenanceLogById = async (maintenanceLogId) => {
  const result = await executeQuery(
    `SELECT TOP 1 * FROM dbo.ITAssetMaintenanceLogs WHERE MaintenanceLogId = @MaintenanceLogId;`,
    [{ name: "MaintenanceLogId", type: sql.Int, value: Number(maintenanceLogId) }]
  );
  return firstOrNull(result);
};

const completeMaintenance = async ({ maintenance, asset, availableStatusId, actionByUserId }) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();
    const result = await new sql.Request(transaction)
      .input("AssetId", sql.Int, asset.AssetId)
      .input("AvailableStatusId", sql.Int, availableStatusId)
      .query(`
        UPDATE dbo.ITAssets
        SET ITAssetStatusId = @AvailableStatusId, UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE AssetId = @AssetId AND IsDeleted = 0;
      `);
    await new sql.Request(transaction)
      .input("AssetId", sql.Int, asset.AssetId)
      .input("OldStatusId", sql.Int, asset.ITAssetStatusId)
      .input("NewStatusId", sql.Int, availableStatusId)
      .input("ChangedBy", sql.Int, actionByUserId || null)
      .input("Notes", sql.NVarChar(sql.MAX), `Maintenance finished: ${maintenance.MaintenanceType}`)
      .query(`
        INSERT INTO dbo.ITAssetStatusHistory
          (AssetId, OldStatusId, NewStatusId, ChangedBy, ChangedAt, Notes)
        VALUES
          (@AssetId, @OldStatusId, @NewStatusId, @ChangedBy, GETDATE(), @Notes);
      `);
    await transaction.commit();
    return { maintenance, asset: result.recordset[0] };
  } catch (error) {
    if (transaction._aborted !== true) await transaction.rollback();
    throw error;
  }
};

module.exports = {
  getAssetById,
  getStatusByKey,
  createMaintenanceLog,
  getMaintenanceLogs,
  getMaintenanceDue,
  getMaintenanceLogById,
  completeMaintenance,
};
