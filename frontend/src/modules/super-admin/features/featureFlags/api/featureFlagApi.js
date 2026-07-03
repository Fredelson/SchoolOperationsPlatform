// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Feature Flag Manager API
// ============================================

import api from "@services/api";

const BASE_URL = "/feature-flags";

export const featureFlagApi = {
  getAll: async (params = {}) => {
    const response = await api.get(BASE_URL, { params });
    return response.data;
  },

  getById: async (featureFlagId) => {
    const response = await api.get(`${BASE_URL}/${featureFlagId}`);
    return response.data;
  },

  create: async (payload) => {
    const response = await api.post(BASE_URL, payload);
    return response.data;
  },

  update: async (featureFlagId, payload) => {
    const response = await api.put(`${BASE_URL}/${featureFlagId}`, payload);
    return response.data;
  },

  remove: async (featureFlagId) => {
    const response = await api.delete(`${BASE_URL}/${featureFlagId}`);
    return response.data;
  },

  getLookups: async () => {
    const response = await api.get(`${BASE_URL}/lookups`);
    return response.data;
  },
};