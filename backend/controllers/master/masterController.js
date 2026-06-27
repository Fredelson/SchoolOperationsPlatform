// ============================================
// ARAB UNITY SCHOOL
// Master Data Controller
//
// Manages:
// - Subjects
// - Departments
// - Purposes
// - Roles
// - Access Levels
//
// No hard delete:
// Activate / deactivate only
// ============================================

const { sql, poolPromise } = require("../../config/db")

// ============================================
// Simple Master Tables Config
// These tables only need:
// Id, Name, IsActive
// ============================================
const masterTables = {
  subjects: {
    table: "Subjects",
    id: "SubjectId",
    name: "SubjectName",
  },

  departments: {
    table: "Departments",
    id: "DepartmentId",
    name: "DepartmentName",
  },

  purposes: {
    table: "Purposes",
    id: "PurposeId",
    name: "PurposeName",
  },
};

// ============================================
// Helper: Validate simple master type
// ============================================
const getConfig = (type) => {
  return masterTables[type] || null;
};

// ============================================
// GET /api/master/:type
// ============================================
const getMasterData = async (req, res) => {
  try {
    const { type } = req.params;
    const pool = await poolPromise;

    // ============================================
    // Special: Roles
    // ============================================
    if (type === "roles") {
      const result = await pool.request().query(`
        SELECT
          r.RoleId AS Id,
          r.RoleName AS Name,
          r.DisplayName,
          r.AccessLevelId,
          a.AccessLevelName,
          a.DisplayName AS AccessLevelDisplayName,
          r.IsSystemRole,
          r.IsActive
        FROM Roles r
        INNER JOIN AccessLevels a
          ON r.AccessLevelId = a.AccessLevelId
        ORDER BY r.IsActive DESC, r.DisplayName ASC
      `);

      return res.json(result.recordset);
    }

    // ============================================
    // Special: Access Levels
    // ============================================
    if (type === "access-levels") {
      const result = await pool.request().query(`
        SELECT
          AccessLevelId AS Id,
          AccessLevelName AS Name,
          DisplayName,
          Description,
          IsActive
        FROM AccessLevels
        ORDER BY IsActive DESC, DisplayName ASC
      `);

      return res.json(result.recordset);
    }

    // ============================================
    // Default simple master data
    // ============================================
    const config = getConfig(type);

    if (!config) {
      return res.status(400).json({
        message: "Invalid master data type",
      });
    }

    const result = await pool.request().query(`
      SELECT
        ${config.id} AS Id,
        ${config.name} AS Name,
        IsActive
      FROM ${config.table}
      ORDER BY IsActive DESC, ${config.name} ASC
    `);

    return res.json(result.recordset);
  } catch (error) {
    console.error("Get Master Data Error:", error);

    return res.status(500).json({
      message: "Server error while fetching master data",
      error: error.message,
    });
  }
};

