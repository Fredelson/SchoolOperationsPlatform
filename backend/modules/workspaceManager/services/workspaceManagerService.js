/* =========================================================
   Workspace Manager Service
   Purpose:
   Handles business rules and validation for Workspace Manager.

   Architecture:
   Repository → Service → Controller → Routes
========================================================= */

const workspaceManagerRepository = require("../repositories/workspaceManagerRepository");
const permissionResolverService = require("../../permissionResolver/services/permissionResolverService");
const navigationService = require("../../navigation/services/navigationService");
const jwt = require("jsonwebtoken");

/* =========================================================
   ERROR HELPER
========================================================= */

const throwError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

/* =========================================================
   BOOLEAN NORMALIZER
========================================================= */

const normalizeBoolean = (value, defaultValue = false) => {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return defaultValue;
};

/* =========================================================
   PAYLOAD NORMALIZER
========================================================= */

const normalizePayload = (body) => {
  const workspaceKey = body.workspaceKey?.trim();
  const workspaceName = body.workspaceName?.trim();

  if (!workspaceKey || !workspaceName || !body.visibilityStatusId) {
    throwError("Workspace key, workspace name, and visibility status are required.");
  }

  return {
    workspaceKey,
    workspaceName,
    description: body.description?.trim() || null,
    icon: body.icon?.trim() || null,
    defaultRoute: body.defaultRoute?.trim() || null,
    visibilityStatusId: Number(body.visibilityStatusId),
    isDefault: normalizeBoolean(body.isDefault, false),
    sortOrder: Number(body.sortOrder || 0),
    isActive: normalizeBoolean(body.isActive, true),
  };
};

/* =========================================================
   GET WORKSPACES
========================================================= */

const getWorkspaces = async (query) => {
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;

  const filters = {
    search: query.search || "",
    visibilityStatusId: query.visibilityStatusId
      ? Number(query.visibilityStatusId)
      : null,
    isDefault:
      query.isDefault === "true"
        ? true
        : query.isDefault === "false"
        ? false
        : null,
    isActive:
      query.isActive === "true"
        ? true
        : query.isActive === "false"
        ? false
        : null,
    page,
    limit,
  };

  const result = await workspaceManagerRepository.getWorkspaces(filters);

  return {
    data: result.rows,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  };
};

/* =========================================================
   GET WORKSPACE BY ID
========================================================= */

const getWorkspaceById = async (workspaceId) => {
  const workspace = await workspaceManagerRepository.getWorkspaceById(
    Number(workspaceId)
  );

  if (!workspace) {
    throwError("Workspace not found.", 404);
  }

  return workspace;
};

/* =========================================================
   CREATE WORKSPACE
========================================================= */

const createWorkspace = async (body) => {
  const data = normalizePayload(body);

  const visibilityExists =
    await workspaceManagerRepository.visibilityStatusExists(
      data.visibilityStatusId
    );

  if (!visibilityExists) {
    throwError("Selected visibility status does not exist.", 400);
  }

  const duplicate = await workspaceManagerRepository.getWorkspaceByKey(
    data.workspaceKey
  );

  if (duplicate) {
    throwError("Workspace key already exists.", 409);
  }

  return await workspaceManagerRepository.createWorkspace(data);
};

/* =========================================================
   UPDATE WORKSPACE
========================================================= */

const updateWorkspace = async (workspaceId, body) => {
  const id = Number(workspaceId);

  const current = await workspaceManagerRepository.getWorkspaceById(id);

  if (!current) {
    throwError("Workspace not found.", 404);
  }

  const data = normalizePayload(body);

  const visibilityExists =
    await workspaceManagerRepository.visibilityStatusExists(
      data.visibilityStatusId
    );

  if (!visibilityExists) {
    throwError("Selected visibility status does not exist.", 400);
  }

  const duplicate = await workspaceManagerRepository.getWorkspaceByKey(
    data.workspaceKey
  );

  if (duplicate && duplicate.WorkspaceId !== id) {
    throwError("Workspace key already exists.", 409);
  }

  return await workspaceManagerRepository.updateWorkspace(id, data);
};

