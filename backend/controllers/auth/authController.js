// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Authentication Controller
//
// Purpose:
// - Login users using Employee ID and password
// - Return authenticated user profile
// - Support MustChangePassword flow
//
// Routes:
// - POST /api/auth/login
// - GET  /api/auth/me
// ============================================

const { poolPromise, sql } = require("../../config/db");
const { generateToken } = require("../../utils/jwtHelper");
const { comparePassword } = require("../../utils/passwordHelper");

// ============================================
// Helper: Build User Display Role
// ============================================

const buildDisplayRole = (user) => {
  if (user.Role === "Teacher") {
    return `${user.DepartmentName || ""} Teacher`.trim();
  }

  if (user.Role === "HOD") {
    return `${user.DepartmentName || ""} ${user.Subject || ""} HOD`.trim();
  }

  if (user.Role === "HOS") {
    return `${user.DepartmentName || ""} HOS`.trim();
  }

  if (user.Role === "PrintingAdmin") {
    return "Printing Administrator";
  }

  if (user.Role === "PlatformAdmin") {
    return "Platform Administrator";
  }

  if (user.Role === "SuperAdmin") {
    return "Super Administrator";
  }

  return user.Role;
};

// ============================================
// Controller: Login
// ============================================

const login = async (req, res) => {
  try {
    // Read login credentials from frontend
    const { employeeId, password } = req.body;

    // Validate required fields
    if (!employeeId || !password) {
      return res.status(400).json({
        success: false,
        message: "Employee ID and password are required",
      });
    }

    // Connect to SQL Server
    const pool = await poolPromise;

    // Find user by Employee ID
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

    // Hide whether employee ID or password was wrong
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid employee ID or password",
      });
    }

    // Block inactive accounts
    if (!user.IsActive) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive. Please contact administrator.",
      });
    }

    // Validate password using centralized password helper
    const isPasswordValid = await comparePassword(password, user.PasswordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid employee ID or password",
      });
    }

    // Create friendly role label for frontend display
    const displayRole = buildDisplayRole(user);

    // Create JWT token using centralized JWT helper
    const token = generateToken({
      id: user.UserId,
      employeeId: user.EmployeeId,
      role: user.Role,
    });

    // Send successful login response
    return res.status(200).json({
      success: true,
      message: "Login successful",
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
        displayRole,
        mustChangePassword: user.MustChangePassword,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// ============================================
// Controller: Get Current Logged-In User
// ============================================

const getMe = async (req, res) => {
  try {
    // Connect to SQL Server
    const pool = await poolPromise;

    // Get profile using user ID from verified JWT token
    const result = await pool
      .request()
      .input("userId", sql.Int, req.user.id)
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

    // Handle deleted or missing user
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Build friendly role label for frontend display
    const displayRole = buildDisplayRole(user);

    // Return current user profile
    return res.status(200).json({
      success: true,
      message: "User profile loaded successfully",
      user: {
        id: user.UserId,
        employeeId: user.EmployeeId,
        fullName: user.FullName,
        schoolEmail: user.SchoolEmail,
        departmentId: user.DepartmentId,
        departmentName: user.DepartmentName,
        subject: user.Subject,
        role: user.Role,
        displayRole,
        mustChangePassword: user.MustChangePassword,
        isActive: user.IsActive,
        createdAt: user.CreatedAt,
      },
    });
  } catch (error) {
    console.error("Get Me Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching user profile",
    });
  }
};

// ============================================
// Exports
// ============================================

module.exports = {
  login,
  getMe,
};