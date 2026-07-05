const dashboardManagerRepository = require("../repositories/dashboardManagerRepository");

const throwError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const normalizeBoolean = (value, defaultValue = false) => {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return defaultValue;
};

const normalizeNullableNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;
  return Number(value);
};

const normalizePayload = (body) => {
  const dashboardKey = body.dashboardKey?.trim();
  const dashboardName = body.dashboardName?.trim();

  if (!dashboardKey || !dashboardName || !body.visibilityStatusId) {
    throwError("Dashboard key, dashboard name, and visibility status are required.");
  }

  return {
    dashboardKey,
    dashboardName,
    workspaceId: normalizeNullableNumber(body.workspaceId),
    roleId: normalizeNullableNumber(body.roleId),
    assignmentTypeId: normalizeNullableNumber(body.assignmentTypeId),
    moduleId: normalizeNullableNumber(body.moduleId),
    isDefault: normalizeBoolean(body.isDefault, false),
    visibilityStatusId: Number(body.visibilityStatusId),
  };
};

const validateReferences = async (data) => {
  if (data.workspaceId) {
    const exists = await dashboardManagerRepository.existsById(
      "Workspaces",
      "WorkspaceId",
      data.workspaceId
    );
    if (!exists) throwError("Selected workspace does not exist.", 400);
  }

  if (data.roleId) {
    const exists = await dashboardManagerRepository.existsById(
      "Roles",
      "RoleId",
      data.roleId
    );
    if (!exists) throwError("Selected role does not exist.", 400);
  }

  if (data.assignmentTypeId) {
    const exists = await dashboardManagerRepository.existsById(
      "AssignmentTypes",
      "AssignmentTypeId",
      data.assignmentTypeId
    );
    if (!exists) throwError("Selected assignment type does not exist.", 400);
  }

  if (data.moduleId) {
    const exists = await dashboardManagerRepository.existsById(
      "Modules",
      "ModuleId",
      data.moduleId
    );
    if (!exists) throwError("Selected module does not exist.", 400);
  }

  const visibilityExists = await dashboardManagerRepository.existsById(
    "FeatureVisibilityStatuses",
    "VisibilityStatusId",
    data.visibilityStatusId
  );

  if (!visibilityExists) {
    throwError("Selected visibility status does not exist.", 400);
  }
};

const getDashboards = async (query) => {
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;

  const filters = {
    search: query.search || "",
    workspaceId: query.workspaceId ? Number(query.workspaceId) : null,
    roleId: query.roleId ? Number(query.roleId) : null,
    assignmentTypeId: query.assignmentTypeId
      ? Number(query.assignmentTypeId)
      : null,
    moduleId: query.moduleId ? Number(query.moduleId) : null,
    visibilityStatusId: query.visibilityStatusId
      ? Number(query.visibilityStatusId)
      : null,
    isDefault:
      query.isDefault === "true"
        ? true
        : query.isDefault === "false"
        ? false
        : null,
    page,
    limit,
  };

  const result = await dashboardManagerRepository.getDashboards(filters);

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

const getDashboardById = async (dashboardId) => {
  const dashboard = await dashboardManagerRepository.getDashboardById(
    Number(dashboardId)
  );

  if (!dashboard) {
    throwError("Dashboard not found.", 404);
  }

  return dashboard;
};

const createDashboard = async (body) => {
  const data = normalizePayload(body);

  const duplicate = await dashboardManagerRepository.getDashboardByKey(
    data.dashboardKey
  );

  if (duplicate) {
    throwError("Dashboard key already exists.", 409);
  }

  await validateReferences(data);

  return await dashboardManagerRepository.createDashboard(data);
};

const updateDashboard = async (dashboardId, body) => {
  const id = Number(dashboardId);

  const current = await dashboardManagerRepository.getDashboardById(id);

  if (!current) {
    throwError("Dashboard not found.", 404);
  }

  const data = normalizePayload(body);

  const duplicate = await dashboardManagerRepository.getDashboardByKey(
    data.dashboardKey
  );

  if (duplicate && duplicate.DashboardId !== id) {
    throwError("Dashboard key already exists.", 409);
  }

  await validateReferences(data);

  return await dashboardManagerRepository.updateDashboard(id, data);
};

const deleteDashboard = async (dashboardId) => {
  const id = Number(dashboardId);

  const current = await dashboardManagerRepository.getDashboardById(id);

  if (!current) {
    throwError("Dashboard not found.", 404);
  }

  const usageCounts = await dashboardManagerRepository.getDashboardUsageCounts(id);
  const hasUsage = usageCounts.some((item) => item.Total > 0);

  if (hasUsage) {
    throwError(
      "Cannot delete this dashboard because it is already used by widgets or KPIs.",
      409
    );
  }

  return await dashboardManagerRepository.deleteDashboard(id);
};

const getDashboardLookups = async () => {
  return await dashboardManagerRepository.getDashboardLookups();
};

module.exports = {
  getDashboards,
  getDashboardById,
  createDashboard,
  updateDashboard,
  deleteDashboard,
  getDashboardLookups,
};