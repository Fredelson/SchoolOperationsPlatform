/* =========================================================
   IT Asset Lookup Repository
   Repository → Service → Controller → Routes
========================================================= */

const { poolPromise } = require("../../../../config/db");

const getITAssetLookups = async () => {
  const pool = await poolPromise;

  const result = await pool.request().query(`
    SELECT ITAssetCategoryId, CategoryKey, CategoryName
    FROM dbo.ITAssetCategories
    ORDER BY SortOrder, CategoryName;

    SELECT ITAssetBrandId, BrandName
    FROM dbo.ITAssetBrands
    WHERE IsActive = 1
    ORDER BY BrandName;

    SELECT 
      m.ITAssetModelId,
      m.ITAssetCategoryId,
      c.CategoryName,
      m.ITAssetBrandId,
      b.BrandName,
      m.ModelName,
      m.ModelDescription
    FROM dbo.ITAssetModels m
    INNER JOIN dbo.ITAssetCategories c ON m.ITAssetCategoryId = c.ITAssetCategoryId
    LEFT JOIN dbo.ITAssetBrands b ON m.ITAssetBrandId = b.ITAssetBrandId
    WHERE m.IsActive = 1
    ORDER BY c.CategoryName, b.BrandName, m.ModelName;

    SELECT ITAssetStatusId, StatusKey, StatusName, IsFinalStatus
    FROM dbo.ITAssetStatuses
    ORDER BY SortOrder, StatusName;

    SELECT ITAssetConditionId, ConditionKey, ConditionName
    FROM dbo.ITAssetConditions
    ORDER BY SortOrder, ConditionName;

    SELECT DepartmentId, DepartmentName
    FROM dbo.Departments
    WHERE IsActive = 1
    ORDER BY DepartmentName;

    SELECT LocationId, LocationName
    FROM dbo.Locations
    WHERE IsActive = 1
    ORDER BY LocationName;

    SELECT RoomId, RoomName, LocationId
    FROM dbo.Rooms
    WHERE IsActive = 1
    ORDER BY RoomName;

    SELECT SchoolId, SchoolName
    FROM dbo.Schools
    WHERE IsActive = 1
    ORDER BY SchoolName;

    SELECT 
      u.UserId,
      u.EmployeeId,
      u.FullName,
      u.SchoolEmail,
      u.RoleId,
      r.RoleKey,
      r.RoleName,
      r.DisplayName AS RoleDisplayName
    FROM dbo.Users u
    INNER JOIN dbo.Roles r ON u.RoleId = r.RoleId
    WHERE u.IsActive = 1 AND u.IsDeleted = 0
    ORDER BY u.FullName;

    SELECT
      IssueTypeId,
      IssueCategoryId,
      IssueTypeKey,
      IssueTypeName,
      Description
    FROM dbo.ITAssetIssueTypes
    WHERE IsActive = 1
    ORDER BY IssueTypeName;
  `);

  return {
    categories: result.recordsets[0],
    brands: result.recordsets[1],
    models: result.recordsets[2],
    statuses: result.recordsets[3],
    conditions: result.recordsets[4],
    departments: result.recordsets[5],
    locations: result.recordsets[6],
    rooms: result.recordsets[7],
    schools: result.recordsets[8],
    users: result.recordsets[9],
    issueTypes: result.recordsets[10],
  };
};

module.exports = {
  getITAssetLookups,
};