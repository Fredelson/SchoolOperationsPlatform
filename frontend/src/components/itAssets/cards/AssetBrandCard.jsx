// ============================================
// Asset Brand Card
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

import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

const AssetBrandCard = ({ brand, onClick }) => {
  return (
    <Card
      onClick={() => onClick?.(brand)}
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
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: 3,
                bgcolor: "rgba(76, 175, 80, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BusinessRoundedIcon sx={{ fontSize: 30, color: "success.main" }} />
            </Box>

            <IconButton size="small" sx={{ bgcolor: "grey.100" }}>
              <ArrowForwardRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Box>
            <Typography variant="h6" fontWeight={800} noWrap>
              {brand?.DisplayName || brand?.BrandName || brand?.ModelName || "No Brand / Model"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {brand?.GroupType === "BRAND"
                ? `${brand?.ModelCount || 0} models`
                : brand?.GroupType === "MODEL_ONLY"
                ? "Model only"
                : "No brand or model"}
            </Typography>
          </Box>

          <Typography variant="h4" fontWeight={900}>
            {brand?.TotalAssets || 0}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip size="small" label={`Available ${brand?.AvailableCount || 0}`} />
            <Chip size="small" label={`Assigned ${brand?.AssignedCount || 0}`} />
            <Chip size="small" label={`Maintenance ${brand?.MaintenanceCount || 0}`} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AssetBrandCard;