// ============================================================
// Arab Unity School Operations Platform
// User Permission Override Service
// ============================================================
//
// Purpose:
// Handles business rules for user-level permission overrides.
//
// Architecture:
// Service Layer
//
// Rules:
// - Business logic only
// - No raw SQL
// - No Express req/res handling
//
// Source of Truth:
// dbo.UserPermissionOverrides
// ============================================================

const repository = require("../repositories/userPermissionOverrideRepository");
const validator = require("../validators/userPermissionOverrideValidator");

const serviceError = require("../../../shared/helpers/serviceError");
const { ensureExists, ensureActive } = require("../../../shared/helpers/entityValidator");
const { preventDuplicate } = require("../../../shared/helpers/duplicateHelper");

// ============================================================
// Normalize Boolean Input
// ============================================================

function normalizeBoolean(value) {
  return value === true || value === 1;
}

// ============================================================
// Get All Overrides
// ============================================================

async function getAllOverrides() {
  return repository.getAll();
}

// ============================================================
// Get Overrides By User
// ============================================================

async function getOverridesByUserId(userId) {
  if (!userId || Number.isNaN(Number(userId))) {
    throw serviceError.badRequest("Valid User ID is required.");
  }

  await ensureExists(
    repository.findUserById,
    Number(userId),
    "User"
  );

  return repository.getByUserId(Number(userId));
}

// ============================================================
// Get Override By ID
// ============================================================

async function getOverrideById(userPermissionOverrideId) {
  if (!userPermissionOverrideId || Number.isNaN(Number(userPermissionOverrideId))) {
    throw serviceError.badRequest("Valid User Permission Override ID is required.");
  }

  return ensureExists(
    repository.getById,
    Number(userPermissionOverrideId),
    "User permission override"
  );
}

// ============================================================
// Create Override
// ============================================================

async function createOverride(payload, currentUserId = null) {
  const errors = validator.validatePayload(payload);

  if (errors.length > 0) {
    throw serviceError.badRequest("Validation failed.", errors);
  }

  const userId = Number(payload.userId);
  const permissionId = Number(payload.permissionId);
  const isAllowed = normalizeBoolean(payload.isAllowed);

  await ensureActive(repository.findUserById, userId, "User");
  await ensureActive(repository.findPermissionById, permissionId, "Permission");

  await preventDuplicate(
    () => repository.findDuplicate(userId, permissionId),
    "This user already has an override for the selected permission."
  );

  const insertedOverrideId = await repository.create({
    userId,
    permissionId,
    isAllowed,
    reason: payload.reason,
    createdBy: currentUserId,
  });

  return getOverrideById(insertedOverrideId);
}

// ============================================================
// Update Override
// ============================================================

async function updateOverride(userPermissionOverrideId, payload) {
  const existingOverride = await getOverrideById(userPermissionOverrideId);

  const errors = validator.validatePayload(payload);

  if (errors.length > 0) {
    throw serviceError.badRequest("Validation failed.", errors);
  }

  const userId = Number(payload.userId);
  const permissionId = Number(payload.permissionId);
  const isAllowed = normalizeBoolean(payload.isAllowed);

  await ensureActive(repository.findUserById, userId, "User");
  await ensureActive(repository.findPermissionById, permissionId, "Permission");

  await preventDuplicate(
    () =>
      repository.findDuplicate(
        userId,
        permissionId,
        Number(userPermissionOverrideId)
      ),
    "This user already has an override for the selected permission."
  );

  await repository.update(Number(userPermissionOverrideId), {
    userId,
    permissionId,
    isAllowed,
    reason: payload.reason,
  });

  return {
    before: existingOverride,
    after: await getOverrideById(userPermissionOverrideId),
  };
}

// ============================================================
// Delete Override
// ============================================================
//
// Note:
// dbo.UserPermissionOverrides does not have IsActive.
// SQL schema uses hard delete for this table.
// ============================================================

async function deleteOverride(userPermissionOverrideId) {
  const existingOverride = await getOverrideById(userPermissionOverrideId);

  await repository.remove(Number(userPermissionOverrideId));

  return existingOverride;
}

module.exports = {
  getAllOverrides,
  getOverridesByUserId,
  getOverrideById,
  createOverride,
  updateOverride,
  deleteOverride,
};