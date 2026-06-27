// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// User Management Controller
//
// Purpose:
// - Manage users
// - Create users with auto-generated default password
// - Activate/deactivate user accounts
//
// Module:
// User Management
// ============================================

const { poolPromise, sql } = require("../../config/db");
const asyncHandler = require("../../shared/helpers/asyncHandler");
const { hashPassword } = require("../../shared/security/password");
const {
  sendSuccess,
  sendError,
} = require("../../shared/helpers/apiResponse");

// ============================================
// GET ALL USERS
// Route: GET /api/users
// ============================================

const getUsers = asyncHandler(async (req, res) => {
  const pool = await poolPromise;

  const result = await pool.request().query(`
    SELECT
      u.UserId,
      u.EmployeeId,
      u.FullName,
      u.SchoolEmail,
      u.DepartmentId,
      d.DepartmentName,
      u.Subject,
      u.Role,
      u.IsActive,
      u.CreatedAt
    FROM dbo.Users u
    LEFT JOIN dbo.Departments d
      ON u.DepartmentId = d.DepartmentId
    ORDER BY u.FullName
  `);

  return sendSuccess(res, "Users loaded successfully.", {
    count: result.recordset.length,
    users: result.recordset,
  });
});

// ============================================
// GET USER BY ID
// Route: GET /api/users/:id
// ============================================

const getUserById = asyncHandler(async (req, res) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("userId", sql.Int, req.params.id)
    .query(`
      SELECT *
      FROM dbo.Users
      WHERE UserId = @userId
    `);

  if (result.recordset.length === 0) {
    return sendError(res, "User not found.", 404);
  }

  return sendSuccess(
    res,
    "User loaded successfully.",
    result.recordset[0]
  );
});

// ============================================
// CREATE USER
// Route: POST /api/users
// ============================================

const createUser = asyncHandler(async (req, res) => {
  const {
    fullName,
    employeeId,
    schoolEmail,
    role,
    departmentId,
    sectionId,
    subject,
  } = req.body;

  // Validate required fields
  if (!fullName || !employeeId || !schoolEmail || !role) {
    return sendError(
      res,
      "Full name, employee ID, school email, and role are required.",
      400
    );
  }

  const pool = await poolPromise;

  // Check duplicate Employee ID
  const existingUser = await pool
    .request()
    .input("employeeId", sql.VarChar, employeeId)
    .query(`
      SELECT UserId
      FROM dbo.Users
      WHERE EmployeeId = @employeeId
    `);

  if (existingUser.recordset.length > 0) {
    return sendError(res, "Employee ID already exists.", 400);
  }

  // Default password is Employee ID.
  // User must change it on first login.
  const hashedPassword = await hashPassword(employeeId);

  await pool
    .request()
    .input("fullName", sql.NVarChar, fullName)
    .input("employeeId", sql.VarChar, employeeId)
    .input("schoolEmail", sql.VarChar, schoolEmail)
    .input("passwordHash", sql.VarChar, hashedPassword)
    .input("role", sql.VarChar, role)
    .input("departmentId", sql.Int, departmentId || null)
    .input("sectionId", sql.Int, sectionId || null)
    .input("subject", sql.VarChar, subject || null)
    .query(`
      INSERT INTO dbo.Users
      (
        FullName,
        EmployeeId,
        SchoolEmail,
        PasswordHash,
        Role,
        DepartmentId,
        SectionId,
        Subject,
        IsActive,
        MustChangePassword,
        CreatedAt
      )
      VALUES
      (
        @fullName,
        @employeeId,
        @schoolEmail,
        @passwordHash,
        @role,
        @departmentId,
        @sectionId,
        @subject,
        1,
        1,
        GETDATE()
      )
    `);

  return sendSuccess(
    res,
    "User created successfully.",
    {
      defaultPassword: employeeId,
    },
    201
  );
});

// ============================================
// UPDATE USER
// Route: PUT /api/users/:id
// ============================================

const updateUser = asyncHandler(async (req, res) => {
  const {
    fullName,
    schoolEmail,
    role,
    departmentId,
    subject,
  } = req.body;

  const userId = req.params.id;
  const pool = await poolPromise;

  // Check if user exists
  const existingUser = await pool
    .request()
    .input("userId", sql.Int, userId)
    .query(`
      SELECT UserId
      FROM dbo.Users
      WHERE UserId = @userId
    `);

  if (existingUser.recordset.length === 0) {
    return sendError(res, "User not found.", 404);
  }

  // Update basic user information
  await pool
    .request()
    .input("userId", sql.Int, userId)
    .input("fullName", sql.NVarChar, fullName)
    .input("schoolEmail", sql.VarChar, schoolEmail)
    .input("role", sql.VarChar, role)
    .input(
      "departmentId",
      sql.Int,
      departmentId === "" || departmentId === undefined
        ? null
        : Number(departmentId)
    )
    .input("subject", sql.VarChar, role === "HOD" ? subject : null)
    .query(`
      UPDATE dbo.Users
      SET
        FullName = @fullName,
        SchoolEmail = @schoolEmail,
        Role = @role,
        DepartmentId = @departmentId,
        Subject = @subject
      WHERE UserId = @userId
    `);

  return sendSuccess(res, "User updated successfully.");
});

// ============================================
// DEACTIVATE USER
// Route: PUT /api/users/:id/deactivate
// ============================================

const deactivateUser = asyncHandler(async (req, res) => {
  const pool = await poolPromise;

  await pool
    .request()
    .input("userId", sql.Int, req.params.id)
    .query(`
      UPDATE dbo.Users
      SET IsActive = 0
      WHERE UserId = @userId
    `);

  return sendSuccess(res, "User deactivated successfully.");
});

// ============================================
// ACTIVATE USER
// Route: PUT /api/users/:id/activate
// ============================================

const activateUser = asyncHandler(async (req, res) => {
  const pool = await poolPromise;

  await pool
    .request()
    .input("userId", sql.Int, req.params.id)
    .query(`
      UPDATE dbo.Users
      SET IsActive = 1
      WHERE UserId = @userId
    `);

  return sendSuccess(res, "User activated successfully.");
});

// ============================================
// Exports
// ============================================

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  activateUser,
};
