/* =========================================================
   IT Asset Disposal Service
========================================================= */

const repository = require("../repositories/assetDisposalRepository");

const userId = (user) => user?.id || user?.UserId || null;

const requestDisposal = async ({ payload, user }) => {
  const asset = await repository.getAssetById(payload.assetId);

  if (!asset) {
    throw Object.assign(new Error("IT asset not found."), { statusCode: 404 });
  }

  const existingDisposal = await repository.getOpenDisposalForAsset(payload.assetId);
  if (existingDisposal) {
    throw Object.assign(
      new Error("This asset already has a pending or approved disposal request."),
      { statusCode: 409 }
    );
  }

  return repository.requestDisposal({
    payload,
    requestedBy: userId(user),
  });
};

const approveDisposal = async ({ payload, user }) => {
  const disposal = await repository.approveDisposal({
    disposalId: payload.disposalId,
    approvedBy: userId(user),
  });

  if (!disposal) {
    throw Object.assign(new Error("Disposal request not found or not pending."), { statusCode: 404 });
  }

  return disposal;
};

const rejectDisposal = async ({ payload, user }) => {
  const disposal = await repository.rejectDisposal({
    disposalId: payload.disposalId,
    approvedBy: userId(user),
  });

  if (!disposal) {
    throw Object.assign(new Error("Disposal request not found or not pending."), { statusCode: 404 });
  }

  return disposal;
};

const completeDisposal = async ({ payload, user, ipAddress }) => {
  const disposal = await repository.getDisposalById(payload.disposalId);

  if (!disposal) {
    throw Object.assign(new Error("Disposal request not found."), { statusCode: 404 });
  }

  if (disposal.DisposalStatus !== "APPROVED") {
    throw Object.assign(new Error("Disposal request must be approved before completion."), {
      statusCode: 400,
    });
  }

  const asset = await repository.getAssetById(disposal.AssetId);

  if (!asset) {
    throw Object.assign(new Error("IT asset not found."), { statusCode: 404 });
  }

  const disposedStatus =
  (await repository.getStatusByKey("DISPOSED")) ||
  (await repository.getStatusByKey("Disposed"));

  if (!disposedStatus) {
    throw Object.assign(new Error("Disposed status is missing."), { statusCode: 400 });
  }

  return repository.completeDisposal({
    disposal,
    asset,
    disposedStatusId: disposedStatus.ITAssetStatusId,
    actionByUserId: userId(user),
    ipAddress,
  });
};

const getDisposals = async ({ status = null, assetId = null }) => {
  return repository.getDisposals({ status, assetId });
};

module.exports = {
  requestDisposal,
  approveDisposal,
  rejectDisposal,
  completeDisposal,
  getDisposals,
};
