// ============================================
// ARAB UNITY SCHOOL
// HOS Service
// Handles all frontend API calls for HOS module
// ============================================

import api from "./api";

/**
 * Get HOS dashboard KPI data
 * GET /api/hos/dashboard
 */
export const getHosDashboard = async () => {
  const response = await api.get("/hos/dashboard");
  return response.data;
};

/**
 * Get requests assigned to HOS
 * GET /api/hos/requests
 */
export const getHosRequests = async () => {
  const response = await api.get("/hos/requests");
  return response.data;
};

/**
 * Get HOS approval history
 * GET /api/hos/approval-history
 */
export const getHosApprovalHistory = async () => {
  const response = await api.get("/hos/approval-history");
  return response.data;
};

/**
 * Approve request
 * PUT /api/hos/requests/:id/approve
 */
export const approveHosRequest = async (
  requestId,
  remarks = "Approved by HOS"
) => {
  const response = await api.put(
    `/hos/requests/${requestId}/approve`,
    {
      remarks,
    }
  );

  return response.data;
};

/**
 * Reject request
 * PUT /api/hos/requests/${requestId}/reject
 */
export const rejectHosRequest = async (
  requestId,
  remarks
) => {
  const response = await api.put(
    `/hos/requests/${requestId}/reject`,
    {
      remarks,
    }
  );

  return response.data;
};