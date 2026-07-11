// ============================================
// IT Asset API
// Arab Unity School Operations Platform
// ============================================

import api from "../../../services/api";

/**
 * Get paginated IT asset list.
 */
export const getItAssetsApi = async (params = {}) => {
  const response = await api.get("/it-assets", { params });
  return response.data;
};

/**
 * Get one IT asset by ID.
 */
export const getItAssetByIdApi = async (assetId) => {
  const response = await api.get(`/it-assets/${assetId}`);
  return response.data;
};

/**
 * Get IT asset timeline by AssetId.
 */
export const getItAssetTimelineApi = async (assetId) => {
  const response = await api.get(`/it-assets/timeline/${assetId}`);
  return response.data;
};

/**
 * Get IT asset audit history by AssetId.
 */
export const getItAssetAuditApi = async (assetId) => {
  const response = await api.get(`/it-assets/audit/${assetId}`);
  return response.data;
};

/**
 * Assign asset to a user/person.
 */
export const assignItAssetApi = async (payload) => {
  const response = await api.post("/it-assets/assignments/assign", payload);
  return response.data;
};

/**
 * Return assigned asset.
 */
export const returnItAssetApi = async (assetId, payload = {}) => {
  const response = await api.put(
    `/it-assets/assignments/${assetId}/return`,
    payload
  );
  return response.data;
};

/**
 * Load IT Asset lookups.
 */
export const getItAssetLookupsApi = async () => {
  const response = await api.get("/it-assets/lookups");
  return response.data;
};

/**
 * Immediately transfer an asset. Backend restricts this to platform admins.
 */
export const transferItAssetApi = async (payload) => {
  const response = await api.post("/it-assets/transfer", payload);
  return response.data;
};

export const getItAssetDisposalsApi = async () => {
  const response = await api.get("/it-assets/disposals");
  return response.data;
};

export const approveItAssetDisposalApi = async (disposalId) => {
  const response = await api.put("/it-assets/disposals/approve", { disposalId });
  return response.data;
};

export const rejectItAssetDisposalApi = async (disposalId) => {
  const response = await api.put("/it-assets/disposals/reject", { disposalId });
  return response.data;
};

export const completeItAssetDisposalApi = async (disposalId) => {
  const response = await api.put("/it-assets/disposals/complete", { disposalId });
  return response.data;
};

export const createItAssetMaintenanceApi = async (payload) => {
  const response = await api.post("/it-assets/maintenance", payload);
  return response.data;
};

export const requestItAssetDisposalApi = async (payload) => {
  const response = await api.post("/it-assets/disposals/request", payload);
  return response.data;
};

export const getActiveItAssetAssignmentsApi = async (params = {}) => {
  const response = await api.get("/it-assets/assignments/active", { params });
  return response.data;
};

export const getItAssetAssignmentHistoryApi = async (params = {}) => {
  const response = await api.get("/it-assets/assignments/history", { params });
  return response.data;
};

export const getItAssetTransfersApi = async () => {
  const response = await api.get("/it-assets/transfer");
  return response.data;
};

export const getItAssetIssuesApi = async (params = {}) => {
  const response = await api.get("/it-assets/issues", { params });
  return response.data;
};

export const getItAssetMaintenanceLogsApi = async (params = {}) => {
  const response = await api.get("/it-assets/maintenance", { params });
  return response.data;
};

export const getItAssetMaintenanceDueApi = async () => {
  const response = await api.get("/it-assets/maintenance/due");
  return response.data;
};

export const completeItAssetMaintenanceApi = async (maintenanceLogId) => {
  const response = await api.put(`/it-assets/maintenance/${maintenanceLogId}/complete`);
  return response.data;
};

export const borrowItAssetApi = async (payload) => {
  const response = await api.post("/it-assets/borrow", payload);
  return response.data;
};

export const returnBorrowedItAssetApi = async (payload) => {
  const response = await api.post("/it-assets/borrow/return", payload);
  return response.data;
};

export const getActiveItAssetBorrowsApi = async () => {
  const response = await api.get("/it-assets/borrow/active");
  return response.data;
};

export const getOverdueItAssetBorrowsApi = async () => {
  const response = await api.get("/it-assets/borrow/overdue");
  return response.data;
};

export const getItAssetBorrowHistoryApi = async (params = {}) => {
  const response = await api.get("/it-assets/borrow/history", { params });
  return response.data;
};
