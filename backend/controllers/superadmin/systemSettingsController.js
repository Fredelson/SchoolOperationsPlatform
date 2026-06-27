// ============================================
// ARAB UNITY SCHOOL
// Super Admin - System Settings Controller
// Handles platform settings such as branding,
// security, email, notifications, files, audit,
// archive, printing defaults, and dashboard config
// Includes audit logging for setting updates
// ============================================

const sql = require("mssql");
const { poolPromise } = require("../../config/db");
const { createAuditLog } = require("../../shared/services/auditLogger");

// ============================================
// @desc    Get all system settings
// @route   GET /api/superadmin/system-settings
// @access  SuperAdmin / SystemSettings.View
// ============================================

const getSystemSettings = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        SettingId,
        SettingKey,
        SettingValue,
        SettingGroup,
        Description,
        IsEditable,
        UpdatedAt
      FROM SystemSettings
      ORDER BY SettingGroup, SettingKey;
    `);

    return res.status(200).json({
      settings: result.recordset,
    });
  } catch (error) {
    console.error("Get system settings error:", error);

    return res.status(500).json({
      message: "Failed to load system settings.",
    });
  }
};

// ============================================
// @desc    Update one system setting
// @route   PUT /api/superadmin/system-settings/:id
// @access  SuperAdmin / SystemSettings.Edit
// ============================================

const updateSystemSetting = async (req, res) => {
  try {
    const settingId = Number(req.params.id);
    const { settingValue } = req.body;

    if (!settingId) {
      return res.status(400).json({
        message: "Invalid setting id.",
      });
    }

    const pool = await poolPromise;

    // Get old setting before update for audit log
    const oldResult = await pool
      .request()
      .input("SettingId", sql.Int, settingId)
      .query(`
        SELECT TOP 1 *
        FROM SystemSettings
        WHERE SettingId = @SettingId;
      `);

    const oldSetting = oldResult.recordset[0];

    if (!oldSetting) {
      return res.status(404).json({
        message: "System setting not found.",
      });
    }

    if (!oldSetting.IsEditable) {
      return res.status(403).json({
        message: "This system setting is not editable.",
      });
    }

    // Update setting
    await pool
      .request()
      .input("SettingId", sql.Int, settingId)
      .input("SettingValue", sql.NVarChar(sql.MAX), settingValue ?? null)
      .query(`
        UPDATE SystemSettings
        SET
          SettingValue = @SettingValue,
          UpdatedAt = GETDATE()
        WHERE SettingId = @SettingId
          AND IsEditable = 1;
      `);

    // Record audit log
    await createAuditLog({
      userId: req.user?.id || null,
      action: "Updated System Setting",
      moduleKey: "system_control",
      recordId: String(settingId),
      oldValue: JSON.stringify(oldSetting),
      newValue: JSON.stringify({ settingValue }),
      ipAddress: req.ip,
    });

    return res.status(200).json({
      message: "System setting updated successfully.",
    });
  } catch (error) {
    console.error("Update system setting error:", error);

    return res.status(500).json({
      message: "Failed to update system setting.",
    });
  }
};

module.exports = {
  getSystemSettings,
  updateSystemSetting,
};
