// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Branding Context
// ============================================
//
// Purpose:
// Provides organization and branding data
// across the entire frontend.
// ============================================

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  getSystemBranding,
} from "../services/brandingService";

// ============================================================
// CONTEXT
// ============================================================

const BrandingContext = createContext(null);

// ============================================================
// PROVIDER
// ============================================================

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  // ==========================================================
  // LOAD BRANDING
  // ==========================================================

  const loadBranding = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getSystemBranding();

      setBranding(data);

      setError(null);
    } catch (err) {
      console.error("Failed to load branding.", err);

      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBranding();
  }, [loadBranding]);

  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value = {
    branding,
    loading,
    error,
    refreshBranding: loadBranding,
    setBranding,
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================

export function useBrandingContext() {
  const context = useContext(BrandingContext);

  if (!context) {
    throw new Error(
      "useBrandingContext must be used inside BrandingProvider."
    );
  }

  return context;
}