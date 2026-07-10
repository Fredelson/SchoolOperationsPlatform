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
import Assignments from "../pages/Assignments";
import Transfers from "../pages/Transfers";
import Issues from "../pages/Issues";
import Maintenance from "../pages/Maintenance";
import Reports from "../pages/Reports";
import BorrowedAssets from "../pages/BorrowedAssets";

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
        element: <Assignments />,
      },

      {
        path: "borrow",
        element: <BorrowedAssets />,
      },

      {
        path: "transfers",
        element: <Transfers />,
      },

      {
        path: "issues",
        element: <Issues />,
      },

      {
        path: "maintenance",
        element: <Maintenance />,
      },

      {
        path: "disposals",
        element: <Disposals />,
      },

      {
        path: "reports",
        element: <Reports />,
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
