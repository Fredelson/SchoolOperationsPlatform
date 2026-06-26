// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// HOS Routes
//
// Purpose:
// Handles all HOS (Head of Section) request
// approval workflow.
//
// Access Levels:
// - HOS
// - Secretary
// - SuperAdmin
//
// Notes:
// Secretary shares the same permissions as HOS.
// ============================================

const express = require("express");
const router = express.Router();

// ============================================
// Controller Imports
// ============================================

const {
  getHosDashboard,
  getHosRequests,
  getHosRequestById,
  getHosApprovalHistory,
  approveHosRequest,
  rejectHosRequest,
} = require("../../controllers/requests/hosController");

// ============================================
// Authentication / Authorization Middleware
// ============================================

const {
  protect,
  authorizeRoles,
} = require("../../middleware/authMiddleware");

// ============================================
// Shared Role Access
// ============================================

const HOS_ACCESS = [
  "HOS",
  "Secretary",
  "SuperAdmin",
];

// ============================================
// Dashboard
// GET /api/hos/dashboard
// ============================================

router.get(
  "/dashboard",
  protect,
  authorizeRoles(...HOS_ACCESS),
  getHosDashboard
);

// ============================================
// Approval History
// GET /api/hos/approval-history
// ============================================

router.get(
  "/approval-history",
  protect,
  authorizeRoles(...HOS_ACCESS),
  getHosApprovalHistory
);

// ============================================
// Request Queue
// GET /api/hos/requests
// ============================================

router.get(
  "/requests",
  protect,
  authorizeRoles(...HOS_ACCESS),
  getHosRequests
);

// ============================================
// Request Details
// GET /api/hos/requests/:id
// ============================================

router.get(
  "/requests/:id",
  protect,
  authorizeRoles(...HOS_ACCESS),
  getHosRequestById
);

// ============================================
// Approve Request
// PUT /api/hos/requests/:id/approve
// ============================================

router.put(
  "/requests/:id/approve",
  protect,
  authorizeRoles(...HOS_ACCESS),
  approveHosRequest
);

// ============================================
// Reject Request
// PUT /api/hos/requests/:id/reject
// ============================================

router.put(
  "/requests/:id/reject",
  protect,
  authorizeRoles(...HOS_ACCESS),
  rejectHosRequest
);

// ============================================
// Export Router
// ============================================

module.exports = router;