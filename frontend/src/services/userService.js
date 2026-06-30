// ============================================
// ARAB UNITY SCHOOL
// User Management API Service
// ============================================

import api from "./api";

// ============================================
// Import Users from CSV
// POST /api/admin/users/import-csv
// ============================================
export const importUsersFromCSV = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/admin/users/import-csv", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// ============================================
// Import Users from Excel
// POST /api/admin/users/import-excel
// ============================================
export const importUsersFromExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/admin/users/import-excel", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// ============================================
// Download CSV User Import Template
// GET /api/admin/users/download-csv-template
// ============================================
export const downloadCSVUserTemplate = async () => {
  const response = await api.get("/admin/users/download-csv-template", {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", "UserImportTemplate.csv");

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
};

// ============================================
// Download Excel User Import Template
// GET /api/admin/users/download-excel-template
// ============================================
export const downloadExcelUserTemplate = async () => {
  const response = await api.get("/admin/users/download-excel-template", {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", "UserImportTemplate.xlsx");

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
};

// ============================================
// Get All Users
// GET /api/users
// ============================================
export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

// ============================================
// Get Single User
// GET /api/users/:id
// ============================================
export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

// ============================================
// Create User
// POST /api/users
// ============================================
export const createUser = async (userData) => {
  const response = await api.post("/users", userData);
  return response.data;
};

// ============================================
// Update User
// PUT /api/users/:id
// ============================================
export const updateUser = async (userId, userData) => {
  const response = await api.put(`/users/${userId}`, userData);
  return response.data;
};

// ============================================
// Deactivate User
// PUT /api/users/:id/deactivate
// ============================================
export const deactivateUser = async (userId) => {
  const response = await api.put(`/users/${userId}/deactivate`);
  return response.data;
};

// ============================================
// Activate User
// PUT /api/users/:id/activate
// ============================================
export const activateUser = async (userId) => {
  const response = await api.put(`/users/${userId}/activate`);
  return response.data;
};
