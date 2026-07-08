// ============================================
// Asset Breadcrumb
// Arab Unity School Operations Platform
// ============================================

import { Breadcrumbs, Button, Typography } from "@mui/material";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";

const AssetBreadcrumb = ({
  selectedCategory,
  selectedBrand,
  selectedModel,
  onRoot,
  onCategory,
}) => {
  return (
    <Breadcrumbs separator={<NavigateNextRoundedIcon fontSize="small" />} sx={{ mb: 2 }}>
      <Button size="small" onClick={onRoot}>
        Asset Management
      </Button>

      {selectedCategory && (
        <Button size="small" onClick={onCategory}>
          {selectedCategory.CategoryName}
        </Button>
      )}

      {selectedBrand && (
        <Typography variant="body2" color="text.primary" fontWeight={700}>
          {selectedBrand.BrandName}
        </Typography>
      )}

      {selectedModel && (
        <Typography variant="body2" color="text.primary" fontWeight={700}>
          {selectedModel.ModelName}
        </Typography>
      )}
    </Breadcrumbs>
  );
};

export default AssetBreadcrumb;