// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// HOS Routes
//
// Purpose:
// - HOS dashboard
// - HOS request approval queue
// - HOS approval/rejection actions
//
// Access:
// - HOS
// - Secretary
// - SuperAdmin
// ============================================

const express = require("express");
const router = express.Router();

const {
  getHosDashboard,
  getHosRequests,
  getHosRequestById,
  getHosApprovalHistory,
  approveHosRequest,
  rejectHosRequest,
} = require("../../controllers/requests/hosController");

const {
  protect,
  authorizeRoles,
} = require("../../middleware/authMiddleware");

const HOS_ACCESS = ["HOS", "Secretary", "SuperAdmin"];

router.get(
  "/dashboard",
  protect,
  authorizeRoles(...HOS_ACCESS),
  getHosDashboard
);

router.get(
  "/approval-history",
  protect,
  authorizeRoles(...HOS_ACCESS),
  getHosApprovalHistory
);

router.get(
  "/requests",
  protect,
  authorizeRoles(...HOS_ACCESS),
  getHosRequests
);

router.get(
  "/requests/:id",
  protect,
  authorizeRoles(...HOS_ACCESS),
  getHosRequestById
);

router.put(
  "/requests/:id/approve",
  protect,
  authorizeRoles(...HOS_ACCESS),
  approveHosRequest
);

router.put(
  "/requests/:id/reject",
  protect,
  authorizeRoles(...HOS_ACCESS),
  rejectHosRequest
);

module.exports = router;