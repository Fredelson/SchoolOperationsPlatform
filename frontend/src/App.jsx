// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Main App Routes
// ============================================
//
// Purpose:
// Registers public, protected, role-based,
// and layout-based application routes.
// ============================================

import { Routes, Route, Navigate } from "react-router-dom";

// ============================================
// Auth
// ============================================

import { LoginPage } from "./modules/auth/pages";
import ProtectedRoute from "./routes/ProtectedRoute";
import PermissionRoute from "./routes/PermissionRoute";

// ============================================
// Platform Foundation
// ============================================

import OrganizationBranding from "./modules/system/pages/OrganizationBranding";
import AssetTagBrandingPage from "./modules/system/pages/AssetTagBrandingPage";
import PlatformLayout from "./platform/layout/PlatformLayout";

// ============================================
// Teacher
// ============================================

import {
  TeacherDashboard,
  MyRequests,
  CreateRequest,
  RequestDetails,
  TeacherReports,
  Attachments,
} from "./modules/teacher/pages";

// ============================================
// HOD / HOS
// ============================================

import { HodDashboard, HodRequestsPage } from "./modules/hod/pages";
import { HosDashboard, SubjectAllocationPage } from "./modules/hos/pages";

// ============================================
// Printing / Platform Admin
// ============================================

import printingAdminLayoutRoutes from "./modules/printing-admin/routes/PrintingAdminLayoutRoutes";

// ============================================
// Super Admin
// ============================================

import superAdminLayoutRoutes from "./modules/super-admin/routes/SuperAdminLayoutRoutes";
import itOperationsLayoutRoutes from "./modules/it-assets/routes/ItOperationsLayoutRoutes";
import LiveModeHomePage from "./modules/super-admin/workspaces/pages/LiveModeHomePage";
import libraryLayoutRoutes from "./modules/library/routes/LibraryLayoutRoutes";
import PlatformAdminDashboard from "./modules/platform-admin/pages/PlatformAdminDashboard";

// ============================================
// Shared
// ============================================

import { Profile } from "./modules/shared/pages";
import AssignmentWorkspaceDashboard from "./modules/shared/pages/AssignmentWorkspaceDashboard";

// ============================================
// Role Groups
// ============================================

const teacherRoles = ["Teacher", "TeachingAssistant", "SuperAdmin"];
const hodRoles = ["HOD", "SuperAdmin"];
const hosRoles = ["HOS", "Secretary", "SuperAdmin"];

const printingRoles = ["PrintingAdmin", "PlatformAdmin", "SuperAdmin"];
const itOperationsRoles = ["ITAdmin", "PrintingAdmin", "PlatformAdmin", "SuperAdmin"];
const libraryRoles = ["Librarian", "LibraryAdmin", "SuperAdmin"];
const platformAdminRoles = [
  "SuperAdmin",
  "Super Admin",
  "super-admin",
  "PlatformAdmin",
];

const superAdminRoles = [
  "SuperAdmin",
  "Super Admin",
  "super-admin",
  "PlatformAdmin",
  "Platform Admin",
  "platform-admin",
];

const superAdminRoutePermissions = {
  dashboard: "SuperAdmin.Dashboard.View", modules: "Module.View", workspaces: "workspace.preview",
  "workspace-preview": "workspace.preview_user",
  menus: "Menu.View", "navigation-manager": "Navigation.View", buttons: "Button.View", widgets: "Widget.View",
  "feature-flags": "FeatureFlag.View", users: "users.view", roles: "roles.view",
  "school-configuration/access-levels": "access-levels.view",
  "user-assignments": "user-assignments.view", "assignment-types": "assignment-types.view", permissions: "permissions.view",
  "permission-groups": "permission-groups.view", "role-permissions": "role-permissions.view",
  "user-permission-overrides": "user-permission-overrides.view", printing: "printing.dashboard.view",
  assets: "it_assets.assets.view", "audit-logs": "AuditLog.View", settings: "SystemSettings.View",
};

const guardChildRoute=(parentPath,childPath,element)=>{
  if(!parentPath?.startsWith("/super-admin")) return element;
  const permissionKey=superAdminRoutePermissions[childPath];
  const secondary=new Set(["settings","audit-logs","workspace-preview"]);
  return permissionKey?<PermissionRoute permissionKey={permissionKey} requireVisible={!secondary.has(childPath)}>{element}</PermissionRoute>:element;
};

// ============================================
// Helper: Protected Layout Routes
// ============================================

const renderProtectedLayoutRoutes = (routes, allowedRoles) =>
  routes.map((route) => (
    <Route
      key={route.path}
      path={route.path}
      element={
        <ProtectedRoute allowedRoles={allowedRoles}>
          {route.element}
        </ProtectedRoute>
      }
    >
      {route.children?.map((child) => (
        <Route
          key={child.path || "index"}
          index={child.index}
          path={child.path}
          element={guardChildRoute(route.path, child.path, child.element)}
        />
      ))}
    </Route>
  ));

