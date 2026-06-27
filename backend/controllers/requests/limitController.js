// ============================================
// ARAB UNITY SCHOOL
// Print Limit Controller
// Handles department limits and subject/HOD limits
// ============================================

const { poolPromise, sql } = require("../../config/db");

// ============================================
// Helper: get current month/year if not provided
// ============================================
const getMonthYear = (month, year) => {
  const now = new Date();

  return {
    monthNumber: Number(month) || now.getMonth() + 1,
    yearNumber: Number(year) || now.getFullYear(),
  };
};

/**
 * @desc    Get department limits with usage and remaining balance
 * @route   GET /api/limits/departments?month=6&year=2026
 * @access  Private - PrintingAdmin / SuperAdmin / HOS
 */
const getDepartmentLimits = async (req, res) => {
  try {
    const { monthNumber, yearNumber } = getMonthYear(
      req.query.month,
      req.query.year
    );

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("monthNumber", sql.Int, monthNumber)
      .input("yearNumber", sql.Int, yearNumber)
      .query(`
        SELECT
          d.DepartmentId,
          d.DepartmentName,

          ISNULL(dpl.DepartmentLimitId, 0) AS DepartmentLimitId,
          ISNULL(dpl.SheetLimit, 0) AS SheetLimit,

          ISNULL(u.UsedSheets, 0) AS UsedSheets,

          ISNULL(dpl.SheetLimit, 0) - ISNULL(u.UsedSheets, 0) AS RemainingSheets,

          @monthNumber AS MonthNumber,
          @yearNumber AS YearNumber

        FROM Departments d

        LEFT JOIN DepartmentPrintLimits dpl
          ON d.DepartmentId = dpl.DepartmentId
         AND dpl.MonthNumber = @monthNumber
         AND dpl.YearNumber = @yearNumber

        LEFT JOIN vw_DepartmentMonthlyUsage u
          ON d.DepartmentId = u.DepartmentId
         AND u.MonthNumber = @monthNumber
         AND u.YearNumber = @yearNumber

        WHERE d.IsActive = 1

        ORDER BY d.DepartmentName ASC
      `);

    return res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Get Department Limits Error:", error);

    return res.status(500).json({
      message: "Server error while fetching department limits",
      error: error.message,
    });
  }
};

/**
 * @desc    Create or update department monthly limit
 * @route   PUT /api/limits/departments/:departmentId
 * @access  Private - PrintingAdmin / SuperAdmin
 */
const upsertDepartmentLimit = async (req, res) => {
  try {
    const createdBy = req.user.id;
    const departmentId = Number(req.params.departmentId);

    const { sheetLimit, month, year } = req.body;

    const { monthNumber, yearNumber } = getMonthYear(month, year);

    if (!departmentId || !sheetLimit || Number(sheetLimit) < 0) {
      return res.status(400).json({
        message: "Department ID and valid sheet limit are required.",
      });
    }

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("departmentId", sql.Int, departmentId)
      .input("monthNumber", sql.Int, monthNumber)
      .input("yearNumber", sql.Int, yearNumber)
      .input("sheetLimit", sql.Int, Number(sheetLimit))
      .input("createdBy", sql.Int, createdBy)
      .query(`
        MERGE DepartmentPrintLimits AS target
        USING (
          SELECT
            @departmentId AS DepartmentId,
            @monthNumber AS MonthNumber,
            @yearNumber AS YearNumber
        ) AS source
        ON target.DepartmentId = source.DepartmentId
          AND target.MonthNumber = source.MonthNumber
          AND target.YearNumber = source.YearNumber

        WHEN MATCHED THEN
          UPDATE SET
            SheetLimit = @sheetLimit,
            UpdatedAt = GETDATE()

        WHEN NOT MATCHED THEN
          INSERT
          (
            DepartmentId,
            MonthNumber,
            YearNumber,
            SheetLimit,
            CreatedBy,
            CreatedAt
          )
          VALUES
          (
            @departmentId,
            @monthNumber,
            @yearNumber,
            @sheetLimit,
            @createdBy,
            GETDATE()
          )

        OUTPUT inserted.*;
      `);

    return res.status(200).json({
      success: true,
      message: "Department print limit saved successfully.",
      data: result.recordset[0],
    });
  } catch (error) {
    console.error("Upsert Department Limit Error:", error);

    return res.status(500).json({
      message: "Server error while saving department limit",
      error: error.message,
    });
  }
};

