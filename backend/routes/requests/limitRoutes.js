// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Print Limit Routes
//
// Purpose:
// - Manage monthly department print limits
// - Manage subject/HOD print limits
// ============================================

const express = require("express");
const router = express.Router();

const {
  getDepartmentLimits,
  upsertDepartmentLimit,
  getSubjectLimits,
  upsertSubjectLimit,
} = require("../../controllers/requests/limitController");

const {
  protect,
} = require("../../middleware/authMiddleware");
const requirePermission = require("../../modules/permissionResolver/middleware/requirePermission");

router.get(
  "/departments",
  protect,
  requirePermission("printing.limits.view"),
  getDepartmentLimits
);

router.put(
  "/departments/:departmentId",
  protect,
  requirePermission("printing.limits.update"),
  upsertDepartmentLimit
);

router.get(
  "/subjects",
  protect,
  requirePermission("printing.limits.view"),
  getSubjectLimits
);

router.put(
  "/subjects/:subjectId",
  protect,
  requirePermission("printing.limits.update"),
  upsertSubjectLimit
);

module.exports = router;