// ============================================================
// Arab Unity School Operations Platform
// User Permission Override Routes
// ============================================================

const express = require("express");
const router = express.Router();

const controller = require("../controllers/userPermissionOverrideController");
const { protect } = require("../../../middleware/authMiddleware");
const { requireActiveWorkspace } = require("../../../middleware/permissionMiddleware");

router.get("/lookups", protect, controller.getLookups);

router.use(protect);

router.get("/", requireActiveWorkspace, controller.getAllOverrides);
router.get("/user/:userId", requireActiveWorkspace, controller.getOverridesByUserId);
router.get("/:id", requireActiveWorkspace, controller.getOverrideById);
router.post("/", requireActiveWorkspace, controller.createOverride);
router.put("/:id", requireActiveWorkspace, controller.updateOverride);
router.delete("/:id", requireActiveWorkspace, controller.deleteOverride);

module.exports = router;
