// ============================================
// IT Asset Service
// Arab Unity School Operations Platform
// ============================================

import {
  getItAssetsApi,
  getItAssetByIdApi,
  getItAssetTimelineApi,
  getItAssetAuditApi,
  assignItAssetApi,
  returnItAssetApi,
  transferItAssetApi,
  getItAssetLookupsApi,
  getItAssetDisposalsApi,
  approveItAssetDisposalApi,
  rejectItAssetDisposalApi,
  completeItAssetDisposalApi,
  createItAssetMaintenanceApi,
  requestItAssetDisposalApi,
} from "../api/itAssetApi";

/**
 * Get paginated IT asset list.
 */
export const getItAssetsService = async (params = {}) => {
  const response = await getItAssetsApi(params);

  return {
    assets: response?.data || [],
    pagination: {
      page: response?.pagination?.page || 1,
      pageSize: response?.pagination?.limit || params.limit || 10,
      totalRecords: response?.pagination?.total || 0,
      totalPages: response?.pagination?.totalPages || 1,
    },
  };
};

/**
 * Get one IT asset by ID.
 */
export const getItAssetByIdService = async (assetId) => {
  const response = await getItAssetByIdApi(assetId);
  return response?.data || null;
};

/**
 * Get asset lifecycle timeline.
 */
export const getItAssetTimelineService = async (assetId) => {
  const response = await getItAssetTimelineApi(assetId);
  return response?.data || { timeline: [], summary: {} };
};

/**
 * Get asset audit history.
 */
export const getItAssetAuditService = async (assetId) => {
  const response = await getItAssetAuditApi(assetId);
  return response?.data || [];
};

/**
 * Assign asset.
 */
export const assignItAssetService = async (payload) => {
  const response = await assignItAssetApi(payload);
  return response?.data || null;
};

/**
 * Return asset.
 */
export const returnItAssetService = async (assetId, payload = {}) => {
  const response = await returnItAssetApi(assetId, payload);
  return response?.data || null;
};

/**
 * Get lookups used by asset actions.
 */
export const getItAssetLookupsService = async () => {
  const response = await getItAssetLookupsApi();
  return response?.data || {};
};

export const transferItAssetService = async (payload) => {
  const response = await transferItAssetApi(payload);
  return response?.data || null;
};

export const getItAssetDisposalsService = async () => {
  const response = await getItAssetDisposalsApi();
  return response?.data || [];
};

export const approveItAssetDisposalService = async (disposalId) => {
  const response = await approveItAssetDisposalApi(disposalId);
  return response?.data || null;
};

export const rejectItAssetDisposalService = async (disposalId) => {
  const response = await rejectItAssetDisposalApi(disposalId);
  return response?.data || null;
};

export const completeItAssetDisposalService = async (disposalId) => {
  const response = await completeItAssetDisposalApi(disposalId);
  return response?.data || null;
};

export const createItAssetMaintenanceService = async (payload) => {
  const response = await createItAssetMaintenanceApi(payload);
  return response?.data || null;
};

export const requestItAssetDisposalService = async (payload) => {
  const response = await requestItAssetDisposalApi(payload);
  return response?.data || null;
};
