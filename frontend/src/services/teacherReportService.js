// ============================================
// ARAB UNITY SCHOOL
// Teacher Reports Service
// Uses teacher dashboard backend data
// ============================================

import api from "./api";

// GET /api/requests/dashboard
export const getTeacherReportsData = async () => {
  const response = await api.get("/requests/dashboard");
  return response.data;
};