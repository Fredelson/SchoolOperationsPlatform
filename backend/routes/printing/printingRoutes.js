// ============================================
// ARAB UNITY SCHOOL
// Printing Admin Routes
// ============================================

const express = require("express");

const {
  getPrintingDashboard,
  getPrintingRequests,
  getPrintingRequestById,
  startPrinting,
  completePrinting,
  getPrintingHistory,
  getInventoryTransactions,
} = require("../../controllers/printing/printingController");

const {
  protect,
  authorizeRoles,
} = require("../../middleware/authMiddleware");

const router = express.Router();

// ============================================
// Printing Dashboard
// GET /api/printing/dashboard
// ============================================
router.get(
  "/dashboard",
  protect,
  authorizeRoles("PrintingAdmin", "SuperAdmin"),
  getPrintingDashboard
);

// ============================================
// Printing History
// IMPORTANT: keep this before /requests/:id
// GET /api/printing/history
// ============================================
router.get(
  "/history",
  protect,
  authorizeRoles("PrintingAdmin", "SuperAdmin"),
  getPrintingHistory
);

// ============================================
// Inventory Transaction Logs
// GET /api/printing/inventory-transactions
// ============================================
router.get(
  "/inventory-transactions",
  protect,
  authorizeRoles("PrintingAdmin", "SuperAdmin"),
  getInventoryTransactions
);

// ============================================
// Print Queue Requests
// GET /api/printing/requests
// ============================================
router.get(
  "/requests",
  protect,
  authorizeRoles("PrintingAdmin", "SuperAdmin"),
  getPrintingRequests
);

// ============================================
// Single Printing Request
// GET /api/printing/requests/:id
// ============================================
router.get(
  "/requests/:id",
  protect,
  authorizeRoles("PrintingAdmin", "SuperAdmin"),
  getPrintingRequestById
);

// ============================================
// Start Printing
// PUT /api/printing/requests/:id/start
// ============================================
router.put(
  "/requests/:id/start",
  protect,
  authorizeRoles("PrintingAdmin", "SuperAdmin"),
  startPrinting
);

// ============================================
// Complete Printing
// PUT /api/printing/requests/:id/complete
// ============================================
router.put(
  "/requests/:id/complete",
  protect,
  authorizeRoles("PrintingAdmin", "SuperAdmin"),
  completePrinting
);

module.exports = router;