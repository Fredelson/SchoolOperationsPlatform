// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Button Manager Filters
// ============================================
//
// Purpose:
// Reusable filter toolbar for the Button Manager.
//
// Responsibilities:
// • Search
// • Module Filter
// • Visibility Filter
// • Reset Filters
//
// Rules:
// • No API calls
// • No CRUD logic
// • No dialog logic
// ============================================

import {
  Grid,
  MenuItem,
  TextField,
} from "@mui/material";

import AppButton from "../../../../platform/ui/AppButton";
import AppToolbar from "../../../../platform/ui/AppToolbar";

export default function ButtonFilters({
  filters,
  lookups,
  onFilterChange,
  onReset,
  onRefresh,
  onCreate,
}) {
  return (
    <AppToolbar>
      <Grid container spacing={2} alignItems="center">
        {/* ============================================
            Search
        ============================================ */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Search"
            placeholder="Search button..."
            value={filters.search}
            onChange={(event) =>
              onFilterChange("search", event.target.value)
            }
          />
        </Grid>

        {/* ============================================
            Module Filter
        ============================================ */}
        <Grid item xs={12} md={3}>
          <TextField
            select
            fullWidth
            size="small"
            label="Module"
            value={filters.moduleId}
            onChange={(event) =>
              onFilterChange("moduleId", event.target.value)
            }
          >
            <MenuItem value="">All Modules</MenuItem>

            {lookups.modules.map((module) => (
              <MenuItem
                key={module.moduleId ?? module.ModuleId}
                value={module.moduleId ?? module.ModuleId}
              >
                {module.moduleName ?? module.ModuleName}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* ============================================
            Visibility Filter
        ============================================ */}
        <Grid item xs={12} md={3}>
          <TextField
            select
            fullWidth
            size="small"
            label="Visibility"
            value={filters.visibilityStatusId}
            onChange={(event) =>
              onFilterChange(
                "visibilityStatusId",
                event.target.value
              )
            }
          >
            <MenuItem value="">All</MenuItem>

            {lookups.visibilityStatuses.map((status) => (
              <MenuItem
                key={
                  status.visibilityStatusId ??
                  status.VisibilityStatusId
                }
                value={
                  status.visibilityStatusId ??
                  status.VisibilityStatusId
                }
              >
                {status.statusName ?? status.StatusName}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* ============================================
            Actions
        ============================================ */}
        <Grid
          item
          xs={12}
          md={2}
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <AppButton
            variant="outlined"
            onClick={onReset}
          >
            Reset
          </AppButton>

          <AppButton
            variant="outlined"
            onClick={onRefresh}
          >
            Refresh
          </AppButton>

          <AppButton
            variant="contained"
            onClick={onCreate}
          >
            New Button
          </AppButton>
        </Grid>
      </Grid>
    </AppToolbar>
  );
}
