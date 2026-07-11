// backend/modules/assignments/controllers/assignmentController.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Assignment Controller
 * ============================================================
 *
 * Purpose:
 * Handles HTTP requests for assignment-related endpoints.
 *
 * Rules:
 * - No SQL queries here.
 * - No business rules here.
 * - Controller only receives request data and returns responses.
 * ============================================================
 */

const asyncHandler = require("../../../shared/helpers/asyncHandler");
const { sendSuccess } = require("../../../shared/helpers/apiResponse");
const assignmentService = require("../services/assignmentService");
const activityLogger = require("../../audit/services/activityLogger");
const audit=(req,action,id,oldValue=null,newValue=null)=>activityLogger.log({moduleKey:"USER_ACCESS",actionType:action,entityType:"UserAssignment",entityId:id,title:`User assignment ${action.toLowerCase()}`,oldValue,newValue,user:req.user,ipAddress:req.ip});

const getAssignments = asyncHandler(async(req,res)=>sendSuccess(res,"User assignments loaded successfully.",await assignmentService.getAssignments(req.query)));
const getAssignmentLookups = asyncHandler(async(req,res)=>sendSuccess(res,"Assignment lookups loaded successfully.",await assignmentService.getAssignmentLookups()));

/**
 * ------------------------------------------------------------
 * GET /api/assignments/types
 *
 * Returns all active assignment types.
 * ------------------------------------------------------------
 */
const getAssignmentTypes = asyncHandler(async (req, res) => {
  const data = await assignmentService.getAssignmentTypes();

  return sendSuccess(res, "Assignment types loaded successfully.", data);
});

/**
 * ------------------------------------------------------------
 * GET /api/assignments/users/:userId
 *
 * Returns all active assignments for a user.
 * ------------------------------------------------------------
 */
const getUserAssignments = asyncHandler(async (req, res) => {
  const data = await assignmentService.getUserAssignments(req.params.userId);

  return sendSuccess(res, "User assignments loaded successfully.", data);
});

/**
 * ------------------------------------------------------------
 * POST /api/assignments/users/:userId
 *
 * Creates a new assignment for a user.
 * ------------------------------------------------------------
 */
const createUserAssignment = asyncHandler(async (req, res) => {
  const data = await assignmentService.createUserAssignment(
    req.params.userId,
    req.body,
    req.user
  );
  await audit(req,"CREATE",data.userAssignmentId,null,req.body);

  return sendSuccess(res, "User assignment created successfully.", data, 201);
});

/**
 * ------------------------------------------------------------
 * PUT /api/assignments/users/:userId/:assignmentId
 *
 * Updates an existing active assignment for a user.
 * ------------------------------------------------------------
 */
const updateUserAssignment = asyncHandler(async (req, res) => {
  const data = await assignmentService.updateUserAssignment(
    req.params.userId,
    req.params.assignmentId,
    req.body
  );
  await audit(req,"UPDATE",data.userAssignmentId,null,req.body);

  return sendSuccess(res, "User assignment updated successfully.", data);
});

/**
 * ------------------------------------------------------------
 * DELETE /api/assignments/users/:userId/:assignmentId
 *
 * Soft deletes an active assignment for a user.
 * ------------------------------------------------------------
 */
const deleteUserAssignment = asyncHandler(async (req, res) => {
  const data = await assignmentService.deleteUserAssignment(
    req.params.userId,
    req.params.assignmentId
  );
  await audit(req,"DEACTIVATE",data.userAssignmentId);

  return sendSuccess(res, "User assignment deleted successfully.", data);
});

/**
 * ------------------------------------------------------------
 * PATCH /api/assignments/users/:userId/:assignmentId/primary
 *
 * Sets one active assignment as the user's primary assignment.
 * ------------------------------------------------------------
 */
