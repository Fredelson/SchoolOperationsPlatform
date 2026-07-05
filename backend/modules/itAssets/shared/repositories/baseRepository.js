// ============================================================
// ARAB UNITY SCHOOL
// Operations Platform
// Base Repository Helper
// ============================================================
//
// Purpose:
// Reusable SQL helper methods for enterprise repositories.
//
// Used For:
// - Existence checks
// - Duplicate checks
// - Soft delete checks
//
// Rules:
// - SQL only
// - No business logic
// - No HTTP logic
// ============================================================

const { sql, executeQuery, firstOrNull } = require("../database");

/**
 * Checks whether a record exists in an allowed table/column.
 *
 * Security:
 * Table and column names cannot be parameterized in SQL Server,
 * so we use an allowlist to prevent SQL injection.
 */
async function existsById({ tableName, columnName, id }) {
  const allowed = {
    ITAssetCategories: "ITAssetCategoryId",
    ITAssetModels: "ITAssetModelId",
    ITAssetStatuses: "ITAssetStatusId",
    ITAssetConditions: "ITAssetConditionId",
    Departments: "DepartmentId",
    Locations: "LocationId",
    Rooms: "RoomId",
    Schools: "SchoolId",
    Users: "UserId",
    Roles: "RoleId",
    AccessLevels: "AccessLevelId",
    FeatureVisibilityStatuses: "VisibilityStatusId",
  };

  if (!allowed[tableName] || allowed[tableName] !== columnName) {
    throw new Error("Invalid repository lookup target.");
  }

  const result = await executeQuery(
    `
      SELECT TOP 1 ${columnName}
      FROM dbo.${tableName}
      WHERE ${columnName} = @Id;
    `,
    [
      {
        name: "Id",
        type: sql.Int,
        value: id,
      },
    ]
  );

  return Boolean(firstOrNull(result));
}

module.exports = {
  existsById,
};