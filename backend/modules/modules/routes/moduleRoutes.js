// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Module Routes
// ============================================
//
// Purpose:
// Defines API endpoints for the platform
// Module Manager.
// ============================================

const express = require("express");

const moduleController = require("../controllers/moduleController");
const {
  validateCreateModule,
  validateUpdateModule,
  validateModuleId,
} = require("../validators/moduleValidator");

const router = express.Router();
const { protect } = require("../../../middleware/authMiddleware");
const requirePermission = require("../../../modules/permissionResolver/middleware/requirePermission");

router.use(protect);

router.get("/", requirePermission("Module.View"), moduleController.getModules);
router.get(
  "/:id",
  requirePermission("Module.View"),
  validateModuleId,
  moduleController.getModuleById
);
router.post(
  "/",
  requirePermission("Module.View"),
  validateCreateModule,
  moduleController.createModule
);
router.put(
  "/:id",
  requirePermission("Module.View"),
  validateModuleId,
  validateUpdateModule,
  moduleController.updateModule
);
router.patch(
  "/:id/activate",
  requirePermission("Module.View"),
  validateModuleId,
  moduleController.activateModule
);
router.patch(
  "/:id/deactivate",
  requirePermission("Module.View"),
  validateModuleId,
  moduleController.deactivateModule
);
router.delete(
  "/:id",
  requirePermission("Module.View"),
  validateModuleId,
  moduleController.deleteModule
);

module.exports = router;
