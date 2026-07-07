// backend/modules/users/routes/userRoutes.js

/**
 * ============================================================
 * Arab Unity School Operations Platform
 * Users Routes
 * ============================================================
 *
 * Purpose:
 * Defines enterprise user management routes.
 *
 * Includes:
 * - User CRUD
 * - Activate / Deactivate
 * - Staff Excel/CSV Import Preview
 * - Staff Import Commit
 * - Staff Import History
 * ============================================================
 */

const express = require("express");
const multer = require("multer");

const router = express.Router();

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  activateUser,
} = require("../controllers/userController");

const {
  previewUserImport,
  commitUserImport,
  getUserImportHistory,
} = require("../controllers/userImportController");

const { protect } = require("../../../middleware/authMiddleware");
const requirePermission = require("../../permissionResolver/middleware/requirePermission");
const PERMISSIONS = require("../../../shared/permissions/permissionKeys");

/**
 * Temporary upload storage for user imports.
 */
const upload = multer({
  dest: "uploads/imports/users/",
});

/**
 * All Users routes require authentication.
 */
router.use(protect);

/**
 * ------------------------------------------------------------
 * User Import Routes
 * ------------------------------------------------------------
 *
 * NOTE:
 * These must be registered before "/:id" routes.
 */
router.post(
  "/import/preview",
  upload.single("file"),
  previewUserImport
);

router.post(
  "/import/commit",
  commitUserImport
);

router.get(
  "/import/history",
  getUserImportHistory
);

/**
 * ------------------------------------------------------------
 * User CRUD Routes
 * ------------------------------------------------------------
 */
router.get("/", requirePermission(PERMISSIONS.USERS.VIEW), getUsers);
router.get("/:id", requirePermission(PERMISSIONS.USERS.VIEW), getUserById);
router.post("/", requirePermission(PERMISSIONS.USERS.CREATE), createUser);
router.put("/:id", requirePermission(PERMISSIONS.USERS.UPDATE), updateUser);

router.put(
  "/:id/deactivate",
  requirePermission(PERMISSIONS.USERS.DEACTIVATE),
  deactivateUser
);

router.put(
  "/:id/activate",
  requirePermission(PERMISSIONS.USERS.ACTIVATE),
  activateUser
);

module.exports = router;