// ============================================
// Compact Asset Explorer Toolbar
// Arab Unity School Operations Platform
// ============================================

import {
  Box,
  Button,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

const AssetExplorerToolbar = ({
  title = "Asset Management",
  subtitle = "Manage and organize all IT assets across the school.",
  search,
  searchPlaceholder = "Search assets...",
  filtersContent,
  onSearchChange,
  onRefresh,
  onImport,
  onAddAsset,
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={1.5}
        sx={{ mb: 1.5 }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 26, md: 32 },
              fontWeight: 900,
              lineHeight: 1.05,
            }}
          >
            {title}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
            {subtitle}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={onRefresh}
            sx={actionButtonSx}
          >
            Refresh
          </Button>

          <Button
            size="small"
            variant="outlined"
            startIcon={<UploadFileRoundedIcon />}
            onClick={onImport}
            sx={actionButtonSx}
          >
            Import
          </Button>

          <Button
            size="small"
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={onAddAsset}
            sx={actionButtonSx}
          >
            Add Asset
          </Button>
        </Stack>
      </Stack>

      <Paper
        elevation={0}
        sx={(theme) => ({
          p: 1,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
        })}
      >
        <Stack
          direction={{ xs: "column", xl: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", xl: "center" }}
        >
          <TextField
            fullWidth
            size="small"
            value={search}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder={searchPlaceholder}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: { xl: 560 },
              "& .MuiOutlinedInput-root": {
                height: 38,
                borderRadius: 2.5,
              },
            }}
          />

          {filtersContent}
        </Stack>
      </Paper>
    </Box>
  );
};

const actionButtonSx = {
  minHeight: 38,
  px: 2,
  borderRadius: 2.5,
  fontWeight: 800,
};

export default AssetExplorerToolbar;