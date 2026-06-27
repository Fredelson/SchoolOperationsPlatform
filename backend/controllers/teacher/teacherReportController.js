// ============================================
// ARAB UNITY SCHOOL
// Teacher Report Controller
// Backend-connected dynamic teacher reports
// ============================================

const { sql, poolPromise } = require("../../config/db");

// ============================================
// Add common inputs for all filtered report queries
// ============================================

const addReportInputs = (request, teacherId, query) => {
  const {
    month = "All",
    status = "All",
    purposeId = "All",
    paperSize = "All",
  } = query;

  return request
    .input("TeacherId", sql.Int, teacherId)
    .input("Month", sql.NVarChar(20), month)
    .input("Status", sql.NVarChar(100), status)
    .input("PurposeId", sql.NVarChar(20), purposeId)
    .input("PaperSize", sql.NVarChar(20), paperSize);
};

// ============================================
// Common report filter
// ============================================

const filterWhere = `
  WHERE PR.TeacherId = @TeacherId
    AND (
      @Month = 'All'
      OR FORMAT(PR.SubmittedAt, 'yyyy-MM') = @Month
    )
    AND (
      @Status = 'All'
      OR PR.Status = @Status
    )
    AND (
      @PurposeId = 'All'
      OR CAST(PR.PurposeId AS NVARCHAR(20)) = @PurposeId
    )
    AND (
      @PaperSize = 'All'
      OR PR.PaperSize = @PaperSize
    )
`;

// ============================================
// GET /api/teacher/reports
// ============================================

