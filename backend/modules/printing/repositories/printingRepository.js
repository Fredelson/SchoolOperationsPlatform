const { poolPromise, sql } = require("../../../config/db");

const {
  PRINTING_QUEUE_STATUSES,
  PRINTING_START_ALLOWED_STATUSES,
  PRINTING_STATUSES,
} = require("../constants/printingStatuses");

const request = (transaction) => new sql.Request(transaction);
const toSqlList = (values) =>
  values.map((value) => `'${String(value).replace(/'/g, "''")}'`).join(", ");

const QUEUE_STATUSES_SQL = toSqlList(PRINTING_QUEUE_STATUSES);
const START_STATUSES_SQL = toSqlList(PRINTING_START_ALLOWED_STATUSES);

const PRINTING_REQUEST_SELECT = `
  printingRequest.RequestId,
  printingRequest.RequestNumber,
  printingRequest.TeacherId,
  printingRequest.DepartmentId,
  printingRequest.SectionId,
  printingRequest.SubjectId,
  printingRequest.PurposeId,
  printingRequest.Copies,
  printingRequest.TotalPages,
  printingRequest.TotalSheets,
  printingRequest.PriorityLevel,
  printingRequest.Status,
  printingRequest.CurrentApproverId,
  printingRequest.ClaimedByUserId,
  printingRequest.ClaimedAt,
  printingRequest.WorkflowVersion,
  printingRequest.PaperSize,
  printingRequest.PrintType,
  printingRequest.PrintSide,
  printingRequest.IsExam,
  printingRequest.DueDate,
  printingRequest.Remarks AS RequestRemarks,
  printingRequest.SubmittedAt,
  printingRequest.ApprovedAt,
  printingRequest.PrintedAt,
  printingRequest.CompletedAt,
  printingRequest.UpdatedAt,
  requester.FullName AS TeacherName,
  requester.EmployeeId AS TeacherEmployeeId,
  requester.SchoolEmail AS TeacherEmail,
  department.DepartmentName,
  sectionRecord.SectionName,
  subject.SubjectName,
  purpose.PurposeName,
  claimedBy.FullName AS ClaimedByName
`;

const beginTransaction = async () => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  return transaction;
};

const getDashboardKpis = async (schoolId, operatorId) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("SchoolId", sql.Int, schoolId)
    .input("OperatorId", sql.Int, operatorId)
    .query(`
      SELECT
        SUM(CASE WHEN Status IN (${START_STATUSES_SQL}) THEN 1 ELSE 0 END) AS PendingJobs,
        SUM(CASE
          WHEN Status = '${PRINTING_STATUSES.PRINTING}'
           AND (ClaimedByUserId = @OperatorId OR CurrentApproverId = @OperatorId)
          THEN 1 ELSE 0
        END) AS PrintingNow,
        SUM(CASE
          WHEN Status = '${PRINTING_STATUSES.ON_HOLD}'
           AND (ClaimedByUserId = @OperatorId OR CurrentApproverId = @OperatorId)
          THEN 1 ELSE 0
        END) AS OnHoldJobs,
        SUM(CASE
          WHEN Status = '${PRINTING_STATUSES.COMPLETED}'
           AND CAST(CompletedAt AS date) = CAST(GETDATE() AS date)
          THEN 1 ELSE 0
        END) AS CompletedToday,
        SUM(CASE
          WHEN Status = '${PRINTING_STATUSES.COMPLETED}'
           AND MONTH(CompletedAt) = MONTH(GETDATE())
           AND YEAR(CompletedAt) = YEAR(GETDATE())
          THEN 1 ELSE 0
        END) AS CompletedMonth,
        SUM(CASE
          WHEN Status IN (${QUEUE_STATUSES_SQL})
           AND DueDate IS NOT NULL
           AND DueDate < GETDATE()
          THEN 1 ELSE 0
        END) AS OverdueJobs
      FROM dbo.PhotocopyRequests
      WHERE IsDeleted = 0
        AND (SchoolId = @SchoolId OR SchoolId IS NULL);
    `);

  return result.recordset[0] || {};
};

