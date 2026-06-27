// ============================================
// ARAB UNITY SCHOOL
// Photocopy Request Controller
// Handles creating, reading, dashboard,
// attachments, and teacher cancellation
// ============================================

const { poolPromise, sql } = require("../../config/db");

/**
 * @desc    Create a new photocopy request
 * @route   POST /api/requests
 * @access  Private - Teacher / HOD / SuperAdmin
 */
const createRequest = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const requesterRole = req.user.role || req.user.Role;

    const {
      departmentId,
      subjectId,
      purposeId,
      copies,
      totalPages,
      totalSheets,
      priorityLevel,
    } = req.body;

    if (
      !departmentId ||
      !subjectId ||
      !purposeId ||
      !copies ||
      !totalPages ||
      !totalSheets
    ) {
      return res.status(400).json({
        message: "Required request fields are missing",
      });
    }

    const pool = await poolPromise;
    const requestNumber = `REQ-${Date.now()}`;

    let nextApproverId = null;
    let approvalRole = null;
    let status = "Pending";

    // ============================================
    // HOD creates request
    // <= 500 sheets: direct to Printing Admin
    // > 500 sheets: send to HOS
    // ============================================
    if (requesterRole === "HOD") {
      if (Number(totalSheets) > 500) {
        const hosResult = await pool
          .request()
          .input("departmentId", sql.Int, departmentId)
          .query(`
            SELECT TOP 1 UserId
            FROM Users
            WHERE Role = 'HOS'
              AND DepartmentId = @departmentId
              AND IsActive = 1
            ORDER BY UserId ASC
          `);

        nextApproverId = hosResult.recordset[0]?.UserId;

        if (!nextApproverId) {
          return res.status(400).json({
            message: "No active HOS found for the selected department",
          });
        }

        approvalRole = "HOS";
        status = "Pending HOS Approval";
      } else {
        const printingAdminResult = await pool.request().query(`
          SELECT TOP 1 UserId
          FROM Users
          WHERE Role = 'PrintingAdmin'
            AND IsActive = 1
          ORDER BY UserId ASC
        `);

        nextApproverId = printingAdminResult.recordset[0]?.UserId;

        if (!nextApproverId) {
          return res.status(400).json({
            message: "No active Printing Admin found",
          });
        }

        approvalRole = "PrintingAdmin";
        status = "Forwarded to Printing";
      }
    }

    // ============================================
    // Teacher creates request
    // Always starts with HOD approval
    // ============================================
    else {
      const subjectResult = await pool
        .request()
        .input("subjectId", sql.Int, subjectId)
        .query(`
          SELECT SubjectName
          FROM Subjects
          WHERE SubjectId = @subjectId
            AND IsActive = 1
        `);

      const subjectName = subjectResult.recordset[0]?.SubjectName;

      if (!subjectName) {
        return res.status(400).json({
          message: "Selected subject was not found or is inactive",
        });
      }

      const hodResult = await pool
        .request()
        .input("departmentId", sql.Int, departmentId)
        .input("subjectName", sql.NVarChar, subjectName)
        .query(`
          SELECT TOP 1 UserId
          FROM Users
          WHERE Role = 'HOD'
            AND DepartmentId = @departmentId
            AND Subject = @subjectName
            AND IsActive = 1
          ORDER BY UserId ASC
        `);

      nextApproverId = hodResult.recordset[0]?.UserId;

      if (!nextApproverId) {
        return res.status(400).json({
          message: `No active HOD found for ${subjectName} in the selected department`,
        });
      }

      approvalRole = "HOD";
      status = "Pending";
    }

    // ============================================
    // Insert main request
    // ============================================
    const requestResult = await pool
      .request()
      .input("requestNumber", sql.NVarChar, requestNumber)
      .input("teacherId", sql.Int, requesterId)
      .input("departmentId", sql.Int, departmentId)
      .input("subjectId", sql.Int, subjectId)
      .input("purposeId", sql.Int, purposeId)
      .input("copies", sql.Int, copies)
      .input("totalPages", sql.Int, totalPages)
      .input("totalSheets", sql.Int, totalSheets)
      .input("priorityLevel", sql.NVarChar, priorityLevel || "Normal")
      .input("status", sql.NVarChar, status)
      .input("approverId", sql.Int, nextApproverId)
      .query(`
        INSERT INTO PhotocopyRequests
        (
          RequestNumber,
          TeacherId,
          DepartmentId,
          SubjectId,
          PurposeId,
          Copies,
          TotalPages,
          TotalSheets,
          PriorityLevel,
          Status,
          CurrentApproverId,
          SubmittedAt
        )
        OUTPUT INSERTED.RequestId
        VALUES
        (
          @requestNumber,
          @teacherId,
          @departmentId,
          @subjectId,
          @purposeId,
          @copies,
          @totalPages,
          @totalSheets,
          @priorityLevel,
          @status,
          @approverId,
          GETDATE()
        )
      `);

    const requestId = requestResult.recordset[0].RequestId;

    // ============================================
    // Insert approval / routing history
    // ============================================
    await pool
      .request()
      .input("requestId", sql.Int, requestId)
      .input("approverId", sql.Int, nextApproverId)
      .input("approvalRole", sql.NVarChar, approvalRole)
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
          @approvalRole,
          'Pending',
          NULL,
          GETDATE()
        )
      `);

    return res.status(201).json({
      message: "Request created successfully",
      requestId,
      requestNumber,
      approvalRole,
      approverId: nextApproverId,
      status,
    });
  } catch (error) {
    console.error("Create Request Error:", error);

    return res.status(500).json({
      message: "Server error while creating request",
      error: error.message,
    });
  }
};

/**
 * @desc    Get logged-in teacher's own requests
 * @route   GET /api/requests/my-requests
 * @access  Private - Teacher / SuperAdmin
 */
const getMyRequests = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("teacherId", sql.Int, teacherId)
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
          d.DepartmentName,
          s.SubjectName,
          p.PurposeName
        FROM PhotocopyRequests r
        LEFT JOIN Departments d 
          ON r.DepartmentId = d.DepartmentId
        LEFT JOIN Subjects s 
          ON r.SubjectId = s.SubjectId
        LEFT JOIN Purposes p 
          ON r.PurposeId = p.PurposeId
        WHERE r.TeacherId = @teacherId
        ORDER BY r.SubmittedAt DESC
      `);

    return res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Get My Requests Error:", error);

    return res.status(500).json({
      message: "Server error while fetching requests",
      error: error.message,
    });
  }
};

