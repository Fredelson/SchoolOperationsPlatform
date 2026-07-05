/* =========================================================
   IT Asset Command Service

   Purpose:
   Handles write operations for IT Assets.
========================================================= */

const itAssetRepository = require("../repositories/itAssetRepository");
const assetQueryService = require("./assetQueryService");
const assetValidationService = require("./assetValidationService");
const assetAuditService = require("../../shared/services/assetAuditService");
const { normalizeAssetTag } = require("../../shared/helpers/assetTagHelper");

const createAsset = async (payload, currentUser, ipAddress = null) => {
  await assetValidationService.validateAssetReferences(payload);

  const normalizedTag = normalizeAssetTag(payload.assetTag);

  const duplicate = await itAssetRepository.getAssetByTag(normalizedTag);

  if (duplicate) {
    const error = new Error("Asset tag already exists.");
    error.statusCode = 409;
    throw error;
  }

  const createdAsset = await itAssetRepository.createAsset({
    ...payload,
    assetTag: normalizedTag,
  });

  await assetAuditService.logAssetCreated({
    asset: createdAsset,
    user: currentUser,
    ipAddress,
  });

  return createdAsset;
};

const updateAsset = async (assetId, payload, currentUser, ipAddress = null) => {
  const existingAsset = await assetQueryService.getAssetById(assetId);

  await assetValidationService.validateAssetReferences(payload);

  const normalizedTag = normalizeAssetTag(payload.assetTag);

  const duplicate = await itAssetRepository.getAssetByTag(
    normalizedTag,
    assetId
  );

  if (duplicate) {
    const error = new Error("Asset tag already exists.");
    error.statusCode = 409;
    throw error;
  }

  const updatedAsset = await itAssetRepository.updateAsset(assetId, {
    ...payload,
    assetTag: normalizedTag,
  });

  await assetAuditService.logAssetUpdated({
    assetId,
    oldValue: existingAsset,
    newValue: updatedAsset,
    user: currentUser,
    ipAddress,
  });

  return updatedAsset;
};

const softDeleteAsset = async (assetId, currentUser, ipAddress = null) => {
  const existingAsset = await assetQueryService.getAssetById(assetId);

  const deletedBy =
    currentUser?.UserId || currentUser?.userId || currentUser?.id || null;

  const deletedAsset = await itAssetRepository.softDeleteAsset(
    assetId,
    deletedBy
  );

  await assetAuditService.logAssetDeleted({
    asset: existingAsset,
    user: currentUser,
    ipAddress,
  });

  return deletedAsset;
};

module.exports = {
  createAsset,
  updateAsset,
  softDeleteAsset,
};