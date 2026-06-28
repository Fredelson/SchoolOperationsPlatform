// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// AppSearch
// ============================================
//
// Purpose:
// Reusable search input for tables, dashboards,
// reports, and module pages.
// ============================================

import {
  InputAdornment,
  TextField,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

// ============================================
// Component
// ============================================

export default function AppSearch({
  value,
  onChange,
  placeholder = "Search...",
  sx = {},
  ...props
}) {
  return (
    <TextField
      fullWidth
      size="small"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      sx={{
        maxWidth: 420,
        ...sx,
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        },
      }}
      {...props}
    />
  );
}