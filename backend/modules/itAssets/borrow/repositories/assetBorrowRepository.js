/* =========================================================
   ARAB UNITY SCHOOL OPERATIONS PLATFORM
   IT Asset Borrow Repository
========================================================= */

const sql = require("mssql");
const { poolPromise } = require("../../../../config/db");
const { executeQuery } = require("../../../../shared/database/executeQuery");
const { firstOrNull, rows } = require("../../../../shared/database/repositoryBase");
const {
  insertPartRequirements,
} = require("../../shared/repositories/assetPartRequirementRepository");

const getAssetById = async (assetId) => {
  const result = await executeQuery(
    `
      SELECT TOP 1
        a.*,
        c.CategoryKey,
        c.CategoryName
      FROM dbo.ITAssets a
      LEFT JOIN dbo.ITAssetCategories c
        ON a.ITAssetCategoryId = c.ITAssetCategoryId
      WHERE a.AssetId = @AssetId
        AND a.IsDeleted = 0;
    `,
    [{ name: "AssetId", type: sql.Int, value: Number(assetId) }]
  );

  return firstOrNull(result);
};

const getUserById = async (userId) => {
  const result = await executeQuery(
    `
      SELECT TOP 1
        UserId,
        FullName,
        EmployeeId,
        SchoolEmail
      FROM dbo.Users
      WHERE UserId = @UserId
        AND IsActive = 1
        AND IsDeleted = 0;
    `,
    [{ name: "UserId", type: sql.Int, value: Number(userId) }]
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

const getConditionById = async (conditionId) => {
  const result = await executeQuery(`
    SELECT TOP 1 ITAssetConditionId, ConditionKey, ConditionName
    FROM dbo.ITAssetConditions
    WHERE ITAssetConditionId = @ConditionId;
  `, [{ name: "ConditionId", type: sql.Int, value: Number(conditionId) }]);
  return firstOrNull(result);
};

const getActiveBorrowByAssetId = async (assetId) => {
  const result = await executeQuery(
    `
      SELECT TOP 1 *
      FROM dbo.ITAssetBorrows
      WHERE AssetId = @AssetId
        AND ReturnedAt IS NULL
      ORDER BY BorrowedAt DESC;
    `,
    [{ name: "AssetId", type: sql.Int, value: Number(assetId) }]
  );

  return firstOrNull(result);
};

const borrowAsset = async ({
  asset,
  borrower,
  payload,
  borrowedStatusId,
  actionByUserId,
  ipAddress = null,
}) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const borrowResult = await new sql.Request(transaction)
      .input("AssetId", sql.Int, asset.AssetId)
      .input("BorrowedByUserId", sql.Int, borrower?.UserId || null)
      .input("BorrowedByName", sql.NVarChar(255), borrower?.FullName || payload.borrowedByName || null)
      .input("BorrowedByEmail", sql.NVarChar(255), borrower?.SchoolEmail || payload.borrowedByEmail || null)
      .input("BorrowedByEmployeeCode", sql.NVarChar(50), borrower?.EmployeeId || payload.borrowedByEmployeeCode || null)
      .input("BorrowedFromRoomId", sql.Int, asset.CurrentRoomId || null)
      .input("BorrowedFromDepartmentId", sql.Int, asset.CurrentDepartmentId || null)
      .input("BorrowedFromLocationId", sql.Int, asset.CurrentLocationId || null)
      .input("ExpectedReturnAt", sql.DateTime, payload.expectedReturnAt || null)
      .input("ApprovedByUserId", sql.Int, actionByUserId || null)
      .input("Notes", sql.NVarChar(sql.MAX), payload.notes || null)
      .query(`
        INSERT INTO dbo.ITAssetBorrows
        (
          AssetId,
          BorrowedByUserId,
          BorrowedByName,
          BorrowedByEmail,
          BorrowedByEmployeeCode,
          BorrowedFromRoomId,
          BorrowedFromDepartmentId,
          BorrowedFromLocationId,
          BorrowedAt,
          ExpectedReturnAt,
          ApprovedByUserId,
          Notes,
          CreatedAt
        )
        OUTPUT INSERTED.*
        VALUES
        (
          @AssetId,
          @BorrowedByUserId,
          @BorrowedByName,
          @BorrowedByEmail,
          @BorrowedByEmployeeCode,
          @BorrowedFromRoomId,
          @BorrowedFromDepartmentId,
          @BorrowedFromLocationId,
          GETDATE(),
          @ExpectedReturnAt,
          @ApprovedByUserId,
          @Notes,
          GETDATE()
        );
      `);

    const assetResult = await new sql.Request(transaction)
      .input("AssetId", sql.Int, asset.AssetId)
      .input("BorrowedStatusId", sql.Int, borrowedStatusId)
      .input("CurrentAssignedUserId", sql.Int, borrower?.UserId || null)
      .input("CurrentAssignedName", sql.NVarChar(255), borrower?.FullName || payload.borrowedByName || null)
      .input("CurrentAssignedEmployeeCode", sql.NVarChar(50), borrower?.EmployeeId || payload.borrowedByEmployeeCode || null)
      .input("CurrentAssignedEmail", sql.NVarChar(255), borrower?.SchoolEmail || payload.borrowedByEmail || null)
      .query(`
        UPDATE dbo.ITAssets
        SET
          ITAssetStatusId = @BorrowedStatusId,
          CurrentAssignedUserId = @CurrentAssignedUserId,
          CurrentAssignedName = @CurrentAssignedName,
          CurrentAssignedEmployeeCode = @CurrentAssignedEmployeeCode,
          CurrentAssignedEmail = @CurrentAssignedEmail,
          UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE AssetId = @AssetId
          AND IsDeleted = 0;
      `);

    await new sql.Request(transaction)
      .input("AssetId", sql.Int, asset.AssetId)
      .input("OldStatusId", sql.Int, asset.ITAssetStatusId)
      .input("NewStatusId", sql.Int, borrowedStatusId)
      .input("ChangedBy", sql.Int, actionByUserId || null)
      .input("Notes", sql.NVarChar(sql.MAX), payload.notes || "Asset borrowed.")
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

    const borrow = borrowResult.recordset[0];
    const updatedAsset = assetResult.recordset[0];

    await new sql.Request(transaction)
      .input("UserId", sql.Int, actionByUserId || null)
      .input("ActionType", sql.NVarChar(200), "ASSET_BORROWED")
      .input("EntityType", sql.NVarChar(200), "ITAsset")
      .input("EntityId", sql.NVarChar(200), String(asset.AssetId))
      .input("Description", sql.NVarChar(sql.MAX), `Asset ${asset.AssetTag} was borrowed by ${borrow.BorrowedByName}.`)
      .input("OldValue", sql.NVarChar(sql.MAX), JSON.stringify(asset))
      .input("NewValue", sql.NVarChar(sql.MAX), JSON.stringify({ asset: updatedAsset, borrow }))
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
      .input("ActivityType", sql.NVarChar(200), "ASSET_BORROWED")
      .input("ActivityTitle", sql.NVarChar(510), "Asset Borrowed")
      .input("ActivityDescription", sql.NVarChar(sql.MAX), `Asset ${asset.AssetTag} was borrowed by ${borrow.BorrowedByName}.`)
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

    return { borrow, asset: updatedAsset };
  } catch (error) {
    if (transaction._aborted !== true) {
      await transaction.rollback();
    }

    throw error;
  }
};

