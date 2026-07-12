// ============================================
// ARAB UNITY SCHOOL
// Super Admin - Button Routes
// Button / Action Manager
// ============================================

const express = require("express");
const router = express.Router();

const {
  getButtons,
  updateButton,
} = require("../../controllers/superadmin/buttonController");

const { protect } = require("../../middleware/authMiddleware");
const requirePermission = require("../../modules/permissionResolver/middleware/requirePermission");

// GET /api/superadmin/buttons
router.get(
  "/",
  protect,
  requirePermission("Button.View"),
  getButtons
);

// PUT /api/superadmin/buttons/:id
router.put(
  "/:id",
  protect,
  requirePermission("Button.Edit"),
  updateButton
);

module.exports = router;
