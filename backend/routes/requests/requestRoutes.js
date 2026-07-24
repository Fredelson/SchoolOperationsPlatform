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

// ============================================================
// Controller Imports
// ============================================================

const {
  getHosDashboard,
  getHosRequests,
  getHosRequestById,
  getHosApprovalHistory,
  approveHosRequest,
  rejectHosRequest,
} = require("../../controllers/requests/hosController");

// ============================================================
// Authentication / Authorization Middleware
// ============================================================

const {
  protect,
} = require("../../middleware/authMiddleware");
const { requireActiveWorkspace } = require("../../middleware/permissionMiddleware");

// ============================================================
// Dashboard
// GET /api/hos/dashboard
// ============================================================

router.get(
  "/dashboard",
  protect,
  requireActiveWorkspace,
  getHosDashboard
);

// ============================================================
// Approval History
// GET /api/hos/approval-history
// ============================================================

router.get(
  "/approval-history",
  protect,
  requireActiveWorkspace,
  getHosApprovalHistory
);

// ============================================================
// Request Queue
// GET /api/hos/requests
// ============================================================

router.get(
  "/requests",
  protect,
  requireActiveWorkspace,
  getHosRequests
);

// ============================================================
// Request Details
// GET /api/hos/requests/:id
// ============================================================

router.get(
  "/requests/:id",
  protect,
  requireActiveWorkspace,
  getHosRequestById
);

// ============================================================
// Approve Request
// PUT /api/hos/requests/:id/approve
// ============================================================

router.put(
  "/requests/:id/approve",
  protect,
  requireActiveWorkspace,
  approveHosRequest
);

// ============================================================
// Reject Request
// PUT /api/hos/requests/:id/reject
// ============================================================

router.put(
  "/requests/:id/reject",
  protect,
  requireActiveWorkspace,
  rejectHosRequest
);

// ============================================================
// Export Router
// ============================================================

module.exports = router;