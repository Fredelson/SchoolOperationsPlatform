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
const { requireActiveWorkspace } = require("../../middleware/permissionMiddleware");

const router = express.Router();

// GET stock
router.get(
  "/",
  protect,
  requireActiveWorkspace,
  getPaperStock
);

// UPDATE stock
router.put(
  "/",
  protect,
  requireActiveWorkspace,
  updatePaperStock
);

module.exports = router;
