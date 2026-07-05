/* =========================================================
   IT Asset Validation Service
========================================================= */

const repositoryBase = require("../../../../shared/database/repositoryBase");

const validateAssetReferences = async (payload) => {
  const validations = [
    {
      value: payload.itAssetCategoryId,
      tableName: "ITAssetCategories",
      columnName: "ITAssetCategoryId",
      message: "Invalid asset category.",
      required: true,
    },
    {
      value: payload.itAssetStatusId,
      tableName: "ITAssetStatuses",
      columnName: "ITAssetStatusId",
      message: "Invalid asset status.",
      required: true,
    },
    {
      value: payload.itAssetModelId,
      tableName: "ITAssetModels",
      columnName: "ITAssetModelId",
      message: "Invalid asset model.",
    },
    {
      value: payload.itAssetConditionId,
      tableName: "ITAssetConditions",
      columnName: "ITAssetConditionId",
      message: "Invalid asset condition.",
    },
    {
      value: payload.currentAssignedUserId,
      tableName: "Users",
      columnName: "UserId",
      message: "Invalid assigned user.",
    },
    {
      value: payload.currentDepartmentId,
      tableName: "Departments",
      columnName: "DepartmentId",
      message: "Invalid department.",
    },
    {
      value: payload.currentLocationId,
      tableName: "Locations",
      columnName: "LocationId",
      message: "Invalid location.",
    },
    {
      value: payload.currentRoomId,
      tableName: "Rooms",
      columnName: "RoomId",
      message: "Invalid room.",
    },
    {
      value: payload.schoolId,
      tableName: "Schools",
      columnName: "SchoolId",
      message: "Invalid school.",
    },
  ];

  for (const item of validations) {
    const hasValue =
      item.value !== undefined && item.value !== null && item.value !== "";

    if (item.required && !hasValue) {
      const error = new Error(item.message);
      error.statusCode = 400;
      throw error;
    }

    if (hasValue) {
      const exists = await repositoryBase.existsById({
        tableName: item.tableName,
        columnName: item.columnName,
        id: item.value,
      });

      if (!exists) {
        const error = new Error(item.message);
        error.statusCode = 400;
        throw error;
      }
    }
  }
};

module.exports = {
  validateAssetReferences,
};