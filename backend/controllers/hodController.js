// ============================================
// ARAB UNITY SCHOOL
// HOD Controller
// Handles HOD dashboard, request review, approve, reject
// ============================================

const { poolPromise, sql } = require("../config/db");

/**
 * @desc    HOD Dashboard Statistics
 * @route   GET /api/hod/dashboard
 * @access  Private - HOD / SuperAdmin
 */
const getHodDashboard = async (req, res) => {
  try {
    // Logged-in HOD ID from JWT
    const hodId = req.user.id;

    // Connect to MSSQL
    const pool = await poolPromise;

    // Count all requests assigned to this HOD or already acted by this HOD
    const result = await pool
      .request()
      .input("hodId", sql.Int, hodId)
      .query(`
        SELECT
          COUNT(DISTINCT r.RequestId) AS TotalRequests,

          SUM(CASE 
            WHEN r.Status = 'Pending'
             AND r.CurrentApproverId = @hodId
            THEN 1 ELSE 0 
          END) AS PendingReview,

          SUM(CASE 
            WHEN r.Status = 'Approved by HOD'
            THEN 1 ELSE 0 
          END) AS Approved,

          SUM(CASE 
            WHEN r.Status = 'Rejected by HOD'
            THEN 1 ELSE 0 
          END) AS Rejected,

          SUM(CASE 
            WHEN r.Status = 'Forwarded to HOS'
            THEN 1 ELSE 0 
          END) AS Forwarded,

          SUM(CASE 
            WHEN r.Status = 'Completed'
            THEN 1 ELSE 0 
          END) AS Completed

        FROM PhotocopyRequests r
        LEFT JOIN RequestApprovals ra 
          ON r.RequestId = ra.RequestId
         AND ra.ApproverId = @hodId
         AND ra.ApprovalRole = 'HOD'

        WHERE r.CurrentApproverId = @hodId
           OR ra.ApproverId = @hodId
      `);

    return res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error("Get HOD Dashboard Error:", error);

    return res.status(500).json({
      message: "Server error while fetching HOD dashboard",
      error: error.message,
    });
  }
};

/**
 * @desc    Get requests assigned to logged-in HOD + requests already approved/rejected by HOD
 * @route   GET /api/hod/requests
 * @access  Private - HOD / SuperAdmin
 */
