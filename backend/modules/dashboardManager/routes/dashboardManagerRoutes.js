const express = require("express");
const router = express.Router();

const dashboardManagerController = require("../controllers/dashboardManagerController");

const {
  validateDashboardPayload,
} = require("../validators/dashboardManagerValidator");

router.get("/lookups", dashboardManagerController.getDashboardLookups);
router.get("/", dashboardManagerController.getDashboards);
router.get("/:id", dashboardManagerController.getDashboardById);

router.post(
  "/",
  validateDashboardPayload,
  dashboardManagerController.createDashboard
);

router.put(
  "/:id",
  validateDashboardPayload,
  dashboardManagerController.updateDashboard
);

router.delete("/:id", dashboardManagerController.deleteDashboard);

module.exports = router;