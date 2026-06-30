// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Branding Context
// ============================================
//
// Purpose:
// Provides organization and branding data
// across the entire frontend.
//
// Also updates global browser branding:
// - Default browser title
// - Dynamic favicon
// ============================================

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import { getSystemBranding } from "../services/brandingService";
import buildFileUrl from "../../../platform/utils/buildFileUrl";

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
  // APPLY GLOBAL BROWSER BRANDING
  // ==========================================================

  useEffect(() => {
    if (!branding) return;

    const schoolCode =
      branding.school?.schoolCode ||
      branding.school?.schoolName ||
      "AUS";

    const faviconPath = branding.branding?.faviconPath;

    document.title = `${schoolCode} | Operations Platform`;

    if (faviconPath) {
      const faviconUrl = buildFileUrl(faviconPath);

      let faviconLink = document.querySelector("link[rel='icon']");

      if (!faviconLink) {
        faviconLink = document.createElement("link");
        faviconLink.rel = "icon";
        document.head.appendChild(faviconLink);
      }

      faviconLink.type = "image/png";
      faviconLink.href = faviconUrl;
    }
  }, [branding]);

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
