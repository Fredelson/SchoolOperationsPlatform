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
const { requireActiveWorkspace } = require("../../middleware/permissionMiddleware");

// GET /api/teacher/reports
router.get(
  "/",
  protect,
  requireActiveWorkspace,
  getTeacherReports
);

module.exports = router;