const toOptionalPositiveInt = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : NaN;
};

const validateDirectTransfer = (req, res, next) => {
  if (!req.body.assetId) {
    return res.status(400).json({ success: false, message: "Asset ID is required." });
  }

  const assetId = toOptionalPositiveInt(req.body.assetId);
  const targetFields = ["toUserId", "toRoomId", "toDepartmentId", "toLocationId"];
  const targets = Object.fromEntries(
    targetFields.map((field) => [field, toOptionalPositiveInt(req.body[field])])
  );

  if (!Number.isInteger(assetId)) {
    return res.status(400).json({ success: false, message: "Asset ID must be a positive integer." });
  }

  if (Object.values(targets).some(Number.isNaN)) {
    return res.status(400).json({ success: false, message: "Transfer target IDs must be positive integers." });
  }

  if (!Object.values(targets).some(Boolean)) {
    return res.status(400).json({
      success: false,
      message: "At least one transfer target is required.",
    });
  }

  req.body = {
    ...req.body,
    assetId,
    ...targets,
    transferReason: String(req.body.transferReason || "").trim() || null,
  };

  return next();
};

module.exports = {
  validateDirectTransfer,
};
