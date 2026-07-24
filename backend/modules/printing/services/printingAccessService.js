const { poolPromise, sql } = require("../../../config/db");

const CAPABILITIES = Object.freeze({
  CREATE_REQUEST: "CREATE_REQUEST",
  VIEW_OWN_REQUESTS: "VIEW_OWN_REQUESTS",
  APPROVE_HOD: "APPROVE_HOD",
  APPROVE_HOS: "APPROVE_HOS",
  MANAGE_QUEUE: "MANAGE_QUEUE",
  VIEW_INVENTORY: "VIEW_INVENTORY",
  MANAGE_INVENTORY: "MANAGE_INVENTORY",
  MANAGE_LIMITS: "MANAGE_LIMITS",
  MANAGE_SETTINGS: "MANAGE_SETTINGS",
  VIEW_REPORTS: "VIEW_REPORTS",
});

const normalize = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

const groupAssignments = (rows) => {
  const assignments = new Map();

  for (const row of rows || []) {
    if (!assignments.has(row.UserAssignmentId)) {
      assignments.set(row.UserAssignmentId, {
        userAssignmentId: row.UserAssignmentId,
        assignmentKey: row.AssignmentKey,
        isPrimary: Boolean(row.IsPrimary),
        scopes: [],
      });
    }

    if (row.ScopeType) {
      assignments.get(row.UserAssignmentId).scopes.push({
        scopeType: row.ScopeType,
        scopeEntityId: Number(row.ScopeEntityId),
      });
    }
  }

  return [...assignments.values()];
};

const getActorContext = async (userId) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("UserId", sql.Int, Number(userId))
    .query(`
      SELECT
        u.UserId,
        u.SchoolId,
        u.DepartmentId,
        u.SectionId,
        r.RoleKey
      FROM dbo.Users u
      JOIN dbo.Roles r ON r.RoleId = u.RoleId
      WHERE u.UserId = @UserId
        AND u.IsActive = 1
        AND ISNULL(u.IsDeleted, 0) = 0;

      SELECT
        ua.UserAssignmentId,
        ua.IsPrimary,
        at.AssignmentKey,
        scopes.ScopeType,
        scopes.ScopeEntityId
      FROM dbo.UserAssignments ua
      JOIN dbo.AssignmentTypes at
        ON at.AssignmentTypeId = ua.AssignmentTypeId
       AND at.IsActive = 1
      LEFT JOIN dbo.UserAssignmentScopes scopes
        ON scopes.UserAssignmentId = ua.UserAssignmentId
       AND scopes.IsActive = 1
      WHERE ua.UserId = @UserId
        AND ua.IsActive = 1
        AND (ua.StartDate IS NULL OR ua.StartDate <= CAST(GETDATE() AS date))
        AND (ua.EndDate IS NULL OR ua.EndDate >= CAST(GETDATE() AS date))
      ORDER BY ua.IsPrimary DESC, ua.CreatedAt, scopes.ScopeType;
    `);

  const user = result.recordsets[0]?.[0];

  if (!user) {
    const error = new Error("The authenticated user is inactive or unavailable.");
    error.statusCode = 401;
    throw error;
  }

  return {
    userId: Number(user.UserId),
    schoolId: Number(user.SchoolId || 1),
    departmentId: user.DepartmentId ? Number(user.DepartmentId) : null,
    sectionId: user.SectionId ? Number(user.SectionId) : null,
    roleKey: user.RoleKey,
    assignments: groupAssignments(result.recordsets[1]),
  };
};

const hasAssignment = (actor, assignmentKeys) => {
  const allowed = new Set(
    (Array.isArray(assignmentKeys) ? assignmentKeys : [assignmentKeys]).map(
      normalize
    )
  );

  return actor.assignments.some((assignment) =>
    allowed.has(normalize(assignment.assignmentKey))
  );
};

const hasScopedAssignment = (
  actor,
  assignmentKey,
  { departmentId = null, sectionId = null, subjectId = null } = {}
) => {
  return actor.assignments.some((assignment) => {
    if (normalize(assignment.assignmentKey) !== normalize(assignmentKey)) {
      return false;
    }

    const scopes = assignment.scopes || [];
    const scopesOfType = (scopeType) =>
      scopes.filter(
        (scope) => normalize(scope.scopeType) === normalize(scopeType)
      );
    const matchesIfScoped = (scopeType, entityId) => {
      const typedScopes = scopesOfType(scopeType);
      if (!typedScopes.length) return true;
      if (!entityId) return false;
      return typedScopes.some(
        (scope) => Number(scope.scopeEntityId) === Number(entityId)
      );
    };

    const normalizedKey = normalize(assignment.assignmentKey);
    const departmentScopes = scopesOfType("Department");
    const sectionScopes = scopesOfType("Section");

    if (normalizedKey === "HOD") {
      if (
        !departmentId ||
        !departmentScopes.some(
          (scope) => Number(scope.scopeEntityId) === Number(departmentId)
        )
      ) {
        return false;
      }
    } else if (["HOS", "SECRETARY"].includes(normalizedKey)) {
      const hasOrganizationalScope =
        departmentScopes.length > 0 || sectionScopes.length > 0;
      const organizationalMatch =
        departmentScopes.some(
          (scope) => Number(scope.scopeEntityId) === Number(departmentId)
        ) ||
        sectionScopes.some(
          (scope) => Number(scope.scopeEntityId) === Number(sectionId)
        );

      if (hasOrganizationalScope && !organizationalMatch) return false;
    } else if (!matchesIfScoped("Department", departmentId)) {
      return false;
    }

    return (
      matchesIfScoped("Section", sectionId) &&
      matchesIfScoped("Subject", subjectId)
    );
  });
};

const isPlatformAdministrator = (actor) =>
  ["SUPERADMIN", "PLATFORMADMIN"].includes(normalize(actor.roleKey));

const isPrintingOperator = (actor) =>
  isPlatformAdministrator(actor) ||
  normalize(actor.roleKey) === "PRINTINGADMIN" ||
  hasAssignment(actor, "PRINTING_COORDINATOR");

const can = (actor, capability) => {
  if (isPlatformAdministrator(actor)) return true;

  switch (capability) {
    case CAPABILITIES.CREATE_REQUEST:
    case CAPABILITIES.VIEW_OWN_REQUESTS:
      return true;
    case CAPABILITIES.APPROVE_HOD:
      return hasAssignment(actor, "HOD");
    case CAPABILITIES.APPROVE_HOS:
      return hasAssignment(actor, ["HOS", "SECRETARY"]);
    case CAPABILITIES.MANAGE_QUEUE:
    case CAPABILITIES.VIEW_INVENTORY:
    case CAPABILITIES.MANAGE_INVENTORY:
    case CAPABILITIES.MANAGE_SETTINGS:
    case CAPABILITIES.VIEW_REPORTS:
      return isPrintingOperator(actor);
    case CAPABILITIES.MANAGE_LIMITS:
      return (
        isPrintingOperator(actor) ||
        hasAssignment(actor, ["HOS", "SECRETARY"])
      );
    default:
      return false;
  }
};

const assertCapability = (actor, capability) => {
  if (can(actor, capability)) return;

  const error = new Error("You are not authorized for this printing action.");
  error.statusCode = 403;
  throw error;
};

module.exports = {
  CAPABILITIES,
  getActorContext,
  hasAssignment,
  hasScopedAssignment,
  isPlatformAdministrator,
  isPrintingOperator,
  can,
  assertCapability,
};
