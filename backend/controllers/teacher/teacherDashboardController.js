// ============================================
// ARAB UNITY SCHOOL
// Teacher Dashboard Controller
//
// Handles:
// 1. Teacher KPI totals
// 2. Current month vs previous month trends
// 3. Sparkline mini chart data
// 4. Attachment summary
// 5. Purpose breakdown
//
// Route:
// GET /api/teacher/dashboard/kpis
// ============================================

const { poolPromise, sql } = require("../../config/db");

// ============================================
// Calculate Trend
// Compares current month vs previous month
// ============================================
const calculateTrend = (current, previous) => {
  current = Number(current || 0);
  previous = Number(previous || 0);

  if (previous === 0 && current === 0) {
    return {
      percent: 0,
      direction: "up",
    };
  }

  if (previous === 0 && current > 0) {
    return {
      percent: 100,
      direction: "up",
    };
  }

  const change = ((current - previous) / previous) * 100;

  return {
    percent: Math.abs(Math.round(change)),
    direction: change >= 0 ? "up" : "down",
  };
};

// ============================================
// Shared KPI SQL
// Used for total, current month, and previous month
// ============================================
const kpiSelectSql = `
  SELECT
    COUNT(*) AS totalRequests,

    ISNULL(SUM(TotalSheets), 0) AS totalSheets,

    ISNULL(SUM(TotalPages), 0) AS totalPages,

    SUM(
      CASE
        WHEN Status IN (
          'Submitted',
          'Pending HOD Approval',
          'Pending HOS Approval',
          'Forwarded to HOD',
          'Forwarded to HOS',
          'Printing'
        )
        THEN 1
        ELSE 0
      END
    ) AS pendingRequests,

    SUM(
      CASE
        WHEN Status IN (
          'Approved by HOD',
          'Approved by HOS'
        )
        THEN 1
        ELSE 0
      END
    ) AS approvedRequests,

    SUM(
      CASE
        WHEN Status IN (
          'Rejected by HOD',
          'Rejected by HOS'
        )
        THEN 1
        ELSE 0
      END
    ) AS rejectedRequests,

    SUM(
      CASE
        WHEN Status = 'Completed'
        THEN 1
        ELSE 0
      END
    ) AS completedRequests

  FROM PhotocopyRequests
  WHERE TeacherId = @teacherId
`;

// ============================================
// Convert Sparkline Query Result
// Recharts expects [{ value: number }]
// ============================================
const mapSparkline = (rows, fieldName) => {
  return rows.map((row) => ({
    value: Number(row[fieldName] || 0),
  }));
};

