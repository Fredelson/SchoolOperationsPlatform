// ============================================
// ARAB UNITY SCHOOL
// User Management API Service
// ============================================

import api from "./api";

// ============================================
// Get All Users
// GET /api/users
// ============================================
export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

// ============================================
// Get Single User
// GET /api/users/:id
// ============================================
export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

// ============================================
// Create User
// POST /api/users
// ============================================
export const createUser = async (userData) => {
  const response = await api.post("/users", userData);
  return response.data;
};

// ============================================
// Update User
// PUT /api/users/:id
// ============================================
export const updateUser = async (userId, userData) => {
  const response = await api.put(`/users/${userId}`, userData);
  return response.data;
};

// ============================================
// Deactivate User
// PUT /api/users/:id/deactivate
// ============================================
export const deactivateUser = async (userId) => {
  const response = await api.put(`/users/${userId}/deactivate`);
  return response.data;
};

// ============================================
// Activate User
// PUT /api/users/:id/activate
// ============================================
export const activateUser = async (userId) => {
  const response = await api.put(`/users/${userId}/activate`);
  return response.data;
};