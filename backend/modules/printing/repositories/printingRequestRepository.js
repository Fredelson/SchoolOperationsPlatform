const { poolPromise, sql } = require("../../../config/db");

const request = (transaction) => new sql.Request(transaction);

const createDraft = async (
  transaction,
  {
    requestNumber,
    requesterId,
    schoolId,
    departmentId,
    sectionId,
    subjectId,
    purposeId,
    priorityLevel,
    dueDate,
    remarks,
    isExam,
    submittedByAssignmentKey,
  }
) => {
  const dbRequest = transaction
    ? request(transaction)
    : (await poolPromise).request();
  const result = await dbRequest
    .input("RequestNumber", sql.NVarChar(50), requestNumber)
    .input("RequesterId", sql.Int, requesterId)
    .input("SchoolId", sql.Int, schoolId)
    .input("DepartmentId", sql.Int, departmentId)
    .input("SectionId", sql.Int, sectionId)
    .input("SubjectId", sql.Int, subjectId)
    .input("PurposeId", sql.Int, purposeId)
    .input("PriorityLevel", sql.NVarChar(20), priorityLevel)
    .input("DueDate", sql.DateTime, dueDate)
    .input("Remarks", sql.NVarChar(sql.MAX), remarks)
    .input("IsExam", sql.Bit, Boolean(isExam))
    .input(
      "SubmittedByAssignmentKey",
      sql.NVarChar(100),
      submittedByAssignmentKey
    )
    .query(`
      INSERT INTO dbo.PhotocopyRequests (
        RequestNumber,
        TeacherId,
        DepartmentId,
        SectionId,
        SubjectId,
        PurposeId,
        Copies,
        TotalPages,
        TotalSheets,
        PriorityLevel,
        Status,
        CurrentApproverId,
        IsExam,
        DueDate,
        Remarks,
        SubmittedAt,
        SchoolId,
        SubmittedByAssignmentKey
      )
      OUTPUT INSERTED.*
      VALUES (
        @RequestNumber,
        @RequesterId,
        @DepartmentId,
        @SectionId,
        @SubjectId,
        @PurposeId,
        1,
        0,
        0,
        @PriorityLevel,
        'Draft',
        NULL,
        @IsExam,
        @DueDate,
        @Remarks,
        GETDATE(),
        @SchoolId,
        @SubmittedByAssignmentKey
      );
    `);

  return result.recordset[0];
};

const getDepartmentContext = async (departmentId, schoolId) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("DepartmentId", sql.Int, departmentId)
    .input("SchoolId", sql.Int, schoolId)
    .query(`
      SELECT DepartmentId, SectionId
      FROM dbo.Departments
      WHERE DepartmentId = @DepartmentId
        AND IsActive = 1
        AND (SchoolId = @SchoolId OR SchoolId IS NULL);
    `);

  return result.recordset[0] || null;
};

const validateLookupIds = async ({ subjectId, purposeId }) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("SubjectId", sql.Int, subjectId)
    .input("PurposeId", sql.Int, purposeId)
    .query(`
      SELECT
        CASE WHEN EXISTS (
          SELECT 1 FROM dbo.Subjects
          WHERE SubjectId = @SubjectId AND IsActive = 1
        ) THEN 1 ELSE 0 END AS SubjectExists,
        CASE WHEN EXISTS (
          SELECT 1 FROM dbo.Purposes
          WHERE PurposeId = @PurposeId AND IsActive = 1
        ) THEN 1 ELSE 0 END AS PurposeExists;
    `);

  return result.recordset[0];
};

const beginTransaction = async () => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  return transaction;
};

const getOwnedEditableRequest = async (
  transaction,
  requestId,
  requesterId
) => {
  const result = await request(transaction)
    .input("RequestId", sql.Int, requestId)
    .input("RequesterId", sql.Int, requesterId)
    .query(`
      SELECT *
      FROM dbo.PhotocopyRequests WITH (UPDLOCK, HOLDLOCK)
      WHERE RequestId = @RequestId
        AND TeacherId = @RequesterId
        AND Status IN ('Draft', 'Returned by HOD', 'Returned by HOS')
        AND IsDeleted = 0;
    `);

  return result.recordset[0] || null;
};

const getOwnedRequestForUpdate = async (
  transaction,
  requestId,
  requesterId
) => {
  const result = await request(transaction)
    .input("RequestId", sql.Int, requestId)
    .input("RequesterId", sql.Int, requesterId)
    .query(`
      SELECT *
      FROM dbo.PhotocopyRequests WITH (UPDLOCK, HOLDLOCK)
      WHERE RequestId = @RequestId
        AND TeacherId = @RequesterId
        AND IsDeleted = 0;
    `);

  return result.recordset[0] || null;
};

