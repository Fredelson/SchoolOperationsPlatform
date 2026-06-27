// ============================================
// ARAB UNITY SCHOOL
// Super Admin - Button Controller
// Button / Action Manager
// Controls visibility and permission keys
// for UI buttons and actions
// ============================================

const sql = require("mssql");
const { poolPromise } = require("../../config/db");
const { createAuditLog } = require("../../shared/services/auditLogger");

// GET /api/superadmin/buttons
const getButtons = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        b.ButtonId,
        b.ModuleId,
        m.ModuleKey,
        m.ModuleName,
        b.ButtonKey,
        b.ButtonName,
        b.RequiredPermissionKey,
        b.IsVisible,
        b.IsActive,
        b.CreatedAt
      FROM Buttons b
      INNER JOIN Modules m
        ON m.ModuleId = b.ModuleId
      ORDER BY m.SortOrder, b.ButtonName;
    `);

    return res.status(200).json({
      buttons: result.recordset,
    });
  } catch (error) {
    console.error("Get buttons error:", error);
    return res.status(500).json({
      message: "Failed to load buttons.",
    });
  }
};

// PUT /api/superadmin/buttons/:id
const updateButton = async (req, res) => {
  try {
    const buttonId = Number(req.params.id);

    const {
      buttonName,
      requiredPermissionKey,
      isVisible,
      isActive,
    } = req.body;

    if (!buttonId) {
      return res.status(400).json({
        message: "Invalid button id.",
      });
    }

    if (!buttonName) {
      return res.status(400).json({
        message: "Button name is required.",
      });
    }

    const pool = await poolPromise;

    const oldResult = await pool
      .request()
      .input("ButtonId", sql.Int, buttonId)
      .query(`
        SELECT TOP 1 *
        FROM Buttons
        WHERE ButtonId = @ButtonId;
      `);

    const oldButton = oldResult.recordset[0];

    if (!oldButton) {
      return res.status(404).json({
        message: "Button not found.",
      });
    }

    await pool
      .request()
      .input("ButtonId", sql.Int, buttonId)
      .input("ButtonName", sql.NVarChar(150), buttonName)
      .input("RequiredPermissionKey", sql.NVarChar(100), requiredPermissionKey || null)
      .input("IsVisible", sql.Bit, isVisible ? 1 : 0)
      .input("IsActive", sql.Bit, isActive ? 1 : 0)
      .query(`
        UPDATE Buttons
        SET
          ButtonName = @ButtonName,
          RequiredPermissionKey = @RequiredPermissionKey,
          IsVisible = @IsVisible,
          IsActive = @IsActive
        WHERE ButtonId = @ButtonId;
      `);

    await createAuditLog({
      userId: req.user?.id || null,
      action: "Updated Button",
      moduleKey: "system_control",
      recordId: String(buttonId),
      oldValue: JSON.stringify(oldButton),
      newValue: JSON.stringify(req.body),
      ipAddress: req.ip,
    });

    return res.status(200).json({
      message: "Button updated successfully.",
    });
  } catch (error) {
    console.error("Update button error:", error);
    return res.status(500).json({
      message: "Failed to update button.",
    });
  }
};

module.exports = {
  getButtons,
  updateButton,
};
