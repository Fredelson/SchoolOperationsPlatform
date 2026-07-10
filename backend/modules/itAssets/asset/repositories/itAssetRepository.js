/* =========================================================
   IT Asset Repository
   Repository → Service → Controller → Routes

   Purpose:
   Handles SQL operations for the main ITAssets table.

   Enterprise Rules:
   - Asset Management must NOT show disposed assets.
   - Disposed assets remain in the database for audit/history.
   - Brand is loaded through Model:
     ITAssets → ITAssetModels → ITAssetBrands

   Rules:
   - SQL only
   - No business logic
   - No HTTP logic
   - No audit logic here
========================================================= */

const { poolPromise, sql } = require("../../../../config/db");

/**
 * Get paginated IT assets for Asset Management.
 *
 * Important:
 * - Excludes soft-deleted assets.
 * - Excludes DISPOSED assets from normal Asset Management.
 * - Includes BrandName by joining ITAssetBrands through ITAssetModels.
 */
const getAssets = async ({
  search = "",
  categoryId = null,
  statusId = null,
  conditionId = null,
  departmentId = null,
  locationId = null,
  roomId = null,
  assignedUserId = null,
  page = 1,
  limit = 10,
}) => {
  const pool = await poolPromise;
  const offset = (page - 1) * limit;

  const request = pool.request();

  request.input("Search", sql.NVarChar, `%${search}%`);
  request.input("CategoryId", sql.Int, categoryId);
  request.input("StatusId", sql.Int, statusId);
  request.input("ConditionId", sql.Int, conditionId);
  request.input("DepartmentId", sql.Int, departmentId);
  request.input("LocationId", sql.Int, locationId);
  request.input("RoomId", sql.Int, roomId);
  request.input("AssignedUserId", sql.Int, assignedUserId);
  request.input("Offset", sql.Int, offset);
  request.input("Limit", sql.Int, limit);

  const result = await request.query(`
    /* =====================================================
       Result Set 1:
       Paginated Asset Management list.
    ===================================================== */
    SELECT
      a.AssetId,
      a.AssetTag,

      a.ITAssetCategoryId,
      c.CategoryName,

      a.ITAssetModelId,
      m.ModelName,

      /* Brand comes from the selected model */
      b.ITAssetBrandId,
      b.BrandName,

      a.ModelDescription,
      a.SerialIpMac,

      a.ITAssetStatusId,
      s.StatusName,
      s.StatusKey,

      a.ITAssetConditionId,
      con.ConditionName,

      a.CurrentAssignedUserId,
      u.FullName AS CurrentAssignedUserName,

      a.CurrentAssignedName,
      a.CurrentAssignedEmployeeCode,
      a.CurrentAssignedEmail,

      a.CurrentRoomId,
      r.RoomName,

      a.CurrentDepartmentId,
      d.DepartmentName,

      a.CurrentLocationId,
      l.LocationName,

      a.AcquiredChangedDate,
      a.PreviousOwner,
      a.IsActive,
      a.CreatedAt,
      a.UpdatedAt
    FROM dbo.ITAssets a
    INNER JOIN dbo.ITAssetCategories c
      ON a.ITAssetCategoryId = c.ITAssetCategoryId
    LEFT JOIN dbo.ITAssetModels m
      ON a.ITAssetModelId = m.ITAssetModelId
    LEFT JOIN dbo.ITAssetBrands b
      ON m.ITAssetBrandId = b.ITAssetBrandId
    INNER JOIN dbo.ITAssetStatuses s
      ON a.ITAssetStatusId = s.ITAssetStatusId
    LEFT JOIN dbo.ITAssetConditions con
      ON a.ITAssetConditionId = con.ITAssetConditionId
    LEFT JOIN dbo.Users u
      ON a.CurrentAssignedUserId = u.UserId
    LEFT JOIN dbo.Rooms r
      ON a.CurrentRoomId = r.RoomId
    LEFT JOIN dbo.Departments d
      ON a.CurrentDepartmentId = d.DepartmentId
    LEFT JOIN dbo.Locations l
      ON a.CurrentLocationId = l.LocationId
    WHERE
      a.IsDeleted = 0

      /* Hide disposed assets from normal Asset Management */
      AND UPPER(ISNULL(s.StatusKey, '')) <> 'DISPOSED'

      AND (
        a.AssetTag LIKE @Search
        OR ISNULL(a.ModelDescription, '') LIKE @Search
        OR ISNULL(a.SerialIpMac, '') LIKE @Search
        OR ISNULL(a.CurrentAssignedName, '') LIKE @Search
        OR ISNULL(a.CurrentAssignedEmployeeCode, '') LIKE @Search
        OR ISNULL(a.CurrentAssignedEmail, '') LIKE @Search
        OR ISNULL(b.BrandName, '') LIKE @Search
        OR ISNULL(m.ModelName, '') LIKE @Search
        OR ISNULL(c.CategoryName, '') LIKE @Search
      )
      AND (@CategoryId IS NULL OR a.ITAssetCategoryId = @CategoryId)
      AND (@StatusId IS NULL OR a.ITAssetStatusId = @StatusId)
      AND (@ConditionId IS NULL OR a.ITAssetConditionId = @ConditionId)
      AND (@DepartmentId IS NULL OR a.CurrentDepartmentId = @DepartmentId)
      AND (@LocationId IS NULL OR a.CurrentLocationId = @LocationId)
      AND (@RoomId IS NULL OR a.CurrentRoomId = @RoomId)
      AND (@AssignedUserId IS NULL OR a.CurrentAssignedUserId = @AssignedUserId)
    ORDER BY a.AssetId DESC
    OFFSET @Offset ROWS
    FETCH NEXT @Limit ROWS ONLY;

    /* =====================================================
       Result Set 2:
       Total count for pagination.
       Must match the same filters above.
    ===================================================== */
    SELECT COUNT(*) AS Total
    FROM dbo.ITAssets a
    INNER JOIN dbo.ITAssetCategories c
      ON a.ITAssetCategoryId = c.ITAssetCategoryId
    LEFT JOIN dbo.ITAssetModels m
      ON a.ITAssetModelId = m.ITAssetModelId
    LEFT JOIN dbo.ITAssetBrands b
      ON m.ITAssetBrandId = b.ITAssetBrandId
    INNER JOIN dbo.ITAssetStatuses s
      ON a.ITAssetStatusId = s.ITAssetStatusId
    WHERE
      a.IsDeleted = 0

      /* Hide disposed assets from normal Asset Management */
      AND UPPER(ISNULL(s.StatusKey, '')) <> 'DISPOSED'

      AND (
        a.AssetTag LIKE @Search
        OR ISNULL(a.ModelDescription, '') LIKE @Search
        OR ISNULL(a.SerialIpMac, '') LIKE @Search
        OR ISNULL(a.CurrentAssignedName, '') LIKE @Search
        OR ISNULL(a.CurrentAssignedEmployeeCode, '') LIKE @Search
        OR ISNULL(a.CurrentAssignedEmail, '') LIKE @Search
        OR ISNULL(b.BrandName, '') LIKE @Search
        OR ISNULL(m.ModelName, '') LIKE @Search
        OR ISNULL(c.CategoryName, '') LIKE @Search
      )
      AND (@CategoryId IS NULL OR a.ITAssetCategoryId = @CategoryId)
      AND (@StatusId IS NULL OR a.ITAssetStatusId = @StatusId)
      AND (@ConditionId IS NULL OR a.ITAssetConditionId = @ConditionId)
      AND (@DepartmentId IS NULL OR a.CurrentDepartmentId = @DepartmentId)
      AND (@LocationId IS NULL OR a.CurrentLocationId = @LocationId)
      AND (@RoomId IS NULL OR a.CurrentRoomId = @RoomId)
      AND (@AssignedUserId IS NULL OR a.CurrentAssignedUserId = @AssignedUserId);
  `);

  return {
    rows: result.recordsets[0],
    total: result.recordsets[1][0].Total,
  };
};

