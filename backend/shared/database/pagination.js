// backend/shared/database/pagination.js

/**
 * Shared pagination helper.
 *
 * Purpose:
 * Standardizes page/limit/offset calculation.
 */

function getPagination(page = 1, limit = 20) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const offset = (safePage - 1) * safeLimit;

  return {
    page: safePage,
    limit: safeLimit,
    offset,
  };
}

module.exports = {
  getPagination,
};