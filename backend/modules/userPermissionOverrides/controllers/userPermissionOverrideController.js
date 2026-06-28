// ============================================================
// Arab Unity School Operations Platform
// User Permission Override Controller
// ============================================================

const service = require("../services/userPermissionOverrideService");
const asyncHandler = require("../../../shared/helpers/asyncHandler");
const {
  sendSuccess,
  sendCreated,
  sendDeleted,
} = require("../../../shared/helpers/apiResponse");

// ============================================================
// GET /api/user-permission-overrides
// ============================================================

const getAllOverrides = asyncHandler(async (req, res) => {
  const data = await service.getAllOverrides();

  return sendSuccess(res, "User permission overrides retrieved successfully.", data);
});

// ============================================================
// GET /api/user-permission-overrides/user/:userId
// ============================================================

const getOverridesByUserId = asyncHandler(async (req, res) => {
  const data = await service.getOverridesByUserId(req.params.userId);

  return sendSuccess(res, "User permission overrides retrieved successfully.", data);
});

// ============================================================
// GET /api/user-permission-overrides/:id
// ============================================================

const getOverrideById = asyncHandler(async (req, res) => {
  const data = await service.getOverrideById(req.params.id);

  return sendSuccess(res, "User permission override retrieved successfully.", data);
});

// ============================================================
// POST /api/user-permission-overrides
// ============================================================

const createOverride = asyncHandler(async (req, res) => {
  const currentUserId = req.user?.id || req.user?.UserId || null;

  const data = await service.createOverride(req.body, currentUserId);

  return sendSuccess(res, "User permission override created successfully.", data, 201);
});

// ============================================================
// PUT /api/user-permission-overrides/:id
// ============================================================

const updateOverride = asyncHandler(async (req, res) => {
  const data = await service.updateOverride(req.params.id, req.body);

  return sendSuccess(res, "User permission override updated successfully.", data.after);
});

// ============================================================
// DELETE /api/user-permission-overrides/:id
// ============================================================
//
// Note:
// SQL schema has no IsActive column for this table.
// Delete is physical delete.
// ============================================================

const deleteOverride = asyncHandler(async (req, res) => {
  const data = await service.deleteOverride(req.params.id);

  return sendSuccess(res, "User permission override deleted successfully.", data);
});

module.exports = {
  getAllOverrides,
  getOverridesByUserId,
  getOverrideById,
  createOverride,
  updateOverride,
  deleteOverride,
};
