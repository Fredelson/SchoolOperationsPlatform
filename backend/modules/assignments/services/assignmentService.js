// backend/modules/assignments/services/assignmentService.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Assignment Service
 * ============================================================
 *
 * Purpose:
 * Contains business rules and validation flow for assignment-related
 * features before calling the repository layer.
 *
 * Rules:
 * - No SQL queries here.
 * - No HTTP response handling here.
 * - Keep validation and business decisions in this layer.
 * ============================================================
 */

const assignmentRepository = require("../repositories/assignmentRepository");

const {
  BadRequestError,
  NotFoundError,
  ConflictError,
} = require("../../../shared/errors");

const {
  validateCreateAssignmentPayload,
  validateAssignmentTypePayload,
} = require("../validators/assignmentValidator");

/**
 * Validates and converts route IDs into safe numeric values.
 */
function parseRouteId(value, label) {
  const parsed = Number(value);

  if (!parsed || Number.isNaN(parsed)) {
    throw new BadRequestError(`Valid ${label} is required.`);
  }

  return parsed;
}

/**
 * Validates the target user before assignment changes.
 */
async function validateActiveUser(userId) {
  const user = await assignmentRepository.findUserById(userId);

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  if (!user.IsActive) {
    throw new BadRequestError("Cannot assign responsibility to an inactive user.");
  }

  return user;
}

/**
 * Validates assignment type and academic year references.
 */
async function validateAssignmentReferences(data) {
  const assignmentType = await assignmentRepository.findAssignmentTypeById(
    data.assignmentTypeId
  );

  if (!assignmentType) {
    throw new NotFoundError("Assignment type not found.");
  }

  const academicYear = await assignmentRepository.findAcademicYearById(
    data.academicYearId
  );

  if (!academicYear) {
    throw new NotFoundError("Academic year not found.");
  }

  return {
    assignmentType,
    academicYear,
  };
}

/**
 * Ensures the assignment record exists, is active, and belongs to the user.
 */
async function validateUserAssignmentOwnership(userId, userAssignmentId) {
  const assignment = await assignmentRepository.findUserAssignmentById(
    userAssignmentId
  );

  if (!assignment) {
    throw new NotFoundError("User assignment not found.");
  }

  if (Number(assignment.UserId) !== Number(userId)) {
    throw new BadRequestError("This assignment does not belong to the selected user.");
  }

  return assignment;
}

/**
 * Gets active assignment types for frontend dropdowns and admin screens.
 */
async function getAssignmentTypes() {
  return assignmentRepository.getAssignmentTypes();
}

/**
 * Gets all active assignments for a user.
 */
async function getUserAssignments(userId) {
  const parsedUserId = parseRouteId(userId, "User ID");
  const items=await assignmentRepository.getUserAssignments(parsedUserId);
  for(const item of items){item.Scopes=await assignmentRepository.getScopes(item.UserAssignmentId);item.ScopeHistory=await assignmentRepository.getScopeHistory(item.UserAssignmentId);}
  return items;
}
async function listAssignmentTypes(query={}){const page=Math.max(Number(query.page)||1,1),pageSize=Math.min(Math.max(Number(query.pageSize||query.limit)||10,1),100);return assignmentRepository.listAssignmentTypes({search:String(query.search||"").trim(),status:query.status||"",page,pageSize});}
async function getAssignmentType(idValue){const record=await assignmentRepository.findAssignmentTypeAny(parseRouteId(idValue,"Assignment Type ID"));if(!record)throw new NotFoundError("Assignment type not found.");return record;}
async function uniqueAssignmentType(data,exclude=null){if(await assignmentRepository.findAssignmentTypeDuplicate(data.assignmentKey,data.assignmentName,exclude))throw new ConflictError("Assignment type key or name already exists.");}
async function createAssignmentType(payload){const data=validateAssignmentTypePayload(payload);await uniqueAssignmentType(data);return assignmentRepository.createAssignmentType(data);}
async function updateAssignmentType(idValue,payload){const id=parseRouteId(idValue,"Assignment Type ID"),current=await getAssignmentType(id);const data=validateAssignmentTypePayload(payload);if(current.IsSystemAssignment&&!data.isActive)throw new BadRequestError("System assignment types cannot be deactivated.");await uniqueAssignmentType(data,id);return assignmentRepository.updateAssignmentType(id,data);}
async function setAssignmentTypeActive(idValue,active){const current=await getAssignmentType(idValue);if(current.IsSystemAssignment&&!active)throw new BadRequestError("System assignment types cannot be deactivated.");return assignmentRepository.setAssignmentTypeActive(current.AssignmentTypeId,active);}
async function deleteAssignmentType(idValue){const current=await getAssignmentType(idValue);if(current.IsSystemAssignment)throw new BadRequestError("System assignment types cannot be deleted.");const usage=await assignmentRepository.assignmentTypeUsage(current.AssignmentTypeId);if(usage?.UsageCount)throw new ConflictError("Assignment type is already used and cannot be deleted.");await assignmentRepository.removeAssignmentType(current.AssignmentTypeId);return current;}

async function getAssignments(query = {}) {
  const page=Math.max(Number(query.page)||1,1); const pageSize=Math.min(Math.max(Number(query.pageSize||query.limit)||10,1),100);
  const status=String(query.status||"").toLowerCase();
  const result=await assignmentRepository.getAssignments({ search:String(query.search||"").trim(), assignmentTypeId:Number(query.assignmentTypeId)||null,isActive:status==="active"?true:status==="inactive"?false:null,page,pageSize });
  for(const item of result.items){item.Scopes=await assignmentRepository.getScopes(item.UserAssignmentId);item.ScopeHistory=await assignmentRepository.getScopeHistory(item.UserAssignmentId);}
  return result;
}

