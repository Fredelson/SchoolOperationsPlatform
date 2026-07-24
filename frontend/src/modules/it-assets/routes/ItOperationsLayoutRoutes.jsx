import { Navigate } from "react-router-dom";

import PlatformLayout from "@layouts/PlatformLayout";

import Profile from "../../shared/pages/Profile";

import ItAssetDashboard from "../pages/ItAssetDashboard";
import AssetExplorer from "../assetExplorer/pages/AssetExplorer";
import AssetTagPrinter from "../pages/AssetTagPrinter";
import RoundedAssetTagPrinter from "../pages/RoundedAssetTagPrinter";
import Assignments from "../pages/Assignments";
import BorrowedAssets from "../pages/BorrowedAssets";
import Transfers from "../pages/Transfers";
import Issues from "../pages/Issues";
import Maintenance from "../pages/Maintenance";
import Disposals from "../pages/Disposals";
import Reports from "../pages/Reports";
import AssetDetails from "../pages/AssetDetails";

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
        path: "asset-tag-printer",
        element: <AssetTagPrinter />,
      },
      {path:"rounded-asset-tag-printer",element:<RoundedAssetTagPrinter />},

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

      {
        path: ":assetId",
        element: <AssetDetails />,
      },
    ],
  },
];

export default itOperationsLayoutRoutes;

