const validateTransferRequest = (req, res, next) => {
  if (!req.body.assetId) {
    return res.status(400).json({ success: false, message: "Asset ID is required." });
  }

  if (!req.body.toUserId && !req.body.toRoomId && !req.body.toDepartmentId && !req.body.toLocationId) {
    return res.status(400).json({
      success: false,
      message: "At least one transfer target is required.",
    });
  }

  return next();
};

const validateTransferAction = (req, res, next) => {
  if (!req.body.transferRequestId) {
    return res.status(400).json({
      success: false,
      message: "Transfer request ID is required.",
    });
  }

  return next();
};

module.exports = {
  validateTransferRequest,
  validateTransferAction,
};