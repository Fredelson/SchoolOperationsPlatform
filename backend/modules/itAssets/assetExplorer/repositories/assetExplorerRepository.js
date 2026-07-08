/* =========================================================
   ARAB UNITY SCHOOL OPERATIONS PLATFORM
   IT Asset Explorer Repository

   Purpose:
   - Provides SQL data for the Asset Management hierarchy.
   - Category → Brand → Model → Assets.
   - Everything is database-driven.
   - Disposed assets are excluded from Asset Management.
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
 * Get category cards for Asset Management.
 *
 * Notes:
 * - Categories come from dbo.ITAssetCategories.
 * - IconKey is used by the frontend to choose the correct icon.
 * - Counts exclude disposed assets.
 */
const getCategories = async ({ search = "" }) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
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
 * Get brand cards under one category.
 *
 * Notes:
 * - Brands come from dbo.ITAssetBrands.
 * - Only brands with assets under the selected category are returned.
 * - Counts exclude disposed assets.
 */
/**
 * Get brand/group cards under one category.
 *
 * Enterprise fallback rules:
 * - If asset has brand, group by brand.
 * - If asset has no brand but has model, group by model.
 * - If asset has no brand and no model, group as "No Brand / Model".
 */
/**
 * Get brand cards under one category.
 *
 * Rule:
 * - One card per brand.
 * - Assets without a brand are grouped under "No Brand / Model".
 * - Disposed assets are excluded.
 */
const getBrandsByCategory = async ({ categoryId, search = "" }) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
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
 * Get model cards under one category and brand.
 *
 * Notes:
 * - Models come from dbo.ITAssetModels.
 * - Only models with assets under the selected category/brand are returned.
 * - Counts exclude disposed assets.
 */
const getModelsByBrand = async ({ categoryId, brandId, search = "" }) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("CategoryId", sql.Int, Number(categoryId))
    .input("BrandId", sql.Int, Number(brandId))
    .input("Search", sql.NVarChar, `%${search}%`)
    .query(`
      SELECT
        m.ITAssetModelId,
        m.ModelName,

        SUM(
          CASE 
            WHEN UPPER(ISNULL(s.StatusKey, '')) <> 'DISPOSED' THEN 1 
            ELSE 0 
          END
        ) AS TotalAssets,

        SUM(CASE WHEN UPPER(ISNULL(s.StatusKey, '')) = 'AVAILABLE' THEN 1 ELSE 0 END) AS AvailableCount,
        SUM(CASE WHEN UPPER(ISNULL(s.StatusKey, '')) IN ('ASSIGNED', 'IN_USE') THEN 1 ELSE 0 END) AS AssignedCount,
        SUM(CASE WHEN UPPER(ISNULL(s.StatusKey, '')) = 'MAINTENANCE' THEN 1 ELSE 0 END) AS MaintenanceCount

      FROM dbo.ITAssetModels m

      LEFT JOIN dbo.ITAssets a
        ON m.ITAssetModelId = a.ITAssetModelId
        AND a.ITAssetCategoryId = @CategoryId
        AND a.IsDeleted = 0

      LEFT JOIN dbo.ITAssetStatuses s
        ON a.ITAssetStatusId = s.ITAssetStatusId
        AND UPPER(ISNULL(s.StatusKey, '')) <> 'DISPOSED'

      WHERE
        m.ITAssetBrandId = @BrandId
        AND m.IsActive = 1
        AND m.ModelName LIKE @Search

      GROUP BY
        m.ITAssetModelId,
        m.ModelName

      HAVING
      SUM(
        CASE 
          WHEN UPPER(ISNULL(s.StatusKey, '')) <> 'DISPOSED' THEN 1 
          ELSE 0 
        END
      ) > 0

      ORDER BY m.ModelName;
    `);

  return result.recordset;
};

/**
 * Get assets for the explorer table.
 *
 * Supports:
 * - category only
 * - category + brand
 * - category + brand + model
 *
 * Counts and rows exclude disposed assets.
 */
const getExplorerAssets = async ({
  search = "",
  categoryId = null,
  brandId = null,
  modelId = null,
  page = 1,
  limit = 10,
}) => {
  const pool = await poolPromise;
  const offset = (Number(page) - 1) * Number(limit);

  const result = await pool
    .request()
    .input("Search", sql.NVarChar, `%${search}%`)
    .input("CategoryId", sql.Int, categoryId ? Number(categoryId) : null)
    .input("BrandId", sql.Int, brandId ? Number(brandId) : null)
    .input("ModelId", sql.Int, modelId ? Number(modelId) : null)
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

        r.RoomName,
        d.DepartmentName,
        l.LocationName,

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
        AND (@BrandId IS NULL OR b.ITAssetBrandId = @BrandId)
        AND (@ModelId IS NULL OR a.ITAssetModelId = @ModelId)
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
        AND (@BrandId IS NULL OR b.ITAssetBrandId = @BrandId)
        AND (@ModelId IS NULL OR a.ITAssetModelId = @ModelId)
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

module.exports = {
  getCategories,
  getBrandsByCategory,
  getModelsByBrand,
  getExplorerAssets,
};