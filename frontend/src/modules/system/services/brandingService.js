// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Branding Service
// ============================================
//
// Purpose:
// Handles frontend API calls for organization
// profile and platform branding.
// ============================================

import api from "../../../services/api";

// ============================================================
// GET SYSTEM BRANDING
// ============================================================

export const getSystemBranding = async () => {
  const response = await api.get("/system/branding");
  return response.data?.data;
};

// ============================================================
// UPDATE SYSTEM BRANDING
// ============================================================

export const updateSystemBranding = async (payload) => {
  const response = await api.put("/system/branding", payload);
  return response.data?.data;
};

// ============================================================
// UPLOAD BRANDING FILE
// ============================================================

export const uploadBrandingFile = async (fileType, file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    `/system/branding/${fileType}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data?.data;
};