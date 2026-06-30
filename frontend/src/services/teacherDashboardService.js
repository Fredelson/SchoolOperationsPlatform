// ============================================
// ARAB UNITY SCHOOL
// Teacher Dashboard API Service
// Uses existing request dashboard endpoint
// ============================================

import api from "./api";

// ============================================
// Get Full Teacher Dashboard Data
// Backend route:
// GET /api/requests/dashboard
// ============================================

export const getTeacherDashboardData = async () => {
  const response = await api.get("/requests/dashboard");
  return response.data;
};

// ============================================
// Get Teacher Dashboard KPIs Only
// ============================================

export const getTeacherDashboardKpis = async () => {
  const response = await api.get("/requests/dashboard");

  const stats = response.data.stats || {};

  return {
    totalRequests: stats.TotalRequests || 0,
    totalSheets: stats.TotalSheets || 0,
    totalPages: stats.TotalPages || 0,
    pendingRequests: stats.PendingRequests || 0,
    approvedRequests: stats.ApprovedRequests || 0,
    rejectedRequests: stats.RejectedRequests || 0,
    completedRequests: stats.CompletedRequests || 0,
  };
};
