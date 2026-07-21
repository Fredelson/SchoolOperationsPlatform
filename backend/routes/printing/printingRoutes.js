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
} = require("../../middleware/authMiddleware");
const requirePermission = require("../../modules/permissionResolver/middleware/requirePermission");

const router = express.Router();

// ============================================================
// Printing Dashboard
// GET /api/printing/dashboard
// ============================================================
router.get(
  "/dashboard",
  protect,
  requirePermission("printing.dashboard.view"),
  getPrintingDashboard
);

// ============================================================
// Printing History
// IMPORTANT: keep this before /requests/:id
// GET /api/printing/history
// ============================================================
router.get(
  "/history",
  protect,
  requirePermission("printing.history.view"),
  getPrintingHistory
);

// ============================================================
// Inventory Transaction Logs
// GET /api/printing/inventory-transactions
// ============================================================
router.get(
  "/inventory-transactions",
  protect,
  requirePermission("printing.inventory.view"),
  getInventoryTransactions
);

// ============================================================
// Print Queue Requests
// GET /api/printing/requests
// ============================================================
router.get(
  "/requests",
  protect,
  requirePermission("printing.queue.view"),
  getPrintingRequests
);

// ============================================================
// Single Printing Request
// GET /api/printing/requests/:id
// ============================================================
router.get(
  "/requests/:id",
  protect,
  requirePermission("printing.request.view"),
  getPrintingRequestById
);

// ============================================================
// Start Printing
// PUT /api/printing/requests/:id/start
// ============================================================
router.put(
  "/requests/:id/start",
  protect,
  requirePermission("printing.request.start"),
  startPrinting
);

// ============================================================
// Complete Printing
// PUT /api/printing/requests/:id/complete
// ============================================================
router.put(
  "/requests/:id/complete",
  protect,
  requirePermission("printing.request.complete"),
  completePrinting
);

module.exports = router;