const getDashboardInventory = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT InventoryId, PaperType, CurrentStock, LastUpdated
    FROM dbo.PaperInventory
    ORDER BY PaperType;
  `);
  return result.recordset;
};

const getDashboardJobStatus = async (schoolId) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("SchoolId", sql.Int, schoolId)
    .query(`
      SELECT
        SUM(CASE WHEN Status IN (${START_STATUSES_SQL}) THEN 1 ELSE 0 END) AS Pending,
        SUM(CASE WHEN Status = '${PRINTING_STATUSES.PRINTING}' THEN 1 ELSE 0 END) AS Printing,
        SUM(CASE WHEN Status = '${PRINTING_STATUSES.ON_HOLD}' THEN 1 ELSE 0 END) AS OnHold,
        SUM(CASE WHEN Status = '${PRINTING_STATUSES.COMPLETED}' THEN 1 ELSE 0 END) AS Completed,
        SUM(CASE WHEN Status LIKE 'Rejected by %' THEN 1 ELSE 0 END) AS Rejected,
        SUM(CASE WHEN Status LIKE 'Cancelled%' THEN 1 ELSE 0 END) AS Cancelled
      FROM dbo.PhotocopyRequests
      WHERE IsDeleted = 0
        AND (SchoolId = @SchoolId OR SchoolId IS NULL);
    `);
  return result.recordset[0] || {};
};

const getDashboardActivity = async (schoolId) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("SchoolId", sql.Int, schoolId)
    .query(`
      WITH DayOffsets AS (
        SELECT DaysAgo
        FROM (VALUES (6), (5), (4), (3), (2), (1), (0)) offsets(DaysAgo)
      ),
      ActivityDates AS (
        SELECT DATEADD(day, -DaysAgo, CAST(GETDATE() AS date)) AS ActivityDate
        FROM DayOffsets
      )
      SELECT
        activity.ActivityDate,
        SUM(CASE
          WHEN CAST(printingRequest.SubmittedAt AS date) = activity.ActivityDate
          THEN 1 ELSE 0
        END) AS PrintRequests,
        SUM(CASE
          WHEN CAST(printingRequest.CompletedAt AS date) = activity.ActivityDate
          THEN 1 ELSE 0
        END) AS CompletedJobs
      FROM ActivityDates activity
      LEFT JOIN dbo.PhotocopyRequests printingRequest
        ON printingRequest.IsDeleted = 0
       AND (printingRequest.SchoolId = @SchoolId OR printingRequest.SchoolId IS NULL)
       AND (
         CAST(printingRequest.SubmittedAt AS date) = activity.ActivityDate
         OR CAST(printingRequest.CompletedAt AS date) = activity.ActivityDate
       )
      GROUP BY activity.ActivityDate
      ORDER BY activity.ActivityDate;
    `);
  return result.recordset;
};

const getDashboardPaperUsage = async (schoolId) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("SchoolId", sql.Int, schoolId)
    .query(`
      SELECT
        consumption.PaperType,
        SUM(consumption.ActualSheets) AS UsedSheets
      FROM dbo.PrintingJobConsumptions consumption
      JOIN dbo.PhotocopyRequests printingRequest
        ON printingRequest.RequestId = consumption.RequestId
      WHERE (printingRequest.SchoolId = @SchoolId OR printingRequest.SchoolId IS NULL)
        AND MONTH(consumption.RecordedAt) = MONTH(GETDATE())
        AND YEAR(consumption.RecordedAt) = YEAR(GETDATE())
      GROUP BY consumption.PaperType;
    `);
  return result.recordset;
};

const getTopDepartmentsThisMonth = async (schoolId) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("SchoolId", sql.Int, schoolId)
    .query(`
      SELECT TOP 5
        ISNULL(department.DepartmentName, 'No Department') AS label,
        ISNULL(SUM(printingRequest.TotalSheets), 0) AS value
      FROM dbo.PhotocopyRequests printingRequest
      LEFT JOIN dbo.Departments department
        ON department.DepartmentId = printingRequest.DepartmentId
      WHERE printingRequest.IsDeleted = 0
        AND (printingRequest.SchoolId = @SchoolId OR printingRequest.SchoolId IS NULL)
        AND MONTH(printingRequest.SubmittedAt) = MONTH(GETDATE())
        AND YEAR(printingRequest.SubmittedAt) = YEAR(GETDATE())
      GROUP BY department.DepartmentName
      ORDER BY SUM(printingRequest.TotalSheets) DESC;
    `);
  return result.recordset;
};

const getRecentPrintJobs = async (schoolId) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("SchoolId", sql.Int, schoolId)
    .query(`
      SELECT TOP 8
        RequestId,
        RequestNumber,
        Status,
        TotalSheets,
        COALESCE(CompletedAt, PrintedAt, UpdatedAt, SubmittedAt) AS ActivityDate
      FROM dbo.PhotocopyRequests
      WHERE IsDeleted = 0
        AND (SchoolId = @SchoolId OR SchoolId IS NULL)
      ORDER BY COALESCE(CompletedAt, PrintedAt, UpdatedAt, SubmittedAt) DESC;
    `);
  return result.recordset;
};

const getPrintingQueue = async ({
  schoolId,
  operatorId,
  assignmentMode,
}) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("SchoolId", sql.Int, schoolId)
    .input("OperatorId", sql.Int, operatorId)
    .input("SharedQueue", sql.Bit, assignmentMode === "shared")
    .query(`
      SELECT ${PRINTING_REQUEST_SELECT}
      FROM dbo.PhotocopyRequests printingRequest
      LEFT JOIN dbo.Users requester ON requester.UserId = printingRequest.TeacherId
      LEFT JOIN dbo.Departments department
        ON department.DepartmentId = printingRequest.DepartmentId
      LEFT JOIN dbo.Sections sectionRecord
        ON sectionRecord.SectionId = printingRequest.SectionId
      LEFT JOIN dbo.Subjects subject ON subject.SubjectId = printingRequest.SubjectId
      LEFT JOIN dbo.Purposes purpose ON purpose.PurposeId = printingRequest.PurposeId
      LEFT JOIN dbo.Users claimedBy ON claimedBy.UserId = printingRequest.ClaimedByUserId
      WHERE printingRequest.IsDeleted = 0
        AND (printingRequest.SchoolId = @SchoolId OR printingRequest.SchoolId IS NULL)
        AND printingRequest.Status IN (${QUEUE_STATUSES_SQL})
        AND (
          printingRequest.ClaimedByUserId = @OperatorId
          OR printingRequest.CurrentApproverId = @OperatorId
          OR (
            @SharedQueue = 1
            AND printingRequest.ClaimedByUserId IS NULL
            AND printingRequest.CurrentApproverId IS NULL
          )
        )
      ORDER BY
        CASE printingRequest.PriorityLevel
          WHEN 'Urgent' THEN 1
          WHEN 'High' THEN 2
          WHEN 'Normal' THEN 3
          ELSE 4
        END,
        CASE WHEN printingRequest.DueDate IS NULL THEN 1 ELSE 0 END,
        printingRequest.DueDate,
        printingRequest.SubmittedAt;
    `);
  return result.recordset;
};

const getPrintingRequestById = async ({
  requestId,
  schoolId,
  operatorId,
  assignmentMode,
}) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("RequestId", sql.Int, requestId)
    .input("SchoolId", sql.Int, schoolId)
    .input("OperatorId", sql.Int, operatorId)
    .input("SharedQueue", sql.Bit, assignmentMode === "shared")
    .query(`
      SELECT ${PRINTING_REQUEST_SELECT}
      FROM dbo.PhotocopyRequests printingRequest
      LEFT JOIN dbo.Users requester ON requester.UserId = printingRequest.TeacherId
      LEFT JOIN dbo.Departments department
        ON department.DepartmentId = printingRequest.DepartmentId
      LEFT JOIN dbo.Sections sectionRecord
        ON sectionRecord.SectionId = printingRequest.SectionId
      LEFT JOIN dbo.Subjects subject ON subject.SubjectId = printingRequest.SubjectId
      LEFT JOIN dbo.Purposes purpose ON purpose.PurposeId = printingRequest.PurposeId
      LEFT JOIN dbo.Users claimedBy ON claimedBy.UserId = printingRequest.ClaimedByUserId
      WHERE printingRequest.RequestId = @RequestId
        AND printingRequest.IsDeleted = 0
        AND (printingRequest.SchoolId = @SchoolId OR printingRequest.SchoolId IS NULL)
        AND (
          printingRequest.ClaimedByUserId = @OperatorId
          OR printingRequest.CurrentApproverId = @OperatorId
          OR printingRequest.Status = '${PRINTING_STATUSES.COMPLETED}'
          OR (
            @SharedQueue = 1
            AND printingRequest.Status IN (${START_STATUSES_SQL})
            AND printingRequest.ClaimedByUserId IS NULL
            AND printingRequest.CurrentApproverId IS NULL
          )
        );
    `);
  return result.recordset[0] || null;
};

const getQueueRequestForUpdate = async (
  transaction,
  requestId,
  schoolId
) => {
  const result = await request(transaction)
    .input("RequestId", sql.Int, requestId)
    .input("SchoolId", sql.Int, schoolId)
    .query(`
      SELECT *
      FROM dbo.PhotocopyRequests WITH (UPDLOCK, HOLDLOCK)
      WHERE RequestId = @RequestId
        AND IsDeleted = 0
        AND (SchoolId = @SchoolId OR SchoolId IS NULL);
    `);
  return result.recordset[0] || null;
};

const updateQueueState = async (
  transaction,
  {
    requestId,
    status,
    operatorId,
    remarks = null,
    clearClaim = false,
    completed = false,
  }
) => {
  const result = await request(transaction)
    .input("RequestId", sql.Int, requestId)
    .input("Status", sql.NVarChar(50), status)
    .input("OperatorId", sql.Int, operatorId)
    .input("Remarks", sql.NVarChar(sql.MAX), remarks)
    .input("ClearClaim", sql.Bit, clearClaim)
    .input("Completed", sql.Bit, completed)
    .query(`
      UPDATE dbo.PhotocopyRequests
      SET
        Status = @Status,
        CurrentApproverId = CASE WHEN @ClearClaim = 1 THEN NULL ELSE @OperatorId END,
        ClaimedByUserId = CASE WHEN @ClearClaim = 1 THEN NULL ELSE @OperatorId END,
        ClaimedAt = CASE
          WHEN @ClearClaim = 1 THEN NULL
          ELSE ISNULL(ClaimedAt, GETDATE())
        END,
        PrintedAt = CASE
          WHEN @Status = '${PRINTING_STATUSES.PRINTING}'
            THEN ISNULL(PrintedAt, GETDATE())
          ELSE PrintedAt
        END,
        CompletedAt = CASE WHEN @Completed = 1 THEN GETDATE() ELSE CompletedAt END,
        Remarks = CASE
          WHEN @Remarks IS NULL OR LTRIM(RTRIM(@Remarks)) = '' THEN Remarks
          WHEN Remarks IS NULL OR LTRIM(RTRIM(Remarks)) = '' THEN @Remarks
          ELSE Remarks + CHAR(13) + CHAR(10) + @Remarks
        END,
        WorkflowVersion = WorkflowVersion + 1,
        UpdatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE RequestId = @RequestId;
    `);
  return result.recordset[0] || null;
};

const getExpectedConsumptions = async (
  transaction,
  requestId,
  fallbackPaperType,
  fallbackSheets
) => {
  const result = await request(transaction)
    .input("RequestId", sql.Int, requestId)
    .query(`
      SELECT
        UPPER(ISNULL(PaperSize, 'A4')) AS PaperType,
        SUM(ISNULL(TotalSheets, 0)) AS ExpectedSheets
      FROM dbo.RequestAttachments
      WHERE RequestId = @RequestId
      GROUP BY UPPER(ISNULL(PaperSize, 'A4'));
    `);

  if (result.recordset.length) return result.recordset;
  return [
    {
      PaperType:
        String(fallbackPaperType || "A4").toUpperCase() === "MIXED"
          ? "A4"
          : String(fallbackPaperType || "A4").toUpperCase(),
      ExpectedSheets: Number(fallbackSheets || 0),
    },
  ];
};

const getPaperInventoryForUpdate = async (transaction, paperType) => {
  const result = await request(transaction)
    .input("PaperType", sql.VarChar(10), paperType)
    .query(`
      SELECT InventoryId, PaperType, CurrentStock
      FROM dbo.PaperInventory WITH (UPDLOCK, HOLDLOCK)
      WHERE PaperType = @PaperType;
    `);
  return result.recordset[0] || null;
};

const deductPaperInventory = async (
  transaction,
  inventoryId,
  quantity
) => {
  await request(transaction)
    .input("InventoryId", sql.Int, inventoryId)
    .input("Quantity", sql.Int, quantity)
    .query(`
      UPDATE dbo.PaperInventory
      SET CurrentStock = CurrentStock - @Quantity, LastUpdated = GETDATE()
      WHERE InventoryId = @InventoryId
        AND CurrentStock >= @Quantity;
    `);
};

const insertInventoryTransaction = async (
  transaction,
  {
    paperType,
    transactionType,
    quantity,
    previousStock,
    newStock,
    referenceId,
    remarks,
    createdBy,
  }
) => {
  await request(transaction)
    .input("PaperType", sql.VarChar(10), paperType)
    .input("TransactionType", sql.VarChar(50), transactionType)
    .input("Quantity", sql.Int, quantity)
    .input("PreviousStock", sql.Int, previousStock)
    .input("NewStock", sql.Int, newStock)
    .input("ReferenceId", sql.Int, referenceId)
    .input("Remarks", sql.VarChar(255), String(remarks || "").slice(0, 255))
    .input("CreatedBy", sql.Int, createdBy)
    .query(`
      INSERT INTO dbo.InventoryTransactions (
        PaperType,
        TransactionType,
        Quantity,
        PreviousStock,
        NewStock,
        ReferenceId,
        Remarks,
        CreatedBy,
        CreatedAt
      )
      VALUES (
        @PaperType,
        @TransactionType,
        @Quantity,
        @PreviousStock,
        @NewStock,
        @ReferenceId,
        @Remarks,
        @CreatedBy,
        GETDATE()
      );
    `);
};

const insertJobConsumption = async (
  transaction,
  { requestId, paperType, expectedSheets, actualSheets, recordedBy }
) => {
  await request(transaction)
    .input("RequestId", sql.Int, requestId)
    .input("PaperType", sql.VarChar(10), paperType)
    .input("ExpectedSheets", sql.Int, expectedSheets)
    .input("ActualSheets", sql.Int, actualSheets)
    .input("RecordedBy", sql.Int, recordedBy)
    .query(`
      INSERT INTO dbo.PrintingJobConsumptions (
        RequestId,
        PaperType,
        ExpectedSheets,
        ActualSheets,
        RecordedBy,
        RecordedAt
      )
      VALUES (
        @RequestId,
        @PaperType,
        @ExpectedSheets,
        @ActualSheets,
        @RecordedBy,
        GETDATE()
      );
    `);
};

const insertPrintingLog = async (
  transaction,
  {
    requestId,
    printedBy,
    printedPages,
    printedSheets,
    remarks,
    printerAssetId = null,
  }
) => {
  await request(transaction)
    .input("RequestId", sql.Int, requestId)
    .input("PrintedBy", sql.Int, printedBy)
    .input("PrinterAssetId", sql.Int, printerAssetId)
    .input("PrintedPages", sql.Int, printedPages)
    .input("PrintedSheets", sql.Int, printedSheets)
    .input("Remarks", sql.NVarChar(sql.MAX), remarks)
    .query(`
      INSERT INTO dbo.PrintingLogs (
        RequestId,
        PrintedBy,
        PrinterAssetId,
        PrintedPages,
        PrintedSheets,
        Remarks,
        PrintedAt
      )
      VALUES (
        @RequestId,
        @PrintedBy,
        @PrinterAssetId,
        @PrintedPages,
        @PrintedSheets,
        @Remarks,
        GETDATE()
      );
    `);
};

const insertWorkflowEvent = async (
  transaction,
  {
    requestId,
    eventType,
    fromStatus,
    toStatus,
    actorUserId,
    remarks = null,
    metadata = null,
  }
) => {
  await request(transaction)
    .input("RequestId", sql.Int, requestId)
    .input("EventType", sql.NVarChar(50), eventType)
    .input("FromStatus", sql.NVarChar(50), fromStatus)
    .input("ToStatus", sql.NVarChar(50), toStatus)
    .input("ActorUserId", sql.Int, actorUserId)
    .input("Remarks", sql.NVarChar(sql.MAX), remarks)
    .input(
      "MetadataJson",
      sql.NVarChar(sql.MAX),
      metadata ? JSON.stringify(metadata) : null
    )
    .query(`
      INSERT INTO dbo.PrintingWorkflowEvents (
        RequestId,
        EventType,
        FromStatus,
        ToStatus,
        ActorUserId,
        ActorAssignmentKey,
        Remarks,
        MetadataJson,
        CreatedAt
      )
      VALUES (
        @RequestId,
        @EventType,
        @FromStatus,
        @ToStatus,
        @ActorUserId,
        'PRINTING_OPERATOR',
        @Remarks,
        @MetadataJson,
        GETDATE()
      );
    `);
};

const getPrintingHistory = async (schoolId) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("SchoolId", sql.Int, schoolId)
    .query(`
      SELECT
        printingLog.PrintingLogId,
        printingLog.RequestId,
        printingLog.PrintedBy,
        printingLog.PrinterAssetId,
        printingLog.PrintedPages,
        printingLog.PrintedSheets,
        printingLog.Remarks,
        printingLog.PrintedAt,
        printingRequest.RequestNumber,
        printingRequest.Status,
        printingRequest.PaperSize,
        printingRequest.PrintType,
        printingRequest.PrintSide,
        printingRequest.Copies,
        printingRequest.TotalPages,
        printingRequest.TotalSheets,
        printingRequest.CompletedAt,
        operator.FullName AS PrintedByName,
        requester.FullName AS TeacherName,
        requester.EmployeeId AS TeacherEmployeeId,
        department.DepartmentName,
        subject.SubjectName,
        purpose.PurposeName
      FROM dbo.PrintingLogs printingLog
      JOIN dbo.PhotocopyRequests printingRequest
        ON printingRequest.RequestId = printingLog.RequestId
      LEFT JOIN dbo.Users operator ON operator.UserId = printingLog.PrintedBy
      LEFT JOIN dbo.Users requester ON requester.UserId = printingRequest.TeacherId
      LEFT JOIN dbo.Departments department
        ON department.DepartmentId = printingRequest.DepartmentId
      LEFT JOIN dbo.Subjects subject ON subject.SubjectId = printingRequest.SubjectId
      LEFT JOIN dbo.Purposes purpose ON purpose.PurposeId = printingRequest.PurposeId
      WHERE printingRequest.SchoolId = @SchoolId OR printingRequest.SchoolId IS NULL
      ORDER BY printingLog.PrintedAt DESC;
    `);
  return result.recordset;
};

const listManagedRequests = async (schoolId) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("SchoolId", sql.Int, schoolId)
    .query(`
      SELECT ${PRINTING_REQUEST_SELECT}
      FROM dbo.PhotocopyRequests printingRequest
      LEFT JOIN dbo.Users requester ON requester.UserId = printingRequest.TeacherId
      LEFT JOIN dbo.Departments department
        ON department.DepartmentId = printingRequest.DepartmentId
      LEFT JOIN dbo.Sections sectionRecord
        ON sectionRecord.SectionId = printingRequest.SectionId
      LEFT JOIN dbo.Subjects subject ON subject.SubjectId = printingRequest.SubjectId
      LEFT JOIN dbo.Purposes purpose ON purpose.PurposeId = printingRequest.PurposeId
      LEFT JOIN dbo.Users claimedBy ON claimedBy.UserId = printingRequest.ClaimedByUserId
      WHERE printingRequest.IsDeleted = 0
        AND (printingRequest.SchoolId = @SchoolId OR printingRequest.SchoolId IS NULL)
      ORDER BY printingRequest.SubmittedAt DESC, printingRequest.RequestId DESC;
    `);
  return result.recordset;
};

module.exports = {
  sql,
  beginTransaction,
  getDashboardKpis,
  getDashboardInventory,
  getDashboardJobStatus,
  getDashboardActivity,
  getDashboardPaperUsage,
  getTopDepartmentsThisMonth,
  getRecentPrintJobs,
  getPrintingQueue,
  getPrintingRequestById,
  getQueueRequestForUpdate,
  updateQueueState,
  getExpectedConsumptions,
  getPaperInventoryForUpdate,
  deductPaperInventory,
  insertInventoryTransaction,
  insertJobConsumption,
  insertPrintingLog,
  insertWorkflowEvent,
  getPrintingHistory,
  listManagedRequests,
};
