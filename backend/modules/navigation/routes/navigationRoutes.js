// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Navigation Routes
// ============================================

const express = require("express");
const router = express.Router();

const { protect } = require("../../../middleware/authMiddleware");
const {
  getMySidebar,
  getMyRuntimeControls,
} = require("../controllers/navigationController");

router.use(protect);

router.get("/sidebar", getMySidebar);
router.get("/runtime-controls", getMyRuntimeControls);

module.exports = router;
