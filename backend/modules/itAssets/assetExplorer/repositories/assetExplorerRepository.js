/* =========================================================
   ARAB UNITY SCHOOL OPERATIONS PLATFORM
   IT Asset Explorer Repository

   Purpose:
   - Provides SQL data for Asset Management hierarchy.
   - Category → Brand → Model → Assets.
   - Supports special "No Brand / Model" grouping.
   - Disposed assets are excluded from Asset Management.

   Rules:
   - SQL only in Repository.
   - No business logic.
   - No HTTP logic.
========================================================= */

const { poolPromise, sql } = require("../../../../config/db");

/**
 * Shared SQL rule:
 * Asset Management excludes disposed and soft-deleted assets.
 */
const ACTIVE_ASSET_FILTER = `
  a.IsDeleted = 0
  AND UPPER(ISNULL(s.StatusKey, '')) <> 'DISPOSED'
`;

/**
 * Shared table/card filters.
 */
const TABLE_FILTER_SQL = `
  AND (@StatusId IS NULL OR a.ITAssetStatusId = @StatusId)
  AND (@LocationId IS NULL OR a.CurrentLocationId = @LocationId)
  AND (@ConditionId IS NULL OR a.ITAssetConditionId = @ConditionId)
`;

/**
 * Adds common filter SQL inputs.
 */
const addFilterInputs = (request, filters = {}) => {
  return request
    .input("StatusId", sql.Int, filters.statusId ? Number(filters.statusId) : null)
    .input("LocationId", sql.Int, filters.locationId ? Number(filters.locationId) : null)
    .input("ConditionId", sql.Int, filters.conditionId ? Number(filters.conditionId) : null);
};

/**
 * Get category cards.
 */
const getCategories = async ({
  search = "",
  statusId = null,
  locationId = null,
  conditionId = null,
}) => {
  const pool = await poolPromise;

  const request = addFilterInputs(pool.request(), {
    statusId,
    locationId,
    conditionId,
  });

  const result = await request
    .input("Search", sql.NVarChar, `%${search}%`)
    .query(`
      SELECT
        c.ITAssetCategoryId,
        c.CategoryName,
        c.IconKey,

        COUNT(a.AssetId) AS TotalAssets,

        SUM(CASE WHEN UPPER(ISNULL(s.StatusKey, '')) = 'AVAILABLE' THEN 1 ELSE 0 END) AS AvailableCount,
        SUM(CASE WHEN UPPER(ISNULL(s.StatusKey, '')) IN ('ASSIGNED', 'IN_USE') THEN 1 ELSE 0 END) AS AssignedCount,
        SUM(CASE WHEN UPPER(ISNULL(s.StatusKey, '')) = 'MAINTENANCE' THEN 1 ELSE 0 END) AS MaintenanceCount,

        COUNT(DISTINCT b.ITAssetBrandId) AS BrandCount,

        COUNT(DISTINCT
          CASE
            WHEN m.ITAssetModelId IS NOT NULL THEN CAST(m.ITAssetModelId AS NVARCHAR(100))
            WHEN NULLIF(LTRIM(RTRIM(a.ModelDescription)), '') IS NOT NULL THEN LTRIM(RTRIM(a.ModelDescription))
            ELSE NULL
          END
        ) AS ModelCount

      FROM dbo.ITAssetCategories c

      INNER JOIN dbo.ITAssets a
        ON c.ITAssetCategoryId = a.ITAssetCategoryId
        AND a.IsDeleted = 0

      INNER JOIN dbo.ITAssetStatuses s
        ON a.ITAssetStatusId = s.ITAssetStatusId
        AND UPPER(ISNULL(s.StatusKey, '')) <> 'DISPOSED'

      LEFT JOIN dbo.ITAssetModels m
        ON a.ITAssetModelId = m.ITAssetModelId

      LEFT JOIN dbo.ITAssetBrands b
        ON m.ITAssetBrandId = b.ITAssetBrandId

      WHERE
        c.CategoryName LIKE @Search
        ${TABLE_FILTER_SQL}

      GROUP BY
        c.ITAssetCategoryId,
        c.CategoryName,
        c.IconKey

      HAVING COUNT(a.AssetId) > 0

      ORDER BY c.CategoryName;
    `);

  return result.recordset;
};