// ============================================
// POST /api/master/:type
// ============================================
const createMasterData = async (req, res) => {
  try {
    const { type } = req.params;
    const pool = await poolPromise;

    // ============================================
    // Create Role
    // Body:
    // {
    //   name,
    //   displayName,
    //   accessLevelId
    // }
    // ============================================
    if (type === "roles") {
      const { name, displayName, accessLevelId } = req.body;

      if (!name || !displayName || !accessLevelId) {
        return res.status(400).json({
          message: "Role name, display name, and access level are required.",
        });
      }

      const duplicate = await pool
        .request()
        .input("RoleName", sql.NVarChar(50), name.trim())
        .query(`
          SELECT RoleId
          FROM Roles
          WHERE RoleName = @RoleName
        `);

      if (duplicate.recordset.length > 0) {
        return res.status(400).json({
          message: "This role already exists.",
        });
      }

      const result = await pool
        .request()
        .input("RoleName", sql.NVarChar(50), name.trim())
        .input("DisplayName", sql.NVarChar(100), displayName.trim())
        .input("AccessLevelId", sql.Int, accessLevelId)
        .query(`
          INSERT INTO Roles
          (
            RoleName,
            DisplayName,
            AccessLevelId,
            IsSystemRole,
            IsActive,
            CreatedAt
          )
          OUTPUT
            INSERTED.RoleId AS Id,
            INSERTED.RoleName AS Name,
            INSERTED.DisplayName,
            INSERTED.AccessLevelId,
            INSERTED.IsSystemRole,
            INSERTED.IsActive
          VALUES
          (
            @RoleName,
            @DisplayName,
            @AccessLevelId,
            0,
            1,
            GETDATE()
          )
        `);

      return res.status(201).json({
        message: "Role created successfully.",
        data: result.recordset[0],
      });
    }

    // ============================================
    // Create Access Level
    // Body:
    // {
    //   name,
    //   displayName,
    //   description
    // }
    // ============================================
    if (type === "access-levels") {
      const { name, displayName, description } = req.body;

      if (!name || !displayName) {
        return res.status(400).json({
          message: "Access level name and display name are required.",
        });
      }

      const duplicate = await pool
        .request()
        .input("AccessLevelName", sql.NVarChar(50), name.trim())
        .query(`
          SELECT AccessLevelId
          FROM AccessLevels
          WHERE AccessLevelName = @AccessLevelName
        `);

      if (duplicate.recordset.length > 0) {
        return res.status(400).json({
          message: "This access level already exists.",
        });
      }

      const result = await pool
        .request()
        .input("AccessLevelName", sql.NVarChar(50), name.trim())
        .input("DisplayName", sql.NVarChar(100), displayName.trim())
        .input("Description", sql.NVarChar(255), description || null)
        .query(`
          INSERT INTO AccessLevels
          (
            AccessLevelName,
            DisplayName,
            Description,
            IsActive,
            CreatedAt
          )
          OUTPUT
            INSERTED.AccessLevelId AS Id,
            INSERTED.AccessLevelName AS Name,
            INSERTED.DisplayName,
            INSERTED.Description,
            INSERTED.IsActive
          VALUES
          (
            @AccessLevelName,
            @DisplayName,
            @Description,
            1,
            GETDATE()
          )
        `);

      return res.status(201).json({
        message: "Access level created successfully.",
        data: result.recordset[0],
      });
    }

    // ============================================
    // Create Simple Master Data
    // Body:
    // {
    //   name
    // }
    // ============================================
    const { name } = req.body;
    const config = getConfig(type);

    if (!config) {
      return res.status(400).json({
        message: "Invalid master data type",
      });
    }

    if (!name || name.trim() === "") {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    const duplicate = await pool
      .request()
      .input("Name", sql.NVarChar(100), name.trim())
      .query(`
        SELECT ${config.id}
        FROM ${config.table}
        WHERE ${config.name} = @Name
      `);

    if (duplicate.recordset.length > 0) {
      return res.status(400).json({
        message: "This name already exists",
      });
    }

    const result = await pool
      .request()
      .input("Name", sql.NVarChar(100), name.trim())
      .query(`
        INSERT INTO ${config.table} (${config.name}, IsActive)
        OUTPUT
          INSERTED.${config.id} AS Id,
          INSERTED.${config.name} AS Name,
          INSERTED.IsActive
        VALUES (@Name, 1)
      `);

    return res.status(201).json({
      message: "Master data created successfully",
      data: result.recordset[0],
    });
  } catch (error) {
    console.error("Create Master Data Error:", error);

    return res.status(500).json({
      message: "Server error while creating master data",
      error: error.message,
    });
  }
};

// ============================================
// PUT /api/master/:type/:id
// ============================================
const updateMasterData = async (req, res) => {
  try {
    const { type, id } = req.params;
    const pool = await poolPromise;

    // ============================================
    // Update Role
    // ============================================
    if (type === "roles") {
      const { name, displayName, accessLevelId } = req.body;

      if (!name || !displayName || !accessLevelId) {
        return res.status(400).json({
          message: "Role name, display name, and access level are required.",
        });
      }

      const result = await pool
        .request()
        .input("RoleId", sql.Int, id)
        .input("RoleName", sql.NVarChar(50), name.trim())
        .input("DisplayName", sql.NVarChar(100), displayName.trim())
        .input("AccessLevelId", sql.Int, accessLevelId)
        .query(`
          UPDATE Roles
          SET
            RoleName = @RoleName,
            DisplayName = @DisplayName,
            AccessLevelId = @AccessLevelId
          OUTPUT
            INSERTED.RoleId AS Id,
            INSERTED.RoleName AS Name,
            INSERTED.DisplayName,
            INSERTED.AccessLevelId,
            INSERTED.IsSystemRole,
            INSERTED.IsActive
          WHERE RoleId = @RoleId
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          message: "Role not found",
        });
      }

      return res.json({
        message: "Role updated successfully.",
        data: result.recordset[0],
      });
    }

    // ============================================
    // Update Access Level
    // ============================================
    if (type === "access-levels") {
      const { name, displayName, description } = req.body;

      if (!name || !displayName) {
        return res.status(400).json({
          message: "Access level name and display name are required.",
        });
      }

      const result = await pool
        .request()
        .input("AccessLevelId", sql.Int, id)
        .input("AccessLevelName", sql.NVarChar(50), name.trim())
        .input("DisplayName", sql.NVarChar(100), displayName.trim())
        .input("Description", sql.NVarChar(255), description || null)
        .query(`
          UPDATE AccessLevels
          SET
            AccessLevelName = @AccessLevelName,
            DisplayName = @DisplayName,
            Description = @Description
          OUTPUT
            INSERTED.AccessLevelId AS Id,
            INSERTED.AccessLevelName AS Name,
            INSERTED.DisplayName,
            INSERTED.Description,
            INSERTED.IsActive
          WHERE AccessLevelId = @AccessLevelId
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          message: "Access level not found",
        });
      }

      return res.json({
        message: "Access level updated successfully.",
        data: result.recordset[0],
      });
    }

    // ============================================
    // Update Simple Master Data
    // ============================================
    const { name } = req.body;
    const config = getConfig(type);

    if (!config) {
      return res.status(400).json({
        message: "Invalid master data type",
      });
    }

    if (!name || name.trim() === "") {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    const result = await pool
      .request()
      .input("Id", sql.Int, id)
      .input("Name", sql.NVarChar(100), name.trim())
      .query(`
        UPDATE ${config.table}
        SET ${config.name} = @Name
        OUTPUT
          INSERTED.${config.id} AS Id,
          INSERTED.${config.name} AS Name,
          INSERTED.IsActive
        WHERE ${config.id} = @Id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Record not found",
      });
    }

    return res.json({
      message: "Master data updated successfully",
      data: result.recordset[0],
    });
  } catch (error) {
    console.error("Update Master Data Error:", error);

    return res.status(500).json({
      message: "Server error while updating master data",
      error: error.message,
    });
  }
};

// ============================================
// PATCH /api/master/:type/:id/status
// ============================================
const updateMasterStatus = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { isActive } = req.body;
    const pool = await poolPromise;

    // ============================================
    // Update Role Status
    // ============================================
    if (type === "roles") {
      const result = await pool
        .request()
        .input("RoleId", sql.Int, id)
        .input("IsActive", sql.Bit, Boolean(isActive))
        .query(`
          UPDATE Roles
          SET IsActive = @IsActive
          OUTPUT
            INSERTED.RoleId AS Id,
            INSERTED.RoleName AS Name,
            INSERTED.DisplayName,
            INSERTED.AccessLevelId,
            INSERTED.IsSystemRole,
            INSERTED.IsActive
          WHERE RoleId = @RoleId
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          message: "Role not found",
        });
      }

      return res.json({
        message: "Role status updated successfully.",
        data: result.recordset[0],
      });
    }

    // ============================================
    // Update Access Level Status
    // ============================================
    if (type === "access-levels") {
      const result = await pool
        .request()
        .input("AccessLevelId", sql.Int, id)
        .input("IsActive", sql.Bit, Boolean(isActive))
        .query(`
          UPDATE AccessLevels
          SET IsActive = @IsActive
          OUTPUT
            INSERTED.AccessLevelId AS Id,
            INSERTED.AccessLevelName AS Name,
            INSERTED.DisplayName,
            INSERTED.Description,
            INSERTED.IsActive
          WHERE AccessLevelId = @AccessLevelId
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          message: "Access level not found",
        });
      }

      return res.json({
        message: "Access level status updated successfully.",
        data: result.recordset[0],
      });
    }

    // ============================================
    // Update Simple Master Data Status
    // ============================================
    const config = getConfig(type);

    if (!config) {
      return res.status(400).json({
        message: "Invalid master data type",
      });
    }

    const result = await pool
      .request()
      .input("Id", sql.Int, id)
      .input("IsActive", sql.Bit, Boolean(isActive))
      .query(`
        UPDATE ${config.table}
        SET IsActive = @IsActive
        OUTPUT
          INSERTED.${config.id} AS Id,
          INSERTED.${config.name} AS Name,
          INSERTED.IsActive
        WHERE ${config.id} = @Id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Record not found",
      });
    }

    return res.json({
      message: "Status updated successfully",
      data: result.recordset[0],
    });
  } catch (error) {
    console.error("Update Master Status Error:", error);

    return res.status(500).json({
      message: "Server error while updating status",
      error: error.message,
    });
  }
};

module.exports = {
  getMasterData,
  createMasterData,
  updateMasterData,
  updateMasterStatus,
};
