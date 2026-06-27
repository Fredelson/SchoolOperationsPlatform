// ============================================
// ARAB UNITY SCHOOL
// Access Level Master Data Controller
// Uses MSSQL poolPromise from config/db.js
// ============================================

const { sql, poolPromise } = require("../../config/db");

// ============================================
// GET ALL ACCESS LEVELS
// Route: GET /api/access-levels
// ============================================
exports.getAccessLevels = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        AccessLevelId,
        AccessLevelName,
        DisplayName,
        Description,
        SortOrder,
        IsSystemRole,
        IsActive,
        CreatedAt,
        UpdatedAt
      FROM AccessLevels
      ORDER BY SortOrder, DisplayName
    `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Get Access Levels Error:", error);
    res.status(500).json({
      message: error.message || "Failed to get access levels.",
    });
  }
};

// ============================================
// CREATE ACCESS LEVEL
// Route: POST /api/access-levels
// ============================================
exports.createAccessLevel = async (req, res) => {
  try {
    const pool = await poolPromise;

    const {
      AccessLevelName,
      DisplayName,
      Description,
      SortOrder,
      IsActive,
    } = req.body;

    if (!AccessLevelName || !DisplayName) {
      return res.status(400).json({
        message: "Access Level Name and Display Name are required.",
      });
    }

    await pool
      .request()
      .input("AccessLevelName", sql.NVarChar(50), AccessLevelName.trim())
      .input("DisplayName", sql.NVarChar(100), DisplayName.trim())
      .input("Description", sql.NVarChar(255), Description || null)
      .input("SortOrder", sql.Int, SortOrder || 0)
      .input("IsActive", sql.Bit, IsActive ?? true)
      .query(`
        INSERT INTO AccessLevels
        (
          AccessLevelName,
          DisplayName,
          Description,
          SortOrder,
          IsActive,
          IsSystemRole,
          CreatedAt
        )
        VALUES
        (
          @AccessLevelName,
          @DisplayName,
          @Description,
          @SortOrder,
          @IsActive,
          0,
          GETDATE()
        )
      `);

    res.status(201).json({
      success: true,
      message: "Access level created successfully.",
    });
  } catch (error) {
    console.error("Create Access Level Error:", error);
    res.status(500).json({
      message: error.message || "Failed to create access level.",
    });
  }
};

// ============================================
// UPDATE ACCESS LEVEL
// Route: PUT /api/access-levels/:id
// ============================================
exports.updateAccessLevel = async (req, res) => {
  try {
    const pool = await poolPromise;
    const { id } = req.params;

    const {
      AccessLevelName,
      DisplayName,
      Description,
      SortOrder,
      IsActive,
    } = req.body;

    if (!AccessLevelName || !DisplayName) {
      return res.status(400).json({
        message: "Access Level Name and Display Name are required.",
      });
    }

    const check = await pool
      .request()
      .input("AccessLevelId", sql.Int, id)
      .query(`
        SELECT IsSystemRole
        FROM AccessLevels
        WHERE AccessLevelId = @AccessLevelId
      `);

    if (check.recordset.length === 0) {
      return res.status(404).json({
        message: "Access level not found.",
      });
    }

    const isSystemRole = Boolean(check.recordset[0].IsSystemRole);

    if (isSystemRole) {
      await pool
        .request()
        .input("AccessLevelId", sql.Int, id)
        .input("DisplayName", sql.NVarChar(100), DisplayName.trim())
        .input("Description", sql.NVarChar(255), Description || null)
        .input("SortOrder", sql.Int, SortOrder || 0)
        .input("IsActive", sql.Bit, IsActive ?? true)
        .query(`
          UPDATE AccessLevels
          SET
            DisplayName = @DisplayName,
            Description = @Description,
            SortOrder = @SortOrder,
            IsActive = @IsActive,
            UpdatedAt = GETDATE()
          WHERE AccessLevelId = @AccessLevelId
        `);
    } else {
      await pool
        .request()
        .input("AccessLevelId", sql.Int, id)
        .input("AccessLevelName", sql.NVarChar(50), AccessLevelName.trim())
        .input("DisplayName", sql.NVarChar(100), DisplayName.trim())
        .input("Description", sql.NVarChar(255), Description || null)
        .input("SortOrder", sql.Int, SortOrder || 0)
        .input("IsActive", sql.Bit, IsActive ?? true)
        .query(`
          UPDATE AccessLevels
          SET
            AccessLevelName = @AccessLevelName,
            DisplayName = @DisplayName,
            Description = @Description,
            SortOrder = @SortOrder,
            IsActive = @IsActive,
            UpdatedAt = GETDATE()
          WHERE AccessLevelId = @AccessLevelId
        `);
    }

    res.status(200).json({
      success: true,
      message: "Access level updated successfully.",
    });
  } catch (error) {
    console.error("Update Access Level Error:", error);
    res.status(500).json({
      message: error.message || "Failed to update access level.",
    });
  }
};

// ============================================
// DELETE ACCESS LEVEL
// Route: DELETE /api/access-levels/:id
// System roles cannot be deleted
// ============================================
exports.deleteAccessLevel = async (req, res) => {
  try {
    const pool = await poolPromise;
    const { id } = req.params;

    const check = await pool
      .request()
      .input("AccessLevelId", sql.Int, id)
      .query(`
        SELECT IsSystemRole
        FROM AccessLevels
        WHERE AccessLevelId = @AccessLevelId
      `);

    if (check.recordset.length === 0) {
      return res.status(404).json({
        message: "Access level not found.",
      });
    }

    if (Boolean(check.recordset[0].IsSystemRole)) {
      return res.status(400).json({
        message: "System roles cannot be deleted.",
      });
    }

    await pool
      .request()
      .input("AccessLevelId", sql.Int, id)
      .query(`
        DELETE FROM AccessLevels
        WHERE AccessLevelId = @AccessLevelId
      `);

    res.status(200).json({
      success: true,
      message: "Access level deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Access Level Error:", error);
    res.status(500).json({
      message: error.message || "Failed to delete access level.",
    });
  }
};
