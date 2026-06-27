// ============================================
// ARAB UNITY SCHOOL
// Super Admin - Menu Controller
// Handles dynamic sidebar/menu loading
// and Super Admin menu management
// ============================================

const sql = require("mssql");
const { poolPromise } = require("../../config/db");
const { createAuditLog } = require("../../shared/services/auditLogger");

// ============================================
// @desc    Get logged-in user's sidebar menus
// @route   GET /api/superadmin/menus/my-sidebar
// @access  Logged-in users
// ============================================

const getMySidebarMenus = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized. User not found.",
      });
    }

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("UserId", sql.Int, userId)
      .query(`
        SELECT DISTINCT
          mn.MenuId,
          mn.ParentMenuId,
          mn.MenuKey,
          mn.MenuName,
          mn.Route,
          mn.Icon,
          mn.SortOrder,
          mn.IsVisible,
          mn.IsActive,
          mo.ModuleKey,
          mo.ModuleName,
          mo.Status AS ModuleStatus,
          mo.IsActive AS ModuleIsActive
        FROM Users u
        INNER JOIN Roles r
          ON r.RoleKey = u.Role
        INNER JOIN Menus mn
          ON mn.IsActive = 1
         AND mn.IsVisible = 1
        INNER JOIN Modules mo
          ON mo.ModuleId = mn.ModuleId
         AND mo.IsActive = 1
        LEFT JOIN MenuPermissions mp
          ON mp.MenuId = mn.MenuId
        LEFT JOIN Permissions p
          ON p.PermissionId = mp.PermissionId
         AND p.IsActive = 1
        LEFT JOIN RolePermissions rp
          ON rp.RoleId = r.RoleId
         AND rp.PermissionId = p.PermissionId
        LEFT JOIN UserPermissionOverrides upo
          ON upo.UserId = u.UserId
         AND upo.PermissionId = p.PermissionId
        WHERE u.UserId = @UserId
          AND u.IsActive = 1
          AND (
              mp.MenuPermissionId IS NULL
              OR
              CASE
                WHEN upo.IsAllowed IS NOT NULL THEN upo.IsAllowed
                WHEN rp.IsAllowed IS NOT NULL THEN rp.IsAllowed
                ELSE 0
              END = 1
          )
        ORDER BY mn.SortOrder, mn.MenuName;
      `);

    return res.status(200).json({
      menus: result.recordset,
    });
  } catch (error) {
    console.error("Get my sidebar menus error:", error);

    return res.status(500).json({
      message: "Failed to load sidebar menus.",
    });
  }
};

// ============================================
// @desc    Get all menus for Super Admin manager
// @route   GET /api/superadmin/menus
// @access  SuperAdmin / Menu.View
// ============================================

const getAllMenus = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        mn.MenuId,
        mn.ParentMenuId,
        mn.MenuKey,
        mn.MenuName,
        mn.Route,
        mn.Icon,
        mn.RequiredPermissionKey,
        mn.IsVisible,
        mn.IsActive,
        mn.SortOrder,
        mo.ModuleId,
        mo.ModuleKey,
        mo.ModuleName
      FROM Menus mn
      INNER JOIN Modules mo
        ON mo.ModuleId = mn.ModuleId
      ORDER BY
        ISNULL(mn.ParentMenuId, mn.MenuId),
        mn.ParentMenuId,
        mn.SortOrder;
    `);

    return res.status(200).json({
      menus: result.recordset,
    });
  } catch (error) {
    console.error("Get all menus error:", error);

    return res.status(500).json({
      message: "Failed to load menus.",
    });
  }
};

// ============================================
// @desc    Update menu item
// @route   PUT /api/superadmin/menus/:id
// @access  SuperAdmin / Menu.Edit
// ============================================

const updateMenu = async (req, res) => {
  try {
    const menuId = Number(req.params.id);

    const {
      menuName,
      route,
      icon,
      requiredPermissionKey,
      isVisible,
      isActive,
      sortOrder,
    } = req.body;

    if (!menuId) {
      return res.status(400).json({
        message: "Invalid menu id.",
      });
    }

    if (!menuName) {
      return res.status(400).json({
        message: "Menu name is required.",
      });
    }

    const pool = await poolPromise;

    // Get old menu data for audit log
    const oldResult = await pool
      .request()
      .input("MenuId", sql.Int, menuId)
      .query(`
        SELECT TOP 1 *
        FROM Menus
        WHERE MenuId = @MenuId;
      `);

    const oldMenu = oldResult.recordset[0];

    if (!oldMenu) {
      return res.status(404).json({
        message: "Menu not found.",
      });
    }

    // Update menu
    await pool
      .request()
      .input("MenuId", sql.Int, menuId)
      .input("MenuName", sql.NVarChar(150), menuName)
      .input("Route", sql.NVarChar(150), route || null)
      .input("Icon", sql.NVarChar(100), icon || null)
      .input("RequiredPermissionKey", sql.NVarChar(100), requiredPermissionKey || null)
      .input("IsVisible", sql.Bit, isVisible ? 1 : 0)
      .input("IsActive", sql.Bit, isActive ? 1 : 0)
      .input("SortOrder", sql.Int, sortOrder || 0)
      .query(`
        UPDATE Menus
        SET
          MenuName = @MenuName,
          Route = @Route,
          Icon = @Icon,
          RequiredPermissionKey = @RequiredPermissionKey,
          IsVisible = @IsVisible,
          IsActive = @IsActive,
          SortOrder = @SortOrder
        WHERE MenuId = @MenuId;
      `);

    // Record audit log
    await createAuditLog({
      userId: req.user?.id || null,
      action: "Updated Menu",
      moduleKey: "system_control",
      recordId: String(menuId),
      oldValue: JSON.stringify(oldMenu),
      newValue: JSON.stringify(req.body),
      ipAddress: req.ip,
    });

    return res.status(200).json({
      message: "Menu updated successfully.",
    });
  } catch (error) {
    console.error("Update menu error:", error);

    return res.status(500).json({
      message: "Failed to update menu.",
    });
  }
};

module.exports = {
  getMySidebarMenus,
  getAllMenus,
  updateMenu,
};