/**
 * @desc    Get request details by request ID
 * @route   GET /api/requests/:id
 * @access  Private
 */
const getRequestById = async (req, res) => {
  try {
    const requestId = req.params.id;
    const pool = await poolPromise;

    const requestResult = await pool
      .request()
      .input("requestId", sql.Int, requestId)
      .query(`
        SELECT
          r.*,
          u.FullName AS TeacherName,
          u.EmployeeId,
          d.DepartmentName,
          s.SubjectName,
          p.PurposeName
        FROM PhotocopyRequests r
        LEFT JOIN Users u 
          ON r.TeacherId = u.UserId
        LEFT JOIN Departments d 
          ON r.DepartmentId = d.DepartmentId
        LEFT JOIN Subjects s 
          ON r.SubjectId = s.SubjectId
        LEFT JOIN Purposes p 
          ON r.PurposeId = p.PurposeId
        WHERE r.RequestId = @requestId
      `);

    const request = requestResult.recordset[0];

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    const approvalResult = await pool
      .request()
      .input("requestId", sql.Int, requestId)
      .query(`
        SELECT
          a.ApprovalId,
          a.RequestId,
          a.ApproverId,
          u.FullName AS ApproverName,
          a.ApprovalRole,
          a.ApprovalStatus,
          a.Remarks,
          a.ActionDate
        FROM RequestApprovals a
        LEFT JOIN Users u 
          ON a.ApproverId = u.UserId
        WHERE a.RequestId = @requestId
        ORDER BY a.ActionDate ASC
      `);

    const attachmentResult = await pool
      .request()
      .input("requestId", sql.Int, requestId)
      .query(`
        SELECT *
        FROM RequestAttachments
        WHERE RequestId = @requestId
        ORDER BY UploadedAt ASC
      `);

    return res.status(200).json({
      request,
      approvals: approvalResult.recordset,
      attachments: attachmentResult.recordset,
    });
  } catch (error) {
    console.error("Get Request By ID Error:", error);

    return res.status(500).json({
      message: "Server error while fetching request details",
      error: error.message,
    });
  }
};