/**
 * @desc    Get subject/HOD limits with usage and remaining balance
 * @route   GET /api/limits/subjects?departmentId=1&month=6&year=2026
 * @access  Private - HOS / PrintingAdmin / SuperAdmin
 */
const getSubjectLimits = async (req, res) => {
  try {
    const { monthNumber, yearNumber } = getMonthYear(
      req.query.month,
      req.query.year
    );

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
      .input("monthNumber", sql.Int, monthNumber)
      .input("yearNumber", sql.Int, yearNumber)
      .query(`
        SELECT
          s.SubjectId,
          s.SubjectName,

          d.DepartmentId,
          d.DepartmentName,

          ISNULL(spl.SubjectLimitId, 0) AS SubjectLimitId,
          ISNULL(spl.SheetLimit, 0) AS SheetLimit,

          ISNULL(u.UsedSheets, 0) AS UsedSheets,

          ISNULL(spl.SheetLimit, 0) - ISNULL(u.UsedSheets, 0) AS RemainingSheets,

          -- ============================================
          -- Auto-detect HOD from Users table
          -- If SubjectPrintLimits already has HodUserId, use that.
          -- If not, use the HOD assigned to this department + subject.
          -- ============================================
          COALESCE(spl.HodUserId, assignedHod.UserId) AS HodUserId,
          assignedHod.FullName AS HodName,
          assignedHod.EmployeeId AS HodEmployeeId,

          dpl.DepartmentLimitId,
          ISNULL(dpl.SheetLimit, 0) AS DepartmentSheetLimit,

          @monthNumber AS MonthNumber,
          @yearNumber AS YearNumber

        FROM Subjects s

        CROSS JOIN Departments d

        LEFT JOIN DepartmentPrintLimits dpl
          ON d.DepartmentId = dpl.DepartmentId
         AND dpl.MonthNumber = @monthNumber
         AND dpl.YearNumber = @yearNumber

        LEFT JOIN SubjectPrintLimits spl
          ON s.SubjectId = spl.SubjectId
         AND spl.DepartmentId = d.DepartmentId
         AND spl.MonthNumber = @monthNumber
         AND spl.YearNumber = @yearNumber

        LEFT JOIN vw_SubjectMonthlyUsage u
          ON s.SubjectId = u.SubjectId
         AND u.DepartmentId = d.DepartmentId
         AND u.MonthNumber = @monthNumber
         AND u.YearNumber = @yearNumber

        OUTER APPLY (
          SELECT TOP 1
            hod.UserId,
            hod.FullName,
            hod.EmployeeId
          FROM Users hod
          WHERE hod.Role = 'HOD'
            AND hod.IsActive = 1
            AND hod.DepartmentId = d.DepartmentId
            AND hod.Subject = s.SubjectName
          ORDER BY hod.UserId ASC
        ) assignedHod

        WHERE s.IsActive = 1
          AND d.DepartmentId = @departmentId
          AND d.IsActive = 1

        ORDER BY s.SubjectName ASC
      `);

    return res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Get Subject Limits Error:", error);

    return res.status(500).json({
      message: "Server error while fetching subject limits",
      error: error.message,
    });
  }
};

/**
 * @desc    Create or update subject/HOD monthly limit
 * @route   PUT /api/limits/subjects/:subjectId
 * @access  Private - HOS / SuperAdmin
 */
