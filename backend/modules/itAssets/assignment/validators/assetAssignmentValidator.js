/* =========================================================
   IT Asset Assignment Validator
========================================================= */

const validateAssignPayload = (req, res, next) => {
  const errors = [];

  const { assetId, assignedToUserId, assignedToName } = req.body;

  if (!assetId || Number(assetId) <= 0) {
    errors.push("Asset is required.");
  }

  if (!assignedToUserId && !assignedToName) {
    errors.push("Assigned user or assigned name is required.");
  }

  if (
    assignedToUserId !== undefined &&
    assignedToUserId !== null &&
    assignedToUserId !== "" &&
    Number(assignedToUserId) <= 0
  ) {
    errors.push("Assigned user must be a valid ID.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors,
    });
  }

  return next();
};

module.exports = {
  validateAssignPayload,
};