// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Button Permission Wrapper
// Phase 2 Frontend Foundation
// ============================================
//
// Purpose:
// Automatically hide buttons/actions
// based on user permissions.
//
// Examples:
//
// <ButtonPermissionWrapper
//   module="Users"
//   action="Create"
// >
//   <Button>Create User</Button>
// </ButtonPermissionWrapper>
//
// <ButtonPermissionWrapper
//   permission="Users.Delete"
// >
//   <DeleteButton />
// </ButtonPermissionWrapper>
//
// ============================================

import { usePermissions } from "../../context/PermissionContext";

export default function ButtonPermissionWrapper({
  children,

  // Full permission key
  permission,

  // Module + Action
  module,
  action,

  // Optional fallback
  fallback = null,
}) {
  const {
    hasPermission,
    canUseAction,
    hasRole,
  } = usePermissions();

  // ============================================
  // Super Admin Override
  // ============================================

  if (hasRole("SuperAdmin")) {
    return children;
  }

  let allowed = false;

  // ============================================
  // Direct Permission Check
  // ============================================

  if (permission) {
    allowed = hasPermission(permission);
  }

  // ============================================
  // Module + Action Check
  // ============================================

  else if (module && action) {
    allowed = canUseAction(module, action);
  }

  // ============================================
  // Invalid Configuration
  // ============================================

  else {
    return fallback;
  }

  // ============================================
  // No Permission
  // ============================================

  if (!allowed) {
    return fallback;
  }

  // ============================================
  // Allowed
  // ============================================

  return children;
}
