// ============================================
// Asset Category Card
// Arab Unity School Operations Platform
// ============================================

import LaptopMacRoundedIcon from "@mui/icons-material/LaptopMacRounded";
import DesktopWindowsRoundedIcon from "@mui/icons-material/DesktopWindowsRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import RouterRoundedIcon from "@mui/icons-material/RouterRounded";
import TabletMacRoundedIcon from "@mui/icons-material/TabletMacRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import TvRoundedIcon from "@mui/icons-material/TvRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";

import AssetCard from "./base/AssetCard";
import AssetCardIcon from "./base/AssetCardIcon";
import AssetCardStats from "./base/AssetCardStats";

const iconMap = {
  laptop: LaptopMacRoundedIcon,
  desktop: DesktopWindowsRoundedIcon,
  printer: PrintRoundedIcon,
  network: RouterRoundedIcon,
  tablet: TabletMacRoundedIcon,
  camera: VideocamRoundedIcon,
  monitor: TvRoundedIcon,
  projector: TvRoundedIcon,
  category: CategoryRoundedIcon,
};

const accentPaletteMap = {
  laptop: "primary",
  desktop: "success",
  printer: "warning",
  network: "info",
  tablet: "secondary",
  camera: "warning",
  monitor: "secondary",
  projector: "info",
  category: "primary",
};

const AssetCategoryCard = ({ category, onClick }) => {
  const iconKey = category?.IconKey || "category";
  const Icon = iconMap[iconKey] || CategoryRoundedIcon;
  const accentKey = accentPaletteMap[iconKey] || "primary";

  return (
    <AssetCard
      title={category?.CategoryName || "Unnamed Category"}
      subtitle={`${category?.BrandCount || 0} brands · ${
        category?.ModelCount || 0
      } models`}
      assetCount={category?.TotalAssets || 0}
      accentKey={accentKey}
      icon={
        <AssetCardIcon accentKey={accentKey}>
          <Icon sx={{ fontSize: 20 }} />
        </AssetCardIcon>
      }
      stats={
        <AssetCardStats
          items={[
            {
              icon: <CheckCircleOutlineRoundedIcon fontSize="small" />,
              label: "Available",
              value: category?.AvailableCount || 0,
              colorKey: "success",
            },
            {
              icon: <PersonOutlineRoundedIcon fontSize="small" />,
              label: "Assigned",
              value: category?.AssignedCount || 0,
              colorKey: "primary",
            },
            {
              icon: <BuildRoundedIcon fontSize="small" />,
              label: "Maintenance",
              value: category?.MaintenanceCount || 0,
              colorKey: "warning",
            },
          ]}
        />
      }
      ariaLabel={`Open ${category?.CategoryName || "category"}`}
      onClick={() => onClick?.(category)}
    />
  );
};

export default AssetCategoryCard;