// ============================================================
// Arab Unity School Operations Platform
// Printing Repository
// ============================================================
//
// Purpose:
// Handles all SQL operations for the Printing module.
//
// Architecture:
// Repository Layer
//
// Rules:
// - SQL only
// - No HTTP handling
// - No business decision logic
// - No request/response objects
//
// ============================================================

const {
  sql,
  executeQuery,
  rows,
  firstOrNull,
} = require("../../../shared/database");

const {
  PRINTING_QUEUE_STATUSES,
  PRINTING_STATUSES,
} = require("../constants/printingStatuses");

// ============================================================
// Shared Select Columns
// ============================================================

const PRINTING_REQUEST_SELECT = `
  r.RequestId,
  r.RequestNumber,
  r.TeacherId,
  r.DepartmentId,
  r.SectionId,
  r.SubjectId,
  r.PurposeId,
  r.Copies,
  r.TotalPages,
  r.TotalSheets,
  r.PriorityLevel,
  r.Status,
  r.CurrentApproverId,
  r.SourceModule,
  r.SourceEntityType,
  r.SourceEntityId,
  r.PaperSize,
  r.PrintType,
  r.PrintSide,
  r.IsExam,
  r.DueDate,
  r.Remarks AS RequestRemarks,
  r.SubmittedAt,
  r.ApprovedAt,
  r.PrintedAt,
  r.CompletedAt,
  r.UpdatedAt,

  teacher.FullName AS TeacherName,
  teacher.EmployeeId AS TeacherEmployeeId,
  teacher.SchoolEmail AS TeacherEmail,

  d.DepartmentName,
  sec.SectionName,
  s.SubjectName,
  p.PurposeName
`;

// ============================================================
// Dashboard
// ============================================================

const getDashboardKpis = async (printingAdminId) => {
  const result = await executeQuery(
    `
    SELECT
      SUM(CASE
        WHEN Status IN ('Approved by HOD', 'Approved by HOS', 'Forwarded to Printing')
         AND CurrentApproverId = @PrintingAdminId
        THEN 1 ELSE 0
      END) AS PendingJobs,

      SUM(CASE
        WHEN Status = 'Printing'
         AND CurrentApproverId = @PrintingAdminId
        THEN 1 ELSE 0
      END) AS PrintingNow,

      SUM(CASE
        WHEN Status = 'On Hold'
         AND CurrentApproverId = @PrintingAdminId
        THEN 1 ELSE 0
      END) AS OnHoldJobs,

      SUM(CASE
        WHEN Status = 'Completed'
         AND CAST(CompletedAt AS DATE) = CAST(GETDATE() AS DATE)
        THEN 1 ELSE 0
      END) AS CompletedToday,

      SUM(CASE
        WHEN Status = 'Completed'
         AND MONTH(CompletedAt) = MONTH(GETDATE())
         AND YEAR(CompletedAt) = YEAR(GETDATE())
        THEN 1 ELSE 0
      END) AS CompletedMonth,

      SUM(CASE
        WHEN Status IN ('Approved by HOD', 'Approved by HOS', 'Forwarded to Printing', 'Printing', 'On Hold')
         AND DueDate IS NOT NULL
         AND DueDate < GETDATE()
        THEN 1 ELSE 0
      END) AS OverdueJobs
    FROM PhotocopyRequests
    `,
    [
      {
        name: "PrintingAdminId",
        type: sql.Int,
        value: printingAdminId,
      },
    ]
  );

  return firstOrNull(result);
};

const getDashboardInventory = async () => {
  const result = await executeQuery(
    `
    SELECT
      PaperType,
      CurrentStock,
      LastUpdated
    FROM PaperInventory
    ORDER BY PaperType ASC
    `
  );

  return rows(result);
};

const getDashboardJobStatus = async (printingAdminId) => {
  const result = await executeQuery(
    `
    SELECT
      SUM(CASE
        WHEN Status IN ('Approved by HOD', 'Approved by HOS', 'Forwarded to Printing')
         AND CurrentApproverId = @PrintingAdminId
        THEN 1 ELSE 0
      END) AS Pending,

      SUM(CASE
        WHEN Status = 'Printing'
         AND CurrentApproverId = @PrintingAdminId
        THEN 1 ELSE 0
      END) AS Printing,

      SUM(CASE
        WHEN Status = 'On Hold'
         AND CurrentApproverId = @PrintingAdminId
        THEN 1 ELSE 0
      END) AS OnHold,

      SUM(CASE
        WHEN Status = 'Completed'
        THEN 1 ELSE 0
      END) AS Completed,

      SUM(CASE
        WHEN Status LIKE '%Rejected%'
        THEN 1 ELSE 0
      END) AS Rejected,

      SUM(CASE
        WHEN Status = 'Cancelled'
        THEN 1 ELSE 0
      END) AS Cancelled
    FROM PhotocopyRequests
    `,
    [
      {
        name: "PrintingAdminId",
        type: sql.Int,
        value: printingAdminId,
      },
    ]
  );

  return firstOrNull(result);
};

