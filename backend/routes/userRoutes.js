// ============================================
// ARAB UNITY SCHOOL
// User Management Routes
// ============================================

const express = require("express");
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  activateUser,
} = require("../controllers/userController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Only admin-level users can manage users
router.use(protect);
router.use(authorizeRoles("SuperAdmin", "Admin", "PrintingAdmin"));

// GET /api/users
router.get("/", getUsers);

// GET /api/users/:id
router.get("/:id", getUserById);

// POST /api/users
router.post("/", createUser);

// PUT /api/users/:id
router.put("/:id", updateUser);

// PUT /api/users/:id/deactivate
router.put("/:id/deactivate", deactivateUser);

// PUT /api/users/:id/activate
router.put("/:id/activate", activateUser);

module.exports = router;