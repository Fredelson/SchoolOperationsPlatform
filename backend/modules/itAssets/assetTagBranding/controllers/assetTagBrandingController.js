const { getAssetTagBranding } = require("../repositories/assetTagBrandingRepository");

const getBranding = async (req, res) => {
  try {
    const type = req.params.type || "rounded";
    const data = await getAssetTagBranding(type);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const saveBranding = async (req, res) => {
  try {
    const type = req.params.type || "rounded";
    const { settings, organization } = req.body || {};
    res.json({ success: true, data: { type, settings, organization } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getBranding, saveBranding };