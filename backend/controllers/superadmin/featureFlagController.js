// ============================================
// ARAB UNITY SCHOOL
// Super Admin - Feature Flag Controller
// Controls platform features from UI
// Includes audit logging for feature changes
// ============================================

const sql = require("mssql");
const { poolPromise } = require("../../config/db");
const { createAuditLog } = require("../../shared/services/auditLogger");

// ============================================
// @desc    Get all feature flags
// @route   GET /api/superadmin/feature-flags
// @access  SuperAdmin / FeatureFlag.View
// ============================================

const getFeatureFlags = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        FeatureFlagId,
        FeatureKey,
        FeatureName,
        Description,
        IsEnabled,
        CreatedAt
      FROM FeatureFlags
      ORDER BY FeatureFlagId;
    `);

    return res.status(200).json({
      featureFlags: result.recordset,
    });
  } catch (error) {
    console.error("Get feature flags error:", error);

    return res.status(500).json({
      message: "Failed to load feature flags.",
    });
  }
};

// ============================================
// @desc    Enable / disable feature flag
// @route   PUT /api/superadmin/feature-flags/:id
// @access  SuperAdmin / FeatureFlag.Edit
// ============================================

const updateFeatureFlag = async (req, res) => {
  try {
    const featureFlagId = Number(req.params.id);
    const { isEnabled } = req.body;

    if (!featureFlagId) {
      return res.status(400).json({
        message: "Invalid feature flag id.",
      });
    }

    const pool = await poolPromise;

    // Get old value for audit log
    const oldResult = await pool
      .request()
      .input("FeatureFlagId", sql.Int, featureFlagId)
      .query(`
        SELECT TOP 1 *
        FROM FeatureFlags
        WHERE FeatureFlagId = @FeatureFlagId;
      `);

    const oldFeatureFlag = oldResult.recordset[0];

    if (!oldFeatureFlag) {
      return res.status(404).json({
        message: "Feature flag not found.",
      });
    }

    // Update feature flag
    await pool
      .request()
      .input("FeatureFlagId", sql.Int, featureFlagId)
      .input("IsEnabled", sql.Bit, isEnabled ? 1 : 0)
      .query(`
        UPDATE FeatureFlags
        SET IsEnabled = @IsEnabled
        WHERE FeatureFlagId = @FeatureFlagId;
      `);

    // Record audit log
    await createAuditLog({
      userId: req.user?.id || null,
      action: "Updated Feature Flag",
      moduleKey: "system_control",
      recordId: String(featureFlagId),
      oldValue: JSON.stringify(oldFeatureFlag),
      newValue: JSON.stringify({ isEnabled }),
      ipAddress: req.ip,
    });

    return res.status(200).json({
      message: "Feature flag updated successfully.",
    });
  } catch (error) {
    console.error("Update feature flag error:", error);

    return res.status(500).json({
      message: "Failed to update feature flag.",
    });
  }
};

module.exports = {
  getFeatureFlags,
  updateFeatureFlag,
};
