// ============================================
// ARAB UNITY SCHOOL
// User Management Controller
// ============================================

const bcrypt = require("bcryptjs");
const { poolPromise, sql } = require("../config/db");

// ============================================
// GET ALL USERS
// ============================================
const getUsers = async (req, res) => {
  try {
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

    res.status(200).json({
      success: true,
      count: result.recordset.length,
      users: result.recordset,
    });
  } catch (error) {
    console.error("Get Users Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load users",
    });
  }
};

// ============================================
// GET USER BY ID
// ============================================
const getUserById = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("userId", sql.Int, req.params.id)
      .query(`
        SELECT *
        FROM Users
        WHERE UserId = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: result.recordset[0],
    });
  } catch (error) {
    console.error("Get User Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load user",
    });
  }
};

// ============================================
// CREATE USER
// ============================================
const createUser = async (req, res) => {
  try {
    const {
      fullName,
      employeeId,
      schoolEmail,
      role,
      departmentId,
      sectionId,
      subject,
    } = req.body;

    const pool = await poolPromise;

    const existingUser = await pool
      .request()
      .input("employeeId", sql.VarChar, employeeId)
      .query(`
        SELECT UserId
        FROM Users
        WHERE EmployeeId = @employeeId
      `);

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Employee ID already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(employeeId, 10);

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
        INSERT INTO Users
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

    res.status(201).json({
      success: true,
      message: "User created successfully",
      defaultPassword: employeeId,
    });
  } catch (error) {
    console.error("Create User Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
};

// ============================================
// UPDATE USER
// Updates user basic information
// Matches current Users table schema
// ============================================
const updateUser = async (req, res) => {
  try {
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
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user info
    await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("fullName", sql.NVarChar, fullName)
      .input("schoolEmail", sql.VarChar, schoolEmail)
      .input("role", sql.VarChar, role)
      .input(
        "departmentId",
        sql.Int,
        departmentId === "" || departmentId === undefined ? null : Number(departmentId)
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

    res.status(200).json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Update User Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to update user",
    });
  }
};

// ============================================
// DEACTIVATE USER
// ============================================
const deactivateUser = async (req, res) => {
  try {
    const pool = await poolPromise;

    await pool
      .request()
      .input("userId", sql.Int, req.params.id)
      .query(`
        UPDATE Users
        SET IsActive = 0
        WHERE UserId = @userId
      `);

    res.status(200).json({
      success: true,
      message: "User deactivated",
    });
  } catch (error) {
    console.error("Deactivate User Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to deactivate user",
    });
  }
};

// ============================================
// ACTIVATE USER
// ============================================
const activateUser = async (req, res) => {
  try {
    const pool = await poolPromise;

    await pool
      .request()
      .input("userId", sql.Int, req.params.id)
      .query(`
        UPDATE Users
        SET IsActive = 1
        WHERE UserId = @userId
      `);

    res.status(200).json({
      success: true,
      message: "User activated",
    });
  } catch (error) {
    console.error("Activate User Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to activate user",
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  activateUser,
};