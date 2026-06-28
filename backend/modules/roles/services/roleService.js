// ============================================================
// Arab Unity School Operations Platform
// Role Service
// ============================================================
//
// Purpose:
// Handles all business logic related to Roles.
//
// Architecture:
//
// Repository
//      ↓
// Service (Business Rules)
//      ↓
// Controller
//
// Rules:
//
// • No SQL
// • No HTTP responses
// • Validate business rules
// • Call Repository
//
// ============================================================

const roleRepository = require("../repositories/roleRepository");

const {
    BadRequestError,
    ConflictError,
    NotFoundError,
} = require("../../../shared/errors");

const {
    validateRolePayload,
} = require("../validators/roleValidator");

// ============================================================
// Validate Route ID
// ============================================================
//
// Ensures route parameters contain valid IDs.
//
// ============================================================

function validateRoleId(roleId) {

    const parsed = Number(roleId);

    if (!parsed || Number.isNaN(parsed)) {
        throw new BadRequestError("Valid Role ID is required.");
    }

    return parsed;

}

// ============================================================
// Get All Roles
// ============================================================

async function getRoles() {

    return await roleRepository.getRoles();

}

// ============================================================
// Get Role By ID
// ============================================================

async function getRoleById(roleId) {

    const parsedRoleId = validateRoleId(roleId);

    const role = await roleRepository.getRoleById(parsedRoleId);

    if (!role) {
        throw new NotFoundError("Role not found.");
    }

    return role;

}

// ============================================================
// Create Role
// ============================================================

async function createRole(payload) {

    // -----------------------------------------
    // Validate payload
    // -----------------------------------------

    const data = validateRolePayload(payload);

    // -----------------------------------------
    // Validate Access Level
    // -----------------------------------------

    const accessLevel =
        await roleRepository.findAccessLevelById(
            data.accessLevelId
        );

    if (!accessLevel) {
        throw new NotFoundError(
            "Access Level not found."
        );
    }

    // -----------------------------------------
    // Duplicate Role Key
    // -----------------------------------------

    const duplicateKey =
        await roleRepository.findRoleByKey(
            data.roleKey
        );

    if (duplicateKey) {
        throw new ConflictError(
            "Role Key already exists."
        );
    }

    // -----------------------------------------
    // Duplicate Role Name
    // -----------------------------------------

    const duplicateName =
        await roleRepository.findRoleByName(
            data.roleName
        );

    if (duplicateName) {
        throw new ConflictError(
            "Role Name already exists."
        );
    }

    // -----------------------------------------
    // Create Role
    // -----------------------------------------

    const roleId =
        await roleRepository.createRole(data);

    return await roleRepository.getRoleById(roleId);

}

// ============================================================
// Update Role
// ============================================================
//
// Purpose:
// Updates an existing Role.
//
// Business Rules:
//
// ✓ Role must exist
// ✓ Access Level must exist
// ✓ RoleKey must be unique
// ✓ RoleName must be unique
// ✓ Protected Roles cannot be modified
// ============================================================

async function updateRole(roleId, payload) {

    const parsedRoleId = validateRoleId(roleId);

    // -----------------------------------------
    // Validate payload
    // -----------------------------------------

    const data = validateRolePayload(payload);

    // -----------------------------------------
    // Check Role Exists
    // -----------------------------------------

    const existingRole =
        await roleRepository.findRoleById(
            parsedRoleId
        );

    if (!existingRole) {
        throw new NotFoundError(
            "Role not found."
        );
    }

    // -----------------------------------------
    // Protected Role
    // -----------------------------------------

    if (existingRole.IsProtected) {
        throw new BadRequestError(
            "Protected Roles cannot be modified."
        );
    }

    // -----------------------------------------
    // Validate Access Level
    // -----------------------------------------

    const accessLevel =
        await roleRepository.findAccessLevelById(
            data.accessLevelId
        );

    if (!accessLevel) {
        throw new NotFoundError(
            "Access Level not found."
        );
    }

    // -----------------------------------------
    // Duplicate Role Key
    // -----------------------------------------

    const duplicateKey =
        await roleRepository.findRoleByKey(
            data.roleKey,
            parsedRoleId
        );

    if (duplicateKey) {
        throw new ConflictError(
            "Role Key already exists."
        );
    }

    // -----------------------------------------
    // Duplicate Role Name
    // -----------------------------------------

    const duplicateName =
        await roleRepository.findRoleByName(
            data.roleName,
            parsedRoleId
        );

    if (duplicateName) {
        throw new ConflictError(
            "Role Name already exists."
        );
    }

    // -----------------------------------------
    // Update Role
    // -----------------------------------------

    await roleRepository.updateRole(
        parsedRoleId,
        data
    );

    return await roleRepository.getRoleById(
        parsedRoleId
    );

}

// ============================================================
// Delete Role (Soft Delete)
// ============================================================
//
// Purpose:
// Deactivates a Role.
//
// Business Rules:
//
// ✓ Role must exist
// ✓ System Roles cannot be deleted
// ✓ Protected Roles cannot be deleted
// ✓ Repository performs soft delete only
//
// ============================================================

async function deleteRole(roleId) {

    const parsedRoleId = validateRoleId(roleId);

    // -----------------------------------------
    // Check Role Exists
    // -----------------------------------------

    const existingRole =
        await roleRepository.findRoleById(
            parsedRoleId
        );

    if (!existingRole) {
        throw new NotFoundError(
            "Role not found."
        );
    }

    // -----------------------------------------
    // System Role Protection
    // -----------------------------------------

    if (existingRole.IsSystemRole) {
        throw new BadRequestError(
            "System Roles cannot be deleted."
        );
    }

    // -----------------------------------------
    // Protected Role Protection
    // -----------------------------------------

    if (existingRole.IsProtected) {
        throw new BadRequestError(
            "Protected Roles cannot be deleted."
        );
    }

    // -----------------------------------------
    // Already Inactive
    // -----------------------------------------

    if (!existingRole.IsActive) {
        throw new BadRequestError(
            "Role is already inactive."
        );
    }

    // -----------------------------------------
    // Soft Delete
    // -----------------------------------------

    await roleRepository.deactivateRole(
        parsedRoleId
    );

    return {
        roleId: parsedRoleId,
    };

}

// ============================================================
// Module Exports
// ============================================================

module.exports = {
    getRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
};