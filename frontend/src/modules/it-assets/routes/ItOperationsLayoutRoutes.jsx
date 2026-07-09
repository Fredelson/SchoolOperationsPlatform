// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// IT Operations Layout Routes
// ============================================

import { Navigate } from "react-router-dom";

import PlatformLayout from "@layouts/PlatformLayout";

import ItAssetDashboard from "../pages/ItAssetDashboard";
import AssetDetails from "../pages/AssetDetails";
import { AssetExplorer } from "../assetExplorer";

const itOperationsLayoutRoutes = [
  {
    path: "/it-assets",
    element: <PlatformLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/it-assets/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <ItAssetDashboard />,
      },
      {
        path: "assets",
        element: <AssetExplorer />,
      },
      {
        path: ":assetId",
        element: <AssetDetails />,
      },
      {
        path: "assignments",
        element: <div>Assignments - Coming Soon</div>,
      },
      {
        path: "borrow",
        element: <div>Borrow & Return - Coming Soon</div>,
      },
      {
        path: "transfers",
        element: <div>Transfers - Coming Soon</div>,
      },
      {
        path: "issues",
        element: <div>Issues - Coming Soon</div>,
      },
      {
        path: "maintenance",
        element: <div>Maintenance - Coming Soon</div>,
      },
      {
        path: "disposals",
        element: <div>Disposals - Coming Soon</div>,
      },
      {
        path: "reports",
        element: <div>Reports - Coming Soon</div>,
      },
    ],
  },
];

export default itOperationsLayoutRoutes;