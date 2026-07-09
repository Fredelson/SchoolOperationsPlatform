// ============================================
// Asset Brand Card
// Arab Unity School Operations Platform
// ============================================

import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";

import AssetCard from "./base/AssetCard";
import AssetCardIcon from "./base/AssetCardIcon";
import AssetCardStats from "./base/AssetCardStats";

const AssetBrandCard = ({ brand, onClick }) => {
  const isFallback = brand?.GroupType === "NO_BRAND_MODEL";
  const title =
    brand?.DisplayName || brand?.BrandName || brand?.ModelName || "No Brand / Model";

  const accentKey = isFallback ? "text" : "success";
  const Icon = isFallback ? Inventory2RoundedIcon : BusinessRoundedIcon;

  return (
    <AssetCard
      title={title}
      subtitle={`${brand?.ModelCount || 0} models`}
      assetCount={brand?.TotalAssets || 0}
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
              value: brand?.AvailableCount || 0,
              colorKey: "success",
            },
            {
              icon: <PersonOutlineRoundedIcon fontSize="small" />,
              label: "Assigned",
              value: brand?.AssignedCount || 0,
              colorKey: "primary",
            },
            {
              icon: <BuildRoundedIcon fontSize="small" />,
              label: "Maintenance",
              value: brand?.MaintenanceCount || 0,
              colorKey: "warning",
            },
          ]}
        />
      }
      ariaLabel={`Open ${title}`}
      onClick={() => onClick?.(brand)}
    />
  );
};

export default AssetBrandCard;