const getTopDepartmentsThisMonth = async () => {
  const result = await executeQuery(
    `
    SELECT TOP 5
      ISNULL(d.DepartmentName, 'No Department') AS label,
      ISNULL(SUM(r.TotalSheets), 0) AS value
    FROM PhotocopyRequests r
    LEFT JOIN Departments d
      ON r.DepartmentId = d.DepartmentId
    WHERE MONTH(r.SubmittedAt) = MONTH(GETDATE())
      AND YEAR(r.SubmittedAt) = YEAR(GETDATE())
    GROUP BY d.DepartmentName
    ORDER BY SUM(r.TotalSheets) DESC
    `
  );

  return rows(result);
};

const getRecentPrintJobs = async () => {
  const result = await executeQuery(
    `
    SELECT TOP 5
      RequestNumber,
      Status,
      TotalSheets,
      CompletedAt,
      PrintedAt,
      SubmittedAt,
      CASE
        WHEN CompletedAt IS NOT NULL THEN CompletedAt
        WHEN PrintedAt IS NOT NULL THEN PrintedAt
        ELSE SubmittedAt
      END AS ActivityDate
    FROM PhotocopyRequests
    ORDER BY
      CASE
        WHEN CompletedAt IS NOT NULL THEN CompletedAt
        WHEN PrintedAt IS NOT NULL THEN PrintedAt
        ELSE SubmittedAt
      END DESC
    `
  );

  return rows(result);
};

// ============================================================
// Queue / Requests
// ============================================================

const getPrintingQueue = async (printingAdminId) => {
  const result = await executeQuery(
    `
    SELECT
      ${PRINTING_REQUEST_SELECT}
    FROM PhotocopyRequests r
    LEFT JOIN Users teacher
      ON r.TeacherId = teacher.UserId
    LEFT JOIN Departments d
      ON r.DepartmentId = d.DepartmentId
    LEFT JOIN Sections sec
      ON r.SectionId = sec.SectionId
    LEFT JOIN Subjects s
      ON r.SubjectId = s.SubjectId
    LEFT JOIN Purposes p
      ON r.PurposeId = p.PurposeId
    WHERE r.CurrentApproverId = @PrintingAdminId
      AND r.Status IN (
        'Approved by HOD',
        'Approved by HOS',
        'Forwarded to Printing',
        'Printing',
        'On Hold'
      )
    ORDER BY
      CASE
        WHEN r.PriorityLevel = 'Urgent' THEN 1
        WHEN r.PriorityLevel = 'High' THEN 2
        WHEN r.PriorityLevel = 'Normal' THEN 3
        ELSE 4
      END,
      CASE
        WHEN r.DueDate IS NULL THEN 1 ELSE 0
      END,
      r.DueDate ASC,
      r.SubmittedAt ASC
    `,
    [
      {
        name: "PrintingAdminId",
        type: sql.Int,
        value: printingAdminId,
      },
    ]
  );

  return rows(result);
};

const getPrintingRequestById = async (requestId, printingAdminId) => {
  const result = await executeQuery(
    `
    SELECT
      ${PRINTING_REQUEST_SELECT}
    FROM PhotocopyRequests r
    LEFT JOIN Users teacher
      ON r.TeacherId = teacher.UserId
    LEFT JOIN Departments d
      ON r.DepartmentId = d.DepartmentId
    LEFT JOIN Sections sec
      ON r.SectionId = sec.SectionId
    LEFT JOIN Subjects s
      ON r.SubjectId = s.SubjectId
    LEFT JOIN Purposes p
      ON r.PurposeId = p.PurposeId
    WHERE r.RequestId = @RequestId
      AND (
        r.CurrentApproverId = @PrintingAdminId
        OR r.Status = 'Completed'
      )
    `,
    [
      {
        name: "RequestId",
        type: sql.Int,
        value: requestId,
      },
      {
        name: "PrintingAdminId",
        type: sql.Int,
        value: printingAdminId,
      },
    ]
  );

  return firstOrNull(result);
};

