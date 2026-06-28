// backend/modules/assignments/validators/assignmentValidator.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Assignment Validator
 * ============================================================
 *
 * Purpose:
 * Validates incoming assignment request payloads before the
 * service layer performs database checks.
 * ============================================================
 */

const { BadRequestError } = require("../../../shared/errors");

/**
 * Converts empty strings and undefined values to null.
 */
function normalizeNullableNumber(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}

/**
 * Validates create assignment request body.
 *
 * Required:
 * - assignmentTypeId
 * - academicYearId
 *
 * Optional scope:
 * - departmentId
 * - sectionId
 * - subjectId
 * - yearLevelId
 * - classId
 * - roomId
 */
function validateCreateAssignmentPayload(payload) {
  const assignmentTypeId = normalizeNullableNumber(payload.assignmentTypeId);
  const academicYearId = normalizeNullableNumber(payload.academicYearId);

  if (!assignmentTypeId) {
    throw new BadRequestError("Assignment type is required.");
  }

  if (!academicYearId) {
    throw new BadRequestError("Academic year is required.");
  }

  return {
    assignmentTypeId,
    academicYearId,
    departmentId: normalizeNullableNumber(payload.departmentId),
    sectionId: normalizeNullableNumber(payload.sectionId),
    subjectId: normalizeNullableNumber(payload.subjectId),
    yearLevelId: normalizeNullableNumber(payload.yearLevelId),
    classId: normalizeNullableNumber(payload.classId),
    roomId: normalizeNullableNumber(payload.roomId),
    startDate: payload.startDate || null,
    endDate: payload.endDate || null,
    isPrimary: Boolean(payload.isPrimary),
  };
}

module.exports = {
  validateCreateAssignmentPayload,
};