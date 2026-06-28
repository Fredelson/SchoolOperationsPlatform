// ============================================================
// Arab Unity School Operations Platform
// Validation Helper
// ============================================================

function isEmpty(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function required(value, fieldName) {
  if (isEmpty(value)) {
    return `${fieldName} is required.`;
  }
  return null;
}

function maxLength(value, fieldName, max) {
  if (!isEmpty(value) && String(value).length > max) {
    return `${fieldName} must not exceed ${max} characters.`;
  }
  return null;
}

function isInteger(value, fieldName) {
  if (value === undefined || value === null || Number.isInteger(Number(value))) {
    return null;
  }
  return `${fieldName} must be a valid integer.`;
}

function collectErrors(rules) {
  return rules.filter(Boolean);
}

module.exports = {
  isEmpty,
  required,
  maxLength,
  isInteger,
  collectErrors,
};