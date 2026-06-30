// ============================================
// ARAB UNITY SCHOOL
// Platform Permission Gate
//
// Purpose:
// Controls permission-based access.
//
// Future:
// Will connect to:
// - Super Admin Permission Engine
// - Role Manager
// - Access Levels
//
// Current:
// Allows all content.
// ============================================

export default function PermissionGate({ permissionKey, children }) {
  return children;
}
