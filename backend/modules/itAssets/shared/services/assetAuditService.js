/* =========================================================
   IT Asset Audit Service

   Purpose:
   Converts IT Asset business events into enterprise audit logs.

   Notes:
   - No validation here
   - No SQL here
   - No CRUD logic here
   - Only IT Asset audit/event logging
========================================================= */

const { activityLogger } = require("../../../audit");
const ASSET_ACTIONS = require("../constants/assetActions");

const logAssetCreated = async ({ asset, user, ipAddress = null }) => {
  return activityLogger.log({
    moduleKey: "IT_ASSETS",
    actionType: ASSET_ACTIONS.CREATED,
    entityType: "ITAsset",
    entityId: asset.AssetId,
    title: "Asset Created",
    description: `Asset ${asset.AssetTag} was created.`,
    oldValue: null,
    newValue: asset,
    user,
    ipAddress,
  });
};

const logAssetUpdated = async ({
  assetId,
  oldValue,
  newValue,
  user,
  ipAddress = null,
}) => {
  return activityLogger.log({
    moduleKey: "IT_ASSETS",
    actionType: ASSET_ACTIONS.UPDATED,
    entityType: "ITAsset",
    entityId: assetId,
    title: "Asset Updated",
    description: `Asset ${newValue?.AssetTag || assetId} was updated.`,
    oldValue,
    newValue,
    user,
    ipAddress,
  });
};

const logAssetDeleted = async ({ asset, user, ipAddress = null }) => {
  return activityLogger.log({
    moduleKey: "IT_ASSETS",
    actionType: ASSET_ACTIONS.DELETED,
    entityType: "ITAsset",
    entityId: asset.AssetId,
    title: "Asset Deleted",
    description: `Asset ${asset.AssetTag} was soft deleted.`,
    oldValue: asset,
    newValue: { ...asset, IsDeleted: true },
    user,
    ipAddress,
  });
};

module.exports = {
  logAssetCreated,
  logAssetUpdated,
  logAssetDeleted,
};