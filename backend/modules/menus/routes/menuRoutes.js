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
const { protect } = require("../../../middleware/authMiddleware");
const requirePermission = require("../../../modules/permissionResolver/middleware/requirePermission");

router.use(protect);

router.get("/", requirePermission("menus.view"), menuController.getMenus);
router.get("/:id", requirePermission("menus.view"), menuController.getMenuById);
router.post(
  "/",
  requirePermission("menus.view"),
  menuController.createMenu
);
router.put(
  "/:id",
  requirePermission("menus.view"),
  menuController.updateMenu
);
router.put(
  "/:id/show",
  requirePermission("menus.view"),
  menuController.showMenu
);
router.put(
  "/:id/hide",
  requirePermission("menus.view"),
  menuController.hideMenu
);
router.delete(
  "/:id",
  requirePermission("menus.view"),
  menuController.deleteMenu
);

module.exports = router;
