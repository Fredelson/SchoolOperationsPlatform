// ============================================
// ARAB UNITY SCHOOL
// Lookup API Service
// ============================================

import api from "./api";

// ============================================
// Get Departments
// GET /api/lookups/departments
// ============================================

export const getDepartments = async () => {
  const response = await api.get("/lookups/departments");
  return response.data;
};

// ============================================
// Get Subjects
// GET /api/lookups/subjects
// ============================================

export const getSubjects = async () => {
  const response = await api.get("/lookups/subjects");
  return response.data;
};

// ============================================
// Get Purposes
// GET /api/lookups/purposes
// ============================================

export const getPurposes = async () => {
  const response = await api.get("/lookups/purposes");
  return response.data;
};