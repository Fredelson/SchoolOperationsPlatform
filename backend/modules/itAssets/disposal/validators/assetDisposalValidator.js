/* =========================================================
   IT Asset Disposal Validator
========================================================= */

const validateRequestDisposal = (req, res, next) => {
  if (!req.body.assetId) {
    return res.status(400).json({
      success: false,
      message: "Asset ID is required.",
    });
  }

  return next();
};

const validateDisposalAction = (req, res, next) => {
  if (!req.body.disposalId) {
    return res.status(400).json({
      success: false,
      message: "Disposal ID is required.",
    });
  }

  return next();
};

module.exports = {
  validateRequestDisposal,
  validateDisposalAction,
};