/* =========================================================
   IT Asset Controller
========================================================= */

const itAssetService = require("../services/itAssetService");

const getAssets = async (req, res) => {
  try {
    const result = await itAssetService.getAssets(req.query);

    return res.status(200).json({
      success: true,
      message: "IT assets loaded successfully.",
      ...result,
    });
  } catch (error) {
    console.error("Get IT Assets Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load IT assets.",
    });
  }
};

const getAssetById = async (req, res) => {
  try {
    const asset = await itAssetService.getAssetById(req.params.id);

    return res.status(200).json({
      success: true,
      message: "IT asset loaded successfully.",
      data: asset,
    });
  } catch (error) {
    console.error("Get IT Asset By ID Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load IT asset.",
    });
  }
};

const createAsset = async (req, res) => {
  try {
    const asset = await itAssetService.createAsset(
      req.body,
      req.user,
      req.ip
    );

    return res.status(201).json({
      success: true,
      message: "IT asset created successfully.",
      data: asset,
    });
  } catch (error) {
    console.error("Create IT Asset Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create IT asset.",
    });
  }
};

const updateAsset = async (req, res) => {
  try {
    const asset = await itAssetService.updateAsset(
      req.params.id,
      req.body,
      req.user,
      req.ip
    );

    return res.status(200).json({
      success: true,
      message: "IT asset updated successfully.",
      data: asset,
    });
  } catch (error) {
    console.error("Update IT Asset Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update IT asset.",
    });
  }
};

const deleteAsset = async (req, res) => {
  try {
    const asset = await itAssetService.softDeleteAsset(
      req.params.id,
      req.user,
      req.ip
    );

    return res.status(200).json({
      success: true,
      message: "IT asset deleted successfully.",
      data: asset,
    });
  } catch (error) {
    console.error("Delete IT Asset Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to delete IT asset.",
    });
  }
};

const exportAssets = async (req, res) => {
  try {
    const result = await itAssetService.exportAssets();

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=ITAssetsExport.csv"
    );

    return res.send(result.csv);
  } catch (error) {
    console.error("Export IT Assets Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to export IT assets.",
    });
  }
};

module.exports = {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  exportAssets,
};