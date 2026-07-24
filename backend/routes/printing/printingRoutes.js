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
const { requireActiveWorkspace } = require("../../middleware/permissionMiddleware");

const router = express.Router();

// ============================================================
// Printing Dashboard
// GET /api/printing/dashboard
// ============================================================
router.get(
  "/dashboard",
  protect,
  requireActiveWorkspace,
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
  requireActiveWorkspace,
  getPrintingHistory
);

// ============================================================
// Inventory Transaction Logs
// GET /api/printing/inventory-transactions
// ============================================================
router.get(
  "/inventory-transactions",
  protect,
  requireActiveWorkspace,
  getInventoryTransactions
);

// ============================================================
// Print Queue Requests
// GET /api/printing/requests
// ============================================================
router.get(
  "/requests",
  protect,
  requireActiveWorkspace,
  getPrintingRequests
);

// ============================================================
// Single Printing Request
// GET /api/printing/requests/:id
// ============================================================
router.get(
  "/requests/:id",
  protect,
  requireActiveWorkspace,
  getPrintingRequestById
);

// ============================================================
// Start Printing
// PUT /api/printing/requests/:id/start
// ============================================================
router.put(
  "/requests/:id/start",
  protect,
  requireActiveWorkspace,
  startPrinting
);

// ============================================================
// Complete Printing
// PUT /api/printing/requests/:id/complete
// ============================================================
router.put(
  "/requests/:id/complete",
  protect,
  requireActiveWorkspace,
  completePrinting
);

module.exports = router;