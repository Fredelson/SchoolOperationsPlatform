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
const { protect, authorizeRoles } = require("../../middleware/authMiddleware");
const DISTRIBUTION_ROLES = ["PrintingAdmin", "PlatformAdmin", "SuperAdmin"];

// GET /api/distributions
router.get("/", protect, authorizeRoles(...DISTRIBUTION_ROLES), getDistributions);

// GET /api/distributions/users/search?query=
router.get("/users/search", protect, authorizeRoles(...DISTRIBUTION_ROLES), searchDistributionUsers);

// POST /api/distributions
router.post("/", protect, authorizeRoles(...DISTRIBUTION_ROLES), addDistribution);

module.exports = router;