const insertAttachment = async (transaction, attachment) => {
  const result = await request(transaction)
    .input("RequestId", sql.Int, attachment.requestId)
    .input("OriginalFileName", sql.NVarChar(255), attachment.originalFileName)
    .input("StoredFileName", sql.NVarChar(255), attachment.storedFileName)
    .input("FilePath", sql.NVarChar(sql.MAX), attachment.filePath)
    .input("FileType", sql.NVarChar(100), attachment.fileType)
    .input("FileSizeKB", sql.Decimal(18, 2), attachment.fileSizeKB)
    .input("PageCount", sql.Int, attachment.pageCount)
    .input("Copies", sql.Int, attachment.copies)
    .input("TotalSheets", sql.Int, attachment.totalSheets)
    .input("DocumentName", sql.NVarChar(255), attachment.documentName)
    .input("PaperSize", sql.NVarChar(20), attachment.paperSize)
    .input("PrintType", sql.NVarChar(50), attachment.printType)
    .input("PrintColor", sql.NVarChar(50), attachment.printColor)
    .input("PagesPerSheet", sql.Int, attachment.pagesPerSheet)
    .input("PageSelection", sql.NVarChar(30), attachment.pageSelection)
    .input("CustomPageRange", sql.NVarChar(255), attachment.customPageRange)
    .input("SelectedPages", sql.Int, attachment.selectedPages)
    .input("SheetsPerSet", sql.Int, attachment.sheetsPerSet)
    .query(`
      INSERT INTO dbo.RequestAttachments (
        RequestId,
        OriginalFileName,
        StoredFileName,
        FilePath,
        FileType,
        FileSizeKB,
        PageCount,
        Copies,
        TotalSheets,
        DocumentName,
        PaperSize,
        PrintType,
        PrintColor,
        PagesPerSheet,
        PageSelection,
        CustomPageRange,
        SelectedPages,
        SheetsPerSet,
        UploadedAt
      )
      OUTPUT INSERTED.*
      VALUES (
        @RequestId,
        @OriginalFileName,
        @StoredFileName,
        @FilePath,
        @FileType,
        @FileSizeKB,
        @PageCount,
        @Copies,
        @TotalSheets,
        @DocumentName,
        @PaperSize,
        @PrintType,
        @PrintColor,
        @PagesPerSheet,
        @PageSelection,
        @CustomPageRange,
        @SelectedPages,
        @SheetsPerSet,
        GETDATE()
      );
    `);

  return result.recordset[0];
};

const refreshRequestTotals = async (transaction, requestId) => {
  const result = await request(transaction)
    .input("RequestId", sql.Int, requestId)
    .query(`
      ;WITH totals AS (
        SELECT
          RequestId,
          SUM(ISNULL(SelectedPages, PageCount)) AS TotalPages,
          SUM(ISNULL(TotalSheets, 0)) AS TotalSheets,
          MAX(ISNULL(Copies, 1)) AS Copies,
          CASE
            WHEN COUNT(DISTINCT ISNULL(PaperSize, 'A4')) = 1
              THEN MAX(ISNULL(PaperSize, 'A4'))
            ELSE 'Mixed'
          END AS PaperSize,
          CASE
            WHEN COUNT(DISTINCT ISNULL(PrintType, 'Single-Sided')) = 1
              THEN MAX(ISNULL(PrintType, 'Single-Sided'))
            ELSE 'Mixed'
          END AS PrintSide,
          CASE
            WHEN COUNT(DISTINCT ISNULL(PrintColor, 'Black & White')) = 1
              THEN MAX(ISNULL(PrintColor, 'Black & White'))
            ELSE 'Mixed'
          END AS PrintType
        FROM dbo.RequestAttachments
        WHERE RequestId = @RequestId
        GROUP BY RequestId
      )
      UPDATE target
      SET
        TotalPages = totals.TotalPages,
        TotalSheets = totals.TotalSheets,
        Copies = totals.Copies,
        PaperSize = totals.PaperSize,
        PrintSide = totals.PrintSide,
        PrintType = totals.PrintType,
        UpdatedAt = GETDATE()
      OUTPUT INSERTED.*
      FROM dbo.PhotocopyRequests target
      JOIN totals ON totals.RequestId = target.RequestId;
    `);

  return result.recordset[0] || null;
};

const getRequestForSubmission = async (
  transaction,
  requestId,
  requesterId
) => {
  const requestRow = await getOwnedEditableRequest(
    transaction,
    requestId,
    requesterId
  );

  if (!requestRow) return null;

  const attachments = await request(transaction)
    .input("RequestId", sql.Int, requestId)
    .query(`
      SELECT *
      FROM dbo.RequestAttachments
      WHERE RequestId = @RequestId
      ORDER BY AttachmentId;
    `);

  return {
    request: requestRow,
    attachments: attachments.recordset,
  };
};