const getRequestForWorkflow = async (requestId, printingAdminId, transaction = null) => {
  const executor = transaction || executeQuery;

  const query = `
    SELECT
      RequestId,
      RequestNumber,
      TeacherId,
      Copies,
      TotalPages,
      TotalSheets,
      PriorityLevel,
      Status,
      CurrentApproverId,
      PaperSize,
      PrintType,
      PrintSide,
      DueDate,
      Remarks
    FROM PhotocopyRequests
    WHERE RequestId = @RequestId
      AND CurrentApproverId = @PrintingAdminId
  `;

  const params = [
    {
      name: "RequestId",
      type: sql.Int,
      value: requestId,
    },
    {
      name: "PrintingAdminId",
      type: sql.Int,
      value: printingAdminId,
    },
  ];

  if (transaction) {
    const result = await new sql.Request(transaction)
      .input("RequestId", sql.Int, requestId)
      .input("PrintingAdminId", sql.Int, printingAdminId)
      .query(query);

    return result.recordset[0] || null;
  }

  const result = await executor(query, params);
  return firstOrNull(result);
};

// ============================================================
// Workflow Updates
// ============================================================

const markAsPrinting = async (requestId, printingAdminId) => {
  const result = await executeQuery(
    `
    UPDATE PhotocopyRequests
    SET
      Status = @Status,
      PrintedAt = ISNULL(PrintedAt, GETDATE()),
      UpdatedAt = GETDATE()
    OUTPUT INSERTED.*
    WHERE RequestId = @RequestId
      AND CurrentApproverId = @PrintingAdminId
    `,
    [
      {
        name: "Status",
        type: sql.NVarChar,
        value: PRINTING_STATUSES.PRINTING,
      },
      {
        name: "RequestId",
        type: sql.Int,
        value: requestId,
      },
      {
        name: "PrintingAdminId",
        type: sql.Int,
        value: printingAdminId,
      },
    ]
  );

  return firstOrNull(result);
};

const markAsOnHold = async (requestId, printingAdminId, remarks = null) => {
  const result = await executeQuery(
    `
    UPDATE PhotocopyRequests
    SET
      Status = @Status,
      Remarks = COALESCE(@Remarks, Remarks),
      UpdatedAt = GETDATE()
    OUTPUT INSERTED.*
    WHERE RequestId = @RequestId
      AND CurrentApproverId = @PrintingAdminId
    `,
    [
      {
        name: "Status",
        type: sql.NVarChar,
        value: PRINTING_STATUSES.ON_HOLD,
      },
      {
        name: "Remarks",
        type: sql.NVarChar,
        value: remarks,
      },
      {
        name: "RequestId",
        type: sql.Int,
        value: requestId,
      },
      {
        name: "PrintingAdminId",
        type: sql.Int,
        value: printingAdminId,
      },
    ]
  );

  return firstOrNull(result);
};

const markAsCancelled = async (requestId, printingAdminId, remarks = null) => {
  const result = await executeQuery(
    `
    UPDATE PhotocopyRequests
    SET
      Status = @Status,
      CurrentApproverId = NULL,
      Remarks = COALESCE(@Remarks, Remarks),
      UpdatedAt = GETDATE()
    OUTPUT INSERTED.*
    WHERE RequestId = @RequestId
      AND CurrentApproverId = @PrintingAdminId
    `,
    [
      {
        name: "Status",
        type: sql.NVarChar,
        value: PRINTING_STATUSES.CANCELLED,
      },
      {
        name: "Remarks",
        type: sql.NVarChar,
        value: remarks,
      },
      {
        name: "RequestId",
        type: sql.Int,
        value: requestId,
      },
      {
        name: "PrintingAdminId",
        type: sql.Int,
        value: printingAdminId,
      },
    ]
  );

  return firstOrNull(result);
};

// ============================================================
// Inventory + Completion Transaction Helpers
// ============================================================

const getPaperInventoryForUpdate = async (transaction, paperType) => {
  const result = await new sql.Request(transaction)
    .input("PaperType", sql.VarChar(10), paperType)
    .query(`
      SELECT
        InventoryId,
        PaperType,
        CurrentStock
      FROM PaperInventory WITH (UPDLOCK, ROWLOCK)
      WHERE PaperType = @PaperType
    `);

  return result.recordset[0] || null;
};

