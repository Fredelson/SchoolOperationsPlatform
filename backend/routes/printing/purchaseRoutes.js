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

// ============================================
// Controller Imports
// ============================================

const {
  getPurchases,
  addPurchase,
} = require("../../controllers/printing/purchaseController");

// ============================================
// Middleware Imports
// ============================================

const {
  protect,
  authorizeRoles,
} = require("../../middleware/authMiddleware");

// ============================================
// Routes
// ============================================

// GET /api/purchases
router.get(
  "/",
  protect,
  authorizeRoles("PrintingAdmin", "SuperAdmin"),
  getPurchases
);

// POST /api/purchases
router.post(
  "/",
  protect,
  authorizeRoles("PrintingAdmin", "SuperAdmin"),
  addPurchase
);

// ============================================
// Exports
// ============================================

module.exports = router;