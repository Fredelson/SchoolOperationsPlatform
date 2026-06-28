// ============================================================
// Arab Unity School Operations Platform
// Printing Routes
// ============================================================
//
// Purpose:
// Defines Printing module API endpoints.
//
// Architecture:
// Routes Layer
//
// Final API paths:
// GET  /api/printing/dashboard
// GET  /api/printing/requests
// GET  /api/printing/requests/:id
// PUT  /api/printing/requests/:id/start
// PUT  /api/printing/requests/:id/hold
// PUT  /api/printing/requests/:id/resume
// PUT  /api/printing/requests/:id/cancel
// PUT  /api/printing/requests/:id/complete
// GET  /api/printing/history
//
// ============================================================

const express = require("express");
const router = express.Router();

const {
  getPrintingDashboard,
  getPrintingQueue,
  getPrintingRequestById,
  startPrinting,
  holdPrinting,
  resumePrinting,
  cancelPrinting,
  completePrinting,
  getPrintingHistory,
} = require("../controllers/printingController");

const {
  validatePrintingRequestId,
  validateOptionalRemarks,
  validateCompletePrinting,
} = require("../validators/printingValidator");

const { protect } = require("../../../middleware/authMiddleware");
const requirePermission = require("../../permissionResolver/middleware/requirePermission");
const PERMISSIONS = require("../../../shared/permissions/permissionKeys");

// ============================================================
// All Printing routes require authentication
// ============================================================

router.use(protect);

// ============================================================
// Dashboard / Queue / History
// ============================================================

router.get(
  "/dashboard",
  requirePermission(PERMISSIONS.PRINTING.DASHBOARD_VIEW),
  getPrintingDashboard
);

router.get(
  "/requests",
  requirePermission(PERMISSIONS.PRINTING.QUEUE_VIEW),
  getPrintingQueue
);

router.get(
  "/history",
  requirePermission(PERMISSIONS.PRINTING.HISTORY_VIEW),
  getPrintingHistory
);

// ============================================================
// Single Request
// ============================================================

router.get(
  "/requests/:id",
  requirePermission(PERMISSIONS.PRINTING.REQUEST_VIEW),
  validatePrintingRequestId,
  getPrintingRequestById
);

// ============================================================
// Workflow Actions
// ============================================================

router.put(
  "/requests/:id/start",
  requirePermission(PERMISSIONS.PRINTING.START),
  validatePrintingRequestId,
  startPrinting
);

router.put(
  "/requests/:id/hold",
  requirePermission(PERMISSIONS.PRINTING.HOLD),
  validatePrintingRequestId,
  validateOptionalRemarks,
  holdPrinting
);

router.put(
  "/requests/:id/resume",
  requirePermission(PERMISSIONS.PRINTING.RESUME),
  validatePrintingRequestId,
  resumePrinting
);

router.put(
  "/requests/:id/cancel",
  requirePermission(PERMISSIONS.PRINTING.CANCEL),
  validatePrintingRequestId,
  validateOptionalRemarks,
  cancelPrinting
);

router.put(
  "/requests/:id/complete",
  requirePermission(PERMISSIONS.PRINTING.COMPLETE),
  validatePrintingRequestId,
  validateCompletePrinting,
  completePrinting
);

// ============================================================
// Exports
// ============================================================

module.exports = router;