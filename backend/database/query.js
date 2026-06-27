// backend/database/query.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Query Helper
 * ============================================================
 *
 * Purpose:
 * Provides a reusable parameterized query function.
 *
 * Used by:
 * - Repositories
 * - Feature modules
 *
 * Security:
 * - Uses request.input() to prevent SQL injection.
 * ============================================================
 */

const { sql, poolPromise } = require("./connection");

/**
 * Executes a SQL query with optional parameters.
 *
 * @param {string} sqlText - SQL query text.
 * @param {Array} params - Query parameters.
 * @returns {Promise<object>} MSSQL query result.
 */
async function query(sqlText, params = []) {
  const pool = await poolPromise;
  const request = pool.request();

  params.forEach((param) => {
    request.input(param.name, param.type, param.value);
  });

  return request.query(sqlText);
}

module.exports = {
  sql,
  query,
};