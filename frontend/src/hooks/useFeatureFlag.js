// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// useFeatureFlag Hook
// Phase 2 Frontend Foundation
// ============================================

import { usePermissions } from "./usePermissions";

export default function useFeatureFlag(flagName) {
  const { isFeatureEnabled, hasRole, loading } = usePermissions();

  if (loading) return false;

  if (hasRole("SuperAdmin")) return true;

  return isFeatureEnabled(flagName);
}