/**
 * @desc    Get logged-in teacher dashboard stats
 * @route   GET /api/requests/dashboard
 * @access  Private - Teacher / SuperAdmin
 */
const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const pool = await poolPromise;

    const statsResult = await pool
      .request()
      .input("teacherId", sql.Int, teacherId)
      .query(`
        SELECT
          COUNT(*) AS TotalRequests,
          ISNULL(SUM(TotalSheets), 0) AS TotalSheets,
          ISNULL(SUM(TotalPages), 0) AS TotalPages,
          SUM(CASE WHEN Status = 'Pending' THEN 1 ELSE 0 END) AS PendingRequests,
          SUM(CASE WHEN Status LIKE 'Approved%' THEN 1 ELSE 0 END) AS ApprovedRequests,
          SUM(CASE WHEN Status LIKE 'Rejected%' THEN 1 ELSE 0 END) AS RejectedRequests,
          SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) AS CompletedRequests
        FROM PhotocopyRequests
        WHERE TeacherId = @teacherId
      `);

    const recentResult = await pool
      .request()
      .input("teacherId", sql.Int, teacherId)
      .query(`
        SELECT TOP 5
          r.RequestId,
          r.RequestNumber,
          r.Copies,
          r.TotalPages,
          r.TotalSheets,
          r.PriorityLevel,
          r.Status,
          r.SubmittedAt,
          d.DepartmentName,
          s.SubjectName,
          p.PurposeName
        FROM PhotocopyRequests r
        LEFT JOIN Departments d ON r.DepartmentId = d.DepartmentId
        LEFT JOIN Subjects s ON r.SubjectId = s.SubjectId
        LEFT JOIN Purposes p ON r.PurposeId = p.PurposeId
        WHERE r.TeacherId = @teacherId
        ORDER BY r.SubmittedAt DESC
      `);

    const purposeResult = await pool
      .request()
      .input("teacherId", sql.Int, teacherId)
      .query(`
        SELECT
          ISNULL(p.PurposeName, 'Unknown') AS name,
          COUNT(r.RequestId) AS value
        FROM PhotocopyRequests r
        LEFT JOIN Purposes p ON r.PurposeId = p.PurposeId
        WHERE r.TeacherId = @teacherId
        GROUP BY p.PurposeName
        ORDER BY value DESC
      `);

    const monthlyUsageResult = await pool
      .request()
      .input("teacherId", sql.Int, teacherId)
      .query(`
        SELECT
          FORMAT(SubmittedAt, 'MMM') AS month,
          MONTH(SubmittedAt) AS monthNumber,
          ISNULL(SUM(TotalPages), 0) AS pages,
          ISNULL(SUM(TotalSheets), 0) AS sheets
        FROM PhotocopyRequests
        WHERE TeacherId = @teacherId
        GROUP BY FORMAT(SubmittedAt, 'MMM'), MONTH(SubmittedAt)
        ORDER BY monthNumber ASC
      `);

    const purposeTrendResult = await pool
      .request()
      .input("teacherId", sql.Int, teacherId)
      .query(`
        SELECT
          FORMAT(r.SubmittedAt, 'MMM') AS month,
          MONTH(r.SubmittedAt) AS monthNumber,
          LOWER(REPLACE(ISNULL(p.PurposeName, 'others'), ' ', '')) AS purposeKey,
          COUNT(r.RequestId) AS requestCount
        FROM PhotocopyRequests r
        LEFT JOIN Purposes p ON r.PurposeId = p.PurposeId
        WHERE r.TeacherId = @teacherId
        GROUP BY
          FORMAT(r.SubmittedAt, 'MMM'),
          MONTH(r.SubmittedAt),
          LOWER(REPLACE(ISNULL(p.PurposeName, 'others'), ' ', ''))
        ORDER BY monthNumber ASC
      `);

    return res.status(200).json({
      stats: statsResult.recordset[0],
      recentRequests: recentResult.recordset,
      purposeBreakdown: purposeResult.recordset,
      monthlyUsage: monthlyUsageResult.recordset,
      purposeTrend: purposeTrendResult.recordset,
    });
  } catch (error) {
    console.error("Get Teacher Dashboard Error:", error);

    return res.status(500).json({
      message: "Server error while fetching teacher dashboard",
      error: error.message,
    });
  }
};