async function getAssignmentLookups() { return assignmentRepository.getAssignmentLookups(); }

async function activateUserAssignment(userId, userAssignmentId) {
  const parsedUserId=parseRouteId(userId,"User ID"); const parsedAssignmentId=parseRouteId(userAssignmentId,"Assignment ID");
  const assignment=await assignmentRepository.findUserAssignmentById(parsedAssignmentId, false);
  if(!assignment || Number(assignment.UserId)!==parsedUserId) throw new NotFoundError("User assignment not found.");
  await validateActiveUser(parsedUserId); await assignmentRepository.activateUserAssignment(parsedAssignmentId);
  return {userAssignmentId:parsedAssignmentId};
}
async function validateScopes(assignmentTypeId,payload){const scopes=Array.isArray(payload.scopes)?payload.scopes.map(s=>({scopeType:String(s.scopeType||""),scopeEntityId:Number(s.scopeEntityId)})):[];const rules=await assignmentRepository.getAssignmentScopeRules(assignmentTypeId),allowed=new Map(rules.map(r=>[r.ScopeType,r]));for(const s of scopes){if(!allowed.has(s.scopeType))throw new BadRequestError(`${s.scopeType} is not allowed for this assignment type.`);if(!Number.isInteger(s.scopeEntityId)||!await assignmentRepository.scopeEntityExists(s.scopeType,s.scopeEntityId))throw new BadRequestError(`Invalid ${s.scopeType} scope.`);}const keys=scopes.map(s=>`${s.scopeType}:${s.scopeEntityId}`);if(new Set(keys).size!==keys.length)throw new ConflictError("Duplicate active assignment scopes are not allowed.");for(const r of rules.filter(x=>x.IsRequired))if(!scopes.some(s=>s.scopeType===r.ScopeType))throw new BadRequestError(`${r.ScopeType} scope is required.`);return scopes;}

/**
 * Creates a new assignment for a user.
 */
async function createUserAssignment(userId, payload, currentUser) {
  const parsedUserId = parseRouteId(userId, "User ID");

  const data = validateCreateAssignmentPayload(payload);
  const scopes=await validateScopes(data.assignmentTypeId,payload);

  await validateActiveUser(parsedUserId);
  await validateAssignmentReferences(data);

  const duplicate = await assignmentRepository.findDuplicateAssignment(
    parsedUserId,
    data
  );

  if (duplicate) {
    throw new ConflictError("This user already has the same active assignment.");
  }

  if (data.isPrimary) {
    await assignmentRepository.clearPrimaryAssignment(parsedUserId);
  }

  const createdBy = currentUser?.id || currentUser?.UserId || null;

  const userAssignmentId = await assignmentRepository.createUserAssignment(
    parsedUserId,
    data,
    createdBy
  );
  await assignmentRepository.replaceScopes(userAssignmentId,scopes);

  return {
    userAssignmentId,
  };
}

/**
 * Updates an existing assignment for a user.
 */
async function updateUserAssignment(userId, userAssignmentId, payload) {
  const parsedUserId = parseRouteId(userId, "User ID");
  const parsedAssignmentId = parseRouteId(userAssignmentId, "Assignment ID");

  const data = validateCreateAssignmentPayload(payload);
  const scopes=await validateScopes(data.assignmentTypeId,payload);

  await validateActiveUser(parsedUserId);
  await validateUserAssignmentOwnership(parsedUserId, parsedAssignmentId);
  await validateAssignmentReferences(data);

  const duplicate = await assignmentRepository.findDuplicateAssignment(
    parsedUserId,
    data,
    parsedAssignmentId
  );

  if (duplicate) {
    throw new ConflictError("This user already has the same active assignment.");
  }

  if (data.isPrimary) {
    await assignmentRepository.clearPrimaryAssignment(parsedUserId);
  }

  await assignmentRepository.updateUserAssignment(parsedAssignmentId, data);
  await assignmentRepository.replaceScopes(parsedAssignmentId,scopes);

  return {
    userAssignmentId: parsedAssignmentId,
  };
}

/**
 * Soft deletes an assignment for a user.
 */
async function deleteUserAssignment(userId, userAssignmentId) {
  const parsedUserId = parseRouteId(userId, "User ID");
  const parsedAssignmentId = parseRouteId(userAssignmentId, "Assignment ID");

  await validateUserAssignmentOwnership(parsedUserId, parsedAssignmentId);

  await assignmentRepository.softDeleteUserAssignment(parsedAssignmentId);

  return {
    userAssignmentId: parsedAssignmentId,
  };
}

/**
 * Sets one active assignment as the primary assignment for a user.
 */
async function setPrimaryUserAssignment(userId, userAssignmentId) {
  const parsedUserId = parseRouteId(userId, "User ID");
  const parsedAssignmentId = parseRouteId(userAssignmentId, "Assignment ID");

  await validateActiveUser(parsedUserId);
  await validateUserAssignmentOwnership(parsedUserId, parsedAssignmentId);

  await assignmentRepository.setPrimaryUserAssignment(
    parsedUserId,
    parsedAssignmentId
  );

  return {
    userAssignmentId: parsedAssignmentId,
  };
}

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
  listAssignmentTypes,getAssignmentType,createAssignmentType,updateAssignmentType,setAssignmentTypeActive,deleteAssignmentType,
};
