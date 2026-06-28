// backend/modules/assignments/services/assignmentService.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Assignment Service
 * ============================================================
 *
 * Purpose:
 * Contains business logic for assignment-related features.
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
} = require("../validators/assignmentValidator");
/**
 * Gets active assignment types for frontend dropdowns and admin screens.
 *
 * @returns {Promise<Array>} Assignment types.
 */
async function getAssignmentTypes() {
  return assignmentRepository.getAssignmentTypes();
}

/**
 * Gets all active assignments for a user.
 */
async function getUserAssignments(userId) {
  const parsedUserId = Number(userId);

  if (!parsedUserId) {
    throw new BadRequestError("Valid User ID is required.");
  }

  return assignmentRepository.getUserAssignments(parsedUserId);
}

/**
 * Creates a new assignment for a user.
 */
async function createUserAssignment(userId, payload, currentUser) {
  const parsedUserId = Number(userId);

  if (!parsedUserId) {
    throw new BadRequestError("Valid User ID is required.");
  }

  const data = validateCreateAssignmentPayload(payload);

  const user = await assignmentRepository.findUserById(parsedUserId);

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  if (!user.IsActive) {
    throw new BadRequestError("Cannot assign responsibility to an inactive user.");
  }

  const assignmentType =
    await assignmentRepository.findAssignmentTypeById(data.assignmentTypeId);

  if (!assignmentType) {
    throw new NotFoundError("Assignment type not found.");
  }

  const academicYear =
    await assignmentRepository.findAcademicYearById(data.academicYearId);

  if (!academicYear) {
    throw new NotFoundError("Academic year not found.");
  }

  const duplicate = await assignmentRepository.findDuplicateAssignment(
    parsedUserId,
    data
  );

  if (duplicate) {
    throw new ConflictError("This user already has the same active assignment.");
  }

  if (data.isPrimary) {
    await assignmentRepository.clearPrimaryAssignment(
      parsedUserId,
      data.assignmentTypeId
    );
  }

  const createdBy = currentUser?.id || null;

  const userAssignmentId =
    await assignmentRepository.createUserAssignment(
      parsedUserId,
      data,
      createdBy
    );

  return {
    userAssignmentId,
  };
}


module.exports = {
  getAssignmentTypes,
  getUserAssignments,
  createUserAssignment,
};