/**
 * @desc    Cancel teacher request before printing starts
 * @route   PUT /api/requests/:id/cancel
 * @access  Private - Teacher
 */
const cancelMyRequest = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const requestId = req.params.id;
    const { remarks } = req.body || {};

    const pool = await poolPromise;

    // ============================================
    // Check request ownership
    // ============================================
    const requestResult = await pool
      .request()
      .input("requestId", sql.Int, requestId)
      .input("teacherId", sql.Int, teacherId)
      .query(`
        SELECT RequestId, Status
        FROM PhotocopyRequests
        WHERE RequestId = @requestId
          AND TeacherId = @teacherId
      `);

    if (requestResult.recordset.length === 0) {
      return res.status(404).json({
        message: "Request not found or does not belong to this teacher.",
      });
    }

    const request = requestResult.recordset[0];

    // ============================================
    // Allowed cancellation statuses
    // Teacher can cancel before actual printing starts
    // ============================================
    const cancellableStatuses = [
      "Pending",
      "Approved by HOD",
      "Forwarded to HOS",
      "Pending HOS Approval",
      "Approved by HOS",
      "Forwarded to Printing",
    ];

    if (!cancellableStatuses.includes(request.Status)) {
      return res.status(400).json({
        message: `Request cannot be cancelled because it is already ${request.Status}.`,
      });
    }

    // ============================================
    // Cancel request and remove active approver
    // This removes it from HOD/HOS/Printing queues
    // ============================================
    await pool
      .request()
      .input("requestId", sql.Int, requestId)
      .input("remarks", sql.NVarChar, remarks || "Cancelled by teacher")
      .query(`
        UPDATE PhotocopyRequests
        SET
          Status = 'Cancelled by Teacher',
          CurrentApproverId = NULL,
          Remarks = CASE
            WHEN Remarks IS NULL OR Remarks = ''
            THEN @remarks
            ELSE Remarks + CHAR(13) + CHAR(10) + @remarks
          END
        WHERE RequestId = @requestId
      `);

    return res.status(200).json({
      success: true,
      message: "Request cancelled successfully.",
    });
  } catch (error) {
    console.error("Cancel Teacher Request Error:", error);

    return res.status(500).json({
      message: "Server error while cancelling request.",
      error: error.message,
    });
  }
};

// ============================================
// Get logged-in user's uploaded attachments
// Used by modern Attachments page
// GET /api/requests/attachments
// ============================================

const getMyAttachments = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role || req.user.Role;

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("userRole", sql.NVarChar, userRole)
      .query(`
        SELECT
          a.AttachmentId,
          a.RequestId,
          a.OriginalFileName,
          a.FilePath,
          a.FileType,
          a.FileSizeKB,
          a.PageCount,
          a.UploadedAt,

          r.RequestNumber,
          r.Status,
          r.TotalPages,
          r.TotalSheets,
          r.Copies,
          r.PriorityLevel,
          r.SubmittedAt,

          p.PurposeName,
          s.SubjectName,
          d.DepartmentName,

          u.FullName AS TeacherName,
          u.EmployeeId

        FROM RequestAttachments a
        INNER JOIN PhotocopyRequests r
          ON a.RequestId = r.RequestId
        LEFT JOIN Purposes p
          ON r.PurposeId = p.PurposeId
        LEFT JOIN Subjects s
          ON r.SubjectId = s.SubjectId
        LEFT JOIN Departments d
          ON r.DepartmentId = d.DepartmentId
        LEFT JOIN Users u
          ON r.TeacherId = u.UserId

        WHERE
          (
            @userRole = 'SuperAdmin'
            OR r.TeacherId = @userId
          )

        ORDER BY a.UploadedAt DESC
      `);

    return res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Get My Attachments Error:", error);

    return res.status(500).json({
      message: "Server error while fetching attachments",
      error: error.message,
    });
  }
};

module.exports = {
  createRequest,
  getTeacherDashboard,
  getMyRequests,
  getRequestById,
  getMyAttachments,
  cancelMyRequest,
};
