/* =========================================================
   IT Asset Assignment Validator
========================================================= */

const validateAssignPayload = (req, res, next) => {
  const errors = [];
  const { assetId, assignedToUserId, assignedToName } = req.body;

  if (!assetId || Number(assetId) <= 0) errors.push("Asset is required.");

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

const validateReturnPayload = (req, res, next) => {
  const errors = [];
  const { returnConditionId, returnIssueTypeIds } = req.body;

  if (!returnConditionId || Number(returnConditionId) <= 0) {
    errors.push("Return condition is required.");
  }

  if (
    returnIssueTypeIds !== undefined &&
    returnIssueTypeIds !== null &&
    !Array.isArray(returnIssueTypeIds)
  ) {
    errors.push("Return issue types must be an array.");
  }

  if (
    Array.isArray(returnIssueTypeIds) &&
    returnIssueTypeIds.some((id) => Number(id) <= 0)
  ) {
    errors.push("Return issue types must contain valid IDs.");
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
  validateReturnPayload,
};