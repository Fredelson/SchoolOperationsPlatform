// ============================================
// ARAB UNITY SCHOOL
// HOS Service
// Frontend API Calls
// Used by HOS Dashboard, Pending Requests,
// Approval History, Approve & Reject Actions
// ============================================

import api from "./api";

// ============================================
// Dashboard KPI Statistics
// GET /api/hos/dashboard
// ============================================
export const getHosDashboard = async () => {
  const response = await api.get("/hos/dashboard");

  return response.data;
};

// ============================================
// Get All Requests Assigned To HOS
// GET /api/hos/requests
// ============================================
export const getHosRequests = async () => {
  const response = await api.get("/hos/requests");

  return response.data;
};

// ============================================
// Get Single Request Details
// GET /api/hos/requests/:id
// Optional for future Request Details page
// ============================================
export const getHosRequestById = async (requestId) => {
  const response = await api.get(
    `/hos/requests/${requestId}`
  );

  return response.data;
};

// ============================================
// Get HOS Approval History
// GET /api/hos/approval-history
// ============================================
export const getHosApprovalHistory = async () => {
  const response = await api.get(
    "/hos/approval-history"
  );

  return response.data;
};

// ============================================
// Approve Request
// PUT /api/hos/requests/:id/approve
// ============================================
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

// ============================================
// Reject Request
// PUT /api/hos/requests/:id/reject
// ============================================
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

// ============================================
// Future Feature
// Return For Revision
// Currently not implemented in backend
// ============================================
export const returnHosRequest = async (
  requestId,
  remarks
) => {
  const response = await api.put(
    `/hos/requests/${requestId}/return`,
    {
      remarks,
    }
  );

  return response.data;
};
