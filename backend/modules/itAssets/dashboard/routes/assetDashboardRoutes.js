// backend/modules/itAssets/dashboard/routes/assetDashboardRoutes.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * IT Asset Dashboard Routes
 * ============================================================
 */

const express = require("express");
const router = express.Router();

const { getDashboard, getOperationsHistory } = require("../controllers/assetDashboardController");
const { protect } = require("../../../../middleware/authMiddleware");
const { requireActiveWorkspace } = require("../../../../middleware/permissionMiddleware");

router.use(protect);

/**
 * GET /api/it-assets/dashboard
 */
router.get("/", requireActiveWorkspace, getDashboard);

/**
 * GET /api/it-assets/operations/history
 */
router.get("/operations/history", requireActiveWorkspace, getOperationsHistory);

module.exports = router;
