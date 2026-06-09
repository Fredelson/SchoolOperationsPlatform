const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { poolPromise, sql } = require("../config/db");

/**
 * @desc    Login user using Employee ID and Password
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    if (!employeeId || !password) {
      return res.status(400).json({
        message: "Employee ID and password are required",
      });
    }

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("employeeId", sql.NVarChar, employeeId)
      .query(`
        SELECT
          UserId,
          EmployeeId,
          FullName,
          SchoolEmail,
          DepartmentId,
          Subject,
          Role,
          PasswordHash,
          MustChangePassword,
          IsActive
        FROM Users
        WHERE EmployeeId = @employeeId
      `);

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({
        message: "Invalid employee ID or password",
      });
    }

    if (!user.IsActive) {
      return res.status(403).json({
        message: "Account is inactive. Please contact administrator.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.PasswordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid employee ID or password",
      });
    }

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

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.UserId,
        employeeId: user.EmployeeId,
        fullName: user.FullName,
        schoolEmail: user.SchoolEmail,
        departmentId: user.DepartmentId,
        subject: user.Subject,
        role: user.Role,
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
    const pool = await poolPromise;

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
        LEFT JOIN Departments d ON u.DepartmentId = d.DepartmentId
        WHERE u.UserId = @userId
      `);

    const user = result.recordset[0];

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      id: user.UserId,
      employeeId: user.EmployeeId,
      fullName: user.FullName,
      schoolEmail: user.SchoolEmail,
      departmentId: user.DepartmentId,
      departmentName: user.DepartmentName,
      subject: user.Subject,
      role: user.Role,
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