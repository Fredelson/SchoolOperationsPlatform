// ============================================
// ARAB UNITY SCHOOL
// Paper Stock Routes
// ============================================

const express = require("express");

const {
  getPaperStock,
  updatePaperStock,
} = require("../../controllers/printing/paperStockController");

const {
  protect,
  authorizeRoles,
} = require("../../middleware/authMiddleware");

const router = express.Router();

// GET stock
router.get(
  "/",
  protect,
  authorizeRoles("PrintingAdmin", "SuperAdmin"),
  getPaperStock
);

// UPDATE stock
router.put(
  "/",
  protect,
  authorizeRoles("PrintingAdmin", "SuperAdmin"),
  updatePaperStock
);

module.exports = router;