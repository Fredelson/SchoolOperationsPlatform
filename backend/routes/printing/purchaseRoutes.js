// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Paper Purchase Routes
//
// Purpose:
// - View paper purchase records
// - Add new paper purchase records
// ============================================

const express = require("express");
const router = express.Router();

// ============================================================
// Controller Imports
// ============================================================

const {
  getPurchases,
  addPurchase,
} = require("../../controllers/printing/purchaseController");

// ============================================================
// Middleware Imports
// ============================================================

const {
  protect,
} = require("../../middleware/authMiddleware");
const requirePermission = require("../../modules/permissionResolver/middleware/requirePermission");

// ============================================================
// Routes
// ============================================================

// GET /api/purchases
router.get(
  "/",
  protect,
  requirePermission("printing.purchases.view"),
  getPurchases
);

// POST /api/purchases
router.post(
  "/",
  protect,
  requirePermission("printing.purchases.create"),
  addPurchase
);

// ============================================================
// Exports
// ============================================================

module.exports = router;