// ============================================
// ARAB UNITY SCHOOL
// Print Limit Service
// Frontend API calls for Department and Subject limits
// ============================================

import api from "./api";

// ============================================
// Get Department Limits
// GET /api/limits/departments?month=6&year=2026
// Used by Printing Admin
// ============================================
export const getDepartmentLimits = async (month, year) => {
  const response = await api.get("/limits/departments", {
    params: {
      month,
      year,
    },
  });

  return response.data;
};

// ============================================
// Create or Update Department Limit
// PUT /api/limits/departments/:departmentId
// Used by Printing Admin
// ============================================
export const updateDepartmentLimit = async (
  departmentId,
  sheetLimit,
  month,
  year
) => {
  const response = await api.put(`/limits/departments/${departmentId}`, {
    sheetLimit,
    month,
    year,
  });

  return response.data;
};

// ============================================
// Get Subject Limits
// GET /api/limits/subjects?departmentId=1&month=6&year=2026
// Used by HOS
// ============================================
export const getSubjectLimits = async (departmentId, month, year) => {
  const response = await api.get("/limits/subjects", {
    params: {
      departmentId,
      month,
      year,
    },
  });

  return response.data;
};

// ============================================
// Create or Update Subject Limit
// PUT /api/limits/subjects/:subjectId
// Used by HOS
// ============================================
export const updateSubjectLimit = async (
  subjectId,
  departmentId,
  sheetLimit,
  month,
  year,
  hodUserId = null
) => {
  const response = await api.put(`/limits/subjects/${subjectId}`, {
    departmentId,
    sheetLimit,
    month,
    year,
    hodUserId,
  });

  return response.data;
};
