// backend/shared/database/repositoryBase.js

/**
 * Shared repository base helpers.
 *
 * Purpose:
 * Reduces repeated SQL result handling inside repositories.
 */

function firstOrNull(result) {
  return result.recordset?.[0] || null;
}

function rows(result) {
  return result.recordset || [];
}

function insertedId(result, key = "Id") {
  return result.recordset?.[0]?.[key] || null;
}

module.exports = {
  firstOrNull,
  rows,
  insertedId,
};