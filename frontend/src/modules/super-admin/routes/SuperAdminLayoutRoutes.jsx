// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Super Admin Layout Routes
// ============================================
//
// Purpose:
// Central route configuration for all Super Admin pages.
//
// Important:
// App.jsx already protects the full /super-admin route
// using ProtectedRoute, so this file should only handle
// layout and nested page registration.
//
// ModuleGuard is temporarily removed here to prevent
// incorrect redirects while backend permission/module
// resolver wiring is still being finalized.
// ============================================

import { Navigate } from "react-router-dom";

// ============================================
// Platform Layout
// ============================================

import PlatformLayout from "@layouts/PlatformLayout";

// ============================================
// Feature Pages
// ============================================

import SuperAdminDashboard from "../dashboard/pages/SuperAdminDashboard";

import ModuleManager from "../modules/pages/ModuleManager";
import MenuManager from "../menus/pages/MenuManager";
import ButtonManager from "../buttons/pages/ButtonManager";
import WidgetManager from "../widgets/pages/WidgetManager";
import FeatureFlags from "../feature-flags/pages/FeatureFlags";

import RolesManager from "../roles/pages/RolesManager";
import PermissionsMatrix from "../permissions/pages/PermissionsMatrix";

import AuditLogs from "../audit-logs/pages/AuditLogs";
import SystemSettings from "../settings/pages/SystemSettings";

// ============================================
// Temporary Placeholder Page
// ============================================

import SuperAdminComingSoon from "../pages/SuperAdminComingSoon";

// ============================================
// Super Admin Nested Layout Routes
// ============================================

const superAdminLayoutRoutes = [
  {
    // Parent route:
    // All child routes render inside PlatformLayout through <Outlet />.
    path: "/super-admin",

    // ProtectedRoute is applied in App.jsx.
    // Keep this layout clean and focused only on rendering.
    element: <PlatformLayout />,

    children: [
      // ======================================
      // Default Redirect
      // ======================================

      {
        index: true,
        element: <Navigate to="/super-admin/dashboard" replace />,
      },

      // ======================================
      // Dashboard
      // ======================================

      {
        path: "dashboard",
        element: <SuperAdminDashboard />,
      },

      // ======================================
      // Platform Administration
      // ======================================

      {
        path: "modules",
        element: <ModuleManager />,
      },
      {
        path: "menus",
        element: <MenuManager />,
      },
      {
        path: "buttons",
        element: <ButtonManager />,
      },
      {
        path: "widgets",
        element: <WidgetManager />,
      },
      {
        path: "feature-flags",
        element: <FeatureFlags />,
      },

      // ======================================
      // Security & Access
      // ======================================

      {
        path: "users",
        element: <SuperAdminComingSoon title="User Management" />,
      },
      {
        path: "roles",
        element: <RolesManager />,
      },
      {
        path: "access-levels",
        element: <SuperAdminComingSoon title="Access Levels" />,
      },
      {
        path: "permissions",
        element: <PermissionsMatrix />,
      },

      // ======================================
      // Operations Modules
      // ======================================

      {
        path: "printing",
        element: <SuperAdminComingSoon title="Printing Management" />,
      },
      {
        path: "inventory",
        element: <SuperAdminComingSoon title="Inventory Management" />,
      },
      {
        path: "it-tickets",
        element: <SuperAdminComingSoon title="IT Service Desk" />,
      },
      {
        path: "assets",
        element: <SuperAdminComingSoon title="IT Asset Management" />,
      },
      {
        path: "academic",
        element: <SuperAdminComingSoon title="Academic Operations" />,
      },
      {
        path: "observations",
        element: <SuperAdminComingSoon title="Teacher Observations" />,
      },
      {
        path: "communication",
        element: <SuperAdminComingSoon title="Communication Center" />,
      },
      {
        path: "reports",
        element: <SuperAdminComingSoon title="Reports & Analytics" />,
      },
      {
        path: "hr",
        element: <SuperAdminComingSoon title="HR Management" />,
      },

      // ======================================
      // Monitoring
      // ======================================

      {
        path: "audit-logs",
        element: <AuditLogs />,
      },
      {
        path: "activity-logs",
        element: <SuperAdminComingSoon title="Activity Logs" />,
      },

      // ======================================
      // System Control
      // ======================================

      {
        path: "settings",
        element: <SystemSettings />,
      },
      {
        path: "backups",
        element: <SuperAdminComingSoon title="Backup & Restore" />,
      },
      {
        path: "integrations",
        element: <SuperAdminComingSoon title="Integrations" />,
      },
      {
        path: "database-tools",
        element: <SuperAdminComingSoon title="Database Tools" />,
      },
    ],
  },
];

export default superAdminLayoutRoutes;
