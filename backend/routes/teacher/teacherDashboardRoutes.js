// ============================================
// ARAB UNITY SCHOOL
// Teacher Dashboard Routes
// Handles Teacher Dashboard KPI requests
// ============================================

const express = require("express");

const router = express.Router();

// Controller
const {
  getTeacherDashboardKpis,
} = require("../../controllers/teacher/teacherDashboardController");

// Auth Middleware
const { protect } = require("../../middleware/authMiddleware");

// ============================================
// Teacher Dashboard KPI Route
// GET /api/teacher/dashboard/kpis
// ============================================

router.get(
  "/kpis",
  protect,
  getTeacherDashboardKpis
);

// ============================================
// Export Router
// ============================================

module.exports = router;