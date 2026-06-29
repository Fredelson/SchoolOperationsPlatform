// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Navigation Repository
// ============================================
//
// Purpose:
// Handles SQL-only operations for backend-driven
// platform navigation, including the sidebar.
//
// Important:
// - Repository layer must only contain SQL.
// - No HTTP logic.
// - No business rules.
// - No frontend rendering logic.
//
// Source of Truth:
// OperationsPlatformDB
// ============================================

const {
  sql,
  executeQuery,
  rows,
} = require("../../../shared/database");

// ============================================
// Get Sidebar Menus For User
// ============================================
//
// Purpose:
// Returns all visible sidebar menu records for
// the authenticated user.
//
// How the query works:
// 1. Root menus are connected to sidebar sections
//    through dbo.MenuGroupItems.
// 2. Child menus are not directly assigned to
//    MenuGroups. They are connected using
//    ParentMenuId.
// 3. This prevents child menus like
//    "IT Asset Dashboard" from appearing as a
//    separate root item under Main.
// 4. UserMenuPreferences can hide or reorder
//    menus per user later.
//
// Used By:
// GET /api/navigation/sidebar
// ============================================

async function getSidebarMenusForUser(userId) {
  const result = await executeQuery(
    `
    SELECT
        -- Sidebar section / group
        mg.MenuGroupId,
        mg.GroupKey,
        mg.GroupName,
        mg.SortOrder AS GroupSortOrder,

        -- Menu item
        m.MenuId,
        m.ParentMenuId,
        m.MenuKey,
        m.MenuName,
        m.Route,
        m.Icon,
        m.SortOrder AS MenuSortOrder,

        -- Visibility status
        fvs.StatusKey AS VisibilityStatusKey,
        fvs.StatusName AS VisibilityStatusName,

        -- Optional user customization
        ump.IsHidden,
        ump.SortOrder AS UserSortOrder

    FROM dbo.Menus m

    -- Root menus are assigned to sidebar groups.
    -- Child menus must not be assigned to groups directly.
    -- This keeps nested dropdowns organized correctly.
    LEFT JOIN dbo.MenuGroupItems mgi
        ON m.MenuId = mgi.MenuId
        AND m.ParentMenuId IS NULL

    LEFT JOIN dbo.MenuGroups mg
        ON mgi.MenuGroupId = mg.MenuGroupId

    INNER JOIN dbo.FeatureVisibilityStatuses fvs
        ON m.VisibilityStatusId = fvs.VisibilityStatusId

    LEFT JOIN dbo.UserMenuPreferences ump
        ON ump.MenuId = m.MenuId
        AND ump.UserId = @UserId

    WHERE
        ISNULL(ump.IsHidden, 0) = 0

    -- Include:
    -- 1. Root menus that belong to a group.
    -- 2. Child menus that belong to a parent menu.
    --
    -- Exclude:
    -- Root menus that are not assigned to any sidebar group.
    AND
    (
        m.ParentMenuId IS NOT NULL
        OR mgi.MenuGroupItemId IS NOT NULL
    )

    ORDER BY
        ISNULL(mg.SortOrder, 999),
        ISNULL(ump.SortOrder, m.SortOrder),
        m.ParentMenuId,
        m.SortOrder,
        m.MenuName;
    `,
    [
      {
        name: "UserId",
        type: sql.Int,
        value: userId,
      },
    ]
  );

  return rows(result);
}

// ============================================
// Repository Exports
// ============================================

module.exports = {
  getSidebarMenusForUser,
};