/* =========================================================
   ARAB UNITY SCHOOL OPERATIONS PLATFORM
   IT Asset Explorer Service

   Purpose:
   - Service layer for Asset Management hierarchy.
   - Keeps controller clean.
   - Keeps SQL inside repository only.
========================================================= */

const repository = require("../repositories/assetExplorerRepository");

/**
 * Get category cards.
 */
const getCategories = async ({ search }) => {
  return repository.getCategories({ search });
};

/**
 * Get brand cards under selected category.
 */
const getBrandsByCategory = async ({ categoryId, search }) => {
  if (!categoryId) {
    throw Object.assign(new Error("Category ID is required."), {
      statusCode: 400,
    });
  }

  return repository.getBrandsByCategory({ categoryId, search });
};

/**
 * Get model cards under selected category and brand.
 */
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

/**
 * Get explorer asset table rows.
 *
 * Filters apply only to the asset table:
 * - category
 * - brand
 * - model
 * - status
 * - location
 * - condition
 */
const getExplorerAssets = async ({
  search = "",
  categoryId = null,
  brandId = null,
  modelId = null,
  statusId = null,
  locationId = null,
  conditionId = null,
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
    page,
    limit,
  });
};

/**
 * Find exact asset hierarchy path by AssetTag.
 */
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