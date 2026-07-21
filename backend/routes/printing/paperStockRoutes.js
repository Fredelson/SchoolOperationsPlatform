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
} = require("../../middleware/authMiddleware");
const requirePermission = require("../../modules/permissionResolver/middleware/requirePermission");

const router = express.Router();

// GET stock
router.get(
  "/",
  protect,
  requirePermission("printing.inventory.view"),
  getPaperStock
);

// UPDATE stock
router.put(
  "/",
  protect,
  requirePermission("printing.inventory.update"),
  updatePaperStock
);

module.exports = router;
