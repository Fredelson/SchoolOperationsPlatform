const express = require("express");
const router = express.Router();
const upload = require("../../../../middleware/uploadMiddleware");
const requirePermission = require("../../../permissionResolver/middleware/requirePermission");
const {
  getBranding,
  removeTemplate,
  saveBranding,
  uploadTemplate,
} = require("../controllers/assetTagBrandingController");

const requireTypePermission = (action) => (req, res, next) => {
  const type = String(req.params.type || "").trim().toLowerCase();

  if (!["rounded", "rectangular"].includes(type)) {
    return res.status(400).json({
      success: false,
      message: "Unsupported asset tag branding type.",
    });
  }

  return requirePermission(`asset_tag_branding.${type}.${action}`)(req, res, next);
};

router.get("/:type", requireTypePermission("view"), getBranding);
router.put("/:type", requireTypePermission("manage"), saveBranding);
router.post(
  "/:type/template",
  requireTypePermission("manage"),
  upload.single("file"),
  uploadTemplate
);
router.delete("/:type/template", requireTypePermission("manage"), removeTemplate);

module.exports = router;
