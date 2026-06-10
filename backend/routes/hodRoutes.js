// ============================================
// ARAB UNITY SCHOOL
// HOD Routes
// ============================================

const express = require("express");
const router = express.Router();

const { getHodRequests } = require("../controllers/hodController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Get requests assigned to logged-in HOD
router.get(
  "/requests",
  protect,
  authorizeRoles("HOD", "SuperAdmin"),
  getHodRequests
);

module.exports = router;