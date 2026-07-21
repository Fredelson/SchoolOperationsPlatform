/* =========================================================
   Workspace Manager Routes
========================================================= */

const express = require("express");
const router = express.Router();

const workspaceManagerController = require("../controllers/workspaceManagerController");
const { protect } = require("../../../middleware/authMiddleware");
const requirePermission = require("../../permissionResolver/middleware/requirePermission");

const {
  validateWorkspacePayload,
} = require("../validators/workspaceManagerValidator");

router.use(protect);
router.get("/lookups", requirePermission("workspace.view"), workspaceManagerController.getWorkspaceLookups);
router.get("/:id/configuration", requirePermission("workspace.view"), workspaceManagerController.getWorkspaceConfiguration);
router.get("/preview/users/:userId", requirePermission("workspace.preview_user"), workspaceManagerController.getUserPreview);
router.get("/preview/users", requirePermission("workspace.preview_user"), workspaceManagerController.searchPreviewUsers);
router.post("/live-mode", requirePermission("workspace.live_mode"), workspaceManagerController.startLiveMode);
router.post("/live-mode/:sessionId/exit", requirePermission("workspace.live_mode"), workspaceManagerController.exitLiveMode);
router.put("/:id/assignments/:assignmentType", requirePermission("workspace.configure"), workspaceManagerController.replaceAssignments);
router.post("/:id/sync-permissions", requirePermission("workspace.configure"), workspaceManagerController.syncRolePermissions);
router.put("/:id/dashboard", requirePermission("workspace.configure"), workspaceManagerController.setWorkspaceDashboard);
router.get("/:id/buttons", requirePermission("workspace.configure"), workspaceManagerController.getWorkspaceButtons);
router.put("/:id/buttons/:buttonId", requirePermission("workspace.configure"), workspaceManagerController.updateWorkspaceButton);

router.get("/", requirePermission("workspace.view"), workspaceManagerController.getWorkspaces);

router.get("/:id", requirePermission("workspace.view"), workspaceManagerController.getWorkspaceById);

router.post(
  "/",
  requirePermission("workspace.create"),
  validateWorkspacePayload,
  workspaceManagerController.createWorkspace
);

router.put(
  "/:id",
  requirePermission("workspace.update"),
  validateWorkspacePayload,
  workspaceManagerController.updateWorkspace
);

router.delete("/:id", requirePermission("workspace.delete"), workspaceManagerController.deleteWorkspace);

module.exports = router;
