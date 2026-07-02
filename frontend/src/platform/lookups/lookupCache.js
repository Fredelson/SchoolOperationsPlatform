// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Lookup Cache
// ============================================
//
// Purpose:
// Simple in-memory cache for platform lookups.
//
// This prevents repeated API calls when multiple modules
// need the same dropdown data.
// ============================================

const lookupCache = new Map();

export function getCachedLookup(key) {
  return lookupCache.get(key);
}

export function setCachedLookup(key, value) {
  lookupCache.set(key, value);
}

export function clearLookupCache(key) {
  if (key) {
    lookupCache.delete(key);
    return;
  }

  lookupCache.clear();
}

export function hasCachedLookup(key) {
  return lookupCache.has(key);
}