/**
 * Get one asset by ID.
 *
 * Important:
 * - Do NOT exclude DISPOSED here.
 * - Disposed assets must still be viewable from the Disposal module.
 */
const getAssetById = async (assetId) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("AssetId", sql.Int, assetId)
    .query(`
      SELECT
        a.*,

        c.CategoryName,

        b.ITAssetBrandId,
        b.BrandName,

        m.ModelName,

        s.StatusKey,
        s.StatusName,

        con.ConditionName,

        u.FullName AS CurrentAssignedUserName,

        r.RoomName,
        d.DepartmentName,
        l.LocationName,
        sch.SchoolName
      FROM dbo.ITAssets a
      LEFT JOIN dbo.ITAssetCategories c
        ON a.ITAssetCategoryId = c.ITAssetCategoryId
      LEFT JOIN dbo.ITAssetModels m
        ON a.ITAssetModelId = m.ITAssetModelId
      LEFT JOIN dbo.ITAssetBrands b
        ON m.ITAssetBrandId = b.ITAssetBrandId
      LEFT JOIN dbo.ITAssetStatuses s
        ON a.ITAssetStatusId = s.ITAssetStatusId
      LEFT JOIN dbo.ITAssetConditions con
        ON a.ITAssetConditionId = con.ITAssetConditionId
      LEFT JOIN dbo.Users u
        ON a.CurrentAssignedUserId = u.UserId
      LEFT JOIN dbo.Rooms r
        ON a.CurrentRoomId = r.RoomId
      LEFT JOIN dbo.Departments d
        ON a.CurrentDepartmentId = d.DepartmentId
      LEFT JOIN dbo.Locations l
        ON a.CurrentLocationId = l.LocationId
      LEFT JOIN dbo.Schools sch
        ON a.SchoolId = sch.SchoolId
      WHERE a.AssetId = @AssetId
        AND a.IsDeleted = 0;
    `);

  return result.recordset[0];
};

