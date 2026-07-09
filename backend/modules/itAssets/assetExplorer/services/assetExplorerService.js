/* =========================================================
   ARAB UNITY SCHOOL OPERATIONS PLATFORM
   IT Asset Explorer Service
========================================================= */

const repository = require("../repositories/assetExplorerRepository");

const getCategories = async ({ search }) => {
  return repository.getCategories({ search });
};

const getBrandsByCategory = async ({ categoryId, search }) => {
  if (!categoryId) {
    throw Object.assign(new Error("Category ID is required."), {
      statusCode: 400,
    });
  }

  return repository.getBrandsByCategory({ categoryId, search });
};

const getModelsByBrand = async ({ categoryId, brandId, search }) => {
  if (!categoryId) {
    throw Object.assign(new Error("Category ID is required."), {
      statusCode: 400,
    });
  }

  if (!brandId) {
    throw Object.assign(new Error("Brand ID is required."), {
      statusCode: 400,
    });
  }

  return repository.getModelsByBrand({ categoryId, brandId, search });
};

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
  return repository.getExplorerAssets({
    search,
    categoryId,
    brandId,
    modelId,
    statusId,
    locationId,
    conditionId,
    noBrandModel,
    page,
    limit,
  });
};

const findAssetPathByTag = async ({ assetTag }) => {
  if (!assetTag) {
    throw Object.assign(new Error("Asset tag is required."), {
      statusCode: 400,
    });
  }

  return repository.findAssetPathByTag({ assetTag });
};

module.exports = {
  getCategories,
  getBrandsByCategory,
  getModelsByBrand,
  getExplorerAssets,
  findAssetPathByTag,
};