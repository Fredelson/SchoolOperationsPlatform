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
const { requireActiveWorkspace } = require("../../middleware/permissionMiddleware");

router.get(
  "/departments",
  protect,
  requireActiveWorkspace,
  getDepartmentLimits
);

router.put(
  "/departments/:departmentId",
  protect,
  requireActiveWorkspace,
  upsertDepartmentLimit
);

router.get(
  "/subjects",
  protect,
  requireActiveWorkspace,
  getSubjectLimits
);

router.put(
  "/subjects/:subjectId",
  protect,
  requireActiveWorkspace,
  upsertSubjectLimit
);

module.exports = router;