/**
 * Find asset by AssetTag.
 *
 * Used for duplicate validation.
 * Does not exclude DISPOSED because AssetTag should remain unique.
 */
const getAssetByTag = async (assetTag, excludeAssetId = null) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("AssetTag", sql.NVarChar, assetTag)
    .input("ExcludeAssetId", sql.Int, excludeAssetId)
    .query(`
      SELECT TOP 1 AssetId, AssetTag
      FROM dbo.ITAssets
      WHERE AssetTag = @AssetTag
        AND IsDeleted = 0
        AND (@ExcludeAssetId IS NULL OR AssetId <> @ExcludeAssetId);
    `);

  return result.recordset[0];
};

/**
 * Create a new IT asset.
 */
const createAsset = async (data) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("AssetTag", sql.NVarChar(200), data.assetTag)
    .input("ITAssetCategoryId", sql.Int, data.itAssetCategoryId)
    .input("ITAssetModelId", sql.Int, data.itAssetModelId || null)
    .input("ModelDescription", sql.NVarChar(510), data.modelDescription || null)
    .input("SerialIpMac", sql.NVarChar(510), data.serialIpMac || null)
    .input("ITAssetStatusId", sql.Int, data.itAssetStatusId)
    .input("ITAssetConditionId", sql.Int, data.itAssetConditionId || null)
    .input("CurrentAssignedUserId", sql.Int, data.currentAssignedUserId || null)
    .input("CurrentAssignedName", sql.NVarChar(510), data.currentAssignedName || null)
    .input("CurrentAssignedEmployeeCode", sql.NVarChar(100), data.currentAssignedEmployeeCode || null)
    .input("CurrentAssignedEmail", sql.NVarChar(510), data.currentAssignedEmail || null)
    .input("CurrentRoomId", sql.Int, data.currentRoomId || null)
    .input("CurrentDepartmentId", sql.Int, data.currentDepartmentId || null)
    .input("CurrentLocationId", sql.Int, data.currentLocationId || null)
    .input("AcquiredChangedDate", sql.Date, data.acquiredChangedDate || null)
    .input("PreviousOwner", sql.NVarChar(510), data.previousOwner || null)
    .input("SchoolId", sql.Int, data.schoolId || null)
    .query(`
      INSERT INTO dbo.ITAssets
      (
        AssetTag,
        ITAssetCategoryId,
        ITAssetModelId,
        ModelDescription,
        SerialIpMac,
        ITAssetStatusId,
        ITAssetConditionId,
        CurrentAssignedUserId,
        CurrentAssignedName,
        CurrentAssignedEmployeeCode,
        CurrentAssignedEmail,
        CurrentRoomId,
        CurrentDepartmentId,
        CurrentLocationId,
        AcquiredChangedDate,
        PreviousOwner,
        IsActive,
        CreatedAt,
        UpdatedAt,
        IsDeleted,
        SchoolId
      )
      OUTPUT INSERTED.*
      VALUES
      (
        @AssetTag,
        @ITAssetCategoryId,
        @ITAssetModelId,
        @ModelDescription,
        @SerialIpMac,
        @ITAssetStatusId,
        @ITAssetConditionId,
        @CurrentAssignedUserId,
        @CurrentAssignedName,
        @CurrentAssignedEmployeeCode,
        @CurrentAssignedEmail,
        @CurrentRoomId,
        @CurrentDepartmentId,
        @CurrentLocationId,
        @AcquiredChangedDate,
        @PreviousOwner,
        1,
        GETDATE(),
        NULL,
        0,
        @SchoolId
      );
    `);

  return result.recordset[0];
};

