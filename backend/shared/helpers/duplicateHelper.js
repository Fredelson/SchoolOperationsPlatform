// ============================================================
// Arab Unity School Operations Platform
// Duplicate Helper
// ============================================================

const serviceError = require("./serviceError");

async function preventDuplicate(checkFunction, message) {
  const duplicate = await checkFunction();

  if (duplicate) {
    throw serviceError.conflict(message);
  }
}

module.exports = {
  preventDuplicate,
};