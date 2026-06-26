// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Global Constants
// ============================================

// ============================================
// User Roles
// ============================================

const ROLES = {
  SUPER_ADMIN: "SuperAdmin",
  PLATFORM_ADMIN: "PlatformAdmin",
  PRINTING_ADMIN: "PrintingAdmin",
  HOS: "HOS",
  HOD: "HOD",
  ADMIN: "Admin",
  TEACHER: "Teacher",
};

// ============================================
// Request Status
// ============================================

const REQUEST_STATUS = {
  PENDING: "Pending",
  APPROVED_HOD: "Approved by HOD",
  REJECTED_HOD: "Rejected by HOD",
  FORWARDED_HOS: "Forwarded to HOS",
  APPROVED_HOS: "Approved by HOS",
  REJECTED_HOS: "Rejected by HOS",
  PRINTING: "Printing",
  COMPLETED: "Completed",
};

// ============================================
// Paper Sizes
// ============================================

const PAPER_SIZE = {
  A4: "A4",
  A3: "A3",
};

// ============================================
// Print Side
// ============================================

const PRINT_SIDE = {
  SINGLE: "Single",
  DOUBLE: "Double",
};

// ============================================
// Priority
// ============================================

const PRIORITY = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
};

module.exports = {
  ROLES,
  REQUEST_STATUS,
  PAPER_SIZE,
  PRINT_SIDE,
  PRIORITY,
};