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

// GET /api/distributions
router.get("/", protect, getDistributions);

// GET /api/distributions/users/search?query=
router.get("/users/search", protect, searchDistributionUsers);

// POST /api/distributions
router.post("/", protect, addDistribution);

module.exports = router;