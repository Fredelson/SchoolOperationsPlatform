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
import { UserManagement } from "../../admin/pages";
import AccessLevelsPage from "../user-access/pages/AccessLevelsPage";
import UserAssignmentsPage from "../user-access/pages/UserAssignmentsPage";
import UserPermissionOverridesPage from "../user-access/pages/UserPermissionOverridesPage";
import AssignmentTypesPage from "../user-access/pages/AssignmentTypesPage";


// ============================================
// Security & Access Pages
// ============================================

import {
  NavigationManagerPage,
  PermissionGroupsPage,
  PermissionManagerPage,
  RolesManagerPage,
  RolePermissionsPage,
} from "../enterprise/pages/EnterpriseDataManager";

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
        path: "navigation-manager",
        element: <NavigationManagerPage />,
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
        element: <UserManagement />,
      },
      {
        path: "roles",
        element: <RolesManagerPage />,
      },
      {
        path: "access-levels",
        element: <AccessLevelsPage />,
      },
      {
        path: "user-assignments",
        element: <UserAssignmentsPage />,
      },
      {
        path: "assignment-types",
        element: <AssignmentTypesPage />,
      },
      {
        path: "permissions",
        element: <PermissionManagerPage />,
      },
      {
        path: "permission-groups",
        element: <PermissionGroupsPage />,
      },
      {
        path: "role-permissions",
        element: <RolePermissionsPage />,
      },
      {
        path: "user-permission-overrides",
        element: <UserPermissionOverridesPage />,
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
