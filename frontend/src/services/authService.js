// ============================================
// ARAB UNITY SCHOOL
// Authentication Service
// ============================================
//
// Purpose:
// Handles authentication API calls and normalizes
// backend responses for frontend AuthContext.
// ============================================

import api from "./api";

export const loginUser = async (employeeId, password) => {
  const response = await api.post("/auth/login", {
    employeeId,
    password,
  });

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");

  const payload = response.data;

  return payload?.user || payload?.data?.user || payload?.data || payload;
};
