// ============================================
// ARAB UNITY SCHOOL
// HOS Routes
// ============================================

const express = require("express");

const {
  getHosDashboard,
  getHosRequests,
  getHosRequestById,
  getHosApprovalHistory,
  approveHosRequest,
  rejectHosRequest,
} = require("../controllers/hosController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// HOS dashboard KPI statistics
router.get(
  "/dashboard",
  protect,
  authorizeRoles("HOS", "SuperAdmin"),
  getHosDashboard
);

// HOS approval history
// IMPORTANT: keep this before /requests/:id
router.get(
  "/approval-history",
  protect,
  authorizeRoles("HOS", "SuperAdmin"),
  getHosApprovalHistory
);

// Get all HOS requests
router.get(
  "/requests",
  protect,
  authorizeRoles("HOS", "SuperAdmin"),
  getHosRequests
);

// Get single HOS request details
router.get(
  "/requests/:id",
  protect,
  authorizeRoles("HOS", "SuperAdmin"),
  getHosRequestById
);

// Approve request
router.put(
  "/requests/:id/approve",
  protect,
  authorizeRoles("HOS", "SuperAdmin"),
  approveHosRequest
);

// Reject request
router.put(
  "/requests/:id/reject",
  protect,
  authorizeRoles("HOS", "SuperAdmin"),
  rejectHosRequest
);

module.exports = router;