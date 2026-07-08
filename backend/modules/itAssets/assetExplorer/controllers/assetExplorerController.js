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
  /**
   * GET /api/it-assets/explorer/categories
   */
  getCategories: handle((req) =>
    service.getCategories({
      search: req.query.search || "",
    })
  ),

  /**
   * GET /api/it-assets/explorer/categories/:categoryId/brands
   */
  getBrandsByCategory: handle((req) =>
    service.getBrandsByCategory({
      categoryId: req.params.categoryId,
      search: req.query.search || "",
    })
  ),

  /**
   * GET /api/it-assets/explorer/categories/:categoryId/brands/:brandId/models
   */
  getModelsByBrand: handle((req) =>
    service.getModelsByBrand({
      categoryId: req.params.categoryId,
      brandId: req.params.brandId,
      search: req.query.search || "",
    })
  ),

  /**
   * GET /api/it-assets/explorer/assets
   *
   * Query filters:
   * - search
   * - categoryId
   * - brandId
   * - modelId
   * - statusId
   * - locationId
   * - conditionId
   * - page
   * - limit
   */
  getExplorerAssets: handle((req) =>
    service.getExplorerAssets({
      search: req.query.search || "",
      categoryId: req.query.categoryId || null,
      brandId: req.query.brandId || null,
      modelId: req.query.modelId || null,
      statusId: req.query.statusId || null,
      locationId: req.query.locationId || null,
      conditionId: req.query.conditionId || null,
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 10),
    })
  ),

  /**
   * GET /api/it-assets/explorer/find-by-tag
   */
  findAssetPathByTag: handle((req) =>
    service.findAssetPathByTag({
      assetTag: req.query.assetTag,
    })
  ),
};