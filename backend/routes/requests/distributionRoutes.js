// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Paper Distribution Routes
//
// Purpose:
// - Search users for paper distribution
// - View paper distribution records
// - Add new paper distribution records
// ============================================

const express = require("express");
const router = express.Router();

// Controller imports
const {
  searchDistributionUsers,
  getDistributions,
  addDistribution,
} = require("../../controllers/requests/distributionController");

// Middleware imports
const { protect } = require("../../middleware/authMiddleware");
const requirePermission = require("../../modules/permissionResolver/middleware/requirePermission");

// GET /api/distributions
router.get("/", protect, requirePermission("printing.distribution.view"), getDistributions);

// GET /api/distributions/users/search?query=
router.get("/users/search", protect, requirePermission("printing.distribution.view"), searchDistributionUsers);

// POST /api/distributions
router.post("/", protect, requirePermission("printing.distribution.create"), addDistribution);

module.exports = router;
