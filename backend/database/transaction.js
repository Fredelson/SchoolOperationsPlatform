// backend/database/transaction.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Transaction Helper
 * ============================================================
 *
 * Purpose:
 * Provides a reusable SQL transaction wrapper.
 *
 * Use this when multiple database actions must succeed or fail together.
 *
 * Example:
 * - Create request
 * - Insert approval log
 * - Deduct inventory
 * ============================================================
 */

const { sql, poolPromise } = require("./connection");

/**
 * Runs database logic inside a transaction.
 *
 * @param {Function} callback - Function that receives the transaction object.
 * @returns {Promise<any>} Callback result.
 */
async function withTransaction(callback) {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const result = await callback(transaction);

    await transaction.commit();

    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = {
  sql,
  withTransaction,
};