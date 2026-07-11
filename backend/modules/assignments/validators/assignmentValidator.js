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

  if (payload.startDate && payload.endDate && new Date(payload.endDate) < new Date(payload.startDate)) {
    throw new BadRequestError("End date cannot be before start date.");
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
  validateAssignmentTypePayload(payload) {
    const assignmentKey=String(payload.assignmentKey||"").trim();const assignmentName=String(payload.assignmentName||"").trim();
    if(!assignmentKey||!/^[A-Za-z0-9_-]+$/.test(assignmentKey)) throw new BadRequestError("A valid assignment key is required.");
    if(!assignmentName) throw new BadRequestError("Assignment name is required.");
    return {assignmentKey,assignmentName,description:String(payload.description||"").trim()||null,sortOrder:Number(payload.sortOrder)||0,isActive:payload.isActive!==false};
  },
};
