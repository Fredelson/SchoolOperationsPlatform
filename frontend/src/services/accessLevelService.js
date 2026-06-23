// ============================================
// ARAB UNITY SCHOOL
// Access Level Master Data API Service
// ============================================

import api from "./api";

// GET: All access levels
export const getAccessLevels = async () => {
  const response = await api.get("/access-levels");
  return response.data;
};

// POST: Create access level
export const createAccessLevel = async (data) => {
  const response = await api.post("/access-levels", data);
  return response.data;
};

// PUT: Update access level
export const updateAccessLevel = async (id, data) => {
  const response = await api.put(`/access-levels/${id}`, data);
  return response.data;
};

// DELETE: Delete access level
export const deleteAccessLevel = async (id) => {
  const response = await api.delete(`/access-levels/${id}`);
  return response.data;
};