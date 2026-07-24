SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

/* ============================================================
   Printing Management workflow foundation
   - Keeps existing request data and table names
   - Adds server-owned document metadata and workflow history
   - Centralizes tenant-level printing configuration
   ============================================================ */

IF COL_LENGTH('dbo.PhotocopyRequests', 'SubmittedByAssignmentKey') IS NULL
  ALTER TABLE dbo.PhotocopyRequests
    ADD SubmittedByAssignmentKey nvarchar(100) NULL;
GO

IF COL_LENGTH('dbo.PhotocopyRequests', 'ClaimedByUserId') IS NULL
  ALTER TABLE dbo.PhotocopyRequests
    ADD ClaimedByUserId int NULL;
GO

IF COL_LENGTH('dbo.PhotocopyRequests', 'ClaimedAt') IS NULL
  ALTER TABLE dbo.PhotocopyRequests
    ADD ClaimedAt datetime NULL;
GO

IF COL_LENGTH('dbo.PhotocopyRequests', 'WorkflowVersion') IS NULL
BEGIN
  ALTER TABLE dbo.PhotocopyRequests
    ADD WorkflowVersion int NOT NULL
      CONSTRAINT DF_PhotocopyRequests_WorkflowVersion DEFAULT (1);
END;
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.foreign_keys
  WHERE name = 'FK_PhotocopyRequests_ClaimedBy'
)
BEGIN
  ALTER TABLE dbo.PhotocopyRequests WITH CHECK
    ADD CONSTRAINT FK_PhotocopyRequests_ClaimedBy
      FOREIGN KEY (ClaimedByUserId) REFERENCES dbo.Users(UserId);
END;
GO

IF COL_LENGTH('dbo.RequestAttachments', 'DocumentName') IS NULL
  ALTER TABLE dbo.RequestAttachments ADD DocumentName nvarchar(255) NULL;
GO

IF COL_LENGTH('dbo.RequestAttachments', 'PaperSize') IS NULL
  ALTER TABLE dbo.RequestAttachments ADD PaperSize nvarchar(20) NULL;
GO

IF COL_LENGTH('dbo.RequestAttachments', 'PrintType') IS NULL
  ALTER TABLE dbo.RequestAttachments ADD PrintType nvarchar(50) NULL;
GO

IF COL_LENGTH('dbo.RequestAttachments', 'PrintColor') IS NULL
  ALTER TABLE dbo.RequestAttachments ADD PrintColor nvarchar(50) NULL;
GO

IF COL_LENGTH('dbo.RequestAttachments', 'PagesPerSheet') IS NULL
BEGIN
  ALTER TABLE dbo.RequestAttachments
    ADD PagesPerSheet int NOT NULL
      CONSTRAINT DF_RequestAttachments_PagesPerSheet DEFAULT (1);
END;
GO

IF COL_LENGTH('dbo.RequestAttachments', 'PageSelection') IS NULL
  ALTER TABLE dbo.RequestAttachments ADD PageSelection nvarchar(30) NULL;
GO

IF COL_LENGTH('dbo.RequestAttachments', 'CustomPageRange') IS NULL
  ALTER TABLE dbo.RequestAttachments ADD CustomPageRange nvarchar(255) NULL;
GO

IF COL_LENGTH('dbo.RequestAttachments', 'SelectedPages') IS NULL
  ALTER TABLE dbo.RequestAttachments ADD SelectedPages int NULL;
GO

IF COL_LENGTH('dbo.RequestAttachments', 'SheetsPerSet') IS NULL
  ALTER TABLE dbo.RequestAttachments ADD SheetsPerSet int NULL;
GO

IF COL_LENGTH('dbo.PaperPurchases', 'BundlesPerBox') IS NULL
BEGIN
  ALTER TABLE dbo.PaperPurchases
    ADD BundlesPerBox int NOT NULL
      CONSTRAINT DF_PaperPurchases_BundlesPerBox DEFAULT (5) WITH VALUES;
END;
GO

IF COL_LENGTH('dbo.PaperPurchases', 'SheetsPerBundle') IS NULL
BEGIN
  ALTER TABLE dbo.PaperPurchases
    ADD SheetsPerBundle int NOT NULL
      CONSTRAINT DF_PaperPurchases_SheetsPerBundle DEFAULT (500) WITH VALUES;
END;
GO

IF EXISTS (
  SELECT 1
  FROM sys.computed_columns
  WHERE object_id = OBJECT_ID('dbo.PaperPurchases')
    AND name = 'TotalSheets'
    AND definition NOT LIKE '%SheetsPerBundle%'
)
BEGIN
  ALTER TABLE dbo.PaperPurchases DROP COLUMN TotalSheets;
END;
GO

IF EXISTS (
  SELECT 1
  FROM sys.computed_columns
  WHERE object_id = OBJECT_ID('dbo.PaperPurchases')
    AND name = 'TotalBundles'
    AND definition NOT LIKE '%BundlesPerBox%'
)
BEGIN
  ALTER TABLE dbo.PaperPurchases DROP COLUMN TotalBundles;
