/* =========================================================
   Workspace Manager Routes
========================================================= */

const express = require("express");
const router = express.Router();

const workspaceManagerController = require("../controllers/workspaceManagerController");
const { protect } = require("../../../middleware/authMiddleware");
const { requireActiveWorkspace } = require("../../../middleware/permissionMiddleware");

const {
  validateWorkspacePayload,
} = require("../validators/workspaceManagerValidator");

router.use(protect);
router.get("/lookups", requireActiveWorkspace, workspaceManagerController.getWorkspaceLookups);
router.get("/:id/configuration", requireActiveWorkspace, workspaceManagerController.getWorkspaceConfiguration);
router.put("/:id/assignments/:assignmentType", requireActiveWorkspace, workspaceManagerController.replaceAssignments);
router.post("/:id/sync-permissions", requireActiveWorkspace, workspaceManagerController.syncRolePermissions);
router.put("/:id/dashboard", requireActiveWorkspace, workspaceManagerController.setWorkspaceDashboard);
router.get("/:id/buttons", requireActiveWorkspace, workspaceManagerController.getWorkspaceButtons);
router.put("/:id/buttons/:buttonId", requireActiveWorkspace, workspaceManagerController.updateWorkspaceButton);

router.get("/", requireActiveWorkspace, workspaceManagerController.getWorkspaces);

router.get("/:id", requireActiveWorkspace, workspaceManagerController.getWorkspaceById);

router.post(
  "/",
  requireActiveWorkspace,
  validateWorkspacePayload,
  workspaceManagerController.createWorkspace
);

router.put(
  "/:id",
  requireActiveWorkspace,
  validateWorkspacePayload,
  workspaceManagerController.updateWorkspace
);

router.delete("/:id", requireActiveWorkspace, workspaceManagerController.deleteWorkspace);

module.exports = router;
