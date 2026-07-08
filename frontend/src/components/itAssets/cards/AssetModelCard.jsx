// ============================================
// Asset Model Card
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

import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";

const AssetModelCard = ({ model, selected = false, onClick }) => {
  return (
    <Card
      onClick={() => onClick?.(model)}
      sx={(theme) => ({
        height: "100%",
        borderRadius: 4,
        border: selected
          ? `2px solid ${theme.palette.primary.main}`
          : `1px solid ${theme.palette.divider}`,
        boxShadow: selected ? theme.shadows[6] : theme.shadows[2],
        cursor: "pointer",
        overflow: "hidden",
        transition: theme.transitions.create(["transform", "box-shadow"], {
          duration: theme.transitions.duration.short,
        }),
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[6],
        },
      })}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box
              sx={(theme) => ({
                width: 58,
                height: 58,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.secondary.main, 0.12),
                color: theme.palette.secondary.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              })}
            >
              <Inventory2RoundedIcon sx={{ fontSize: 34 }} />
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

          <Typography variant="h6" fontWeight={900} noWrap>
            {model?.ModelName || "Unnamed Model"}
          </Typography>

          <Stack direction="row" alignItems="end" spacing={1}>
            <Typography
              fontSize={32}
              fontWeight={900}
              sx={(theme) => ({ color: theme.palette.secondary.main })}
            >
              {model?.TotalAssets || 0}
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
            <StatItem icon={<CheckCircleOutlineRoundedIcon fontSize="small" />} label="Available" value={model?.AvailableCount || 0} colorKey="success" />
            <StatItem icon={<PersonOutlineRoundedIcon fontSize="small" />} label="Assigned" value={model?.AssignedCount || 0} colorKey="primary" />
            <StatItem icon={<BuildRoundedIcon fontSize="small" />} label="Maintenance" value={model?.MaintenanceCount || 0} colorKey="warning" />
          </Box>
        </Stack>
      </CardContent>

      <Box sx={(theme) => ({ height: 4, bgcolor: theme.palette.secondary.main })} />
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
    <Stack direction="row" spacing={0.4} alignItems="center" sx={(theme) => ({ color: theme.palette[colorKey]?.main })}>
      {icon}
      <Typography fontSize={13} fontWeight={900}>{value}</Typography>
    </Stack>
    <Typography fontSize={11} color="text.secondary" fontWeight={700}>{label}</Typography>
  </Stack>
);

export default AssetModelCard;