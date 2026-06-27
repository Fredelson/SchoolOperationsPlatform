// backend/shared/database/index.js

/**
 * Shared database utilities.
 *
 * Recommended repository usage:
 *
 * const {
 *   sql,
 *   executeQuery,
 *   firstOrNull,
 *   rows,
 *   getPagination,
 * } = require("../../../shared/database");
 */

const { sql, executeQuery } = require("./executeQuery");
const { getPagination } = require("./pagination");
const {
  firstOrNull,
  rows,
  insertedId,
} = require("./repositoryBase");

module.exports = {
  sql,
  executeQuery,
  getPagination,
  firstOrNull,
  rows,
  insertedId,
};