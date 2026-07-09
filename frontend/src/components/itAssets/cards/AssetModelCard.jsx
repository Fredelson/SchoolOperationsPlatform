// ============================================
// Asset Model Card
// Arab Unity School Operations Platform
// ============================================

import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";

import AssetCard from "./base/AssetCard";
import AssetCardIcon from "./base/AssetCardIcon";
import AssetCardStats from "./base/AssetCardStats";

const AssetModelCard = ({ model, selected = false, onClick }) => {
  const title = model?.ModelName || "Unnamed Model";

  return (
    <AssetCard
      title={title}
      assetCount={model?.TotalAssets || 0}
      accentKey="secondary"
      selected={selected}
      icon={
        <AssetCardIcon accentKey="secondary">
          <Inventory2RoundedIcon sx={{ fontSize: 20 }} />
        </AssetCardIcon>
      }
      stats={
        <AssetCardStats
          items={[
            {
              icon: <CheckCircleOutlineRoundedIcon fontSize="small" />,
              label: "Available",
              value: model?.AvailableCount || 0,
              colorKey: "success",
            },
            {
              icon: <PersonOutlineRoundedIcon fontSize="small" />,
              label: "Assigned",
              value: model?.AssignedCount || 0,
              colorKey: "primary",
            },
            {
              icon: <BuildRoundedIcon fontSize="small" />,
              label: "Maintenance",
              value: model?.MaintenanceCount || 0,
              colorKey: "warning",
            },
          ]}
        />
      }
      ariaLabel={`Open ${title}`}
      onClick={() => onClick?.(model)}
    />
  );
};

export default AssetModelCard;