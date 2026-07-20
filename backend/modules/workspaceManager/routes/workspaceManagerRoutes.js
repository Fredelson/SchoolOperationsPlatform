/* =========================================================
   Workspace Manager Routes
========================================================= */

const express = require("express");
const router = express.Router();

const workspaceManagerController = require("../controllers/workspaceManagerController");
const { protect, authorizeRoles } = require("../../../middleware/authMiddleware");
const requirePermission = require("../../permissionResolver/middleware/requirePermission");

const {
  validateWorkspacePayload,
} = require("../validators/workspaceManagerValidator");

router.use(protect);
router.get("/lookups", authorizeRoles("SuperAdmin", "PlatformAdmin"), workspaceManagerController.getWorkspaceLookups);
router.get("/:id/configuration", authorizeRoles("SuperAdmin", "PlatformAdmin"), workspaceManagerController.getWorkspaceConfiguration);
router.get("/preview/users/:userId", requirePermission("workspace.preview_user"), workspaceManagerController.getUserPreview);
router.get("/preview/users", requirePermission("workspace.preview_user"), workspaceManagerController.searchPreviewUsers);
router.post("/live-mode", authorizeRoles("SuperAdmin"), requirePermission("workspace.live_mode"), workspaceManagerController.startLiveMode);
router.post("/live-mode/:sessionId/exit", authorizeRoles("SuperAdmin"), requirePermission("workspace.live_mode"), workspaceManagerController.exitLiveMode);
router.put("/:id/assignments/:assignmentType", requirePermission("workspace.configure"), workspaceManagerController.replaceAssignments);
router.post("/:id/sync-permissions", requirePermission("workspace.configure"), workspaceManagerController.syncRolePermissions);
router.put("/:id/dashboard", requirePermission("workspace.configure"), workspaceManagerController.setWorkspaceDashboard);

router.get("/", authorizeRoles("SuperAdmin", "PlatformAdmin"), workspaceManagerController.getWorkspaces);

router.get("/:id", authorizeRoles("SuperAdmin", "PlatformAdmin"), workspaceManagerController.getWorkspaceById);

router.post(
  "/",
  authorizeRoles("SuperAdmin"),
  validateWorkspacePayload,
  workspaceManagerController.createWorkspace
);

router.put(
  "/:id",
  authorizeRoles("SuperAdmin"),
  validateWorkspacePayload,
  workspaceManagerController.updateWorkspace
);

router.delete("/:id", authorizeRoles("SuperAdmin"), workspaceManagerController.deleteWorkspace);

module.exports = router;
