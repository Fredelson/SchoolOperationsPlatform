/* =========================================================
   Workspace Manager Routes
========================================================= */

const express = require("express");
const router = express.Router();

const workspaceManagerController = require("../controllers/workspaceManagerController");

const {
  validateWorkspacePayload,
} = require("../validators/workspaceManagerValidator");

router.get("/lookups", workspaceManagerController.getWorkspaceLookups);

router.get("/", workspaceManagerController.getWorkspaces);

router.get("/:id", workspaceManagerController.getWorkspaceById);

router.post(
  "/",
  validateWorkspacePayload,
  workspaceManagerController.createWorkspace
);

router.put(
  "/:id",
  validateWorkspacePayload,
  workspaceManagerController.updateWorkspace
);

router.delete("/:id", workspaceManagerController.deleteWorkspace);

module.exports = router;