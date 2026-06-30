// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Menu Routes
// ============================================
//
// Purpose:
// Defines all Menu Manager API endpoints.
//
// Architecture:
// Routes -> Controller -> Service -> Repository
// ============================================

const express = require("express");

const router = express.Router();

const menuController = require("../controllers/menuController");

const {
  validateCreateMenu,
  validateUpdateMenu,
  validateMenuId,
} = require("../validators/menuValidator");

// ============================================
// Menu Routes
// ============================================

// GET /api/super-admin/menus
router.get("/", menuController.getMenus);

// GET /api/super-admin/menus/:id
router.get("/:id", validateMenuId, menuController.getMenuById);

// POST /api/super-admin/menus
router.post(
  "/",
  validateCreateMenu,
  menuController.createMenu
);

// PUT /api/super-admin/menus/:id
router.put(
  "/:id",
  validateMenuId,
  validateUpdateMenu,
  menuController.updateMenu
);

// PUT /api/super-admin/menus/:id/show
router.put(
  "/:id/show",
  validateMenuId,
  menuController.showMenu
);

// PUT /api/super-admin/menus/:id/hide
router.put(
  "/:id/hide",
  validateMenuId,
  menuController.hideMenu
);

// DELETE /api/super-admin/menus/:id
router.delete(
  "/:id",
  validateMenuId,
  menuController.deleteMenu
);

module.exports = router;