const returnBorrowedAsset = async ({
  asset,
  activeBorrow,
  targetStatusId,
  actionByUserId,
  returnNotes = null,
  returnCondition,
  returnConditionId,
  requiredParts = [],
  ipAddress = null,
}) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const borrowResult = await new sql.Request(transaction)
      .input("AssetBorrowId", sql.Int, activeBorrow.AssetBorrowId)
      .input("ReturnedByUserId", sql.Int, actionByUserId || null)
      .input("ReturnNotes", sql.NVarChar(sql.MAX), returnNotes || null)
      .input("ReturnConditionId", sql.Int, returnConditionId)
      .input("ReturnIssueTypeIdsJson", sql.NVarChar(sql.MAX), null)
      .query(`
        UPDATE dbo.ITAssetBorrows
        SET
          ReturnedAt = GETDATE(),
          ReturnedByUserId = @ReturnedByUserId,
          ReturnNotes = @ReturnNotes,
          ReturnConditionId = @ReturnConditionId,
          ReturnIssueTypeIdsJson = @ReturnIssueTypeIdsJson,
          UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE AssetBorrowId = @AssetBorrowId;
      `);

    const assetResult = await new sql.Request(transaction)
      .input("AssetId", sql.Int, asset.AssetId)
      .input("TargetStatusId", sql.Int, targetStatusId)
      .input("ReturnConditionId", sql.Int, returnConditionId)
      .query(`
        UPDATE dbo.ITAssets
        SET
          ITAssetStatusId = @TargetStatusId,
          ITAssetConditionId = @ReturnConditionId,
          CurrentAssignedUserId = NULL,
          CurrentAssignedName = NULL,
          CurrentAssignedEmployeeCode = NULL,
          CurrentAssignedEmail = NULL,
          UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE AssetId = @AssetId
          AND IsDeleted = 0;
      `);

    await new sql.Request(transaction)
      .input("AssetId", sql.Int, asset.AssetId)
      .input("OldStatusId", sql.Int, asset.ITAssetStatusId)
      .input("NewStatusId", sql.Int, targetStatusId)
      .input("ChangedBy", sql.Int, actionByUserId || null)
      .input("Notes", sql.NVarChar(sql.MAX), returnNotes || `Borrowed asset returned with condition ${returnCondition.ConditionName}.`)
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

    const borrow = borrowResult.recordset[0];
    const updatedAsset = assetResult.recordset[0];
    const partRequirements = await insertPartRequirements({
      transaction,
      assetId: asset.AssetId,
      assetBorrowId: borrow.AssetBorrowId,
      parts: requiredParts,
      requestedByUserId: actionByUserId,
      notes: returnNotes,
    });

    await new sql.Request(transaction)
      .input("UserId", sql.Int, actionByUserId || null)
      .input("ActionType", sql.NVarChar(200), "ASSET_BORROW_RETURNED")
      .input("EntityType", sql.NVarChar(200), "ITAsset")
      .input("EntityId", sql.NVarChar(200), String(asset.AssetId))
      .input("Description", sql.NVarChar(sql.MAX), `Borrowed asset ${asset.AssetTag} was returned.`)
      .input("OldValue", sql.NVarChar(sql.MAX), JSON.stringify({ asset, borrow: activeBorrow }))
      .input(
        "NewValue",
        sql.NVarChar(sql.MAX),
        JSON.stringify({ asset: updatedAsset, borrow, partRequirements })
      )
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
      .input("ActivityType", sql.NVarChar(200), "ASSET_BORROW_RETURNED")
      .input("ActivityTitle", sql.NVarChar(510), "Borrowed Asset Returned")
      .input("ActivityDescription", sql.NVarChar(sql.MAX), `Borrowed asset ${asset.AssetTag} was returned.`)
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

    return { borrow, asset: updatedAsset, partRequirements };
  } catch (error) {
    if (transaction._aborted !== true) {
      await transaction.rollback();
    }

    throw error;
  }
};

