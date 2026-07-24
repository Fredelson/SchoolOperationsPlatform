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
const { requireActiveWorkspace } = require("../../middleware/permissionMiddleware");

// ============================================================
// Routes
// ============================================================

// GET /api/purchases
router.get(
  "/",
  protect,
  requireActiveWorkspace,
  getPurchases
);

// POST /api/purchases
router.post(
  "/",
  protect,
  requireActiveWorkspace,
  addPurchase
);

// ============================================================
// Exports
// ============================================================

module.exports = router;