const findHodApprover = async (
  transaction,
  { schoolId, departmentId, subjectId }
) => {
  const result = await request(transaction)
    .input("SchoolId", sql.Int, schoolId)
    .input("DepartmentId", sql.Int, departmentId)
    .input("SubjectId", sql.Int, subjectId)
    .query(`
      SELECT TOP 1
        ua.UserId,
        ua.UserAssignmentId,
        'Department' AS ScopeType,
        @DepartmentId AS ScopeEntityId
      FROM dbo.UserAssignments ua
      JOIN dbo.AssignmentTypes assignmentType
        ON assignmentType.AssignmentTypeId = ua.AssignmentTypeId
       AND assignmentType.AssignmentKey = 'HOD'
       AND assignmentType.IsActive = 1
      JOIN dbo.Users approver
        ON approver.UserId = ua.UserId
       AND approver.IsActive = 1
       AND ISNULL(approver.IsDeleted, 0) = 0
      WHERE ua.IsActive = 1
        AND (ua.StartDate IS NULL OR ua.StartDate <= CAST(GETDATE() AS date))
        AND (ua.EndDate IS NULL OR ua.EndDate >= CAST(GETDATE() AS date))
        AND (approver.SchoolId = @SchoolId OR approver.SchoolId IS NULL)
        AND EXISTS (
          SELECT 1
          FROM dbo.UserAssignmentScopes departmentScope
          WHERE departmentScope.UserAssignmentId = ua.UserAssignmentId
            AND departmentScope.IsActive = 1
            AND departmentScope.ScopeType = 'Department'
            AND departmentScope.ScopeEntityId = @DepartmentId
        )
        AND (
          NOT EXISTS (
            SELECT 1
            FROM dbo.UserAssignmentScopes subjectScope
            WHERE subjectScope.UserAssignmentId = ua.UserAssignmentId
              AND subjectScope.IsActive = 1
              AND subjectScope.ScopeType = 'Subject'
          )
          OR EXISTS (
            SELECT 1
            FROM dbo.UserAssignmentScopes subjectScope
            WHERE subjectScope.UserAssignmentId = ua.UserAssignmentId
              AND subjectScope.IsActive = 1
              AND subjectScope.ScopeType = 'Subject'
              AND subjectScope.ScopeEntityId = @SubjectId
          )
        )
      ORDER BY
        CASE WHEN EXISTS (
          SELECT 1
          FROM dbo.SubjectPrintLimits subjectLimit
          WHERE subjectLimit.DepartmentId = @DepartmentId
            AND subjectLimit.SubjectId = @SubjectId
            AND subjectLimit.HodUserId = ua.UserId
            AND subjectLimit.MonthNumber = MONTH(GETDATE())
            AND subjectLimit.YearNumber = YEAR(GETDATE())
        ) THEN 0 ELSE 1 END,
        CASE WHEN EXISTS (
          SELECT 1
          FROM dbo.UserAssignmentScopes subjectScope
          WHERE subjectScope.UserAssignmentId = ua.UserAssignmentId
            AND subjectScope.IsActive = 1
            AND subjectScope.ScopeType = 'Subject'
            AND subjectScope.ScopeEntityId = @SubjectId
        ) THEN 0 ELSE 1 END,
        ua.IsPrimary DESC,
        ua.CreatedAt,
        ua.UserAssignmentId;
    `);

  return result.recordset[0] || null;
};

