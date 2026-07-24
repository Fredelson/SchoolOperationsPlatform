import { Navigate } from "react-router-dom";

import ProtectedRoute from "../../../routes/ProtectedRoute";
import PlatformLayout from "../../../platform/layout/PlatformLayout";
import Profile from "../../shared/pages/Profile";
import { UserManagement } from "../../admin/pages";

import PrintingAdminDashboard from "../pages/PrintingAdminDashboard";
import PaperStockPage from "../pages/PaperStockPage";
import InventoryTransactions from "../pages/InventoryTransactions";
import PaperPurchases from "../pages/PaperPurchases";
import PaperDistributions from "../pages/PaperDistributions";
import MasterData from "../pages/MasterData";
import DepartmentLimitsPage from "../pages/DepartmentLimitsPage";
import {
  PrintingApprovalsPage,
  PrintingQueuePage,
  PrintingReportsPage,
  PrintingRequestsPage,
  PrintingSettingsPage,
} from "../pages/PrintingWorkflowPages";

const printingAdminLayoutRoutes = [
  {
    path: "/printing",
    element: (
      <ProtectedRoute
        allowedRoles={["SuperAdmin", "PlatformAdmin", "PrintingAdmin"]}
      >
        <PlatformLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/printing/dashboard" replace /> },
      { path: "dashboard", element: <PrintingAdminDashboard /> },
      { path: "requests", element: <PrintingRequestsPage /> },
      { path: "approvals", element: <PrintingApprovalsPage /> },
      { path: "queue", element: <PrintingQueuePage /> },
      { path: "reports", element: <PrintingReportsPage /> },
      { path: "settings", element: <PrintingSettingsPage /> },
      { path: "paper-stock", element: <PaperStockPage /> },
      { path: "inventory", element: <Navigate to="/printing/paper-stock" replace /> },
      { path: "department-limits", element: <DepartmentLimitsPage /> },
      { path: "limits", element: <Navigate to="/printing/department-limits" replace /> },
      { path: "inventory-transactions", element: <InventoryTransactions /> },
      { path: "purchases", element: <PaperPurchases /> },
      { path: "distributions", element: <PaperDistributions /> },
      { path: "user-management", element: <UserManagement /> },
      { path: "purposes", element: <MasterData /> },
      { path: "master-data", element: <Navigate to="/printing/purposes" replace /> },
      { path: "profile", element: <Profile /> },
    ],
  },
];

export default printingAdminLayoutRoutes;