const getHodRequests = async (req, res) => {
  try {
    // Logged-in HOD ID from JWT
    const hodId = req.user.id;

    // Connect to MSSQL
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("hodId", sql.Int, hodId)
      .query(`
        SELECT DISTINCT
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
          p.PurposeName,

          ra.Remarks AS ApprovalRemarks,
          ra.ApprovalStatus,
          ra.ActionDate

        FROM PhotocopyRequests r

        LEFT JOIN Users u 
          ON r.TeacherId = u.UserId

        LEFT JOIN Departments d 
          ON r.DepartmentId = d.DepartmentId

        LEFT JOIN Subjects s 
          ON r.SubjectId = s.SubjectId

        LEFT JOIN Purposes p 
          ON r.PurposeId = p.PurposeId

        LEFT JOIN RequestApprovals ra
          ON r.RequestId = ra.RequestId
         AND ra.ApproverId = @hodId
         AND ra.ApprovalRole = 'HOD'

        WHERE r.CurrentApproverId = @hodId
           OR ra.ApproverId = @hodId

        ORDER BY r.SubmittedAt DESC
      `);

    return res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Get HOD Requests Error:", error);

    return res.status(500).json({
      message: "Server error while fetching HOD requests",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single request details
 * @route   GET /api/hod/requests/:id
 * @access  Private - HOD / SuperAdmin
 */
const getHodRequestById = async (req, res) => {
  try {
    // Logged-in HOD ID
    const hodId = req.user.id;

    // Request ID from URL
    const requestId = req.params.id;

    // Connect to MSSQL
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("requestId", sql.Int, requestId)
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
          p.PurposeName,

          ra.Remarks AS ApprovalRemarks,
          ra.ApprovalStatus,
          ra.ActionDate

        FROM PhotocopyRequests r

        LEFT JOIN Users u 
          ON r.TeacherId = u.UserId

        LEFT JOIN Departments d 
          ON r.DepartmentId = d.DepartmentId

        LEFT JOIN Subjects s 
          ON r.SubjectId = s.SubjectId

        LEFT JOIN Purposes p 
          ON r.PurposeId = p.PurposeId

        LEFT JOIN RequestApprovals ra
          ON r.RequestId = ra.RequestId
         AND ra.ApproverId = @hodId
         AND ra.ApprovalRole = 'HOD'

        WHERE r.RequestId = @requestId
          AND (
            r.CurrentApproverId = @hodId
            OR ra.ApproverId = @hodId
          )
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Request not found or not assigned to this HOD",
      });
    }

    return res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error("Get HOD Request By ID Error:", error);

    return res.status(500).json({
      message: "Server error while fetching request details",
      error: error.message,
    });
  }
};

/**
 * @desc    Get HOD approval history from RequestApprovals table
 * @route   GET /api/hod/approval-history
 * @access  Private - HOD / SuperAdmin
 */
const getHodApprovalHistory = async (req, res) => {
  try {
    // Logged-in HOD ID
    const hodId = req.user.id;

    // Connect to MSSQL
    const pool = await poolPromise;

    // Get all approval actions made by this HOD
    const result = await pool
      .request()
      .input("hodId", sql.Int, hodId)
      .query(`
        SELECT
          ra.ApprovalId,
          ra.RequestId,
          ra.ApproverId,
          ra.ApprovalRole,
          ra.ApprovalStatus,
          ra.Remarks,
          ra.ActionDate,

          r.RequestNumber,
          r.Status AS RequestStatus,
          r.Copies,
          r.TotalPages,
          r.TotalSheets,
          r.PriorityLevel,
          r.SubmittedAt,

          u.FullName AS TeacherName,
          u.EmployeeId,

          d.DepartmentName,
          s.SubjectName,
          p.PurposeName

        FROM RequestApprovals ra

        INNER JOIN PhotocopyRequests r
          ON ra.RequestId = r.RequestId

        LEFT JOIN Users u
          ON r.TeacherId = u.UserId

        LEFT JOIN Departments d
          ON r.DepartmentId = d.DepartmentId

        LEFT JOIN Subjects s
          ON r.SubjectId = s.SubjectId

        LEFT JOIN Purposes p
          ON r.PurposeId = p.PurposeId

        WHERE ra.ApproverId = @hodId
          AND ra.ApprovalRole = 'HOD'

        ORDER BY ra.ActionDate DESC
      `);

    return res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Get HOD Approval History Error:", error);

    return res.status(500).json({
      message: "Server error while fetching HOD approval history",
      error: error.message,
    });
  }
};

/**
 * @desc    Approve request assigned to logged-in HOD
 * @route   PUT /api/hod/requests/:id/approve
 * @access  Private - HOD / SuperAdmin
 */
const approveHodRequest = async (req, res) => {
  try {
    // Logged-in HOD ID
    const hodId = req.user.id;

    // Request ID from URL
    const requestId = req.params.id;

    // Remarks from frontend
    const { remarks } = req.body || {};

    // Connect to MSSQL
    const pool = await poolPromise;

    // Check if request is still pending and assigned to this HOD
    const requestResult = await pool
      .request()
      .input("requestId", sql.Int, requestId)
      .input("hodId", sql.Int, hodId)
      .query(`
        SELECT RequestId
        FROM PhotocopyRequests
        WHERE RequestId = @requestId
          AND CurrentApproverId = @hodId
          AND Status = 'Pending'
      `);

    if (requestResult.recordset.length === 0) {
      return res.status(404).json({
        message:
          "Request not found, already processed, or not assigned to this HOD",
      });
    }

    // Update request status
    await pool
      .request()
      .input("requestId", sql.Int, requestId)
      .query(`
        UPDATE PhotocopyRequests
        SET
          Status = 'Approved by HOD',
          CurrentApproverId = NULL
        WHERE RequestId = @requestId
      `);

    // Save approval history
    await pool
      .request()
      .input("requestId", sql.Int, requestId)
      .input("approverId", sql.Int, hodId)
      .input("remarks", sql.NVarChar, remarks || "Approved by HOD")
      .query(`
        INSERT INTO RequestApprovals
        (
          RequestId,
          ApproverId,
          ApprovalRole,
          ApprovalStatus,
          Remarks,
          ActionDate
        )
        VALUES
        (
          @requestId,
          @approverId,
          'HOD',
          'Approved',
          @remarks,
          GETDATE()
        )
      `);

    return res.status(200).json({
      success: true,
      message: "Request approved successfully",
    });
  } catch (error) {
    console.error("Approve HOD Request Error:", error);

    return res.status(500).json({
      message: "Server error while approving request",
      error: error.message,
    });
  }
};

/**
 * @desc    Reject request assigned to logged-in HOD
 * @route   PUT /api/hod/requests/:id/reject
 * @access  Private - HOD / SuperAdmin
 */
const rejectHodRequest = async (req, res) => {
  try {
    // Logged-in HOD ID
    const hodId = req.user.id;

    // Request ID from URL
    const requestId = req.params.id;

    // Remarks from frontend
    const { remarks } = req.body || {};

    // Connect to MSSQL
    const pool = await poolPromise;

    // Check if request is still pending and assigned to this HOD
    const requestResult = await pool
      .request()
      .input("requestId", sql.Int, requestId)
      .input("hodId", sql.Int, hodId)
      .query(`
        SELECT RequestId
        FROM PhotocopyRequests
        WHERE RequestId = @requestId
          AND CurrentApproverId = @hodId
          AND Status = 'Pending'
      `);

    if (requestResult.recordset.length === 0) {
      return res.status(404).json({
        message:
          "Request not found, already processed, or not assigned to this HOD",
      });
    }

    // Update request status
    await pool
      .request()
      .input("requestId", sql.Int, requestId)
      .query(`
        UPDATE PhotocopyRequests
        SET
          Status = 'Rejected by HOD',
          CurrentApproverId = NULL
        WHERE RequestId = @requestId
      `);

    // Save rejection history
    await pool
      .request()
      .input("requestId", sql.Int, requestId)
      .input("approverId", sql.Int, hodId)
      .input("remarks", sql.NVarChar, remarks || "Rejected by HOD")
      .query(`
        INSERT INTO RequestApprovals
        (
          RequestId,
          ApproverId,
          ApprovalRole,
          ApprovalStatus,
          Remarks,
          ActionDate
        )
        VALUES
        (
          @requestId,
          @approverId,
          'HOD',
          'Rejected',
          @remarks,
          GETDATE()
        )
      `);

    return res.status(200).json({
      success: true,
      message: "Request rejected successfully",
    });
  } catch (error) {
    console.error("Reject HOD Request Error:", error);

    return res.status(500).json({
      message: "Server error while rejecting request",
      error: error.message,
    });
  }
};

module.exports = {
  getHodDashboard,
  getHodRequests,
  getHodRequestById,
  getHodApprovalHistory,
  approveHodRequest,
  rejectHodRequest,
};