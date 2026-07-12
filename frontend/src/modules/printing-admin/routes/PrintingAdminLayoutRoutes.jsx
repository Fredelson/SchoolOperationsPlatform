// ============================================
// ARAB UNITY SCHOOL
// Printing Admin Layout Routes
//
// Purpose:
// Wrap all Printing Admin pages inside the
// shared PlatformLayout.
//
// Access:
// - PrintingAdmin
// - SuperAdmin
//
// Notes:
// - Every sidebar item must have a route
// - Real pages can replace placeholders later
// - Keeps sidebar navigation working
//
// Future:
// Replace ComingSoon pages one by one
// as modules are developed.
//
// ============================================

import { Navigate } from "react-router-dom";

import ProtectedRoute from "../../../routes/ProtectedRoute";
import PlatformLayout from "../../../platform/layout/PlatformLayout";
import PermissionRoute from "../../../routes/PermissionRoute";

const permitted=(key,element)=><PermissionRoute permissionKey={key}>{element}</PermissionRoute>;

import PrintingAdminDashboard from "../pages/PrintingAdminDashboard";
import PaperStockPage from "../pages/PaperStockPage";
import InventoryTransactions from "../pages/InventoryTransactions";
import PaperPurchases from "../pages/PaperPurchases";
import PaperDistributions from "../pages/PaperDistributions";
import MasterData from "../pages/MasterData";
import AccessLevelsPage from "../pages/AccessLevelsPage";
import { UserManagement } from "../../admin/pages";

// ============================================
// Shared Placeholder Page
// ============================================

import SuperAdminComingSoon from "../../super-admin/pages/SuperAdminComingSoon";

// ============================================
// Printing Admin Routes
// ============================================

const printingAdminLayoutRoutes = [
  {
    path: "/printing",

    element: (
      <ProtectedRoute
        allowedRoles={[
          "SuperAdmin",
          "PlatformAdmin",
          "PrintingAdmin",
        ]}
      >
        <PlatformLayout />
      </ProtectedRoute>
    ),

    children: [
      // ======================================
      // Default Redirect
      // ======================================

      {
        index: true,
        element: (
          <Navigate
            to="/printing/dashboard"
            replace
          />
        ),
      },

      // ======================================
      // Dashboard
      // ======================================

      {
        path: "dashboard",
        element: permitted("printing.dashboard.view",<PrintingAdminDashboard />),
      },

      // ======================================
      // Printing Management
      // ======================================

      {
        path: "queue",
        element: permitted("printing.queue.view",
          <SuperAdminComingSoon
            title="Print Queue"
          />),
      },

      {
        path: "completed",
        element: permitted("printing.queue.view",
          <SuperAdminComingSoon
            title="Completed Jobs"
          />),
      },

      // ======================================
      // Paper Inventory
      // ======================================

      {
        path: "paper-stock",
        element: permitted("printing.inventory.view",<PaperStockPage />),
      },

      {
        path: "inventory-transactions",
        element: permitted("printing.inventory.view",<InventoryTransactions />),
      },

      {
        path: "purchases",
        element: permitted("printing.purchases.view",<PaperPurchases />),
      },

      {
        path: "distributions",
        element: permitted("printing.distributions.view",<PaperDistributions />),
      },

      // ======================================
      // Operations Modules
      // ======================================

      {
        path: "tickets",
        element: (
          <SuperAdminComingSoon
            title="IT Service Desk"
          />
        ),
      },

      {
        path: "assets",
        element: <Navigate to="/it-assets/assets" replace />,
      },

      {
        path: "academic",
        element: (
          <SuperAdminComingSoon
            title="Academic Operations"
          />
        ),
      },

      {
        path: "observations",
        element: (
          <SuperAdminComingSoon
            title="Teacher Observations"
          />
        ),
      },

      {
        path: "communication",
        element: (
          <SuperAdminComingSoon
            title="Communication Center"
          />
        ),
      },

      // ======================================
      // Administration
      // ======================================

      {
        path: "reports",
        element: (
          <SuperAdminComingSoon
            title="Reports & Analytics"
          />
        ),
      },

      {
        path: "user-management",
        element: permitted("users.view",<UserManagement />),
      },

      {
        path: "master-data",
        element: permitted("printing.master-data.view",<MasterData />),
      },

      {
        path: "access-levels",
        element: permitted("printing.access-levels.view",<AccessLevelsPage />),
      },
    ],
  },
];

export default printingAdminLayoutRoutes;
