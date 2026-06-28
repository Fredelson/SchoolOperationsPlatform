// ============================================================
// Arab Unity School Operations Platform
// User Permission Override Routes
// ============================================================

const express = require("express");
const controller = require("../controllers/userPermissionOverrideController");
const { protect } = require("../../../middleware/authMiddleware");
const requirePermission = require("../../permissionResolver/middleware/requirePermission");
const PERMISSIONS = require("../../../shared/permissions/permissionKeys");

const router = express.Router();

router.use(protect);

router.get(
  "/",
  requirePermission(PERMISSIONS.USER_PERMISSION_OVERRIDES.VIEW),
  controller.getAllOverrides
);

router.get(
  "/user/:userId",
  requirePermission(PERMISSIONS.USER_PERMISSION_OVERRIDES.VIEW),
  controller.getOverridesByUserId
);

router.get(
  "/:id",
  requirePermission(PERMISSIONS.USER_PERMISSION_OVERRIDES.VIEW),
  controller.getOverrideById
);

router.post(
  "/",
  requirePermission(PERMISSIONS.USER_PERMISSION_OVERRIDES.CREATE),
  controller.createOverride
);

router.put(
  "/:id",
  requirePermission(PERMISSIONS.USER_PERMISSION_OVERRIDES.UPDATE),
  controller.updateOverride
);

router.delete(
  "/:id",
  requirePermission(PERMISSIONS.USER_PERMISSION_OVERRIDES.DELETE),
  controller.deleteOverride
);

module.exports = router;