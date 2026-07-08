// ============================================
// Asset Category Card
// Arab Unity School Operations Platform
// ============================================

import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import LaptopMacIcon from "@mui/icons-material/LaptopMac";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import PrintIcon from "@mui/icons-material/Print";
import RouterIcon from "@mui/icons-material/Router";
import TabletMacIcon from "@mui/icons-material/TabletMac";
import VideocamIcon from "@mui/icons-material/Videocam";
import TvIcon from "@mui/icons-material/Tv";
import CategoryIcon from "@mui/icons-material/Category";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

/**
 * Maps database IconKey values to MUI icons.
 */
const iconMap = {
  laptop: LaptopMacIcon,
  desktop: DesktopWindowsIcon,
  printer: PrintIcon,
  network: RouterIcon,
  tablet: TabletMacIcon,
  camera: VideocamIcon,
  monitor: TvIcon,
  projector: TvIcon,
  category: CategoryIcon,
};

/**
 * Reusable category card for IT Asset modules.
 *
 * Used by:
 * - Asset Explorer
 * - Future Disposal Categories
 */
const AssetCategoryCard = ({ category, onClick }) => {
  const Icon = iconMap[category?.IconKey] || CategoryIcon;

  return (
    <Card
      onClick={() => onClick?.(category)}
      sx={{
        height: "100%",
        borderRadius: 4,
        cursor: "pointer",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.12)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.25}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(25, 118, 210, 0.08)",
              }}
            >
              <Icon sx={{ fontSize: 30, color: "primary.main" }} />
            </Box>

            <IconButton
              size="small"
              sx={{
                bgcolor: "grey.100",
                "&:hover": { bgcolor: "primary.main", color: "white" },
              }}
            >
              <ArrowForwardRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Box>
            <Typography variant="h6" fontWeight={800} noWrap>
              {category?.CategoryName || "Unnamed Category"}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {category?.BrandCount || 0} brands · {category?.ModelCount || 0} models
            </Typography>
          </Box>

          <Typography variant="h4" fontWeight={900}>
            {category?.TotalAssets || 0}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: -1.5 }}>
            Total assets
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              size="small"
              label={`Available ${category?.AvailableCount || 0}`}
              sx={{ bgcolor: "rgba(46, 125, 50, 0.08)", color: "success.main" }}
            />

            <Chip
              size="small"
              label={`Assigned ${category?.AssignedCount || 0}`}
              sx={{ bgcolor: "rgba(25, 118, 210, 0.08)", color: "primary.main" }}
            />

            <Chip
              size="small"
              label={`Maintenance ${category?.MaintenanceCount || 0}`}
              sx={{ bgcolor: "rgba(237, 108, 2, 0.08)", color: "warning.main" }}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AssetCategoryCard;