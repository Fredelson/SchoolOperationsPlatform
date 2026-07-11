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
const activityLogger=require("../../audit/services/activityLogger");
const audit=(req,action,id,oldValue=null,newValue=null)=>activityLogger.log({moduleKey:"USER_ACCESS",actionType:action,entityType:"UserPermissionOverride",entityId:id,title:`Permission override ${action.toLowerCase()}`,oldValue,newValue,user:req.user,ipAddress:req.ip});

// ============================================================
// GET /api/user-permission-overrides
// ============================================================

const getAllOverrides = asyncHandler(async (req, res) => {
  const data = await service.getAllOverrides(req.query);

  return sendSuccess(res, "User permission overrides retrieved successfully.", data);
});

const getLookups=asyncHandler(async(req,res)=>sendSuccess(res,"Override lookups loaded successfully.",await service.getLookups()));

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
  await audit(req,"CREATE",data.UserPermissionOverrideId,null,data);

  return sendSuccess(res, "User permission override created successfully.", data, 201);
});

// ============================================================
// PUT /api/user-permission-overrides/:id
// ============================================================

const updateOverride = asyncHandler(async (req, res) => {
  const data = await service.updateOverride(req.params.id, req.body);
  await audit(req,"UPDATE",req.params.id,data.before,data.after);

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
  await audit(req,"DELETE",req.params.id,data,null);

  return sendSuccess(res, "User permission override deleted successfully.", data);
});

module.exports = {
  getAllOverrides,
  getOverridesByUserId,
  getOverrideById,
  createOverride,
  updateOverride,
  deleteOverride,
  getLookups,
};
