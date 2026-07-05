/* =========================================================
   IT Asset Query Service

   Purpose:
   Handles read-only asset operations.
========================================================= */

const itAssetRepository = require("../repositories/itAssetRepository");

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

module.exports = {
  getAssets,
  getAssetById,
};