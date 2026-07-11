/* =========================================================
   Navigation Manager Routes
   Purpose:
   Defines all API endpoints for Navigation Manager.
========================================================= */

const express = require("express");
const router = express.Router();

const navigationManagerController = require("../controllers/navigationManagerController");
const { platformAdministrationAccess } = require("../../../middleware/platformAdministrationMiddleware");

router.use(...platformAdministrationAccess);

const {
  validateNavigationMenuPayload,
} = require("../validators/navigationManagerValidator");

/* =========================================================
   Routes
========================================================= */

router.get("/lookups", navigationManagerController.getNavigationLookups);

router.get("/", navigationManagerController.getNavigationMenus);

router.get("/:id", navigationManagerController.getNavigationMenuById);

router.post(
  "/",
  validateNavigationMenuPayload,
  navigationManagerController.createNavigationMenu
);

router.put(
  "/:id",
  validateNavigationMenuPayload,
  navigationManagerController.updateNavigationMenu
);

router.delete("/:id", navigationManagerController.deleteNavigationMenu);

module.exports = router;
