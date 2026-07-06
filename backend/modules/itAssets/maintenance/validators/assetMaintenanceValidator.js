/* =========================================================
   IT Asset Maintenance Validator
========================================================= */

const validateCreateMaintenance = (req, res, next) => {
  const { assetId, maintenanceType } = req.body;

  if (!assetId) {
    return res.status(400).json({
      success: false,
      message: "Asset ID is required.",
    });
  }

  if (!maintenanceType) {
    return res.status(400).json({
      success: false,
      message: "Maintenance type is required.",
    });
  }

  return next();
};

module.exports = {
  validateCreateMaintenance,
};