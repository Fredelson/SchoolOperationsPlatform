// ============================================================
// Arab Unity School Operations Platform
// Role Routes
// ============================================================

const express = require("express");
const router = express.Router();

const {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} = require("../controllers/roleController");

const { protect } = require("../../../middleware/authMiddleware");
const requirePermission = require("../../permissionResolver/middleware/requirePermission");
const PERMISSIONS = require("../../../shared/permissions/permissionKeys");

router.use(protect);

router.get("/", requirePermission(PERMISSIONS.ROLES.VIEW), getRoles);
router.get("/:roleId", requirePermission(PERMISSIONS.ROLES.VIEW), getRoleById);
router.post("/", requirePermission(PERMISSIONS.ROLES.CREATE), createRole);
router.put("/:roleId", requirePermission(PERMISSIONS.ROLES.UPDATE), updateRole);
router.delete("/:roleId", requirePermission(PERMISSIONS.ROLES.DELETE), deleteRole);

module.exports = router;