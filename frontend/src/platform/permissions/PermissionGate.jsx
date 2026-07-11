// ============================================
// ARAB UNITY SCHOOL
// Platform Permission Gate
//
// Purpose:
// Controls permission-based access.
//
// Uses the existing effective-permission resolver context.
// ============================================

import { usePermissions } from "../../context/PermissionContext";

export default function PermissionGate({ permissionKey, children, fallback = null }) {
  const { hasPermission, loading } = usePermissions();
  if (loading || !permissionKey || !hasPermission(permissionKey)) return fallback;
  return children;
}
