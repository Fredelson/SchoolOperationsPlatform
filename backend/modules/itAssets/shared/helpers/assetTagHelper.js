/* =========================================================
   IT Asset Tag Helper
========================================================= */

const normalizeAssetTag = (assetTag) => {
  if (!assetTag) return "";
  return String(assetTag).trim().toUpperCase();
};

module.exports = {
  normalizeAssetTag,
};