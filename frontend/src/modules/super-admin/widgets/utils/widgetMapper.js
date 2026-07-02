// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Widget Mapper
// ============================================

export function getWidgetId(widget) {
  return widget?.widgetId ?? widget?.WidgetId;
}

export function getWidgetName(widget) {
  return widget?.widgetName ?? widget?.WidgetName ?? "this widget";
}

export function mapWidgetFromApi(widget = {}) {
  return {
    widgetId: widget.WidgetId ?? widget.widgetId,
    moduleId: widget.ModuleId ?? widget.moduleId,
    moduleName: widget.ModuleName ?? widget.moduleName,
    widgetKey: widget.WidgetKey ?? widget.widgetKey,
    widgetName: widget.WidgetName ?? widget.widgetName,
    widgetType: widget.WidgetType ?? widget.widgetType,
    dataSourceKey: widget.DataSourceKey ?? widget.dataSourceKey,
    description: widget.Description ?? widget.description,
    permissionId: widget.PermissionId ?? widget.permissionId,
    permissionName: widget.PermissionName ?? widget.permissionName,
    featureFlagId: widget.FeatureFlagId ?? widget.featureFlagId,
    featureFlagName: widget.FeatureFlagName ?? widget.featureFlagName,
    visibilityStatusId:
      widget.VisibilityStatusId ?? widget.visibilityStatusId ?? 1,
    visibilityStatusName:
      widget.VisibilityStatusName ?? widget.visibilityStatusName,
    defaultWidth: widget.DefaultWidth ?? widget.defaultWidth ?? 3,
    defaultHeight: widget.DefaultHeight ?? widget.defaultHeight ?? 1,
    sortOrder: widget.SortOrder ?? widget.sortOrder ?? 0,
    createdAt: widget.CreatedAt ?? widget.createdAt,
    updatedAt: widget.UpdatedAt ?? widget.updatedAt,
  };
}

export function mapWidgetToPayload(values = {}) {
  return {
    moduleId: values.moduleId ? Number(values.moduleId) : null,
    widgetKey: values.widgetKey,
    widgetName: values.widgetName,
    widgetType: values.widgetType,
    dataSourceKey: values.dataSourceKey,
    description: values.description,
    permissionId: values.permissionId ? Number(values.permissionId) : null,
    featureFlagId: values.featureFlagId ? Number(values.featureFlagId) : null,
    visibilityStatusId: Number(values.visibilityStatusId || 1),
    defaultWidth: Number(values.defaultWidth || 3),
    defaultHeight: Number(values.defaultHeight || 1),
    sortOrder: Number(values.sortOrder || 0),
  };
}