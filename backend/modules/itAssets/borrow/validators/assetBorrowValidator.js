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
  const { assetId } = req.body;

  if (!assetId) {
    return res.status(400).json({
      success: false,
      message: "Asset ID is required.",
    });
  }

  return next();
};

module.exports = {
  validateBorrowAsset,
  validateReturnBorrowedAsset,
};