/* =========================================================
   Navigation Manager Routes
   Purpose:
   Defines all API endpoints for Navigation Manager.
========================================================= */

const express = require("express");
const router = express.Router();

const navigationManagerController = require("../controllers/navigationManagerController");
const { protect } = require("../../../middleware/authMiddleware");
const requirePermission = require("../../../modules/permissionResolver/middleware/requirePermission");

router.use(protect);

router.get("/lookups", requirePermission("Navigation.View"), navigationManagerController.getNavigationLookups);
router.get("/", requirePermission("Navigation.View"), navigationManagerController.getNavigationMenus);
router.get("/:id", requirePermission("Navigation.View"), navigationManagerController.getNavigationMenuById);
router.post(
  "/",
  requirePermission("Navigation.View"),
  navigationManagerController.createNavigationMenu
);
router.put(
  "/:id",
  requirePermission("Navigation.View"),
  navigationManagerController.updateNavigationMenu
);
router.delete("/:id", requirePermission("Navigation.View"), navigationManagerController.deleteNavigationMenu);

module.exports = router;
