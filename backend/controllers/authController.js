const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { poolPromise, sql } = require("../config/db");

// ============================================
// Build user display role
// Example:
// Teacher       -> Primary Teacher
// HOD           -> Primary English HOD
// HOS           -> Primary HOS
// PrintingAdmin -> Printing Administrator
// SuperAdmin    -> Super Administrator
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

  if (user.Role === "SuperAdmin") {
    return "Super Administrator";
  }

  return user.Role;
};

/**
 * @desc    Login user using Employee ID and Password
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    // Get login credentials from request body
    const { employeeId, password } = req.body;

    // Validate required fields
    if (!employeeId || !password) {
      return res.status(400).json({
        message: "Employee ID and password are required",
      });
    }

    // Connect to MSSQL
    const pool = await poolPromise;

    // Get user with department name
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

    // Invalid employee ID
    if (!user) {
      return res.status(401).json({
        message: "Invalid employee ID or password",
      });
    }

    // Inactive user check
    if (!user.IsActive) {
      return res.status(403).json({
        message: "Account is inactive. Please contact administrator.",
      });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.PasswordHash
    );

    // Invalid password
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid employee ID or password",
      });
    }

    // Build friendly role label for UI
    const displayRole = buildDisplayRole(user);

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.UserId,
        employeeId: user.EmployeeId,
        role: user.Role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Send login response
    return res.status(200).json({
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
      message: "Server error during login",
    });
  }
};

/**
 * @desc    Get logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    // Connect to MSSQL
    const pool = await poolPromise;

    // Get current logged-in user with department name
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

    // User not found
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Build friendly role label for UI
    const displayRole = buildDisplayRole(user);

    // Return current user profile
    return res.status(200).json({
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
    });
  } catch (error) {
    console.error("Get Me Error:", error);

    return res.status(500).json({
      message: "Server error while fetching user profile",
    });
  }
};

module.exports = {
  login,
  getMe,
};