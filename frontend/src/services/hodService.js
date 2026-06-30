// ============================================
// ARAB UNITY SCHOOL
// HOD Service
// Handles all frontend API calls for HOD module
// ============================================

import api from "./api";

/**
 * Get HOD dashboard KPI data
 * GET /api/hod/dashboard
 */
export const getHodDashboard = async () => {
  const response = await api.get("/hod/dashboard");
  return response.data;
};

/**
 * Get requests assigned to HOD
 * GET /api/hod/requests
 */
export const getHodRequests = async () => {
  const response = await api.get("/hod/requests");
  return response.data;
};

/**
 * Get real HOD approval history
 * GET /api/hod/approval-history
 */
export const getHodApprovalHistory = async () => {
  const response = await api.get("/hod/approval-history");
  return response.data;
};

/**
 * Approve request
 * PUT /api/hod/requests/:id/approve
 */
export const approveHodRequest = async (
  requestId,
  remarks = "Approved by HOD"
) => {
  const response = await api.put(
    `/hod/requests/${requestId}/approve`,
    {
      remarks,
    }
  );

  return response.data;
};

/**
 * Reject request
 * PUT /api/hod/requests/:id/reject
 */
export const rejectHodRequest = async (
  requestId,
  remarks = "Rejected by HOD"
) => {
  const response = await api.put(
    `/hod/requests/${requestId}/reject`,
    {
      remarks,
    }
  );

  return response.data;
};