END;
GO

IF COL_LENGTH('dbo.PaperPurchases', 'TotalBundles') IS NULL
BEGIN
  ALTER TABLE dbo.PaperPurchases
    ADD TotalBundles AS (QuantityBoxes * BundlesPerBox) PERSISTED;
END;
GO

IF COL_LENGTH('dbo.PaperPurchases', 'TotalSheets') IS NULL
BEGIN
  ALTER TABLE dbo.PaperPurchases
    ADD TotalSheets AS (
      QuantityBoxes * BundlesPerBox * SheetsPerBundle
    ) PERSISTED;
END;
GO

IF COL_LENGTH('dbo.PaperDistributions', 'SheetsPerBundle') IS NULL
BEGIN
  ALTER TABLE dbo.PaperDistributions
    ADD SheetsPerBundle int NOT NULL
      CONSTRAINT DF_PaperDistributions_SheetsPerBundle DEFAULT (500) WITH VALUES;
END;
GO

IF COL_LENGTH('dbo.RequestApprovals', 'AssignedAt') IS NULL
  ALTER TABLE dbo.RequestApprovals ADD AssignedAt datetime NULL;
GO

IF COL_LENGTH('dbo.RequestApprovals', 'StepOrder') IS NULL
  ALTER TABLE dbo.RequestApprovals ADD StepOrder int NULL;
GO

IF COL_LENGTH('dbo.RequestApprovals', 'ScopeType') IS NULL
  ALTER TABLE dbo.RequestApprovals ADD ScopeType nvarchar(50) NULL;
GO

IF COL_LENGTH('dbo.RequestApprovals', 'ScopeEntityId') IS NULL
  ALTER TABLE dbo.RequestApprovals ADD ScopeEntityId int NULL;
GO

IF OBJECT_ID('dbo.PrintingWorkflowEvents', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.PrintingWorkflowEvents (
    WorkflowEventId bigint IDENTITY(1,1) NOT NULL
      CONSTRAINT PK_PrintingWorkflowEvents PRIMARY KEY,
    RequestId int NOT NULL,
    EventType nvarchar(50) NOT NULL,
    FromStatus nvarchar(50) NULL,
    ToStatus nvarchar(50) NULL,
    ActorUserId int NULL,
    ActorAssignmentKey nvarchar(100) NULL,
    Remarks nvarchar(max) NULL,
    MetadataJson nvarchar(max) NULL,
    CreatedAt datetime NOT NULL
      CONSTRAINT DF_PrintingWorkflowEvents_CreatedAt DEFAULT (GETDATE()),
    CONSTRAINT FK_PrintingWorkflowEvents_Request
      FOREIGN KEY (RequestId) REFERENCES dbo.PhotocopyRequests(RequestId),
    CONSTRAINT FK_PrintingWorkflowEvents_Actor
      FOREIGN KEY (ActorUserId) REFERENCES dbo.Users(UserId)
  );

  CREATE INDEX IX_PrintingWorkflowEvents_Request_CreatedAt
    ON dbo.PrintingWorkflowEvents(RequestId, CreatedAt DESC);
END;
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE object_id = OBJECT_ID('dbo.PrintingWorkflowEvents')
    AND name = 'IX_PrintingWorkflowEvents_Request_CreatedAt'
)
BEGIN
  CREATE INDEX IX_PrintingWorkflowEvents_Request_CreatedAt
    ON dbo.PrintingWorkflowEvents(RequestId, CreatedAt DESC);
END;
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.foreign_keys
  WHERE name = 'FK_PrintingWorkflowEvents_Request'
)
BEGIN
  ALTER TABLE dbo.PrintingWorkflowEvents WITH CHECK
    ADD CONSTRAINT FK_PrintingWorkflowEvents_Request
      FOREIGN KEY (RequestId) REFERENCES dbo.PhotocopyRequests(RequestId);
END;
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.foreign_keys
  WHERE name = 'FK_PrintingWorkflowEvents_Actor'
)
BEGIN
  ALTER TABLE dbo.PrintingWorkflowEvents WITH CHECK
    ADD CONSTRAINT FK_PrintingWorkflowEvents_Actor
      FOREIGN KEY (ActorUserId) REFERENCES dbo.Users(UserId);
END;
GO

