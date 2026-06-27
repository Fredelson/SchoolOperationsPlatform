// ============================================
// ARAB UNITY SCHOOL
// Super Admin - Module Controller
// Handles registered platform modules
// Includes audit logging for module updates
// ============================================

const sql = require("mssql");
const { poolPromise } = require("../../config/db");
const { createAuditLog } = require("../../shared/services/auditLogger");

// ============================================
// @desc    Get all modules
// @route   GET /api/superadmin/modules
// @access  SuperAdmin / Module.View
// ============================================

const getAllModules = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        ModuleId,
        ModuleKey,
        ModuleName,
        Description,
        Icon,
        BaseRoute,
        Status,
        IsActive,
        SortOrder,
        CreatedAt
      FROM Modules
      ORDER BY SortOrder, ModuleName;
    `);

    return res.status(200).json({
      modules: result.recordset,
    });
  } catch (error) {
    console.error("Get all modules error:", error);

    return res.status(500).json({
      message: "Failed to load modules.",
    });
  }
};

// ============================================
// @desc    Update module status / visibility
// @route   PUT /api/superadmin/modules/:id
// @access  SuperAdmin / Module.Edit
// ============================================

const updateModule = async (req, res) => {
  try {
    const moduleId = Number(req.params.id);

    const {
      moduleName,
      description,
      icon,
      baseRoute,
      status,
      isActive,
      sortOrder,
    } = req.body;

    if (!moduleId) {
      return res.status(400).json({
        message: "Invalid module id.",
      });
    }

    if (!moduleName) {
      return res.status(400).json({
        message: "Module name is required.",
      });
    }

    const pool = await poolPromise;

    // Get old module data before update for audit trail
    const oldResult = await pool
      .request()
      .input("ModuleId", sql.Int, moduleId)
      .query(`
        SELECT TOP 1 *
        FROM Modules
        WHERE ModuleId = @ModuleId;
      `);

    const oldModule = oldResult.recordset[0];

    if (!oldModule) {
      return res.status(404).json({
        message: "Module not found.",
      });
    }

    // Update module
    await pool
      .request()
      .input("ModuleId", sql.Int, moduleId)
      .input("ModuleName", sql.NVarChar(150), moduleName)
      .input("Description", sql.NVarChar(255), description || null)
      .input("Icon", sql.NVarChar(100), icon || null)
      .input("BaseRoute", sql.NVarChar(150), baseRoute || null)
      .input("Status", sql.NVarChar(30), status || "Active")
      .input("IsActive", sql.Bit, isActive ? 1 : 0)
      .input("SortOrder", sql.Int, sortOrder || 0)
      .query(`
        UPDATE Modules
        SET
          ModuleName = @ModuleName,
          Description = @Description,
          Icon = @Icon,
          BaseRoute = @BaseRoute,
          Status = @Status,
          IsActive = @IsActive,
          SortOrder = @SortOrder
        WHERE ModuleId = @ModuleId;
      `);

    // Record audit log
    await createAuditLog({
      userId: req.user?.id || null,
      action: "Updated Module",
      moduleKey: "system_control",
      recordId: String(moduleId),
      oldValue: JSON.stringify(oldModule),
      newValue: JSON.stringify(req.body),
      ipAddress: req.ip,
    });

    return res.status(200).json({
      message: "Module updated successfully.",
    });
  } catch (error) {
    console.error("Update module error:", error);

    return res.status(500).json({
      message: "Failed to update module.",
    });
  }
};

module.exports = {
  getAllModules,
  updateModule,
};