const getTeacherReports = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const pool = await poolPromise;

    // KPI summary
    const statsResult = await addReportInputs(
      pool.request(),
      teacherId,
      req.query
    ).query(`
      SELECT
        COUNT(*) AS TotalRequests,
        ISNULL(SUM(PR.TotalSheets), 0) AS TotalSheets,
        ISNULL(SUM(PR.TotalPages), 0) AS TotalPages,
        SUM(CASE WHEN PR.Status LIKE '%Approved%' THEN 1 ELSE 0 END) AS ApprovedRequests,
        SUM(CASE WHEN PR.Status LIKE '%Rejected%' THEN 1 ELSE 0 END) AS RejectedRequests,
        SUM(CASE WHEN PR.Status = 'Completed' THEN 1 ELSE 0 END) AS CompletedRequests,
        SUM(CASE WHEN PR.Status = 'Pending' THEN 1 ELSE 0 END) AS PendingRequests,
        ISNULL(SUM(CASE WHEN PR.PaperSize = 'A4' THEN PR.TotalSheets ELSE 0 END), 0) AS A4Sheets,
        ISNULL(SUM(CASE WHEN PR.PaperSize = 'A3' THEN PR.TotalSheets ELSE 0 END), 0) AS A3Sheets
      FROM PhotocopyRequests PR
      LEFT JOIN Purposes P ON PR.PurposeId = P.PurposeId
      ${filterWhere}
    `);

    // Month dropdown values from real teacher requests
    const monthsResult = await pool
      .request()
      .input("TeacherId", sql.Int, teacherId)
      .query(`
        SELECT DISTINCT
          FORMAT(SubmittedAt, 'yyyy-MM') AS value,
          FORMAT(SubmittedAt, 'MMM yyyy') AS label
        FROM PhotocopyRequests
        WHERE TeacherId = @TeacherId
        ORDER BY value DESC
      `);

    // Status dropdown values from real teacher requests
    const statusesResult = await pool
      .request()
      .input("TeacherId", sql.Int, teacherId)
      .query(`
        SELECT DISTINCT
          Status AS value
        FROM PhotocopyRequests
        WHERE TeacherId = @TeacherId
          AND Status IS NOT NULL
        ORDER BY Status ASC
      `);

    // Paper size dropdown values from real teacher requests
    const paperSizesResult = await pool
      .request()
      .input("TeacherId", sql.Int, teacherId)
      .query(`
        SELECT DISTINCT
          PaperSize AS value
        FROM PhotocopyRequests
        WHERE TeacherId = @TeacherId
          AND PaperSize IS NOT NULL
        ORDER BY PaperSize ASC
      `);

    // Sheets and pages trend
    const monthlyTrendResult = await addReportInputs(
      pool.request(),
      teacherId,
      req.query
    ).query(`
      SELECT
        FORMAT(PR.SubmittedAt, 'MMM') AS month,
        MIN(MONTH(PR.SubmittedAt)) AS monthNumber,
        ISNULL(SUM(PR.TotalSheets), 0) AS sheets,
        ISNULL(SUM(PR.TotalPages), 0) AS pages
      FROM PhotocopyRequests PR
      LEFT JOIN Purposes P ON PR.PurposeId = P.PurposeId
      ${filterWhere}
      GROUP BY FORMAT(PR.SubmittedAt, 'MMM')
      ORDER BY monthNumber ASC
    `);

    // Status overview
    const statusSummaryResult = await addReportInputs(
      pool.request(),
      teacherId,
      req.query
    ).query(`
      SELECT
        PR.Status AS status,
        COUNT(*) AS requests
      FROM PhotocopyRequests PR
      LEFT JOIN Purposes P ON PR.PurposeId = P.PurposeId
      ${filterWhere}
      GROUP BY PR.Status
      ORDER BY requests DESC
    `);

    // Daily request activity
    const activityResult = await addReportInputs(
      pool.request(),
      teacherId,
      req.query
    ).query(`
      SELECT
        FORMAT(PR.SubmittedAt, 'MMM d') AS day,
        CAST(PR.SubmittedAt AS DATE) AS sortDate,
        COUNT(*) AS requests
      FROM PhotocopyRequests PR
      LEFT JOIN Purposes P ON PR.PurposeId = P.PurposeId
      ${filterWhere}
      GROUP BY FORMAT(PR.SubmittedAt, 'MMM d'), CAST(PR.SubmittedAt AS DATE)
      ORDER BY sortDate ASC
    `);

    // Purpose breakdown
    const purposeBreakdownResult = await addReportInputs(
      pool.request(),
      teacherId,
      req.query
    ).query(`
      SELECT
        ISNULL(P.PurposeName, 'Unknown') AS name,
        COUNT(*) AS requests,
        ISNULL(SUM(PR.TotalSheets), 0) AS sheets
      FROM PhotocopyRequests PR
      LEFT JOIN Purposes P ON PR.PurposeId = P.PurposeId
      ${filterWhere}
      GROUP BY P.PurposeName
      ORDER BY sheets DESC
    `);

    // Paper usage split
    const paperUsageResult = await addReportInputs(
      pool.request(),
      teacherId,
      req.query
    ).query(`
      SELECT
        ISNULL(PR.PaperSize, 'Unknown') AS paperSize,
        ISNULL(SUM(PR.TotalSheets), 0) AS sheets
      FROM PhotocopyRequests PR
      LEFT JOIN Purposes P ON PR.PurposeId = P.PurposeId
      ${filterWhere}
      GROUP BY PR.PaperSize
      ORDER BY sheets DESC
    `);

    // Detailed request records
    const requestsResult = await addReportInputs(
      pool.request(),
      teacherId,
      req.query
    ).query(`
      SELECT TOP 100
        PR.RequestId,
        PR.RequestNumber,
        PR.SubmittedAt,
        ISNULL(P.PurposeName, '-') AS PurposeName,
        PR.PaperSize,
        PR.TotalSheets,
        PR.TotalPages,
        PR.Status
      FROM PhotocopyRequests PR
      LEFT JOIN Purposes P ON PR.PurposeId = P.PurposeId
      ${filterWhere}
      ORDER BY PR.SubmittedAt DESC
    `);

    // Highest usage month
    const highestMonthResult = await addReportInputs(
      pool.request(),
      teacherId,
      req.query
    ).query(`
      SELECT TOP 1
        FORMAT(PR.SubmittedAt, 'MMM yyyy') AS month,
        ISNULL(SUM(PR.TotalSheets), 0) AS sheets
      FROM PhotocopyRequests PR
      LEFT JOIN Purposes P ON PR.PurposeId = P.PurposeId
      ${filterWhere}
      GROUP BY FORMAT(PR.SubmittedAt, 'MMM yyyy'), YEAR(PR.SubmittedAt), MONTH(PR.SubmittedAt)
      ORDER BY sheets DESC
    `);

    const stats = statsResult.recordset[0] || {};
    const totalSheets = Number(stats.TotalSheets || 0);
    const totalRequests = Number(stats.TotalRequests || 0);
    const a4Sheets = Number(stats.A4Sheets || 0);
    const a3Sheets = Number(stats.A3Sheets || 0);

    const purposeBreakdown = purposeBreakdownResult.recordset.map((item) => ({
      name: item.name,
      requests: Number(item.requests || 0),
      sheets: Number(item.sheets || 0),
      value: Number(item.sheets || 0),
      percentage:
        totalSheets > 0
          ? Number(((Number(item.sheets || 0) / totalSheets) * 100).toFixed(1))
          : 0,
    }));

    const paperUsage = paperUsageResult.recordset.map((item) => ({
      paperSize: item.paperSize,
      sheets: Number(item.sheets || 0),
      percentage:
        totalSheets > 0
          ? Number(((Number(item.sheets || 0) / totalSheets) * 100).toFixed(1))
          : 0,
    }));

    return res.json({
      filters: {
        months: monthsResult.recordset,
        statuses: statusesResult.recordset,
        paperSizes: paperSizesResult.recordset,
      },
      stats,
      monthlyTrend: monthlyTrendResult.recordset,
      statusSummary: statusSummaryResult.recordset,
      activityTimeline: activityResult.recordset,
      purposeBreakdown,
      paperUsage,
      insights: {
        highestUsageMonth: highestMonthResult.recordset[0] || null,
        averageSheetsPerRequest:
          totalRequests > 0
            ? Number((totalSheets / totalRequests).toFixed(2))
            : 0,
        mostCommonPaperSize: a4Sheets >= a3Sheets ? "A4" : "A3",
      },
      requests: requestsResult.recordset,
    });
  } catch (error) {
    console.error("Teacher Reports Error:", error);

    return res.status(500).json({
      message: "Server error while loading teacher reports",
      error: error.message,
    });
  }
};

module.exports = {
  getTeacherReports,
};
