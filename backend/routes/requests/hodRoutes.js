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
  authorizeRoles,
} = require("../../middleware/authMiddleware");

const HOD_ACCESS = ["HOD", "SuperAdmin"];

router.get(
  "/dashboard",
  protect,
  authorizeRoles(...HOD_ACCESS),
  getHodDashboard
);

router.get(
  "/approval-history",
  protect,
  authorizeRoles(...HOD_ACCESS),
  getHodApprovalHistory
);

router.get(
  "/requests",
  protect,
  authorizeRoles(...HOD_ACCESS),
  getHodRequests
);

router.get(
  "/requests/:id",
  protect,
  authorizeRoles(...HOD_ACCESS),
  getHodRequestById
);

router.put(
  "/requests/:id/approve",
  protect,
  authorizeRoles(...HOD_ACCESS),
  approveHodRequest
);

router.put(
  "/requests/:id/reject",
  protect,
  authorizeRoles(...HOD_ACCESS),
  rejectHodRequest
);

module.exports = router;