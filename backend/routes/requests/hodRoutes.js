// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// HOD Routes
//
// Purpose:
// - HOD dashboard
// - HOD request approval queue
// - HOD approval/rejection actions
// ============================================

const express = require("express");
const router = express.Router();

const {
  getHodDashboard,
  getHodRequests,
  getHodRequestById,
  getHodApprovalHistory,
  approveHodRequest,
  rejectHodRequest,
} = require("../../controllers/requests/hodController");

const {
  protect,
} = require("../../middleware/authMiddleware");
const { requireActiveWorkspace } = require("../../middleware/permissionMiddleware");

const HOD_ACCESS = ["HOD", "SuperAdmin"];

router.get(
  "/dashboard",
  protect,
  requireActiveWorkspace,
  getHodDashboard
);

router.get(
  "/approval-history",
  protect,
  requireActiveWorkspace,
  getHodApprovalHistory
);

router.get(
  "/requests",
  protect,
  requireActiveWorkspace,
  getHodRequests
);

router.get(
  "/requests/:id",
  protect,
  requireActiveWorkspace,
  getHodRequestById
);

router.put(
  "/requests/:id/approve",
  protect,
  requireActiveWorkspace,
  approveHodRequest
);

router.put(
  "/requests/:id/reject",
  protect,
  requireActiveWorkspace,
  rejectHodRequest
);

module.exports = router;