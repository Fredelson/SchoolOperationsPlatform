/* =========================================================
   ARAB UNITY SCHOOL OPERATIONS PLATFORM
   IT Asset Transfer Repository
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

const getTransferById = async (transferRequestId) => {
  const result = await executeQuery(
    `
      SELECT TOP 1 *
      FROM dbo.ITAssetTransferRequests
      WHERE AssetTransferRequestId = @AssetTransferRequestId;
    `,
    [{ name: "AssetTransferRequestId", type: sql.Int, value: Number(transferRequestId) }]
  );

  return firstOrNull(result);
};

const createTransferRequest = async ({ payload, requestedBy }) => {
  const result = await executeQuery(
    `
      INSERT INTO dbo.ITAssetTransferRequests
      (
        TransferRequestNumber,
        AssetId,
        RequestedBy,
        FromUserId,
        ToUserId,
        FromRoomId,
        ToRoomId,
        FromDepartmentId,
        ToDepartmentId,
        FromLocationId,
        ToLocationId,
        TransferReason,
        TransferStatus,
        RequestedAt
      )
      OUTPUT INSERTED.*
      VALUES
      (
        CONCAT('TRF-', FORMAT(GETDATE(), 'yyyyMMddHHmmss')),
        @AssetId,
        @RequestedBy,
        @FromUserId,
        @ToUserId,
        @FromRoomId,
        @ToRoomId,
        @FromDepartmentId,
        @ToDepartmentId,
        @FromLocationId,
        @ToLocationId,
        @TransferReason,
        'PENDING',
        GETDATE()
      );
    `,
    [
      { name: "AssetId", type: sql.Int, value: Number(payload.assetId) },
      { name: "RequestedBy", type: sql.Int, value: requestedBy || null },
      { name: "FromUserId", type: sql.Int, value: payload.fromUserId || null },
      { name: "ToUserId", type: sql.Int, value: payload.toUserId || null },
      { name: "FromRoomId", type: sql.Int, value: payload.fromRoomId || null },
      { name: "ToRoomId", type: sql.Int, value: payload.toRoomId || null },
      { name: "FromDepartmentId", type: sql.Int, value: payload.fromDepartmentId || null },
      { name: "ToDepartmentId", type: sql.Int, value: payload.toDepartmentId || null },
      { name: "FromLocationId", type: sql.Int, value: payload.fromLocationId || null },
      { name: "ToLocationId", type: sql.Int, value: payload.toLocationId || null },
      { name: "TransferReason", type: sql.NVarChar(sql.MAX), value: payload.transferReason || null },
    ]
  );

  return firstOrNull(result);
};

const transferAsset = async ({ asset, payload, actionByUserId, ipAddress = null }) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const transferResult = await new sql.Request(transaction)
      .input("AssetId", sql.Int, asset.AssetId)
      .input("ActionByUserId", sql.Int, actionByUserId)
      .input("FromUserId", sql.Int, asset.CurrentAssignedUserId || null)
      .input("ToUserId", sql.Int, payload.toUserId || null)
      .input("FromRoomId", sql.Int, asset.CurrentRoomId || null)
      .input("ToRoomId", sql.Int, payload.toRoomId || null)
      .input("FromDepartmentId", sql.Int, asset.CurrentDepartmentId || null)
      .input("ToDepartmentId", sql.Int, payload.toDepartmentId || null)
      .input("FromLocationId", sql.Int, asset.CurrentLocationId || null)
      .input("ToLocationId", sql.Int, payload.toLocationId || null)
      .input("TransferReason", sql.NVarChar(sql.MAX), payload.transferReason || null)
      .query(`
        INSERT INTO dbo.ITAssetTransferRequests
        (
          TransferRequestNumber, AssetId, RequestedBy, ApprovedBy,
          FromUserId, ToUserId, FromRoomId, ToRoomId,
          FromDepartmentId, ToDepartmentId, FromLocationId, ToLocationId,
          TransferReason, TransferStatus, RequestedAt, ApprovedAt, CompletedAt
        )
        OUTPUT INSERTED.*
        VALUES
        (
          CONCAT('TRF-', FORMAT(SYSDATETIME(), 'yyyyMMddHHmmssfff')),
          @AssetId, @ActionByUserId, @ActionByUserId,
          @FromUserId, @ToUserId, @FromRoomId, @ToRoomId,
          @FromDepartmentId, @ToDepartmentId, @FromLocationId, @ToLocationId,
          @TransferReason, 'COMPLETED', GETDATE(), GETDATE(), GETDATE()
        );
      `);

    const assetResult = await new sql.Request(transaction)
      .input("AssetId", sql.Int, asset.AssetId)
      .input("ToUserId", sql.Int, payload.toUserId || null)
      .input("ToRoomId", sql.Int, payload.toRoomId || null)
      .input("ToDepartmentId", sql.Int, payload.toDepartmentId || null)
      .input("ToLocationId", sql.Int, payload.toLocationId || null)
      .query(`
        UPDATE dbo.ITAssets
        SET CurrentAssignedUserId = @ToUserId,
            CurrentAssignedName = (
              SELECT FullName FROM dbo.Users WHERE UserId = @ToUserId
            ),
            CurrentAssignedEmployeeCode = (
              SELECT EmployeeId FROM dbo.Users WHERE UserId = @ToUserId
            ),
            CurrentAssignedEmail = (
              SELECT SchoolEmail FROM dbo.Users WHERE UserId = @ToUserId
            ),
            CurrentRoomId = @ToRoomId,
            CurrentDepartmentId = @ToDepartmentId,
            CurrentLocationId = @ToLocationId,
            UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE AssetId = @AssetId AND IsDeleted = 0;
      `);

    const updatedTransfer = transferResult.recordset[0];
    const updatedAsset = assetResult.recordset[0];

    const labelResult = await new sql.Request(transaction)
      .input("AssetId", sql.Int, asset.AssetId)
      .input("ToUserId", sql.Int, payload.toUserId || null)
      .input("ToRoomId", sql.Int, payload.toRoomId || null)
      .input("ToDepartmentId", sql.Int, payload.toDepartmentId || null)
      .input("ToLocationId", sql.Int, payload.toLocationId || null)
      .query(`
        SELECT TOP 1
          ISNULL(category.CategoryName, 'Asset') AS CategoryName,
          COALESCE(
            destinationUser.FullName,
            destinationRoom.RoomName,
            destinationDepartment.DepartmentName,
            destinationLocation.LocationName,
            'Unspecified Destination'
          ) AS DestinationName
        FROM dbo.ITAssets currentAsset
        LEFT JOIN dbo.ITAssetCategories category
          ON currentAsset.ITAssetCategoryId = category.ITAssetCategoryId
        LEFT JOIN dbo.Users destinationUser
          ON destinationUser.UserId = @ToUserId
        LEFT JOIN dbo.Rooms destinationRoom
          ON destinationRoom.RoomId = @ToRoomId
        LEFT JOIN dbo.Departments destinationDepartment
          ON destinationDepartment.DepartmentId = @ToDepartmentId
        LEFT JOIN dbo.Locations destinationLocation
          ON destinationLocation.LocationId = @ToLocationId
        WHERE currentAsset.AssetId = @AssetId;
      `);

    const labels = labelResult.recordset[0] || {};
    const transferDescription = `${labels.CategoryName || "Asset"} ${asset.AssetTag} Transferred To ${
      labels.DestinationName || "Unspecified Destination"
    }`;

    await new sql.Request(transaction)
      .input("UserId", sql.Int, actionByUserId)
      .input("EntityId", sql.NVarChar(200), String(asset.AssetId))
      .input("Description", sql.NVarChar(sql.MAX), transferDescription)
      .input("OldValue", sql.NVarChar(sql.MAX), JSON.stringify(asset))
      .input("NewValue", sql.NVarChar(sql.MAX), JSON.stringify(updatedAsset))
      .input("IpAddress", sql.NVarChar(100), ipAddress || null)
      .query(`
        INSERT INTO dbo.AuditLogs
          (UserId, ActionType, EntityType, EntityId, Description, OldValue, NewValue, IpAddress, CreatedAt)
        VALUES
          (@UserId, 'ASSET_TRANSFER_COMPLETED', 'ITAsset', @EntityId, @Description,
           @OldValue, @NewValue, @IpAddress, GETDATE());

        INSERT INTO dbo.ActivityTimeline
          (UserId, ModuleKey, EntityType, EntityId, ActivityType, ActivityTitle, ActivityDescription, CreatedAt)
        VALUES
          (@UserId, 'IT_ASSETS', 'ITAsset', @EntityId, 'ASSET_TRANSFER_COMPLETED',
           'Asset Transfer Completed', @Description, GETDATE());
      `);

    await transaction.commit();
    return { transfer: updatedTransfer, asset: updatedAsset };
  } catch (error) {
    if (transaction._aborted !== true) await transaction.rollback();
    throw error;
  }
};

const approveTransfer = async ({ transferRequestId, approvedBy }) => {
  const result = await executeQuery(
    `
      UPDATE dbo.ITAssetTransferRequests
      SET
        ApprovedBy = @ApprovedBy,
        ApprovedAt = GETDATE(),
        TransferStatus = 'APPROVED'
      OUTPUT INSERTED.*
      WHERE AssetTransferRequestId = @AssetTransferRequestId
        AND TransferStatus = 'PENDING';
    `,
    [
      { name: "AssetTransferRequestId", type: sql.Int, value: Number(transferRequestId) },
      { name: "ApprovedBy", type: sql.Int, value: approvedBy || null },
    ]
  );

  return firstOrNull(result);
};

const rejectTransfer = async ({ transferRequestId }) => {
  const result = await executeQuery(
    `
      UPDATE dbo.ITAssetTransferRequests
      SET TransferStatus = 'REJECTED'
      OUTPUT INSERTED.*
      WHERE AssetTransferRequestId = @AssetTransferRequestId
        AND TransferStatus = 'PENDING';
    `,
    [{ name: "AssetTransferRequestId", type: sql.Int, value: Number(transferRequestId) }]
  );

  return firstOrNull(result);
};

const completeTransfer = async ({ transfer, asset, actionByUserId, ipAddress = null }) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const transferResult = await new sql.Request(transaction)
      .input("AssetTransferRequestId", sql.Int, transfer.AssetTransferRequestId)
      .query(`
        UPDATE dbo.ITAssetTransferRequests
        SET
          TransferStatus = 'COMPLETED',
          CompletedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE AssetTransferRequestId = @AssetTransferRequestId
          AND TransferStatus = 'APPROVED';
      `);

    const assetResult = await new sql.Request(transaction)
      .input("AssetId", sql.Int, asset.AssetId)
      .input("ToUserId", sql.Int, transfer.ToUserId || null)
      .input("ToRoomId", sql.Int, transfer.ToRoomId || null)
      .input("ToDepartmentId", sql.Int, transfer.ToDepartmentId || null)
      .input("ToLocationId", sql.Int, transfer.ToLocationId || null)
      .query(`
        UPDATE dbo.ITAssets
        SET
          CurrentAssignedUserId = COALESCE(@ToUserId, CurrentAssignedUserId),
          CurrentRoomId = COALESCE(@ToRoomId, CurrentRoomId),
          CurrentDepartmentId = COALESCE(@ToDepartmentId, CurrentDepartmentId),
          CurrentLocationId = COALESCE(@ToLocationId, CurrentLocationId),
          UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE AssetId = @AssetId
          AND IsDeleted = 0;
      `);

    const updatedTransfer = transferResult.recordset[0];
    const updatedAsset = assetResult.recordset[0];

    await new sql.Request(transaction)
      .input("UserId", sql.Int, actionByUserId || null)
      .input("ActionType", sql.NVarChar(200), "ASSET_TRANSFER_COMPLETED")
      .input("EntityType", sql.NVarChar(200), "ITAsset")
      .input("EntityId", sql.NVarChar(200), String(asset.AssetId))
      .input("Description", sql.NVarChar(sql.MAX), `Asset ${asset.AssetTag} transfer completed.`)
      .input("OldValue", sql.NVarChar(sql.MAX), JSON.stringify({ asset, transfer }))
      .input("NewValue", sql.NVarChar(sql.MAX), JSON.stringify({ asset: updatedAsset, transfer: updatedTransfer }))
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
      .input("ActivityType", sql.NVarChar(200), "ASSET_TRANSFER_COMPLETED")
      .input("ActivityTitle", sql.NVarChar(510), "Asset Transfer Completed")
      .input("ActivityDescription", sql.NVarChar(sql.MAX), `Asset ${asset.AssetTag} transfer completed.`)
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

    return { transfer: updatedTransfer, asset: updatedAsset };
  } catch (error) {
    if (transaction._aborted !== true) {
      await transaction.rollback();
    }

    throw error;
  }
};

const getTransfers = async () => {
  const result = await executeQuery(`
    SELECT
      tr.*,
      a.AssetTag,
      a.ModelDescription,
      requestedBy.FullName AS RequestedByName,
      approvedBy.FullName AS ApprovedByName
    FROM dbo.ITAssetTransferRequests tr
    INNER JOIN dbo.ITAssets a ON tr.AssetId = a.AssetId
    LEFT JOIN dbo.Users requestedBy ON tr.RequestedBy = requestedBy.UserId
    LEFT JOIN dbo.Users approvedBy ON tr.ApprovedBy = approvedBy.UserId
    ORDER BY tr.RequestedAt DESC;
  `);

  return rows(result);
};

const getTransfersByAssetId = async (assetId) => {
  const result = await executeQuery(
    `
      SELECT *
      FROM dbo.ITAssetTransferRequests
      WHERE AssetId = @AssetId
      ORDER BY RequestedAt DESC;
    `,
    [{ name: "AssetId", type: sql.Int, value: Number(assetId) }]
  );

  return rows(result);
};

module.exports = {
  getAssetById,
  getTransferById,
  createTransferRequest,
  transferAsset,
  approveTransfer,
  rejectTransfer,
  completeTransfer,
  getTransfers,
  getTransfersByAssetId,
};
