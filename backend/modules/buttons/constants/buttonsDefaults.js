// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Button Manager Defaults
// ============================================

const BUTTON_DEFAULTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  DEFAULT_SORT_COLUMN: "ButtonId",
  DEFAULT_SORT_DIRECTION: "DESC",

  DEFAULT_VISIBILITY_STATUS_ID: 1,
};

const BUTTON_SORT_COLUMNS = [
  "ButtonId",
  "ModuleId",
  "ButtonKey",
  "ButtonName",
  "PermissionId",
  "FeatureFlagId",
  "VisibilityStatusId",
  "CreatedAt",
  "UpdatedAt",
];

module.exports = {
  BUTTON_DEFAULTS,
  BUTTON_SORT_COLUMNS,
};