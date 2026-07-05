/* =========================================================
   Workspace Manager Service
   Purpose:
   Handles business rules and validation for Workspace Manager.

   Architecture:
   Repository → Service → Controller → Routes
========================================================= */

const workspaceManagerRepository = require("../repositories/workspaceManagerRepository");

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
};