/**
 * Get brand cards under selected category.
 */
const getBrandsByCategory = async ({
  categoryId,
  search = "",
  statusId = null,
  locationId = null,
  conditionId = null,
}) => {
  const pool = await poolPromise;

  const request = addFilterInputs(pool.request(), {
    statusId,
    locationId,
    conditionId,
  });

  const result = await request
    .input("CategoryId", sql.Int, Number(categoryId))
    .input("Search", sql.NVarChar, `%${search}%`)
    .query(`
      SELECT
        CASE
          WHEN b.ITAssetBrandId IS NULL THEN 'NO_BRAND_MODEL'
          ELSE 'BRAND'
        END AS GroupType,

        b.ITAssetBrandId,

        CASE
          WHEN b.ITAssetBrandId IS NULL THEN 'No Brand / Model'
          ELSE b.BrandName
        END AS BrandName,

        CASE
          WHEN b.ITAssetBrandId IS NULL THEN 'No Brand / Model'
          ELSE b.BrandName
        END AS DisplayName,

        COUNT(a.AssetId) AS TotalAssets,

        SUM(CASE WHEN UPPER(ISNULL(s.StatusKey, '')) = 'AVAILABLE' THEN 1 ELSE 0 END) AS AvailableCount,
        SUM(CASE WHEN UPPER(ISNULL(s.StatusKey, '')) IN ('ASSIGNED', 'IN_USE') THEN 1 ELSE 0 END) AS AssignedCount,
        SUM(CASE WHEN UPPER(ISNULL(s.StatusKey, '')) = 'MAINTENANCE' THEN 1 ELSE 0 END) AS MaintenanceCount,

        COUNT(DISTINCT
          CASE
            WHEN m.ITAssetModelId IS NOT NULL THEN CAST(m.ITAssetModelId AS NVARCHAR(100))
            WHEN NULLIF(LTRIM(RTRIM(a.ModelDescription)), '') IS NOT NULL THEN LTRIM(RTRIM(a.ModelDescription))
            ELSE NULL
          END
        ) AS ModelCount

      FROM dbo.ITAssets a

      INNER JOIN dbo.ITAssetStatuses s
        ON a.ITAssetStatusId = s.ITAssetStatusId
        AND UPPER(ISNULL(s.StatusKey, '')) <> 'DISPOSED'

      LEFT JOIN dbo.ITAssetModels m
        ON a.ITAssetModelId = m.ITAssetModelId

      LEFT JOIN dbo.ITAssetBrands b
        ON m.ITAssetBrandId = b.ITAssetBrandId

      WHERE
        a.IsDeleted = 0
        AND a.ITAssetCategoryId = @CategoryId
        ${TABLE_FILTER_SQL}
        AND (
          ISNULL(b.BrandName, '') LIKE @Search
          OR ISNULL(a.ModelDescription, '') LIKE @Search
          OR 'No Brand / Model' LIKE @Search
        )

      GROUP BY
        CASE
          WHEN b.ITAssetBrandId IS NULL THEN 'NO_BRAND_MODEL'
          ELSE 'BRAND'
        END,
        b.ITAssetBrandId,
        CASE
          WHEN b.ITAssetBrandId IS NULL THEN 'No Brand / Model'
          ELSE b.BrandName
        END

      HAVING COUNT(a.AssetId) > 0

      ORDER BY DisplayName;
    `);

  return result.recordset;
};

/**
 * Get model cards under selected category and brand.
 *
 * Note:
 * - Normal brands have real models.
 * - "No Brand / Model" does not call this endpoint because it has no BrandId.
 */
