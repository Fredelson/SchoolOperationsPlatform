const validatePermissionGroupPayload = (body = {}) => {
  const errors = [];

  if (!body.groupKey || !String(body.groupKey).trim()) {
    errors.push("Group key is required.");
  }

  if (!body.groupName || !String(body.groupName).trim()) {
    errors.push("Group name is required.");
  }

  if (
    body.sortOrder !== undefined &&
    body.sortOrder !== null &&
    Number.isNaN(Number(body.sortOrder))
  ) {
    errors.push("Sort order must be a number.");
  }

  return errors;
};

module.exports = {
  validatePermissionGroupPayload,
};