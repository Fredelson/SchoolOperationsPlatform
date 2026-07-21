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

router.get("/", requirePermission("Menu.View"), menuController.getMenus);
router.get("/:id", requirePermission("Menu.View"), menuController.getMenuById);
router.post(
  "/",
  requirePermission("Menu.View"),
  menuController.createMenu
);
router.put(
  "/:id",
  requirePermission("Menu.View"),
  menuController.updateMenu
);
router.put(
  "/:id/show",
  requirePermission("Menu.View"),
  menuController.showMenu
);
router.put(
  "/:id/hide",
  requirePermission("Menu.View"),
  menuController.hideMenu
);
router.delete(
  "/:id",
  requirePermission("Menu.View"),
  menuController.deleteMenu
);

module.exports = router;
