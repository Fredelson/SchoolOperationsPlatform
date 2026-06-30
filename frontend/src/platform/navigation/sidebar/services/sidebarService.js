// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Sidebar Service
// ============================================

import api from "../../../../services/api";

// ============================================
// Get My Sidebar
// ============================================

export async function getMySidebar() {
  const response = await api.get("/navigation/sidebar");

  const payload = response?.data;

  return (
    payload?.data ||
    payload?.sections ||
    []
  );
}
