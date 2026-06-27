// ============================================
// ARAB UNITY SCHOOL
// Super Admin - Widget Controller
// Dashboard Widget Manager
// Includes audit logging for widget updates
// ============================================

const sql = require("mssql");
const { poolPromise } = require("../../config/db");
const { createAuditLog } = require("../../shared/services/auditLogger");

// ============================================
// @desc    Get all dashboard widgets
// @route   GET /api/superadmin/widgets
// @access  SuperAdmin / Widget.View
// ============================================

const getWidgets = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        w.WidgetId,
        w.ModuleId,
        m.ModuleKey,
        m.ModuleName,
        w.WidgetKey,
        w.WidgetName,
        w.Description,
        w.RequiredPermissionKey,
        w.IsVisible,
        w.IsActive,
        w.SortOrder,
        w.CreatedAt
      FROM Widgets w
      LEFT JOIN Modules m
        ON m.ModuleId = w.ModuleId
      ORDER BY w.SortOrder, w.WidgetName;
    `);

    return res.status(200).json({
      widgets: result.recordset,
    });
  } catch (error) {
    console.error("Get widgets error:", error);

    return res.status(500).json({
      message: "Failed to load widgets.",
    });
  }
};

// ============================================
// @desc    Update dashboard widget
// @route   PUT /api/superadmin/widgets/:id
// @access  SuperAdmin / Widget.Edit
// ============================================

const updateWidget = async (req, res) => {
  try {
    const widgetId = Number(req.params.id);

    const {
      widgetName,
      description,
      requiredPermissionKey,
      isVisible,
      isActive,
      sortOrder,
    } = req.body;

    if (!widgetId) {
      return res.status(400).json({
        message: "Invalid widget id.",
      });
    }

    if (!widgetName) {
      return res.status(400).json({
        message: "Widget name is required.",
      });
    }

    const pool = await poolPromise;

    // Get old widget data before update for audit trail
    const oldResult = await pool
      .request()
      .input("WidgetId", sql.Int, widgetId)
      .query(`
        SELECT TOP 1 *
        FROM Widgets
        WHERE WidgetId = @WidgetId;
      `);

    const oldWidget = oldResult.recordset[0];

    if (!oldWidget) {
      return res.status(404).json({
        message: "Widget not found.",
      });
    }

    // Update widget
    await pool
      .request()
      .input("WidgetId", sql.Int, widgetId)
      .input("WidgetName", sql.NVarChar(150), widgetName)
      .input("Description", sql.NVarChar(255), description || null)
      .input("RequiredPermissionKey", sql.NVarChar(100), requiredPermissionKey || null)
      .input("IsVisible", sql.Bit, isVisible ? 1 : 0)
      .input("IsActive", sql.Bit, isActive ? 1 : 0)
      .input("SortOrder", sql.Int, sortOrder || 0)
      .query(`
        UPDATE Widgets
        SET
          WidgetName = @WidgetName,
          Description = @Description,
          RequiredPermissionKey = @RequiredPermissionKey,
          IsVisible = @IsVisible,
          IsActive = @IsActive,
          SortOrder = @SortOrder
        WHERE WidgetId = @WidgetId;
      `);

    // Record audit log
    await createAuditLog({
      userId: req.user?.id || null,
      action: "Updated Widget",
      moduleKey: "system_control",
      recordId: String(widgetId),
      oldValue: JSON.stringify(oldWidget),
      newValue: JSON.stringify(req.body),
      ipAddress: req.ip,
    });

    return res.status(200).json({
      message: "Widget updated successfully.",
    });
  } catch (error) {
    console.error("Update widget error:", error);

    return res.status(500).json({
      message: "Failed to update widget.",
    });
  }
};

module.exports = {
  getWidgets,
  updateWidget,
};
