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
import Profile from "../../shared/pages/Profile";

const permitted=(key,element)=><PermissionRoute permissionKey={key} requireVisible>{element}</PermissionRoute>;

import PrintingAdminDashboard from "../pages/PrintingAdminDashboard";
import PaperStockPage from "../pages/PaperStockPage";
import InventoryTransactions from "../pages/InventoryTransactions";
import PaperPurchases from "../pages/PaperPurchases";
import PaperDistributions from "../pages/PaperDistributions";
import MasterData from "../pages/MasterData";
import AccessLevelsPage from "../pages/AccessLevelsPage";
import DepartmentLimitsPage from "../pages/DepartmentLimitsPage";
import { UserManagement } from "../../admin/pages";

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

      // ======================================
      // Paper Inventory
      // ======================================

      {
        path: "paper-stock",
        element: permitted("printing.inventory.view",<PaperStockPage />),
      },
      {
        path: "department-limits",
        element: permitted("printing.limits.view",<DepartmentLimitsPage />),
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
        path: "assets",
        element: <Navigate to="/it-assets/assets" replace />,
      },

      // ======================================
      // Administration
      // ======================================

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
      { path: "profile", element: <Profile /> },
    ],
  },
];

export default printingAdminLayoutRoutes;
