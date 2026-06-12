// ============================================
// ARAB UNITY SCHOOL
// Printing Admin Routes
// Temporary route file
// ============================================

const express = require("express");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Test route to confirm Printing route is working
router.get(
  "/test",
  protect,
  authorizeRoles("PrintingAdmin", "SuperAdmin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Printing route is working",
    });
  }
);

module.exports = router;