// ============================================================
// Arab Unity School Operations Platform
// Role Repository
// ============================================================
//
// Purpose:
// Handles all SQL operations related to Roles.
//
// Architecture:
// Repository Layer
//
// Rules:
// - SQL only
// - No business logic
// - No validation
// - No HTTP handling
//
// Source of Truth:
// OperationsPlatformDB
// ============================================================

const {
  sql,
  executeQuery,
  rows,
  firstOrNull,
  insertedId,
} = require("../../../shared/database");

// ============================================================
// Get All Active Roles
// ============================================================
//
// Purpose:
// Returns all active platform roles together with
// their corresponding Access Level.
//
// Used By:
// GET /api/roles
// ============================================================

async function getRoles() {
  const result = await executeQuery(`
        SELECT
            r.RoleId,
            r.RoleKey,
            r.RoleName,
            r.DisplayName,
            r.AccessLevelId,

            al.AccessLevelKey,
            al.AccessLevelName,
            al.DisplayName AS AccessLevelDisplayName,

            r.Description,
            r.IsSystemRole,
            r.IsProtected,
            r.IsActive,
            r.CreatedAt,
            r.UpdatedAt

        FROM dbo.Roles r

        INNER JOIN dbo.AccessLevels al
            ON r.AccessLevelId = al.AccessLevelId

        WHERE
            r.IsActive = 1

        ORDER BY
            al.SortOrder,
            r.DisplayName;
    `);

  return rows(result);
}

// ============================================================
// Get Role By Id
// ============================================================
//
// Purpose:
// Returns a complete Role record.
//
// Used By:
// GET /api/roles/:roleId
// ============================================================

async function getRoleById(roleId) {
  const result = await executeQuery(
    `
        SELECT

            r.RoleId,
            r.RoleKey,
            r.RoleName,
            r.DisplayName,
            r.AccessLevelId,

            al.AccessLevelKey,
            al.AccessLevelName,
            al.DisplayName AS AccessLevelDisplayName,

            r.Description,
            r.IsSystemRole,
            r.IsProtected,
            r.IsActive,
            r.CreatedAt,
            r.UpdatedAt

        FROM dbo.Roles r

        INNER JOIN dbo.AccessLevels al
            ON r.AccessLevelId = al.AccessLevelId

        WHERE
            r.RoleId = @RoleId;
        `,
    [
      {
        name: "RoleId",
        type: sql.Int,
        value: roleId,
      },
    ]
  );

  return firstOrNull(result);
}

// ============================================================
// Find Role By Id
// ============================================================
//
// Purpose:
// Lightweight lookup used by the Service layer.
//
// Unlike getRoleById(), this does NOT join
// AccessLevels because only the Role itself
// is required for validation.
//
// Used By:
//
// • Update Role
// • Delete Role
// • Business Validation
// ============================================================

async function findRoleById(roleId) {
  const result = await executeQuery(
    `
        SELECT

            RoleId,
            RoleKey,
            RoleName,
            DisplayName,
            AccessLevelId,
            Description,

            IsSystemRole,
            IsProtected,
            IsActive,

            CreatedAt,
            UpdatedAt

        FROM dbo.Roles

        WHERE
            RoleId = @RoleId;
        `,
    [
      {
        name: "RoleId",
        type: sql.Int,
        value: roleId,
      },
    ]
  );
  return firstOrNull(result);
}

// ============================================================
// Find Role By Key
// ============================================================
//
// Purpose:
// Checks whether a RoleKey already exists.
//
// Notes:
// - Used during Role creation.
// - Used during Role update.
// - excludeRoleId prevents the current Role
//   from detecting itself as a duplicate.
//
// Example:
//
// Creating
// --------
// SUPER_ADMIN
//
// Updating
// --------
// SUPER_ADMIN (same record)
// should NOT be treated as duplicate.
//
// ============================================================

async function findRoleByKey(roleKey, excludeRoleId = null) {
  const result = await executeQuery(
    `
        SELECT

            RoleId,
            RoleKey

        FROM dbo.Roles

        WHERE
            RoleKey = @RoleKey

        AND
        (
            @ExcludeRoleId IS NULL
            OR RoleId <> @ExcludeRoleId
        );
        `,
    [
      {
        name: "RoleKey",
        type: sql.NVarChar(50),
        value: roleKey,
      },
      {
        name: "ExcludeRoleId",
        type: sql.Int,
        value: excludeRoleId,
      },
    ]
  );

  return firstOrNull(result);
}

// ============================================================
// Find Role By Name
// ============================================================
//
// Purpose:
//
// Checks whether a RoleName already exists.
//
// Used By:
//
// • Create Role
// • Update Role
//
// ============================================================

async function findRoleByName(roleName, excludeRoleId = null) {
  const result = await executeQuery(
    `
        SELECT

            RoleId,
            RoleName

        FROM dbo.Roles

        WHERE
            RoleName = @RoleName

        AND
        (
            @ExcludeRoleId IS NULL
            OR RoleId <> @ExcludeRoleId
        );
        `,
    [
      {
        name: "RoleName",
        type: sql.NVarChar(100),
        value: roleName,
      },
      {
        name: "ExcludeRoleId",
        type: sql.Int,
        value: excludeRoleId,
      },
    ]
  );

  return firstOrNull(result);
}

