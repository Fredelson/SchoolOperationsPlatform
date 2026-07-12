// ============================================================
// ARAB UNITY SCHOOL OPERATIONS PLATFORM
// Asset Tag Branding Routes
// ============================================================

const express = require("express");

const router = express.Router();

const { protect } = require("../../middleware/authMiddleware");
const requirePermission = require("../permissionResolver/middleware/requirePermission");

const {
  ASSET_TAG_BRANDING_PERMISSIONS,
} = require("./constants");

const controller = require("./controller");

function requireBrandingPermission(action) {
  return (req, res, next) => {
    const permissionKey =
      ASSET_TAG_BRANDING_PERMISSIONS[req.params.type]?.[action];

    if (!permissionKey) {
      return res.status(400).json({
        success: false,
        message: "Invalid asset tag branding type.",
        errors: {
          type: req.params.type,
        },
      });
    }

    return requirePermission(permissionKey)(req, res, next);
  };
}

router.get(
  "/:type",
  protect,
  requireBrandingPermission("view"),
  controller.getAssetTagBranding
);

router.put(
  "/:type",
  protect,
  requireBrandingPermission("manage"),
  controller.updateAssetTagBranding
);

module.exports = router;
