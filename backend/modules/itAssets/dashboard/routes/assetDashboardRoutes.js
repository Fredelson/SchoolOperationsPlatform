// backend/modules/itAssets/dashboard/routes/assetDashboardRoutes.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * IT Asset Dashboard Routes
 * ============================================================
 */

const express = require("express");
const router = express.Router();

const { getDashboard } = require("../controllers/assetDashboardController");
const { protect } = require("../../../../middleware/authMiddleware");

router.use(protect);

/**
 * GET /api/it-assets/dashboard
 */
router.get("/", getDashboard);

module.exports = router;