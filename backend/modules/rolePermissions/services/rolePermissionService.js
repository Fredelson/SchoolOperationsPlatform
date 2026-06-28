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
//
// ============================================================

const rolePermissionRepository = require("../repositories/rolePermissionRepository");

// ============================================================
// Get All Role Permissions
// ============================================================

const getRolePermissions = async () => {
    return await rolePermissionRepository.getRolePermissions();
};

// ============================================================
// Get Role Permission By Id
// ============================================================

const getRolePermissionById = async (rolePermissionId) => {
    const rolePermission =
        await rolePermissionRepository.getRolePermissionById(rolePermissionId);

    if (!rolePermission) {
        const error = new Error("Role Permission not found.");
        error.statusCode = 404;
        throw error;
    }

    return rolePermission;
};

// ============================================================
// Create Role Permission
// ============================================================

const createRolePermission = async (rolePermissionData) => {
    const role =
        await rolePermissionRepository.findActiveRoleById(
            rolePermissionData.roleId
        );

    if (!role) {
        const error = new Error("Invalid Role.");
        error.statusCode = 400;
        throw error;
    }

    const permission =
        await rolePermissionRepository.findActivePermissionById(
            rolePermissionData.permissionId
        );

    if (!permission) {
        const error = new Error("Invalid Permission.");
        error.statusCode = 400;
        throw error;
    }

    const duplicate =
        await rolePermissionRepository.findRolePermissionPair(
            rolePermissionData.roleId,
            rolePermissionData.permissionId
        );

    if (duplicate) {
        const error = new Error("Role Permission already exists.");
        error.statusCode = 400;
        throw error;
    }

    const rolePermissionId =
        await rolePermissionRepository.createRolePermission(
            rolePermissionData
        );

    return await rolePermissionRepository.getRolePermissionById(
        rolePermissionId
    );
};

// ============================================================
// Update Role Permission
// ============================================================

const updateRolePermission = async (
    rolePermissionId,
    rolePermissionData
) => {
    const existingRolePermission =
        await rolePermissionRepository.findRolePermissionById(
            rolePermissionId
        );

    if (!existingRolePermission) {
        const error = new Error("Role Permission not found.");
        error.statusCode = 404;
        throw error;
    }

    const role =
        await rolePermissionRepository.findActiveRoleById(
            rolePermissionData.roleId
        );

    if (!role) {
        const error = new Error("Invalid Role.");
        error.statusCode = 400;
        throw error;
    }

    const permission =
        await rolePermissionRepository.findActivePermissionById(
            rolePermissionData.permissionId
        );

    if (!permission) {
        const error = new Error("Invalid Permission.");
        error.statusCode = 400;
        throw error;
    }

    const duplicate =
        await rolePermissionRepository.findRolePermissionPair(
            rolePermissionData.roleId,
            rolePermissionData.permissionId,
            rolePermissionId
        );

    if (duplicate) {
        const error = new Error("Role Permission already exists.");
        error.statusCode = 400;
        throw error;
    }

    await rolePermissionRepository.updateRolePermission(
        rolePermissionId,
        rolePermissionData
    );

    return await rolePermissionRepository.getRolePermissionById(
        rolePermissionId
    );
};

// ============================================================
// Delete Role Permission
// ============================================================
//
// Note:
// RolePermissions does not contain IsActive in the verified schema.
// Therefore this module performs a hard delete.
// This matches the current database design.
//
// ============================================================

const deleteRolePermission = async (rolePermissionId) => {
    const rolePermission =
        await rolePermissionRepository.findRolePermissionById(
            rolePermissionId
        );

    if (!rolePermission) {
        const error = new Error("Role Permission not found.");
        error.statusCode = 404;
        throw error;
    }

    await rolePermissionRepository.deleteRolePermission(rolePermissionId);

    return {
        rolePermissionId: Number(rolePermissionId),
        deleted: true,
    };
};

// ============================================================
// Exports
// ============================================================

module.exports = {
    getRolePermissions,
    getRolePermissionById,
    createRolePermission,
    updateRolePermission,
    deleteRolePermission,
};