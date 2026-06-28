// ============================================================
// Arab Unity School Operations Platform
// Permission Service
// ============================================================
//
// Purpose:
// Handles business rules for Permissions.
//
// Rules:
// - No SQL
// - No HTTP handling
// - Repository only for database access
//
// ============================================================

const permissionRepository = require("../repositories/permissionRepository");

// ============================================================
// Get All Permissions
// ============================================================

const getAllPermissions = async () => {
    return await permissionRepository.getPermissions();
};

// ============================================================
// Get Permission By Id
// ============================================================

const getPermissionById = async (permissionId) => {
    const permission =
        await permissionRepository.getPermissionById(permissionId);

    if (!permission) {
        const error = new Error("Permission not found.");
        error.statusCode = 404;
        throw error;
    }

    return permission;
};

// ============================================================
// Create Permission
// ============================================================

const createPermission = async (permissionData) => {
    const duplicateKey =
        await permissionRepository.findPermissionByKey(
            permissionData.permissionKey
        );

    if (duplicateKey) {
        const error = new Error("Permission Key already exists.");
        error.statusCode = 400;
        throw error;
    }

    const duplicateName =
        await permissionRepository.findPermissionByName(
            permissionData.permissionName
        );

    if (duplicateName) {
        const error = new Error("Permission Name already exists.");
        error.statusCode = 400;
        throw error;
    }

    const module =
        await permissionRepository.findActiveModuleById(
            permissionData.moduleId
        );

    if (!module) {
        const error = new Error("Invalid Module.");
        error.statusCode = 400;
        throw error;
    }

    if (permissionData.permissionGroupId) {
        const group =
            await permissionRepository.findPermissionGroupById(
                permissionData.permissionGroupId
            );

        if (!group) {
            const error = new Error("Invalid Permission Group.");
            error.statusCode = 400;
            throw error;
        }
    }

    const permissionId =
        await permissionRepository.createPermission(permissionData);

    return await permissionRepository.getPermissionById(permissionId);
};

// ============================================================
// Update Permission
// ============================================================

const updatePermission = async (permissionId, permissionData) => {
    const existingPermission =
        await permissionRepository.findPermissionById(permissionId);

    if (!existingPermission) {
        const error = new Error("Permission not found.");
        error.statusCode = 404;
        throw error;
    }

    const duplicateKey =
        await permissionRepository.findPermissionByKey(
            permissionData.permissionKey,
            permissionId
        );

    if (duplicateKey) {
        const error = new Error("Permission Key already exists.");
        error.statusCode = 400;
        throw error;
    }

    const duplicateName =
        await permissionRepository.findPermissionByName(
            permissionData.permissionName,
            permissionId
        );

    if (duplicateName) {
        const error = new Error("Permission Name already exists.");
        error.statusCode = 400;
        throw error;
    }

    const module =
        await permissionRepository.findActiveModuleById(
            permissionData.moduleId
        );

    if (!module) {
        const error = new Error("Invalid Module.");
        error.statusCode = 400;
        throw error;
    }

    if (permissionData.permissionGroupId) {
        const group =
            await permissionRepository.findPermissionGroupById(
                permissionData.permissionGroupId
            );

        if (!group) {
            const error = new Error("Invalid Permission Group.");
            error.statusCode = 400;
            throw error;
        }
    }

    await permissionRepository.updatePermission(
        permissionId,
        permissionData
    );

    return await permissionRepository.getPermissionById(permissionId);
};

// ============================================================
// Delete Permission
// ============================================================

const deletePermission = async (permissionId) => {
    const permission =
        await permissionRepository.findPermissionById(permissionId);

    if (!permission) {
        const error = new Error("Permission not found.");
        error.statusCode = 404;
        throw error;
    }

    await permissionRepository.deactivatePermission(permissionId);

    return {
        permissionId: Number(permissionId),
        isActive: false,
    };
};

// ============================================================
// Exports
// ============================================================

module.exports = {
    getAllPermissions,
    getPermissionById,
    createPermission,
    updatePermission,
    deletePermission,
};