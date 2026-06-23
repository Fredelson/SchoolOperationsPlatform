// ============================================
// ARAB UNITY SCHOOL
// Access Level Routes
// ============================================

const express = require("express");
const router = express.Router();

const {
  getAccessLevels,
  createAccessLevel,
  updateAccessLevel,
  deleteAccessLevel,
} = require("../controllers/accessLevelController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// ============================================
// Routes
// ============================================

router.get(
  "/",
  protect,
  authorizeRoles("PrintingAdmin", "SuperAdmin"),
  getAccessLevels
);

router.post(
  "/",
  protect,
  authorizeRoles("PrintingAdmin", "SuperAdmin"),
  createAccessLevel
);

router.put(
  "/:id",
  protect,
  authorizeRoles("PrintingAdmin", "SuperAdmin"),
  updateAccessLevel
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("PrintingAdmin", "SuperAdmin"),
  deleteAccessLevel
);

module.exports = router;