const getModelsByBrand = async ({
  categoryId,
  brandId,
  search = "",
  statusId = null,
  locationId = null,
  conditionId = null,
}) => {
  const pool = await poolPromise;

  const request = addFilterInputs(pool.request(), {
    statusId,
    locationId,
    conditionId,
  });

  const result = await request
    .input("CategoryId", sql.Int, Number(categoryId))
    .input("BrandId", sql.Int, Number(brandId))
    .input("Search", sql.NVarChar, `%${search}%`)
    .query(`
      SELECT
        m.ITAssetModelId,
        m.ModelName,

        COUNT(a.AssetId) AS TotalAssets,

        SUM(CASE WHEN UPPER(ISNULL(s.StatusKey, '')) = 'AVAILABLE' THEN 1 ELSE 0 END) AS AvailableCount,
        SUM(CASE WHEN UPPER(ISNULL(s.StatusKey, '')) IN ('ASSIGNED', 'IN_USE') THEN 1 ELSE 0 END) AS AssignedCount,
        SUM(CASE WHEN UPPER(ISNULL(s.StatusKey, '')) = 'MAINTENANCE' THEN 1 ELSE 0 END) AS MaintenanceCount

      FROM dbo.ITAssetModels m

      INNER JOIN dbo.ITAssets a
        ON m.ITAssetModelId = a.ITAssetModelId
        AND a.ITAssetCategoryId = @CategoryId
        AND a.IsDeleted = 0

      INNER JOIN dbo.ITAssetStatuses s
        ON a.ITAssetStatusId = s.ITAssetStatusId
        AND UPPER(ISNULL(s.StatusKey, '')) <> 'DISPOSED'

      WHERE
        m.ITAssetBrandId = @BrandId
        AND m.IsActive = 1
        AND m.ModelName LIKE @Search
        ${TABLE_FILTER_SQL}

      GROUP BY
        m.ITAssetModelId,
        m.ModelName

      HAVING COUNT(a.AssetId) > 0

      ORDER BY m.ModelName;
    `);

  return result.recordset;
};

/**
 * Get assets for table.
 *
 * Important:
 * - Normal brand filtering uses BrandId.
 * - "No Brand / Model" uses NoBrandModel flag.
 */
