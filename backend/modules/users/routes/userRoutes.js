// backend/modules/users/routes/userRoutes.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Users Routes
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

const { protect } = require("../../../middleware/authMiddleware");
const requirePermission = require("../../permissionResolver/middleware/requirePermission");
const PERMISSIONS = require("../../../shared/permissions/permissionKeys");

router.use(protect);

router.get("/", requirePermission(PERMISSIONS.USERS.VIEW), getUsers);
router.get("/:id", requirePermission(PERMISSIONS.USERS.VIEW), getUserById);
router.post("/", requirePermission(PERMISSIONS.USERS.CREATE), createUser);
router.put("/:id", requirePermission(PERMISSIONS.USERS.UPDATE), updateUser);
router.put("/:id/deactivate", requirePermission(PERMISSIONS.USERS.DEACTIVATE), deactivateUser);
router.put("/:id/activate", requirePermission(PERMISSIONS.USERS.ACTIVATE), activateUser);

module.exports = router;