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
} = require("../../middleware/authMiddleware");
const requirePermission = require("../../modules/permissionResolver/middleware/requirePermission");

const HOS_ACCESS = ["HOS", "Secretary", "SuperAdmin"];

router.get(
  "/dashboard",
  protect,
  requirePermission("requests.view"),
  getHosDashboard
);

router.get(
  "/approval-history",
  protect,
  requirePermission("requests.view"),
  getHosApprovalHistory
);

router.get(
  "/requests",
  protect,
  requirePermission("requests.view"),
  getHosRequests
);

router.get(
  "/requests/:id",
  protect,
  requirePermission("requests.view"),
  getHosRequestById
);

router.put(
  "/requests/:id/approve",
  protect,
  requirePermission("requests.approve"),
  approveHosRequest
);

router.put(
  "/requests/:id/reject",
  protect,
  requirePermission("requests.reject"),
  rejectHosRequest
);

module.exports = router;