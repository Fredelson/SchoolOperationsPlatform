/* =========================================================
   IT Asset Service
========================================================= */

const itAssetRepository = require("../repositories/itAssetRepository");
const assetAuditService = require("../../shared/services/assetAuditService");
const { normalizeAssetTag } = require("../../shared/helpers/assetTagHelper");
const baseRepository = require("../../../../shared/database/repositoryBase");

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
      const exists = await baseRepository.existsById({
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

const getAssets = async (query) => {
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;

  const result = await itAssetRepository.getAssets({
    search: query.search || "",
    categoryId: query.categoryId || null,
    statusId: query.statusId || null,
    conditionId: query.conditionId || null,
    departmentId: query.departmentId || null,
    locationId: query.locationId || null,
    roomId: query.roomId || null,
    assignedUserId: query.assignedUserId || null,
    page,
    limit,
  });

  return {
    data: result.rows,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  };
};

const getAssetById = async (assetId) => {
  const asset = await itAssetRepository.getAssetById(assetId);

  if (!asset) {
    const error = new Error("IT asset not found.");
    error.statusCode = 404;
    throw error;
  }

  return asset;
};

const createAsset = async (payload, currentUser, ipAddress = null) => {
  await validateAssetReferences(payload);

  const normalizedTag = normalizeAssetTag(payload.assetTag);

  const duplicate = await itAssetRepository.getAssetByTag(normalizedTag);

  if (duplicate) {
    const error = new Error("Asset tag already exists.");
    error.statusCode = 409;
    throw error;
  }

  const createdAsset = await itAssetRepository.createAsset({
    ...payload,
    assetTag: normalizedTag,
  });

  await assetAuditService.logAssetCreated({
    asset: createdAsset,
    user: currentUser,
    ipAddress,
  });

  return createdAsset;
};

const updateAsset = async (assetId, payload, currentUser, ipAddress = null) => {
  const existingAsset = await getAssetById(assetId);

  await validateAssetReferences(payload);

  const normalizedTag = normalizeAssetTag(payload.assetTag);

  const duplicate = await itAssetRepository.getAssetByTag(
    normalizedTag,
    assetId
  );

  if (duplicate) {
    const error = new Error("Asset tag already exists.");
    error.statusCode = 409;
    throw error;
  }

  const updatedAsset = await itAssetRepository.updateAsset(assetId, {
    ...payload,
    assetTag: normalizedTag,
  });

  await assetAuditService.logAssetUpdated({
    assetId,
    oldValue: existingAsset,
    newValue: updatedAsset,
    user: currentUser,
    ipAddress,
  });

  return updatedAsset;
};

const softDeleteAsset = async (assetId, currentUser, ipAddress = null) => {
  const existingAsset = await getAssetById(assetId);

  const deletedBy =
    currentUser?.UserId || currentUser?.userId || currentUser?.id || null;

  const deletedAsset = await itAssetRepository.softDeleteAsset(
    assetId,
    deletedBy
  );

  await assetAuditService.logAssetDeleted({
    asset: existingAsset,
    user: currentUser,
    ipAddress,
  });

  return deletedAsset;
};

module.exports = {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  softDeleteAsset,
};