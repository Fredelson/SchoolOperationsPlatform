const express = require("express");
const router = express.Router();

const {
  getAssignmentTypes,
  getUserAssignments,
  createUserAssignment,
  updateUserAssignment,
  deleteUserAssignment,
  setPrimaryUserAssignment,
  getAssignments,
  getAssignmentLookups,
  activateUserAssignment,
  listAssignmentTypes,getAssignmentType,createAssignmentType,updateAssignmentType,activateAssignmentType,deactivateAssignmentType,deleteAssignmentType,
} = require("../controllers/assignmentController");

const { platformAdministrationAccess } = require("../../../middleware/platformAdministrationMiddleware");
const requirePermission = require("../../permissionResolver/middleware/requirePermission");
const PERMISSIONS = require("../../../shared/permissions/permissionKeys");

router.use(...platformAdministrationAccess);

router.get("/", requirePermission(PERMISSIONS.USER_ASSIGNMENTS.VIEW), getAssignments);
router.get("/lookups", requirePermission(PERMISSIONS.USER_ASSIGNMENTS.VIEW), getAssignmentLookups);

// Assignment Types
router.get("/types/manage",requirePermission(PERMISSIONS.ASSIGNMENT_TYPES.VIEW),listAssignmentTypes);
router.get("/types/:assignmentTypeId",requirePermission(PERMISSIONS.ASSIGNMENT_TYPES.VIEW),getAssignmentType);
router.post("/types",requirePermission(PERMISSIONS.ASSIGNMENT_TYPES.CREATE),createAssignmentType);
router.put("/types/:assignmentTypeId",requirePermission(PERMISSIONS.ASSIGNMENT_TYPES.UPDATE),updateAssignmentType);
router.patch("/types/:assignmentTypeId/activate",requirePermission(PERMISSIONS.ASSIGNMENT_TYPES.UPDATE),activateAssignmentType);
router.patch("/types/:assignmentTypeId/deactivate",requirePermission(PERMISSIONS.ASSIGNMENT_TYPES.UPDATE),deactivateAssignmentType);
router.delete("/types/:assignmentTypeId",requirePermission(PERMISSIONS.ASSIGNMENT_TYPES.DELETE),deleteAssignmentType);
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

router.patch("/users/:userId/:assignmentId/activate", requirePermission(PERMISSIONS.USER_ASSIGNMENTS.UPDATE), activateUserAssignment);

module.exports = router;
