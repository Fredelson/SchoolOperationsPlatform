// backend/modules/assignments/controllers/assignmentController.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Assignment Controller
 * ============================================================
 *
 * Purpose:
 * Handles HTTP requests for assignment-related endpoints.
 *
 * Notes:
 * - No SQL queries here.
 * - No business rules here.
 * - Controller only receives request data and returns responses.
 * ============================================================
 */

const asyncHandler = require("../../../shared/helpers/asyncHandler");
const { sendSuccess } = require("../../../shared/helpers/apiResponse");
const assignmentService = require("../services/assignmentService");

/**
 * ------------------------------------------------------------
 * GET /api/assignments/types
 *
 * Returns all active assignment types.
 * ------------------------------------------------------------
 */
const getAssignmentTypes = asyncHandler(async (req, res) => {
  const data = await assignmentService.getAssignmentTypes();

  return sendSuccess(
    res,
    "Assignment types loaded successfully.",
    data
  );
});

/**
 * ------------------------------------------------------------
 * GET /api/assignments/users/:userId
 *
 * Returns all active assignments for a user.
 * ------------------------------------------------------------
 */
const getUserAssignments = asyncHandler(async (req, res) => {
  const data = await assignmentService.getUserAssignments(
    req.params.userId
  );

  return sendSuccess(
    res,
    "User assignments loaded successfully.",
    data
  );
});

/**
 * ------------------------------------------------------------
 * POST /api/assignments/users/:userId
 *
 * Creates a new assignment for a user.
 * ------------------------------------------------------------
 */
const createUserAssignment = asyncHandler(async (req, res) => {
  const data = await assignmentService.createUserAssignment(
    req.params.userId,
    req.body,
    req.user
  );

  return sendSuccess(
    res,
    "User assignment created successfully.",
    data,
    201
  );
});

/**
 * ============================================================
 * Exports
 * ============================================================
 */
module.exports = {
  getAssignmentTypes,
  getUserAssignments,
  createUserAssignment,
};