// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Widget Manager Defaults
// ============================================

const WIDGET_DEFAULTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_SORT_COLUMN: "w.SortOrder",
  DEFAULT_SORT_DIRECTION: "ASC",
};

const WIDGET_SORT_COLUMNS = [
  "w.WidgetId",
  "w.WidgetName",
  "w.WidgetKey",
  "w.WidgetType",
  "w.DataSourceKey",
  "w.SortOrder",
  "w.CreatedAt",
  "m.ModuleName",
  "vs.StatusName",
];

module.exports = {
  WIDGET_DEFAULTS,
  WIDGET_SORT_COLUMNS,
};