// ============================================
// Get Teacher Dashboard KPIs
// ============================================
const getTeacherDashboardKpis = async (req, res) => {
  try {
    // Logged-in teacher ID from JWT token
    const teacherId = req.user.id;

    // Connect to MSSQL database
    const pool = await poolPromise;

    // ============================================
    // 1. All-time KPI totals
    // ============================================
    const totalResult = await pool
      .request()
      .input("teacherId", sql.Int, teacherId)
      .query(kpiSelectSql);

    // ============================================
    // 2. Current month KPI totals
    // ============================================
    const currentMonthResult = await pool
      .request()
      .input("teacherId", sql.Int, teacherId)
      .query(`
        ${kpiSelectSql}
          AND SubmittedAt >= DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
          AND SubmittedAt < DATEADD(
            MONTH,
            1,
            DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
          )
      `);

    // ============================================
    // 3. Previous month KPI totals
    // ============================================
    const previousMonthResult = await pool
      .request()
      .input("teacherId", sql.Int, teacherId)
      .query(`
        ${kpiSelectSql}
          AND SubmittedAt >= DATEADD(
            MONTH,
            -1,
            DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
          )
          AND SubmittedAt < DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
      `);

    // ============================================
    // 4. Sparkline Data
    // Last 7 days mini chart for each KPI card
    // ============================================
    const sparklineResult = await pool
      .request()
      .input("teacherId", sql.Int, teacherId)
      .query(`
        SELECT
          CAST(SubmittedAt AS DATE) AS RequestDate,

          COUNT(*) AS totalRequests,

          ISNULL(SUM(TotalSheets), 0) AS totalSheets,

          ISNULL(SUM(TotalPages), 0) AS totalPages,

          SUM(
            CASE
              WHEN Status IN (
                'Submitted',
                'Pending HOD Approval',
                'Pending HOS Approval',
                'Forwarded to HOD',
                'Forwarded to HOS',
                'Printing'
              )
              THEN 1
              ELSE 0
            END
          ) AS pendingRequests,

          SUM(
            CASE
              WHEN Status IN (
                'Approved by HOD',
                'Approved by HOS'
              )
              THEN 1
              ELSE 0
            END
          ) AS approvedRequests,

          SUM(
            CASE
              WHEN Status IN (
                'Rejected by HOD',
                'Rejected by HOS'
              )
              THEN 1
              ELSE 0
            END
          ) AS rejectedRequests,

          SUM(
            CASE
              WHEN Status = 'Completed'
              THEN 1
              ELSE 0
            END
          ) AS completedRequests

        FROM PhotocopyRequests
        WHERE TeacherId = @teacherId
          AND SubmittedAt >= DATEADD(DAY, -6, CAST(GETDATE() AS DATE))
        GROUP BY CAST(SubmittedAt AS DATE)
        ORDER BY RequestDate ASC
      `);

    // ============================================
    // 5. Attachment Summary
    // Counts files uploaded by this teacher
    // ============================================
    const attachmentResult = await pool
      .request()
      .input("teacherId", sql.Int, teacherId)
      .query(`
        SELECT
          COUNT(*) AS totalAttachments,

          ISNULL(SUM(FileSizeKB), 0) AS totalSizeKB,

          ISNULL(MAX(FileSizeKB), 0) AS largestFileKB,

          SUM(
            CASE
              WHEN LOWER(FileName) LIKE '%.pdf'
              THEN 1
              ELSE 0
            END
          ) AS pdfFiles,

          SUM(
            CASE
              WHEN LOWER(FileName) LIKE '%.jpg'
                OR LOWER(FileName) LIKE '%.jpeg'
                OR LOWER(FileName) LIKE '%.png'
                OR LOWER(FileName) LIKE '%.webp'
              THEN 1
              ELSE 0
            END
          ) AS imageFiles,

          SUM(
            CASE
              WHEN LOWER(FileName) LIKE '%.doc'
                OR LOWER(FileName) LIKE '%.docx'
                OR LOWER(FileName) LIKE '%.ppt'
                OR LOWER(FileName) LIKE '%.pptx'
                OR LOWER(FileName) LIKE '%.xls'
                OR LOWER(FileName) LIKE '%.xlsx'
              THEN 1
              ELSE 0
            END
          ) AS documentFiles,

          SUM(
            CASE
              WHEN LOWER(FileName) LIKE '%.zip'
                OR LOWER(FileName) LIKE '%.rar'
                OR LOWER(FileName) LIKE '%.7z'
              THEN 1
              ELSE 0
            END
          ) AS archiveFiles

        FROM RequestAttachments ra
        INNER JOIN PhotocopyRequests pr
          ON ra.RequestId = pr.RequestId
        WHERE pr.TeacherId = @teacherId
      `);

    // ============================================
    // 6. Purpose Breakdown
    // This fixes the frontend issue where purpose name was not showing
    // ============================================
    const purposeBreakdownResult = await pool
      .request()
      .input("teacherId", sql.Int, teacherId)
      .query(`
        SELECT
          p.PurposeName AS purposeName,
          COUNT(pr.RequestId) AS totalRequests
        FROM PhotocopyRequests pr
        INNER JOIN Purposes p
          ON pr.PurposeId = p.PurposeId
        WHERE pr.TeacherId = @teacherId
        GROUP BY p.PurposeName
        ORDER BY totalRequests DESC
      `);

    // ============================================
    // Extract records safely
    // ============================================
    const stats = totalResult.recordset[0] || {};
    const current = currentMonthResult.recordset[0] || {};
    const previous = previousMonthResult.recordset[0] || {};
    const sparkRows = sparklineResult.recordset || [];
    const attachment = attachmentResult.recordset[0] || {};
    const purposeBreakdown = purposeBreakdownResult.recordset || [];

    // Debug purpose breakdown
    console.log("Purpose Breakdown:", purposeBreakdown);

    // ============================================
    // Build Sparkline Response
    // Each KPI card will use its own mini chart
    // ============================================
    const sparklineTrends = {
      totalRequests: mapSparkline(sparkRows, "totalRequests"),
      totalSheets: mapSparkline(sparkRows, "totalSheets"),
      totalPages: mapSparkline(sparkRows, "totalPages"),
      pendingRequests: mapSparkline(sparkRows, "pendingRequests"),
      approvedRequests: mapSparkline(sparkRows, "approvedRequests"),
      rejectedRequests: mapSparkline(sparkRows, "rejectedRequests"),
      completedRequests: mapSparkline(sparkRows, "completedRequests"),
    };

    // ============================================
    // Build Attachment Summary Response
    // totalMB is fixed to 1024 MB for now
    // ============================================
    const attachmentSummary = {
      pdfFiles: attachment.pdfFiles || 0,
      imageFiles: attachment.imageFiles || 0,
      documentFiles: attachment.documentFiles || 0,
      archiveFiles: attachment.archiveFiles || 0,

      usedMB: Math.round((attachment.totalSizeKB || 0) / 1024),
      totalMB: 1024,

      totalAttachments: attachment.totalAttachments || 0,
      largestFileMB: Number(
        ((attachment.largestFileKB || 0) / 1024).toFixed(1)
      ),
    };

    // ============================================
    // Send response to frontend
    // IMPORTANT:
    // purposeBreakdown is now included in the API response
    // ============================================
    res.status(200).json({
      success: true,

      data: {
        totalRequests: stats.totalRequests || 0,
        totalSheets: stats.totalSheets || 0,
        totalPages: stats.totalPages || 0,
        pendingRequests: stats.pendingRequests || 0,
        approvedRequests: stats.approvedRequests || 0,
        rejectedRequests: stats.rejectedRequests || 0,
        completedRequests: stats.completedRequests || 0,
      },

      trends: {
        totalRequests: calculateTrend(
          current.totalRequests,
          previous.totalRequests
        ),

        totalSheets: calculateTrend(
          current.totalSheets,
          previous.totalSheets
        ),

        totalPages: calculateTrend(current.totalPages, previous.totalPages),

        pendingRequests: calculateTrend(
          current.pendingRequests,
          previous.pendingRequests
        ),

        approvedRequests: calculateTrend(
          current.approvedRequests,
          previous.approvedRequests
        ),

        rejectedRequests: calculateTrend(
          current.rejectedRequests,
          previous.rejectedRequests
        ),

        completedRequests: calculateTrend(
          current.completedRequests,
          previous.completedRequests
        ),
      },

      sparklineTrends,

      // This is used by TeacherDashboard.jsx
      purposeBreakdown,

      attachmentSummary,
    });
  } catch (error) {
    console.error("Teacher Dashboard KPI Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load teacher dashboard KPIs",
      error: error.message,
    });
  }
};

// ============================================
// Export Controller
// ============================================
module.exports = {
  getTeacherDashboardKpis,
};