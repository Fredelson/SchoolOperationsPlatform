// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Feature Flag Provider
// Phase 2 Frontend Foundation
// ============================================
//
// Purpose:
// Centralized feature flag access
//
// Examples:
//
// Printing = ON
// Assets = OFF
// ITTickets = OFF
// Observations = ON
//
// Future:
// Super Admin can enable/disable modules
// without deployment.
//
// ============================================

import {
  createContext,
  useContext,
  useMemo,
} from "react";

import { usePermissions } from "../context/PermissionContext";

const FeatureFlagContext = createContext(null);

// ============================================
// Provider
// ============================================

export function FeatureFlagProvider({ children }) {
  const {
    featureFlags,
    isFeatureEnabled,
    hasRole,
    loading,
  } = usePermissions();

  const value = useMemo(
    () => ({
      featureFlags,
      loading,

      isEnabled: (flagName) => {
        if (hasRole("SuperAdmin")) {
          return true;
        }

        return isFeatureEnabled(flagName);
      },
    }),
    [
      featureFlags,
      loading,
      isFeatureEnabled,
      hasRole,
    ]
  );

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext);

  if (!context) {
    throw new Error(
      "useFeatureFlags must be used inside FeatureFlagProvider"
    );
  }

  return context;
}

export default FeatureFlagContext;
