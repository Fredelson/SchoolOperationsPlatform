// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Feature Flag Manager Service
// ============================================
//
// Purpose:
// Business/service layer for Feature Flag Manager.
//
// Architecture:
// Page
//   ↓
// Hook
//   ↓
// Service
//   ↓
// API
// ============================================

import { featureFlagApi } from "../api/featureFlagApi";

/* ============================================
   Get Feature Flags
============================================ */

export const getFeatureFlags = async (params = {}) => {
  const response = await featureFlagApi.getAll(params);

  return {
    items:
      response?.data ??
      response?.rows ??
      response?.items ??
      response?.featureFlags ??
      [],
    pagination:
      response?.pagination ?? {
        page: 1,
        pageSize: 10,
        totalRecords: 0,
      },
    success: response?.success,
    message: response?.message,
  };
};

/* ============================================
   Get Feature Flag
============================================ */

export const getFeatureFlagById = async (featureFlagId) => {
  const response = await featureFlagApi.getById(featureFlagId);

  return response?.data ?? response;
};

/* ============================================
   Create Feature Flag
============================================ */

export const createFeatureFlag = async (payload) => {
  return await featureFlagApi.create(payload);
};

/* ============================================
   Update Feature Flag
============================================ */

export const updateFeatureFlag = async (featureFlagId, payload) => {
  return await featureFlagApi.update(featureFlagId, payload);
};

/* ============================================
   Delete Feature Flag
============================================ */

export const deleteFeatureFlag = async (featureFlagId) => {
  return await featureFlagApi.remove(featureFlagId);
};

/* ============================================
   Lookups
============================================ */

export const getFeatureFlagLookups = async () => {
  const response = await featureFlagApi.getLookups();

  return response?.data ?? response;
};