const findHosApprover = async (
  transaction,
  { schoolId, departmentId, sectionId }
) => {
  const result = await request(transaction)
    .input("SchoolId", sql.Int, schoolId)
    .input("DepartmentId", sql.Int, departmentId)
    .input("SectionId", sql.Int, sectionId)
    .query(`
      SELECT TOP 1
        ua.UserId,
        ua.UserAssignmentId,
        CASE
          WHEN EXISTS (
            SELECT 1
            FROM dbo.UserAssignmentScopes sectionScope
            WHERE sectionScope.UserAssignmentId = ua.UserAssignmentId
              AND sectionScope.IsActive = 1
              AND sectionScope.ScopeType = 'Section'
              AND sectionScope.ScopeEntityId = @SectionId
          ) THEN 'Section'
          ELSE 'Department'
        END AS ScopeType,
        CASE
          WHEN EXISTS (
            SELECT 1
            FROM dbo.UserAssignmentScopes sectionScope
            WHERE sectionScope.UserAssignmentId = ua.UserAssignmentId
              AND sectionScope.IsActive = 1
              AND sectionScope.ScopeType = 'Section'
              AND sectionScope.ScopeEntityId = @SectionId
          ) THEN @SectionId
          ELSE @DepartmentId
        END AS ScopeEntityId
      FROM dbo.UserAssignments ua
      JOIN dbo.AssignmentTypes assignmentType
        ON assignmentType.AssignmentTypeId = ua.AssignmentTypeId
       AND assignmentType.AssignmentKey IN ('HOS', 'SECRETARY')
       AND assignmentType.IsActive = 1
      JOIN dbo.Users approver
        ON approver.UserId = ua.UserId
       AND approver.IsActive = 1
       AND ISNULL(approver.IsDeleted, 0) = 0
      WHERE ua.IsActive = 1
        AND (ua.StartDate IS NULL OR ua.StartDate <= CAST(GETDATE() AS date))
        AND (ua.EndDate IS NULL OR ua.EndDate >= CAST(GETDATE() AS date))
        AND (approver.SchoolId = @SchoolId OR approver.SchoolId IS NULL)
        AND (
          EXISTS (
            SELECT 1
            FROM dbo.UserAssignmentScopes sectionScope
            WHERE sectionScope.UserAssignmentId = ua.UserAssignmentId
              AND sectionScope.IsActive = 1
              AND sectionScope.ScopeType = 'Section'
              AND sectionScope.ScopeEntityId = @SectionId
          )
          OR EXISTS (
            SELECT 1
            FROM dbo.UserAssignmentScopes departmentScope
            WHERE departmentScope.UserAssignmentId = ua.UserAssignmentId
              AND departmentScope.IsActive = 1
              AND departmentScope.ScopeType = 'Department'
              AND departmentScope.ScopeEntityId = @DepartmentId
          )
        )
      ORDER BY
        CASE WHEN EXISTS (
          SELECT 1
          FROM dbo.UserAssignmentScopes sectionScope
          WHERE sectionScope.UserAssignmentId = ua.UserAssignmentId
            AND sectionScope.IsActive = 1
            AND sectionScope.ScopeType = 'Section'
            AND sectionScope.ScopeEntityId = @SectionId
        ) THEN 0 ELSE 1 END,
        ua.IsPrimary DESC,
        ua.CreatedAt,
        ua.UserAssignmentId;
    `);

  return result.recordset[0] || null;
};

const findPrintingOperator = async (transaction, schoolId) => {
  const result = await request(transaction)
    .input("SchoolId", sql.Int, schoolId)
    .query(`
      SELECT TOP 1 candidate.UserId
      FROM (
        SELECT
          u.UserId,
          0 AS Priority,
          u.UserId AS SortValue
        FROM dbo.Users u
        JOIN dbo.Roles roleRecord ON roleRecord.RoleId = u.RoleId
        WHERE roleRecord.RoleKey = 'PrintingAdmin'
          AND u.IsActive = 1
          AND ISNULL(u.IsDeleted, 0) = 0
          AND (u.SchoolId = @SchoolId OR u.SchoolId IS NULL)

        UNION ALL

        SELECT
          ua.UserId,
          1 AS Priority,
          ua.UserAssignmentId AS SortValue
        FROM dbo.UserAssignments ua
        JOIN dbo.AssignmentTypes assignmentType
          ON assignmentType.AssignmentTypeId = ua.AssignmentTypeId
         AND assignmentType.AssignmentKey = 'PRINTING_COORDINATOR'
         AND assignmentType.IsActive = 1
        JOIN dbo.Users u
          ON u.UserId = ua.UserId
         AND u.IsActive = 1
         AND ISNULL(u.IsDeleted, 0) = 0
        WHERE ua.IsActive = 1
          AND (u.SchoolId = @SchoolId OR u.SchoolId IS NULL)
      ) candidate
      ORDER BY candidate.Priority, candidate.SortValue;
    `);

  return result.recordset[0] || null;
};

const updateRequestRoute = async (
  transaction,
  { requestId, status, approverId = null }
) => {
  const result = await request(transaction)
    .input("RequestId", sql.Int, requestId)
    .input("Status", sql.NVarChar(50), status)
    .input("ApproverId", sql.Int, approverId)
    .query(`
      UPDATE dbo.PhotocopyRequests
      SET
        Status = @Status,
        CurrentApproverId = @ApproverId,
        ApprovedAt = CASE
          WHEN @Status IN (
            'Approved by HOD',
            'Approved by HOS',
            'Forwarded to Printing',
            'Queued for Printing'
          ) THEN GETDATE()
          ELSE ApprovedAt
        END,
        WorkflowVersion = WorkflowVersion + 1,
        UpdatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE RequestId = @RequestId;
    `);

  return result.recordset[0] || null;
};

