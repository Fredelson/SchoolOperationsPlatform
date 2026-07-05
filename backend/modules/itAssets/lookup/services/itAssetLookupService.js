/* =========================================================
   IT Asset Lookup Service
========================================================= */

const itAssetLookupRepository = require("../repositories/itAssetLookupRepository");

const getITAssetLookups = async () => {
  return await itAssetLookupRepository.getITAssetLookups();
};

module.exports = {
  getITAssetLookups,
};