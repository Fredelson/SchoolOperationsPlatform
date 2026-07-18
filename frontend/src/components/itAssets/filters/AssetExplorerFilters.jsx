// ============================================
// Asset Explorer Filters
// Arab Unity School Operations Platform
// ============================================

import { Box, Button, MenuItem, TextField } from "@mui/material";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";

const getId = (item, keys) => {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null) return item[key];
  }
  return "";
};

const getLabel = (item, keys) => {
  for (const key of keys) {
    if (item?.[key]) return item[key];
  }
  return "Unnamed";
};

const selectMenuProps = {
  MenuProps: {
    PaperProps: {
      sx: {
        zIndex: (theme) => theme.zIndex.modal + 20,
      },
    },
  },
};

const AssetExplorerFilters = ({
  filters,
  statusOptions = [],
  locationOptions = [],
  conditionOptions = [],
  onChange,
  onClear,
}) => {
  const handleChange = (field) => (event) => {
    onChange?.({
      ...filters,
      [field]: event.target.value,
    });
  };

  return (
    <Box sx={{ display: "contents" }}>
      <TextField
        select
        size="small"
        label="Status"
        value={filters.statusId}
        onChange={handleChange("statusId")}
        SelectProps={selectMenuProps}
        sx={selectSx}
      >
        <MenuItem value="">All Status</MenuItem>

        {statusOptions.map((status) => (
          <MenuItem
            key={getId(status, ["ITAssetStatusId", "statusId", "id"])}
            value={getId(status, ["ITAssetStatusId", "statusId", "id"])}
          >
            {getLabel(status, ["StatusName", "statusName", "name"])}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        size="small"
        label="Location"
        value={filters.locationId}
        onChange={handleChange("locationId")}
        SelectProps={selectMenuProps}
        sx={selectSx}
      >
        <MenuItem value="">All Locations</MenuItem>

        {locationOptions.map((location) => (
          <MenuItem
            key={getId(location, ["LocationId", "locationId", "id"])}
            value={getId(location, ["LocationId", "locationId", "id"])}
          >
            {getLabel(location, ["LocationName", "locationName", "name"])}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        size="small"
        label="Condition"
        value={filters.conditionId}
        onChange={handleChange("conditionId")}
        SelectProps={selectMenuProps}
        sx={selectSx}
      >
        <MenuItem value="">All Conditions</MenuItem>

        {conditionOptions.map((condition) => (
          <MenuItem
            key={getId(condition, ["ITAssetConditionId", "conditionId", "id"])}
            value={getId(condition, ["ITAssetConditionId", "conditionId", "id"])}
          >
            {getLabel(condition, ["ConditionName", "conditionName", "name"])}
          </MenuItem>
        ))}
      </TextField>

      <Button
        size="small"
        variant="outlined"
        startIcon={<ClearRoundedIcon />}
        onClick={onClear}
        sx={{
          height: 36,
          borderRadius: 2,
          fontWeight: 800,
          whiteSpace: "nowrap",
        }}
      >
        Clear
      </Button>
    </Box>
  );
};

const selectSx = {
  "& .MuiOutlinedInput-root": {
    height: 36,
    borderRadius: 2,
  },
};

export default AssetExplorerFilters;
