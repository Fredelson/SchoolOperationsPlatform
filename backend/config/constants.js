// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Global Constants
//
// Purpose:
// - Keep role names and fixed system values in one place
// - Prevent typos across controllers and routes
// ============================================

// ============================================
// User Roles
// ============================================

const USER_ROLES = {
  SUPER_ADMIN: "SuperAdmin",
  PLATFORM_ADMIN: "PlatformAdmin",
  PRINTING_ADMIN: "PrintingAdmin",
  ADMIN: "Admin",
  TEACHER: "Teacher",
  TEACHING_ASSISTANT: "TeachingAssistant",
  HOD: "HOD",
  HOS: "HOS",
  SECRETARY: "Secretary",
};

// ============================================
// Allowed Import Roles
// Used by CSV/Excel user import
// ============================================

const ALLOWED_IMPORT_ROLES = [
  USER_ROLES.TEACHER,
  USER_ROLES.TEACHING_ASSISTANT,
  USER_ROLES.HOD,
  USER_ROLES.HOS,
  USER_ROLES.SECRETARY,
  USER_ROLES.PRINTING_ADMIN,
  USER_ROLES.ADMIN,
  USER_ROLES.SUPER_ADMIN,
];

// ============================================
// Exports
// ============================================

module.exports = {
  USER_ROLES,
  ALLOWED_IMPORT_ROLES,
};