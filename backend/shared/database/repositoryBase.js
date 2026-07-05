// backend/shared/database/repositoryBase.js

/**
 * Shared repository base helpers.
 *
 * Purpose:
 * Reduces repeated SQL result handling inside repositories.
 */

const { sql, executeQuery } = require("./executeQuery");

function firstOrNull(result) {
  return result.recordset?.[0] || null;
}

function rows(result) {
  return result.recordset || [];
}

function insertedId(result, key = "Id") {
  return result.recordset?.[0]?.[key] || null;
}

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
        value: Number(id),
      },
    ]
  );

  return Boolean(firstOrNull(result));
}

module.exports = {
  firstOrNull,
  rows,
  insertedId,
  existsById,
};