// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Widget Manager API
// ============================================
//
// Purpose:
// Centralized frontend API service for the
// Super Admin Widget Manager.
//
// Architecture:
// WidgetManager.jsx
//    ↓
// useWidgetManager
//    ↓
// widgetApi
//    ↓
// Backend /widgets API
// ============================================

import api from "@services/api";

const BASE_URL = "/widgets";

export const widgetApi = {
  // ==========================================
  // Get Widgets
  // ==========================================

  getAll: async (params = {}) => {
    const response = await api.get(BASE_URL, {
      params,
    });

    return response.data;
  },

  getById: async (widgetId) => {
    const response = await api.get(`${BASE_URL}/${widgetId}`);
    return response.data;
  },

  create: async (payload) => {
    const response = await api.post(BASE_URL, payload);
    return response.data;
  },

  update: async (widgetId, payload) => {
    const response = await api.put(`${BASE_URL}/${widgetId}`, payload);
    return response.data;
  },

  remove: async (widgetId) => {
    const response = await api.delete(`${BASE_URL}/${widgetId}`);
    return response.data;
  },

  getLookups: async () => {
    const response = await api.get(`${BASE_URL}/lookups`);
    return response.data;
  },
};