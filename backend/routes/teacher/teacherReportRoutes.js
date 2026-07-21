// ============================================
// ARAB UNITY SCHOOL
// Teacher Report Routes
// ============================================

const express = require("express");
const router = express.Router();

const {
  getTeacherReports,
} = require("../../controllers/teacher/teacherReportController");

const { protect } = require("../../middleware/authMiddleware");
const requirePermission = require("../../modules/permissionResolver/middleware/requirePermission");

// GET /api/teacher/reports
router.get(
  "/",
  protect,
  requirePermission("reports.view"),
  getTeacherReports
);

module.exports = router;