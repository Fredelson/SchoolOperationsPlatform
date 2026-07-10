// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// IT Operations Layout Routes
// ============================================

import { Navigate } from "react-router-dom";

import PlatformLayout from "@layouts/PlatformLayout";

import ItAssetDashboard from "../pages/ItAssetDashboard";
import AssetDetails from "../pages/AssetDetails";
import AssetTagPrinter from "../pages/AssetTagPrinter";
import Disposals from "../pages/Disposals";

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

      // ============================================
      // Asset Tag Printer
      //
      // Important:
      // This static route must appear before :assetId.
      // Otherwise "asset-tag-printer" may be treated
      // as an asset ID.
      // ============================================

      {
        path: "asset-tag-printer",
        element: <AssetTagPrinter />,
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
        element: <Disposals />,
      },

      {
        path: "reports",
        element: <div>Reports - Coming Soon</div>,
      },

      // ============================================
      // Dynamic Asset Details Route
      //
      // Keep dynamic routes after all fixed routes.
      // ============================================

      {
        path: ":assetId",
        element: <AssetDetails />,
      },
    ],
  },
];

export default itOperationsLayoutRoutes;
