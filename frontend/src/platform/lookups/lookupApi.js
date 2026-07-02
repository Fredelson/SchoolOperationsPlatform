// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Platform Lookup API
// ============================================
//
// Purpose:
// Central API layer for all reusable lookup data.
//
// Enterprise Rules:
// - No duplicated axios calls inside modules.
// - All dropdown values must come from SQL Server.
// - This file only handles HTTP communication.
// - Components should consume useLookups(), not axios directly.
// ============================================

import api from "../../services/api";

// ============================================
// Lookup Endpoint Map
// ============================================
//
// Purpose:
// One central place for all reusable lookup endpoints.
// Add future SQL-backed dropdowns here.
// ============================================

export const LOOKUP_ENDPOINTS = {
  departments: "/lookups/departments",
  sections: "/lookups/sections",
  subjects: "/lookups/subjects",
  purposes: "/lookups/purposes",

  workspaces: "/lookups/workspaces",
  modules: "/lookups/modules",
  menus: "/lookups/menus",
  permissions: "/lookups/permissions",
  featureFlags: "/lookups/feature-flags",
  visibilityStatuses: "/lookups/visibility-statuses",
};

// ============================================
// Response Normalizer
// ============================================
//
// Purpose:
// Backend responses may use different wrappers such as:
// - { data: [...] }
// - { rows: [...] }
// - { items: [...] }
// - { result: [...] }
// - [...]
//
// This keeps the lookup hook stable.
// ============================================

function normalizeLookupResponse(response) {
  const payload = response?.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.rows)) {
    return payload.rows;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.result)) {
    return payload.result;
  }

  return [];
}

// ============================================
// Lookup API
// ============================================

export const lookupApi = {
  // ==========================================
  // Get Single Lookup
  // ==========================================

  async getLookup(key) {
    const endpoint = LOOKUP_ENDPOINTS[key];

    if (!endpoint) {
      throw new Error(`Unknown lookup key: ${key}`);
    }

    const response = await api.get(endpoint);
    return normalizeLookupResponse(response);
  },

  // ==========================================
  // Get Multiple Lookups
  // ==========================================

  async getMany(keys = []) {
    const results = await Promise.all(
      keys.map(async (key) => {
        const data = await this.getLookup(key);
        return [key, data];
      })
    );

    return Object.fromEntries(results);
  },
};