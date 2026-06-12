// ============================================
// ARAB UNITY SCHOOL
// HOD Routes
// ============================================

const express = require("express");

const {
  getHodDashboard,
  getHodRequests,
  getHodRequestById,
  getHodApprovalHistory,
  approveHodRequest,
  rejectHodRequest,
} = require("../controllers/hodController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// HOD dashboard KPI statistics
router.get(
  "/dashboard",
  protect,
  authorizeRoles("HOD", "SuperAdmin"),
  getHodDashboard
);

// HOD approval history from RequestApprovals table
// IMPORTANT: keep this before /requests/:id
router.get(
  "/approval-history",
  protect,
  authorizeRoles("HOD", "SuperAdmin"),
  getHodApprovalHistory
);

// Get all HOD requests
router.get(
  "/requests",
  protect,
  authorizeRoles("HOD", "SuperAdmin"),
  getHodRequests
);

// Get single HOD request details
router.get(
  "/requests/:id",
  protect,
  authorizeRoles("HOD", "SuperAdmin"),
  getHodRequestById
);

// Approve request
router.put(
  "/requests/:id/approve",
  protect,
  authorizeRoles("HOD", "SuperAdmin"),
  approveHodRequest
);

// Reject request
router.put(
  "/requests/:id/reject",
  protect,
  authorizeRoles("HOD", "SuperAdmin"),
  rejectHodRequest
);

module.exports = router;