/* =========================================================
   IT Asset Assignment Validator
========================================================= */

const validateAssignPayload = (req, res, next) => {
  const errors = [];
  const {
    assetId,
    assignedToUserId,
    assignedToName,
    roomId,
    departmentId,
    locationId,
  } = req.body;

  if (!assetId || Number(assetId) <= 0) errors.push("Asset is required.");

  if (!assignedToUserId && !assignedToName && !roomId && !departmentId && !locationId) {
    errors.push("Assigned user, room, department, or location is required.");
  }

  const optionalIds = {
    assignedToUserId: "Assigned user",
    roomId: "Room",
    departmentId: "Department",
    locationId: "Location",
  };

  Object.entries(optionalIds).forEach(([field, label]) => {
    const value = req.body[field];
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      Number(value) <= 0
    ) {
      errors.push(`${label} must be a valid ID.`);
    }
  });

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
