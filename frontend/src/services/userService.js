// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// User Management API Service
// ============================================

import api from "./api";
import * as xlsx from "xlsx";

// ============================================
// Users CRUD
// ============================================

export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post("/users", userData);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await api.put(`/users/${userId}`, userData);
  return response.data;
};

export const deactivateUser = async (userId) => {
  const response = await api.put(`/users/${userId}/deactivate`);
  return response.data;
};

export const activateUser = async (userId) => {
  const response = await api.put(`/users/${userId}/activate`);
  return response.data;
};

// ============================================
// User Import - New Enterprise Import Flow
// ============================================
// Backend routes:
// POST /api/users/import/preview
// POST /api/users/import/commit
// GET  /api/users/import/history
// ============================================

export const previewUserImport = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/users/import/preview", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const commitUserImport = async (batchId) => {
  const response = await api.post("/users/import/commit", { batchId });
  return response.data;
};

export const getUserImportHistory = async () => {
  const response = await api.get("/users/import/history");
  return response.data;
};

// ============================================
// Local Template Downloads
// ============================================

export const downloadCSVUserTemplate = () => {
  const headers = ["FullName", "EmployeeId", "SchoolEmail", "Role", "Department", "Subject", "AssignmentKey", "ScopeType", "ScopeName"];
  const sample = [
    "Ahmed Ali",
    "T0001",
    "ahmed.ali@arabunityschool.ae",
    "Teacher",
    "Primary",
    "English",
    "HOD",
    "Section",
    "A",
  ];

  const csv = `${headers.join(",")}\n${sample.join(",")}`;

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", "UserImportTemplate.csv");

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
};

export const downloadXLSXUserTemplate = () => {
  const headers = ["FullName", "EmployeeId", "SchoolEmail", "Role", "Department", "Subject", "AssignmentKey", "ScopeType", "ScopeName"];
  const sample = [
    "Ahmed Ali",
    "T0001",
    "ahmed.ali@arabunityschool.ae",
    "Teacher",
    "Primary",
    "English",
    "HOD",
    "Section",
    "A",
  ];

  const worksheet = xlsx.utils.aoa_to_sheet([headers, sample]);

  worksheet["!cols"] = headers.map(() => ({ wch: 25 }));

  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Users");

  const wbout = xlsx.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "UserImportTemplate.xlsx";

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
};

export const downloadExcelUserTemplate = async () => {
  try {
    const response = await api.get("/admin/users/download-excel-template", {
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "UserImportTemplate.xlsx";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download Excel template error:", error);
    alert(error.response?.data?.message || "Failed to download Excel template.");
  }
};

export const exportUsers = async () => {
  try {
    const response = await api.get("/users/export");
    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "UsersExport.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Export users error:", error);
    alert(error.response?.data?.message || "Failed to export users.");
  }
};