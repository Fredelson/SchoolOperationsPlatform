const assetTagBrandingService = require("../services/assetTagBrandingService");

const getUserId = (req) => req.user?.id || req.user?.UserId || null;

const getBranding = async (req, res) => {
  try {
    const data = await assetTagBrandingService.getBranding(req.params.type);
    res.json({ success: true, data });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

const saveBranding = async (req, res) => {
  try {
    const data = await assetTagBrandingService.saveBranding({
      type: req.params.type,
      settings: req.body?.settings || req.body,
      userId: getUserId(req),
    });
    res.json({ success: true, data });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

const uploadTemplate = async (req, res) => {
  try {
    const data = await assetTagBrandingService.uploadTemplate({
      type: req.params.type,
      file: req.file,
      userId: getUserId(req),
    });
    res.json({ success: true, data });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

const removeTemplate = async (req, res) => {
  try {
    const data = await assetTagBrandingService.removeTemplate({
      type: req.params.type,
      userId: getUserId(req),
    });
    res.json({ success: true, data });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: error.message });
  }
};

module.exports = {
  getBranding,
  removeTemplate,
  saveBranding,
  uploadTemplate,
};
