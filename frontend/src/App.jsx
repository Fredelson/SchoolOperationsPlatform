import { Routes, Route, Navigate } from "react-router-dom";

import { LoginPage } from "./modules/auth/pages";
import ProtectedRoute from "./routes/ProtectedRoute";
import PermissionRoute from "./routes/PermissionRoute";

import OrganizationBranding from "./modules/system/pages/OrganizationBranding";
import PlatformLayout from "./platform/layout/PlatformLayout";

import {
  TeacherDashboard,
  MyRequests,
  CreateRequest,
  RequestDetails,
  TeacherReports,
  Attachments,
} from "./modules/teacher/pages";

import { HodDashboard, HodRequestsPage } from "./modules/hod/pages";
import { HosDashboard, SubjectAllocationPage } from "./modules/hos/pages";

import superAdminLayoutRoutes from "./modules/super-admin/routes/SuperAdminLayoutRoutes";
import ItOperationsLayoutRoutes from "./modules/it-assets/routes/ItOperationsLayoutRoutes";
import PrintingAdminLayoutRoutes from "./modules/printing-admin/routes/PrintingAdminLayoutRoutes";
import libraryLayoutRoutes from "./modules/library/routes/LibraryLayoutRoutes";
import PlatformAdminDashboard from "./modules/platform-admin/pages/PlatformAdminDashboard";
import { UserManagement } from "./modules/admin/pages";

import { Profile } from "./modules/shared/pages";
import AssignmentWorkspaceDashboard from "./modules/shared/pages/AssignmentWorkspaceDashboard";

const teacherRoles = ["Teacher", "TeachingAssistant", "SuperAdmin"];
const hodRoles = ["HOD", "SuperAdmin"];
const hosRoles = ["HOS", "Secretary", "SuperAdmin"];

const libraryRoles = ["Librarian", "LibraryAdmin", "SuperAdmin"];
const platformAdminRoles = ["SuperAdmin", "Super Admin", "super-admin", "PlatformAdmin"];
const superAdminRoles = ["SuperAdmin", "Super Admin", "super-admin", "PlatformAdmin", "Platform Admin", "platform-admin"];

const superAdminRoutePermissions = {
  dashboard: "platform_admin.dashboard.view",
  modules: "modules.view",
  workspaces: "workspace.view",
  menus: "menus.view",
  users: "users.view",
  roles: "roles.view",
};

function guardChildRoute(parentPath, childPath, element) {
  if (!parentPath?.startsWith("/super-admin")) return element;
  const permissionKey = superAdminRoutePermissions[childPath];
  const secondary = new Set(["settings", "audit-logs", "workspace-preview"]);
  return permissionKey
    ? <PermissionRoute permissionKey={permissionKey} requireVisible={!secondary.has(childPath)}>{element}</PermissionRoute>
    : element;
}

function renderProtectedLayoutRoutes(routes, allowedRoles) {
  return routes.map((route) => (
    <Route key={route.path} path={route.path} element={<ProtectedRoute allowedRoles={allowedRoles}>{route.element}</ProtectedRoute>}>
      {route.children?.map((child) => (
        <Route key={child.path || "index"} index={child.index} path={child.path} element={guardChildRoute(route.path, child.path, child.element)} />
      ))}
    </Route>
  ));
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {renderProtectedLayoutRoutes(superAdminLayoutRoutes, superAdminRoles)}

      {renderProtectedLayoutRoutes(ItOperationsLayoutRoutes, ["SuperAdmin", "PlatformAdmin", "ITAdmin"])}

      {renderProtectedLayoutRoutes(PrintingAdminLayoutRoutes, ["SuperAdmin", "PlatformAdmin", "PrintingAdmin"])}

      {renderProtectedLayoutRoutes(libraryLayoutRoutes, libraryRoles)}

      <Route path="/system" element={<ProtectedRoute><PlatformLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="branding" replace />} />
        <Route path="branding" element={<PermissionRoute permissionKey="Branding.View" requireVisible={true}><OrganizationBranding /></PermissionRoute>} />
      </Route>

      <Route path="/dashboard" element={<ProtectedRoute><PlatformLayout /></ProtectedRoute>}>
        <Route index element={<AssignmentWorkspaceDashboard title="Workspace Dashboard" subtitle="Your default workspace landing page." />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/platform-admin" element={<ProtectedRoute allowedRoles={["PlatformAdmin"]}><PlatformLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<PermissionRoute permissionKey="platform_admin.dashboard.view"><PlatformAdminDashboard /></PermissionRoute>} />
        <Route path="users" element={<PermissionRoute permissionKey="users.view"><UserManagement /></PermissionRoute>} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/teacher" element={<ProtectedRoute allowedRoles={teacherRoles}><PlatformLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="my-requests" element={<MyRequests />} />
        <Route path="create-request" element={<CreateRequest />} />
        <Route path="attachments" element={<Attachments />} />
        <Route path="reports" element={<TeacherReports />} />
        <Route path="request-details/:id" element={<RequestDetails />} />
      </Route>

      <Route path="/hod" element={<ProtectedRoute allowedRoles={hodRoles}><PlatformLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<HodDashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="pending-requests" element={<HodRequestsPage type="pending" />} />
        <Route path="approved-requests" element={<HodRequestsPage type="approved" />} />
        <Route path="rejected-requests" element={<HodRequestsPage type="rejected" />} />
        <Route path="returned-requests" element={<HodRequestsPage type="returned" />} />
        <Route path="my-requests" element={<MyRequests />} />
        <Route path="create-request" element={<CreateRequest />} />
        <Route path="attachments" element={<Attachments />} />
        <Route path="request-details/:id" element={<RequestDetails />} />
      </Route>

      <Route path="/hos" element={<ProtectedRoute allowedRoles={hosRoles}><PlatformLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<HosDashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="subject-allocation" element={<SubjectAllocationPage />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute allowedRoles={["Admin", "SuperAdmin"]}><PlatformLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AssignmentWorkspaceDashboard title="Administration Dashboard" subtitle="School administration, assignments, and operational access." />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/academic" element={<ProtectedRoute allowedRoles={["SuperAdmin", "PlatformAdmin", "AcademicAdmin"]}><PlatformLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AssignmentWorkspaceDashboard title="Academic Dashboard" subtitle="Academic operations and student IDs." />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/year-leader" element={<ProtectedRoute allowedRoles={["SuperAdmin"]}><PlatformLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AssignmentWorkspaceDashboard title="Year Leader Dashboard" subtitle="Year-group leadership within assigned organizational scopes." />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/homeroom" element={<ProtectedRoute allowedRoles={["SuperAdmin"]}><PlatformLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AssignmentWorkspaceDashboard title="Homeroom Dashboard" subtitle="Class oversight within assigned class scopes." />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/deputy-head" element={<ProtectedRoute allowedRoles={["SuperAdmin"]}><PlatformLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AssignmentWorkspaceDashboard title="Deputy Head Dashboard" subtitle="Academic leadership within assigned scopes." />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/head-of-operations" element={<ProtectedRoute allowedRoles={["SuperAdmin"]}><PlatformLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AssignmentWorkspaceDashboard title="Operations Dashboard" subtitle="Operational oversight within assigned locations and departments." />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/clinic" element={<ProtectedRoute allowedRoles={["SuperAdmin"]}><PlatformLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AssignmentWorkspaceDashboard title="Clinic Dashboard" subtitle="Clinic operations within assigned school and section scopes." />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/super-admin/dashboard" replace />} />
    </Routes>
  );
}
