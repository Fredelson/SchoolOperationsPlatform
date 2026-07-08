// ============================================
// Asset Model Card
// Arab Unity School Operations Platform
// ============================================

import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";

const AssetModelCard = ({ model, selected = false, onClick }) => {
  return (
    <Card
      onClick={() => onClick?.(model)}
      sx={{
        height: "100%",
        borderRadius: 4,
        cursor: "pointer",
        border: "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        boxShadow: selected
          ? "0 16px 40px rgba(25, 118, 210, 0.18)"
          : "0 10px 30px rgba(15, 23, 42, 0.06)",
        transition: "all 0.2s ease",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              bgcolor: "rgba(156, 39, 176, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Inventory2RoundedIcon sx={{ fontSize: 28, color: "secondary.main" }} />
          </Box>

          <Typography variant="h6" fontWeight={800} noWrap>
            {model?.ModelName || "Unnamed Model"}
          </Typography>

          <Typography variant="h4" fontWeight={900}>
            {model?.TotalAssets || 0}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip size="small" label={`Available ${model?.AvailableCount || 0}`} />
            <Chip size="small" label={`Assigned ${model?.AssignedCount || 0}`} />
            <Chip size="small" label={`Maintenance ${model?.MaintenanceCount || 0}`} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AssetModelCard;