const express = require("express");
const router = express.Router();

const permissionGroupController = require("../controllers/permissionGroupController");
const { platformAdministrationAccess } = require("../../../middleware/platformAdministrationMiddleware");

router.use(...platformAdministrationAccess);

router.get("/", permissionGroupController.getPermissionGroups);
router.get("/:id", permissionGroupController.getPermissionGroupById);
router.post("/", permissionGroupController.createPermissionGroup);
router.put("/:id", permissionGroupController.updatePermissionGroup);
router.delete("/:id", permissionGroupController.deletePermissionGroup);

module.exports = router;
