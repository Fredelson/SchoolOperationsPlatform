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
const requirePermission = require("../../permissionResolver/middleware/requirePermission");
const PERMISSIONS = require("../../../shared/permissions/permissionKeys");

router.use(protect);

// Assignment Types
router.get(
  "/types",
  requirePermission(PERMISSIONS.ASSIGNMENT_TYPES.VIEW),
  getAssignmentTypes
);

// User Assignments
router.get(
  "/users/:userId",
  requirePermission(PERMISSIONS.USER_ASSIGNMENTS.VIEW),
  getUserAssignments
);

router.post(
  "/users/:userId",
  requirePermission(PERMISSIONS.USER_ASSIGNMENTS.CREATE),
  createUserAssignment
);

router.put(
  "/users/:userId/:assignmentId",
  requirePermission(PERMISSIONS.USER_ASSIGNMENTS.UPDATE),
  updateUserAssignment
);

router.delete(
  "/users/:userId/:assignmentId",
  requirePermission(PERMISSIONS.USER_ASSIGNMENTS.DELETE),
  deleteUserAssignment
);

router.patch(
  "/users/:userId/:assignmentId/primary",
  requirePermission(PERMISSIONS.USER_ASSIGNMENTS.UPDATE),
  setPrimaryUserAssignment
);

module.exports = router;