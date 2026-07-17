/* =========================================================
   IT Asset Borrow Validator
========================================================= */

const validateBorrowAsset = (req, res, next) => {
  const { assetId, borrowedByUserId, borrowedByName } = req.body;

  if (!assetId) {
    return res.status(400).json({
      success: false,
      message: "Asset ID is required.",
    });
  }

  if (!borrowedByUserId && !borrowedByName) {
    return res.status(400).json({
      success: false,
      message: "Borrower user or borrower name is required.",
    });
  }

  return next();
};

const validateReturnBorrowedAsset = (req, res, next) => {
  const { assetId, returnConditionId, requiredPartKeys } = req.body;

  if (!assetId) {
    return res.status(400).json({
      success: false,
      message: "Asset ID is required.",
    });
  }

  if (!returnConditionId) {
    return res.status(400).json({
      success: false,
      message: "Return condition is required.",
    });
  }

  if (
    requiredPartKeys !== undefined &&
    requiredPartKeys !== null &&
    !Array.isArray(requiredPartKeys)
  ) {
    return res.status(400).json({
      success: false,
      message: "Required parts must be an array.",
    });
  }

  return next();
};

module.exports = {
  validateBorrowAsset,
  validateReturnBorrowedAsset,
};
