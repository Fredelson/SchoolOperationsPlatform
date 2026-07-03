// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Super Admin Layout Routes
// ============================================
//
// Purpose:
// Central route configuration for all Super Admin pages.
//
// Flow:
// App.jsx
//   ↓
// ProtectedRoute
//   ↓
// SuperAdminLayoutRoutes
//   ↓
// PlatformLayout
//   ↓
// Child Pages
//
// Important:
// App.jsx already protects /super-admin.
// This file only registers layout + nested pages.
// ============================================

import { Navigate } from "react-router-dom";

// ============================================
// Platform Layout
// ============================================

import PlatformLayout from "@layouts/PlatformLayout";

// ============================================
// Super Admin Dashboard
// ============================================

import SuperAdminDashboard from "../dashboard/pages/SuperAdminDashboard";

// ============================================
// Platform Administration Pages
// ============================================

import ModuleManager from "../modules/pages/ModuleManager";
import MenuManager from "../menus/pages/MenuManager";
import ButtonManager from "../buttons/pages/ButtonManager";
import WidgetManager from "../widgets/pages/WidgetManager";
import FeatureFlagManager from "../features/featureFlags/pages/FeatureFlagManager";


// ============================================
// Security & Access Pages
// ============================================

import RolesManager from "../roles/pages/RolesManager";
import PermissionsMatrix from "../permissions/pages/PermissionsMatrix";

// ============================================
// Monitoring & System Pages
// ============================================

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
    path: "/super-admin",
    element: <PlatformLayout />,

    children: [
      // Default redirect
      {
        index: true,
        element: <Navigate to="/super-admin/dashboard" replace />,
      },

      // Dashboard
      {
        path: "dashboard",
        element: <SuperAdminDashboard />,
      },

      // Platform Administration
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
        element: <FeatureFlagManager />,
      },

      // Security & Access
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

      // Operations Modules
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

      // Monitoring
      {
        path: "audit-logs",
        element: <AuditLogs />,
      },
      {
        path: "activity-logs",
        element: <SuperAdminComingSoon title="Activity Logs" />,
      },

      // System Control
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