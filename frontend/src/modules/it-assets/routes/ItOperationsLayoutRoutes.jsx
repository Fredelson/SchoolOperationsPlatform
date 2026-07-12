// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// IT Operations Layout Routes
// ============================================

import { Navigate } from "react-router-dom";

import PlatformLayout from "@layouts/PlatformLayout";
import PermissionRoute from "../../../routes/PermissionRoute";

const permitted=(key,element,requireVisible=true)=><PermissionRoute permissionKey={key} requireVisible={requireVisible}>{element}</PermissionRoute>;

import ItAssetDashboard from "../pages/ItAssetDashboard";
import AssetDetails from "../pages/AssetDetails";
import AssetTagPrinter from "../pages/AssetTagPrinter";
import RoundedAssetTagPrinter from "../pages/RoundedAssetTagPrinter";
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
        element: permitted("it_assets.dashboard.view",<ItAssetDashboard />),
      },

      {
        path: "assets",
        element: permitted("it_assets.assets.view",<AssetExplorer />),
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
        element: permitted("asset_tags.rectangular.view",<AssetTagPrinter />),
      },
      {path:"rounded-asset-tag-printer",element:permitted("asset_tags.rounded.view",<RoundedAssetTagPrinter />)},

      {
        path: "assignments",
        element: permitted("it_assets.assignment.manage",<Assignments />),
      },

      {
        path: "borrow",
        element: permitted("it_assets.borrow.manage",<BorrowedAssets />),
      },

      {
        path: "transfers",
        element: permitted("it_assets.transfer.manage",<Transfers />),
      },

      {
        path: "issues",
        element: permitted("it_assets.issues.manage",<Issues />),
      },

      {
        path: "maintenance",
        element: permitted("it_assets.maintenance.manage",<Maintenance />),
      },

      {
        path: "disposals",
        element: permitted("it_assets.disposal.manage",<Disposals />),
      },

      {
        path: "reports",
        element: permitted("it_assets.reports.view",<Reports />),
      },

      // ============================================
      // Dynamic Asset Details Route
      //
      // Keep dynamic routes after all fixed routes.
      // ============================================

      {
        path: ":assetId",
        element: permitted("it_assets.assets.view",<AssetDetails />,false),
      },
    ],
  },
];

export default itOperationsLayoutRoutes;
