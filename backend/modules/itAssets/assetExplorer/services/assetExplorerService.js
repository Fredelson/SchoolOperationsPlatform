/* =========================================================
   ARAB UNITY SCHOOL OPERATIONS PLATFORM
   IT Asset Explorer Service

   Purpose:
   - Service layer for Asset Management hierarchy.
   - Keeps controller clean.
   - Keeps SQL inside repository only.
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
  search,
  categoryId,
  brandId,
  modelId,
  page,
  limit,
}) => {
  return repository.getExplorerAssets({
    search,
    categoryId,
    brandId,
    modelId,
    page,
    limit,
  });
};

module.exports = {
  getCategories,
  getBrandsByCategory,
  getModelsByBrand,
  getExplorerAssets,
};