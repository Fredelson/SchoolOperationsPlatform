// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// useBranding Hook
// ============================================
//
// Purpose:
// Simple reusable hook for accessing platform
// organization and branding data.
// ============================================

import { useBrandingContext } from "../context/BrandingContext";

export default function useBranding() {
  return useBrandingContext();
}