IF OBJECT_ID('dbo.PrintingJobConsumptions', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.PrintingJobConsumptions (
    PrintingJobConsumptionId bigint IDENTITY(1,1) NOT NULL
      CONSTRAINT PK_PrintingJobConsumptions PRIMARY KEY,
    RequestId int NOT NULL,
    PaperType varchar(10) NOT NULL,
    ExpectedSheets int NOT NULL,
    ActualSheets int NOT NULL,
    RecordedBy int NOT NULL,
    RecordedAt datetime NOT NULL
      CONSTRAINT DF_PrintingJobConsumptions_RecordedAt DEFAULT (GETDATE()),
    CONSTRAINT FK_PrintingJobConsumptions_Request
      FOREIGN KEY (RequestId) REFERENCES dbo.PhotocopyRequests(RequestId),
    CONSTRAINT FK_PrintingJobConsumptions_User
      FOREIGN KEY (RecordedBy) REFERENCES dbo.Users(UserId)
  );

  CREATE INDEX IX_PrintingJobConsumptions_Request
    ON dbo.PrintingJobConsumptions(RequestId);
END;
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE object_id = OBJECT_ID('dbo.PrintingJobConsumptions')
    AND name = 'IX_PrintingJobConsumptions_Request'
)
BEGIN
  CREATE INDEX IX_PrintingJobConsumptions_Request
    ON dbo.PrintingJobConsumptions(RequestId);
END;
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.foreign_keys
  WHERE name = 'FK_PrintingJobConsumptions_Request'
)
BEGIN
  ALTER TABLE dbo.PrintingJobConsumptions WITH CHECK
    ADD CONSTRAINT FK_PrintingJobConsumptions_Request
      FOREIGN KEY (RequestId) REFERENCES dbo.PhotocopyRequests(RequestId);
END;
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.foreign_keys
  WHERE name = 'FK_PrintingJobConsumptions_User'
)
BEGIN
  ALTER TABLE dbo.PrintingJobConsumptions WITH CHECK
    ADD CONSTRAINT FK_PrintingJobConsumptions_User
      FOREIGN KEY (RecordedBy) REFERENCES dbo.Users(UserId);
END;
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE object_id = OBJECT_ID('dbo.PrintingJobConsumptions')
    AND name = 'UX_PrintingJobConsumptions_Request_PaperType'
)
BEGIN
  CREATE UNIQUE INDEX UX_PrintingJobConsumptions_Request_PaperType
    ON dbo.PrintingJobConsumptions(RequestId, PaperType);
END;
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE object_id = OBJECT_ID('dbo.PhotocopyRequests')
    AND name = 'IX_PhotocopyRequests_Queue'
)
BEGIN
  CREATE INDEX IX_PhotocopyRequests_Queue
    ON dbo.PhotocopyRequests(Status, ClaimedByUserId, SubmittedAt DESC)
    INCLUDE (RequestNumber, DepartmentId, SubjectId, TotalSheets, DueDate);
END;
GO

DECLARE @PrintingSettings TABLE (
  SettingKey nvarchar(150) NOT NULL,
  SettingValue nvarchar(max) NULL
);

INSERT INTO @PrintingSettings (SettingKey, SettingValue)
VALUES
  (N'printing.approval.threshold_sheets', N'500'),
  (N'printing.require_hod_approval', N'true'),
  (N'printing.hod_self_approval', N'false'),
  (N'printing.queue.assignment_mode', N'shared'),
  (N'printing.request.allow_return', N'true'),
  (N'printing.request.allow_cancel_before_printing', N'true'),
  (N'printing.inventory.bundle_sheets', N'500'),
  (N'printing.inventory.bundles_per_box', N'5'),
  (N'printing.inventory.low_stock_a4', N'3000'),
  (N'printing.inventory.low_stock_a3', N'1500'),
  (N'printing.upload.max_mb', N'20'),
  (N'printing.upload.allowed_extensions', N'pdf,docx,pptx,jpg,jpeg,png');

MERGE dbo.SchoolSettings AS target
USING (
  SELECT s.SchoolId, cfg.SettingKey, cfg.SettingValue
  FROM dbo.Schools s
  CROSS JOIN @PrintingSettings cfg
) AS source
ON target.SchoolId = source.SchoolId
AND target.SettingKey = source.SettingKey
WHEN NOT MATCHED THEN
  INSERT (
    SchoolId,
    SettingKey,
    SettingValue,
    SettingGroup,
    IsEditable,
    UpdatedAt
  )
  VALUES (
    source.SchoolId,
    source.SettingKey,
    source.SettingValue,
    N'Printing',
    1,
    GETDATE()
  );
GO

CREATE OR ALTER VIEW dbo.vw_DepartmentMonthlyUsage AS
SELECT
  DepartmentId,
  MONTH(SubmittedAt) AS MonthNumber,
  YEAR(SubmittedAt) AS YearNumber,
  SUM(TotalSheets) AS UsedSheets
FROM dbo.PhotocopyRequests
WHERE Status IN (
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
GROUP BY DepartmentId, MONTH(SubmittedAt), YEAR(SubmittedAt);
GO

CREATE OR ALTER VIEW dbo.vw_SubjectMonthlyUsage AS
SELECT
  DepartmentId,
  SubjectId,
  MONTH(SubmittedAt) AS MonthNumber,
  YEAR(SubmittedAt) AS YearNumber,
  SUM(TotalSheets) AS UsedSheets
FROM dbo.PhotocopyRequests
WHERE Status IN (
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
GROUP BY
  DepartmentId,
  SubjectId,
  MONTH(SubmittedAt),
  YEAR(SubmittedAt);
GO
