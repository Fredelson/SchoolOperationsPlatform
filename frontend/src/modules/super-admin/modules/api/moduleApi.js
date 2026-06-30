// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Module Manager API
// ============================================
//
// Purpose:
// Centralized frontend API service for the
// Super Admin Module Manager.
//
// Architecture:
// ModuleManager.jsx
//    ↓
// useModuleManager
//    ↓
// moduleApi
//    ↓
// Backend /modules API
// ============================================

import api from "@services/api";

const BASE_URL = "/modules";

export const moduleApi = {
  // ==========================================
  // Get Modules
  // ==========================================
  //
  // Supports both:
  // - Legacy full list: getAll()
  // - Paginated list: getAll({ page, pageSize, search, status, visibility })
  // ==========================================

  getAll: async (params = {}) => {
    const response = await api.get(BASE_URL, {
      params,
    });

    return response.data;
  },

  getById: async (moduleId) => {
    const response = await api.get(`${BASE_URL}/${moduleId}`);
    return response.data;
  },

  create: async (payload) => {
    const response = await api.post(BASE_URL, payload);
    return response.data;
  },

  update: async (moduleId, payload) => {
    const response = await api.put(`${BASE_URL}/${moduleId}`, payload);
    return response.data;
  },

  activate: async (moduleId) => {
    const response = await api.patch(`${BASE_URL}/${moduleId}/activate`);
    return response.data;
  },

  deactivate: async (moduleId) => {
    const response = await api.patch(`${BASE_URL}/${moduleId}/deactivate`);
    return response.data;
  },

  remove: async (moduleId) => {
    const response = await api.delete(`${BASE_URL}/${moduleId}`);
    return response.data;
  },
};
