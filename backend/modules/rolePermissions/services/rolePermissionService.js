// ============================================================
// Arab Unity School Operations Platform
// Role Permission Service
// ============================================================
//
// Purpose:
// Handles business rules for Role Permissions.
//
// Rules:
// - No SQL
// - No HTTP handling
// - Repository only for database access
// - Validator normalizes payloads
//
// ============================================================

const rolePermissionRepository = require("../repositories/rolePermissionRepository");

const {
  BadRequestError,
  ConflictError,
  NotFoundError,
} = require("../../../shared/errors");

const {
  validateRolePermissionPayload,
} = require("../validators/rolePermissionValidator");

// ============================================================
// Validate Route ID
// ============================================================

function validateRolePermissionId(rolePermissionId) {
  const parsed = Number(rolePermissionId);

  if (!parsed || Number.isNaN(parsed)) {
    throw new BadRequestError("Valid Role Permission ID is required.");
  }

  return parsed;
}

const SUPER_ADMIN_ONLY_PERMISSIONS=new Set(["workspace.configure","workspace.live_mode","workspace.live_as_user"]);
function enforceProtectedPermission(role,permission){
  if(SUPER_ADMIN_ONLY_PERMISSIONS.has(permission.PermissionKey)&&role.RoleKey!=="SuperAdmin") throw new BadRequestError("This permission is permanently restricted to Super Admin.");
}

// ============================================================
// Get All Role Permissions
// ============================================================

const getRolePermissions = async (query = {}) => {
  return await rolePermissionRepository.getRolePermissions(query);
};

// ============================================================
// Get Role Permission Lookups
// ============================================================

const getRolePermissionLookups = async () => {
  return await rolePermissionRepository.getRolePermissionLookups();
};

// ============================================================
// Get Role Permission By Id
// ============================================================

const getRolePermissionById = async (rolePermissionId) => {
  const parsedRolePermissionId = validateRolePermissionId(rolePermissionId);

  const rolePermission =
    await rolePermissionRepository.getRolePermissionById(parsedRolePermissionId);

  if (!rolePermission) {
    throw new NotFoundError("Role Permission not found.");
  }

  return rolePermission;
};

// ============================================================
// Create Role Permission
// ============================================================

const createRolePermission = async (payload) => {
  const data = validateRolePermissionPayload(payload);

  const role = await rolePermissionRepository.findActiveRoleById(data.roleId);

  if (!role) {
    throw new BadRequestError("Invalid Role.");
  }

  const permission = await rolePermissionRepository.findActivePermissionById(
    data.permissionId
  );

  if (!permission) {
    throw new BadRequestError("Invalid Permission.");
  }
  enforceProtectedPermission(role,permission);

  const duplicate = await rolePermissionRepository.findRolePermissionPair(
    data.roleId,
    data.permissionId
  );

  if (duplicate) {
    throw new ConflictError("Role Permission already exists.");
  }

  const rolePermissionId =
    await rolePermissionRepository.createRolePermission(data);

  return await rolePermissionRepository.getRolePermissionById(rolePermissionId);
};

// ============================================================
// Update Role Permission
// ============================================================

const updateRolePermission = async (rolePermissionId, payload) => {
  const parsedRolePermissionId = validateRolePermissionId(rolePermissionId);

  const data = validateRolePermissionPayload(payload);

  const existingRolePermission =
    await rolePermissionRepository.findRolePermissionById(
      parsedRolePermissionId
    );

  if (!existingRolePermission) {
    throw new NotFoundError("Role Permission not found.");
  }

  const role = await rolePermissionRepository.findActiveRoleById(data.roleId);

  if (!role) {
    throw new BadRequestError("Invalid Role.");
  }

  const permission = await rolePermissionRepository.findActivePermissionById(
    data.permissionId
  );

  if (!permission) {
    throw new BadRequestError("Invalid Permission.");
  }
  enforceProtectedPermission(role,permission);

  const duplicate = await rolePermissionRepository.findRolePermissionPair(
    data.roleId,
    data.permissionId,
    parsedRolePermissionId
  );

  if (duplicate) {
    throw new ConflictError("Role Permission already exists.");
  }

  await rolePermissionRepository.updateRolePermission(
    parsedRolePermissionId,
    data
  );

  return await rolePermissionRepository.getRolePermissionById(
    parsedRolePermissionId
  );
};

// ============================================================
// Delete Role Permission
// ============================================================
//
// RolePermissions is a mapping table.
// Hard delete is acceptable here because deleting the row removes
// the role-to-permission assignment.
//
// ============================================================

const deleteRolePermission = async (rolePermissionId) => {
  const parsedRolePermissionId = validateRolePermissionId(rolePermissionId);

  const rolePermission =
    await rolePermissionRepository.findRolePermissionById(
      parsedRolePermissionId
    );

  if (!rolePermission) {
    throw new NotFoundError("Role Permission not found.");
  }

  await rolePermissionRepository.deleteRolePermission(parsedRolePermissionId);

  return {
    rolePermissionId: parsedRolePermissionId,
    deleted: true,
  };
};

// ============================================================
// Exports
// ============================================================


const bulkGrantModulePermissions = async ({ roleId, moduleId }) => {
  const parsedRoleId = Number(roleId);
  const parsedModuleId = Number(moduleId);

  if (!parsedRoleId || !parsedModuleId) {
    throw new BadRequestError("Role and module are required.");
  }

  const role = await rolePermissionRepository.findActiveRoleById(parsedRoleId);
  if (!role) throw new BadRequestError("Invalid Role.");

  const permissions =
    await rolePermissionRepository.getActivePermissionsByModule(parsedModuleId);
  if (!permissions.length) {
    throw new BadRequestError("No active permissions found for this module.");
  }

  let granted = 0;
  for (const permission of permissions) {
    try {
      await rolePermissionRepository.createRolePermission({
        roleId: parsedRoleId,
        permissionId: permission.PermissionId,
        isAllowed: true,
      });
      granted++;
    } catch (err) {
      if (err?.code !== "23505") throw err;
    }
  }

  return {
    granted,
    total: permissions.length,
  };
};

module.exports = {
  getRolePermissions,
  getRolePermissionLookups,
  getRolePermissionById,
  createRolePermission,
  updateRolePermission,
  deleteRolePermission,
  bulkGrantModulePermissions,
};