const insertApproval = async (
  transaction,
  {
    requestId,
    approverId,
    approvalRole,
    approvalStatus = "Pending",
    remarks = null,
    stepOrder = null,
    scopeType = null,
    scopeEntityId = null,
  }
) => {
  const result = await request(transaction)
    .input("RequestId", sql.Int, requestId)
    .input("ApproverId", sql.Int, approverId)
    .input("ApprovalRole", sql.NVarChar(50), approvalRole)
    .input("ApprovalStatus", sql.NVarChar(50), approvalStatus)
    .input("Remarks", sql.NVarChar(sql.MAX), remarks)
    .input("StepOrder", sql.Int, stepOrder)
    .input("ScopeType", sql.NVarChar(50), scopeType)
    .input("ScopeEntityId", sql.Int, scopeEntityId)
    .query(`
      INSERT INTO dbo.RequestApprovals (
        RequestId,
        ApproverId,
        ApprovalRole,
        ApprovalStatus,
        Remarks,
        ActionDate,
        AssignedAt,
        StepOrder,
        ScopeType,
        ScopeEntityId
      )
      OUTPUT INSERTED.*
      VALUES (
        @RequestId,
        @ApproverId,
        @ApprovalRole,
        @ApprovalStatus,
        @Remarks,
        GETDATE(),
        GETDATE(),
        @StepOrder,
        @ScopeType,
        @ScopeEntityId
      );
    `);

  return result.recordset[0];
};

const updatePendingApproval = async (
  transaction,
  { requestId, approverId, approvalRole, approvalStatus, remarks }
) => {
  const result = await request(transaction)
    .input("RequestId", sql.Int, requestId)
    .input("ApproverId", sql.Int, approverId)
    .input("ApprovalRole", sql.NVarChar(50), approvalRole)
    .input("ApprovalStatus", sql.NVarChar(50), approvalStatus)
    .input("Remarks", sql.NVarChar(sql.MAX), remarks)
    .query(`
      UPDATE dbo.RequestApprovals
      SET
        ApprovalStatus = @ApprovalStatus,
        Remarks = @Remarks,
        ActionDate = GETDATE()
      OUTPUT INSERTED.*
      WHERE ApprovalId = (
        SELECT TOP 1 ApprovalId
        FROM dbo.RequestApprovals
        WHERE RequestId = @RequestId
          AND ApproverId = @ApproverId
          AND ApprovalRole = @ApprovalRole
          AND ApprovalStatus = 'Pending'
        ORDER BY ApprovalId DESC
      );
    `);

  return result.recordset[0] || null;
};

const closePendingApprovals = async (
  transaction,
  requestId,
  status,
  remarks
) => {
  await request(transaction)
    .input("RequestId", sql.Int, requestId)
    .input("Status", sql.NVarChar(50), status)
    .input("Remarks", sql.NVarChar(sql.MAX), remarks)
    .query(`
      UPDATE dbo.RequestApprovals
      SET
        ApprovalStatus = @Status,
        Remarks = COALESCE(@Remarks, Remarks),
        ActionDate = GETDATE()
      WHERE RequestId = @RequestId
        AND ApprovalStatus = 'Pending';
    `);
};

