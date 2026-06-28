// ============================================================
// Arab Unity School Operations Platform
// Entity Validator
// ============================================================

const serviceError = require("./serviceError");

async function ensureExists(findFunction, id, entityName) {
  const record = await findFunction(id);

  if (!record) {
    throw serviceError.notFound(`${entityName} not found.`);
  }

  return record;
}

async function ensureActive(findFunction, id, entityName) {
  const record = await ensureExists(findFunction, id, entityName);

  if (record.IsActive === false || record.IsActive === 0) {
    throw serviceError.badRequest(`${entityName} is inactive.`);
  }

  return record;
}

module.exports = {
  ensureExists,
  ensureActive,
};