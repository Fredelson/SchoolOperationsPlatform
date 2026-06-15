// ============================================
// ARAB UNITY SCHOOL
// Lookup Controller
// Provides dropdown data for frontend forms
// ============================================

const { poolPromise, sql } = require("../config/db");

/**
 * @desc    Get active departments
 * @route   GET /api/lookups/departments
 * @access  Private
 */
const getDepartments = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        DepartmentId,
        DepartmentName
      FROM Departments
      WHERE IsActive = 1
      ORDER BY DepartmentName ASC
    `);

    return res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Get Departments Error:", error);

    return res.status(500).json({
      message: "Server error while fetching departments",
      error: error.message,
    });
  }
};

/**
 * @desc    Get active subjects
 * @route   GET /api/lookups/subjects
 * @access  Private
 */
const getSubjects = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        SubjectId,
        SubjectName
      FROM Subjects
      WHERE IsActive = 1
      ORDER BY SubjectName ASC
    `);

    return res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Get Subjects Error:", error);

    return res.status(500).json({
      message: "Server error while fetching subjects",
      error: error.message,
    });
  }
};

/**
 * @desc    Get active purposes
 * @route   GET /api/lookups/purposes
 * @access  Private
 */
const getPurposes = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        PurposeId,
        PurposeName
      FROM Purposes
      WHERE IsActive = 1
      ORDER BY PurposeName ASC
    `);

    return res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Get Purposes Error:", error);

    return res.status(500).json({
      message: "Server error while fetching purposes",
      error: error.message,
    });
  }
};

/**
 * @desc    Get active HOD users by department
 * @route   GET /api/lookups/hods?departmentId=2
 * @access  Private
 */
const getHods = async (req, res) => {
  try {
    const departmentId = Number(req.query.departmentId);

    if (!departmentId) {
      return res.status(400).json({
        message: "Department ID is required.",
      });
    }

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("departmentId", sql.Int, departmentId)
      .query(`
        SELECT
          UserId,
          FullName,
          EmployeeId,
          DepartmentId,
          Subject
        FROM Users
        WHERE Role = 'HOD'
          AND IsActive = 1
          AND DepartmentId = @departmentId
        ORDER BY FullName ASC
      `);

    return res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Get HODs Error:", error);

    return res.status(500).json({
      message: "Server error while fetching HODs",
      error: error.message,
    });
  }
};

module.exports = {
  getDepartments,
  getSubjects,
  getPurposes,
  getHods,
};