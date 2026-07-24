// ============================================
// ARAB UNITY SCHOOL
// Super Admin - Audit Log Routes
// ============================================

const express = require("express");
const router = express.Router();

const {
  getAuditLogs,
} = require("../../controllers/superadmin/auditLogController");

const { protect, authorizeRoles } = require("../../middleware/authMiddleware");


// GET /api/superadmin/audit-logs
router.get(
  "/",
  protect,
  authorizeRoles("SuperAdmin", "PlatformAdmin"),
  getAuditLogs
);

module.exports = router;
