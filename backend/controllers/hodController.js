// ============================================
// ARAB UNITY SCHOOL
// HOD Controller
// Handles HOD approval request list and actions
// ============================================

const { poolPromise, sql } = require("../config/db");

/**
 * @desc    Get requests assigned to logged-in HOD
 * @route   GET /api/hod/requests
 * @access  Private - HOD / SuperAdmin
 */
const getHodRequests = async (req, res) => {
  try {
    const hodId = req.user.id;
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("hodId", sql.Int, hodId)
      .query(`
        SELECT
          r.RequestId,
          r.RequestNumber,
          r.Copies,
          r.TotalPages,
          r.TotalSheets,
          r.PriorityLevel,
          r.Status,
          r.SubmittedAt,
          u.FullName AS TeacherName,
          u.EmployeeId,
          d.DepartmentName,
          s.SubjectName,
          p.PurposeName
        FROM PhotocopyRequests r
        LEFT JOIN Users u ON r.TeacherId = u.UserId
        LEFT JOIN Departments d ON r.DepartmentId = d.DepartmentId
        LEFT JOIN Subjects s ON r.SubjectId = s.SubjectId
        LEFT JOIN Purposes p ON r.PurposeId = p.PurposeId
        WHERE r.CurrentApproverId = @hodId
        ORDER BY r.SubmittedAt DESC
      `);

    return res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Get HOD Requests Error:", error);

    return res.status(500).json({
      message: "Server error while fetching HOD requests",
    });
  }
};

module.exports = {
  getHodRequests,
};