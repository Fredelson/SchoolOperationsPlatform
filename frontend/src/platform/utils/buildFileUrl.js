// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// File URL Builder
// ============================================
//
// Purpose:
// Converts backend file paths into full URLs.
//
// Example:
//
// "/uploads/branding/logo/logo.png"
//
// becomes
//
// "http://localhost:5000/uploads/branding/logo/logo.png"
//
// This helper should be used everywhere files are
// rendered (branding, assets, helpdesk, HR, etc.)
// ============================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

export default function buildFileUrl(path) {
  if (!path) return "";

  if (path.startsWith("http")) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}