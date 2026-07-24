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

// ============================================================
// Platform Administration Pages
// ============================================================

import ModuleManager from "../modules/pages/ModuleManager";
import MenuManager from "../menus/pages/MenuManager";
import { UserManagement } from "../../admin/pages";
import WorkspaceManagerPage from "../workspaces/pages/WorkspaceManagerPage";
import SchoolConfigPage from "../school-config/pages/SchoolConfigPage";

// ============================================================
// Security & Access Pages
// ============================================================

import { RolesManagerPage } from "../enterprise/pages/EnterpriseDataManager";
import AssignmentTypesPage from "../user-access/pages/AssignmentTypesPage";
import UserAssignmentsPage from "../user-access/pages/UserAssignmentsPage";
import UserPermissionOverridesPage from "../user-access/pages/UserPermissionOverridesPage";

// ============================================================
// Monitoring & System Pages
// ============================================================

import AuditLogs from "../audit-logs/pages/AuditLogs";
import SystemSettings from "../settings/pages/SystemSettings";
import Profile from "../../shared/pages/Profile";

// ============================================================
// Super Admin Nested Layout Routes
// ============================================================

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
        path: "workspaces",
        element: <WorkspaceManagerPage />,
      },
      {
        path: "menus",
        element: <MenuManager />,
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
        path: "assignment-types",
        element: <AssignmentTypesPage />,
      },
      {
        path: "user-assignments",
        element: <UserAssignmentsPage />,
      },
      {
        path: "user-permission-overrides",
        element: <UserPermissionOverridesPage />,
      },
      {
        path: "school-configuration",
        element: <Navigate to="/super-admin/school-configuration/subjects" replace />,
      },
      {
        path: "school-configuration/subjects",
        element: <SchoolConfigPage section="subjects" />,
      },
      {
        path: "school-configuration/departments",
        element: <SchoolConfigPage section="departments" />,
      },
      {
        path: "school-configuration/sections",
        element: <SchoolConfigPage section="sections" />,
      },
      {
        path: "school-config",
        element: <Navigate to="/super-admin/school-configuration/subjects" replace />,
      },
      {
        path: "settings/subjects",
        element: <Navigate to="/super-admin/school-configuration/subjects" replace />,
      },
      {
        path: "settings/departments",
        element: <Navigate to="/super-admin/school-configuration/departments" replace />,
      },
      {
        path: "settings/sections",
        element: <Navigate to="/super-admin/school-configuration/sections" replace />,
      },

      // Monitoring
      {
        path: "audit-logs",
        element: <AuditLogs />,
      },

      // System Control
      {
        path: "settings",
        element: <SystemSettings />,
      },
      { path: "profile", element: <Profile /> },
    ],
  },
];

export default superAdminLayoutRoutes;




