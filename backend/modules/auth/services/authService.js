// ============================================
// ARAB UNITY SCHOOL OPERATIONS PLATFORM
// Auth Service
//
// Purpose:
// - Handle authentication business logic
// - Keep controllers clean
// - Centralize login/profile database logic
// ============================================

const { poolPromise, sql } = require("../../../config/db");
const { generateToken } = require("../../../shared/security/jwt");
const { comparePassword } = require("../../../shared/security/password");

// ============================================
// Helper: Build User Display Role
// ============================================

const buildDisplayRole = (user) => {
  if (user.Role === "Teacher") return `${user.DepartmentName || ""} Teacher`.trim();
  if (user.Role === "HOD") return `${user.DepartmentName || ""} ${user.Subject || ""} HOD`.trim();
  if (user.Role === "HOS") return `${user.DepartmentName || ""} HOS`.trim();
  if (user.Role === "PrintingAdmin") return "Printing Administrator";
  if (user.Role === "PlatformAdmin") return "Platform Administrator";
  if (user.Role === "SuperAdmin") return "Super Administrator";

  return user.Role;
};

// ============================================
// Login User
// ============================================

const loginUser = async ({ employeeId, password }) => {
  if (!employeeId || !password) {
    const error = new Error("Employee ID and password are required");
    error.statusCode = 400;
    throw error;
  }

  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("employeeId", sql.NVarChar, employeeId)
    .query(`
      SELECT
        u.UserId,
        u.EmployeeId,
        u.FullName,
        u.SchoolEmail,
        u.DepartmentId,
        d.DepartmentName,
        u.Subject,
        u.Role,
        u.PasswordHash,
        u.MustChangePassword,
        u.IsActive
      FROM Users u
      LEFT JOIN Departments d
        ON u.DepartmentId = d.DepartmentId
      WHERE u.EmployeeId = @employeeId
    `);

  const user = result.recordset[0];

  if (!user) {
    const error = new Error("Invalid employee ID or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.IsActive) {
    const error = new Error("Account is inactive. Please contact administrator.");
    error.statusCode = 403;
    throw error;
  }

  const isPasswordValid = await comparePassword(password, user.PasswordHash);

  if (!isPasswordValid) {
    const error = new Error("Invalid employee ID or password");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({
    id: user.UserId,
    employeeId: user.EmployeeId,
    role: user.Role,
  });

  return {
    token,
    user: {
      id: user.UserId,
      employeeId: user.EmployeeId,
      fullName: user.FullName,
      schoolEmail: user.SchoolEmail,
      departmentId: user.DepartmentId,
      departmentName: user.DepartmentName,
      subject: user.Subject,
      role: user.Role,
      displayRole: buildDisplayRole(user),
      mustChangePassword: user.MustChangePassword,
    },
  };
};

// ============================================
// Get Logged-In User Profile
// ============================================

const getCurrentUser = async (userId) => {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("userId", sql.Int, userId)
    .query(`
      SELECT
        u.UserId,
        u.EmployeeId,
        u.FullName,
        u.SchoolEmail,
        u.DepartmentId,
        d.DepartmentName,
        u.Subject,
        u.Role,
        u.MustChangePassword,
        u.IsActive,
        u.CreatedAt
      FROM Users u
      LEFT JOIN Departments d
        ON u.DepartmentId = d.DepartmentId
      WHERE u.UserId = @userId
    `);

  const user = result.recordset[0];

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user.UserId,
    employeeId: user.EmployeeId,
    fullName: user.FullName,
    schoolEmail: user.SchoolEmail,
    departmentId: user.DepartmentId,
    departmentName: user.DepartmentName,
    subject: user.Subject,
    role: user.Role,
    displayRole: buildDisplayRole(user),
    mustChangePassword: user.MustChangePassword,
    isActive: user.IsActive,
    createdAt: user.CreatedAt,
  };
};

module.exports = {
  loginUser,
  getCurrentUser,
};