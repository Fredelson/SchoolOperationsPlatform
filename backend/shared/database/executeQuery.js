// backend/shared/database/executeQuery.js

/**
 * Shared query executor.
 *
 * Purpose:
 * Gives repositories one consistent way to execute SQL queries.
 */

const { query, sql } = require("../../database");

/**
 * Executes parameterized SQL.
 *
 * @param {string} sqlText
 * @param {Array} params
 * @returns {Promise<object>}
 */
async function executeQuery(sqlText, params = []) {
  return query(sqlText, params);
}

module.exports = {
  sql,
  executeQuery,
};