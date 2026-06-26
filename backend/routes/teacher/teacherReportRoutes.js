// ============================================
// ARAB UNITY SCHOOL
// Teacher Report Routes
// ============================================

const express = require("express");
const router = express.Router();

const {
  getTeacherReports,
} = require("../../controllers/teacher/teacherReportController");

const { protect, authorizeRoles } = require("../../middleware/authMiddleware");

// GET /api/teacher/reports
router.get(
  "/",
  protect,
  authorizeRoles(
  "Teacher",
  "TeacherLevel",
  "TeachingAssistant",
  "TeachingAssistantLevel",
  "TA",
  "SuperAdmin",
  "SuperAdminLevel"
),
  getTeacherReports
);

module.exports = router;