const insertWorkflowEvent = async (
  transaction,
  {
    requestId,
    eventType,
    fromStatus = null,
    toStatus = null,
    actorUserId = null,
    actorAssignmentKey = null,
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
    .input("ActorAssignmentKey", sql.NVarChar(100), actorAssignmentKey)
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
        @ActorAssignmentKey,
        @Remarks,
        @MetadataJson,
        GETDATE()
      );
    `);
};

const getApprovalRequestForUpdate = async (
  transaction,
  requestId,
  approverId
) => {
  const result = await request(transaction)
    .input("RequestId", sql.Int, requestId)
    .input("ApproverId", sql.Int, approverId)
    .query(`
      SELECT *
      FROM dbo.PhotocopyRequests WITH (UPDLOCK, HOLDLOCK)
      WHERE RequestId = @RequestId
        AND CurrentApproverId = @ApproverId
        AND IsDeleted = 0;
    `);

  return result.recordset[0] || null;
};

const getQuotaSnapshotForUpdate = async (
  transaction,
  { requestId, departmentId, subjectId, totalSheets }
) => {
  const result = await request(transaction)
    .input("RequestId", sql.Int, requestId)
    .input("DepartmentId", sql.Int, departmentId)
    .input("SubjectId", sql.Int, subjectId)
    .input("TotalSheets", sql.Int, totalSheets)
    .query(`
      DECLARE @MonthNumber int = MONTH(GETDATE());
      DECLARE @YearNumber int = YEAR(GETDATE());

      SELECT
        SubjectLimitId,
        SheetLimit
      INTO #SubjectLimit
      FROM dbo.SubjectPrintLimits WITH (UPDLOCK, HOLDLOCK)
      WHERE DepartmentId = @DepartmentId
        AND SubjectId = @SubjectId
        AND MonthNumber = @MonthNumber
        AND YearNumber = @YearNumber;

      SELECT
        DepartmentLimitId,
        SheetLimit
      INTO #DepartmentLimit
      FROM dbo.DepartmentPrintLimits WITH (UPDLOCK, HOLDLOCK)
      WHERE DepartmentId = @DepartmentId
        AND MonthNumber = @MonthNumber
        AND YearNumber = @YearNumber;

      DECLARE @SubjectUsed int = (
        SELECT ISNULL(SUM(TotalSheets), 0)
        FROM dbo.PhotocopyRequests WITH (HOLDLOCK)
        WHERE RequestId <> @RequestId
          AND DepartmentId = @DepartmentId
          AND SubjectId = @SubjectId
          AND MONTH(SubmittedAt) = @MonthNumber
          AND YEAR(SubmittedAt) = @YearNumber
          AND Status IN (
            'Pending HOS Approval',
            'Forwarded to HOS',
            'Approved by HOD',
            'Approved by HOS',
            'Forwarded to Printing',
            'Queued for Printing',
            'Printing',
            'On Hold',
            'Completed'
          )
      );

      DECLARE @DepartmentUsed int = (
        SELECT ISNULL(SUM(TotalSheets), 0)
        FROM dbo.PhotocopyRequests WITH (HOLDLOCK)
        WHERE RequestId <> @RequestId
          AND DepartmentId = @DepartmentId
          AND MONTH(SubmittedAt) = @MonthNumber
          AND YEAR(SubmittedAt) = @YearNumber
          AND Status IN (
            'Pending HOS Approval',
            'Forwarded to HOS',
            'Approved by HOD',
            'Approved by HOS',
            'Forwarded to Printing',
            'Queued for Printing',
            'Printing',
            'On Hold',
            'Completed'
          )
      );

      SELECT
        subjectLimit.SheetLimit AS SubjectLimit,
        @SubjectUsed AS SubjectUsed,
        subjectLimit.SheetLimit - @SubjectUsed AS SubjectRemaining,
        departmentLimit.SheetLimit AS DepartmentLimit,
        @DepartmentUsed AS DepartmentUsed,
        departmentLimit.SheetLimit - @DepartmentUsed AS DepartmentRemaining,
        @TotalSheets AS RequestedSheets
      FROM #SubjectLimit subjectLimit
      CROSS JOIN #DepartmentLimit departmentLimit;
    `);

  return result.recordset[0] || null;
};

const listMyRequests = async (requesterId) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("RequesterId", sql.Int, requesterId)
    .query(`
      SELECT
        printingRequest.*,
        department.DepartmentName,
        sectionRecord.SectionName,
        subject.SubjectName,
        purpose.PurposeName,
        claimedBy.FullName AS ClaimedByName
      FROM dbo.PhotocopyRequests printingRequest
      LEFT JOIN dbo.Departments department
        ON department.DepartmentId = printingRequest.DepartmentId
      LEFT JOIN dbo.Sections sectionRecord
        ON sectionRecord.SectionId = printingRequest.SectionId
      LEFT JOIN dbo.Subjects subject
        ON subject.SubjectId = printingRequest.SubjectId
      LEFT JOIN dbo.Purposes purpose
        ON purpose.PurposeId = printingRequest.PurposeId
      LEFT JOIN dbo.Users claimedBy
        ON claimedBy.UserId = printingRequest.ClaimedByUserId
      WHERE printingRequest.TeacherId = @RequesterId
        AND printingRequest.IsDeleted = 0
      ORDER BY printingRequest.SubmittedAt DESC, printingRequest.RequestId DESC;
    `);

  return result.recordset;
};

const listMyAttachments = async (requesterId) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("RequesterId", sql.Int, requesterId)
    .query(`
      SELECT
        attachment.*,
        printingRequest.RequestNumber,
        printingRequest.Status,
        printingRequest.TeacherId,
        requester.FullName AS TeacherName,
        department.DepartmentName,
        subject.SubjectName,
        purpose.PurposeName
      FROM dbo.RequestAttachments attachment
      JOIN dbo.PhotocopyRequests printingRequest
        ON printingRequest.RequestId = attachment.RequestId
       AND printingRequest.IsDeleted = 0
      LEFT JOIN dbo.Users requester
        ON requester.UserId = printingRequest.TeacherId
      LEFT JOIN dbo.Departments department
        ON department.DepartmentId = printingRequest.DepartmentId
      LEFT JOIN dbo.Subjects subject
        ON subject.SubjectId = printingRequest.SubjectId
      LEFT JOIN dbo.Purposes purpose
        ON purpose.PurposeId = printingRequest.PurposeId
      WHERE printingRequest.TeacherId = @RequesterId
      ORDER BY attachment.UploadedAt DESC, attachment.AttachmentId DESC;
    `);

  return result.recordset;
};

const getRequestBundle = async (requestId) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("RequestId", sql.Int, requestId)
    .query(`
      SELECT
        printingRequest.*,
        requester.FullName AS TeacherName,
        requester.EmployeeId,
        department.DepartmentName,
        sectionRecord.SectionName,
        subject.SubjectName,
        purpose.PurposeName,
        currentApprover.FullName AS CurrentApproverName,
        claimedBy.FullName AS ClaimedByName
      FROM dbo.PhotocopyRequests printingRequest
      LEFT JOIN dbo.Users requester
        ON requester.UserId = printingRequest.TeacherId
      LEFT JOIN dbo.Departments department
        ON department.DepartmentId = printingRequest.DepartmentId
      LEFT JOIN dbo.Sections sectionRecord
        ON sectionRecord.SectionId = printingRequest.SectionId
      LEFT JOIN dbo.Subjects subject
        ON subject.SubjectId = printingRequest.SubjectId
      LEFT JOIN dbo.Purposes purpose
        ON purpose.PurposeId = printingRequest.PurposeId
      LEFT JOIN dbo.Users currentApprover
        ON currentApprover.UserId = printingRequest.CurrentApproverId
      LEFT JOIN dbo.Users claimedBy
        ON claimedBy.UserId = printingRequest.ClaimedByUserId
      WHERE printingRequest.RequestId = @RequestId
        AND printingRequest.IsDeleted = 0;

      SELECT
        attachment.*
      FROM dbo.RequestAttachments attachment
      WHERE attachment.RequestId = @RequestId
      ORDER BY attachment.UploadedAt, attachment.AttachmentId;

      SELECT
        approval.*,
        approver.FullName AS ApproverName,
        approver.EmployeeId AS ApproverEmployeeId
      FROM dbo.RequestApprovals approval
      LEFT JOIN dbo.Users approver ON approver.UserId = approval.ApproverId
      WHERE approval.RequestId = @RequestId
      ORDER BY
        ISNULL(approval.StepOrder, 999),
        ISNULL(approval.AssignedAt, approval.ActionDate),
        approval.ApprovalId;

      SELECT
        workflowEvent.*,
        actor.FullName AS ActorName
      FROM dbo.PrintingWorkflowEvents workflowEvent
      LEFT JOIN dbo.Users actor ON actor.UserId = workflowEvent.ActorUserId
      WHERE workflowEvent.RequestId = @RequestId
      ORDER BY workflowEvent.CreatedAt, workflowEvent.WorkflowEventId;
    `);

  return {
    request: result.recordsets[0]?.[0] || null,
    attachments: result.recordsets[1] || [],
    approvals: result.recordsets[2] || [],
    events: result.recordsets[3] || [],
  };
};

const listApprovalInbox = async (approverId, approvalRole) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("ApproverId", sql.Int, approverId)
    .input("ApprovalRole", sql.NVarChar(50), approvalRole)
    .query(`
      SELECT
        printingRequest.*,
        requester.FullName AS TeacherName,
        requester.EmployeeId AS TeacherEmployeeId,
        department.DepartmentName,
        sectionRecord.SectionName,
        subject.SubjectName,
        purpose.PurposeName,
        approval.ApprovalId,
        approval.ApprovalRole,
        approval.AssignedAt
      FROM dbo.PhotocopyRequests printingRequest
      JOIN dbo.RequestApprovals approval
        ON approval.RequestId = printingRequest.RequestId
       AND approval.ApproverId = @ApproverId
       AND approval.ApprovalRole = @ApprovalRole
       AND approval.ApprovalStatus = 'Pending'
      LEFT JOIN dbo.Users requester
        ON requester.UserId = printingRequest.TeacherId
      LEFT JOIN dbo.Departments department
        ON department.DepartmentId = printingRequest.DepartmentId
      LEFT JOIN dbo.Sections sectionRecord
        ON sectionRecord.SectionId = printingRequest.SectionId
      LEFT JOIN dbo.Subjects subject
        ON subject.SubjectId = printingRequest.SubjectId
      LEFT JOIN dbo.Purposes purpose
        ON purpose.PurposeId = printingRequest.PurposeId
      WHERE printingRequest.CurrentApproverId = @ApproverId
        AND printingRequest.IsDeleted = 0
      ORDER BY
        CASE printingRequest.PriorityLevel
          WHEN 'Urgent' THEN 1
          WHEN 'High' THEN 2
          ELSE 3
        END,
        printingRequest.DueDate,
        approval.AssignedAt;
    `);

  return result.recordset;
};

const listApprovalHistory = async (approverId, approvalRole) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("ApproverId", sql.Int, approverId)
    .input("ApprovalRole", sql.NVarChar(50), approvalRole)
    .query(`
      SELECT
        approval.*,
        printingRequest.Status AS RequestStatus,
        printingRequest.RequestNumber,
        printingRequest.TotalPages,
        printingRequest.TotalSheets,
        printingRequest.PriorityLevel,
        printingRequest.SubmittedAt,
        printingRequest.ApprovedAt,
        requester.FullName AS TeacherName,
        requester.EmployeeId,
        department.DepartmentName,
        sectionRecord.SectionName,
        subject.SubjectName,
        purpose.PurposeName,
        approver.FullName AS ApproverName,
        approver.EmployeeId AS ApproverEmployeeId,
        approval.ApprovalRole AS DisplayApproverRole
      FROM dbo.RequestApprovals approval
      JOIN dbo.PhotocopyRequests printingRequest
        ON printingRequest.RequestId = approval.RequestId
      LEFT JOIN dbo.Users requester
        ON requester.UserId = printingRequest.TeacherId
      LEFT JOIN dbo.Users approver
        ON approver.UserId = approval.ApproverId
      LEFT JOIN dbo.Departments department
        ON department.DepartmentId = printingRequest.DepartmentId
      LEFT JOIN dbo.Sections sectionRecord
        ON sectionRecord.SectionId = printingRequest.SectionId
      LEFT JOIN dbo.Subjects subject
        ON subject.SubjectId = printingRequest.SubjectId
      LEFT JOIN dbo.Purposes purpose
        ON purpose.PurposeId = printingRequest.PurposeId
      WHERE approval.ApproverId = @ApproverId
        AND approval.ApprovalRole = @ApprovalRole
        AND approval.ApprovalStatus <> 'Pending'
        AND printingRequest.IsDeleted = 0
      ORDER BY approval.ActionDate DESC, approval.ApprovalId DESC;
    `);
  return result.recordset;
};

const getApprovalSummary = async (approverId, approvalRole) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("ApproverId", sql.Int, approverId)
    .input("ApprovalRole", sql.NVarChar(50), approvalRole)
    .query(`
      SELECT
        COUNT(*) AS TotalRequests,
        SUM(CASE WHEN approval.ApprovalStatus = 'Pending' THEN 1 ELSE 0 END)
          AS PendingReview,
        SUM(CASE WHEN approval.ApprovalStatus = 'Approved' THEN 1 ELSE 0 END)
          AS Approved,
        SUM(CASE WHEN approval.ApprovalStatus = 'Rejected' THEN 1 ELSE 0 END)
          AS Rejected,
        SUM(CASE WHEN approval.ApprovalStatus = 'Returned' THEN 1 ELSE 0 END)
          AS Returned,
        SUM(CASE
          WHEN printingRequest.Status = 'Completed' THEN 1 ELSE 0
        END) AS Completed
      FROM dbo.RequestApprovals approval
      JOIN dbo.PhotocopyRequests printingRequest
        ON printingRequest.RequestId = approval.RequestId
      WHERE approval.ApproverId = @ApproverId
        AND approval.ApprovalRole = @ApprovalRole
        AND printingRequest.IsDeleted = 0;
    `);
  return result.recordset[0] || {};
};

const updateRequestTerminalStatus = async (
  transaction,
  { requestId, status, remarks }
) => {
  const result = await request(transaction)
    .input("RequestId", sql.Int, requestId)
    .input("Status", sql.NVarChar(50), status)
    .input("Remarks", sql.NVarChar(sql.MAX), remarks)
    .query(`
      UPDATE dbo.PhotocopyRequests
      SET
        Status = @Status,
        CurrentApproverId = NULL,
        ClaimedByUserId = NULL,
        ClaimedAt = NULL,
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

module.exports = {
  sql,
  beginTransaction,
  createDraft,
  getDepartmentContext,
  validateLookupIds,
  getOwnedEditableRequest,
  getOwnedRequestForUpdate,
  insertAttachment,
  refreshRequestTotals,
  getRequestForSubmission,
  findHodApprover,
  findHosApprover,
  findPrintingOperator,
  updateRequestRoute,
  insertApproval,
  updatePendingApproval,
  closePendingApprovals,
  insertWorkflowEvent,
  getApprovalRequestForUpdate,
  getQuotaSnapshotForUpdate,
  listMyRequests,
  listMyAttachments,
  getRequestBundle,
  listApprovalInbox,
  listApprovalHistory,
  getApprovalSummary,
  updateRequestTerminalStatus,
};