/* =========================================================
   DELETE WORKSPACE
========================================================= */

const deleteWorkspace = async (workspaceId) => {
  const id = Number(workspaceId);

  const current = await workspaceManagerRepository.getWorkspaceById(id);

  if (!current) {
    throwError("Workspace not found.", 404);
  }

  const usageCounts = await workspaceManagerRepository.getWorkspaceUsageCounts(id);

  const hasUsage = usageCounts.some((item) => item.Total > 0);

  if (hasUsage) {
    throwError(
      "Cannot delete this workspace because it is already used by menus, dashboards, users, or workspace roles.",
      409
    );
  }

  return await workspaceManagerRepository.deleteWorkspace(id);
};

/* =========================================================
   GET LOOKUPS
========================================================= */

const getWorkspaceLookups = async () => {
  return await workspaceManagerRepository.getWorkspaceLookups();
};

const getWorkspaceConfiguration = async (workspaceId) => {
  await getWorkspaceById(workspaceId);
  return workspaceManagerRepository.getWorkspaceConfiguration(Number(workspaceId));
};

const replaceAssignments = async (workspaceId, assignmentType, body) => {
  await getWorkspaceById(workspaceId);
  const items=Array.isArray(body?.items)?body.items:[];
  const ids=items.map(item=>Number(item.id));
  if (ids.some(id=>!Number.isInteger(id)||id<=0)) throwError("Every assignment requires a valid ID.");
  if (new Set(ids).size!==ids.length) throwError("Duplicate assignments are not allowed.",409);
  return workspaceManagerRepository.replaceAssignments(Number(workspaceId),assignmentType,items);
};

const getUserPreview = async (userId) => {
  const user=await workspaceManagerRepository.getPreviewUser(Number(userId));
  if (!user) throwError("Preview user not found or inactive.",404);
  const [permissions,sidebar,configuration]=await Promise.all([
    permissionResolverService.resolveUserPermissions(user.UserId),
    navigationService.getMySidebar({id:user.UserId}),
    user.WorkspaceId ? workspaceManagerRepository.getWorkspaceConfiguration(user.WorkspaceId) : null,
  ]);
  return {mode:"preview",readOnly:true,user,workspace:configuration?.workspace||null,sidebar,configuration,permissions};
};

const startLiveMode = async (actor, body) => {
  const actorRole=String(actor?.roleKey||actor?.role||"").replace(/[\s_-]/g,"").toLowerCase();
  if(actorRole!=="superadmin") throwError("Live Mode is restricted to Super Admin.",403);
  const reason=String(body?.reason||"").trim(); if(reason.length<10) throwError("A troubleshooting reason of at least 10 characters is required.");
  const target=await workspaceManagerRepository.getPreviewUser(Number(body?.targetUserId)); if(!target) throwError("Target user not found or inactive.",404);
  const session=await workspaceManagerRepository.createLiveSession(Number(actor.id||actor.UserId),target.UserId,reason);
  const token=jwt.sign({id:target.UserId,employeeId:target.EmployeeId,fullName:target.FullName,roleId:target.RoleId,roleKey:target.RoleKey,role:target.RoleKey,departmentId:target.DepartmentId,sectionId:target.SectionId,schoolId:target.SchoolId,defaultWorkspaceId:target.WorkspaceId,liveMode:true,liveSessionId:session.LiveSessionId,actorUserId:Number(actor.id||actor.UserId),actorName:actor.fullName,reason},process.env.JWT_SECRET,{expiresIn:"60m"});
  return {token,session,target,expiresInMinutes:60};
};
const exitLiveMode = async (actor,sessionId) => {
  const data=await workspaceManagerRepository.closeLiveSession(sessionId,Number(actor.id||actor.UserId));
  if(!data) throwError("Active Live Mode session not found.",404); return data;
};

/* =========================================================
   EXPORT SERVICE
========================================================= */

module.exports = {
  getWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceLookups,
  getWorkspaceConfiguration,
  replaceAssignments,
  getUserPreview,
  startLiveMode,
  exitLiveMode,
};