const getExplorerAssets = async ({
  search = "",
  categoryId = null,
  brandId = null,
  modelId = null,
  statusId = null,
  locationId = null,
  conditionId = null,
  noBrandModel = false,
  page = 1,
  limit = 10,
}) => {
  const pool = await poolPromise;
  const offset = (Number(page) - 1) * Number(limit);

  const request = addFilterInputs(pool.request(), {
    statusId,
    locationId,
    conditionId,
  });

  const result = await request
    .input("Search", sql.NVarChar, `%${search}%`)
    .input("CategoryId", sql.Int, categoryId ? Number(categoryId) : null)
    .input("BrandId", sql.Int, brandId ? Number(brandId) : null)
    .input("ModelId", sql.Int, modelId ? Number(modelId) : null)
    .input("NoBrandModel", sql.Bit, noBrandModel ? 1 : 0)
    .input("Offset", sql.Int, offset)
    .input("Limit", sql.Int, Number(limit))
    .query(`
      SELECT
        a.AssetId,
        a.AssetTag,
        a.ITAssetCategoryId,
        c.CategoryName,
        b.ITAssetBrandId,
        b.BrandName,
        a.ITAssetModelId,
        m.ModelName,
        a.ModelDescription,
        a.SerialIpMac,
        a.ITAssetStatusId,
        s.StatusName,
        s.StatusKey,
        a.ITAssetConditionId,
        con.ConditionName,
        a.CurrentAssignedName,
        a.CurrentAssignedEmployeeCode,
        a.CurrentAssignedEmail,
        a.CurrentLocationId,
        l.LocationName,
        a.CurrentRoomId,
        r.RoomName,
        a.CurrentDepartmentId,
        d.DepartmentName,
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

      LEFT JOIN dbo.Rooms r
        ON a.CurrentRoomId = r.RoomId

      LEFT JOIN dbo.Departments d
        ON a.CurrentDepartmentId = d.DepartmentId

      LEFT JOIN dbo.Locations l
        ON a.CurrentLocationId = l.LocationId

      WHERE
        ${ACTIVE_ASSET_FILTER}
        AND (@CategoryId IS NULL OR a.ITAssetCategoryId = @CategoryId)

        /* Special selected card: No Brand / Model */
        AND (
          @NoBrandModel = 0
          OR b.ITAssetBrandId IS NULL
        )

        /* Normal brand filtering */
        AND (
          @NoBrandModel = 1
          OR @BrandId IS NULL
          OR b.ITAssetBrandId = @BrandId
        )

        AND (@ModelId IS NULL OR a.ITAssetModelId = @ModelId)
        ${TABLE_FILTER_SQL}

        AND (
          a.AssetTag LIKE @Search
          OR ISNULL(c.CategoryName, '') LIKE @Search
          OR ISNULL(b.BrandName, '') LIKE @Search
          OR ISNULL(m.ModelName, '') LIKE @Search
          OR ISNULL(a.ModelDescription, '') LIKE @Search
          OR ISNULL(a.SerialIpMac, '') LIKE @Search
          OR ISNULL(a.CurrentAssignedName, '') LIKE @Search
          OR ISNULL(a.CurrentAssignedEmployeeCode, '') LIKE @Search
        )

      ORDER BY a.AssetId DESC
      OFFSET @Offset ROWS
      FETCH NEXT @Limit ROWS ONLY;

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
        ${ACTIVE_ASSET_FILTER}
        AND (@CategoryId IS NULL OR a.ITAssetCategoryId = @CategoryId)

        /* Special selected card: No Brand / Model */
        AND (
          @NoBrandModel = 0
          OR b.ITAssetBrandId IS NULL
        )

        /* Normal brand filtering */
        AND (
          @NoBrandModel = 1
          OR @BrandId IS NULL
          OR b.ITAssetBrandId = @BrandId
        )

        AND (@ModelId IS NULL OR a.ITAssetModelId = @ModelId)
        ${TABLE_FILTER_SQL}

        AND (
          a.AssetTag LIKE @Search
          OR ISNULL(c.CategoryName, '') LIKE @Search
          OR ISNULL(b.BrandName, '') LIKE @Search
          OR ISNULL(m.ModelName, '') LIKE @Search
          OR ISNULL(a.ModelDescription, '') LIKE @Search
          OR ISNULL(a.SerialIpMac, '') LIKE @Search
          OR ISNULL(a.CurrentAssignedName, '') LIKE @Search
          OR ISNULL(a.CurrentAssignedEmployeeCode, '') LIKE @Search
        );
    `);

  return {
    rows: result.recordsets[0],
    total: result.recordsets[1][0].Total,
  };
};

/**
 * Find exact asset path by AssetTag.
 */
const findAssetPathByTag = async ({ assetTag }) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("AssetTag", sql.NVarChar(200), assetTag)
    .query(`
      SELECT TOP 1
        a.AssetId,
        a.AssetTag,
        c.ITAssetCategoryId,
        c.CategoryName,
        c.IconKey,
        b.ITAssetBrandId,
        b.BrandName,
        m.ITAssetModelId,
        m.ModelName,
        a.ModelDescription,
        s.StatusKey,
        s.StatusName
      FROM dbo.ITAssets a
      INNER JOIN dbo.ITAssetCategories c
        ON a.ITAssetCategoryId = c.ITAssetCategoryId
      INNER JOIN dbo.ITAssetStatuses s
        ON a.ITAssetStatusId = s.ITAssetStatusId
      LEFT JOIN dbo.ITAssetModels m
        ON a.ITAssetModelId = m.ITAssetModelId
      LEFT JOIN dbo.ITAssetBrands b
        ON m.ITAssetBrandId = b.ITAssetBrandId
      WHERE
        a.IsDeleted = 0
        AND UPPER(ISNULL(s.StatusKey, '')) <> 'DISPOSED'
        AND UPPER(a.AssetTag) = UPPER(@AssetTag);
    `);

  return result.recordset[0] || null;
};

module.exports = {
  getCategories,
  getBrandsByCategory,
  getModelsByBrand,
  getExplorerAssets,
  findAssetPathByTag,
};