const deductPaperInventory = async (transaction, inventoryId, quantity) => {
  await new sql.Request(transaction)
    .input("InventoryId", sql.Int, inventoryId)
    .input("Quantity", sql.Int, quantity)
    .query(`
      UPDATE PaperInventory
      SET
        CurrentStock = CurrentStock - @Quantity,
        LastUpdated = GETDATE()
      WHERE InventoryId = @InventoryId
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
  await new sql.Request(transaction)
    .input("PaperType", sql.VarChar(10), paperType)
    .input("TransactionType", sql.VarChar(50), transactionType)
    .input("Quantity", sql.Int, quantity)
    .input("PreviousStock", sql.Int, previousStock)
    .input("NewStock", sql.Int, newStock)
    .input("ReferenceId", sql.Int, referenceId)
    .input("Remarks", sql.VarChar(255), remarks)
    .input("CreatedBy", sql.Int, createdBy)
    .query(`
      INSERT INTO InventoryTransactions
      (
        PaperType,
        TransactionType,
        Quantity,
        PreviousStock,
        NewStock,
        ReferenceId,
        Remarks,
        CreatedBy
      )
      VALUES
      (
        @PaperType,
        @TransactionType,
        @Quantity,
        @PreviousStock,
        @NewStock,
        @ReferenceId,
        @Remarks,
        @CreatedBy
      )
    `);
};

const markRequestCompleted = async (transaction, requestId) => {
  await new sql.Request(transaction)
    .input("RequestId", sql.Int, requestId)
    .input("Status", sql.NVarChar(50), PRINTING_STATUSES.COMPLETED)
    .query(`
      UPDATE PhotocopyRequests
      SET
        Status = @Status,
        CurrentApproverId = NULL,
        CompletedAt = GETDATE(),
        UpdatedAt = GETDATE()
      WHERE RequestId = @RequestId
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
  await new sql.Request(transaction)
    .input("RequestId", sql.Int, requestId)
    .input("PrintedBy", sql.Int, printedBy)
    .input("PrinterAssetId", sql.Int, printerAssetId)
    .input("PrintedPages", sql.Int, printedPages)
    .input("PrintedSheets", sql.Int, printedSheets)
    .input("Remarks", sql.NVarChar, remarks)
    .query(`
      INSERT INTO PrintingLogs
      (
        RequestId,
        PrintedBy,
        PrinterAssetId,
        PrintedPages,
        PrintedSheets,
        Remarks,
        PrintedAt
      )
      VALUES
      (
        @RequestId,
        @PrintedBy,
        @PrinterAssetId,
        @PrintedPages,
        @PrintedSheets,
        @Remarks,
        GETDATE()
      )
    `);
};

// ============================================================
// History
// ============================================================

const getPrintingHistory = async () => {
  const result = await executeQuery(
    `
    SELECT
      pl.PrintingLogId,
      pl.RequestId,
      pl.PrintedBy,
      pl.PrinterAssetId,
      pl.PrintedPages,
      pl.PrintedSheets,
      pl.Remarks,
      pl.PrintedAt,

      r.RequestNumber,
      r.Status,
      r.PaperSize,
      r.PrintType,
      r.PrintSide,
      r.Copies,
      r.TotalPages,
      r.TotalSheets,
      r.CompletedAt,

      operator.FullName AS PrintedByName,
      teacher.FullName AS TeacherName,
      teacher.EmployeeId AS TeacherEmployeeId,

      d.DepartmentName,
      s.SubjectName,
      p.PurposeName
    FROM PrintingLogs pl
    INNER JOIN PhotocopyRequests r
      ON pl.RequestId = r.RequestId
    LEFT JOIN Users operator
      ON pl.PrintedBy = operator.UserId
    LEFT JOIN Users teacher
      ON r.TeacherId = teacher.UserId
    LEFT JOIN Departments d
      ON r.DepartmentId = d.DepartmentId
    LEFT JOIN Subjects s
      ON r.SubjectId = s.SubjectId
    LEFT JOIN Purposes p
      ON r.PurposeId = p.PurposeId
    ORDER BY pl.PrintedAt DESC
    `
  );

  return rows(result);
};

module.exports = {
  getDashboardKpis,
  getDashboardInventory,
  getDashboardJobStatus,
  getTopDepartmentsThisMonth,
  getRecentPrintJobs,

  getPrintingQueue,
  getPrintingRequestById,
  getRequestForWorkflow,

  markAsPrinting,
  markAsOnHold,
  markAsCancelled,

  getPaperInventoryForUpdate,
  deductPaperInventory,
  insertInventoryTransaction,
  markRequestCompleted,
  insertPrintingLog,

  getPrintingHistory,
};