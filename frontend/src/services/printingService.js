// ============================================
// ARAB UNITY SCHOOL
// Printing Admin Service
// Frontend API calls for Printing Admin module
// ============================================

import api from "./api";

// ============================================
// Get Printing Dashboard KPI Data
// GET /api/printing/dashboard
// ============================================
export const getPrintingDashboard = async () => {
  const response = await api.get("/printing/dashboard");

  return response.data;
};

// ============================================
// Get Printing Queue Requests
// GET /api/printing/requests
// ============================================
export const getPrintingRequests = async () => {
  const response = await api.get("/printing/requests");

  return response.data;
};

// ============================================
// Get Single Printing Request Details
// GET /api/printing/requests/:id
// ============================================
export const getPrintingRequestById = async (requestId) => {
  const response = await api.get(
    `/printing/requests/${requestId}`
  );

  return response.data;
};

// ============================================
// Start Printing
// PUT /api/printing/requests/:id/start
// ============================================
export const startPrintingRequest = async (requestId) => {
  const response = await api.put(
    `/printing/requests/${requestId}/start`
  );

  return response.data;
};

// ============================================
// Complete Printing
// PUT /api/printing/requests/:id/complete
// ============================================
export const completePrintingRequest = async (
  requestId,
  remarks = "Printing completed"
) => {
  const response = await api.put(
    `/printing/requests/${requestId}/complete`,
    {
      remarks,
    }
  );

  return response.data;
};

// ============================================
// Get Printing History
// GET /api/printing/history
// ============================================
export const getPrintingHistory = async () => {
  const response = await api.get("/printing/history");

  return response.data;
};
