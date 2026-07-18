// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// AppToolbar
// ============================================
//
// Purpose:
// Reusable toolbar for tables, filters,
// search, exports, and page actions.
// ============================================

import AppSearch from "./AppSearch";
import AppFilterBar from "./AppFilterBar";

// ============================================
// Component
// ============================================

export default function AppToolbar({
  left = null,
  right = null,
  children = null,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  columns = "auto",
  card = true,
  actions = null,
  sx = {},
}) {
  return (
    <AppFilterBar
      columns={columns}
      contained={card}
      actions={right || actions}
      sx={sx}
    >
      {searchValue !== undefined && onSearchChange && (
        <AppSearch
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          sx={{ maxWidth: "none" }}
        />
      )}
      {left || children}
    </AppFilterBar>
  );
}
