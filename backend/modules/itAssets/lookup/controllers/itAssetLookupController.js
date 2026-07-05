/* =========================================================
   IT Asset Lookup Controller
========================================================= */

const itAssetLookupService = require("../services/itAssetLookupService");

const getITAssetLookups = async (req, res) => {
  try {
    const lookups = await itAssetLookupService.getITAssetLookups();

    return res.status(200).json({
      success: true,
      message: "IT Asset lookups loaded successfully.",
      data: lookups,
    });
  } catch (error) {
    console.error("Get IT Asset Lookups Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load IT Asset lookups.",
    });
  }
};

module.exports = {
  getITAssetLookups,
};