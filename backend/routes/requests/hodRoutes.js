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
const requirePermission = require("../../modules/permissionResolver/middleware/requirePermission");

const HOD_ACCESS = ["HOD", "SuperAdmin"];

router.get(
  "/dashboard",
  protect,
  requirePermission("requests.view"),
  getHodDashboard
);

router.get(
  "/approval-history",
  protect,
  requirePermission("requests.view"),
  getHodApprovalHistory
);

router.get(
  "/requests",
  protect,
  requirePermission("requests.view"),
  getHodRequests
);

router.get(
  "/requests/:id",
  protect,
  requirePermission("requests.view"),
  getHodRequestById
);

router.put(
  "/requests/:id/approve",
  protect,
  requirePermission("requests.approve"),
  approveHodRequest
);

router.put(
  "/requests/:id/reject",
  protect,
  requirePermission("requests.reject"),
  rejectHodRequest
);

module.exports = router;