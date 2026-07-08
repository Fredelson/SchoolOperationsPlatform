// ============================================
// Asset Explorer Toolbar
// Arab Unity School Operations Platform
// ============================================

import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

/**
 * Reusable toolbar for IT Asset Explorer pages.
 */
const AssetExplorerToolbar = ({
  title = "Asset Management",
  subtitle = "",
  search,
  onSearchChange,
  onRefresh,
  onImport,
  onAddCategory,
  onAddAsset,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        mb: 3,
      }}
    >
      <Stack
        direction={{ xs: "column", lg: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", lg: "center" }}
        spacing={2}
      >
        <Box>
          <Typography variant="h4" fontWeight={900}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <TextField
            size="small"
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search assets..."
            InputProps={{
              startAdornment: (
                <SearchRoundedIcon sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
            sx={{ minWidth: { xs: "100%", md: 280 } }}
          />

          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={onRefresh}
          >
            Refresh
          </Button>

          <Button
            variant="outlined"
            startIcon={<UploadFileRoundedIcon />}
            onClick={onImport}
          >
            Import
          </Button>

          <Button
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={onAddCategory}
          >
            Add Category
          </Button>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={onAddAsset}
          >
            Add Asset
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default AssetExplorerToolbar;