const getBorrowHistory = async ({ assetId = null, page = 1, limit = 20 }) => {
  const offset = (Number(page) - 1) * Number(limit);

  const result = await executeQuery(
    `
      SELECT
        b.*,
        a.AssetTag,
        a.ModelDescription,
        category.CategoryKey,
        category.CategoryName,
        approvedBy.FullName AS ApprovedByName,
        returnedBy.FullName AS ReturnedByName
      FROM dbo.ITAssetBorrows b
      INNER JOIN dbo.ITAssets a ON b.AssetId = a.AssetId
      LEFT JOIN dbo.ITAssetCategories category
        ON a.ITAssetCategoryId = category.ITAssetCategoryId
      LEFT JOIN dbo.Users approvedBy ON b.ApprovedByUserId = approvedBy.UserId
      LEFT JOIN dbo.Users returnedBy ON b.ReturnedByUserId = returnedBy.UserId
      WHERE a.IsDeleted = 0
        AND (@AssetId IS NULL OR b.AssetId = @AssetId)
      ORDER BY b.BorrowedAt DESC
      OFFSET @Offset ROWS
      FETCH NEXT @Limit ROWS ONLY;
    `,
    [
      { name: "AssetId", type: sql.Int, value: assetId ? Number(assetId) : null },
      { name: "Offset", type: sql.Int, value: offset },
      { name: "Limit", type: sql.Int, value: Number(limit) },
    ]
  );

  return rows(result);
};

const getActiveBorrows = async () => {
  const result = await executeQuery(`
    SELECT
      b.*,
      a.AssetTag,
      a.ModelDescription,
      category.CategoryKey,
      category.CategoryName
    FROM dbo.ITAssetBorrows b
    INNER JOIN dbo.ITAssets a ON b.AssetId = a.AssetId
    LEFT JOIN dbo.ITAssetCategories category
      ON a.ITAssetCategoryId = category.ITAssetCategoryId
    WHERE a.IsDeleted = 0
      AND b.ReturnedAt IS NULL
    ORDER BY b.BorrowedAt DESC;
  `);

  return rows(result);
};

const getOverdueBorrows = async () => {
  const result = await executeQuery(`
    SELECT
      b.*,
      a.AssetTag,
      a.ModelDescription,
      category.CategoryKey,
      category.CategoryName
    FROM dbo.ITAssetBorrows b
    INNER JOIN dbo.ITAssets a ON b.AssetId = a.AssetId
    LEFT JOIN dbo.ITAssetCategories category
      ON a.ITAssetCategoryId = category.ITAssetCategoryId
    WHERE a.IsDeleted = 0
      AND b.ReturnedAt IS NULL
      AND b.ExpectedReturnAt IS NOT NULL
      AND b.ExpectedReturnAt < GETDATE()
    ORDER BY b.ExpectedReturnAt ASC;
  `);

  return rows(result);
};

module.exports = {
  getAssetById,
  getUserById,
  getStatusByKey,
  getConditionById,
  getActiveBorrowByAssetId,
  borrowAsset,
  returnBorrowedAsset,
  getBorrowHistory,
  getActiveBorrows,
  getOverdueBorrows,
};
