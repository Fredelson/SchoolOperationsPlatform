// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// useModuleAccess Hook
// Phase 2 Frontend Foundation
// ============================================

import { usePermissions } from "./usePermissions";

export default function useModuleAccess(moduleName) {
  const { canAccessModule, hasRole, loading } = usePermissions();

  if (loading) return false;

  if (hasRole("SuperAdmin")) return true;

  return canAccessModule(moduleName);
}
