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

export const loginUser = async (identifier, password) => {
  const response = await api.post("/auth/login", {
    identifier,
    password,
  });

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");

  const payload = response.data;

  return payload?.user || payload?.data?.user || payload?.data || payload;
};
export const changeCurrentPassword=async(payload)=>(await api.post("/auth/change-password",payload)).data;
