/* =========================================================
   ARAB UNITY SCHOOL OPERATIONS PLATFORM
   IT Asset Explorer Controller

   Purpose:
   - Handles HTTP requests for Asset Management hierarchy.
========================================================= */

const service = require("../services/assetExplorerService");

/**
 * Shared async handler for consistent API responses.
 */
const handle = (fn) => async (req, res) => {
  try {
    const data = await fn(req);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Asset Explorer request failed.",
    });
  }
};

module.exports = {
  getCategories: handle((req) =>
    service.getCategories({
      search: req.query.search || "",
    })
  ),

  getBrandsByCategory: handle((req) =>
    service.getBrandsByCategory({
      categoryId: req.params.categoryId,
      search: req.query.search || "",
    })
  ),

  getModelsByBrand: handle((req) =>
    service.getModelsByBrand({
      categoryId: req.params.categoryId,
      brandId: req.params.brandId,
      search: req.query.search || "",
    })
  ),

  getExplorerAssets: handle((req) =>
    service.getExplorerAssets({
      search: req.query.search || "",
      categoryId: req.query.categoryId || null,
      brandId: req.query.brandId || null,
      modelId: req.query.modelId || null,
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 10),
    })
  ),
};