// ============================================
// App Routes
// ============================================

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Super Admin Layout Routes */}
      {renderProtectedLayoutRoutes(
        superAdminLayoutRoutes,
        superAdminRoles
      )}

      {/* Printing Admin Layout Routes */}
      {renderProtectedLayoutRoutes(
        printingAdminLayoutRoutes,
        printingRoles
      )}

      {/* IT Operations Layout Routes */}
      {renderProtectedLayoutRoutes(
          itOperationsLayoutRoutes,
          itOperationsRoles
      )}
      {renderProtectedLayoutRoutes(libraryLayoutRoutes,libraryRoles)}

      {/* Platform Foundation */}
      <Route path="/live-workspace" element={<ProtectedRoute><PlatformLayout /></ProtectedRoute>}><Route index element={<LiveModeHomePage />}/></Route>
      <Route path="/platform-admin" element={<ProtectedRoute allowedRoles={["PlatformAdmin"]}><PlatformLayout /></ProtectedRoute>}><Route index element={<Navigate to="dashboard" replace/>}/><Route path="dashboard" element={<PermissionRoute permissionKey="platform_admin.dashboard.view"><PlatformAdminDashboard/></PermissionRoute>}/><Route path="profile" element={<Profile/>}/></Route>
      <Route
        path="/system"
        element={
          <ProtectedRoute allowedRoles={platformAdminRoles}>
            <PlatformLayout />
          </ProtectedRoute>
        }
      >
        <Route path="branding" element={<PermissionRoute permissionKey="Branding.View" requireVisible><OrganizationBranding /></PermissionRoute>} />
        <Route path="rounded-asset-tag-branding" element={<PermissionRoute permissionKey="asset_tag_branding.rounded.view" requireVisible><AssetTagBrandingPage type="rounded" /></PermissionRoute>} />
        <Route path="rectangular-asset-tag-branding" element={<PermissionRoute permissionKey="asset_tag_branding.rectangular.view" requireVisible><AssetTagBrandingPage type="rectangular" /></PermissionRoute>} />
      </Route>

      <Route path="/teacher" element={<ProtectedRoute allowedRoles={teacherRoles}><PlatformLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} /><Route path="dashboard" element={<TeacherDashboard />} /><Route path="profile" element={<Profile />} /><Route path="my-requests" element={<MyRequests />} /><Route path="create-request" element={<CreateRequest />} /><Route path="attachments" element={<Attachments />} /><Route path="reports" element={<TeacherReports />} /><Route path="request-details/:id" element={<RequestDetails />} />
      </Route>
      <Route path="/hod" element={<ProtectedRoute allowedRoles={hodRoles}><PlatformLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} /><Route path="dashboard" element={<HodDashboard />} /><Route path="profile" element={<Profile />} /><Route path="pending-requests" element={<HodRequestsPage type="pending" />} /><Route path="approved-requests" element={<HodRequestsPage type="approved" />} /><Route path="rejected-requests" element={<HodRequestsPage type="rejected" />} /><Route path="returned-requests" element={<HodRequestsPage type="returned" />} /><Route path="my-requests" element={<MyRequests />} /><Route path="create-request" element={<CreateRequest />} /><Route path="attachments" element={<Attachments />} /><Route path="request-details/:id" element={<RequestDetails />} />
      </Route>
      <Route path="/hos" element={<ProtectedRoute allowedRoles={hosRoles}><PlatformLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} /><Route path="dashboard" element={<HosDashboard />} /><Route path="profile" element={<Profile />} /><Route path="subject-allocation" element={<SubjectAllocationPage />} />
      </Route>
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["Admin","SuperAdmin"]}><PlatformLayout /></ProtectedRoute>}><Route index element={<Navigate to="dashboard" replace />} /><Route path="dashboard" element={<AssignmentWorkspaceDashboard title="Administration Dashboard" subtitle="School administration, assignments, and operational access." />} /><Route path="profile" element={<Profile />} /></Route>
      <Route path="/year-leader" element={<ProtectedRoute allowedRoles={["SuperAdmin"]}><PlatformLayout /></ProtectedRoute>}><Route index element={<Navigate to="dashboard" replace />} /><Route path="dashboard" element={<AssignmentWorkspaceDashboard title="Year Leader Dashboard" subtitle="Year-group leadership within assigned organizational scopes." />} /><Route path="profile" element={<Profile />} /></Route>
      <Route path="/homeroom" element={<ProtectedRoute allowedRoles={["SuperAdmin"]}><PlatformLayout /></ProtectedRoute>}><Route index element={<Navigate to="dashboard" replace />} /><Route path="dashboard" element={<AssignmentWorkspaceDashboard title="Homeroom Dashboard" subtitle="Class oversight within assigned class scopes." />} /><Route path="profile" element={<Profile />} /></Route>
      <Route path="/deputy-head" element={<ProtectedRoute allowedRoles={["SuperAdmin"]}><PlatformLayout /></ProtectedRoute>}><Route index element={<Navigate to="dashboard" replace />} /><Route path="dashboard" element={<AssignmentWorkspaceDashboard title="Deputy Head Dashboard" subtitle="Academic leadership within assigned scopes." />} /><Route path="profile" element={<Profile />} /></Route>
      <Route path="/head-of-operations" element={<ProtectedRoute allowedRoles={["SuperAdmin"]}><PlatformLayout /></ProtectedRoute>}><Route index element={<Navigate to="dashboard" replace />} /><Route path="dashboard" element={<AssignmentWorkspaceDashboard title="Operations Dashboard" subtitle="Operational oversight within assigned locations and departments." />} /><Route path="profile" element={<Profile />} /></Route>
      <Route path="/clinic" element={<ProtectedRoute allowedRoles={["SuperAdmin"]}><PlatformLayout /></ProtectedRoute>}><Route index element={<Navigate to="dashboard" replace />} /><Route path="dashboard" element={<AssignmentWorkspaceDashboard title="Clinic Dashboard" subtitle="Clinic operations within assigned school and section scopes." />} /><Route path="profile" element={<Profile />} /></Route>

      {/* Default */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
