const express = require("express");
const router = express.Router();

const permissionGroupController = require("../controllers/permissionGroupController");
const { protect } = require("../../../middleware/authMiddleware");
const requirePermission = require("../../permissionResolver/middleware/requirePermission");
const PERMISSIONS = require("../../../shared/permissions/permissionKeys");

router.use(protect);

router.get("/", requirePermission(PERMISSIONS.PERMISSION_GROUPS.VIEW), permissionGroupController.getPermissionGroups);
router.get("/:id", requirePermission(PERMISSIONS.PERMISSION_GROUPS.VIEW), permissionGroupController.getPermissionGroupById);
router.post("/", requirePermission(PERMISSIONS.PERMISSION_GROUPS.CREATE), permissionGroupController.createPermissionGroup);
router.put("/:id", requirePermission(PERMISSIONS.PERMISSION_GROUPS.UPDATE), permissionGroupController.updatePermissionGroup);
router.delete("/:id", requirePermission(PERMISSIONS.PERMISSION_GROUPS.DELETE), permissionGroupController.deletePermissionGroup);

module.exports = router;
