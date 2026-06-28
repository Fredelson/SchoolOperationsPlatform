// backend/modules/users/routes/userRoutes.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Users Routes
 * ============================================================
 *
 * Final API paths:
 * GET    /api/users
 * GET    /api/users/:id
 * POST   /api/users
 * PUT    /api/users/:id
 * PUT    /api/users/:id/deactivate
 * PUT    /api/users/:id/activate
 * ============================================================
 */

const express = require("express");
const router = express.Router();

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  activateUser,
} = require("../controllers/userController");

const { protect, authorizeRoles } = require("../../../middleware/authMiddleware");

router.use(protect);

// PlatformAdmin is included because it inherits PrintingAdmin permissions.
router.use(authorizeRoles("SuperAdmin", "PlatformAdmin", "Admin", "PrintingAdmin"));

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.put("/:id/deactivate", deactivateUser);
router.put("/:id/activate", activateUser);

module.exports = router;