const setPrimaryUserAssignment = asyncHandler(async (req, res) => {
  const data = await assignmentService.setPrimaryUserAssignment(
    req.params.userId,
    req.params.assignmentId
  );
  await audit(req,"SET_PRIMARY",data.userAssignmentId);

  return sendSuccess(res, "Primary assignment updated successfully.", data);
});
const listAssignmentTypes=asyncHandler(async(req,res)=>sendSuccess(res,"Assignment types loaded successfully.",await assignmentService.listAssignmentTypes(req.query)));
const getAssignmentType=asyncHandler(async(req,res)=>sendSuccess(res,"Assignment type loaded successfully.",await assignmentService.getAssignmentType(req.params.assignmentTypeId)));
const createAssignmentType=asyncHandler(async(req,res)=>{const data=await assignmentService.createAssignmentType(req.body);await activityLogger.log({moduleKey:"USER_ACCESS",actionType:"CREATE",entityType:"AssignmentType",entityId:data.AssignmentTypeId,title:"Assignment type created",newValue:data,user:req.user,ipAddress:req.ip});return sendSuccess(res,"Assignment type created successfully.",data,201);});
const updateAssignmentType=asyncHandler(async(req,res)=>{const oldValue=await assignmentService.getAssignmentType(req.params.assignmentTypeId);const data=await assignmentService.updateAssignmentType(req.params.assignmentTypeId,req.body);await activityLogger.log({moduleKey:"USER_ACCESS",actionType:"UPDATE",entityType:"AssignmentType",entityId:data.AssignmentTypeId,title:"Assignment type updated",oldValue,newValue:data,user:req.user,ipAddress:req.ip});return sendSuccess(res,"Assignment type updated successfully.",data);});
const activateAssignmentType=asyncHandler(async(req,res)=>{const data=await assignmentService.setAssignmentTypeActive(req.params.assignmentTypeId,true);await activityLogger.log({moduleKey:"USER_ACCESS",actionType:"ACTIVATE",entityType:"AssignmentType",entityId:data.AssignmentTypeId,title:"Assignment type activated",newValue:data,user:req.user,ipAddress:req.ip});return sendSuccess(res,"Assignment type activated successfully.",data);});
const deactivateAssignmentType=asyncHandler(async(req,res)=>{const data=await assignmentService.setAssignmentTypeActive(req.params.assignmentTypeId,false);await activityLogger.log({moduleKey:"USER_ACCESS",actionType:"DEACTIVATE",entityType:"AssignmentType",entityId:data.AssignmentTypeId,title:"Assignment type deactivated",newValue:data,user:req.user,ipAddress:req.ip});return sendSuccess(res,"Assignment type deactivated successfully.",data);});
const deleteAssignmentType=asyncHandler(async(req,res)=>{const data=await assignmentService.deleteAssignmentType(req.params.assignmentTypeId);await activityLogger.log({moduleKey:"USER_ACCESS",actionType:"DELETE",entityType:"AssignmentType",entityId:data.AssignmentTypeId,title:"Assignment type deleted",oldValue:data,user:req.user,ipAddress:req.ip});return sendSuccess(res,"Assignment type deleted successfully.",data);});

const activateUserAssignment=asyncHandler(async(req,res)=>{const data=await assignmentService.activateUserAssignment(req.params.userId,req.params.assignmentId);await audit(req,"ACTIVATE",data.userAssignmentId);return sendSuccess(res,"User assignment activated successfully.",data);});

/**
 * ============================================================
 * Exports
 * ============================================================
 */
module.exports = {
  getAssignmentTypes,
  getUserAssignments,
  createUserAssignment,
  updateUserAssignment,
  deleteUserAssignment,
  setPrimaryUserAssignment,
  getAssignments,
  getAssignmentLookups,
  activateUserAssignment,
  listAssignmentTypes,getAssignmentType,createAssignmentType,updateAssignmentType,activateAssignmentType,deactivateAssignmentType,deleteAssignmentType,
};