const upsertSubjectLimit = async (req, res) => {
  try {
    const createdBy = req.user.id;
    const subjectId = Number(req.params.subjectId);

    const {
      departmentId,
      hodUserId,
      sheetLimit,
      month,
      year,
    } = req.body;

    const { monthNumber, yearNumber } = getMonthYear(month, year);

   // Allow 0 quota, but block empty/invalid/negative values
    if (
      !departmentId ||
      !subjectId ||
      sheetLimit === undefined ||
      sheetLimit === null ||
      Number(sheetLimit) < 0
    ) {
          return res.status(400).json({
        message:
          "Department ID, Subject ID, and valid sheet limit are required.",
      });
    }

    const pool = await poolPromise;

    // Get department limit first
    const departmentLimitResult = await pool
      .request()
      .input("departmentId", sql.Int, Number(departmentId))
      .input("monthNumber", sql.Int, monthNumber)
      .input("yearNumber", sql.Int, yearNumber)
      .query(`
        SELECT DepartmentLimitId, SheetLimit
        FROM DepartmentPrintLimits
        WHERE DepartmentId = @departmentId
          AND MonthNumber = @monthNumber
          AND YearNumber = @yearNumber
      `);

    if (departmentLimitResult.recordset.length === 0) {
      return res.status(400).json({
        message:
          "Department limit must be created before assigning subject limits.",
      });
    }

    const departmentLimit =
      departmentLimitResult.recordset[0];

    // Check total distributed subject limits
    const totalResult = await pool
      .request()
      .input("departmentId", sql.Int, Number(departmentId))
      .input("subjectId", sql.Int, subjectId)
      .input("monthNumber", sql.Int, monthNumber)
      .input("yearNumber", sql.Int, yearNumber)
      .query(`
        SELECT ISNULL(SUM(SheetLimit), 0) AS OtherSubjectLimits
        FROM SubjectPrintLimits
        WHERE DepartmentId = @departmentId
          AND MonthNumber = @monthNumber
          AND YearNumber = @yearNumber
          AND SubjectId <> @subjectId
      `);

    const otherSubjectLimits =
      totalResult.recordset[0].OtherSubjectLimits || 0;

    const newTotal =
      otherSubjectLimits + Number(sheetLimit);

    if (newTotal > departmentLimit.SheetLimit) {
      return res.status(400).json({
        message:
          "Subject limits cannot exceed the department monthly limit.",
        departmentLimit: departmentLimit.SheetLimit,
        alreadyDistributed: otherSubjectLimits,
        requestedSubjectLimit: Number(sheetLimit),
        newTotal,
      });
    }

    const result = await pool
      .request()
      .input(
        "departmentLimitId",
        sql.Int,
        departmentLimit.DepartmentLimitId
      )
      .input("departmentId", sql.Int, Number(departmentId))
      .input("subjectId", sql.Int, subjectId)
      .input("hodUserId", sql.Int, hodUserId || null)
      .input("monthNumber", sql.Int, monthNumber)
      .input("yearNumber", sql.Int, yearNumber)
      .input("sheetLimit", sql.Int, Number(sheetLimit))
      .input("createdBy", sql.Int, createdBy)
      .query(`
        MERGE SubjectPrintLimits AS target
        USING (
          SELECT
            @departmentId AS DepartmentId,
            @subjectId AS SubjectId,
            @monthNumber AS MonthNumber,
            @yearNumber AS YearNumber
        ) AS source
        ON target.DepartmentId = source.DepartmentId
          AND target.SubjectId = source.SubjectId
          AND target.MonthNumber = source.MonthNumber
          AND target.YearNumber = source.YearNumber

        WHEN MATCHED THEN
          UPDATE SET
            DepartmentLimitId = @departmentLimitId,
            HodUserId = @hodUserId,
            SheetLimit = @sheetLimit,
            UpdatedAt = GETDATE()

        WHEN NOT MATCHED THEN
          INSERT
          (
            DepartmentLimitId,
            DepartmentId,
            SubjectId,
            HodUserId,
            MonthNumber,
            YearNumber,
            SheetLimit,
            CreatedBy,
            CreatedAt
          )
          VALUES
          (
            @departmentLimitId,
            @departmentId,
            @subjectId,
            @hodUserId,
            @monthNumber,
            @yearNumber,
            @sheetLimit,
            @createdBy,
            GETDATE()
          )

        OUTPUT inserted.*;
      `);

    return res.status(200).json({
      success: true,
      message: "Subject print limit saved successfully.",
      data: result.recordset[0],
    });
  } catch (error) {
    console.error("Upsert Subject Limit Error:", error);

    return res.status(500).json({
      message: "Server error while saving subject limit",
      error: error.message,
    });
  }
};

module.exports = {
  getDepartmentLimits,
  upsertDepartmentLimit,
  getSubjectLimits,
  upsertSubjectLimit,
};
