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

router.get("/", requirePermission("modules.view"), moduleController.getModules);
router.get(
  "/:id",
  requirePermission("modules.view"),
  validateModuleId,
  moduleController.getModuleById
);
router.post(
  "/",
  requirePermission("modules.view"),
  validateCreateModule,
  moduleController.createModule
);
router.put(
  "/:id",
  requirePermission("modules.view"),
  validateModuleId,
  validateUpdateModule,
  moduleController.updateModule
);
router.patch(
  "/:id/activate",
  requirePermission("modules.view"),
  validateModuleId,
  moduleController.activateModule
);
router.patch(
  "/:id/deactivate",
  requirePermission("modules.view"),
  validateModuleId,
  moduleController.deactivateModule
);
router.delete(
  "/:id",
  requirePermission("modules.view"),
  validateModuleId,
  moduleController.deleteModule
);

module.exports = router;
