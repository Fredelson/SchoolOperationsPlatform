// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Menu Manager API
// ============================================
//
// Purpose:
// Centralized frontend API service for the
// Super Admin Menu Manager.
//
// Architecture:
// MenuManager.jsx
//    ↓
// useMenuManager
//    ↓
// menuApi
//    ↓
// Backend /menus API
// ============================================

import api from "@services/api";

const BASE_URL = "/menus";

export const menuApi = {
  // ==========================================
  // Get Menus
  // ==========================================

  getAll: async (params = {}) => {
    const response = await api.get(BASE_URL, {
      params,
    });

    return response.data;
  },

  getById: async (menuId) => {
    const response = await api.get(`${BASE_URL}/${menuId}`);
    return response.data;
  },

  create: async (payload) => {
    const response = await api.post(BASE_URL, payload);
    return response.data;
  },

  update: async (menuId, payload) => {
    const response = await api.put(`${BASE_URL}/${menuId}`, payload);
    return response.data;
  },

  show: async (menuId) => {
    const response = await api.put(`${BASE_URL}/${menuId}/show`);
    return response.data;
  },

  hide: async (menuId) => {
    const response = await api.put(`${BASE_URL}/${menuId}/hide`);
    return response.data;
  },

  remove: async (menuId) => {
    const response = await api.delete(`${BASE_URL}/${menuId}`);
    return response.data;
  },
};