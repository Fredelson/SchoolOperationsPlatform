// ============================================
// ARAB UNITY SCHOOL
// Super Admin - User Permission Override Controller
// Handles individual user permission overrides
// Final access = role permissions + user overrides
// ============================================

const sql = require("mssql");
const { poolPromise } = require("../../config/db");
const { createAuditLog } = require("../../shared/services/auditLogger");

// GET /api/superadmin/user-overrides/:userId
const getUserPermissionOverrides = async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!userId) {
      return res.status(400).json({ message: "Invalid user id." });
    }

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("UserId", sql.Int, userId)
      .query(`
        SELECT
          p.PermissionId,
          p.PermissionKey,
          p.PermissionName,
          p.ModuleKey,
          pg.GroupName,
          rp.IsAllowed AS RoleAllowed,
          upo.IsAllowed AS OverrideAllowed,
          upo.Reason,
          CASE
            WHEN upo.IsAllowed IS NOT NULL THEN upo.IsAllowed
            WHEN rp.IsAllowed IS NOT NULL THEN rp.IsAllowed
            ELSE 0
          END AS FinalAllowed
        FROM Users u
        INNER JOIN Roles r
          ON r.RoleKey = u.Role
        CROSS JOIN Permissions p
        LEFT JOIN RolePermissions rp
          ON rp.RoleId = r.RoleId
         AND rp.PermissionId = p.PermissionId
        LEFT JOIN UserPermissionOverrides upo
          ON upo.UserId = u.UserId
         AND upo.PermissionId = p.PermissionId
        LEFT JOIN PermissionGroups pg
          ON pg.PermissionGroupId = p.PermissionGroupId
        WHERE u.UserId = @UserId
          AND p.IsActive = 1
        ORDER BY pg.SortOrder, p.PermissionKey;
      `);

    return res.status(200).json({
      permissions: result.recordset,
    });
  } catch (error) {
    console.error("Get user overrides error:", error);
    return res.status(500).json({
      message: "Failed to load user permission overrides.",
    });
  }
};

// PUT /api/superadmin/user-overrides/:userId/:permissionId
const updateUserPermissionOverride = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const permissionId = Number(req.params.permissionId);
    const { isAllowed, reason } = req.body;

    if (!userId || !permissionId) {
      return res.status(400).json({
        message: "Invalid user or permission id.",
      });
    }

    const pool = await poolPromise;

    const oldResult = await pool
      .request()
      .input("UserId", sql.Int, userId)
      .input("PermissionId", sql.Int, permissionId)
      .query(`
        SELECT TOP 1 *
        FROM UserPermissionOverrides
        WHERE UserId = @UserId
          AND PermissionId = @PermissionId;
      `);

    const oldValue = oldResult.recordset[0] || null;

    await pool
      .request()
      .input("UserId", sql.Int, userId)
      .input("PermissionId", sql.Int, permissionId)
      .input("IsAllowed", sql.Bit, isAllowed ? 1 : 0)
      .input("Reason", sql.NVarChar(255), reason || null)
      .query(`
        MERGE UserPermissionOverrides AS target
        USING (
          SELECT
            @UserId AS UserId,
            @PermissionId AS PermissionId
        ) AS source
        ON target.UserId = source.UserId
        AND target.PermissionId = source.PermissionId

        WHEN MATCHED THEN
          UPDATE SET
            IsAllowed = @IsAllowed,
            Reason = @Reason

        WHEN NOT MATCHED THEN
          INSERT (UserId, PermissionId, IsAllowed, Reason)
          VALUES (@UserId, @PermissionId, @IsAllowed, @Reason);
      `);

    await createAuditLog({
      userId: req.user?.id || null,
      action: "Updated User Permission Override",
      moduleKey: "user_access",
      recordId: `${userId}-${permissionId}`,
      oldValue: oldValue ? JSON.stringify(oldValue) : null,
      newValue: JSON.stringify({ userId, permissionId, isAllowed, reason }),
      ipAddress: req.ip,
    });

    return res.status(200).json({
      message: "User permission override updated successfully.",
    });
  } catch (error) {
    console.error("Update user override error:", error);
    return res.status(500).json({
      message: "Failed to update user permission override.",
    });
  }
};

// DELETE /api/superadmin/user-overrides/:userId/:permissionId
const removeUserPermissionOverride = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const permissionId = Number(req.params.permissionId);

    if (!userId || !permissionId) {
      return res.status(400).json({
        message: "Invalid user or permission id.",
      });
    }

    const pool = await poolPromise;

    await pool
      .request()
      .input("UserId", sql.Int, userId)
      .input("PermissionId", sql.Int, permissionId)
      .query(`
        DELETE FROM UserPermissionOverrides
        WHERE UserId = @UserId
          AND PermissionId = @PermissionId;
      `);

    await createAuditLog({
      userId: req.user?.id || null,
      action: "Removed User Permission Override",
      moduleKey: "user_access",
      recordId: `${userId}-${permissionId}`,
      oldValue: null,
      newValue: null,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      message: "User permission override removed successfully.",
    });
  } catch (error) {
    console.error("Remove user override error:", error);
    return res.status(500).json({
      message: "Failed to remove user permission override.",
    });
  }
};

module.exports = {
  getUserPermissionOverrides,
  updateUserPermissionOverride,
  removeUserPermissionOverride,
};
