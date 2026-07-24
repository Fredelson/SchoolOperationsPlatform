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

const { protect } = require("../../../middleware/authMiddleware");
const { requireActiveWorkspace } = require("../../../middleware/permissionMiddleware");

router.get("/lookups", protect, getAssignmentLookups);

router.use(protect);

router.get("/", requireActiveWorkspace, getAssignments);

// Assignment Types
router.get("/types/manage",requireActiveWorkspace,listAssignmentTypes);
router.get("/types/:assignmentTypeId",requireActiveWorkspace,getAssignmentType);
router.post("/types",requireActiveWorkspace,createAssignmentType);
router.put("/types/:assignmentTypeId",requireActiveWorkspace,updateAssignmentType);
router.patch("/types/:assignmentTypeId/activate",requireActiveWorkspace,activateAssignmentType);
router.patch("/types/:assignmentTypeId/deactivate",requireActiveWorkspace,deactivateAssignmentType);
router.delete("/types/:assignmentTypeId",requireActiveWorkspace,deleteAssignmentType);
router.get(
  "/types",
  requireActiveWorkspace,
  getAssignmentTypes
);

// User Assignments
router.get(
  "/users/:userId",
  requireActiveWorkspace,
  getUserAssignments
);

router.post(
  "/users/:userId",
  requireActiveWorkspace,
  createUserAssignment
);

router.put(
  "/users/:userId/:assignmentId",
  requireActiveWorkspace,
  updateUserAssignment
);

router.delete(
  "/users/:userId/:assignmentId",
  requireActiveWorkspace,
  deleteUserAssignment
);

router.patch(
  "/users/:userId/:assignmentId/primary",
  requireActiveWorkspace,
  setPrimaryUserAssignment
);

router.patch("/users/:userId/:assignmentId/activate", requireActiveWorkspace, activateUserAssignment);

module.exports = router;
