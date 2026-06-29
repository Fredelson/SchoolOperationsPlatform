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

// ============================================
// Module Query Routes
// ============================================

router.get("/", moduleController.getModules);

router.get(
  "/:id",
  validateModuleId,
  moduleController.getModuleById
);

// ============================================
// Module Mutation Routes
// ============================================

router.post(
  "/",
  validateCreateModule,
  moduleController.createModule
);

router.put(
  "/:id",
  validateModuleId,
  validateUpdateModule,
  moduleController.updateModule
);

router.patch(
  "/:id/activate",
  validateModuleId,
  moduleController.activateModule
);

router.patch(
  "/:id/deactivate",
  validateModuleId,
  moduleController.deactivateModule
);

router.delete(
  "/:id",
  validateModuleId,
  moduleController.deleteModule
);

module.exports = router;