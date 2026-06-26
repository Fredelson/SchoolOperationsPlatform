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
  authorizeRoles,
} = require("../../middleware/authMiddleware");

router.get(
  "/departments",
  protect,
  authorizeRoles("PrintingAdmin", "SuperAdmin", "HOS"),
  getDepartmentLimits
);

router.put(
  "/departments/:departmentId",
  protect,
  authorizeRoles("PrintingAdmin", "SuperAdmin"),
  upsertDepartmentLimit
);

router.get(
  "/subjects",
  protect,
  authorizeRoles("HOS", "PrintingAdmin", "SuperAdmin"),
  getSubjectLimits
);

router.put(
  "/subjects/:subjectId",
  protect,
  authorizeRoles("HOS", "SuperAdmin"),
  upsertSubjectLimit
);

module.exports = router;