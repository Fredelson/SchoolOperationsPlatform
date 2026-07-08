// ============================================
// Asset Category Card
// Arab Unity School Operations Platform
// ============================================

import {
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  Typography,
  alpha,
} from "@mui/material";

import LaptopMacRoundedIcon from "@mui/icons-material/LaptopMacRounded";
import DesktopWindowsRoundedIcon from "@mui/icons-material/DesktopWindowsRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import RouterRoundedIcon from "@mui/icons-material/RouterRounded";
import TabletMacRoundedIcon from "@mui/icons-material/TabletMacRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import TvRoundedIcon from "@mui/icons-material/TvRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";

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
    <Card
      onClick={() => onClick?.(category)}
      sx={(theme) => {
        const accent = theme.palette[accentKey]?.main || theme.palette.primary.main;

        return {
          height: "100%",
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[2],
          cursor: "pointer",
          overflow: "hidden",
          transition: theme.transitions.create(["transform", "box-shadow"], {
            duration: theme.transitions.duration.short,
          }),
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: theme.shadows[6],
          },
          "--asset-accent": accent,
        };
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box
              sx={(theme) => ({
                width: 58,
                height: 58,
                borderRadius: 3,
                bgcolor: alpha(
                  theme.palette[accentKey]?.main || theme.palette.primary.main,
                  0.1
                ),
                color: theme.palette[accentKey]?.main || theme.palette.primary.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              })}
            >
              <Icon sx={{ fontSize: 34 }} />
            </Box>

            <IconButton
              size="small"
              sx={(theme) => ({
                width: 38,
                height: 38,
                border: `1px solid ${theme.palette.divider}`,
                color: theme.palette.primary.main,
                bgcolor: theme.palette.background.paper,
              })}
            >
              <ArrowForwardRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Box>
            <Typography variant="h6" fontWeight={900} noWrap>
              {category?.CategoryName || "Unnamed Category"}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {category?.BrandCount || 0} brands · {category?.ModelCount || 0} models
            </Typography>
          </Box>

          <Stack direction="row" alignItems="end" spacing={1}>
            <Typography
              fontSize={32}
              fontWeight={900}
              sx={{ color: "var(--asset-accent)" }}
            >
              {category?.TotalAssets || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ pb: 0.8 }}>
              Assets
            </Typography>
          </Stack>

          <Box
            sx={(theme) => ({
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.action.hover, 0.45),
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              overflow: "hidden",
            })}
          >
            <StatItem
              icon={<CheckCircleOutlineRoundedIcon fontSize="small" />}
              label="Available"
              value={category?.AvailableCount || 0}
              colorKey="success"
            />
            <StatItem
              icon={<PersonOutlineRoundedIcon fontSize="small" />}
              label="Assigned"
              value={category?.AssignedCount || 0}
              colorKey="primary"
            />
            <StatItem
              icon={<BuildRoundedIcon fontSize="small" />}
              label="Maintenance"
              value={category?.MaintenanceCount || 0}
              colorKey="warning"
            />
          </Box>
        </Stack>
      </CardContent>

      <Box sx={{ height: 4, bgcolor: "var(--asset-accent)" }} />
    </Card>
  );
};

const StatItem = ({ icon, label, value, colorKey }) => (
  <Stack
    alignItems="center"
    spacing={0.4}
    sx={(theme) => ({
      py: 1,
      borderRight: `1px solid ${theme.palette.divider}`,
      "&:last-of-type": { borderRight: "none" },
    })}
  >
    <Stack
      direction="row"
      spacing={0.4}
      alignItems="center"
      sx={(theme) => ({ color: theme.palette[colorKey]?.main })}
    >
      {icon}
      <Typography fontSize={13} fontWeight={900}>
        {value}
      </Typography>
    </Stack>

    <Typography fontSize={11} color="text.secondary" fontWeight={700}>
      {label}
    </Typography>
  </Stack>
);

export default AssetCategoryCard;