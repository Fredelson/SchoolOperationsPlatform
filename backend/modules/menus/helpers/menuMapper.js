// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Menu Mapper
// ============================================
//
// Purpose:
// Converts SQL Server PascalCase rows into
// frontend-friendly camelCase objects.
// ============================================

const mapMenu = (row) => {
  if (!row) return null;

  return {
    menuId: row.MenuId,
    workspaceId: row.WorkspaceId,
    workspaceKey: row.WorkspaceKey,
    workspaceName: row.WorkspaceName,

    moduleId: row.ModuleId,
    moduleKey: row.ModuleKey,
    moduleName: row.ModuleName,

    parentMenuId: row.ParentMenuId,
    parentMenuKey: row.ParentMenuKey,
    parentMenuName: row.ParentMenuName,

    menuKey: row.MenuKey,
    menuName: row.MenuName,
    route: row.Route,
    icon: row.Icon,

    permissionId: row.PermissionId,
    permissionKey: row.PermissionKey,
    permissionName: row.PermissionName,

    featureFlagId: row.FeatureFlagId,
    featureFlagKey: row.FeatureFlagKey,
    featureFlagName: row.FeatureFlagName,
    featureFlagIsEnabled: row.FeatureFlagIsEnabled,

    badgeQueryKey: row.BadgeQueryKey,

    visibilityStatusId: row.VisibilityStatusId,
    visibilityStatusKey: row.VisibilityStatusKey,
    visibilityStatusName: row.VisibilityStatusName,

    isPinned: Boolean(row.IsPinned),
    isCollapsible: Boolean(row.IsCollapsible),
    sortOrder: row.SortOrder,

    createdAt: row.CreatedAt,
    updatedAt: row.UpdatedAt,
  };
};

const mapMenus = (rows = []) => rows.map(mapMenu);

module.exports = {
  mapMenu,
  mapMenus,
};