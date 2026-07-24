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
const { requireActiveWorkspace } = require("../../middleware/permissionMiddleware");

const HOS_ACCESS = ["HOS", "Secretary", "SuperAdmin"];

router.get(
  "/dashboard",
  protect,
  requireActiveWorkspace,
  getHosDashboard
);

router.get(
  "/approval-history",
  protect,
  requireActiveWorkspace,
  getHosApprovalHistory
);

router.get(
  "/requests",
  protect,
  requireActiveWorkspace,
  getHosRequests
);

router.get(
  "/requests/:id",
  protect,
  requireActiveWorkspace,
  getHosRequestById
);

router.put(
  "/requests/:id/approve",
  protect,
  requireActiveWorkspace,
  approveHosRequest
);

router.put(
  "/requests/:id/reject",
  protect,
  requireActiveWorkspace,
  rejectHosRequest
);

module.exports = router;