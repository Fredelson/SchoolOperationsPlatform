// ============================================
// ARAB UNITY SCHOOL
// Get Sidebar Sections By Role
// ============================================
//
// Purpose:
// Returns the correct sidebar menu configuration
// based on the authenticated user's role.
//
// Notes:
// Normalizes role values so the sidebar still works
// if the backend sends "SuperAdmin", "Super Admin",
// "superadmin", or similar variations.
// ============================================

import { superAdminSidebarSections } from "./superAdminSidebarItems";
import { printingAdminSidebarSections } from "./printingAdminSidebarItems";

export function getSidebarItemsByRole(role) {
  const normalizedRole = String(role || "")
    .replace(/\s+/g, "")
    .toLowerCase();

  switch (normalizedRole) {
    case "superadmin":
      return superAdminSidebarSections;

    case "printingadmin":
      return printingAdminSidebarSections;

    default:
      return [];
  }
}