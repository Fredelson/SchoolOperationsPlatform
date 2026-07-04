/* =========================================================
   Permission Routes
   Purpose:
   Defines all API endpoints for Permission Manager.
========================================================= */

const express = require("express");
const router = express.Router();

const permissionController = require("../controllers/permissionController");

/* =========================================================
   Permission Manager API Routes

   Base route:
   /api/permissions
========================================================= */

router.get("/lookups", permissionController.getPermissionLookups);
router.get("/", permissionController.getPermissions);
router.get("/:id", permissionController.getPermissionById);
router.post("/", permissionController.createPermission);
router.put("/:id", permissionController.updatePermission);
router.delete("/:id", permissionController.deletePermission);

module.exports = router;