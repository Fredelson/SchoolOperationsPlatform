// backend/database/index.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Database Exports
 * ============================================================
 *
 * Purpose:
 * Provides one clean import point for all database utilities.
 *
 * Recommended usage in repositories:
 * const { query, sql } = require("../../../database");
 * ============================================================
 */

const { sql, poolPromise } = require("./connection");
const { query } = require("./query");
const { withTransaction } = require("./transaction");

module.exports = {
  sql,
  poolPromise,
  query,
  withTransaction,
};