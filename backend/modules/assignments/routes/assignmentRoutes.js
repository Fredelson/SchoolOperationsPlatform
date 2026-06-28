// backend/modules/assignments/routes/assignmentRoutes.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Assignment Routes
 * ============================================================
 *
 * Purpose:
 * Defines assignment-related API endpoints.
 *
 * Security:
 * All assignment endpoints are protected and require authentication.
 *
 * Active API:
 * GET    /api/assignments/types
 * GET    /api/assignments/users/:userId
 * POST   /api/assignments/users/:userId
 * PUT    /api/assignments/users/:userId/:assignmentId
 * DELETE /api/assignments/users/:userId/:assignmentId
 * PATCH  /api/assignments/users/:userId/:assignmentId/primary
 * ============================================================
 */

const express = require("express");
const router = express.Router();

const {
  getAssignmentTypes,
  getUserAssignments,
  createUserAssignment,
  updateUserAssignment,
  deleteUserAssignment,
  setPrimaryUserAssignment,
} = require("../controllers/assignmentController");

const { protect } = require("../../../middleware/authMiddleware");

/**
 * All assignment routes require a valid authenticated user.
 */
router.use(protect);

/**
 * Assignment type routes.
 */
router.get("/types", getAssignmentTypes);

/**
 * User assignment routes.
 */
router.get("/users/:userId", getUserAssignments);
router.post("/users/:userId", createUserAssignment);
router.put("/users/:userId/:assignmentId", updateUserAssignment);
router.delete("/users/:userId/:assignmentId", deleteUserAssignment);
router.patch("/users/:userId/:assignmentId/primary", setPrimaryUserAssignment);

module.exports = router;