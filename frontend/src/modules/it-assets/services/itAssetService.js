// ============================================
// IT Asset Service
// Arab Unity School Operations Platform
// ============================================

import api from "../../../services/api";

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
  getActiveItAssetAssignmentsApi,
  getItAssetAssignmentHistoryApi,
  getItAssetTransfersApi,
  getItAssetIssuesApi,
  getItAssetMaintenanceLogsApi,
  getItAssetMaintenanceDueApi,
  completeItAssetMaintenanceApi,
  borrowItAssetApi,
  returnBorrowedItAssetApi,
  getActiveItAssetBorrowsApi,
  getOverdueItAssetBorrowsApi,
  getItAssetBorrowHistoryApi,
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

export const getActiveItAssetAssignmentsService = async (params = {}) => {
  const response = await getActiveItAssetAssignmentsApi(params);
  return { rows: response?.data || [], pagination: response?.pagination || {} };
};

export const getItAssetAssignmentHistoryService = async (params = {}) => {
  const response = await getItAssetAssignmentHistoryApi(params);
  return { rows: response?.data || [], pagination: response?.pagination || {} };
};

export const getItAssetTransfersService = async () => {
  const response = await getItAssetTransfersApi();
  return response?.data || [];
};

export const getItAssetIssuesService = async (params = {}) => {
  const response = await getItAssetIssuesApi(params);
  return response?.data || [];
};

export const getItAssetMaintenanceLogsService = async (params = {}) => {
  const response = await getItAssetMaintenanceLogsApi(params);
  return response?.data || [];
};

export const getItAssetMaintenanceDueService = async () => {
  const response = await getItAssetMaintenanceDueApi();
  return response?.data || [];
};

export const completeItAssetMaintenanceService = async (maintenanceLogId) => {
  const response = await completeItAssetMaintenanceApi(maintenanceLogId);
  return response?.data || null;
};

export const reopenItAssetMaintenanceService = async (maintenanceLogId) => {
  const response = await api.post(`/it-assets/maintenance/${maintenanceLogId}/reopen`);
  return response?.data || null;
};

export const receiveItAssetMaintenancePartsService = async (assetId) => {
  const response = await api.post(`/it-assets/maintenance/${assetId}/parts/receive`);
  return response?.data || null;
};

export const borrowItAssetService = async (payload) => {
  const response = await borrowItAssetApi(payload);
  return response?.data || null;
};

export const returnBorrowedItAssetService = async (payload) => {
  const response = await returnBorrowedItAssetApi(payload);
  return response?.data || null;
};

export const getActiveItAssetBorrowsService = async () => {
  const response = await getActiveItAssetBorrowsApi();
  return response?.data || [];
};

export const getOverdueItAssetBorrowsService = async () => {
  const response = await getOverdueItAssetBorrowsApi();
  return response?.data || [];
};

export const getItAssetBorrowHistoryService = async (params = {}) => {
  const response = await getItAssetBorrowHistoryApi(params);
  return response?.data || [];
};