// ============================================================
// Find Access Level
// ============================================================
//
// Purpose:
//
// Validates that an Access Level exists
// and is currently active.
//
// Used By:
//
// • Create Role
// • Update Role
//
// ============================================================

async function findAccessLevelById(accessLevelId) {
  const result = await executeQuery(
    `
        SELECT

            AccessLevelId,
            AccessLevelKey,
            AccessLevelName,
            DisplayName,
            SortOrder,
            IsSystemLevel,
            IsActive

        FROM dbo.AccessLevels

        WHERE

            AccessLevelId = @AccessLevelId

        AND
            IsActive = 1;
        `,
    [
      {
        name: "AccessLevelId",
        type: sql.Int,
        value: accessLevelId,
      },
    ]
  );

  return firstOrNull(result);
}

// ============================================================
// Create Role
// ============================================================
//
// Purpose:
// Creates a new platform role.
//
// Notes:
// - Validation is handled by the Service layer.
// - Duplicate checking is handled before calling
//   this repository method.
// - Repository only performs SQL.
//
// Used By:
// POST /api/roles
// ============================================================

async function createRole(data) {
  const result = await executeQuery(
    `
    INSERT INTO dbo.Roles
    (
        RoleKey,
        RoleName,
        DisplayName,
        AccessLevelId,
        Description,
        IsSystemRole,
        IsProtected,
        IsActive,
        CreatedAt,
        UpdatedAt
    )

    OUTPUT INSERTED.RoleId

    VALUES
    (
        @RoleKey,
        @RoleName,
        @DisplayName,
        @AccessLevelId,
        @Description,
        @IsSystemRole,
        @IsProtected,
        1,
        GETDATE(),
        GETDATE()
    );
    `,
    [
      {
        name: "RoleKey",
        type: sql.NVarChar(50),
        value: data.roleKey,
      },
      {
        name: "RoleName",
        type: sql.NVarChar(100),
        value: data.roleName,
      },
      {
        name: "DisplayName",
        type: sql.NVarChar(100),
        value: data.displayName,
      },
      {
        name: "AccessLevelId",
        type: sql.Int,
        value: data.accessLevelId,
      },
      {
        name: "Description",
        type: sql.NVarChar(255),
        value: data.description,
      },
      {
        name: "IsSystemRole",
        type: sql.Bit,
        value: data.isSystemRole,
      },
      {
        name: "IsProtected",
        type: sql.Bit,
        value: data.isProtected,
      },
    ]
  );

  return insertedId(result, "RoleId");
}

// ============================================================
// Update Role
// ============================================================
//
// Purpose:
// Updates an existing platform role.
//
// Notes:
// - Service validates:
//      • Role exists
//      • Access Level
//      • Duplicate Key
//      • Duplicate Name
//      • Protected Role
//
// Repository performs SQL only.
//
// Used By:
// PUT /api/roles/:roleId
// ============================================================

async function updateRole(roleId, data) {
  await executeQuery(
    `
    UPDATE dbo.Roles

    SET

        RoleKey = @RoleKey,
        RoleName = @RoleName,
        DisplayName = @DisplayName,
        AccessLevelId = @AccessLevelId,
        Description = @Description,

        UpdatedAt = GETDATE()

    WHERE
        RoleId = @RoleId;
    `,
    [
      {
        name: "RoleId",
        type: sql.Int,
        value: roleId,
      },
      {
        name: "RoleKey",
        type: sql.NVarChar(50),
        value: data.roleKey,
      },
      {
        name: "RoleName",
        type: sql.NVarChar(100),
        value: data.roleName,
      },
      {
        name: "DisplayName",
        type: sql.NVarChar(100),
        value: data.displayName,
      },
      {
        name: "AccessLevelId",
        type: sql.Int,
        value: data.accessLevelId,
      },
      {
        name: "Description",
        type: sql.NVarChar(255),
        value: data.description,
      },
    ]
  );
}

// ============================================================
// Deactivate Role
// ============================================================
//
// Purpose:
// Performs a soft delete by deactivating the Role.
//
// Why Soft Delete?
//
// • Preserves Audit Logs
// • Preserves User history
// • Preserves historical reports
// • Prevents broken foreign keys
//
// Business Rules:
//
// The Service layer prevents:
//
// • Deleting System Roles
// • Deleting Protected Roles
//
// Repository simply performs SQL.
//
// Used By:
//
// DELETE /api/roles/:roleId
// ============================================================

async function deactivateRole(roleId) {
  await executeQuery(
    `
    UPDATE dbo.Roles

    SET

        IsActive = 0,
        UpdatedAt = GETDATE()

    WHERE

        RoleId = @RoleId;
    `,
    [
      {
        name: "RoleId",
        type: sql.Int,
        value: roleId,
      },
    ]
  );
}

// ============================================================
// Repository Exports
// ============================================================
//
// Export only the repository methods.
//
// Service layer contains business rules.
//
// ============================================================

module.exports = {
  // -------------------------
  // Read
  // -------------------------
  getRoles,
  getRoleById,

  // -------------------------
  // Lookup / Validation
  // -------------------------
  findRoleById,
  findRoleByKey,
  findRoleByName,
  findAccessLevelById,

  // -------------------------
  // Write
  // -------------------------
  createRole,
  updateRole,
  deactivateRole,
};