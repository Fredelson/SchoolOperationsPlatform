// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// useLookups Hook
// ============================================
//
// Purpose:
// Reusable platform lookup hook with caching.
//
// Fix:
// Prevents repeated refresh/blinking when lookup keys
// are passed as an inline array from components.
// ============================================

import { useCallback, useEffect, useMemo, useState } from "react";

import { lookupApi, LOOKUP_ENDPOINTS } from "./lookupApi";
import {
  clearLookupCache,
  getCachedLookup,
  hasCachedLookup,
  setCachedLookup,
} from "./lookupCache";

// ============================================
// Default Lookup Keys
// ============================================

const DEFAULT_LOOKUPS = Object.keys(LOOKUP_ENDPOINTS);

// ============================================
// Hook
// ============================================

export function useLookups(keys = DEFAULT_LOOKUPS, options = {}) {
  const { useCache = true, autoLoad = true } = options;

  // ==========================================
  // Stable Lookup Key Signature
  // ==========================================
  //
  // Important:
  // Components may pass inline arrays to useLookups().
  // Without this stable signature, React sees a new array
  // every render and reloads lookups repeatedly.
  // ==========================================

  const lookupKeySignature = useMemo(() => keys.join("|"), [keys]);

  const lookupKeys = useMemo(
    () => lookupKeySignature.split("|").filter(Boolean),
    [lookupKeySignature]
  );

  // ==========================================
  // State
  // ==========================================

  const [lookups, setLookups] = useState({});
  const [loading, setLoading] = useState(Boolean(autoLoad));
  const [error, setError] = useState(null);

  // ==========================================
  // Load Lookups
  // ==========================================

  const loadLookups = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);
        setError(null);

        const nextLookups = {};
        const missingKeys = [];

        lookupKeys.forEach((key) => {
          if (useCache && !forceRefresh && hasCachedLookup(key)) {
            nextLookups[key] = getCachedLookup(key);
          } else {
            missingKeys.push(key);
          }
        });

        if (missingKeys.length > 0) {
          const freshLookups = await lookupApi.getMany(missingKeys);

          Object.entries(freshLookups).forEach(([key, value]) => {
            nextLookups[key] = value;

            if (useCache) {
              setCachedLookup(key, value);
            }
          });
        }

        setLookups(nextLookups);
      } catch (err) {
        console.error("Failed to load platform lookups:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [lookupKeySignature, useCache]
  );

  // ==========================================
  // Refresh Lookups
  // ==========================================

  const refreshLookups = useCallback(() => {
    return loadLookups(true);
  }, [loadLookups]);

  // ==========================================
  // Clear Cache
  // ==========================================

  const resetLookupCache = useCallback((key) => {
    clearLookupCache(key);
  }, []);

  // ==========================================
  // Auto Load
  // ==========================================

  useEffect(() => {
    if (autoLoad) {
      loadLookups();
    }
  }, [autoLoad, loadLookups]);

  // ==========================================
  // Public API
  // ==========================================

  return {
    ...lookups,

    lookups,
    loading,
    error,

    loadLookups,
    refreshLookups,
    resetLookupCache,
  };
}