/**
 * Update an existing IT asset.
 */
const updateAsset = async (assetId, data) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("AssetId", sql.Int, assetId)
    .input("AssetTag", sql.NVarChar(200), data.assetTag)
    .input("ITAssetCategoryId", sql.Int, data.itAssetCategoryId)
    .input("ITAssetModelId", sql.Int, data.itAssetModelId || null)
    .input("ModelDescription", sql.NVarChar(510), data.modelDescription || null)
    .input("SerialIpMac", sql.NVarChar(510), data.serialIpMac || null)
    .input("ITAssetStatusId", sql.Int, data.itAssetStatusId)
    .input("ITAssetConditionId", sql.Int, data.itAssetConditionId || null)
    .input("CurrentAssignedUserId", sql.Int, data.currentAssignedUserId || null)
    .input("CurrentAssignedName", sql.NVarChar(510), data.currentAssignedName || null)
    .input("CurrentAssignedEmployeeCode", sql.NVarChar(100), data.currentAssignedEmployeeCode || null)
    .input("CurrentAssignedEmail", sql.NVarChar(510), data.currentAssignedEmail || null)
    .input("CurrentRoomId", sql.Int, data.currentRoomId || null)
    .input("CurrentDepartmentId", sql.Int, data.currentDepartmentId || null)
    .input("CurrentLocationId", sql.Int, data.currentLocationId || null)
    .input("AcquiredChangedDate", sql.Date, data.acquiredChangedDate || null)
    .input("PreviousOwner", sql.NVarChar(510), data.previousOwner || null)
    .input("SchoolId", sql.Int, data.schoolId || null)
    .query(`
      UPDATE dbo.ITAssets
      SET
        AssetTag = @AssetTag,
        ITAssetCategoryId = @ITAssetCategoryId,
        ITAssetModelId = @ITAssetModelId,
        ModelDescription = @ModelDescription,
        SerialIpMac = @SerialIpMac,
        ITAssetStatusId = @ITAssetStatusId,
        ITAssetConditionId = @ITAssetConditionId,
        CurrentAssignedUserId = @CurrentAssignedUserId,
        CurrentAssignedName = @CurrentAssignedName,
        CurrentAssignedEmployeeCode = @CurrentAssignedEmployeeCode,
        CurrentAssignedEmail = @CurrentAssignedEmail,
        CurrentRoomId = @CurrentRoomId,
        CurrentDepartmentId = @CurrentDepartmentId,
        CurrentLocationId = @CurrentLocationId,
        AcquiredChangedDate = @AcquiredChangedDate,
        PreviousOwner = @PreviousOwner,
        SchoolId = @SchoolId,
        UpdatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE AssetId = @AssetId
        AND IsDeleted = 0;
    `);

  return result.recordset[0];
};

/**
 * Soft-delete an IT asset.
 *
 * Soft delete is different from disposal.
 */
const softDeleteAsset = async (assetId, deletedBy) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("AssetId", sql.Int, assetId)
    .input("DeletedBy", sql.Int, deletedBy || null)
    .query(`
      UPDATE dbo.ITAssets
      SET
        IsDeleted = 1,
        IsActive = 0,
        DeletedAt = GETDATE(),
        DeletedBy = @DeletedBy,
        UpdatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE AssetId = @AssetId
        AND IsDeleted = 0;
    `);

  return result.recordset[0];
};

module.exports = {
  getAssets,
  getAssetById,
  getAssetByTag,
  createAsset,
  updateAsset,
  softDeleteAsset,
};
