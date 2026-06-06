// ============================================
// ARAB UNITY SCHOOL
// HOD Dashboard Data
// ============================================

// KPI Cards
export const hodDashboardStats = [
  {
    title: "Total Requests",
    value: 145,
    color: "#2563EB",
  },

  {
    title: "Pending Approval",
    value: 18,
    color: "#F59E0B",
  },

  {
    title: "Approved",
    value: 102,
    color: "#10B981",
  },

  {
    title: "Rejected",
    value: 8,
    color: "#EF4444",
  },

  {
    title: "Forwarded to HOS",
    value: 12,
    color: "#8B5CF6",
  },

  {
    title: "Completed",
    value: 95,
    color: "#06B6D4",
  },
];

// ============================================
// Monthly Approval Trend
// ============================================

export const hodApprovalTrendData = [
  {
    month: "Dec",
    approved: 15,
    rejected: 2,
  },
  {
    month: "Jan",
    approved: 20,
    rejected: 1,
  },
  {
    month: "Feb",
    approved: 18,
    rejected: 3,
  },
  {
    month: "Mar",
    approved: 26,
    rejected: 2,
  },
  {
    month: "Apr",
    approved: 32,
    rejected: 1,
  },
  {
    month: "May",
    approved: 38,
    rejected: 2,
  },
];

// ============================================
// Department Request Distribution
// ============================================

export const departmentDistributionData = [
  {
    name: "FS",
    value: 20,
  },
  {
    name: "Primary",
    value: 40,
  },
  {
    name: "Secondary",
    value: 35,
  },
  {
    name: "Inclusion",
    value: 10,
  },
  {
    name: "Sixth Form",
    value: 15,
  },
];

// ============================================
// Approval Queue
// ============================================

export const hodApprovalQueueData = [
  {
    id: 1,
    requestNumber: "REQ-2026-001",
    teacher: "Ms. Aisha",
    department: "Primary",
    purpose: "Worksheet",
    pages: 20,
    copies: 15,
    sheets: 300,
    status: "Pending HOD",
    attachments: ["worksheet-grade1.pdf"],
  },

  {
    id: 2,
    requestNumber: "REQ-2026-002",
    teacher: "Mr. John",
    department: "Secondary",
    purpose: "Exam Paper",
    pages: 30,
    copies: 20,
    sheets: 600,
    status: "Pending HOD",
    attachments: ["math-exam.pdf"],
  },

  {
    id: 3,
    requestNumber: "REQ-2026-003",
    teacher: "Ms. Fatima",
    department: "FS",
    purpose: "Assessment",
    pages: 12,
    copies: 25,
    sheets: 300,
    status: "Pending HOD",
    attachments: ["assessment.pdf"],
  },

  {
    id: 4,
    requestNumber: "REQ-2026-004",
    teacher: "Mr. Ali",
    department: "Inclusion",
    purpose: "Activity Sheets",
    pages: 10,
    copies: 10,
    sheets: 100,
    status: "Pending HOD",
    attachments: ["activity.pdf"],
  },

  {
    id: 5,
    requestNumber: "REQ-2026-005",
    teacher: "Ms. Sarah",
    department: "Sixth Form",
    purpose: "Mock Exam",
    pages: 50,
    copies: 20,
    sheets: 1000,
    status: "Pending HOD",
    attachments: ["mock-exam.pdf"],
  },
];

// ============================================
// Recent Approved Requests
// ============================================

export const recentApprovedRequests = [
  {
    id: "REQ-2026-101",
    teacher: "Ahmed Khan",
    department: "Primary",
    status: "Approved",
    date: "2026-06-01",
  },

  {
    id: "REQ-2026-102",
    teacher: "Fatima Noor",
    department: "FS",
    status: "Approved",
    date: "2026-06-02",
  },

  {
    id: "REQ-2026-103",
    teacher: "John Smith",
    department: "Secondary",
    status: "Approved",
    date: "2026-06-03",
  },
];