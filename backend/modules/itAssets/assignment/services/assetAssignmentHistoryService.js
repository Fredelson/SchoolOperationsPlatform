/* =========================================================
   IT Asset Assignment History Service
========================================================= */

const repository = require("../repositories/assetAssignmentHistoryRepository");

const buildPagination = ({ page, limit, total }) => ({
  page: Number(page),
  limit: Number(limit),
  total,
  totalPages: Math.ceil(total / Number(limit)),
});

const getAssignmentHistory = async ({ assetId = null, page = 1, limit = 20 }) => {
  const data = await repository.getAssignmentHistory({ assetId, page, limit });
  const total = await repository.countAssignmentHistory({ assetId });

  return {
    data,
    pagination: buildPagination({ page, limit, total }),
  };
};

const getActiveAssignments = async ({ page = 1, limit = 20 }) => {
  const data = await repository.getActiveAssignments({ page, limit });
  const total = await repository.countActiveAssignments();

  return {
    data,
    pagination: buildPagination({ page, limit, total }),
  };
};

const getStatusHistory = async ({ assetId = null, page = 1, limit = 20 }) => {
  const data = await repository.getStatusHistory({ assetId, page, limit });
  const total = await repository.countStatusHistory({ assetId });

  return {
    data,
    pagination: buildPagination({ page, limit, total }),
  };
};

module.exports = {
  getAssignmentHistory,
  getActiveAssignments,
  getStatusHistory,
};