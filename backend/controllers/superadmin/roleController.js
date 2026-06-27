// ============================================
// ARAB UNITY SCHOOL
// Super Admin - Role Controller
// Handles roles and role permissions
// ============================================

const sql = require("mssql");
const { poolPromise } = require("../../config/db");
const { createAuditLog } = require("../../shared/services/auditLogger");

// ============================================
// @desc    Get all roles
// @route   GET /api/superadmin/roles
// @access  SuperAdmin / Role.View
// ============================================

const getRoles = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        RoleId,
        RoleKey,
        RoleName,
        Description,
        IsSystemRole,
        IsActive,
        CreatedAt
      FROM Roles
      ORDER BY RoleName;
    `);

    return res.status(200).json({
      roles: result.recordset,
    });
  } catch (error) {
    console.error("Get roles error:", error);
    return res.status(500).json({
      message: "Failed to load roles.",
    });
  }
};

// ============================================
// @desc    Get permissions assigned to one role
// @route   GET /api/superadmin/roles/:id/permissions
// @access  SuperAdmin / Role.View
// ============================================

const getRolePermissions = async (req, res) => {
  try {
    const roleId = Number(req.params.id);

    if (!roleId) {
      return res.status(400).json({
        message: "Invalid role id.",
      });
    }

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("RoleId", sql.Int, roleId)
      .query(`
        SELECT
          p.PermissionId,
          p.PermissionKey,
          p.PermissionName,
          p.ModuleKey,
          pg.GroupName,
          ISNULL(rp.IsAllowed, 0) AS IsAllowed
        FROM Permissions p
        LEFT JOIN RolePermissions rp
          ON rp.PermissionId = p.PermissionId
         AND rp.RoleId = @RoleId
        LEFT JOIN PermissionGroups pg
          ON pg.PermissionGroupId = p.PermissionGroupId
        WHERE p.IsActive = 1
        ORDER BY pg.SortOrder, p.PermissionKey;
      `);

    return res.status(200).json({
      permissions: result.recordset,
    });
  } catch (error) {
    console.error("Get role permissions error:", error);
    return res.status(500).json({
      message: "Failed to load role permissions.",
    });
  }
};

// ============================================
// @desc    Update one role permission
// @route   PUT /api/superadmin/roles/:roleId/permissions/:permissionId
// @access  SuperAdmin / Permission.Assign
// ============================================

const updateRolePermission = async (req, res) => {
  try {
    const roleId = Number(req.params.roleId);
    const permissionId = Number(req.params.permissionId);
    const { isAllowed } = req.body;

    if (!roleId || !permissionId) {
      return res.status(400).json({
        message: "Invalid role or permission id.",
      });
    }

    const pool = await poolPromise;

    // Get existing permission assignment for audit
    const oldResult = await pool
      .request()
      .input("RoleId", sql.Int, roleId)
      .input("PermissionId", sql.Int, permissionId)
      .query(`
        SELECT TOP 1 *
        FROM RolePermissions
        WHERE RoleId = @RoleId
          AND PermissionId = @PermissionId;
      `);

    const oldValue = oldResult.recordset[0] || null;

    // Insert or update role permission
    await pool
      .request()
      .input("RoleId", sql.Int, roleId)
      .input("PermissionId", sql.Int, permissionId)
      .input("IsAllowed", sql.Bit, isAllowed ? 1 : 0)
      .query(`
        MERGE RolePermissions AS target
        USING (
          SELECT
            @RoleId AS RoleId,
            @PermissionId AS PermissionId
        ) AS source
        ON target.RoleId = source.RoleId
        AND target.PermissionId = source.PermissionId

        WHEN MATCHED THEN
          UPDATE SET IsAllowed = @IsAllowed

        WHEN NOT MATCHED THEN
          INSERT (RoleId, PermissionId, IsAllowed)
          VALUES (@RoleId, @PermissionId, @IsAllowed);
      `);

    await createAuditLog({
      userId: req.user?.id || null,
      action: "Updated Role Permission",
      moduleKey: "user_access",
      recordId: `${roleId}-${permissionId}`,
      oldValue: oldValue ? JSON.stringify(oldValue) : null,
      newValue: JSON.stringify({ roleId, permissionId, isAllowed }),
      ipAddress: req.ip,
    });

    return res.status(200).json({
      message: "Role permission updated successfully.",
    });
  } catch (error) {
    console.error("Update role permission error:", error);
    return res.status(500).json({
      message: "Failed to update role permission.",
    });
  }
};

module.exports = {
  getRoles,
  getRolePermissions,
  updateRolePermission,
};
