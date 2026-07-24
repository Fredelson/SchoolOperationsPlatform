USE [master];
GO

IF DB_ID(N'OperationsPlatformDB') IS NOT NULL
BEGIN
    ALTER DATABASE [OperationsPlatformDB] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE [OperationsPlatformDB];
END
GO

CREATE DATABASE [OperationsPlatformDB];
GO

ALTER DATABASE [OperationsPlatformDB] SET RECOVERY SIMPLE;
GO

USE [OperationsPlatformDB];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

PRINT N'Beginning OperationsPlatformDB fresh schema installation (no users/assets)...';
GO

/*
============================================================
ARAB UNITY SCHOOL OPERATIONS PLATFORM
Fresh Database Installation Script
Database: OperationsPlatformDB

Purpose:
- Creates OperationsPlatformDB using SQL Server's default
  database file locations.
- Creates all scripted objects, constraints, and seed data.
- Avoids machine-specific MDF/LDF paths.

Run this entire file in SQL Server Management Studio.
============================================================
*/

USE [master];
GO

IF DB_ID(N'OperationsPlatformDB') IS NULL
BEGIN
    PRINT N'Creating OperationsPlatformDB...';
    CREATE DATABASE [OperationsPlatformDB];
END
ELSE
BEGIN
    PRINT N'OperationsPlatformDB already exists. Existing database will be used.';
END
GO

ALTER DATABASE [OperationsPlatformDB] SET RECOVERY SIMPLE;
GO

USE [OperationsPlatformDB];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

PRINT N'Beginning OperationsPlatformDB installation...';
GO

/****** Object:  Table [dbo].[PhotocopyRequests]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PhotocopyRequests](
	[RequestId] [int] IDENTITY(1,1) NOT NULL,
	[RequestNumber] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[TeacherId] [int] NOT NULL,
	[DepartmentId] [int] NOT NULL,
	[SectionId] [int] NULL,
	[SubjectId] [int] NOT NULL,
	[PurposeId] [int] NOT NULL,
	[Copies] [int] NOT NULL,
	[TotalPages] [int] NOT NULL,
	[TotalSheets] [int] NOT NULL,
	[PriorityLevel] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Status] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[CurrentApproverId] [int] NULL,
	[SourceModule] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SourceEntityType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SourceEntityId] [int] NULL,
	[PaperSize] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[PrintType] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[PrintSide] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IsExam] [bit] NOT NULL,
	[DueDate] [datetime] NULL,
	[Remarks] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SubmittedAt] [datetime] NOT NULL,
	[ApprovedAt] [datetime] NULL,
	[PrintedAt] [datetime] NULL,
	[CompletedAt] [datetime] NULL,
	[UpdatedAt] [datetime] NULL,
	[IsDeleted] [bit] NOT NULL,
	[DeletedAt] [datetime] NULL,
	[DeletedBy] [int] NULL,
	[SchoolId] [int] NULL,
	[SubmittedByAssignmentKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ClaimedByUserId] [int] NULL,
	[ClaimedAt] [datetime] NULL,
	[WorkflowVersion] [int] NOT NULL CONSTRAINT [DF_PhotocopyRequests_WorkflowVersion] DEFAULT ((1)),
PRIMARY KEY CLUSTERED 
(
	[RequestId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  View [dbo].[vw_DepartmentMonthlyUsage]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/* ============================================================
   16. VIEWS
   ============================================================ */

CREATE VIEW [dbo].[vw_DepartmentMonthlyUsage] AS
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
/****** Object:  View [dbo].[vw_SubjectMonthlyUsage]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[vw_SubjectMonthlyUsage] AS
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
GROUP BY DepartmentId, SubjectId, MONTH(SubmittedAt), YEAR(SubmittedAt);
GO
/****** Object:  Table [dbo].[StaffImportStaging]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[StaffImportStaging](
	[StaffImportStagingId] [int] IDENTITY(1,1) NOT NULL,
	[StaffImportBatchId] [int] NOT NULL,
	[EmployeeId] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[FullName] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[SchoolEmail] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[DerivedRoleKey] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[MatchedUserId] [int] NULL,
	[ValidationStatus] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ValidationMessage] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ImportStatus] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ImportMessage] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[AssignmentKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ScopeType] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ScopeName] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[DepartmentName] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SubjectName] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CreatedAt] [datetime] NOT NULL,
	[ImportedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[StaffImportStagingId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  View [dbo].[vw_StaffImportValidation]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   VIEW [dbo].[vw_StaffImportValidation] AS
SELECT
    s.StaffImportStagingId,
    s.StaffImportBatchId,
    s.EmployeeId,
    s.FullName,
    s.SchoolEmail,
    CASE
        WHEN s.EmployeeId LIKE 'T%' THEN 'Teacher'
        WHEN s.EmployeeId LIKE 'A%' THEN 'Admin'
        ELSE NULL
    END AS SuggestedRoleKey,
    CASE
        WHEN LTRIM(RTRIM(ISNULL(s.EmployeeId, ''))) = '' THEN 'Invalid'
        WHEN LTRIM(RTRIM(ISNULL(s.FullName, ''))) = '' THEN 'Invalid'
        WHEN LTRIM(RTRIM(ISNULL(s.SchoolEmail, ''))) = '' THEN 'Invalid'
        WHEN s.SchoolEmail NOT LIKE '%@%' THEN 'Invalid'
        WHEN s.EmployeeId NOT LIKE 'T%' AND s.EmployeeId NOT LIKE 'A%' THEN 'Invalid'
        ELSE 'Valid'
    END AS SuggestedValidationStatus,
    CASE
        WHEN LTRIM(RTRIM(ISNULL(s.EmployeeId, ''))) = '' THEN 'Missing Employee ID'
        WHEN LTRIM(RTRIM(ISNULL(s.FullName, ''))) = '' THEN 'Missing Full Name'
        WHEN LTRIM(RTRIM(ISNULL(s.SchoolEmail, ''))) = '' THEN 'Missing School Email'
        WHEN s.SchoolEmail NOT LIKE '%@%' THEN 'Invalid School Email'
        WHEN s.EmployeeId NOT LIKE 'T%' AND s.EmployeeId NOT LIKE 'A%' THEN 'Employee ID must start with T or A'
        ELSE 'Ready'
    END AS SuggestedValidationMessage
FROM dbo.StaffImportStaging s;
GO
/****** Object:  Table [dbo].[AcademicYears]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AcademicYears](
	[AcademicYearId] [int] IDENTITY(1,1) NOT NULL,
	[AcademicYearName] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[StartDate] [date] NULL,
	[EndDate] [date] NULL,
	[IsCurrent] [bit] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[AcademicYearId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AccessLevels]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AccessLevels](
	[AccessLevelId] [int] IDENTITY(1,1) NOT NULL,
	[AccessLevelKey] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[AccessLevelName] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[DisplayName] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Description] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SortOrder] [int] NOT NULL,
	[IsSystemLevel] [bit] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[AccessLevelId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ActivityTimeline]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ActivityTimeline](
	[ActivityTimelineId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NULL,
	[ModuleKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[EntityType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[EntityId] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ActivityType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ActivityTitle] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ActivityDescription] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ActivityTimelineId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AIPrompts]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AIPrompts](
	[AIPromptId] [int] IDENTITY(1,1) NOT NULL,
	[PromptKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[PromptName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ModuleId] [int] NULL,
	[PromptText] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[VisibilityStatusId] [int] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[AIPromptId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AIUsageLogs]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AIUsageLogs](
	[AIUsageLogId] [int] IDENTITY(1,1) NOT NULL,
	[AIPromptId] [int] NULL,
	[UserId] [int] NULL,
	[ModuleKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[EntityType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[EntityId] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[InputSummary] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[OutputSummary] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[TokenCount] [int] NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[AIUsageLogId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AnnouncementBanners]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AnnouncementBanners](
	[AnnouncementBannerId] [int] IDENTITY(1,1) NOT NULL,
	[BannerKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Title] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Message] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[BannerType] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[VisibilityStatusId] [int] NOT NULL,
	[StartAt] [datetime] NULL,
	[EndAt] [datetime] NULL,
	[CreatedBy] [int] NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[AnnouncementBannerId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ApiKeys]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ApiKeys](
	[ApiKeyId] [int] IDENTITY(1,1) NOT NULL,
	[ApiKeyName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ApiKeyHash] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ScopeJson] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CreatedBy] [int] NULL,
	[CreatedAt] [datetime] NOT NULL,
	[ExpiresAt] [datetime] NULL,
	[RevokedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[ApiKeyId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ArchivePolicies]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ArchivePolicies](
	[ArchivePolicyId] [int] IDENTITY(1,1) NOT NULL,
	[PolicyKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[PolicyName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[EntityType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[RetentionMonths] [int] NULL,
	[ArchiveByAcademicYear] [bit] NOT NULL,
	[VisibilityStatusId] [int] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[ArchivePolicyId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ArchiveRecords]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ArchiveRecords](
	[ArchiveRecordId] [int] IDENTITY(1,1) NOT NULL,
	[ArchiveRunId] [int] NOT NULL,
	[EntityType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[EntityId] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ArchiveStatus] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ArchiveData] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ArchivedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ArchiveRecordId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ArchiveRuns]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ArchiveRuns](
	[ArchiveRunId] [int] IDENTITY(1,1) NOT NULL,
	[ArchivePolicyId] [int] NOT NULL,
	[RunStatus] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[RecordsEvaluated] [int] NOT NULL,
	[RecordsArchived] [int] NOT NULL,
	[StartedBy] [int] NULL,
	[StartedAt] [datetime] NOT NULL,
	[CompletedAt] [datetime] NULL,
	[ErrorMessage] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[ArchiveRunId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AssignmentTypes]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AssignmentTypes](
	[AssignmentTypeId] [int] IDENTITY(1,1) NOT NULL,
	[AssignmentKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[AssignmentName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Description] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IsSystemAssignment] [bit] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[SortOrder] [int] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[AssignmentTypeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AuditLogs]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AuditLogs](
	[AuditLogId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NULL,
	[ActionType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[EntityType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[EntityId] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Description] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[OldValue] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[NewValue] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IpAddress] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[AuditLogId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[BackgroundJobLogs]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BackgroundJobLogs](
	[BackgroundJobLogId] [int] IDENTITY(1,1) NOT NULL,
	[JobKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[JobName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[JobStatus] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[StartedAt] [datetime] NOT NULL,
	[CompletedAt] [datetime] NULL,
	[ErrorMessage] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[BackgroundJobLogId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[BackupJobs]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BackupJobs](
	[BackupJobId] [int] IDENTITY(1,1) NOT NULL,
	[BackupType] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[BackupStatus] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[BackupFilePath] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[StartedBy] [int] NULL,
	[StartedAt] [datetime] NOT NULL,
	[CompletedAt] [datetime] NULL,
	[ErrorMessage] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[BackupJobId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Branding]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Branding](
	[BrandingId] [int] IDENTITY(1,1) NOT NULL,
	[SchoolId] [int] NOT NULL,
	[LogoFileId] [int] NULL,
	[SmallLogoFileId] [int] NULL,
	[DarkLogoFileId] [int] NULL,
	[FaviconFileId] [int] NULL,
	[LoginBackgroundFileId] [int] NULL,
	[LoginVideoFileId] [int] NULL,
	[PrimaryColor] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SecondaryColor] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[AccentColor] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SidebarColor] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[TopbarColor] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[LoginCardColor] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[LoginTitle] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[LoginSubtitle] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[FooterText] [nvarchar](500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Website] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SupportEmail] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SupportPhone] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IsActive] [bit] NOT NULL,
	[UpdatedBy] [int] NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
	[UseSidebarGradient] [bit] NOT NULL,
	[SidebarGradientStart] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SidebarGradientEnd] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SidebarGradientDirection] [nvarchar](30) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[UseTopbarGradient] [bit] NOT NULL,
	[TopbarGradientStart] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[TopbarGradientEnd] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[TopbarGradientDirection] [nvarchar](30) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SidebarBackgroundType] [nvarchar](30) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[TopbarBackgroundType] [nvarchar](30) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SidebarGradientMiddle] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[TopbarGradientMiddle] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SidebarGradientPosition] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[TopbarGradientPosition] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[TopbarLogoX] [int] NULL,
	[TopbarLogoY] [int] NULL,
	[TopbarLogoWidth] [int] NULL,
	[TopbarLogoHeight] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[BrandingId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[BrandingSlides]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BrandingSlides](
	[BrandingSlideId] [int] IDENTITY(1,1) NOT NULL,
	[BrandingId] [int] NOT NULL,
	[FileId] [int] NULL,
	[SlideTitle] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SlideSubtitle] [nvarchar](500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ButtonText] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ButtonUrl] [nvarchar](500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[VisibilityStatusId] [int] NOT NULL,
	[StartAt] [datetime] NULL,
	[EndAt] [datetime] NULL,
	[SortOrder] [int] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[BrandingSlideId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Buildings]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Buildings](
	[BuildingId] [int] IDENTITY(1,1) NOT NULL,
	[BuildingKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[BuildingName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Description] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[BuildingId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Buttons]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Buttons](
	[ButtonId] [int] IDENTITY(1,1) NOT NULL,
	[ModuleId] [int] NOT NULL,
	[ButtonKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ButtonName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[PermissionId] [int] NULL,
	[FeatureFlagId] [int] NULL,
	[VisibilityStatusId] [int] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[ButtonId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CalendarEventAttendees]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CalendarEventAttendees](
	[CalendarEventAttendeeId] [int] IDENTITY(1,1) NOT NULL,
	[CalendarEventId] [int] NOT NULL,
	[UserId] [int] NULL,
	[Email] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ResponseStatus] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[CalendarEventAttendeeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CalendarEvents]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CalendarEvents](
	[CalendarEventId] [int] IDENTITY(1,1) NOT NULL,
	[SchoolId] [int] NULL,
	[CalendarEventTypeId] [int] NOT NULL,
	[Title] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Description] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[StartAt] [datetime] NOT NULL,
	[EndAt] [datetime] NULL,
	[IsAllDay] [bit] NOT NULL,
	[LocationText] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[RoomId] [int] NULL,
	[EntityType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[EntityId] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CreatedBy] [int] NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[CalendarEventId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CalendarEventTypes]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CalendarEventTypes](
	[CalendarEventTypeId] [int] IDENTITY(1,1) NOT NULL,
	[EventTypeKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[EventTypeName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ModuleId] [int] NULL,
	[ColorHex] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IsActive] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[CalendarEventTypeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Classes]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Classes](
	[ClassId] [int] IDENTITY(1,1) NOT NULL,
	[AcademicYearId] [int] NOT NULL,
	[SectionId] [int] NULL,
	[YearLevelId] [int] NOT NULL,
	[RoomId] [int] NULL,
	[ClassKey] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ClassName] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[ClassId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ConfigurationSnapshots]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ConfigurationSnapshots](
	[ConfigurationSnapshotId] [int] IDENTITY(1,1) NOT NULL,
	[SnapshotType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[SnapshotName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[SnapshotData] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[CreatedBy] [int] NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ConfigurationSnapshotId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DashboardKPIs]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DashboardKPIs](
	[DashboardKPIId] [int] IDENTITY(1,1) NOT NULL,
	[DashboardId] [int] NOT NULL,
	[KPIDefinitionId] [int] NOT NULL,
	[SortOrder] [int] NOT NULL,
	[IsVisible] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[DashboardKPIId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Dashboards]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Dashboards](
	[DashboardId] [int] IDENTITY(1,1) NOT NULL,
	[DashboardKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[DashboardName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[WorkspaceId] [int] NULL,
	[RoleId] [int] NULL,
	[AssignmentTypeId] [int] NULL,
	[ModuleId] [int] NULL,
	[IsDefault] [bit] NOT NULL,
	[VisibilityStatusId] [int] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[DashboardId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DashboardWidgets]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DashboardWidgets](
	[DashboardWidgetId] [int] IDENTITY(1,1) NOT NULL,
	[DashboardId] [int] NOT NULL,
	[WidgetId] [int] NOT NULL,
	[GridX] [int] NOT NULL,
	[GridY] [int] NOT NULL,
	[GridW] [int] NOT NULL,
	[GridH] [int] NOT NULL,
	[SortOrder] [int] NOT NULL,
	[IsRequired] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[DashboardWidgetId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DepartmentPrintLimits]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DepartmentPrintLimits](
	[DepartmentLimitId] [int] IDENTITY(1,1) NOT NULL,
	[DepartmentId] [int] NOT NULL,
	[MonthNumber] [int] NOT NULL,
	[YearNumber] [int] NOT NULL,
	[SheetLimit] [int] NOT NULL,
	[CreatedBy] [int] NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[DepartmentLimitId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Departments]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Departments](
	[DepartmentId] [int] IDENTITY(1,1) NOT NULL,
	[DepartmentKey] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[DepartmentName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[DepartmentCode] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[DepartmentType] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SectionId] [int] NULL,
	[IsAcademic] [bit] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[SortOrder] [int] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
	[SchoolId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[DepartmentId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DocumentBranding]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DocumentBranding](
	[DocumentBrandingId] [int] IDENTITY(1,1) NOT NULL,
	[SchoolId] [int] NOT NULL,
	[BrandingKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[BrandingName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[HeaderLogoFileId] [int] NULL,
	[WatermarkFileId] [int] NULL,
	[SignatureFileId] [int] NULL,
	[HeaderText] [nvarchar](500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[FooterText] [nvarchar](500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[DisclaimerText] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[PrimaryColor] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SecondaryColor] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IsDefault] [bit] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[UpdatedBy] [int] NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[DocumentBrandingId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DocumentSequences]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DocumentSequences](
	[DocumentSequenceId] [int] IDENTITY(1,1) NOT NULL,
	[SequenceKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[EntityType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Prefix] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[CurrentValue] [int] NOT NULL,
	[PaddingLength] [int] NOT NULL,
	[ResetEveryYear] [bit] NOT NULL,
	[LastResetYear] [int] NULL,
	[IsActive] [bit] NOT NULL,
	[UpdatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[DocumentSequenceId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[EmailQueue]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EmailQueue](
	[EmailQueueId] [int] IDENTITY(1,1) NOT NULL,
	[ToEmail] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[CcEmail] [nvarchar](500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[BccEmail] [nvarchar](500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Subject] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[BodyHtml] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Status] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Attempts] [int] NOT NULL,
	[LastError] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[RelatedEntityType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[RelatedEntityId] [int] NULL,
	[QueuedAt] [datetime] NOT NULL,
	[SentAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[EmailQueueId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[EmailTemplates]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EmailTemplates](
	[EmailTemplateId] [int] IDENTITY(1,1) NOT NULL,
	[TemplateKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[TemplateName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Subject] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[BodyHtml] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
	[SchoolId] [int] NULL,
	[HeaderLogoFileId] [int] NULL,
	[FooterText] [nvarchar](500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[EmailTemplateId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[EmailVerificationTokens]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EmailVerificationTokens](
	[EmailVerificationTokenId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[TokenHash] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ExpiresAt] [datetime] NOT NULL,
	[UsedAt] [datetime] NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[EmailVerificationTokenId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[EntityComments]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EntityComments](
	[EntityCommentId] [int] IDENTITY(1,1) NOT NULL,
	[EntityType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[EntityId] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[CommentText] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[CommentType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CreatedBy] [int] NULL,
	[CreatedAt] [datetime] NOT NULL,
	[IsDeleted] [bit] NOT NULL,
	[DeletedAt] [datetime] NULL,
	[DeletedBy] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[EntityCommentId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[EntityFiles]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EntityFiles](
	[EntityFileId] [int] IDENTITY(1,1) NOT NULL,
	[EntityType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[EntityId] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[FileId] [int] NOT NULL,
	[FilePurpose] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[UploadedBy] [int] NULL,
	[UploadedAt] [datetime] NOT NULL,
	[IsDeleted] [bit] NOT NULL,
	[DeletedAt] [datetime] NULL,
	[DeletedBy] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[EntityFileId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[EntityTags]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EntityTags](
	[EntityTagId] [int] IDENTITY(1,1) NOT NULL,
	[EntityType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[EntityId] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[TagId] [int] NOT NULL,
	[TaggedBy] [int] NULL,
	[TaggedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[EntityTagId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[FeatureFlags]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[FeatureFlags](
	[FeatureFlagId] [int] IDENTITY(1,1) NOT NULL,
	[FeatureKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[FeatureName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Description] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ModuleId] [int] NULL,
	[VisibilityStatusId] [int] NOT NULL,
	[IsEnabled] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[FeatureFlagId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[FeatureVisibilityStatuses]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[FeatureVisibilityStatuses](
	[VisibilityStatusId] [int] IDENTITY(1,1) NOT NULL,
	[StatusKey] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[StatusName] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Description] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SortOrder] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[VisibilityStatusId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[FileStorage]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[FileStorage](
	[FileId] [int] IDENTITY(1,1) NOT NULL,
	[OriginalFileName] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[StoredFileName] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[FilePath] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[FileType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[FileSizeKB] [decimal](18, 2) NULL,
	[EntityType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[EntityId] [int] NULL,
	[UploadedBy] [int] NULL,
	[UploadedAt] [datetime] NOT NULL,
	[IsDeleted] [bit] NOT NULL,
	[DeletedAt] [datetime] NULL,
	[DeletedBy] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[FileId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[GlobalSearchEntities]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[GlobalSearchEntities](
	[GlobalSearchEntityId] [int] IDENTITY(1,1) NOT NULL,
	[EntityKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[EntityName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ModuleId] [int] NULL,
	[SearchRouteTemplate] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[PermissionId] [int] NULL,
	[VisibilityStatusId] [int] NOT NULL,
	[SortOrder] [int] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[GlobalSearchEntityId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ImportErrorLogs]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ImportErrorLogs](
	[ImportErrorLogId] [int] IDENTITY(1,1) NOT NULL,
	[ImportType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[BatchId] [int] NULL,
	[SourceSheet] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SourceRow] [int] NULL,
	[RawData] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ErrorType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ErrorMessage] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[IsResolved] [bit] NOT NULL,
	[ResolvedBy] [int] NULL,
	[ResolvedAt] [datetime] NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ImportErrorLogId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Integrations]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Integrations](
	[IntegrationId] [int] IDENTITY(1,1) NOT NULL,
	[IntegrationKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[IntegrationName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[IntegrationType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[VisibilityStatusId] [int] NOT NULL,
	[IsConfigured] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[IntegrationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[IntegrationSettings]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[IntegrationSettings](
	[IntegrationSettingId] [int] IDENTITY(1,1) NOT NULL,
	[IntegrationId] [int] NOT NULL,
	[SettingKey] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[SettingValue] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IsSecret] [bit] NOT NULL,
	[UpdatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[IntegrationSettingId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[InventoryItemTypes]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[InventoryItemTypes](
	[InventoryItemTypeId] [int] IDENTITY(1,1) NOT NULL,
	[ItemTypeKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ItemTypeName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Description] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[VisibilityStatusId] [int] NOT NULL,
	[IsConsumable] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[InventoryItemTypeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[InventoryTransactions]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[InventoryTransactions](
	[TransactionId] [int] IDENTITY(1,1) NOT NULL,
	[InventoryItemTypeId] [int] NULL,
	[PaperType] [varchar](10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[TransactionType] [varchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Quantity] [int] NOT NULL,
	[PreviousStock] [int] NOT NULL,
	[NewStock] [int] NOT NULL,
	[ReferenceId] [int] NULL,
	[Remarks] [varchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CreatedBy] [int] NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[TransactionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssetAssignments]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetAssignments](
	[AssetAssignmentId] [int] IDENTITY(1,1) NOT NULL,
	[AssetId] [int] NOT NULL,
	[AssignmentTargetType] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[AssignedToUserId] [int] NULL,
	[AssignedToName] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[AssignedToEmail] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[AssignedToEmployeeCode] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[RoomId] [int] NULL,
	[DepartmentId] [int] NULL,
	[LocationId] [int] NULL,
	[AssignedByUserId] [int] NULL,
	[AssignedAt] [datetime] NOT NULL,
	[ReturnedAt] [datetime] NULL,
	[Notes] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ReturnNotes] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ReturnConditionId] [int] NULL,
	[ReturnIssueTypeId] [int] NULL,
	[ReturnIssuePriority] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ReturnIssueTypeIdsJson] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[AssetAssignmentId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssetBorrows]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetBorrows](
	[AssetBorrowId] [int] IDENTITY(1,1) NOT NULL,
	[AssetId] [int] NOT NULL,
	[BorrowedByUserId] [int] NULL,
	[BorrowedByName] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[BorrowedByEmail] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[BorrowedByEmployeeCode] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[BorrowedFromRoomId] [int] NULL,
	[BorrowedFromDepartmentId] [int] NULL,
	[BorrowedFromLocationId] [int] NULL,
	[BorrowedAt] [datetime] NOT NULL,
	[ExpectedReturnAt] [datetime] NULL,
	[ReturnedAt] [datetime] NULL,
	[ApprovedByUserId] [int] NULL,
	[ReturnedByUserId] [int] NULL,
	[Notes] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ReturnNotes] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
	[ReturnConditionId] [int] NULL,
	[ReturnIssueTypeIdsJson] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[AssetBorrowId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssetBrands]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetBrands](
	[ITAssetBrandId] [int] IDENTITY(1,1) NOT NULL,
	[BrandName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[IsActive] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ITAssetBrandId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssetCategories]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetCategories](
	[ITAssetCategoryId] [int] IDENTITY(1,1) NOT NULL,
	[CategoryKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[CategoryName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Description] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[VisibilityStatusId] [int] NOT NULL,
	[SortOrder] [int] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
	[IconKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[ITAssetCategoryId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssetConditions]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetConditions](
	[ITAssetConditionId] [int] IDENTITY(1,1) NOT NULL,
	[ConditionKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ConditionName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Description] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SortOrder] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ITAssetConditionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssetDisposals]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetDisposals](
	[DisposalId] [int] IDENTITY(1,1) NOT NULL,
	[AssetId] [int] NOT NULL,
	[DisposalStatus] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Reason] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[RequestedBy] [int] NULL,
	[ApprovedBy] [int] NULL,
	[RequestedAt] [datetime] NOT NULL,
	[ApprovedAt] [datetime] NULL,
	[DisposedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[DisposalId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssetGroupItems]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetGroupItems](
	[AssetGroupItemId] [int] IDENTITY(1,1) NOT NULL,
	[AssetGroupId] [int] NOT NULL,
	[AssetId] [int] NOT NULL,
	[RoleInGroup] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[AddedBy] [int] NULL,
	[AddedAt] [datetime] NOT NULL,
	[RemovedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[AssetGroupItemId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssetGroups]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetGroups](
	[AssetGroupId] [int] IDENTITY(1,1) NOT NULL,
	[AssetGroupKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[AssetGroupName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[GroupType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[RoomId] [int] NULL,
	[DepartmentId] [int] NULL,
	[LocationId] [int] NULL,
	[VisibilityStatusId] [int] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedBy] [int] NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[AssetGroupId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssetImportBatches]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetImportBatches](
	[ITAssetImportBatchId] [int] IDENTITY(1,1) NOT NULL,
	[BatchName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[OriginalFileName] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[UploadedBy] [int] NULL,
	[TotalRows] [int] NOT NULL,
	[ValidRows] [int] NOT NULL,
	[InvalidRows] [int] NOT NULL,
	[ImportedRows] [int] NOT NULL,
	[Status] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[ImportedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[ITAssetImportBatchId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssetImportStaging]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetImportStaging](
	[ImportStagingId] [int] IDENTITY(1,1) NOT NULL,
	[ImportBatchId] [int] NOT NULL,
	[AssetTag] [nvarchar](200) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[CategoryName] [nvarchar](300) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[BrandName] [nvarchar](300) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ModelName] [nvarchar](300) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[DepartmentName] [nvarchar](300) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[LocationName] [nvarchar](300) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[RoomName] [nvarchar](300) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[StatusName] [nvarchar](300) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ConditionName] [nvarchar](300) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[PurchaseDate] [date] NULL,
	[EmployeeCode] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Remarks] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SourceSheet] [nvarchar](300) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SourceRow] [int] NULL,
	[MatchedUserId] [int] NULL,
	[MatchStatus] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[DuplicateTagStatus] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ImportStatus] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ImportMessage] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CreatedAt] [datetime] NOT NULL,
	[ImportedAt] [datetime] NULL,
	[ResolvedCategoryId] [int] NULL,
	[ResolvedBrandId] [int] NULL,
	[ResolvedModelId] [int] NULL,
	[ResolvedStatusId] [int] NULL,
	[ResolvedConditionId] [int] NULL,
	[ResolvedDepartmentId] [int] NULL,
	[ResolvedLocationId] [int] NULL,
	[ResolvedRoomId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[ImportStagingId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssetIssueCategories]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetIssueCategories](
	[IssueCategoryId] [int] IDENTITY(1,1) NOT NULL,
	[IssueCategoryKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[IssueCategoryName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ITAssetCategoryId] [int] NULL,
	[IsActive] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[IssueCategoryId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssetIssueLogs]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetIssueLogs](
	[IssueLogId] [int] IDENTITY(1,1) NOT NULL,
	[AssetId] [int] NOT NULL,
	[IssueTypeId] [int] NOT NULL,
	[ReportedByUserId] [int] NULL,
	[AssignedToUserId] [int] NULL,
	[IssueStatus] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Priority] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Description] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Resolution] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ReportedAt] [datetime] NOT NULL,
	[ResolvedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[IssueLogId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssetIssueTypes]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetIssueTypes](
	[IssueTypeId] [int] IDENTITY(1,1) NOT NULL,
	[IssueCategoryId] [int] NOT NULL,
	[IssueTypeKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[IssueTypeName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Description] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IsActive] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[IssueTypeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssetLaptopDetails]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetLaptopDetails](
	[AssetId] [int] NOT NULL,
	[Cpu] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Ram] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Storage] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[OperatingSystem] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[HasCharger] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[AssetId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssetMaintenanceLogs]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetMaintenanceLogs](
	[MaintenanceLogId] [int] IDENTITY(1,1) NOT NULL,
	[AssetId] [int] NOT NULL,
	[MaintenanceType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Description] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[PerformedBy] [int] NULL,
	[Cost] [decimal](18, 2) NULL,
	[PerformedAt] [datetime] NOT NULL,
	[NextDueAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaintenanceLogId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssetModels]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetModels](
	[ITAssetModelId] [int] IDENTITY(1,1) NOT NULL,
	[ITAssetCategoryId] [int] NOT NULL,
	[ITAssetBrandId] [int] NULL,
	[ModelName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ModelDescription] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IsActive] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ITAssetModelId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssetNeededLaptops]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetNeededLaptops](
	[NeededLaptopId] [int] IDENTITY(1,1) NOT NULL,
	[AssetTag] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[LaptopModel] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[TeacherCode] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[TeacherName] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[MatchedUserId] [int] NULL,
	[SourceSheet] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SourceRow] [int] NULL,
	[Status] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[NeededLaptopId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssetNetworkDetails]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetNetworkDetails](
	[AssetId] [int] NOT NULL,
	[IpAddress] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[MacAddress] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[PortCount] [int] NULL,
	[FirmwareVersion] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[RackLocation] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[AssetId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssetNotes]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetNotes](
	[AssetNoteId] [int] IDENTITY(1,1) NOT NULL,
	[AssetId] [int] NOT NULL,
	[NoteTypeId] [int] NOT NULL,
	[NoteText] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[CreatedBy] [int] NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[AssetNoteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssetNoteTypes]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetNoteTypes](
	[NoteTypeId] [int] IDENTITY(1,1) NOT NULL,
	[NoteTypeKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[NoteTypeName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[IsActive] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[NoteTypeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssetPhoneDetails]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetPhoneDetails](
	[AssetId] [int] NOT NULL,
	[ExtensionNumber] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IpAddress] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[MacAddress] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[AssetId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssetPrinterCopierDetails]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetPrinterCopierDetails](
	[AssetId] [int] NOT NULL,
	[CanPrint] [bit] NOT NULL,
	[CanCopy] [bit] NOT NULL,
	[CanScan] [bit] NOT NULL,
	[CanFax] [bit] NOT NULL,
	[SupportsA3] [bit] NOT NULL,
	[SupportsA4] [bit] NOT NULL,
	[IsColor] [bit] NOT NULL,
	[IsDuplex] [bit] NOT NULL,
	[IsNetworked] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[AssetId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssetProjectorDetails]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetProjectorDetails](
	[AssetId] [int] NOT NULL,
	[LampHours] [int] NULL,
	[BrightnessLumens] [int] NULL,
	[HasRemote] [bit] NULL,
	[MountType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[AssetId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssets]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssets](
	[AssetId] [int] IDENTITY(1,1) NOT NULL,
	[AssetTag] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ITAssetCategoryId] [int] NOT NULL,
	[ITAssetModelId] [int] NULL,
	[ModelDescription] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SerialIpMac] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ITAssetStatusId] [int] NOT NULL,
	[ITAssetConditionId] [int] NULL,
	[CurrentAssignedUserId] [int] NULL,
	[CurrentAssignedName] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CurrentAssignedEmployeeCode] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CurrentAssignedEmail] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CurrentRoomId] [int] NULL,
	[CurrentDepartmentId] [int] NULL,
	[CurrentLocationId] [int] NULL,
	[AcquiredChangedDate] [date] NULL,
	[PreviousOwner] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SourceSheet] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SourceRow] [int] NULL,
	[DuplicateTagStatus] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[OriginalRecordId] [int] NULL,
	[ImportBatchId] [int] NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
	[IsDeleted] [bit] NOT NULL,
	[DeletedAt] [datetime] NULL,
	[DeletedBy] [int] NULL,
	[SchoolId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[AssetId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssetStatuses]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetStatuses](
	[ITAssetStatusId] [int] IDENTITY(1,1) NOT NULL,
	[StatusKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[StatusName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Description] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IsFinalStatus] [bit] NOT NULL,
	[SortOrder] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ITAssetStatusId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssetStatusHistory]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetStatusHistory](
	[AssetStatusHistoryId] [int] IDENTITY(1,1) NOT NULL,
	[AssetId] [int] NOT NULL,
	[OldStatusId] [int] NULL,
	[NewStatusId] [int] NOT NULL,
	[ChangedBy] [int] NULL,
	[ChangedAt] [datetime] NOT NULL,
	[Notes] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[AssetStatusHistoryId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITAssetTransferRequests]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetTransferRequests](
	[AssetTransferRequestId] [int] IDENTITY(1,1) NOT NULL,
	[TransferRequestNumber] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[AssetId] [int] NOT NULL,
	[RequestedBy] [int] NOT NULL,
	[ApprovedBy] [int] NULL,
	[FromUserId] [int] NULL,
	[ToUserId] [int] NULL,
	[FromRoomId] [int] NULL,
	[ToRoomId] [int] NULL,
	[FromDepartmentId] [int] NULL,
	[ToDepartmentId] [int] NULL,
	[FromLocationId] [int] NULL,
	[ToLocationId] [int] NULL,
	[TransferReason] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[TransferStatus] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[RequestedAt] [datetime] NOT NULL,
	[ApprovedAt] [datetime] NULL,
	[CompletedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[AssetTransferRequestId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ITTickets]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITTickets](
	[TicketId] [int] IDENTITY(1,1) NOT NULL,
	[TicketNumber] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[RequestedBy] [int] NOT NULL,
	[AssignedTo] [int] NULL,
	[RelatedAssetId] [int] NULL,
	[Title] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Description] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Priority] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Status] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
	[ClosedAt] [datetime] NULL,
	[IsDeleted] [bit] NOT NULL,
	[DeletedAt] [datetime] NULL,
	[DeletedBy] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[TicketId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[KPIDefinitions]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[KPIDefinitions](
	[KPIDefinitionId] [int] IDENTITY(1,1) NOT NULL,
	[KPIKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[KPIName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ModuleId] [int] NULL,
	[DataSourceKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CalculationSql] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Icon] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ColorHex] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[VisibilityStatusId] [int] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[KPIDefinitionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Languages]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Languages](
	[LanguageId] [int] IDENTITY(1,1) NOT NULL,
	[LanguageCode] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[LanguageName] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[IsDefault] [bit] NOT NULL,
	[IsActive] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[LanguageId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Locations]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Locations](
	[LocationId] [int] IDENTITY(1,1) NOT NULL,
	[BuildingId] [int] NULL,
	[LocationKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[LocationName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[FloorName] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Description] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[LocationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[LoginHistory]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LoginHistory](
	[LoginHistoryId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NULL,
	[EmployeeId] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SchoolEmail] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IsSuccessful] [bit] NOT NULL,
	[FailureReason] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IpAddress] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[UserAgent] [nvarchar](500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[LoginHistoryId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[LookupCategories]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LookupCategories](
	[LookupCategoryId] [int] IDENTITY(1,1) NOT NULL,
	[CategoryKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[CategoryName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ModuleId] [int] NULL,
	[IsSystemCategory] [bit] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[LookupCategoryId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[LookupValues]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LookupValues](
	[LookupValueId] [int] IDENTITY(1,1) NOT NULL,
	[LookupCategoryId] [int] NOT NULL,
	[ValueKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ValueName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ValueDescription] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ParentLookupValueId] [int] NULL,
	[ColorHex] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Icon] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IsSystemValue] [bit] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[SortOrder] [int] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[LookupValueId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MenuGroupItems]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MenuGroupItems](
	[MenuGroupItemId] [int] IDENTITY(1,1) NOT NULL,
	[MenuGroupId] [int] NOT NULL,
	[MenuId] [int] NOT NULL,
	[SortOrder] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MenuGroupItemId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MenuGroups]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MenuGroups](
	[MenuGroupId] [int] IDENTITY(1,1) NOT NULL,
	[WorkspaceId] [int] NULL,
	[GroupKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[GroupName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Icon] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[VisibilityStatusId] [int] NOT NULL,
	[SortOrder] [int] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[MenuGroupId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Menus]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Menus](
	[MenuId] [int] IDENTITY(1,1) NOT NULL,
	[WorkspaceId] [int] NULL,
	[ModuleId] [int] NOT NULL,
	[ParentMenuId] [int] NULL,
	[MenuKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[MenuName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Route] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Icon] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[PermissionId] [int] NULL,
	[FeatureFlagId] [int] NULL,
	[BadgeQueryKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[VisibilityStatusId] [int] NOT NULL,
	[IsPinned] [bit] NOT NULL,
	[IsCollapsible] [bit] NOT NULL,
	[SortOrder] [int] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[MenuId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Modules]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Modules](
	[ModuleId] [int] IDENTITY(1,1) NOT NULL,
	[ModuleKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ModuleName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Description] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Icon] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[BaseRoute] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[VisibilityStatusId] [int] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[SortOrder] [int] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[ModuleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[NotificationChannels]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[NotificationChannels](
	[NotificationChannelId] [int] IDENTITY(1,1) NOT NULL,
	[ChannelKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ChannelName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[IsActive] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[NotificationChannelId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[NotificationPreferenceTypes]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[NotificationPreferenceTypes](
	[NotificationPreferenceTypeId] [int] IDENTITY(1,1) NOT NULL,
	[PreferenceKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[PreferenceName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Description] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IsActive] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[NotificationPreferenceTypeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Notifications]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Notifications](
	[NotificationId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[Title] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Message] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[NotificationType] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[EntityType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[EntityId] [int] NULL,
	[IsRead] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[NotificationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PaperDistributions]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PaperDistributions](
	[DistributionId] [int] IDENTITY(1,1) NOT NULL,
	[PaperType] [varchar](10) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[BundlesIssued] [int] NOT NULL,
	[SheetsPerBundle] [int] NOT NULL CONSTRAINT [DF_PaperDistributions_SheetsPerBundle] DEFAULT ((500)),
	[IssuedTo] [varchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[IssuedDate] [date] NOT NULL,
	[ReceivedByName] [varchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[RequestedByUserId] [int] NULL,
	[DepartmentId] [int] NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[DistributionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PaperInventory]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PaperInventory](
	[InventoryId] [int] IDENTITY(1,1) NOT NULL,
	[PaperType] [varchar](10) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[CurrentStock] [int] NOT NULL,
	[LastUpdated] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[InventoryId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PaperPurchases]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PaperPurchases](
	[PurchaseId] [int] IDENTITY(1,1) NOT NULL,
	[PaperType] [varchar](10) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[QuantityBoxes] [int] NOT NULL,
	[BundlesPerBox] [int] NOT NULL CONSTRAINT [DF_PaperPurchases_BundlesPerBox] DEFAULT ((5)),
	[SheetsPerBundle] [int] NOT NULL CONSTRAINT [DF_PaperPurchases_SheetsPerBundle] DEFAULT ((500)),
	[TotalBundles]  AS ([QuantityBoxes]*[BundlesPerBox]) PERSISTED,
	[TotalSheets]  AS (([QuantityBoxes]*[BundlesPerBox])*[SheetsPerBundle]) PERSISTED,
	[PurchaseDate] [date] NOT NULL,
	[CreatedBy] [int] NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[PurchaseId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PasswordResetTokens]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PasswordResetTokens](
	[PasswordResetTokenId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[TokenHash] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ExpiresAt] [datetime] NOT NULL,
	[UsedAt] [datetime] NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[PasswordResetTokenId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Permissions]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Permissions](
	[PermissionId] [int] IDENTITY(1,1) NOT NULL,
	[PermissionKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[PermissionName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ModuleId] [int] NOT NULL,
	[GroupKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[GroupName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Description] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[PermissionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PrinterMeterReadings]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PrinterMeterReadings](
	[PrinterMeterReadingId] [int] IDENTITY(1,1) NOT NULL,
	[PrinterAssetId] [int] NOT NULL,
	[ReadingDate] [date] NOT NULL,
	[BlackCounter] [int] NULL,
	[ColorCounter] [int] NULL,
	[A3Counter] [int] NULL,
	[A4Counter] [int] NULL,
	[TotalPages] [int] NULL,
	[RecordedBy] [int] NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[PrinterMeterReadingId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PrintingLogs]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PrintingLogs](
	[PrintingLogId] [int] IDENTITY(1,1) NOT NULL,
	[RequestId] [int] NOT NULL,
	[PrintedBy] [int] NOT NULL,
	[PrinterAssetId] [int] NULL,
	[PrintedPages] [int] NOT NULL,
	[PrintedSheets] [int] NOT NULL,
	[Remarks] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[PrintedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[PrintingLogId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PrintingWorkflowEvents] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PrintingWorkflowEvents](
	[WorkflowEventId] [bigint] IDENTITY(1,1) NOT NULL,
	[RequestId] [int] NOT NULL,
	[EventType] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[FromStatus] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ToStatus] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ActorUserId] [int] NULL,
	[ActorAssignmentKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Remarks] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[MetadataJson] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CreatedAt] [datetime] NOT NULL CONSTRAINT [DF_PrintingWorkflowEvents_CreatedAt] DEFAULT (GETDATE()),
PRIMARY KEY CLUSTERED
(
	[WorkflowEventId] ASC
) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
CREATE NONCLUSTERED INDEX [IX_PrintingWorkflowEvents_Request_CreatedAt]
ON [dbo].[PrintingWorkflowEvents] ([RequestId] ASC, [CreatedAt] DESC)
ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PrintingJobConsumptions] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PrintingJobConsumptions](
	[PrintingJobConsumptionId] [bigint] IDENTITY(1,1) NOT NULL,
	[RequestId] [int] NOT NULL,
	[PaperType] [varchar](10) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ExpectedSheets] [int] NOT NULL,
	[ActualSheets] [int] NOT NULL,
	[RecordedBy] [int] NOT NULL,
	[RecordedAt] [datetime] NOT NULL CONSTRAINT [DF_PrintingJobConsumptions_RecordedAt] DEFAULT (GETDATE()),
PRIMARY KEY CLUSTERED
(
	[PrintingJobConsumptionId] ASC
) ON [PRIMARY]
) ON [PRIMARY]
GO
CREATE UNIQUE NONCLUSTERED INDEX [UX_PrintingJobConsumptions_Request_PaperType]
ON [dbo].[PrintingJobConsumptions] ([RequestId] ASC, [PaperType] ASC)
ON [PRIMARY]
GO
CREATE NONCLUSTERED INDEX [IX_PrintingJobConsumptions_Request]
ON [dbo].[PrintingJobConsumptions] ([RequestId] ASC)
ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Purposes]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Purposes](
	[PurposeId] [int] IDENTITY(1,1) NOT NULL,
	[PurposeKey] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[PurposeName] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[IsActive] [bit] NOT NULL,
	[SortOrder] [int] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[PurposeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QuickActions]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QuickActions](
	[QuickActionId] [int] IDENTITY(1,1) NOT NULL,
	[ActionKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ActionName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ModuleId] [int] NULL,
	[Route] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Icon] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[PermissionId] [int] NULL,
	[FeatureFlagId] [int] NULL,
	[VisibilityStatusId] [int] NOT NULL,
	[SortOrder] [int] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[QuickActionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ReportDefinitions]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ReportDefinitions](
	[ReportDefinitionId] [int] IDENTITY(1,1) NOT NULL,
	[ReportKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ReportName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ModuleId] [int] NULL,
	[Description] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[DataSourceKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[DefaultFiltersJson] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[PermissionId] [int] NULL,
	[VisibilityStatusId] [int] NOT NULL,
	[CreatedBy] [int] NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[ReportDefinitionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RequestApprovals]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RequestApprovals](
	[ApprovalId] [int] IDENTITY(1,1) NOT NULL,
	[RequestId] [int] NOT NULL,
	[ApproverId] [int] NOT NULL,
	[ApprovalRole] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ApprovalStatus] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Remarks] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ActionDate] [datetime] NOT NULL,
	[AssignedAt] [datetime] NULL,
	[StepOrder] [int] NULL,
	[ScopeType] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ScopeEntityId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[ApprovalId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RequestAttachments]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RequestAttachments](
	[AttachmentId] [int] IDENTITY(1,1) NOT NULL,
	[RequestId] [int] NOT NULL,
	[FileId] [int] NULL,
	[OriginalFileName] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[StoredFileName] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[FilePath] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[FileType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[FileSizeKB] [decimal](18, 2) NULL,
	[PageCount] [int] NULL,
	[Copies] [int] NOT NULL,
	[TotalSheets] [int] NULL,
	[DocumentName] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[PaperSize] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[PrintType] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[PrintColor] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[PagesPerSheet] [int] NOT NULL CONSTRAINT [DF_RequestAttachments_PagesPerSheet] DEFAULT ((1)),
	[PageSelection] [nvarchar](30) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CustomPageRange] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SelectedPages] [int] NULL,
	[SheetsPerSet] [int] NULL,
	[UploadedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[AttachmentId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RestoreLogs]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RestoreLogs](
	[RestoreLogId] [int] IDENTITY(1,1) NOT NULL,
	[BackupJobId] [int] NULL,
	[RestoreStatus] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[RestoreReason] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[RestoredBy] [int] NULL,
	[StartedAt] [datetime] NOT NULL,
	[CompletedAt] [datetime] NULL,
	[ErrorMessage] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[RestoreLogId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RolePermissions]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RolePermissions](
	[RolePermissionId] [int] IDENTITY(1,1) NOT NULL,
	[RoleId] [int] NOT NULL,
	[PermissionId] [int] NOT NULL,
	[IsAllowed] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RolePermissionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Roles]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Roles](
	[RoleId] [int] IDENTITY(1,1) NOT NULL,
	[RoleKey] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[RoleName] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[DisplayName] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[AccessLevelId] [int] NOT NULL,
	[Description] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IsSystemRole] [bit] NOT NULL,
	[IsProtected] [bit] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[RoleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Rooms]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Rooms](
	[RoomId] [int] IDENTITY(1,1) NOT NULL,
	[LocationId] [int] NULL,
	[RoomKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[RoomName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[RoomType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Capacity] [int] NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[RoomId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SavedReports]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SavedReports](
	[SavedReportId] [int] IDENTITY(1,1) NOT NULL,
	[ReportDefinitionId] [int] NOT NULL,
	[UserId] [int] NOT NULL,
	[SavedReportName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[FiltersJson] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IsShared] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[SavedReportId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ScheduledJobs]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ScheduledJobs](
	[ScheduledJobId] [int] IDENTITY(1,1) NOT NULL,
	[JobKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[JobName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[JobDescription] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CronExpression] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[RunEveryMinutes] [int] NULL,
	[VisibilityStatusId] [int] NOT NULL,
	[IsEnabled] [bit] NOT NULL,
	[LastRunAt] [datetime] NULL,
	[NextRunAt] [datetime] NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[ScheduledJobId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Schools]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Schools](
	[SchoolId] [int] IDENTITY(1,1) NOT NULL,
	[SchoolCode] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[SchoolName] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[LogoFileId] [int] NULL,
	[Address] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Phone] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Email] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Website] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[TimeZone] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[CurrencyCode] [nvarchar](10) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[SchoolId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SchoolSettings]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SchoolSettings](
	[SchoolSettingId] [int] IDENTITY(1,1) NOT NULL,
	[SchoolId] [int] NOT NULL,
	[SettingKey] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[SettingValue] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SettingGroup] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IsEditable] [bit] NOT NULL,
	[UpdatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[SchoolSettingId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Sections]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Sections](
	[SectionId] [int] IDENTITY(1,1) NOT NULL,
	[SectionKey] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[SectionName] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[IsActive] [bit] NOT NULL,
	[SortOrder] [int] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[SectionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[StaffImportBatches]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[StaffImportBatches](
	[StaffImportBatchId] [int] IDENTITY(1,1) NOT NULL,
	[BatchName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[OriginalFileName] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[UploadedBy] [int] NULL,
	[TotalRows] [int] NOT NULL,
	[ValidRows] [int] NOT NULL,
	[InvalidRows] [int] NOT NULL,
	[DuplicateRows] [int] NOT NULL,
	[UpdateRows] [int] NOT NULL,
	[IgnoredRows] [int] NOT NULL,
	[ImportedRows] [int] NOT NULL,
	[Status] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Remarks] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CreatedAt] [datetime] NOT NULL,
	[ValidatedAt] [datetime] NULL,
	[ImportedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[StaffImportBatchId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[StaffProfiles]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[StaffProfiles](
	[StaffProfileId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[StaffNumber] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[JobTitle] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[JoiningDate] [date] NULL,
	[LeavingDate] [date] NULL,
	[EmploymentStatus] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Notes] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[StaffProfileId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[StatusGroups]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[StatusGroups](
	[StatusGroupId] [int] IDENTITY(1,1) NOT NULL,
	[StatusGroupKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[StatusGroupName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ModuleId] [int] NULL,
	[EntityType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[StatusGroupId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[StatusValues]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[StatusValues](
	[StatusValueId] [int] IDENTITY(1,1) NOT NULL,
	[StatusGroupId] [int] NOT NULL,
	[StatusKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[StatusName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ColorHex] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Icon] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IsInitial] [bit] NOT NULL,
	[IsFinal] [bit] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[SortOrder] [int] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[StatusValueId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[StudentClassEnrollments]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[StudentClassEnrollments](
	[EnrollmentId] [int] IDENTITY(1,1) NOT NULL,
	[StudentId] [int] NOT NULL,
	[AcademicYearId] [int] NOT NULL,
	[ClassId] [int] NOT NULL,
	[StartDate] [date] NULL,
	[EndDate] [date] NULL,
	[IsCurrent] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[EnrollmentId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[StudentIdBatches]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[StudentIdBatches](
	[StudentIdBatchId] [int] IDENTITY(1,1) NOT NULL,
	[BatchNumber] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[AcademicYearId] [int] NOT NULL,
	[SectionId] [int] NULL,
	[YearLevelId] [int] NULL,
	[ClassId] [int] NULL,
	[TemplateId] [int] NULL,
	[RequestedBy] [int] NOT NULL,
	[VerifiedBy] [int] NULL,
	[ApprovedBy] [int] NULL,
	[Status] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[RequestedAt] [datetime] NOT NULL,
	[VerifiedAt] [datetime] NULL,
	[ApprovedAt] [datetime] NULL,
	[SentToPrintingAt] [datetime] NULL,
	[Notes] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[StudentIdBatchId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[StudentIdCards]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[StudentIdCards](
	[StudentIdCardId] [int] IDENTITY(1,1) NOT NULL,
	[StudentIdBatchId] [int] NOT NULL,
	[StudentId] [int] NOT NULL,
	[CardStatus] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[VerifiedBy] [int] NULL,
	[VerifiedAt] [datetime] NULL,
	[RejectionReason] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[PrintedAt] [datetime] NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[StudentIdCardId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[StudentIdTemplates]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[StudentIdTemplates](
	[StudentIdTemplateId] [int] IDENTITY(1,1) NOT NULL,
	[TemplateKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[TemplateName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Description] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[VisibilityStatusId] [int] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[StudentIdTemplateId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Students]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Students](
	[StudentId] [int] IDENTITY(1,1) NOT NULL,
	[AdmissionNumber] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[StudentCode] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[FirstName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[LastName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[PreferredName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SectionId] [int] NULL,
	[YearLevelId] [int] NULL,
	[CurrentClassId] [int] NULL,
	[PhotoFileId] [int] NULL,
	[Gender] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[StudentStatus] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
	[IsDeleted] [bit] NOT NULL,
	[DeletedAt] [datetime] NULL,
	[DeletedBy] [int] NULL,
	[SchoolId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[StudentId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SubjectPrintLimits]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SubjectPrintLimits](
	[SubjectLimitId] [int] IDENTITY(1,1) NOT NULL,
	[DepartmentLimitId] [int] NOT NULL,
	[DepartmentId] [int] NOT NULL,
	[SubjectId] [int] NOT NULL,
	[HodUserId] [int] NULL,
	[MonthNumber] [int] NOT NULL,
	[YearNumber] [int] NOT NULL,
	[SheetLimit] [int] NOT NULL,
	[CreatedBy] [int] NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[SubjectLimitId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Subjects]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Subjects](
	[SubjectId] [int] IDENTITY(1,1) NOT NULL,
	[SubjectKey] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[SubjectName] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[IsActive] [bit] NOT NULL,
	[SortOrder] [int] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[SubjectId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SystemHealthLogs]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SystemHealthLogs](
	[SystemHealthLogId] [int] IDENTITY(1,1) NOT NULL,
	[ServiceName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[HealthStatus] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Message] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CheckedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[SystemHealthLogId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SystemSettings]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SystemSettings](
	[SettingId] [int] IDENTITY(1,1) NOT NULL,
	[SettingKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[SettingValue] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SettingGroup] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Description] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IsEditable] [bit] NOT NULL,
	[UpdatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[SettingId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Tags]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Tags](
	[TagId] [int] IDENTITY(1,1) NOT NULL,
	[TagKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[TagName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ColorHex] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ModuleId] [int] NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[TagId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TaskAssignments]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TaskAssignments](
	[TaskAssignmentId] [int] IDENTITY(1,1) NOT NULL,
	[TaskId] [int] NOT NULL,
	[AssignedToUserId] [int] NOT NULL,
	[AssignedByUserId] [int] NULL,
	[AssignedAt] [datetime] NOT NULL,
	[CompletedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[TaskAssignmentId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TaskChecklistItems]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TaskChecklistItems](
	[TaskChecklistItemId] [int] IDENTITY(1,1) NOT NULL,
	[TaskId] [int] NOT NULL,
	[ChecklistText] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[IsCompleted] [bit] NOT NULL,
	[CompletedBy] [int] NULL,
	[CompletedAt] [datetime] NULL,
	[SortOrder] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[TaskChecklistItemId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Tasks]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Tasks](
	[TaskId] [int] IDENTITY(1,1) NOT NULL,
	[TaskNumber] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Title] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Description] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ModuleId] [int] NULL,
	[EntityType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[EntityId] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Priority] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Status] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[DueAt] [datetime] NULL,
	[CreatedBy] [int] NULL,
	[CreatedAt] [datetime] NOT NULL,
	[CompletedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[TaskId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Terms]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Terms](
	[TermId] [int] IDENTITY(1,1) NOT NULL,
	[AcademicYearId] [int] NOT NULL,
	[TermKey] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[TermName] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[StartDate] [date] NULL,
	[EndDate] [date] NULL,
	[SortOrder] [int] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[TermId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Themes]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Themes](
	[ThemeId] [int] IDENTITY(1,1) NOT NULL,
	[SchoolId] [int] NULL,
	[ThemeKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ThemeName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[PrimaryColor] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SecondaryColor] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[AccentColor] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SidebarStyle] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[LogoFileId] [int] NULL,
	[LoginBackgroundFileId] [int] NULL,
	[IsDefault] [bit] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[ThemeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TopbarSettings]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TopbarSettings](
	[TopbarSettingId] [int] IDENTITY(1,1) NOT NULL,
	[SettingKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ShowSearch] [bit] NOT NULL,
	[ShowNotifications] [bit] NOT NULL,
	[ShowWorkspaceSwitcher] [bit] NOT NULL,
	[ShowProfileMenu] [bit] NOT NULL,
	[AnnouncementBannerEnabled] [bit] NOT NULL,
	[UpdatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[TopbarSettingId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Translations]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Translations](
	[TranslationId] [int] IDENTITY(1,1) NOT NULL,
	[LanguageId] [int] NOT NULL,
	[TranslationKey] [nvarchar](200) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[TranslationValue] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ModuleId] [int] NULL,
	[UpdatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[TranslationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserAssignments]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserAssignments](
	[UserAssignmentId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[AssignmentTypeId] [int] NOT NULL,
	[AcademicYearId] [int] NULL,
	[DepartmentId] [int] NULL,
	[SectionId] [int] NULL,
	[SubjectId] [int] NULL,
	[YearLevelId] [int] NULL,
	[ClassId] [int] NULL,
	[RoomId] [int] NULL,
	[StartDate] [date] NULL,
	[EndDate] [date] NULL,
	[IsPrimary] [bit] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedBy] [int] NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[UserAssignmentId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserAssignmentScopes]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserAssignmentScopes](
	[AssignmentScopeId] [int] IDENTITY(1,1) NOT NULL,
	[UserAssignmentId] [int] NOT NULL,
	[ScopeType] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ScopeValue] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[AssignmentScopeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserMenuPreferences]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserMenuPreferences](
	[UserMenuPreferenceId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[WorkspaceId] [int] NULL,
	[MenuId] [int] NOT NULL,
	[IsPinned] [bit] NOT NULL,
	[IsHidden] [bit] NOT NULL,
	[SortOrder] [int] NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[UserMenuPreferenceId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserNotificationPreferences]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserNotificationPreferences](
	[UserNotificationPreferenceId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[NotificationPreferenceTypeId] [int] NOT NULL,
	[NotificationChannelId] [int] NOT NULL,
	[IsEnabled] [bit] NOT NULL,
	[UpdatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UserNotificationPreferenceId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserPermissionOverrides]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserPermissionOverrides](
	[UserPermissionOverrideId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[PermissionId] [int] NOT NULL,
	[IsAllowed] [bit] NOT NULL,
	[Reason] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CreatedBy] [int] NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UserPermissionOverrideId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserRegistrationTokens]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserRegistrationTokens](
	[RegistrationTokenId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[TokenHash] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ExpiresAt] [datetime] NOT NULL,
	[UsedAt] [datetime] NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RegistrationTokenId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Users]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[UserId] [int] IDENTITY(1,1) NOT NULL,
	[EmployeeId] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[FullName] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[SchoolEmail] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[PersonalEmail] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[MobileNumber] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[PasswordHash] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[RoleId] [int] NOT NULL,
	[DepartmentId] [int] NULL,
	[SectionId] [int] NULL,
	[DefaultWorkspaceId] [int] NULL,
	[LegacyRole] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[MustChangePassword] [bit] NOT NULL,
	[EmailVerified] [bit] NOT NULL,
	[IsRegistrationCompleted] [bit] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[IsLocked] [bit] NOT NULL,
	[FailedLoginAttempts] [int] NOT NULL,
	[LockedUntil] [datetime] NULL,
	[LastLoginAt] [datetime] NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
	[IsDeleted] [bit] NOT NULL,
	[DeletedAt] [datetime] NULL,
	[DeletedBy] [int] NULL,
	[SchoolId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserSessions]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserSessions](
	[UserSessionId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[SessionTokenHash] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[IpAddress] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[UserAgent] [nvarchar](500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ExpiresAt] [datetime] NOT NULL,
	[RevokedAt] [datetime] NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UserSessionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserSubjects]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserSubjects](
	[UserSubjectId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[SubjectId] [int] NOT NULL,
	[IsPrimary] [bit] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UserSubjectId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Widgets]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Widgets](
	[WidgetId] [int] IDENTITY(1,1) NOT NULL,
	[ModuleId] [int] NULL,
	[WidgetKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[WidgetName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[WidgetType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[DataSourceKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Description] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[PermissionId] [int] NULL,
	[FeatureFlagId] [int] NULL,
	[VisibilityStatusId] [int] NOT NULL,
	[DefaultWidth] [int] NULL,
	[DefaultHeight] [int] NULL,
	[SortOrder] [int] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[WidgetId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[WorkflowActions]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WorkflowActions](
	[WorkflowActionId] [int] IDENTITY(1,1) NOT NULL,
	[WorkflowInstanceId] [int] NOT NULL,
	[WorkflowStepId] [int] NULL,
	[ActionBy] [int] NOT NULL,
	[ActionStatus] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Remarks] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ActionDate] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[WorkflowActionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[WorkflowInstances]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WorkflowInstances](
	[WorkflowInstanceId] [int] IDENTITY(1,1) NOT NULL,
	[WorkflowTemplateId] [int] NOT NULL,
	[EntityType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[EntityId] [int] NOT NULL,
	[Status] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[StartedBy] [int] NULL,
	[StartedAt] [datetime] NOT NULL,
	[CompletedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[WorkflowInstanceId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[WorkflowSteps]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WorkflowSteps](
	[WorkflowStepId] [int] IDENTITY(1,1) NOT NULL,
	[WorkflowTemplateId] [int] NOT NULL,
	[StepKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[StepName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[AssignmentTypeId] [int] NULL,
	[RoleId] [int] NULL,
	[SortOrder] [int] NOT NULL,
	[IsRequired] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[WorkflowStepId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[WorkflowTemplates]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WorkflowTemplates](
	[WorkflowTemplateId] [int] IDENTITY(1,1) NOT NULL,
	[WorkflowKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[WorkflowName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ModuleId] [int] NULL,
	[EntityType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[VisibilityStatusId] [int] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[WorkflowTemplateId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[WorkspaceRoles]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WorkspaceRoles](
	[WorkspaceRoleId] [int] IDENTITY(1,1) NOT NULL,
	[WorkspaceId] [int] NOT NULL,
	[RoleId] [int] NOT NULL,
	[IsDefault] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[WorkspaceRoleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Workspaces]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Workspaces](
	[WorkspaceId] [int] IDENTITY(1,1) NOT NULL,
	[WorkspaceKey] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[WorkspaceName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Description] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Icon] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[DefaultRoute] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[VisibilityStatusId] [int] NOT NULL,
	[IsDefault] [bit] NOT NULL,
	[SortOrder] [int] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
	[IsActive] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[WorkspaceId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[YearLevels]    Script Date: 10/07/2026 12:54:05 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[YearLevels](
	[YearLevelId] [int] IDENTITY(1,1) NOT NULL,
	[SectionId] [int] NULL,
	[YearLevelKey] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[YearLevelName] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[SortOrder] [int] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[YearLevelId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

INSERT [dbo].[AcademicYears] ([AcademicYearId], [AcademicYearName], [StartDate], [EndDate], [IsCurrent], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1, N'2026-2027', CAST(N'2026-08-25' AS Date), CAST(N'2027-07-10' AS Date), 1, 1, CAST(N'2026-06-27T09:11:41.900' AS DateTime), NULL)
GO

INSERT [dbo].[AccessLevels] ([AccessLevelId], [AccessLevelKey], [AccessLevelName], [DisplayName], [Description], [SortOrder], [IsSystemLevel], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1, N'TEACHER_LEVEL', N'TeacherLevel', N'Teacher Level', N'Teacher users', 1, 1, 1, CAST(N'2026-06-27T09:11:41.947' AS DateTime), NULL)
INSERT [dbo].[AccessLevels] ([AccessLevelId], [AccessLevelKey], [AccessLevelName], [DisplayName], [Description], [SortOrder], [IsSystemLevel], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (2, N'ADMIN_LEVEL', N'AdminLevel', N'Admin Level', N'Admin users and academic leadership', 2, 1, 1, CAST(N'2026-06-27T09:11:41.947' AS DateTime), NULL)
INSERT [dbo].[AccessLevels] ([AccessLevelId], [AccessLevelKey], [AccessLevelName], [DisplayName], [Description], [SortOrder], [IsSystemLevel], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (3, N'PLATFORM_ADMIN_LEVEL', N'PlatformAdminLevel', N'Platform Admin Level', N'IT/platform administrators', 3, 1, 1, CAST(N'2026-06-27T09:11:41.947' AS DateTime), NULL)
INSERT [dbo].[AccessLevels] ([AccessLevelId], [AccessLevelKey], [AccessLevelName], [DisplayName], [Description], [SortOrder], [IsSystemLevel], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (4, N'SUPER_ADMIN_LEVEL', N'SuperAdminLevel', N'Super Admin Level', N'Protected system owner', 4, 1, 1, CAST(N'2026-06-27T09:11:41.947' AS DateTime), NULL)
GO

GO

GO

INSERT [dbo].[AssignmentTypes] ([AssignmentTypeId], [AssignmentKey], [AssignmentName], [Description], [IsSystemAssignment], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (1, N'HOD', N'HOD', N'Head of Department assignment', 1, 1, 1, CAST(N'2026-06-27T09:11:41.957' AS DateTime), NULL)
INSERT [dbo].[AssignmentTypes] ([AssignmentTypeId], [AssignmentKey], [AssignmentName], [Description], [IsSystemAssignment], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (2, N'HOS', N'HOS', N'Head of Section assignment', 1, 1, 2, CAST(N'2026-06-27T09:11:41.957' AS DateTime), NULL)
INSERT [dbo].[AssignmentTypes] ([AssignmentTypeId], [AssignmentKey], [AssignmentName], [Description], [IsSystemAssignment], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (3, N'HOMEROOM_TEACHER', N'Homeroom Teacher', N'Class homeroom teacher assignment', 1, 1, 3, CAST(N'2026-06-27T09:11:41.957' AS DateTime), NULL)
INSERT [dbo].[AssignmentTypes] ([AssignmentTypeId], [AssignmentKey], [AssignmentName], [Description], [IsSystemAssignment], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (4, N'YEAR_LEADER', N'Year Leader', N'Year-level leadership assignment', 1, 1, 4, CAST(N'2026-06-27T09:11:41.957' AS DateTime), NULL)
INSERT [dbo].[AssignmentTypes] ([AssignmentTypeId], [AssignmentKey], [AssignmentName], [Description], [IsSystemAssignment], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (5, N'DEPUTY_HEAD', N'Deputy Head', N'Deputy head assignment with flexible scope', 1, 1, 5, CAST(N'2026-06-27T09:11:41.957' AS DateTime), NULL)
INSERT [dbo].[AssignmentTypes] ([AssignmentTypeId], [AssignmentKey], [AssignmentName], [Description], [IsSystemAssignment], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (6, N'HEAD_OF_OPERATIONS', N'Head of Operations', N'Operations leadership assignment', 1, 1, 6, CAST(N'2026-06-27T09:11:41.957' AS DateTime), NULL)
INSERT [dbo].[AssignmentTypes] ([AssignmentTypeId], [AssignmentKey], [AssignmentName], [Description], [IsSystemAssignment], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (7, N'NURSE', N'Nurse', N'Clinic nurse assignment', 1, 1, 7, CAST(N'2026-06-27T09:11:41.957' AS DateTime), NULL)
INSERT [dbo].[AssignmentTypes] ([AssignmentTypeId], [AssignmentKey], [AssignmentName], [Description], [IsSystemAssignment], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (8, N'TEACHING_ASSISTANT', N'Teaching Assistant', N'Teaching assistant assignment', 1, 1, 8, CAST(N'2026-06-27T09:11:41.957' AS DateTime), NULL)
INSERT [dbo].[AssignmentTypes] ([AssignmentTypeId], [AssignmentKey], [AssignmentName], [Description], [IsSystemAssignment], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (9, N'IT_COORDINATOR', N'IT Coordinator', N'IT coordinator assignment', 0, 1, 9, CAST(N'2026-06-27T09:11:41.957' AS DateTime), NULL)
INSERT [dbo].[AssignmentTypes] ([AssignmentTypeId], [AssignmentKey], [AssignmentName], [Description], [IsSystemAssignment], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (10, N'PRINTING_COORDINATOR', N'Printing Coordinator', N'Printing coordinator assignment', 0, 1, 10, CAST(N'2026-06-27T09:11:41.957' AS DateTime), NULL)
GO

GO

INSERT [dbo].[Branding] ([BrandingId], [SchoolId], [LogoFileId], [SmallLogoFileId], [DarkLogoFileId], [FaviconFileId], [LoginBackgroundFileId], [LoginVideoFileId], [PrimaryColor], [SecondaryColor], [AccentColor], [SidebarColor], [TopbarColor], [LoginCardColor], [LoginTitle], [LoginSubtitle], [FooterText], [Website], [SupportEmail], [SupportPhone], [IsActive], [UpdatedBy], [CreatedAt], [UpdatedAt], [UseSidebarGradient], [SidebarGradientStart], [SidebarGradientEnd], [SidebarGradientDirection], [UseTopbarGradient], [TopbarGradientStart], [TopbarGradientEnd], [TopbarGradientDirection], [SidebarBackgroundType], [TopbarBackgroundType], [SidebarGradientMiddle], [TopbarGradientMiddle], [SidebarGradientPosition], [TopbarGradientPosition]) VALUES (1, 1, 1, 2, NULL, 3, 4, NULL, N'#0F766E', N'#0F172A', N'#22C55E', N'#182bbf', N'#d26060', N'#FFFFFF', N'Operations Platform', N'Arab Unity School', N'© Arab Unity School. All rights reserved.', NULL, NULL, NULL, 1, NULL, CAST(N'2026-06-27T09:11:42.403' AS DateTime), NULL, 1, N'#048802', N'#011341', N'180deg', 1, N'#007A3D', N'#002B5B', N'90deg', N'solid', N'solid', NULL, NULL, N'center', N'center')
GO

INSERT [dbo].[CalendarEventTypes] ([CalendarEventTypeId], [EventTypeKey], [EventTypeName], [ModuleId], [ColorHex], [IsActive]) VALUES (1, N'General', N'General', NULL, N'#64748B', 1)
INSERT [dbo].[CalendarEventTypes] ([CalendarEventTypeId], [EventTypeKey], [EventTypeName], [ModuleId], [ColorHex], [IsActive]) VALUES (2, N'Maintenance', N'Maintenance', NULL, N'#F59E0B', 1)
INSERT [dbo].[CalendarEventTypes] ([CalendarEventTypeId], [EventTypeKey], [EventTypeName], [ModuleId], [ColorHex], [IsActive]) VALUES (3, N'Printing', N'Printing', NULL, N'#0F766E', 1)
INSERT [dbo].[CalendarEventTypes] ([CalendarEventTypeId], [EventTypeKey], [EventTypeName], [ModuleId], [ColorHex], [IsActive]) VALUES (4, N'StudentID', N'Student ID', NULL, N'#2563EB', 1)
INSERT [dbo].[CalendarEventTypes] ([CalendarEventTypeId], [EventTypeKey], [EventTypeName], [ModuleId], [ColorHex], [IsActive]) VALUES (5, N'Meeting', N'Meeting', NULL, N'#7C3AED', 1)
GO

INSERT [dbo].[Departments] ([DepartmentId], [DepartmentKey], [DepartmentName], [DepartmentCode], [DepartmentType], [SectionId], [IsAcademic], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt], [SchoolId]) VALUES (1, N'FS', N'FS', N'FS', N'Academic', 1, 1, 1, 1, CAST(N'2026-06-27T09:11:41.920' AS DateTime), NULL, 1)
INSERT [dbo].[Departments] ([DepartmentId], [DepartmentKey], [DepartmentName], [DepartmentCode], [DepartmentType], [SectionId], [IsAcademic], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt], [SchoolId]) VALUES (2, N'PRIMARY', N'Primary', N'PRI', N'Academic', 2, 1, 1, 2, CAST(N'2026-06-27T09:11:41.920' AS DateTime), NULL, 1)
INSERT [dbo].[Departments] ([DepartmentId], [DepartmentKey], [DepartmentName], [DepartmentCode], [DepartmentType], [SectionId], [IsAcademic], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt], [SchoolId]) VALUES (3, N'SECONDARY', N'Secondary', N'SEC', N'Academic', 3, 1, 1, 3, CAST(N'2026-06-27T09:11:41.920' AS DateTime), NULL, 1)
INSERT [dbo].[Departments] ([DepartmentId], [DepartmentKey], [DepartmentName], [DepartmentCode], [DepartmentType], [SectionId], [IsAcademic], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt], [SchoolId]) VALUES (4, N'SIXTH_FORM', N'Sixth Form', N'SF', N'Academic', 4, 1, 1, 4, CAST(N'2026-06-27T09:11:41.920' AS DateTime), NULL, 1)
INSERT [dbo].[Departments] ([DepartmentId], [DepartmentKey], [DepartmentName], [DepartmentCode], [DepartmentType], [SectionId], [IsAcademic], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt], [SchoolId]) VALUES (5, N'INCLUSION', N'Inclusion', N'INC', N'Academic', 5, 1, 1, 5, CAST(N'2026-06-27T09:11:41.920' AS DateTime), NULL, 1)
INSERT [dbo].[Departments] ([DepartmentId], [DepartmentKey], [DepartmentName], [DepartmentCode], [DepartmentType], [SectionId], [IsAcademic], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt], [SchoolId]) VALUES (6, N'IT', N'IT Department', N'IT', N'Operations', NULL, 0, 1, 6, CAST(N'2026-06-27T09:11:41.920' AS DateTime), NULL, 1)
INSERT [dbo].[Departments] ([DepartmentId], [DepartmentKey], [DepartmentName], [DepartmentCode], [DepartmentType], [SectionId], [IsAcademic], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt], [SchoolId]) VALUES (7, N'ADMIN', N'Administration', N'ADM', N'Operations', NULL, 0, 1, 7, CAST(N'2026-06-27T09:11:41.920' AS DateTime), NULL, 1)
INSERT [dbo].[Departments] ([DepartmentId], [DepartmentKey], [DepartmentName], [DepartmentCode], [DepartmentType], [SectionId], [IsAcademic], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt], [SchoolId]) VALUES (8, N'CLINIC', N'Clinic', N'CLI', N'Operations', NULL, 0, 1, 8, CAST(N'2026-06-27T09:11:41.920' AS DateTime), NULL, 1)
INSERT [dbo].[Departments] ([DepartmentId], [DepartmentKey], [DepartmentName], [DepartmentCode], [DepartmentType], [SectionId], [IsAcademic], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt], [SchoolId]) VALUES (9, N'OPERATIONS', N'Operations', N'OPS', N'Operations', NULL, 0, 1, 9, CAST(N'2026-06-27T09:11:41.920' AS DateTime), NULL, 1)
GO

INSERT [dbo].[DocumentBranding] ([DocumentBrandingId], [SchoolId], [BrandingKey], [BrandingName], [HeaderLogoFileId], [WatermarkFileId], [SignatureFileId], [HeaderText], [FooterText], [DisclaimerText], [PrimaryColor], [SecondaryColor], [IsDefault], [IsActive], [UpdatedBy], [CreatedAt], [UpdatedAt]) VALUES (1, 1, N'aus_default_document', N'AUS Default Document Branding', NULL, NULL, NULL, N'Arab Unity School', N'Generated by Operations Platform', NULL, N'#0F766E', N'#0F172A', 1, 1, NULL, CAST(N'2026-06-27T09:11:42.410' AS DateTime), NULL)
GO

INSERT [dbo].[DocumentSequences] ([DocumentSequenceId], [SequenceKey], [EntityType], [Prefix], [CurrentValue], [PaddingLength], [ResetEveryYear], [LastResetYear], [IsActive], [UpdatedAt]) VALUES (1, N'printing_request', N'PhotocopyRequests', N'PR-', 0, 5, 1, NULL, 1, CAST(N'2026-06-27T09:11:42.297' AS DateTime))
INSERT [dbo].[DocumentSequences] ([DocumentSequenceId], [SequenceKey], [EntityType], [Prefix], [CurrentValue], [PaddingLength], [ResetEveryYear], [LastResetYear], [IsActive], [UpdatedAt]) VALUES (2, N'it_ticket', N'ITTickets', N'IT-', 0, 5, 1, NULL, 1, CAST(N'2026-06-27T09:11:42.297' AS DateTime))
INSERT [dbo].[DocumentSequences] ([DocumentSequenceId], [SequenceKey], [EntityType], [Prefix], [CurrentValue], [PaddingLength], [ResetEveryYear], [LastResetYear], [IsActive], [UpdatedAt]) VALUES (3, N'student_id_batch', N'StudentIdBatches', N'SID-', 0, 5, 1, NULL, 1, CAST(N'2026-06-27T09:11:42.297' AS DateTime))
INSERT [dbo].[DocumentSequences] ([DocumentSequenceId], [SequenceKey], [EntityType], [Prefix], [CurrentValue], [PaddingLength], [ResetEveryYear], [LastResetYear], [IsActive], [UpdatedAt]) VALUES (4, N'asset_transfer', N'ITAssetTransferRequests', N'AT-', 0, 5, 1, NULL, 1, CAST(N'2026-06-27T09:11:42.297' AS DateTime))
INSERT [dbo].[DocumentSequences] ([DocumentSequenceId], [SequenceKey], [EntityType], [Prefix], [CurrentValue], [PaddingLength], [ResetEveryYear], [LastResetYear], [IsActive], [UpdatedAt]) VALUES (5, N'task', N'Tasks', N'TASK-', 0, 5, 1, NULL, 1, CAST(N'2026-06-27T09:11:42.297' AS DateTime))
GO

INSERT [dbo].[FeatureFlags] ([FeatureFlagId], [FeatureKey], [FeatureName], [Description], [ModuleId], [VisibilityStatusId], [IsEnabled], [CreatedAt], [UpdatedAt]) VALUES (1, N'menus.enabled', N'Menus Enabled', N'Enable Menu Manager', 1, 1, 1, CAST(N'2026-06-30T23:28:30.817' AS DateTime), NULL)
GO

INSERT [dbo].[FeatureVisibilityStatuses] ([VisibilityStatusId], [StatusKey], [StatusName], [Description], [SortOrder]) VALUES (1, N'Enabled', N'Enabled', N'Visible and available', 1)
INSERT [dbo].[FeatureVisibilityStatuses] ([VisibilityStatusId], [StatusKey], [StatusName], [Description], [SortOrder]) VALUES (2, N'Hidden', N'Hidden', N'Exists but hidden from UI', 2)
INSERT [dbo].[FeatureVisibilityStatuses] ([VisibilityStatusId], [StatusKey], [StatusName], [Description], [SortOrder]) VALUES (3, N'Disabled', N'Disabled', N'Inactive and not accessible', 3)
GO

INSERT [dbo].[FileStorage] ([FileId], [OriginalFileName], [StoredFileName], [FilePath], [FileType], [FileSizeKB], [EntityType], [EntityId], [UploadedBy], [UploadedAt], [IsDeleted], [DeletedAt], [DeletedBy]) VALUES (1, N'2024 AUS FINAL LOGO v2 (2).jpg', N'1782704931403-933754259.jpg', N'/uploads/branding/logo/1782704931403-933754259.jpg', N'image/jpeg', CAST(831.07 AS Decimal(18, 2)), N'Branding', 1, 1, CAST(N'2026-06-29T07:48:51.550' AS DateTime), 0, NULL, NULL)
INSERT [dbo].[FileStorage] ([FileId], [OriginalFileName], [StoredFileName], [FilePath], [FileType], [FileSizeKB], [EntityType], [EntityId], [UploadedBy], [UploadedAt], [IsDeleted], [DeletedAt], [DeletedBy]) VALUES (2, N'2024 AUS FINAL LOGO v2 (2).jpg', N'1782704945770-348640852.jpg', N'/uploads/branding/small-logo/1782704945770-348640852.jpg', N'image/jpeg', CAST(831.07 AS Decimal(18, 2)), N'Branding', 1, 1, CAST(N'2026-06-29T07:49:05.777' AS DateTime), 0, NULL, NULL)
INSERT [dbo].[FileStorage] ([FileId], [OriginalFileName], [StoredFileName], [FilePath], [FileType], [FileSizeKB], [EntityType], [EntityId], [UploadedBy], [UploadedAt], [IsDeleted], [DeletedAt], [DeletedBy]) VALUES (3, N'NO BACKGROUND.png', N'1782704957667-29200279.png', N'/uploads/branding/favicon/1782704957667-29200279.png', N'image/png', CAST(157.28 AS Decimal(18, 2)), N'Branding', 1, 1, CAST(N'2026-06-29T07:49:17.690' AS DateTime), 0, NULL, NULL)
INSERT [dbo].[FileStorage] ([FileId], [OriginalFileName], [StoredFileName], [FilePath], [FileType], [FileSizeKB], [EntityType], [EntityId], [UploadedBy], [UploadedAt], [IsDeleted], [DeletedAt], [DeletedBy]) VALUES (4, N'2024 AUS FINAL LOGO v2 (2).jpg', N'1782704966862-113884599.jpg', N'/uploads/branding/login-background/1782704966862-113884599.jpg', N'image/jpeg', CAST(831.07 AS Decimal(18, 2)), N'Branding', 1, 1, CAST(N'2026-06-29T07:49:26.867' AS DateTime), 0, NULL, NULL)
GO

INSERT [dbo].[Integrations] ([IntegrationId], [IntegrationKey], [IntegrationName], [IntegrationType], [VisibilityStatusId], [IsConfigured], [CreatedAt], [UpdatedAt]) VALUES (1, N'smtp_email', N'SMTP Email', N'SMTP', 2, 0, CAST(N'2026-06-27T09:11:42.327' AS DateTime), NULL)
INSERT [dbo].[Integrations] ([IntegrationId], [IntegrationKey], [IntegrationName], [IntegrationType], [VisibilityStatusId], [IsConfigured], [CreatedAt], [UpdatedAt]) VALUES (2, N'microsoft_365', N'Microsoft 365', N'Microsoft365', 2, 0, CAST(N'2026-06-27T09:11:42.327' AS DateTime), NULL)
INSERT [dbo].[Integrations] ([IntegrationId], [IntegrationKey], [IntegrationName], [IntegrationType], [VisibilityStatusId], [IsConfigured], [CreatedAt], [UpdatedAt]) VALUES (3, N'google_workspace', N'Google Workspace', N'Google', 2, 0, CAST(N'2026-06-27T09:11:42.327' AS DateTime), NULL)
INSERT [dbo].[Integrations] ([IntegrationId], [IntegrationKey], [IntegrationName], [IntegrationType], [VisibilityStatusId], [IsConfigured], [CreatedAt], [UpdatedAt]) VALUES (4, N'sms_gateway', N'SMS Gateway', N'SMS', 3, 0, CAST(N'2026-06-27T09:11:42.327' AS DateTime), NULL)
INSERT [dbo].[Integrations] ([IntegrationId], [IntegrationKey], [IntegrationName], [IntegrationType], [VisibilityStatusId], [IsConfigured], [CreatedAt], [UpdatedAt]) VALUES (5, N'fortigate', N'FortiGate', N'Firewall', 2, 0, CAST(N'2026-06-27T09:11:42.327' AS DateTime), NULL)
GO

INSERT [dbo].[InventoryItemTypes] ([InventoryItemTypeId], [ItemTypeKey], [ItemTypeName], [Description], [VisibilityStatusId], [IsConsumable], [CreatedAt], [UpdatedAt]) VALUES (1, N'PaperA4', N'A4 Paper', N'A4 paper inventory', 1, 1, CAST(N'2026-06-27T09:11:42.037' AS DateTime), NULL)
INSERT [dbo].[InventoryItemTypes] ([InventoryItemTypeId], [ItemTypeKey], [ItemTypeName], [Description], [VisibilityStatusId], [IsConsumable], [CreatedAt], [UpdatedAt]) VALUES (2, N'PaperA3', N'A3 Paper', N'A3 paper inventory', 1, 1, CAST(N'2026-06-27T09:11:42.037' AS DateTime), NULL)
INSERT [dbo].[InventoryItemTypes] ([InventoryItemTypeId], [ItemTypeKey], [ItemTypeName], [Description], [VisibilityStatusId], [IsConsumable], [CreatedAt], [UpdatedAt]) VALUES (3, N'Toner', N'Toner', N'Toner tracking, disabled until needed', 3, 1, CAST(N'2026-06-27T09:11:42.037' AS DateTime), NULL)
INSERT [dbo].[InventoryItemTypes] ([InventoryItemTypeId], [ItemTypeKey], [ItemTypeName], [Description], [VisibilityStatusId], [IsConsumable], [CreatedAt], [UpdatedAt]) VALUES (4, N'ProjectorLamp', N'Projector Lamp', N'Projector lamp consumables', 2, 1, CAST(N'2026-06-27T09:11:42.037' AS DateTime), NULL)
INSERT [dbo].[InventoryItemTypes] ([InventoryItemTypeId], [ItemTypeKey], [ItemTypeName], [Description], [VisibilityStatusId], [IsConsumable], [CreatedAt], [UpdatedAt]) VALUES (5, N'SSD', N'SSD', N'SSD replacement stock', 2, 1, CAST(N'2026-06-27T09:11:42.037' AS DateTime), NULL)
INSERT [dbo].[InventoryItemTypes] ([InventoryItemTypeId], [ItemTypeKey], [ItemTypeName], [Description], [VisibilityStatusId], [IsConsumable], [CreatedAt], [UpdatedAt]) VALUES (6, N'RAM', N'RAM', N'RAM replacement stock', 2, 1, CAST(N'2026-06-27T09:11:42.037' AS DateTime), NULL)
INSERT [dbo].[InventoryItemTypes] ([InventoryItemTypeId], [ItemTypeKey], [ItemTypeName], [Description], [VisibilityStatusId], [IsConsumable], [CreatedAt], [UpdatedAt]) VALUES (7, N'Mouse', N'Mouse', N'Mouse inventory', 2, 1, CAST(N'2026-06-27T09:11:42.037' AS DateTime), NULL)
INSERT [dbo].[InventoryItemTypes] ([InventoryItemTypeId], [ItemTypeKey], [ItemTypeName], [Description], [VisibilityStatusId], [IsConsumable], [CreatedAt], [UpdatedAt]) VALUES (8, N'Keyboard', N'Keyboard', N'Keyboard inventory', 2, 1, CAST(N'2026-06-27T09:11:42.037' AS DateTime), NULL)
INSERT [dbo].[InventoryItemTypes] ([InventoryItemTypeId], [ItemTypeKey], [ItemTypeName], [Description], [VisibilityStatusId], [IsConsumable], [CreatedAt], [UpdatedAt]) VALUES (9, N'Charger', N'Charger', N'Laptop charger inventory', 2, 1, CAST(N'2026-06-27T09:11:42.037' AS DateTime), NULL)
INSERT [dbo].[InventoryItemTypes] ([InventoryItemTypeId], [ItemTypeKey], [ItemTypeName], [Description], [VisibilityStatusId], [IsConsumable], [CreatedAt], [UpdatedAt]) VALUES (10, N'PVCIDCards', N'PVC ID Cards', N'Student ID card consumables', 2, 1, CAST(N'2026-06-27T09:11:42.037' AS DateTime), NULL)
INSERT [dbo].[InventoryItemTypes] ([InventoryItemTypeId], [ItemTypeKey], [ItemTypeName], [Description], [VisibilityStatusId], [IsConsumable], [CreatedAt], [UpdatedAt]) VALUES (11, N'IDRibbon', N'ID Ribbon', N'Student ID printer ribbon', 2, 1, CAST(N'2026-06-27T09:11:42.037' AS DateTime), NULL)
GO

GO

GO

INSERT [dbo].[ITAssetBrands] ([ITAssetBrandId], [BrandName], [IsActive]) VALUES (1, N'Dell', 1)
INSERT [dbo].[ITAssetBrands] ([ITAssetBrandId], [BrandName], [IsActive]) VALUES (2, N'Epson', 1)
INSERT [dbo].[ITAssetBrands] ([ITAssetBrandId], [BrandName], [IsActive]) VALUES (1043, N'HP', 1)
INSERT [dbo].[ITAssetBrands] ([ITAssetBrandId], [BrandName], [IsActive]) VALUES (1044, N'Toshiba', 1)
INSERT [dbo].[ITAssetBrands] ([ITAssetBrandId], [BrandName], [IsActive]) VALUES (1045, N'Lenovo', 1)
INSERT [dbo].[ITAssetBrands] ([ITAssetBrandId], [BrandName], [IsActive]) VALUES (1046, N'Asus', 1)
INSERT [dbo].[ITAssetBrands] ([ITAssetBrandId], [BrandName], [IsActive]) VALUES (1047, N'Cisco', 1)
INSERT [dbo].[ITAssetBrands] ([ITAssetBrandId], [BrandName], [IsActive]) VALUES (1048, N'Aruba', 1)
INSERT [dbo].[ITAssetBrands] ([ITAssetBrandId], [BrandName], [IsActive]) VALUES (1049, N'Benq', 1)
INSERT [dbo].[ITAssetBrands] ([ITAssetBrandId], [BrandName], [IsActive]) VALUES (1050, N'Kyocera', 1)
INSERT [dbo].[ITAssetBrands] ([ITAssetBrandId], [BrandName], [IsActive]) VALUES (1051, N'Panasonic', 1)
INSERT [dbo].[ITAssetBrands] ([ITAssetBrandId], [BrandName], [IsActive]) VALUES (1052, N'Apple', 1)
INSERT [dbo].[ITAssetBrands] ([ITAssetBrandId], [BrandName], [IsActive]) VALUES (1053, N'Samsung', 1)
INSERT [dbo].[ITAssetBrands] ([ITAssetBrandId], [BrandName], [IsActive]) VALUES (1054, N'LG', 1)
INSERT [dbo].[ITAssetBrands] ([ITAssetBrandId], [BrandName], [IsActive]) VALUES (1055, N'FORTINET', 1)
GO

INSERT [dbo].[ITAssetCategories] ([ITAssetCategoryId], [CategoryKey], [CategoryName], [Description], [VisibilityStatusId], [SortOrder], [CreatedAt], [UpdatedAt], [IconKey]) VALUES (1, N'Laptop', N'Laptop', N'Staff and student laptop assets', 1, 1, CAST(N'2026-06-27T09:11:41.993' AS DateTime), NULL, N'laptop')
INSERT [dbo].[ITAssetCategories] ([ITAssetCategoryId], [CategoryKey], [CategoryName], [Description], [VisibilityStatusId], [SortOrder], [CreatedAt], [UpdatedAt], [IconKey]) VALUES (2, N'Desktop', N'Desktop / Admin PC', N'Desktop computers', 1, 2, CAST(N'2026-06-27T09:11:41.993' AS DateTime), NULL, N'desktop')
INSERT [dbo].[ITAssetCategories] ([ITAssetCategoryId], [CategoryKey], [CategoryName], [Description], [VisibilityStatusId], [SortOrder], [CreatedAt], [UpdatedAt], [IconKey]) VALUES (3, N'ComputerLabPC', N'Computer Lab PC', N'Lab computers', 1, 3, CAST(N'2026-06-27T09:11:41.993' AS DateTime), NULL, N'category')
INSERT [dbo].[ITAssetCategories] ([ITAssetCategoryId], [CategoryKey], [CategoryName], [Description], [VisibilityStatusId], [SortOrder], [CreatedAt], [UpdatedAt], [IconKey]) VALUES (4, N'PrinterCopier', N'Printer / Copier', N'Printer and photocopier devices', 1, 4, CAST(N'2026-06-27T09:11:41.993' AS DateTime), NULL, N'printer')
INSERT [dbo].[ITAssetCategories] ([ITAssetCategoryId], [CategoryKey], [CategoryName], [Description], [VisibilityStatusId], [SortOrder], [CreatedAt], [UpdatedAt], [IconKey]) VALUES (5, N'Projector', N'Projector', N'Classroom and hall projectors', 1, 5, CAST(N'2026-06-27T09:11:41.993' AS DateTime), NULL, N'projector')
INSERT [dbo].[ITAssetCategories] ([ITAssetCategoryId], [CategoryKey], [CategoryName], [Description], [VisibilityStatusId], [SortOrder], [CreatedAt], [UpdatedAt], [IconKey]) VALUES (6, N'AccessPoint', N'Access Point', N'Wireless access points', 1, 6, CAST(N'2026-06-27T09:11:41.993' AS DateTime), NULL, N'category')
INSERT [dbo].[ITAssetCategories] ([ITAssetCategoryId], [CategoryKey], [CategoryName], [Description], [VisibilityStatusId], [SortOrder], [CreatedAt], [UpdatedAt], [IconKey]) VALUES (7, N'Switch', N'Switch', N'Network switches', 1, 7, CAST(N'2026-06-27T09:11:41.993' AS DateTime), NULL, N'category')
INSERT [dbo].[ITAssetCategories] ([ITAssetCategoryId], [CategoryKey], [CategoryName], [Description], [VisibilityStatusId], [SortOrder], [CreatedAt], [UpdatedAt], [IconKey]) VALUES (8, N'FirewallNetwork', N'Firewall / Network', N'Firewall and network devices', 1, 8, CAST(N'2026-06-27T09:11:41.993' AS DateTime), NULL, N'network')
INSERT [dbo].[ITAssetCategories] ([ITAssetCategoryId], [CategoryKey], [CategoryName], [Description], [VisibilityStatusId], [SortOrder], [CreatedAt], [UpdatedAt], [IconKey]) VALUES (9, N'CCTVCamera', N'CCTV Camera', N'CCTV cameras', 1, 9, CAST(N'2026-06-27T09:11:41.993' AS DateTime), NULL, N'camera')
INSERT [dbo].[ITAssetCategories] ([ITAssetCategoryId], [CategoryKey], [CategoryName], [Description], [VisibilityStatusId], [SortOrder], [CreatedAt], [UpdatedAt], [IconKey]) VALUES (10, N'IPPhone', N'IP Phone', N'IP phones', 1, 10, CAST(N'2026-06-27T09:11:41.993' AS DateTime), NULL, N'category')
INSERT [dbo].[ITAssetCategories] ([ITAssetCategoryId], [CategoryKey], [CategoryName], [Description], [VisibilityStatusId], [SortOrder], [CreatedAt], [UpdatedAt], [IconKey]) VALUES (11, N'LEDDisplay', N'LED Screen', N'LED displays and screens', 1, 11, CAST(N'2026-06-27T09:11:41.993' AS DateTime), NULL, N'monitor')
INSERT [dbo].[ITAssetCategories] ([ITAssetCategoryId], [CategoryKey], [CategoryName], [Description], [VisibilityStatusId], [SortOrder], [CreatedAt], [UpdatedAt], [IconKey]) VALUES (12, N'ServerOther', N'Server / Other Equipment', N'Servers and infrastructure', 1, 12, CAST(N'2026-06-27T09:11:41.993' AS DateTime), NULL, N'category')
INSERT [dbo].[ITAssetCategories] ([ITAssetCategoryId], [CategoryKey], [CategoryName], [Description], [VisibilityStatusId], [SortOrder], [CreatedAt], [UpdatedAt], [IconKey]) VALUES (13, N'Tablet', N'iPad / Tablet', N'Tablet devices', 1, 13, CAST(N'2026-06-27T09:11:41.993' AS DateTime), NULL, N'tablet')
INSERT [dbo].[ITAssetCategories] ([ITAssetCategoryId], [CategoryKey], [CategoryName], [Description], [VisibilityStatusId], [SortOrder], [CreatedAt], [UpdatedAt], [IconKey]) VALUES (14, N'ClassroomSpeaker', N'Classroom Speaker / Trunking', N'Audio and classroom trunking', 1, 14, CAST(N'2026-06-27T09:11:41.993' AS DateTime), NULL, N'category')
INSERT [dbo].[ITAssetCategories] ([ITAssetCategoryId], [CategoryKey], [CategoryName], [Description], [VisibilityStatusId], [SortOrder], [CreatedAt], [UpdatedAt], [IconKey]) VALUES (15, N'SoftwareLicense', N'Software License', N'Software licenses', 2, 15, CAST(N'2026-06-27T09:11:41.993' AS DateTime), NULL, N'category')
GO

INSERT [dbo].[ITAssetConditions] ([ITAssetConditionId], [ConditionKey], [ConditionName], [Description], [SortOrder]) VALUES (1, N'Excellent', N'Excellent', N'Excellent condition', 1)
INSERT [dbo].[ITAssetConditions] ([ITAssetConditionId], [ConditionKey], [ConditionName], [Description], [SortOrder]) VALUES (2, N'Good', N'Good', N'Good usable condition', 2)
INSERT [dbo].[ITAssetConditions] ([ITAssetConditionId], [ConditionKey], [ConditionName], [Description], [SortOrder]) VALUES (3, N'Fair', N'Fair', N'Fair condition', 3)
INSERT [dbo].[ITAssetConditions] ([ITAssetConditionId], [ConditionKey], [ConditionName], [Description], [SortOrder]) VALUES (4, N'NeedMaintenance', N'Need Maintenance', N'Requires maintenance or repair', 4)
INSERT [dbo].[ITAssetConditions] ([ITAssetConditionId], [ConditionKey], [ConditionName], [Description], [SortOrder]) VALUES (5, N'Damaged', N'Need Parts', N'Requires replacement parts or repair', 5)
INSERT [dbo].[ITAssetConditions] ([ITAssetConditionId], [ConditionKey], [ConditionName], [Description], [SortOrder]) VALUES (6, N'BeyondRepair', N'Beyond Repair', N'Not repairable', 6)
GO

GO

GO

GO

INSERT [dbo].[ITAssetIssueCategories] ([IssueCategoryId], [IssueCategoryKey], [IssueCategoryName], [ITAssetCategoryId], [IsActive]) VALUES (1, N'LaptopIssues', N'Laptop Issues', 1, 1)
INSERT [dbo].[ITAssetIssueCategories] ([IssueCategoryId], [IssueCategoryKey], [IssueCategoryName], [ITAssetCategoryId], [IsActive]) VALUES (2, N'ProjectorIssues', N'Projector Issues', 5, 1)
INSERT [dbo].[ITAssetIssueCategories] ([IssueCategoryId], [IssueCategoryKey], [IssueCategoryName], [ITAssetCategoryId], [IsActive]) VALUES (3, N'PrinterCopierIssues', N'Printer / Copier Issues', 4, 1)
INSERT [dbo].[ITAssetIssueCategories] ([IssueCategoryId], [IssueCategoryKey], [IssueCategoryName], [ITAssetCategoryId], [IsActive]) VALUES (4, N'HARDWARE', N'Hardware Issue', NULL, 1)
GO

GO

INSERT [dbo].[ITAssetIssueTypes] ([IssueTypeId], [IssueCategoryId], [IssueTypeKey], [IssueTypeName], [Description], [IsActive]) VALUES (1, 1, N'KeyboardIssue', N'Keyboard Issue', NULL, 1)
INSERT [dbo].[ITAssetIssueTypes] ([IssueTypeId], [IssueCategoryId], [IssueTypeKey], [IssueTypeName], [Description], [IsActive]) VALUES (2, 1, N'MotherboardIssue', N'Motherboard Issue', NULL, 1)
INSERT [dbo].[ITAssetIssueTypes] ([IssueTypeId], [IssueCategoryId], [IssueTypeKey], [IssueTypeName], [Description], [IsActive]) VALUES (3, 1, N'BatteryIssue', N'Battery Issue', NULL, 1)
INSERT [dbo].[ITAssetIssueTypes] ([IssueTypeId], [IssueCategoryId], [IssueTypeKey], [IssueTypeName], [Description], [IsActive]) VALUES (4, 1, N'ChargerIssue', N'Charger Issue', NULL, 1)
INSERT [dbo].[ITAssetIssueTypes] ([IssueTypeId], [IssueCategoryId], [IssueTypeKey], [IssueTypeName], [Description], [IsActive]) VALUES (5, 1, N'RamUpgradeNeeded', N'RAM Upgrade Needed', NULL, 1)
INSERT [dbo].[ITAssetIssueTypes] ([IssueTypeId], [IssueCategoryId], [IssueTypeKey], [IssueTypeName], [Description], [IsActive]) VALUES (6, 1, N'SsdUpgradeNeeded', N'SSD Upgrade Needed', NULL, 1)
INSERT [dbo].[ITAssetIssueTypes] ([IssueTypeId], [IssueCategoryId], [IssueTypeKey], [IssueTypeName], [Description], [IsActive]) VALUES (7, 1, N'ScreenIssue', N'Screen Issue', NULL, 1)
INSERT [dbo].[ITAssetIssueTypes] ([IssueTypeId], [IssueCategoryId], [IssueTypeKey], [IssueTypeName], [Description], [IsActive]) VALUES (8, 1, N'OsInstallation', N'OS Installation', NULL, 1)
INSERT [dbo].[ITAssetIssueTypes] ([IssueTypeId], [IssueCategoryId], [IssueTypeKey], [IssueTypeName], [Description], [IsActive]) VALUES (9, 1, N'SlowPerformance', N'Slow Performance', NULL, 1)
INSERT [dbo].[ITAssetIssueTypes] ([IssueTypeId], [IssueCategoryId], [IssueTypeKey], [IssueTypeName], [Description], [IsActive]) VALUES (10, 2, N'BulbReplacement', N'Bulb Replacement', NULL, 1)
INSERT [dbo].[ITAssetIssueTypes] ([IssueTypeId], [IssueCategoryId], [IssueTypeKey], [IssueTypeName], [Description], [IsActive]) VALUES (11, 2, N'LowBrightness', N'Low Brightness', NULL, 1)
INSERT [dbo].[ITAssetIssueTypes] ([IssueTypeId], [IssueCategoryId], [IssueTypeKey], [IssueTypeName], [Description], [IsActive]) VALUES (12, 2, N'HdmiPortIssue', N'HDMI Port Issue', NULL, 1)
INSERT [dbo].[ITAssetIssueTypes] ([IssueTypeId], [IssueCategoryId], [IssueTypeKey], [IssueTypeName], [Description], [IsActive]) VALUES (13, 2, N'RemoteMissing', N'Remote Missing', NULL, 1)
INSERT [dbo].[ITAssetIssueTypes] ([IssueTypeId], [IssueCategoryId], [IssueTypeKey], [IssueTypeName], [Description], [IsActive]) VALUES (14, 2, N'FilterCleaning', N'Filter Cleaning', NULL, 1)
INSERT [dbo].[ITAssetIssueTypes] ([IssueTypeId], [IssueCategoryId], [IssueTypeKey], [IssueTypeName], [Description], [IsActive]) VALUES (15, 2, N'Overheating', N'Overheating', NULL, 1)
INSERT [dbo].[ITAssetIssueTypes] ([IssueTypeId], [IssueCategoryId], [IssueTypeKey], [IssueTypeName], [Description], [IsActive]) VALUES (16, 2, N'NoDisplay', N'No Display', NULL, 1)
INSERT [dbo].[ITAssetIssueTypes] ([IssueTypeId], [IssueCategoryId], [IssueTypeKey], [IssueTypeName], [Description], [IsActive]) VALUES (17, 3, N'PaperJam', N'Paper Jam', NULL, 1)
INSERT [dbo].[ITAssetIssueTypes] ([IssueTypeId], [IssueCategoryId], [IssueTypeKey], [IssueTypeName], [Description], [IsActive]) VALUES (18, 3, N'TonerIssue', N'Toner Issue', NULL, 1)
INSERT [dbo].[ITAssetIssueTypes] ([IssueTypeId], [IssueCategoryId], [IssueTypeKey], [IssueTypeName], [Description], [IsActive]) VALUES (19, 3, N'DrumIssue', N'Drum Issue', NULL, 1)
INSERT [dbo].[ITAssetIssueTypes] ([IssueTypeId], [IssueCategoryId], [IssueTypeKey], [IssueTypeName], [Description], [IsActive]) VALUES (20, 3, N'NetworkIssue', N'Network Issue', NULL, 1)
INSERT [dbo].[ITAssetIssueTypes] ([IssueTypeId], [IssueCategoryId], [IssueTypeKey], [IssueTypeName], [Description], [IsActive]) VALUES (21, 3, N'ScannerIssue', N'Scanner Issue', NULL, 1)
INSERT [dbo].[ITAssetIssueTypes] ([IssueTypeId], [IssueCategoryId], [IssueTypeKey], [IssueTypeName], [Description], [IsActive]) VALUES (22, 4, N'KEYBOARD', N'Keyboard Issue', N'Keyboard not working or damaged', 1)
GO

GO

INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1, 1, 1, N'Latitude 5420', N'Dell Latitude 5420 Laptop', 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (2, 5, 2, N'EB-X49', N'Epson EB-X49 Projector', 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1252, 1, 1043, N'HP 255 G7', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1253, 1, 1043, N'HP 250 G7', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1254, 1, 1044, N'TOSHIBA PORTEGE', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1255, 1, 1045, N'LENOVO 81HN', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1256, 1, 1044, N'TOSHIBA TECRA-R840', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1257, 1, 1045, N'LENOVO', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1258, 1, 1045, N'LENOVO THINKPAD', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1259, 1, 1045, N'LENOVO IDEAPAD 320', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1260, 1, 1043, N'HP 250 G8', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1261, 1, 1043, N'HP 250 G9', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1262, 1, 1043, N'HP', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1263, 1, 1046, N'ASUS EXPERTBOOK', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1264, 1, 1, N'Dell', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1265, 1, 1045, N'Lenovo T450', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1266, 1, NULL, N'DYNABOOK L50-J-12G', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1267, 1, NULL, N'THINKPAD', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1268, 1, 1045, N'LENOVO 20DF00ABAD', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1269, 1, NULL, N'IDEAPAD', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1270, 1, 1045, N'LENOVO 250 G7', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1271, 1, 1046, N'ASUS VIVOBOOK 2026', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1272, 2, NULL, N'COOL MASTER', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1273, 2, 1, N'DELL-VOSTRO', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1274, 2, NULL, N'OLD', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1275, 2, 1045, N'LENOVO(New)', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1276, 2, 1043, N'HP PRO', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1277, 7, 1047, N'CISCO SG350-28P-K9-V03', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1278, 7, NULL, N'LINKSYS LGS326P', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1279, 7, 1048, N'ARUBA ARUBA 1930', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1280, 7, NULL, N'LINKSYS LG328MPC', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1281, 7, 1047, N'CISCO SF/100-24 SR224TV01', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1282, 7, NULL, N'LINKSYS LG326P', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1283, 7, 1047, N'CISCO SG300-28 SRW2024-K9 V04', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1284, 7, NULL, N'D- LINK DGSF1210 26FSE', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1285, 7, NULL, N'Fortigate 600D', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1286, 7, 1047, N'CISCO WS-C3850-24-T-S V07', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1287, 7, NULL, N'UBIQUITI UNIFI US-24-250W', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1288, 7, 1047, N'CISCO WS-C2960X-24TS -L V05', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1289, 7, 1047, N'CISCO SG-100-24 SR224T V01', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1290, 5, NULL, N'OPTOMA', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1291, 5, 1049, N'BENQ', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1292, 5, NULL, N'VIEW SONIC', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1293, 5, NULL, N'OPTPMA', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1294, 5, NULL, N'INFOCUS', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1295, 5, NULL, N'RICOH', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1296, 5, NULL, N'OPTOMA WHITE', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1297, 4, 1050, N'KYOCERA TASKalfa 4054Ci', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1298, 4, 1050, N'KYOCERA TASKalfa 352Ci', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1299, 4, NULL, N'ECOSYS MA5500IFX', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1300, 4, NULL, N'RISO FT5230', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1301, 9, NULL, N'CPLUS', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1302, 9, NULL, N'HIK Vison', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1303, 10, 1051, N'Panasonic KX - NT511', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1304, 10, 1051, N'Panasonic KX - NT553', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1305, 13, 1052, N'APPLE IPAD 6TH GEN', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1306, 11, NULL, N'HORION 65', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1307, 11, NULL, N'HORION 75', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1308, 11, NULL, N'MODEL', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1309, 11, NULL, N'GENEE POWERBOARD', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1310, 12, NULL, N'IBM SYSTEM x3650M2', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1311, 12, NULL, N'IBM SYSTEM x3650M5', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1312, 12, 1051, N'PANASONIC KXNS500', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1313, 12, NULL, N'CPLUS NVR', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1314, 12, 1053, N'SAMSUNG', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1315, 12, NULL, N'IKON', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1316, 12, NULL, N'Imin', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1317, 12, NULL, N'Cassida Xpecto', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1318, 12, NULL, N'SHURE', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1319, 12, NULL, N'AMC', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1320, 12, NULL, N'ZKTeco', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1321, 3, 1043, N'HP 280 G2 MT Tower Type Core i5', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1322, 3, 1043, N'HP 290 G4 Microtower PC', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1323, 3, 1045, N'Lenovo V520 8gb i5', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1324, 3, 1045, N'Lenovo TC E75', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1325, 3, 1045, N'Lenovo i3 Tower type Black', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1326, 3, NULL, N'AOPEN', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1327, 3, 1054, N'LG OLD', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1328, 3, 1, N'Dell Vostro-13G', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1329, 3, 1044, N'TOSHIBA PORTEGE R30-A1040', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1330, 3, NULL, N'THINKPAD E550', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1331, 3, 1044, N'TOSHIBA PORTEGE R930-C086', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1332, 3, NULL, N'THINKPAD E450', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1333, 3, 1045, N'LENOVO 80KY', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1334, 3, 1044, N'TOSHIBA PORTEGE R830-B071', NULL, 1)
INSERT [dbo].[ITAssetModels] ([ITAssetModelId], [ITAssetCategoryId], [ITAssetBrandId], [ModelName], [ModelDescription], [IsActive]) VALUES (1335, 6, 1055, N'Access Point', NULL, 1)
GO

GO

INSERT [dbo].[ITAssetNoteTypes] ([NoteTypeId], [NoteTypeKey], [NoteTypeName], [IsActive]) VALUES (1, N'General', N'General', 1)
INSERT [dbo].[ITAssetNoteTypes] ([NoteTypeId], [NoteTypeKey], [NoteTypeName], [IsActive]) VALUES (2, N'Repair', N'Repair', 1)
INSERT [dbo].[ITAssetNoteTypes] ([NoteTypeId], [NoteTypeKey], [NoteTypeName], [IsActive]) VALUES (3, N'Damage', N'Damage', 1)
INSERT [dbo].[ITAssetNoteTypes] ([NoteTypeId], [NoteTypeKey], [NoteTypeName], [IsActive]) VALUES (4, N'Return', N'Return', 1)
INSERT [dbo].[ITAssetNoteTypes] ([NoteTypeId], [NoteTypeKey], [NoteTypeName], [IsActive]) VALUES (5, N'Replacement', N'Replacement', 1)
INSERT [dbo].[ITAssetNoteTypes] ([NoteTypeId], [NoteTypeKey], [NoteTypeName], [IsActive]) VALUES (6, N'Warranty', N'Warranty', 1)
INSERT [dbo].[ITAssetNoteTypes] ([NoteTypeId], [NoteTypeKey], [NoteTypeName], [IsActive]) VALUES (7, N'Disposal', N'Disposal', 1)
INSERT [dbo].[ITAssetNoteTypes] ([NoteTypeId], [NoteTypeKey], [NoteTypeName], [IsActive]) VALUES (8, N'Transfer', N'Transfer', 1)
INSERT [dbo].[ITAssetNoteTypes] ([NoteTypeId], [NoteTypeKey], [NoteTypeName], [IsActive]) VALUES (9, N'Inspection', N'Inspection', 1)
GO

GO

INSERT [dbo].[ITAssetStatuses] ([ITAssetStatusId], [StatusKey], [StatusName], [Description], [IsFinalStatus], [SortOrder]) VALUES (1, N'Available', N'Available', N'Available for assignment', 0, 1)
INSERT [dbo].[ITAssetStatuses] ([ITAssetStatusId], [StatusKey], [StatusName], [Description], [IsFinalStatus], [SortOrder]) VALUES (2, N'Assigned', N'Assigned', N'Currently assigned', 0, 2)
INSERT [dbo].[ITAssetStatuses] ([ITAssetStatusId], [StatusKey], [StatusName], [Description], [IsFinalStatus], [SortOrder]) VALUES (3, N'Faulty', N'Faulty', N'Reported faulty or broken', 0, 3)
INSERT [dbo].[ITAssetStatuses] ([ITAssetStatusId], [StatusKey], [StatusName], [Description], [IsFinalStatus], [SortOrder]) VALUES (4, N'UnderRepair', N'Under Repair', N'Currently under repair', 0, 4)
INSERT [dbo].[ITAssetStatuses] ([ITAssetStatusId], [StatusKey], [StatusName], [Description], [IsFinalStatus], [SortOrder]) VALUES (5, N'ReadyForDisposal', N'Ready for Disposal', N'Inspected and ready for disposal approval', 0, 5)
INSERT [dbo].[ITAssetStatuses] ([ITAssetStatusId], [StatusKey], [StatusName], [Description], [IsFinalStatus], [SortOrder]) VALUES (6, N'Disposed', N'Disposed', N'Disposed asset', 1, 6)
INSERT [dbo].[ITAssetStatuses] ([ITAssetStatusId], [StatusKey], [StatusName], [Description], [IsFinalStatus], [SortOrder]) VALUES (7, N'Lost', N'Lost', N'Lost asset', 1, 7)
INSERT [dbo].[ITAssetStatuses] ([ITAssetStatusId], [StatusKey], [StatusName], [Description], [IsFinalStatus], [SortOrder]) VALUES (8, N'Stolen', N'Stolen', N'Stolen asset', 1, 8)
INSERT [dbo].[ITAssetStatuses] ([ITAssetStatusId], [StatusKey], [StatusName], [Description], [IsFinalStatus], [SortOrder]) VALUES (9, N'Archived', N'Archived', N'Archived historical record', 1, 9)
INSERT [dbo].[ITAssetStatuses] ([ITAssetStatusId], [StatusKey], [StatusName], [Description], [IsFinalStatus], [SortOrder]) VALUES (10, N'Borrowed', N'Borrowed', N'Temporarily borrowed asset', 0, 10)
GO

GO

GO

INSERT [dbo].[Languages] ([LanguageId], [LanguageCode], [LanguageName], [IsDefault], [IsActive]) VALUES (1, N'en', N'English', 1, 1)
INSERT [dbo].[Languages] ([LanguageId], [LanguageCode], [LanguageName], [IsDefault], [IsActive]) VALUES (2, N'ar', N'Arabic', 0, 1)
GO

INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1515, NULL, N'Other', N'Other', NULL, NULL, 1, CAST(N'2026-07-08T18:10:10.833' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1516, NULL, N'SchoolClinic', N'School Clinic', NULL, NULL, 1, CAST(N'2026-07-08T18:10:10.970' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1517, NULL, N'PRINCIPAL', N'PRINCIPAL', NULL, NULL, 1, CAST(N'2026-07-08T18:10:11.010' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1518, NULL, N'Senco', N'Senco', NULL, NULL, 1, CAST(N'2026-07-08T18:10:11.267' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1519, NULL, N'BOOKSHOP', N'BOOKSHOP', NULL, NULL, 1, CAST(N'2026-07-08T18:10:11.940' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1520, NULL, N'ALEVELMEDIAROOM', N'A LEVEL MEDIA ROOM', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.083' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1521, NULL, N'ASSTHUMANRESOURCE', N'ASST. HUMAN RESOURCE', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.090' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1522, NULL, N'ACCOUNTANT', N'ACCOUNTANT', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.100' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1523, NULL, N'CLINICMAINFSY4', N'CLINIC - MAIN - FS,Y4', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.107' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1524, NULL, N'CLINICBOYSYR5YEAR13BOYS', N'CLINIC - BOYS YR5 - YEAR 13 BOYS', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.110' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1525, NULL, N'JUNIORSCIENCELAB', N'JUNIOR SCIENCE LAB', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.120' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1526, NULL, N'DTLAB', N'D & T LAB', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.127' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1527, NULL, N'DIRECTORSSECRETARY', N'DIRECTORS'' SECRETARY', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.133' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1528, NULL, N'AUSACCOUNTANT', N'AUS ACCOUNTANT', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.140' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1529, NULL, N'RBTACCOUNTANT', N'RBT ACCOUNTANT', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.147' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1530, NULL, N'HUMANRESOURCE', N'HUMAN RESOURCE', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.160' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1531, NULL, N'EXAMINATIONOFFICER', N'EXAMINATION OFFICER', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.167' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1532, NULL, N'ARABICSECRETARY', N'ARABIC SECRETARY', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.173' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1533, NULL, N'STUDENTAFFAIR', N'STUDENT AFFAIR', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.180' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1534, NULL, N'RBTINCHARGE', N'RBT INCHARGE', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.187' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1535, NULL, N'MAINTENANCESUPERVISOR', N'MAINTENANCE SUPERVISOR', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.193' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1536, NULL, N'HEADOFOPERATION', N'HEAD OF OPERATION', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.200' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1537, NULL, N'RBTASSISTANT', N'RBT ASSISTANT', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.207' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1538, NULL, N'CANTEEN', N'CANTEEN', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.217' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1539, NULL, N'FINANCEMANAGER', N'FINANCE MANAGER', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.220' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1540, NULL, N'LIBRARYMAIN', N'LIBRARY - MAIN', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.230' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1541, NULL, N'SECRETARYSECONDARYBOYS', N'SECRETARY - SECONDARY BOYS', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.237' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1542, NULL, N'EXAMOFFICERSIXTHFORMSECRETARY', N'EXAM OFFICER/SIXTH FORM SECRETARY', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.243' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1543, NULL, N'DEPUTYHEADPRIMARY', N'DEPUTY HEAD - PRIMARY', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.253' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1544, NULL, N'GIRLSGROUNDFLOOR', N'GIRLS GROUND FLOOR', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.260' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1545, NULL, N'GIRLSFIRSTFLOOR', N'GIRLS FIRST FLOOR', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.410' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1546, NULL, N'GIRLSFIRSTFLOORSTAFFROOM', N'GIRLS FIRST FLOOR STAFF ROOM', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.467' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1547, NULL, N'BOYSGROUNDFLOOR', N'BOYS GROUND FLOOR', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.550' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1548, NULL, N'BOYSFIRSTFLOOR', N'BOYS FIRST FLOOR', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.640' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1549, NULL, N'PRIMARYGROUNDFLOOR', N'PRIMARY GROUND FLOOR', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.753' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1550, NULL, N'PRIMARYFIRSTFLOOR', N'PRIMARY FIRST FLOOR', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.807' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1551, NULL, N'PRIMARYFIRSTFLOORSTAFFROOM', N'PRIMARY FIRST FLOOR STAFF ROOM', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.860' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1552, NULL, N'ALEVELGROUNDFLOOR17', N'A-LEVEL GROUND FLOOR 17', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.887' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1553, NULL, N'ALEVELGROUNDFLOOR18', N'A-LEVEL GROUND FLOOR 18', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.893' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1554, NULL, N'ALEVELGROUNDFLOOR21', N'A-LEVEL GROUND FLOOR 21', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.900' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1555, NULL, N'ALEVELFIRSTFLOOR18', N'A-LEVEL FIRST FLOOR 18', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.910' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1556, NULL, N'ALEVELFIRSTFLOOR19', N'A-LEVEL FIRST FLOOR 19', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.913' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1557, NULL, N'ALEVELFIRSTFLOOR16', N'A-LEVEL FIRST FLOOR 16', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.920' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1558, NULL, N'ALEVELFIRSTFLOOR20', N'A-LEVEL FIRST FLOOR 20', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.927' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1559, NULL, N'ALEVELFIRSTFLOOR14', N'A-LEVEL FIRST FLOOR 14', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.933' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1560, NULL, N'FSFIRSTFLOOR', N'FS FIRST FLOOR', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.940' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1561, NULL, N'FSGROUNDFLOOR', N'FS GROUND FLOOR', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.980' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1562, NULL, N'ADMINGFMDROOM', N'ADMIN GF MD ROOM', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.003' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1563, NULL, N'ADMINGFHEADSEN', N'ADMIN GF HEAD SEN', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.010' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1564, NULL, N'ADMINGFSLTMEETINGROOM', N'ADMIN GF SLT MEETING ROOM', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.017' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1565, NULL, N'BOYSFFHeadofOperations', N'BOYS FF Head of Operations', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.023' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1566, NULL, N'TAHERHALLFFTAHERHALLLF', N'TAHER HALL FF TAHER HALL LF', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.027' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1567, NULL, N'TAHERHALLGFCR2', N'TAHER HALL GF CR2', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.033' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1568, NULL, N'TAHERHALLGFCR1BACK', N'TAHER HALL GF CR1 BACK', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.040' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1569, NULL, N'TAHERHALLGFCR1FRONT', N'TAHER HALL GF CR1 FRONT', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.047' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1570, NULL, N'TAHERHALLGFCR1ACCOUNTSDEPT', N'TAHER HALL GF CR1 ACCOUNTS DEPT', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.050' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1571, NULL, N'TAHERHALLGFTAHERHALLLOBBY', N'TAHER HALL GF TAHER HALL LOBBY', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.057' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1572, NULL, N'PRIMARYGFROOM10ICT', N'PRIMARY GF ROOM -10 ICT', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.063' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1573, NULL, N'PrimaryGFHeadofPrimary', N'Primary GF Head of Primary', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.070' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1574, NULL, N'AdminGFPrincipalRoom', N'Admin GF Principal Room', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.077' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1575, NULL, N'TaherGFDTRoom', N'Taher GF D&T Room', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.090' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1576, NULL, N'GirlsGFGirlsCorridor', N'Girls GF Girls Corridor', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.097' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1577, NULL, N'FSGFRM1', N'FS GF RM- 1', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.103' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1578, NULL, N'PrimaryGFPROROOM', N'Primary GF PRO ROOM', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.110' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1579, NULL, N'PrimaryGFPrimaryMeetingRoom', N'Primary GF Primary Meeting Room', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.117' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1580, NULL, N'TaherhallGFCANTEEN', N'Taher hall GF CANTEEN', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.123' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1581, NULL, N'PrimaryGFPrimaryClinic', N'Primary GF Primary Clinic', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.130' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1582, NULL, N'AdminGFVPPrincipal', N'Admin GF VP Principal', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.137' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1583, NULL, N'AdminGFAdminConferenceRm', N'Admin GF Admin Conference Rm', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.143' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1584, NULL, N'PrimaryGFPrimaryReception', N'Primary GF Primary Reception', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.150' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1585, NULL, N'GirlsFFGirlsICTLab', N'Girls FF Girls ICT Lab', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.157' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1586, NULL, N'ALevelFFALevelCoordinator', N'A Level FF A Level Coordinator', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.167' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1587, NULL, N'BoysGFRAMOLDAccomodation', N'Boys GF RAM OLD Accomodation', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.170' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1588, NULL, N'PrimaryGFRBT', N'Primary GF RBT', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.180' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1589, NULL, N'PrimaryGFMAINTENANCEMANAGER', N'Primary GF MAINTENANCE MANAGER', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.187' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1590, NULL, N'BoysICTGF', N'Boys ICT GF', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.197' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1591, NULL, N'GIRLSICTFF', N'GIRLS ICT FF', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.203' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1592, NULL, N'ICTLabPrimaryGF', N'ICT Lab Primary GF', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.220' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1593, NULL, N'PRIMARYIDF1', N'PRIMARY IDF 1', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.230' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1594, NULL, N'SERVERROOMTAHERHALLBLDGFF', N'SERVER ROOM, TAHER HALL BLDG FF', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.240' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1595, NULL, N'HEADOFOPERATIONS', N'HEAD OF OPERATIONS', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.247' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1596, NULL, N'FSGF', N'FS GF', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.257' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1597, NULL, N'BOYSGF', N'BOYS GF', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.263' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1598, NULL, N'ITDeptRoom', N'IT Dept Room', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.277' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1599, NULL, N'AdminGF', N'Admin GF', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.283' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1600, NULL, N'ACCOUNTSDEPT', N'ACCOUNTS DEPT', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.300' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1601, NULL, N'TAHERROOMTAHERHALLBLDGGF', N'TAHER ROOM, TAHER HALL BLDG GF', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.327' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1602, NULL, N'ADMINFIRSTFLOOR', N'ADMIN FIRST FLOOR', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.407' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1603, NULL, N'GIRLSBLOCK', N'GIRLS BLOCK', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.413' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1604, NULL, N'PRIMARYBLOCK', N'PRIMARY BLOCK', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.497' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1605, NULL, N'FSBLOCK', N'FS BLOCK', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.503' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1606, NULL, N'FSBLOCKFIRSTFLOOR', N'FS BLOCK - FIRST FLOOR', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.523' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1607, NULL, N'BOYSBLOCK', N'BOYS BLOCK', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.530' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1608, NULL, N'ADMINBLOCK', N'ADMIN BLOCK', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.600' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1609, NULL, N'TAHERBLDG', N'TAHER BLDG', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.627' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1610, NULL, N'PRIMARYBLOCKRoomSCIENCELAB', N'PRIMARY BLOCK Room SCIENCE LAB', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.847' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1611, NULL, N'TAHERBLDGRoomDNT', N'TAHER BLDG Room DNT', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.867' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1612, NULL, N'PRIMARYBLOCKRoomSTEAMLAB', N'PRIMARY BLOCK Room STEAM LAB', NULL, NULL, 1, CAST(N'2026-07-08T18:10:14.013' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1613, NULL, N'ADMINGROUNDFLOOR', N'ADMIN GROUND FLOOR', NULL, NULL, 1, CAST(N'2026-07-08T18:10:14.177' AS DateTime), NULL)
GO
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1614, NULL, N'PRIMARYBLOCKRoomMEETINGROOM', N'PRIMARY BLOCK Room MEETING ROOM', NULL, NULL, 1, CAST(N'2026-07-08T18:10:14.190' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1615, NULL, N'BOYSFF', N'BOYS'' FF', NULL, NULL, 1, CAST(N'2026-07-08T18:10:14.353' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1616, NULL, N'DOCTORGF', N'DOCTOR GF', NULL, NULL, 1, CAST(N'2026-07-08T18:10:14.363' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1617, NULL, N'PRIMARYGF', N'PRIMARY GF', NULL, NULL, 1, CAST(N'2026-07-08T18:10:14.380' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1618, NULL, N'TAHERHALLFF', N'TAHER HALL FF', NULL, NULL, 1, CAST(N'2026-07-08T18:10:14.397' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1619, NULL, N'TAHERHALGF', N'TAHER HAL GF', NULL, NULL, 1, CAST(N'2026-07-08T18:10:14.400' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1620, NULL, N'TAHERHALLGF', N'TAHER HALL GF', NULL, NULL, 1, CAST(N'2026-07-08T18:10:14.413' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1621, NULL, N'GIRLSGF', N'GIRLS GF', NULL, NULL, 1, CAST(N'2026-07-08T18:10:14.473' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1622, NULL, N'PRIMARYFF', N'PRIMARY FF', NULL, NULL, 1, CAST(N'2026-07-08T18:10:14.480' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1623, NULL, N'FSFF', N'FS FF', NULL, NULL, 1, CAST(N'2026-07-08T18:10:14.497' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1624, NULL, N'GIRLSFF', N'GIRLS FF', NULL, NULL, 1, CAST(N'2026-07-08T18:10:14.523' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1625, NULL, N'ADMINFF', N'ADMIN FF', NULL, NULL, 1, CAST(N'2026-07-08T18:10:14.577' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1626, NULL, N'ADMINDFF', N'ADMIND FF', NULL, NULL, 1, CAST(N'2026-07-08T18:10:14.587' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1627, NULL, N'ITROOMTAHERHALLBLDGGF', N'IT ROOM TAHER HALL BLDG GF', NULL, NULL, 1, CAST(N'2026-07-08T18:10:14.657' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1628, NULL, N'TAHERHALLBLDGGF', N'TAHER HALL BLDG GF', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.003' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1629, NULL, N'TAHERHALLBLDGFF', N'TAHER HALL BLDG FF', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.090' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1630, NULL, N'OUTSIDEVIEW', N'OUTSIDE VIEW', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.140' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1631, NULL, N'AdminBuildingFirstFloor', N'Admin. Building First Floor', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.280' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1632, NULL, N'TaherBuildingGroundFloor', N'Taher Building Ground Floor', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.290' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1633, NULL, N'GirlsBlockGroundFloor', N'Girls Block Ground Floor', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.293' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1634, NULL, N'AdminBuildingGroundFloor', N'Admin. Building Ground Floor', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.307' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1635, NULL, N'FSBlockGroundFloor', N'FS Block Ground Floor', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.310' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1636, NULL, N'PrimaryBlockFirstFloor', N'Primary Block First Floor', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.320' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1637, NULL, N'PrimaryBlockGroundFloor', N'Primary Block Ground Floor', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.383' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1638, NULL, N'GirlsBlockFirstFloor', N'Girls Block First Floor', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.390' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1639, NULL, N'BoysBlockFirstFloor', N'Boys Block First Floor', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.413' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1640, NULL, N'BoysBlockGroundFloor', N'Boys Block Ground Floor', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.420' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1641, NULL, N'GirlsGroundFirstFloor', N'Girls Ground First Floor', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.433' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1642, NULL, N'PrimaryFirstGroundFloor', N'Primary First Ground Floor', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.453' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1643, NULL, N'AdminBuilding1stFloor', N'Admin. Building 1st Floor', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.487' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1644, NULL, N'FSFirstGroundFloor', N'FS First Ground Floor', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.523' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1645, NULL, N'PrimaryGrroundFloor', N'Primary Grround Floor', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.587' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1646, NULL, N'BosyBlockFirstFloor', N'Bosy Block First Floor', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.593' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1647, NULL, N'STEAM', N'STEAM', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.663' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1648, NULL, N'SFCRM3', N'SFC RM3', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.793' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1649, NULL, N'SFCRM4', N'SFC RM4', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.803' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1650, NULL, N'SFCRM5', N'SFC RM5', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.810' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1651, NULL, N'SFCRM6', N'SFC RM6', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.820' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1652, NULL, N'SFCRM7', N'SFC RM7', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.823' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1653, NULL, N'SFCRM9', N'SFC RM9', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.830' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1654, NULL, N'SIXTHFORMRM19', N'SIXTHFORM RM19', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.837' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1655, NULL, N'SIXTHFORMRM12', N'SIXTHFORM RM12', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.843' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1656, NULL, N'LOCATION', N'LOCATION', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.850' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1657, NULL, N'FS', N'FS', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.857' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1658, NULL, N'ServerRoomTaherHallBuilding', N'Server Room Taher Hall Building', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.950' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1659, NULL, N'TaherHallAccountsDeptGF', N'Taher Hall Accounts Dept. GF', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.993' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1660, NULL, N'SLTMEETINGROOM', N'SLT MEETING ROOM', NULL, NULL, 1, CAST(N'2026-07-08T18:10:16.013' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1661, NULL, N'UniformRoom', N'Uniform Room', NULL, NULL, 1, CAST(N'2026-07-08T18:10:16.023' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1662, NULL, N'SecurityRoom', N'Security Room', NULL, NULL, 1, CAST(N'2026-07-08T18:10:16.030' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1663, NULL, N'PrincipalRoom', N'Principal Room', NULL, NULL, 1, CAST(N'2026-07-08T18:10:16.033' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1664, NULL, N'ITDeptRM', N'IT Dept RM', NULL, NULL, 1, CAST(N'2026-07-08T18:10:16.067' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1665, NULL, N'SeniorBoys', N'Senior Boys', NULL, NULL, 1, CAST(N'2026-07-08T18:10:16.117' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1666, NULL, N'JuniorBoys', N'Junior Boys', NULL, NULL, 1, CAST(N'2026-07-08T18:10:16.123' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1667, NULL, N'SeniorGirls', N'Senior Girls', NULL, NULL, 1, CAST(N'2026-07-08T18:10:16.130' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1668, NULL, N'JuniorGirls', N'Junior Girls', NULL, NULL, 1, CAST(N'2026-07-08T18:10:16.133' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1669, NULL, N'Sixthform', N'Sixthform', NULL, NULL, 1, CAST(N'2026-07-08T18:10:16.140' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1670, NULL, N'Admin', N'Admin', NULL, NULL, 1, CAST(N'2026-07-08T18:10:16.147' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1671, NULL, N'Primary', N'Primary', NULL, NULL, 1, CAST(N'2026-07-08T18:10:16.160' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1672, NULL, N'RBT', N'RBT', NULL, NULL, 1, CAST(N'2026-07-08T18:10:16.163' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1673, NULL, N'TaherHall', N'Taher Hall', NULL, NULL, 1, CAST(N'2026-07-08T18:10:16.170' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1674, NULL, N'GIRLSBLOCKRoomSMALLROOMSUSMITAROOM', N'GIRLS BLOCK Room SMALL ROOM SUSMITA ROOM', NULL, NULL, 1, CAST(N'2026-07-08T18:10:16.180' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1675, NULL, N'GIRLSBLOCKRoomSTAFFROOM', N'GIRLS BLOCK Room STAFF ROOM', NULL, NULL, 1, CAST(N'2026-07-08T18:10:16.310' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1676, NULL, N'PRIMARYBLOCKRoomSTAFFROOM', N'PRIMARY BLOCK Room STAFF ROOM', NULL, NULL, 1, CAST(N'2026-07-08T18:10:16.760' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1677, NULL, N'ADMINFIRSTFLOORRoomroom9english', N'ADMIN FIRST FLOOR Room room 9 english', NULL, NULL, 1, CAST(N'2026-07-08T18:10:16.790' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1678, NULL, N'ADMINFIRSTFLOORRoomMEDIAROOM', N'ADMIN FIRST FLOOR Room MEDIA ROOM', NULL, NULL, 1, CAST(N'2026-07-08T18:10:16.797' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1679, NULL, N'PRIMARYBLOCKRoomSFC', N'PRIMARY BLOCK Room SFC', NULL, NULL, 1, CAST(N'2026-07-08T18:10:17.007' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1680, NULL, N'PRIMARYBLOCKRoomPRIMARYCR', N'PRIMARY BLOCK Room PRIMARY CR', NULL, NULL, 1, CAST(N'2026-07-08T18:10:17.013' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1681, NULL, N'TAHERBLDGRoomLIBRARYMAIN', N'TAHER BLDG Room LIBRARY MAIN', NULL, NULL, 1, CAST(N'2026-07-08T18:10:17.037' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1682, NULL, N'TAHERBLDGRoomTAHERHALL', N'TAHER BLDG Room TAHER HALL', NULL, NULL, 1, CAST(N'2026-07-08T18:10:17.043' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1683, NULL, N'TAHERBLDGRoomSENIORLAB', N'TAHER BLDG Room SENIOR LAB', NULL, NULL, 1, CAST(N'2026-07-08T18:10:17.050' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1684, NULL, N'ALevelComputerLaboratoryTaherBuilding', N'A - Level Computer Laboratory Taher Building', NULL, NULL, 1, CAST(N'2026-07-08T18:10:17.067' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1685, NULL, N'SeniorComputerLaboratoryTaherBuilding', N'Senior Computer Laboratory Taher Building', NULL, NULL, 1, CAST(N'2026-07-08T18:10:17.220' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1686, NULL, N'BoysComputerLaboratoryBoysBlockGroundFloor', N'Boys Computer Laboratory Boys Block Ground Floor', NULL, NULL, 1, CAST(N'2026-07-08T18:10:17.377' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1687, NULL, N'GirlsComputerLaboratoryGirlsBlockFirstFloor', N'Girls Computer Laboratory Girls Block First Floor', NULL, NULL, 1, CAST(N'2026-07-08T18:10:17.533' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1688, NULL, N'PRIMARYICTLABGROUNDFLOOR', N'PRIMARY ICT LAB GROUND FLOOR', NULL, NULL, 1, CAST(N'2026-07-08T18:10:17.690' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1689, NULL, N'Year4ICTLab', N'Year 4 ICT Lab', NULL, NULL, 1, CAST(N'2026-07-08T18:10:17.840' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1690, NULL, N'LIBRARY02', N'LIBRARY  02', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.380' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1691, NULL, N'BOYSGFRM2COMPUTERLAB', N'BOYS-GF-RM2-COMPUTER LAB', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.400' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1692, NULL, N'LIBRARY01', N'LIBRARY 01', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.420' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1693, NULL, N'ITDEPARTMENT', N'IT DEPARTMENT', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.450' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1694, NULL, N'GIRLSFFHEADOFGIRLSSECTION', N'GIRLS-FF-HEAD OF GIRLS SECTION', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.483' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1695, NULL, N'FOUNDATIONFF', N'FOUNDATION-FF', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.553' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1696, NULL, N'BOYSGFCOUNSELLORRM', N'BOYS-GF-COUNSELLOR RM', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.610' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1697, NULL, N'FOUNDATIONGF', N'FOUNDATION-GF', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.657' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1698, NULL, N'BOYSGFRM08CHEMLAB', N'BOYS-GF-RM 08-CHEM LAB', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.690' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1699, NULL, N'BOYSGFRM9MALESTAFFROOM', N'BOYS-GF-RM 9-MALE STAFF ROOM', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.700' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1700, NULL, N'FOUNDATIONGFRM12', N'FOUNDATION-GF-RM 12', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.710' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1701, NULL, N'GIRLSFFITROOM', N'GIRLS-FF-IT ROOM', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.787' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1702, NULL, N'PRIMARYGFSCHOOLSUPPLIES', N'PRIMARY-GF-SCHOOL SUPPLIES', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.797' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1703, NULL, N'ITBLOCKGFWELLNESSOFFICER', N'IT BLOCK-GF-WELLNESS OFFICER', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.917' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1704, NULL, N'BOYSGFRM12', N'BOYS-GF-RM 12', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.960' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1705, NULL, N'BOYSFFRM101HEADOFSENIOR', N'BOYS-FF-RM 101-HEAD OF SENIOR', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.970' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1706, NULL, N'BOYSFFRM109', N'BOYS-FF-RM 109', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.980' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1707, NULL, N'ITBLOCKFFCOMPUTERLAB2', N'IT BLOCK-FF-COMPUTER LAB 2', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.003' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1708, NULL, N'TAHERHALLFFCOMPUTERLAB1', N'TAHER HALL -FF-COMPUTER LAB 1', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.020' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1709, NULL, N'ADMINFFHEADOFSIXTHFORM', N'ADMIN-FF-HEAD OF SIXTH FORM', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.030' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1710, NULL, N'AUDITORIUMFFLIFTLOBBY', N'AUDITORIUM-FF-LIFT LOBBY', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.040' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1711, NULL, N'PRIMARYGFLOBBY', N'PRIMARY-GF-LOBBY', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.093' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1712, NULL, N'FP231GTF24025742', N'FP231GTF24025742', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.220' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1713, NULL, N'TAHERHALLFFAUDITORIUMAP02', N'TAHER HALL-FF-AUDITORIUM-AP02', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.263' AS DateTime), NULL)
GO
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1714, NULL, N'ADMINGFPRINCIPAL', N'ADMIN-GF-PRINCIPAL', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.330' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1715, NULL, N'ADMINGFMDOFFICE', N'ADMIN-GF-MD OFFICE', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.370' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1716, NULL, N'ADMINGFRECEPTION', N'ADMIN-GF-RECEPTION', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.397' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1717, NULL, N'ADMINGFCORRIDOOR', N'ADMIN-GF-CORRI DOOR', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.430' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1718, NULL, N'BOYSGFCONSELLINGEXTRA', N'BOYS-GF-CONSELLING EXTRA', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.440' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1719, NULL, N'ADMINGFMEETINGROOM', N'ADMIN-GF-MEETING ROOM', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.450' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1720, NULL, N'PRIMARYFFRMLIBRARY', N'PRIMARY-FF-RM-LIBRARY', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.460' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1721, NULL, N'Admission', N'Admission', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.470' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1722, NULL, N'TAHERHALLFFAUDITORIUMAP01', N'TAHER HALL-FF-AUDITORIUM-AP01', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.480' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1723, NULL, N'FSGFIDF1RM', N'FS-GF-IDF 1-RM', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.503' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1724, NULL, N'FSGFIDF1', N'FS-GF-IDF 1', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.513' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1725, NULL, N'TAHERHALLGFDESIGNANDTECHNOLOGY', N'TAHER HALL-GF-DESIGN AND TECHNOLOGY', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.547' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1726, NULL, N'FOUNDATIONGFFS2RECEPTION', N'FOUNDATION-GF-FS2-RECEPTION', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.590' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1727, NULL, N'F0UNDATIONGFADMINISTRATION', N'F0UNDATION-GF-ADMINISTRATION', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.773' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1728, NULL, N'BOYSGFCOUNSELLORROOM10', N'BOYS-GF-COUNSELLOR ROOM 10', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.797' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1729, NULL, N'GIRLSGFHEADOFDEPARTMENT', N'GIRLS-GF-HEAD OF DEPARTMENT', NULL, NULL, 1, CAST(N'2026-07-09T22:28:53.057' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1730, NULL, N'GIRLSGFRMOFFICE2', N'GIRLS-GF-RM-OFFICE 2', NULL, NULL, 1, CAST(N'2026-07-09T22:28:53.077' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1731, NULL, N'CONFERENCERM201', N'CONFERENCE-RM2-01', NULL, NULL, 1, CAST(N'2026-07-09T22:28:53.127' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1732, NULL, N'ACCOUNTSROOM', N'ACCOUNTS ROOM', NULL, NULL, 1, CAST(N'2026-07-09T22:28:53.137' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1733, NULL, N'TAHERHALLGFRECEPTION', N'TAHER HALL GF -RECEPTION', NULL, NULL, 1, CAST(N'2026-07-09T22:28:53.147' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1734, NULL, N'ADMISSIONOFFICEGF', N'ADMISSION OFFICE-GF', NULL, NULL, 1, CAST(N'2026-07-09T22:28:53.153' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1735, NULL, N'CONFERENCERM101', N'CONFERENCE-RM1-01', NULL, NULL, 1, CAST(N'2026-07-09T22:28:53.170' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1736, NULL, N'FP231GTF24044414', N'FP231GTF24044414', NULL, NULL, 1, CAST(N'2026-07-09T22:28:53.180' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1737, NULL, N'TAHERHALLFFAUDITORIUMAP07', N'TAHER HALL-FF-AUDITORIUM-AP07', NULL, NULL, 1, CAST(N'2026-07-09T22:28:53.223' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1738, NULL, N'PRIMARYGFSFBTECH', N'PRIMARY-GF-SFBTECH', NULL, NULL, 1, CAST(N'2026-07-09T22:28:53.233' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1739, NULL, N'TAHERHALLFFAUDITORIUMAP08', N'TAHER HALL-FF-AUDITORIUM-AP08', NULL, NULL, 1, CAST(N'2026-07-09T22:28:53.243' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1740, NULL, N'CONFERENCERM102', N'CONFERENCE-RM1-02', NULL, NULL, 1, CAST(N'2026-07-09T22:28:53.257' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1741, NULL, N'PRIMARYGFSFBTECHOFFICE', N'PRIMARY-GF-SFBTECH-OFFICE', NULL, NULL, 1, CAST(N'2026-07-09T22:28:53.280' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1742, NULL, N'TAHERHALLFFAUDITORIUMAP04', N'TAHER HALL-FF-AUDITORIUM-AP04', NULL, NULL, 1, CAST(N'2026-07-09T22:28:53.297' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1743, NULL, N'CONFERENCERM202', N'CONFERENCE-RM2-02', NULL, NULL, 1, CAST(N'2026-07-09T22:28:53.323' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1744, NULL, N'TAHERHALLFFAUDITORIUMAP03', N'TAHER HALL-FF-AUDITORIUM-AP03', NULL, NULL, 1, CAST(N'2026-07-09T22:28:53.333' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1745, NULL, N'TAHERHALLFFAUDITORIUMAP06', N'TAHER HALL-FF-AUDITORIUM-AP06', NULL, NULL, 1, CAST(N'2026-07-09T22:28:53.343' AS DateTime), NULL)
INSERT [dbo].[Locations] ([LocationId], [BuildingId], [LocationKey], [LocationName], [FloorName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1746, NULL, N'TAHERHALLFFAUDITORIUMAP05', N'TAHER HALL-FF-AUDITORIUM-AP05', NULL, NULL, 1, CAST(N'2026-07-09T22:28:53.353' AS DateTime), NULL)
GO

INSERT [dbo].[LookupCategories] ([LookupCategoryId], [CategoryKey], [CategoryName], [ModuleId], [IsSystemCategory], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1, N'Priority', N'Priority', NULL, 1, 1, CAST(N'2026-06-27T09:11:42.303' AS DateTime), NULL)
INSERT [dbo].[LookupCategories] ([LookupCategoryId], [CategoryKey], [CategoryName], [ModuleId], [IsSystemCategory], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (2, N'Gender', N'Gender', NULL, 1, 1, CAST(N'2026-06-27T09:11:42.303' AS DateTime), NULL)
INSERT [dbo].[LookupCategories] ([LookupCategoryId], [CategoryKey], [CategoryName], [ModuleId], [IsSystemCategory], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (3, N'PrintSide', N'Print Side', NULL, 1, 1, CAST(N'2026-06-27T09:11:42.303' AS DateTime), NULL)
INSERT [dbo].[LookupCategories] ([LookupCategoryId], [CategoryKey], [CategoryName], [ModuleId], [IsSystemCategory], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (4, N'PaperSize', N'Paper Size', NULL, 1, 1, CAST(N'2026-06-27T09:11:42.303' AS DateTime), NULL)
INSERT [dbo].[LookupCategories] ([LookupCategoryId], [CategoryKey], [CategoryName], [ModuleId], [IsSystemCategory], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (5, N'IssuePriority', N'Issue Priority', NULL, 1, 1, CAST(N'2026-06-27T09:11:42.303' AS DateTime), NULL)
GO

INSERT [dbo].[LookupValues] ([LookupValueId], [LookupCategoryId], [ValueKey], [ValueName], [ValueDescription], [ParentLookupValueId], [ColorHex], [Icon], [IsSystemValue], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (1, 1, N'Low', N'Low', NULL, NULL, NULL, NULL, 0, 1, 1, CAST(N'2026-06-27T09:11:42.313' AS DateTime), NULL)
INSERT [dbo].[LookupValues] ([LookupValueId], [LookupCategoryId], [ValueKey], [ValueName], [ValueDescription], [ParentLookupValueId], [ColorHex], [Icon], [IsSystemValue], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (2, 1, N'Normal', N'Normal', NULL, NULL, NULL, NULL, 0, 1, 2, CAST(N'2026-06-27T09:11:42.313' AS DateTime), NULL)
INSERT [dbo].[LookupValues] ([LookupValueId], [LookupCategoryId], [ValueKey], [ValueName], [ValueDescription], [ParentLookupValueId], [ColorHex], [Icon], [IsSystemValue], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (3, 1, N'High', N'High', NULL, NULL, NULL, NULL, 0, 1, 3, CAST(N'2026-06-27T09:11:42.313' AS DateTime), NULL)
INSERT [dbo].[LookupValues] ([LookupValueId], [LookupCategoryId], [ValueKey], [ValueName], [ValueDescription], [ParentLookupValueId], [ColorHex], [Icon], [IsSystemValue], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (4, 1, N'Urgent', N'Urgent', NULL, NULL, NULL, NULL, 0, 1, 4, CAST(N'2026-06-27T09:11:42.313' AS DateTime), NULL)
INSERT [dbo].[LookupValues] ([LookupValueId], [LookupCategoryId], [ValueKey], [ValueName], [ValueDescription], [ParentLookupValueId], [ColorHex], [Icon], [IsSystemValue], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (5, 2, N'Boys', N'Boys', NULL, NULL, NULL, NULL, 0, 1, 1, CAST(N'2026-06-27T09:11:42.313' AS DateTime), NULL)
INSERT [dbo].[LookupValues] ([LookupValueId], [LookupCategoryId], [ValueKey], [ValueName], [ValueDescription], [ParentLookupValueId], [ColorHex], [Icon], [IsSystemValue], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (6, 2, N'Girls', N'Girls', NULL, NULL, NULL, NULL, 0, 1, 2, CAST(N'2026-06-27T09:11:42.313' AS DateTime), NULL)
INSERT [dbo].[LookupValues] ([LookupValueId], [LookupCategoryId], [ValueKey], [ValueName], [ValueDescription], [ParentLookupValueId], [ColorHex], [Icon], [IsSystemValue], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (7, 3, N'SingleSided', N'Single Sided', NULL, NULL, NULL, NULL, 0, 1, 1, CAST(N'2026-06-27T09:11:42.313' AS DateTime), NULL)
INSERT [dbo].[LookupValues] ([LookupValueId], [LookupCategoryId], [ValueKey], [ValueName], [ValueDescription], [ParentLookupValueId], [ColorHex], [Icon], [IsSystemValue], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (8, 3, N'DoubleSided', N'Double Sided', NULL, NULL, NULL, NULL, 0, 1, 2, CAST(N'2026-06-27T09:11:42.313' AS DateTime), NULL)
INSERT [dbo].[LookupValues] ([LookupValueId], [LookupCategoryId], [ValueKey], [ValueName], [ValueDescription], [ParentLookupValueId], [ColorHex], [Icon], [IsSystemValue], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (9, 4, N'A4', N'A4', NULL, NULL, NULL, NULL, 0, 1, 1, CAST(N'2026-06-27T09:11:42.313' AS DateTime), NULL)
INSERT [dbo].[LookupValues] ([LookupValueId], [LookupCategoryId], [ValueKey], [ValueName], [ValueDescription], [ParentLookupValueId], [ColorHex], [Icon], [IsSystemValue], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (10, 4, N'A3', N'A3', NULL, NULL, NULL, NULL, 0, 1, 2, CAST(N'2026-06-27T09:11:42.313' AS DateTime), NULL)
GO

INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (9, 10, 44, 10)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (10, 10, 45, 20)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (11, 11, 46, 10)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (12, 11, 47, 20)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (13, 11, 48, 30)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (14, 11, 49, 40)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (15, 11, 50, 50)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (16, 12, 51, 10)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (17, 12, 52, 20)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (18, 12, 53, 30)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (19, 12, 54, 40)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (20, 12, 55, 50)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (21, 12, 56, 60)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (22, 12, 57, 70)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (23, 13, 58, 10)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (24, 13, 59, 20)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (25, 13, 60, 30)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (26, 13, 61, 40)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (27, 14, 62, 10)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (28, 15, 63, 10)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (29, 16, 64, 10)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (30, 16, 65, 20)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (32, 16, 191, 10)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (33, 11, 205, 10)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (34, 10, 204, 10)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (35, 12, 194, 10)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (36, 12, 187, 20)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (37, 12, 188, 30)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (38, 12, 175, 40)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (39, 12, 185, 50)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (40, 12, 178, 60)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (41, 12, 190, 70)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (42, 12, 181, 80)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (43, 15, 202, 10)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (44, 14, 192, 10)
INSERT [dbo].[MenuGroupItems] ([MenuGroupItemId], [MenuGroupId], [MenuId], [SortOrder]) VALUES (45, 9, 43, 1)
GO

INSERT [dbo].[MenuGroups] ([MenuGroupId], [WorkspaceId], [GroupKey], [GroupName], [Icon], [VisibilityStatusId], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (9, 1, N'MAIN', N'Main', NULL, 1, 10, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T21:53:27.640' AS DateTime))
INSERT [dbo].[MenuGroups] ([MenuGroupId], [WorkspaceId], [GroupKey], [GroupName], [Icon], [VisibilityStatusId], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (10, 1, N'SCHOOL_CONFIGURATION', N'School Configuration', NULL, 1, 40, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T21:53:27.640' AS DateTime))
INSERT [dbo].[MenuGroups] ([MenuGroupId], [WorkspaceId], [GroupKey], [GroupName], [Icon], [VisibilityStatusId], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (11, 1, N'USER_ACCESS', N'User & Access', NULL, 1, 30, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T21:53:27.640' AS DateTime))
INSERT [dbo].[MenuGroups] ([MenuGroupId], [WorkspaceId], [GroupKey], [GroupName], [Icon], [VisibilityStatusId], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (12, 1, N'OPERATIONS', N'Operations', NULL, 1, 50, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T21:53:27.640' AS DateTime))
INSERT [dbo].[MenuGroups] ([MenuGroupId], [WorkspaceId], [GroupKey], [GroupName], [Icon], [VisibilityStatusId], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (13, 1, N'PLATFORM', N'Platform', NULL, 1, 80, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T21:53:27.643' AS DateTime))
INSERT [dbo].[MenuGroups] ([MenuGroupId], [WorkspaceId], [GroupKey], [GroupName], [Icon], [VisibilityStatusId], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (14, 1, N'SYSTEM', N'System', NULL, 1, 70, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T21:53:27.643' AS DateTime))
INSERT [dbo].[MenuGroups] ([MenuGroupId], [WorkspaceId], [GroupKey], [GroupName], [Icon], [VisibilityStatusId], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (15, 1, N'REPORTS_ANALYTICS', N'Reports & Analytics', NULL, 1, 60, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T21:53:27.640' AS DateTime))
INSERT [dbo].[MenuGroups] ([MenuGroupId], [WorkspaceId], [GroupKey], [GroupName], [Icon], [VisibilityStatusId], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (16, 1, N'PLATFORM_FOUNDATION', N'Platform Foundation', NULL, 1, 20, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T21:53:27.640' AS DateTime))
GO

INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (43, NULL, 1, NULL, N'DASHBOARD', N'Dashboard', N'/dashboard', N'dashboard', NULL, NULL, NULL, 1, 0, 1, 1, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-04T19:27:30.593' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (44, 1, 21, 204, N'ORGANIZATION_PROFILE', N'Organization Profile', N'/super-admin/organization/profile', N'business', NULL, NULL, NULL, 1, 0, 0, 10, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (45, 1, 21, 204, N'BRANDING_THEME', N'Branding & Theme', N'/system/branding', N'palette', NULL, NULL, NULL, 1, 0, 0, 20, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (46, 1, 2, 205, N'USERS', N'Users', N'/super-admin/users', N'people', NULL, NULL, NULL, 1, 0, 0, 10, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (47, 1, 2, 205, N'ROLES', N'Roles', N'/super-admin/roles', N'shield', NULL, NULL, NULL, 1, 0, 0, 20, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (48, 1, 2, 205, N'ACCESS_LEVELS', N'Access Levels', N'/super-admin/access-levels', N'admin_panel_settings', NULL, NULL, NULL, 1, 0, 0, 40, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (49, 1, 1, NULL, N'ASSIGNMENT_TYPES', N'Assignment Types', N'/super-admin/assignment-types', N'assignment', NULL, NULL, NULL, 2, 0, 0, 40, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (50, 1, 2, 205, N'USER_ASSIGNMENTS', N'User Assignments', N'/super-admin/user-assignments', N'hub', NULL, NULL, NULL, 1, 0, 0, 50, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (51, 1, 1, NULL, N'PRINTING', N'Printing', N'/super-admin/printing', N'print', NULL, NULL, NULL, 2, 0, 0, 10, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (52, 1, 6, 188, N'IT_ASSET_MANAGEMENT', N'Asset Management', N'/it-assets/assets', N'devices', NULL, NULL, NULL, 1, 0, 0, 20, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-07T21:57:57.260' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (53, 1, 1, NULL, N'IT_HELP_DESK', N'IT Help Desk', N'/super-admin/helpdesk', N'ticket', NULL, NULL, NULL, 2, 0, 0, 30, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (54, 1, 1, NULL, N'INVENTORY', N'Inventory', N'/super-admin/inventory', N'inventory', NULL, NULL, NULL, 2, 0, 0, 40, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (55, 1, 1, NULL, N'HR', N'HR', N'/super-admin/hr', N'people', NULL, NULL, NULL, 2, 0, 0, 50, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (56, 1, 3, NULL, N'ACADEMIC_OPERATIONS', N'Academic Operations', NULL, N'auto_stories', NULL, NULL, NULL, 2, 0, 1, 80, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (57, 1, 1, NULL, N'COMMUNICATION', N'Communication', N'/super-admin/communication', N'campaign', NULL, NULL, NULL, 2, 0, 0, 70, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (58, 1, 21, 204, N'DEPARTMENTS', N'Departments', N'/super-admin/settings/departments', N'business', NULL, NULL, NULL, 1, 0, 0, 30, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (59, 1, 21, 204, N'SECTIONS', N'Sections', N'/super-admin/settings/sections', N'account_tree', NULL, NULL, NULL, 1, 0, 0, 40, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (60, 1, 21, 204, N'SUBJECTS', N'Subjects', N'/super-admin/settings/subjects', N'menu_book', NULL, NULL, NULL, 1, 0, 0, 50, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (61, 1, 21, 204, N'PURPOSES', N'Purposes', N'/super-admin/settings/purposes', N'fact_check', NULL, NULL, NULL, 1, 0, 0, 60, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (62, 1, 23, 192, N'AUDIT_LOGS', N'Audit Logs', N'/system/audit-logs', N'history', NULL, NULL, NULL, 1, 0, 0, 60, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (63, 1, 1, NULL, N'PLATFORM_REPORTS', N'Platform Reports', N'/super-admin/reports', N'reports', NULL, NULL, NULL, 2, 0, 0, 10, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (64, 1, 1, 191, N'MODULE_MANAGER', N'Module Manager', N'/super-admin/modules', N'apps', NULL, NULL, NULL, 1, 0, 0, 10, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (65, 1, 23, 192, N'SYSTEM_HEALTH', N'System Health', N'/system/health', N'health_and_safety', NULL, NULL, NULL, 1, 0, 0, 70, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (66, 1, 1, NULL, N'IT_ASSETS_DASHBOARD', N'Dashboard', N'/super-admin/it-assets/dashboard', N'dashboard', NULL, NULL, NULL, 2, 0, 0, 10, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (67, 1, 1, NULL, N'IT_ASSETS_ASSET_MANAGEMENT', N'Asset Management', N'/super-admin/it-assets/assets', N'devices', NULL, NULL, NULL, 2, 0, 1, 20, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (68, 1, 1, NULL, N'IT_ASSETS_ASSIGNMENT', N'Asset Assignment', N'/super-admin/it-assets/assignments', N'assignment', NULL, NULL, NULL, 2, 0, 1, 30, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (69, 1, 1, NULL, N'IT_ASSETS_MAINTENANCE', N'Asset Maintenance', N'/super-admin/it-assets/maintenance', N'build', NULL, NULL, NULL, 2, 0, 1, 40, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (70, 1, 1, NULL, N'IT_ASSETS_IMPORT', N'Import Assets', N'/super-admin/it-assets/import', N'upload', NULL, NULL, NULL, 2, 0, 0, 50, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (71, 1, 1, NULL, N'IT_ASSETS_GROUPS', N'Asset Groups', N'/super-admin/it-assets/groups', N'groups', NULL, NULL, NULL, 2, 0, 0, 60, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (72, 1, 1, NULL, N'IT_ASSETS_MASTER_DATA', N'Master Data', N'/super-admin/it-assets/master-data', N'category', NULL, NULL, NULL, 2, 0, 1, 70, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (73, 1, 1, NULL, N'IT_ASSETS_REPORTS', N'Reports', N'/super-admin/it-assets/reports', N'reports', NULL, NULL, NULL, 2, 0, 1, 80, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (74, 1, 1, NULL, N'IT_ASSETS_ALL', N'All Assets', N'/super-admin/it-assets/assets/all', N'dot', NULL, NULL, NULL, 2, 0, 0, 10, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (75, 1, 1, NULL, N'IT_ASSETS_COMPUTERS', N'Computers', N'/super-admin/it-assets/assets/computers', N'dot', NULL, NULL, NULL, 2, 0, 0, 20, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (76, 1, 1, NULL, N'IT_ASSETS_PRINTERS_COPIERS', N'Printers & Copiers', N'/super-admin/it-assets/assets/printers-copiers', N'dot', NULL, NULL, NULL, 2, 0, 0, 30, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (77, 1, 1, NULL, N'IT_ASSETS_PROJECTORS', N'Projectors', N'/super-admin/it-assets/assets/projectors', N'dot', NULL, NULL, NULL, 2, 0, 0, 40, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (78, 1, 1, NULL, N'IT_ASSETS_NETWORK_DEVICES', N'Network Devices', N'/super-admin/it-assets/assets/network-devices', N'dot', NULL, NULL, NULL, 2, 0, 0, 50, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (79, 1, 1, NULL, N'IT_ASSETS_CCTV_CAMERAS', N'CCTV Cameras', N'/super-admin/it-assets/assets/cctv-cameras', N'dot', NULL, NULL, NULL, 2, 0, 0, 60, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (80, 1, 1, NULL, N'IT_ASSETS_CURRENT_ASSIGNMENTS', N'Current Assignments', N'/super-admin/it-assets/assignments/current', N'dot', NULL, NULL, NULL, 2, 0, 0, 10, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (81, 1, 1, NULL, N'IT_ASSETS_TRANSFER_REQUESTS', N'Transfer Requests', N'/super-admin/it-assets/assignments/transfers', N'dot', NULL, NULL, NULL, 2, 0, 0, 20, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (82, 1, 1, NULL, N'IT_ASSETS_NEEDED_LAPTOPS', N'Needed Laptops', N'/super-admin/it-assets/assignments/needed-laptops', N'dot', NULL, NULL, NULL, 2, 0, 0, 30, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (83, 1, 1, NULL, N'IT_ASSETS_ASSIGNMENT_HISTORY', N'Assignment History', N'/super-admin/it-assets/assignments/history', N'dot', NULL, NULL, NULL, 2, 0, 0, 40, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (84, 1, 1, NULL, N'IT_ASSETS_ISSUES', N'Issues', N'/super-admin/it-assets/maintenance/issues', N'dot', NULL, NULL, NULL, 2, 0, 0, 10, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (85, 1, 1, NULL, N'IT_ASSETS_MAINTENANCE_LOGS', N'Maintenance Logs', N'/super-admin/it-assets/maintenance/logs', N'dot', NULL, NULL, NULL, 2, 0, 0, 20, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (86, 1, 1, NULL, N'IT_ASSETS_MAINTENANCE_SCHEDULE', N'Maintenance Schedule', N'/super-admin/it-assets/maintenance/schedule', N'dot', NULL, NULL, NULL, 2, 0, 0, 30, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (87, 1, 1, NULL, N'IT_ASSETS_DISPOSAL', N'Disposal', N'/super-admin/it-assets/maintenance/disposal', N'dot', NULL, NULL, NULL, 2, 0, 0, 40, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (88, 1, 1, NULL, N'IT_ASSETS_CATEGORIES', N'Categories', N'/super-admin/it-assets/master-data/categories', N'dot', NULL, NULL, NULL, 2, 0, 0, 10, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (89, 1, 1, NULL, N'IT_ASSETS_BRANDS', N'Brands', N'/super-admin/it-assets/master-data/brands', N'dot', NULL, NULL, NULL, 2, 0, 0, 20, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (90, 1, 1, NULL, N'IT_ASSETS_MODELS', N'Models', N'/super-admin/it-assets/master-data/models', N'dot', NULL, NULL, NULL, 2, 0, 0, 30, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (91, 1, 1, NULL, N'IT_ASSETS_STATUSES', N'Statuses', N'/super-admin/it-assets/master-data/statuses', N'dot', NULL, NULL, NULL, 2, 0, 0, 40, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (92, 1, 1, NULL, N'IT_ASSETS_CONDITIONS', N'Conditions', N'/super-admin/it-assets/master-data/conditions', N'dot', NULL, NULL, NULL, 2, 0, 0, 50, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (93, 1, 1, NULL, N'IT_ASSETS_REPORT_INVENTORY', N'Inventory', N'/super-admin/it-assets/reports/inventory', N'dot', NULL, NULL, NULL, 2, 0, 0, 10, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (94, 1, 1, NULL, N'IT_ASSETS_REPORT_ASSIGNMENT', N'Assignment', N'/super-admin/it-assets/reports/assignment', N'dot', NULL, NULL, NULL, 2, 0, 0, 20, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (95, 1, 1, NULL, N'IT_ASSETS_REPORT_MAINTENANCE', N'Maintenance', N'/super-admin/it-assets/reports/maintenance', N'dot', NULL, NULL, NULL, 2, 0, 0, 30, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (96, 1, 1, NULL, N'IT_ASSETS_REPORT_ISSUES', N'Issues', N'/super-admin/it-assets/reports/issues', N'dot', NULL, NULL, NULL, 2, 0, 0, 40, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (97, 1, 1, NULL, N'IT_ASSETS_REPORT_DISPOSAL', N'Disposal', N'/super-admin/it-assets/reports/disposal', N'dot', NULL, NULL, NULL, 2, 0, 0, 50, CAST(N'2026-06-29T09:50:09.240' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))

INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (101, 1, 3, 175, N'ACADEMIC_REPORTS', N'Reports', N'/academic/reports', N'assessment', NULL, NULL, NULL, 1, 0, 0, 70, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (102, 1, 21, 204, N'ACADEMIC_YEARS', N'Academic Years', N'/super-admin/academic-years', N'calendar_month', NULL, NULL, NULL, 1, 0, 0, 70, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (103, 1, 17, 178, N'ANNOUNCEMENTS', N'Announcements', N'/communication/announcements', N'campaign', NULL, NULL, NULL, 1, 0, 0, 20, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (104, 1, 23, 192, N'ARCHIVE_CENTER', N'Archive Center', N'/system/archive', N'archive', NULL, NULL, NULL, 1, 0, 0, 50, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (105, 1, 3, 175, N'ASSESSMENTS', N'Assessments', N'/academic/assessments', N'assignment', NULL, NULL, NULL, 1, 0, 0, 40, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (106, 1, 3, 175, N'ATTENDANCE', N'Attendance', N'/academic/attendance', N'how_to_reg', NULL, NULL, NULL, 1, 0, 0, 30, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (107, 1, 23, 192, N'BACKUPS', N'Backups', N'/system/backups', N'backup', NULL, NULL, NULL, 1, 0, 0, 80, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (108, 1, 1, 191, N'BUTTON_MANAGER', N'Button Manager', N'/super-admin/buttons', N'touch_app', NULL, NULL, NULL, 1, 0, 0, 30, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (109, 1, 17, 178, N'CIRCULARS', N'Circulars', N'/communication/circulars', N'article', NULL, NULL, NULL, 1, 0, 0, 30, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (110, 1, 21, 204, N'CLASSES', N'Classes', N'/super-admin/classes', N'class', NULL, NULL, NULL, 1, 0, 0, 90, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (111, 1, 19, 190, N'CLASSROOM_WALKTHROUGHS', N'Classroom Walkthroughs', N'/observations/walkthroughs', N'checklist', NULL, NULL, NULL, 1, 0, 0, 30, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (112, 1, 17, NULL, N'COMMUNICATION_CENTER', N'Communication Center', NULL, N'campaign', NULL, NULL, NULL, 2, 0, 1, 90, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (113, 1, 17, 178, N'COMMUNICATION_TEMPLATES', N'Templates', N'/communication/templates', N'text_snippet', NULL, NULL, NULL, 1, 0, 0, 70, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (114, 1, 8, 202, N'CUSTOM_REPORTS', N'Custom Reports', N'/reports/custom', N'tune', NULL, NULL, NULL, 1, 0, 0, 80, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (115, 1, 23, 192, N'DOCUMENT_MANAGEMENT', N'Document Management', N'/system/documents', N'folder', NULL, NULL, NULL, 1, 0, 0, 30, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (116, 1, 17, 178, N'EMAILS', N'Emails', N'/communication/emails', N'email', NULL, NULL, NULL, 1, 0, 0, 40, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (117, 1, 18, 185, N'EMPLOYEES', N'Employees', N'/hr/employees', N'people', NULL, NULL, NULL, 1, 0, 0, 20, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (118, 1, 3, 175, N'EXAMINATIONS', N'Examinations', N'/academic/examinations', N'quiz', NULL, NULL, NULL, 1, 0, 0, 50, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (119, 1, 8, 202, N'EXECUTIVE_DASHBOARD', N'Executive Dashboard', N'/reports/executive', N'dashboard', NULL, NULL, NULL, 1, 0, 0, 10, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (120, 1, 8, 202, N'EXPORT_CENTER', N'Export Center', N'/reports/export', N'file_download', NULL, NULL, NULL, 1, 0, 0, 90, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (121, 1, 1, 191, N'FEATURE_FLAGS', N'Feature Flags', N'/super-admin/feature-flags', N'flag', NULL, NULL, NULL, 1, 0, 0, 50, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (122, 1, 23, 192, N'FORM_BUILDER', N'Form Builder', N'/system/forms', N'dynamic_form', NULL, NULL, NULL, 1, 0, 0, 20, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (123, 1, 23, 192, N'GLOBAL_SEARCH', N'Global Search', N'/system/global-search', N'search', NULL, NULL, NULL, 1, 0, 0, 40, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (124, 1, 18, 185, N'HR_ATTENDANCE', N'Attendance', N'/hr/attendance', N'how_to_reg', NULL, NULL, NULL, 1, 0, 0, 40, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (125, 1, 18, NULL, N'HR_MANAGEMENT', N'HR Management', NULL, N'groups', NULL, NULL, NULL, 2, 0, 1, 100, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (126, 1, 16, 187, N'ID_CARD_PRINTING', N'Card Printing', N'/id-management/card-printing', N'print', NULL, NULL, NULL, 1, 0, 0, 70, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (127, 1, 16, 187, N'ID_DASHBOARD', N'Dashboard', N'/id-management/dashboard', N'dashboard', NULL, NULL, NULL, 1, 0, 0, 10, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (128, 1, 16, NULL, N'ID_MANAGEMENT', N'ID Management', NULL, N'badge', NULL, NULL, NULL, 2, 0, 1, 60, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (129, 1, 16, 187, N'ID_QR_BARCODE', N'QR / Barcode', N'/id-management/qr-barcode', N'qr_code', NULL, NULL, NULL, 1, 0, 0, 60, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (130, 1, 16, 187, N'ID_REPORTS', N'Reports', N'/id-management/reports', N'assessment', NULL, NULL, NULL, 1, 0, 0, 80, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (131, 1, 16, 187, N'ID_SETTINGS', N'Settings', N'/id-management/settings', N'settings', NULL, NULL, NULL, 1, 0, 0, 90, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (132, 1, 16, 187, N'ID_TEMPLATES', N'Templates', N'/id-management/templates', N'dashboard_customize', NULL, NULL, NULL, 1, 0, 0, 50, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (133, 1, 6, 188, N'IT_DASHBOARD', N'Dashboard', N'/it-assets/dashboard', N'dashboard', NULL, NULL, NULL, 1, 0, 0, 10, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-07T21:57:57.260' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (134, 1, 6, 188, N'IT_INVENTORY', N'Inventory', N'/it/inventory', N'inventory_2', NULL, NULL, NULL, 2, 0, 0, 40, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-07T21:57:57.263' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (135, 1, 6, 188, N'IT_MAINTENANCE', N'Maintenance', N'/it-assets/maintenance', N'build', NULL, NULL, NULL, 1, 0, 0, 70, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-07T21:57:57.263' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (136, 1, 6, NULL, N'IT_OPERATIONS', N'IT Operations', NULL, N'devices', NULL, NULL, NULL, 2, 0, 1, 70, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (137, 1, 6, 188, N'IT_REPORTS', N'Reports', N'/it-assets/reports', N'assessment', NULL, NULL, NULL, 1, 0, 0, 90, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-07T21:57:57.263' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (138, 1, 6, 188, N'IT_SERVICE_DESK', N'Service Desk', N'/it/service-desk', N'support_agent', NULL, NULL, NULL, 2, 0, 0, 20, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-07T21:57:57.263' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (139, 1, 6, 188, N'IT_SETTINGS', N'Settings', N'/it/settings', N'settings', NULL, NULL, NULL, 2, 0, 0, 70, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-07T21:57:57.263' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (140, 1, 18, 185, N'LEAVE', N'Leave', N'/hr/leave', N'event_busy', NULL, NULL, NULL, 1, 0, 0, 30, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (141, 1, 1, NULL, N'MAIN_DASHBOARD', N'Dashboard', N'/super-admin/dashboard', N'dashboard', NULL, NULL, NULL, 2, 0, 0, 10, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:05:56.843' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (142, 1, 1, 191, N'MENU_MANAGER', N'Menu Manager', N'/super-admin/menus', N'menu', NULL, NULL, NULL, 1, 0, 0, 20, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (143, 1, 17, 178, N'NOTIFICATIONS', N'Notifications', N'/communication/notifications', N'notifications', NULL, NULL, NULL, 1, 0, 0, 60, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
GO
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (144, 1, 19, 190, N'OBSERVATION_REPORTS', N'Reports', N'/observations/reports', N'assessment', NULL, NULL, NULL, 1, 0, 0, 40, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (145, 1, 19, NULL, N'OBSERVATIONS', N'Observations', NULL, N'visibility', NULL, NULL, NULL, 2, 0, 1, 110, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (146, 1, 4, 194, N'PAPER_INVENTORY', N'Paper Inventory', N'/printing/inventory', N'inventory_2', NULL, NULL, NULL, 1, 0, 0, 50, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (147, 1, 4, 194, N'PAPER_PURCHASES', N'Paper Purchases', N'/printing/purchases', N'shopping_cart', NULL, NULL, NULL, 1, 0, 0, 60, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (148, 1, 18, 185, N'PERFORMANCE', N'Performance', N'/hr/performance', N'trending_up', NULL, NULL, NULL, 1, 0, 0, 50, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (149, 1, 2, 205, N'PERMISSIONS', N'Permissions', N'/super-admin/permissions', N'security', NULL, NULL, NULL, 1, 0, 0, 30, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (150, 1, 1, NULL, N'PLATFORM_FOUNDATION', N'Platform Foundation', NULL, N'admin_panel_settings', NULL, NULL, NULL, 2, 0, 1, 20, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (151, 1, 4, 194, N'PRINT_LIMITS', N'Limits & Allocation', N'/printing/limits', N'speed', NULL, NULL, NULL, 1, 0, 0, 70, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (152, 1, 4, 194, N'PRINT_QUEUE', N'Print Queue', N'/printing/queue', N'queue', NULL, NULL, NULL, 1, 0, 0, 40, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (153, 1, 4, 155, N'PRINTING_APPROVALS', N'Approval Workflow', N'/printing/approvals', N'approval', NULL, NULL, NULL, 1, 0, 0, 30, CAST(N'2026-07-02T21:43:31.830' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (154, 1, 4, 194, N'PRINTING_DASHBOARD', N'Dashboard', N'/printing/dashboard', N'dashboard', NULL, NULL, NULL, 1, 0, 0, 10, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (155, 1, 4, NULL, N'PRINTING_MANAGEMENT', N'Printing Management', NULL, N'print', NULL, NULL, NULL, 2, 0, 1, 50, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (156, 1, 4, 194, N'PRINTING_REPORTS', N'Reports', N'/printing/reports', N'bar_chart', NULL, NULL, NULL, 1, 0, 0, 80, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (157, 1, 4, 155, N'PRINTING_REQUESTS', N'Requests', N'/printing/requests', N'description', NULL, NULL, NULL, 1, 0, 0, 20, CAST(N'2026-07-02T21:43:31.830' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (158, 1, 4, 194, N'PRINTING_SETTINGS', N'Settings', N'/printing/settings', N'settings', NULL, NULL, NULL, 1, 0, 0, 90, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (159, 1, 8, NULL, N'REPORTS_ANALYTICS', N'Reports & Analytics', NULL, N'analytics', NULL, NULL, NULL, 2, 0, 1, 120, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (160, 1, 15, NULL, N'SCHOOL_STRUCTURE', N'School Structure', NULL, N'school', NULL, NULL, NULL, 2, 0, 1, 40, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (161, 1, 17, 178, N'SMS', N'SMS', N'/communication/sms', N'sms', NULL, NULL, NULL, 1, 0, 0, 50, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (162, 1, 16, 187, N'STAFF_IDS', N'Staff IDs', N'/id-management/staff-ids', N'badge', NULL, NULL, NULL, 1, 0, 0, 30, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (163, 1, 16, 187, N'STUDENT_IDS', N'Student IDs', N'/id-management/student-ids', N'school', NULL, NULL, NULL, 1, 0, 0, 20, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (164, 1, 3, 175, N'STUDENTS', N'Students', N'/academic/students', N'groups', NULL, NULL, NULL, 1, 0, 0, 20, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (165, 1, 23, 192, N'SYSTEM_SETTINGS', N'System Settings', N'/system/settings', N'settings', NULL, NULL, NULL, 1, 0, 0, 90, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (166, 1, 20, NULL, N'SYSTEM_TOOLS', N'System & Tools', NULL, N'settings_applications', NULL, NULL, NULL, 2, 0, 1, 130, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (167, 1, 19, 190, N'TEACHER_OBSERVATIONS', N'Teacher Observations', N'/observations/teacher', N'visibility', NULL, NULL, NULL, 1, 0, 0, 20, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (168, 1, 21, 204, N'TERMS', N'Terms', N'/super-admin/terms', N'date_range', NULL, NULL, NULL, 1, 0, 0, 80, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (169, 1, 2, NULL, N'USER_ACCESS', N'User & Access Management', NULL, N'manage_accounts', NULL, NULL, NULL, 2, 0, 1, 30, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.620' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (170, 1, 2, 205, N'USER_PERMISSION_OVERRIDES', N'User Permission Overrides', N'/super-admin/user-permission-overrides', N'manage_accounts', NULL, NULL, NULL, 1, 0, 0, 60, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (171, 1, 16, 187, N'VISITOR_IDS', N'Visitor IDs', N'/id-management/visitor-ids', N'person_add', NULL, NULL, NULL, 1, 0, 0, 40, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (172, 1, 1, 191, N'WIDGET_MANAGER', N'Widget Manager', N'/super-admin/widgets', N'widgets', NULL, NULL, NULL, 1, 0, 0, 40, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (173, 1, 23, 192, N'WORKFLOW_ENGINE', N'Workflow Engine', N'/system/workflows', N'account_tree', NULL, NULL, NULL, 1, 0, 0, 10, CAST(N'2026-07-02T21:43:31.830' AS DateTime), CAST(N'2026-07-02T22:02:34.163' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (174, 1, 3, 175, N'ACADEMIC_DASHBOARD', N'Dashboard', N'/academic/dashboard', N'dashboard', NULL, NULL, NULL, 1, 0, 0, 10, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (175, 1, 3, NULL, N'ACADEMIC_OPERATIONS_ROOT', N'Academic Operations', NULL, N'auto_stories', NULL, NULL, NULL, 1, 0, 1, 40, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (176, 1, 22, 181, N'BUILDINGS', N'Buildings', N'/facilities/buildings', N'apartment', NULL, NULL, NULL, 1, 0, 0, 30, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (177, 1, 3, 175, N'CLASS_MANAGEMENT', N'Class Management', N'/academic/classes', N'class', NULL, NULL, NULL, 1, 0, 0, 60, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (178, 1, 17, NULL, N'COMMUNICATION_CENTER_ROOT', N'Communication Center', NULL, N'campaign', NULL, NULL, NULL, 1, 0, 1, 60, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (179, 1, 17, 178, N'COMMUNICATION_DASHBOARD', N'Dashboard', N'/communication/dashboard', N'dashboard', NULL, NULL, NULL, 1, 0, 0, 10, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (180, 1, 22, 181, N'FACILITIES_DASHBOARD', N'Dashboard', N'/facilities/dashboard', N'dashboard', NULL, NULL, NULL, 1, 0, 0, 10, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (181, 1, 22, NULL, N'FACILITIES_MANAGEMENT_ROOT', N'Facilities Management', NULL, N'apartment', NULL, NULL, NULL, 1, 0, 1, 80, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (182, 1, 22, 181, N'FACILITY_MAINTENANCE', N'Maintenance Requests', N'/facilities/maintenance', N'build', NULL, NULL, NULL, 1, 0, 0, 50, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (183, 1, 22, 181, N'FACILITY_RESERVATIONS', N'Reservations', N'/facilities/reservations', N'event_available', NULL, NULL, NULL, 1, 0, 0, 40, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (184, 1, 18, 185, N'HR_DASHBOARD', N'Dashboard', N'/hr/dashboard', N'dashboard', NULL, NULL, NULL, 1, 0, 0, 10, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (185, 1, 18, NULL, N'HR_MANAGEMENT_ROOT', N'HR Management', NULL, N'groups', NULL, NULL, NULL, 1, 0, 1, 50, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (186, 1, 18, 185, N'HR_REPORTS', N'Reports', N'/hr/reports', N'assessment', NULL, NULL, NULL, 1, 0, 0, 60, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (187, 1, 16, NULL, N'ID_MANAGEMENT_ROOT', N'ID Management', NULL, N'badge', NULL, NULL, NULL, 1, 0, 1, 20, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (188, 1, 6, NULL, N'IT_OPERATIONS_ROOT', N'IT Operations', NULL, N'devices', NULL, NULL, NULL, 1, 0, 1, 30, CAST(N'2026-07-02T22:02:34.163' AS DateTime), CAST(N'2026-07-07T21:57:57.250' AS DateTime))
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (189, 1, 19, 190, N'OBSERVATIONS_DASHBOARD', N'Dashboard', N'/observations/dashboard', N'dashboard', NULL, NULL, NULL, 1, 0, 0, 10, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (190, 1, 19, NULL, N'OBSERVATIONS_ROOT', N'Observations', NULL, N'visibility', NULL, NULL, NULL, 1, 0, 1, 70, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (191, 1, 1, NULL, N'PLATFORM_FOUNDATION_ROOT', N'Platform Foundation', NULL, N'admin_panel_settings', NULL, NULL, NULL, 1, 0, 1, 10, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (192, 1, 23, NULL, N'PLATFORM_ROOT', N'Platform', NULL, N'settings_applications', NULL, NULL, NULL, 1, 0, 1, 10, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (193, 1, 4, 194, N'PRINTING_APPROVAL_WORKFLOW', N'Approval Workflow', N'/printing/approvals', N'approval', NULL, NULL, NULL, 1, 0, 0, 30, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (194, 1, 4, NULL, N'PRINTING_MANAGEMENT_ROOT', N'Printing Management', NULL, N'print', NULL, NULL, NULL, 1, 0, 1, 10, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (195, 1, 4, 194, N'PRINTING_REQUEST_MANAGEMENT', N'Request Management', N'/printing/requests', N'description', NULL, NULL, NULL, 1, 0, 0, 20, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (196, 1, 8, 202, N'REPORT_ACADEMIC', N'Academic Reports', N'/reports/academic', N'auto_stories', NULL, NULL, NULL, 1, 0, 0, 50, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (197, 1, 8, 202, N'REPORT_COMMUNICATION', N'Communication Reports', N'/reports/communication', N'campaign', NULL, NULL, NULL, 1, 0, 0, 70, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (198, 1, 8, 202, N'REPORT_HR', N'HR Reports', N'/reports/hr', N'groups', NULL, NULL, NULL, 1, 0, 0, 60, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (199, 1, 8, 202, N'REPORT_ID', N'ID Reports', N'/reports/id-management', N'badge', NULL, NULL, NULL, 1, 0, 0, 30, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (200, 1, 8, 202, N'REPORT_IT', N'IT Reports', N'/reports/it', N'devices', NULL, NULL, NULL, 1, 0, 0, 40, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (201, 1, 8, 202, N'REPORT_PRINTING', N'Printing Reports', N'/reports/printing', N'print', NULL, NULL, NULL, 1, 0, 0, 20, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (202, 1, 8, NULL, N'REPORTS_ANALYTICS_ROOT', N'Reports & Analytics', NULL, N'analytics', NULL, NULL, NULL, 1, 0, 1, 10, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (203, 1, 22, 181, N'ROOMS', N'Rooms', N'/facilities/rooms', N'meeting_room', NULL, NULL, NULL, 1, 0, 0, 20, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (204, 1, 21, NULL, N'SCHOOL_CONFIGURATION_ROOT', N'School Configuration', NULL, N'school', NULL, NULL, NULL, 1, 0, 1, 10, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (205, 1, 2, NULL, N'USER_ACCESS_ROOT', N'User & Access', NULL, N'manage_accounts', NULL, NULL, NULL, 1, 0, 1, 10, CAST(N'2026-07-02T22:02:34.163' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (1206, 1, 6, 188, N'IT_ASSIGNMENTS', N'Assignments', N'/it-assets/assignments', N'assignment_ind', NULL, NULL, NULL, 1, 0, 0, 30, CAST(N'2026-07-07T21:57:57.267' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (1207, 1, 6, 188, N'IT_BORROW_RETURN', N'Borrow & Return', N'/it-assets/borrow', N'laptop_chromebook', NULL, NULL, NULL, 1, 0, 0, 40, CAST(N'2026-07-07T21:57:57.273' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (1208, 1, 6, 188, N'IT_TRANSFERS', N'Transfers', N'/it-assets/transfers', N'swap_horiz', NULL, NULL, NULL, 1, 0, 0, 50, CAST(N'2026-07-07T21:57:57.277' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (1209, 1, 6, 188, N'IT_ISSUES', N'Issues', N'/it-assets/issues', N'report_problem', NULL, NULL, NULL, 1, 0, 0, 60, CAST(N'2026-07-07T21:57:57.277' AS DateTime), NULL)
INSERT [dbo].[Menus] ([MenuId], [WorkspaceId], [ModuleId], [ParentMenuId], [MenuKey], [MenuName], [Route], [Icon], [PermissionId], [FeatureFlagId], [BadgeQueryKey], [VisibilityStatusId], [IsPinned], [IsCollapsible], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (1210, 1, 6, 188, N'IT_DISPOSALS', N'Disposals', N'/it-assets/disposals', N'delete_outline', NULL, NULL, NULL, 1, 0, 0, 80, CAST(N'2026-07-07T21:57:57.277' AS DateTime), NULL)
GO

INSERT [dbo].[Modules] ([ModuleId], [ModuleKey], [ModuleName], [Description], [Icon], [BaseRoute], [VisibilityStatusId], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (1, N'platform_foundation', N'Platform Foundation', N'Platform managers: modules, menus, buttons, widgets, and feature flags.', N'admin_panel_settings', N'/super-admin', 1, 1, 1, CAST(N'2026-06-27T09:11:41.970' AS DateTime), CAST(N'2026-07-02T22:02:33.910' AS DateTime))
INSERT [dbo].[Modules] ([ModuleId], [ModuleKey], [ModuleName], [Description], [Icon], [BaseRoute], [VisibilityStatusId], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (2, N'user_access', N'User & Access', N'Users, roles, permissions, access levels, and assignments.', N'manage_accounts', N'/super-admin/user-access', 1, 1, 2, CAST(N'2026-06-27T09:11:41.970' AS DateTime), CAST(N'2026-07-02T22:02:33.910' AS DateTime))
INSERT [dbo].[Modules] ([ModuleId], [ModuleKey], [ModuleName], [Description], [Icon], [BaseRoute], [VisibilityStatusId], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (3, N'academic_operations', N'Academic Operations', N'Students, attendance, assessments, examinations, class management, and academic reports.', N'auto_stories', N'/academic', 1, 1, 7, CAST(N'2026-06-27T09:11:41.970' AS DateTime), CAST(N'2026-07-02T22:02:33.910' AS DateTime))
INSERT [dbo].[Modules] ([ModuleId], [ModuleKey], [ModuleName], [Description], [Icon], [BaseRoute], [VisibilityStatusId], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (4, N'printing_management', N'Printing Management', N'Printing requests, approvals, queue, paper inventory, purchases, limits, reports, and settings.', N'print', N'/printing', 1, 1, 4, CAST(N'2026-06-27T09:11:41.970' AS DateTime), CAST(N'2026-07-02T22:02:33.910' AS DateTime))
INSERT [dbo].[Modules] ([ModuleId], [ModuleKey], [ModuleName], [Description], [Icon], [BaseRoute], [VisibilityStatusId], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (5, N'inventory', N'Inventory Management', N'Paper inventory and transactions', N'inventory_2', N'/inventory', 2, 0, 5, CAST(N'2026-06-27T09:11:41.970' AS DateTime), CAST(N'2026-07-02T22:02:33.950' AS DateTime))
INSERT [dbo].[Modules] ([ModuleId], [ModuleKey], [ModuleName], [Description], [Icon], [BaseRoute], [VisibilityStatusId], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (6, N'it_operations', N'IT Operations', N'IT service desk, assets, inventory, maintenance, reports, and settings.', N'devices', N'/it-assets', 1, 1, 6, CAST(N'2026-06-27T09:11:41.970' AS DateTime), CAST(N'2026-07-07T21:57:57.243' AS DateTime))
INSERT [dbo].[Modules] ([ModuleId], [ModuleKey], [ModuleName], [Description], [Icon], [BaseRoute], [VisibilityStatusId], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (7, N'it_service_desk', N'IT Service Desk', N'IT tickets and support workflow', N'support_agent', N'/it-service-desk', 2, 0, 7, CAST(N'2026-06-27T09:11:41.970' AS DateTime), CAST(N'2026-07-02T22:02:33.950' AS DateTime))
INSERT [dbo].[Modules] ([ModuleId], [ModuleKey], [ModuleName], [Description], [Icon], [BaseRoute], [VisibilityStatusId], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (8, N'reports_analytics', N'Reports & Analytics', N'Executive dashboards, analytics, custom reports, and export center.', N'analytics', N'/reports', 1, 1, 12, CAST(N'2026-06-27T09:11:41.970' AS DateTime), CAST(N'2026-07-02T22:02:33.910' AS DateTime))
INSERT [dbo].[Modules] ([ModuleId], [ModuleKey], [ModuleName], [Description], [Icon], [BaseRoute], [VisibilityStatusId], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (9, N'workflow_engine', N'Workflow Engine', N'Reusable workflow approvals', N'account_tree', N'/workflow-engine', 2, 1, 9, CAST(N'2026-06-27T09:11:41.970' AS DateTime), NULL)
INSERT [dbo].[Modules] ([ModuleId], [ModuleKey], [ModuleName], [Description], [Icon], [BaseRoute], [VisibilityStatusId], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (10, N'communication', N'Communication Center', N'Notifications and email queue', N'campaign', N'/communication', 2, 1, 10, CAST(N'2026-06-27T09:11:41.970' AS DateTime), NULL)
INSERT [dbo].[Modules] ([ModuleId], [ModuleKey], [ModuleName], [Description], [Icon], [BaseRoute], [VisibilityStatusId], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (11, N'system_control', N'System Control Center', N'Settings, backup, security and audit', N'settings', N'/system-control', 1, 1, 11, CAST(N'2026-06-27T09:11:41.970' AS DateTime), NULL)
INSERT [dbo].[Modules] ([ModuleId], [ModuleKey], [ModuleName], [Description], [Icon], [BaseRoute], [VisibilityStatusId], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (15, N'school_structure', N'School Structure', N'Shared school structure and academic master data', N'school', N'/super-admin/school-structure', 1, 1, 3, CAST(N'2026-07-02T21:43:31.710' AS DateTime), CAST(N'2026-07-02T21:43:31.723' AS DateTime))
INSERT [dbo].[Modules] ([ModuleId], [ModuleKey], [ModuleName], [Description], [Icon], [BaseRoute], [VisibilityStatusId], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (16, N'id_management', N'ID Management', N'Student IDs, staff IDs, visitor IDs, templates, QR/barcode, card printing, and reports.', N'badge', N'/id-management', 1, 1, 5, CAST(N'2026-07-02T21:43:31.710' AS DateTime), CAST(N'2026-07-02T22:02:33.910' AS DateTime))
INSERT [dbo].[Modules] ([ModuleId], [ModuleKey], [ModuleName], [Description], [Icon], [BaseRoute], [VisibilityStatusId], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (17, N'communication_center', N'Communication Center', N'Announcements, circulars, emails, SMS, notifications, and templates.', N'campaign', N'/communication', 1, 1, 9, CAST(N'2026-07-02T21:43:31.710' AS DateTime), CAST(N'2026-07-02T22:02:33.910' AS DateTime))
INSERT [dbo].[Modules] ([ModuleId], [ModuleKey], [ModuleName], [Description], [Icon], [BaseRoute], [VisibilityStatusId], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (18, N'hr_management', N'HR Management', N'Employees, leave, attendance, performance, and reports.', N'groups', N'/hr', 1, 1, 8, CAST(N'2026-07-02T21:43:31.710' AS DateTime), CAST(N'2026-07-02T22:02:33.910' AS DateTime))
INSERT [dbo].[Modules] ([ModuleId], [ModuleKey], [ModuleName], [Description], [Icon], [BaseRoute], [VisibilityStatusId], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (19, N'observations', N'Observations', N'Teacher observations, classroom walkthroughs, and observation reports.', N'visibility', N'/observations', 1, 1, 10, CAST(N'2026-07-02T21:43:31.710' AS DateTime), CAST(N'2026-07-02T22:02:33.910' AS DateTime))
INSERT [dbo].[Modules] ([ModuleId], [ModuleKey], [ModuleName], [Description], [Icon], [BaseRoute], [VisibilityStatusId], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (20, N'system_tools', N'System & Tools', N'Branding, workflow, documents, audit logs, backups, and settings', N'settings_applications', N'/system', 1, 1, 12, CAST(N'2026-07-02T21:43:31.710' AS DateTime), CAST(N'2026-07-02T21:43:31.723' AS DateTime))
INSERT [dbo].[Modules] ([ModuleId], [ModuleKey], [ModuleName], [Description], [Icon], [BaseRoute], [VisibilityStatusId], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (21, N'school_configuration', N'School Configuration', N'School identity, branding, departments, sections, subjects, terms, and classes.', N'school', N'/super-admin/school-configuration', 1, 1, 3, CAST(N'2026-07-02T22:02:33.887' AS DateTime), CAST(N'2026-07-02T22:02:33.910' AS DateTime))
INSERT [dbo].[Modules] ([ModuleId], [ModuleKey], [ModuleName], [Description], [Icon], [BaseRoute], [VisibilityStatusId], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (22, N'facilities_management', N'Facilities Management', N'Rooms, buildings, reservations, maintenance requests, and facilities operations.', N'apartment', N'/facilities', 1, 1, 11, CAST(N'2026-07-02T22:02:33.887' AS DateTime), CAST(N'2026-07-02T22:02:33.910' AS DateTime))
INSERT [dbo].[Modules] ([ModuleId], [ModuleKey], [ModuleName], [Description], [Icon], [BaseRoute], [VisibilityStatusId], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (23, N'platform', N'Platform', N'Workflow, forms, documents, global search, archive, audit logs, system health, backups, and settings.', N'settings_applications', N'/system', 1, 1, 13, CAST(N'2026-07-02T22:02:33.887' AS DateTime), CAST(N'2026-07-02T22:02:33.910' AS DateTime))
GO

INSERT [dbo].[NotificationChannels] ([NotificationChannelId], [ChannelKey], [ChannelName], [IsActive]) VALUES (1, N'InApp', N'In-App Notification', 1)
INSERT [dbo].[NotificationChannels] ([NotificationChannelId], [ChannelKey], [ChannelName], [IsActive]) VALUES (2, N'Email', N'Email', 1)
INSERT [dbo].[NotificationChannels] ([NotificationChannelId], [ChannelKey], [ChannelName], [IsActive]) VALUES (3, N'System', N'System Alert', 1)
GO

INSERT [dbo].[NotificationPreferenceTypes] ([NotificationPreferenceTypeId], [PreferenceKey], [PreferenceName], [Description], [IsActive]) VALUES (1, N'PrintingUpdates', N'Printing Updates', N'Printing request status and approval updates', 1)
INSERT [dbo].[NotificationPreferenceTypes] ([NotificationPreferenceTypeId], [PreferenceKey], [PreferenceName], [Description], [IsActive]) VALUES (2, N'AssetUpdates', N'Asset Updates', N'Asset assignment, transfer and repair updates', 1)
INSERT [dbo].[NotificationPreferenceTypes] ([NotificationPreferenceTypeId], [PreferenceKey], [PreferenceName], [Description], [IsActive]) VALUES (3, N'StudentIdUpdates', N'Student ID Updates', N'Student ID verification and approval updates', 1)
INSERT [dbo].[NotificationPreferenceTypes] ([NotificationPreferenceTypeId], [PreferenceKey], [PreferenceName], [Description], [IsActive]) VALUES (4, N'SecurityAlerts', N'Security Alerts', N'Login, password and security alerts', 1)
INSERT [dbo].[NotificationPreferenceTypes] ([NotificationPreferenceTypeId], [PreferenceKey], [PreferenceName], [Description], [IsActive]) VALUES (5, N'SystemAnnouncements', N'System Announcements', N'Platform announcements and banners', 1)
GO

INSERT [dbo].[PaperInventory] ([InventoryId], [PaperType], [CurrentStock], [LastUpdated]) VALUES (1, N'A4', 0, CAST(N'2026-06-27T09:11:42.040' AS DateTime))
INSERT [dbo].[PaperInventory] ([InventoryId], [PaperType], [CurrentStock], [LastUpdated]) VALUES (2, N'A3', 0, CAST(N'2026-06-27T09:11:42.040' AS DateTime))
GO

INSERT [dbo].[Permissions] ([PermissionId], [PermissionKey], [PermissionName], [ModuleId], [GroupKey], [GroupName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (2, N'lookups.view', N'View Lookups', 1, N'platform', N'Platform', N'Allows access to platform lookup/reference dropdown data.', 1, CAST(N'2026-06-30T22:52:51.193' AS DateTime), NULL)
INSERT [dbo].[Permissions] ([PermissionId], [PermissionKey], [PermissionName], [ModuleId], [GroupKey], [GroupName], [Description], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (4, N'TEST_PERMISSION', N'Test Permission', 1, N'platform', N'Platform', N'Testing Permission Manager', 0, CAST(N'2026-07-04T01:51:15.313' AS DateTime), CAST(N'2026-07-04T01:52:22.197' AS DateTime))
GO

INSERT [dbo].[Purposes] ([PurposeId], [PurposeKey], [PurposeName], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (1, N'CLASSWORK', N'Classwork', 1, 1, CAST(N'2026-06-27T09:11:41.940' AS DateTime), NULL)
INSERT [dbo].[Purposes] ([PurposeId], [PurposeKey], [PurposeName], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (2, N'HOMEWORK', N'Homework', 1, 2, CAST(N'2026-06-27T09:11:41.940' AS DateTime), NULL)
INSERT [dbo].[Purposes] ([PurposeId], [PurposeKey], [PurposeName], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (3, N'ASSESSMENT', N'Assessment', 1, 3, CAST(N'2026-06-27T09:11:41.940' AS DateTime), NULL)
INSERT [dbo].[Purposes] ([PurposeId], [PurposeKey], [PurposeName], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (4, N'EXAM', N'Exam', 1, 4, CAST(N'2026-06-27T09:11:41.940' AS DateTime), NULL)
INSERT [dbo].[Purposes] ([PurposeId], [PurposeKey], [PurposeName], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (5, N'REVISION', N'Revision', 1, 5, CAST(N'2026-06-27T09:11:41.940' AS DateTime), NULL)
INSERT [dbo].[Purposes] ([PurposeId], [PurposeKey], [PurposeName], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (6, N'ADMIN_DOCUMENT', N'Admin Document', 1, 6, CAST(N'2026-06-27T09:11:41.940' AS DateTime), NULL)
INSERT [dbo].[Purposes] ([PurposeId], [PurposeKey], [PurposeName], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (7, N'STUDENT_ID', N'Student ID', 1, 7, CAST(N'2026-06-27T09:11:41.940' AS DateTime), NULL)
INSERT [dbo].[Purposes] ([PurposeId], [PurposeKey], [PurposeName], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (8, N'DISPLAY', N'Display', 1, 8, CAST(N'2026-06-27T09:11:41.940' AS DateTime), NULL)
INSERT [dbo].[Purposes] ([PurposeId], [PurposeKey], [PurposeName], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (9, N'OTHER', N'Other', 1, 9, CAST(N'2026-06-27T09:11:41.940' AS DateTime), NULL)
GO

INSERT [dbo].[RolePermissions] ([RolePermissionId], [RoleId], [PermissionId], [IsAllowed], [CreatedAt]) VALUES (2, 4, 2, 1, CAST(N'2026-06-30T22:52:51.193' AS DateTime))
GO

INSERT [dbo].[Roles] ([RoleId], [RoleKey], [RoleName], [DisplayName], [AccessLevelId], [Description], [IsSystemRole], [IsProtected], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1, N'Teacher', N'Teacher', N'Teacher', 1, N'Teacher login role', 1, 0, 1, CAST(N'2026-06-27T09:11:41.950' AS DateTime), NULL)
INSERT [dbo].[Roles] ([RoleId], [RoleKey], [RoleName], [DisplayName], [AccessLevelId], [Description], [IsSystemRole], [IsProtected], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (2, N'Admin', N'Admin', N'Admin', 2, N'Admin and academic leadership login role', 1, 0, 1, CAST(N'2026-06-27T09:11:41.950' AS DateTime), NULL)
INSERT [dbo].[Roles] ([RoleId], [RoleKey], [RoleName], [DisplayName], [AccessLevelId], [Description], [IsSystemRole], [IsProtected], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (3, N'PlatformAdmin', N'Platform Admin', N'Platform Admin', 3, N'IT/platform admin role', 1, 0, 1, CAST(N'2026-06-27T09:11:41.950' AS DateTime), NULL)
INSERT [dbo].[Roles] ([RoleId], [RoleKey], [RoleName], [DisplayName], [AccessLevelId], [Description], [IsSystemRole], [IsProtected], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (4, N'SuperAdmin', N'Super Admin', N'Super Admin', 4, N'Protected system owner role', 1, 1, 1, CAST(N'2026-06-27T09:11:41.950' AS DateTime), NULL)
GO

INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (63, 1544, N'24', N'24', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.270' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (64, 1544, N'23', N'23', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.287' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (65, 1544, N'21', N'21', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.293' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (66, 1544, N'20', N'20', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.300' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (67, 1544, N'19', N'19', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.307' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (68, 1544, N'18', N'18', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.313' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (69, 1544, N'17', N'17', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.320' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (70, 1544, N'16', N'16', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.330' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (71, 1544, N'15', N'15', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.333' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (72, 1544, N'10', N'10', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.340' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (73, 1544, N'9', N'9', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.347' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (74, 1544, N'8', N'8', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.353' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (75, 1544, N'7', N'7', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.360' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (76, 1544, N'6', N'6', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.367' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (77, 1544, N'5', N'5', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.373' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (78, 1544, N'4', N'4', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.380' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (79, 1544, N'3', N'3', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.390' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (80, 1544, N'2', N'2', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.397' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (81, 1544, N'1', N'1', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.403' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (82, 1545, N'125', N'125', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.410' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (83, 1545, N'124', N'124', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.417' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (84, 1545, N'123', N'123', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.423' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (85, 1545, N'122', N'122', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.430' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (86, 1545, N'121', N'121', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.440' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (87, 1545, N'120', N'120', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.443' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (88, 1545, N'119', N'119', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.453' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (89, 1545, N'118', N'118', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.460' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (90, 1545, N'112', N'112', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.470' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (91, 1545, N'111', N'111', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.480' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (92, 1545, N'110', N'110', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.487' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (93, 1545, N'108', N'108', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.497' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (94, 1545, N'107', N'107', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.500' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (95, 1545, N'106', N'106', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.510' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (96, 1545, N'105', N'105', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.520' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (97, 1545, N'104', N'104', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.530' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (98, 1545, N'103', N'103', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.537' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (99, 1545, N'102', N'102', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.543' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (100, 1547, N'22', N'22', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.553' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (101, 1547, N'14', N'14', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.587' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (102, 1547, N'13', N'13', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.590' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (103, 1547, N'ART', N'ART', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.600' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (104, 1547, N'CHEM', N'CHEM', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.607' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (105, 1547, N'COMPLAB', N'COMP LAB', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.633' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (106, 1548, N'113', N'113', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.687' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (107, 1548, N'114', N'114', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.693' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (108, 1548, N'115', N'115', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.700' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (109, 1548, N'116', N'116', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.707' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (110, 1548, N'117', N'117', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.713' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (111, 1549, N'12', N'12', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.777' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (112, 1550, N'109', N'109', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.823' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (113, 1550, N'128', N'128', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.840' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (114, 1550, N'126', N'126', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.850' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (115, 1550, N'132', N'132', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.853' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (116, 1550, N'133', N'133', NULL, NULL, 1, CAST(N'2026-07-08T18:10:12.867' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (117, 1602, N'11', N'11', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.457' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (118, 1604, N'136', N'136', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.560' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (119, 1608, N'DEPUTYPRINCIPAL', N'DEPUTY-PRINCIPAL', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.600' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (120, 1609, N'ALEVEL', N'A-LEVEL', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.630' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (121, 1604, N'101', N'101', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.730' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (122, 1604, N'131', N'131', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.757' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (123, 1604, N'130', N'130', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.853' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (124, 1604, N'127', N'127', NULL, NULL, 1, CAST(N'2026-07-08T18:10:13.860' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (125, 1657, N'RM2', N'RM2', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.857' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (126, 1657, N'RM3', N'RM3', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.863' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (127, 1657, N'RM4', N'RM4', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.870' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (128, 1657, N'RM5', N'RM5', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.877' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (129, 1657, N'RM8', N'RM8', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.883' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (130, 1657, N'RM11', N'RM11', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.890' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (131, 1657, N'RM13', N'RM13', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.897' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (132, 1657, N'RM15', N'RM15', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.903' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (133, 1657, N'RM16', N'RM16', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.910' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (134, 1657, N'RM17', N'RM17', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.917' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (135, 1657, N'RM18', N'RM18', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.923' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (136, 1657, N'RM19', N'RM19', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.930' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (137, 1657, N'RM20', N'RM20', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.933' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (138, 1657, N'RM21', N'RM21', NULL, NULL, 1, CAST(N'2026-07-08T18:10:15.940' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (139, 1603, N'6G', N'6G', NULL, NULL, 1, CAST(N'2026-07-08T18:10:16.367' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (140, 1604, N'LIBRARY', N'LIBRARY', NULL, NULL, 1, CAST(N'2026-07-08T18:10:16.713' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (141, 1609, N'CR2', N'CR2', NULL, NULL, 1, CAST(N'2026-07-08T18:10:17.030' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (142, 1609, N'CR1', N'CR1', NULL, NULL, 1, CAST(N'2026-07-08T18:10:17.060' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (143, 1617, N'STAFFROOM', N'STAFF ROOM', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.193' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (144, 1617, N'CLINIC', N'CLINIC', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.270' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (145, 1617, N'RM6', N'RM 6', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.337' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (146, 1621, N'RM7', N'RM 7', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.350' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (147, 1617, N'RM1', N'RM 1', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.360' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (148, 1617, N'RM14', N'RM 14', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.433' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (149, 1617, N'RM9', N'RM 9', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.470' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (150, 1615, N'RM103', N'RM 103', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.493' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (151, 1615, N'RM102', N'RM 102', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.507' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (152, 1615, N'RM106', N'RM 106', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.517' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (153, 1615, N'RM105', N'RM 105', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.527' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (154, 1622, N'RM126', N'RM 126', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.537' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (155, 1695, N'RM115', N'RM 115', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.557' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (156, 1597, N'RM22', N'RM 22', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.567' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (157, 1695, N'RM108', N'RM 108', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.587' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (158, 1695, N'RM109', N'RM 109', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.597' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (159, 1697, N'RM10', N'RM 10', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.720' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (160, 1622, N'RM135', N'RM 135', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.813' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (161, 1621, N'RM120', N'RM 120', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.830' AS DateTime), NULL)
GO
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (162, 1624, N'RM111', N'RM 111', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.843' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (163, 1621, N'RM122', N'RM 122', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.870' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (164, 1621, N'RM123', N'RM 123', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.880' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (165, 1624, N'RM124', N'RM 124', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.890' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (166, 1621, N'RM121', N'RM 121', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.900' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (167, 1695, N'RM114', N'RM 114', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.927' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (168, 1617, N'RM12', N'RM 12', NULL, NULL, 1, CAST(N'2026-07-09T22:28:51.937' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (169, 1615, N'RM104', N'RM 104', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.083' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (170, 1622, N'RM101', N'RM 101', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.193' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (171, 1615, N'RM118', N'RM 118', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.203' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (172, 1622, N'RM137', N'RM 137', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.230' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (173, 1622, N'RM128', N'RM 128', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.240' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (174, 1615, N'RM113', N'RM 113', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.273' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (175, 1622, N'RM136', N'RM 136', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.290' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (176, 1622, N'RM127', N'RM 127', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.320' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (177, 1622, N'RM112', N'RM 112', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.340' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (178, 1615, N'RM107', N'RM 107', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.360' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (179, 1615, N'RM117', N'RM 117', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.387' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (180, 1615, N'RM119', N'RM 119', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.487' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (181, 1615, N'RM116', N'RM 116', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.563' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (182, 1615, N'RM110', N'RM 110', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.580' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (183, 1622, N'RM125', N'RM 125', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.627' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (184, 1622, N'RM134', N'RM 134', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.717' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (185, 1597, N'RM24', N'RM 24', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.733' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (186, 1621, N'RM25', N'RM 25', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.740' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (187, 1622, N'RM133', N'RM 133', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.753' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (188, 1622, N'RM132', N'RM 132', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.763' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (189, 1597, N'RM23', N'RM 23', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.780' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (190, 1622, N'RM129', N'RM 129', NULL, NULL, 1, CAST(N'2026-07-09T22:28:52.927' AS DateTime), NULL)
INSERT [dbo].[Rooms] ([RoomId], [LocationId], [RoomKey], [RoomName], [RoomType], [Capacity], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (191, 1622, N'RM130', N'RM 130', NULL, NULL, 1, CAST(N'2026-07-09T22:28:53.193' AS DateTime), NULL)
GO

INSERT [dbo].[ScheduledJobs] ([ScheduledJobId], [JobKey], [JobName], [JobDescription], [CronExpression], [RunEveryMinutes], [VisibilityStatusId], [IsEnabled], [LastRunAt], [NextRunAt], [CreatedAt], [UpdatedAt]) VALUES (1, N'email_queue_processor', N'Email Queue Processor', N'Processes pending email queue', NULL, 5, 2, 0, NULL, NULL, CAST(N'2026-06-27T09:11:42.330' AS DateTime), NULL)
INSERT [dbo].[ScheduledJobs] ([ScheduledJobId], [JobKey], [JobName], [JobDescription], [CronExpression], [RunEveryMinutes], [VisibilityStatusId], [IsEnabled], [LastRunAt], [NextRunAt], [CreatedAt], [UpdatedAt]) VALUES (2, N'backup_job', N'Database Backup Job', N'Runs scheduled database backup', NULL, 1440, 2, 0, NULL, NULL, CAST(N'2026-06-27T09:11:42.330' AS DateTime), NULL)
INSERT [dbo].[ScheduledJobs] ([ScheduledJobId], [JobKey], [JobName], [JobDescription], [CronExpression], [RunEveryMinutes], [VisibilityStatusId], [IsEnabled], [LastRunAt], [NextRunAt], [CreatedAt], [UpdatedAt]) VALUES (3, N'asset_maintenance_reminder', N'Asset Maintenance Reminder', N'Checks upcoming asset maintenance schedules', NULL, 1440, 2, 0, NULL, NULL, CAST(N'2026-06-27T09:11:42.330' AS DateTime), NULL)
INSERT [dbo].[ScheduledJobs] ([ScheduledJobId], [JobKey], [JobName], [JobDescription], [CronExpression], [RunEveryMinutes], [VisibilityStatusId], [IsEnabled], [LastRunAt], [NextRunAt], [CreatedAt], [UpdatedAt]) VALUES (4, N'archive_policy_runner', N'Archive Policy Runner', N'Runs archive policies', NULL, 1440, 2, 0, NULL, NULL, CAST(N'2026-06-27T09:11:42.330' AS DateTime), NULL)
GO

INSERT [dbo].[Schools] ([SchoolId], [SchoolCode], [SchoolName], [LogoFileId], [Address], [Phone], [Email], [Website], [TimeZone], [CurrencyCode], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1, N'AUS_DUBAI', N'Arab Unity School', NULL, NULL, NULL, N'info@arabunityschool.ae', NULL, N'Asia/Dubai', N'AED', 1, CAST(N'2026-06-27T09:11:42.273' AS DateTime), CAST(N'2026-06-30T16:47:52.143' AS DateTime))
GO

INSERT [dbo].[SchoolSettings] ([SchoolSettingId], [SchoolId], [SettingKey], [SettingValue], [SettingGroup], [IsEditable], [UpdatedAt]) VALUES (1, 1, N'printing.approval.threshold_sheets', N'500', N'Printing', 1, CAST(N'2026-06-27T09:11:42.290' AS DateTime))
INSERT [dbo].[SchoolSettings] ([SchoolSettingId], [SchoolId], [SettingKey], [SettingValue], [SettingGroup], [IsEditable], [UpdatedAt]) VALUES (2, 1, N'registration.self_activation_enabled', N'true', N'Registration', 1, CAST(N'2026-06-27T09:11:42.290' AS DateTime))
INSERT [dbo].[SchoolSettings] ([SchoolSettingId], [SchoolId], [SettingKey], [SettingValue], [SettingGroup], [IsEditable], [UpdatedAt]) VALUES (3, 1, N'student_id.homeroom_verification_required', N'true', N'Student ID', 1, CAST(N'2026-06-27T09:11:42.290' AS DateTime))
INSERT [dbo].[SchoolSettings] ([SchoolSettingId], [SchoolId], [SettingKey], [SettingValue], [SettingGroup], [IsEditable], [UpdatedAt]) VALUES (4, 1, N'timezone', N'Asia/Dubai', N'General', 1, CAST(N'2026-06-27T09:11:42.290' AS DateTime))
INSERT [dbo].[SchoolSettings] ([SchoolSettingId], [SchoolId], [SettingKey], [SettingValue], [SettingGroup], [IsEditable], [UpdatedAt]) VALUES (5, 1, N'currency', N'AED', N'General', 1, CAST(N'2026-06-27T09:11:42.290' AS DateTime))
INSERT [dbo].[SchoolSettings] ([SchoolSettingId], [SchoolId], [SettingKey], [SettingValue], [SettingGroup], [IsEditable], [UpdatedAt]) VALUES (6, 1, N'printing.require_hod_approval', N'true', N'Printing', 1, GETDATE())
INSERT [dbo].[SchoolSettings] ([SchoolSettingId], [SchoolId], [SettingKey], [SettingValue], [SettingGroup], [IsEditable], [UpdatedAt]) VALUES (7, 1, N'printing.hod_self_approval', N'false', N'Printing', 1, GETDATE())
INSERT [dbo].[SchoolSettings] ([SchoolSettingId], [SchoolId], [SettingKey], [SettingValue], [SettingGroup], [IsEditable], [UpdatedAt]) VALUES (8, 1, N'printing.queue.assignment_mode', N'shared', N'Printing', 1, GETDATE())
INSERT [dbo].[SchoolSettings] ([SchoolSettingId], [SchoolId], [SettingKey], [SettingValue], [SettingGroup], [IsEditable], [UpdatedAt]) VALUES (9, 1, N'printing.request.allow_return', N'true', N'Printing', 1, GETDATE())
INSERT [dbo].[SchoolSettings] ([SchoolSettingId], [SchoolId], [SettingKey], [SettingValue], [SettingGroup], [IsEditable], [UpdatedAt]) VALUES (10, 1, N'printing.request.allow_cancel_before_printing', N'true', N'Printing', 1, GETDATE())
INSERT [dbo].[SchoolSettings] ([SchoolSettingId], [SchoolId], [SettingKey], [SettingValue], [SettingGroup], [IsEditable], [UpdatedAt]) VALUES (11, 1, N'printing.inventory.bundle_sheets', N'500', N'Printing', 1, GETDATE())
INSERT [dbo].[SchoolSettings] ([SchoolSettingId], [SchoolId], [SettingKey], [SettingValue], [SettingGroup], [IsEditable], [UpdatedAt]) VALUES (12, 1, N'printing.inventory.bundles_per_box', N'5', N'Printing', 1, GETDATE())
INSERT [dbo].[SchoolSettings] ([SchoolSettingId], [SchoolId], [SettingKey], [SettingValue], [SettingGroup], [IsEditable], [UpdatedAt]) VALUES (13, 1, N'printing.inventory.low_stock_a4', N'3000', N'Printing', 1, GETDATE())
INSERT [dbo].[SchoolSettings] ([SchoolSettingId], [SchoolId], [SettingKey], [SettingValue], [SettingGroup], [IsEditable], [UpdatedAt]) VALUES (14, 1, N'printing.inventory.low_stock_a3', N'1500', N'Printing', 1, GETDATE())
INSERT [dbo].[SchoolSettings] ([SchoolSettingId], [SchoolId], [SettingKey], [SettingValue], [SettingGroup], [IsEditable], [UpdatedAt]) VALUES (15, 1, N'printing.upload.max_mb', N'20', N'Printing', 1, GETDATE())
INSERT [dbo].[SchoolSettings] ([SchoolSettingId], [SchoolId], [SettingKey], [SettingValue], [SettingGroup], [IsEditable], [UpdatedAt]) VALUES (16, 1, N'printing.upload.allowed_extensions', N'pdf,docx,pptx,jpg,jpeg,png', N'Printing', 1, GETDATE())
GO

INSERT [dbo].[Sections] ([SectionId], [SectionKey], [SectionName], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (1, N'FS', N'FS', 1, 1, CAST(N'2026-06-27T09:11:41.903' AS DateTime), NULL)
INSERT [dbo].[Sections] ([SectionId], [SectionKey], [SectionName], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (2, N'PRIMARY', N'Primary', 1, 2, CAST(N'2026-06-27T09:11:41.903' AS DateTime), NULL)
INSERT [dbo].[Sections] ([SectionId], [SectionKey], [SectionName], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (3, N'SECONDARY', N'Secondary', 1, 3, CAST(N'2026-06-27T09:11:41.903' AS DateTime), NULL)
INSERT [dbo].[Sections] ([SectionId], [SectionKey], [SectionName], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (4, N'SIXTH_FORM', N'Sixth Form', 1, 4, CAST(N'2026-06-27T09:11:41.903' AS DateTime), NULL)
INSERT [dbo].[Sections] ([SectionId], [SectionKey], [SectionName], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (5, N'INCLUSION', N'Inclusion', 1, 5, CAST(N'2026-06-27T09:11:41.903' AS DateTime), NULL)
GO

GO

GO

INSERT [dbo].[Subjects] ([SubjectId], [SubjectKey], [SubjectName], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (1, N'ENGLISH', N'English', 1, 1, CAST(N'2026-06-27T09:11:41.937' AS DateTime), NULL)
INSERT [dbo].[Subjects] ([SubjectId], [SubjectKey], [SubjectName], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (2, N'MATH', N'Math', 1, 2, CAST(N'2026-06-27T09:11:41.937' AS DateTime), NULL)
INSERT [dbo].[Subjects] ([SubjectId], [SubjectKey], [SubjectName], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (3, N'SCIENCE', N'Science', 1, 3, CAST(N'2026-06-27T09:11:41.937' AS DateTime), NULL)
INSERT [dbo].[Subjects] ([SubjectId], [SubjectKey], [SubjectName], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (4, N'ARABIC', N'Arabic', 1, 4, CAST(N'2026-06-27T09:11:41.937' AS DateTime), NULL)
INSERT [dbo].[Subjects] ([SubjectId], [SubjectKey], [SubjectName], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (5, N'ISLAMIC', N'Islamic', 1, 5, CAST(N'2026-06-27T09:11:41.937' AS DateTime), NULL)
INSERT [dbo].[Subjects] ([SubjectId], [SubjectKey], [SubjectName], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (6, N'HUMANITIES', N'Humanities', 1, 6, CAST(N'2026-06-27T09:11:41.937' AS DateTime), NULL)
INSERT [dbo].[Subjects] ([SubjectId], [SubjectKey], [SubjectName], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (7, N'ICT', N'ICT', 1, 7, CAST(N'2026-06-27T09:11:41.937' AS DateTime), NULL)
INSERT [dbo].[Subjects] ([SubjectId], [SubjectKey], [SubjectName], [IsActive], [SortOrder], [CreatedAt], [UpdatedAt]) VALUES (8, N'GENERAL', N'General', 1, 8, CAST(N'2026-06-27T09:11:41.937' AS DateTime), NULL)
GO

INSERT [dbo].[SystemSettings] ([SettingId], [SettingKey], [SettingValue], [SettingGroup], [Description], [IsEditable], [UpdatedAt]) VALUES (1, N'platform.name', N'Operations Platform', N'Branding', N'Main platform name', 1, CAST(N'2026-06-27T09:11:42.047' AS DateTime))
INSERT [dbo].[SystemSettings] ([SettingId], [SettingKey], [SettingValue], [SettingGroup], [Description], [IsEditable], [UpdatedAt]) VALUES (2, N'platform.school', N'Arab Unity School', N'Branding', N'School name', 1, CAST(N'2026-06-27T09:11:42.047' AS DateTime))
INSERT [dbo].[SystemSettings] ([SettingId], [SettingKey], [SettingValue], [SettingGroup], [Description], [IsEditable], [UpdatedAt]) VALUES (3, N'printing.approval.threshold_sheets', N'500', N'Printing', N'Sheets above this require HOS approval', 1, CAST(N'2026-06-27T09:11:42.047' AS DateTime))
INSERT [dbo].[SystemSettings] ([SettingId], [SettingKey], [SettingValue], [SettingGroup], [Description], [IsEditable], [UpdatedAt]) VALUES (4, N'registration.teacher.self_activation_enabled', N'true', N'Registration', N'Allow imported staff registration', 1, CAST(N'2026-06-27T09:11:42.047' AS DateTime))
INSERT [dbo].[SystemSettings] ([SettingId], [SettingKey], [SettingValue], [SettingGroup], [Description], [IsEditable], [UpdatedAt]) VALUES (5, N'student_id.homeroom_verification_required', N'true', N'Student ID', N'Require homeroom verification before printing IDs', 1, CAST(N'2026-06-27T09:11:42.047' AS DateTime))
INSERT [dbo].[SystemSettings] ([SettingId], [SettingKey], [SettingValue], [SettingGroup], [Description], [IsEditable], [UpdatedAt]) VALUES (6, N'feature.printer_meter_readings.visibility', N'Hidden', N'IT Assets', N'Printer meter reading feature visibility', 1, CAST(N'2026-06-27T09:11:42.047' AS DateTime))
INSERT [dbo].[SystemSettings] ([SettingId], [SettingKey], [SettingValue], [SettingGroup], [Description], [IsEditable], [UpdatedAt]) VALUES (7, N'feature.toner_tracking.visibility', N'Disabled', N'Inventory', N'Toner tracking feature visibility', 1, CAST(N'2026-06-27T09:11:42.047' AS DateTime))
INSERT [dbo].[SystemSettings] ([SettingId], [SettingKey], [SettingValue], [SettingGroup], [Description], [IsEditable], [UpdatedAt]) VALUES (8, N'sidebar.dynamic_enabled', N'true', N'Navigation', N'Use database-driven sidebar menu', 1, CAST(N'2026-06-27T09:11:42.047' AS DateTime))
GO

INSERT [dbo].[Themes] ([ThemeId], [SchoolId], [ThemeKey], [ThemeName], [PrimaryColor], [SecondaryColor], [AccentColor], [SidebarStyle], [LogoFileId], [LoginBackgroundFileId], [IsDefault], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1, 1, N'aus_default', N'AUS Default Theme', N'#0F766E', N'#0F172A', N'#22C55E', N'fixed-sidebar', NULL, NULL, 1, 1, CAST(N'2026-06-27T09:11:42.320' AS DateTime), NULL)
GO

GO

INSERT [dbo].[Workspaces] ([WorkspaceId], [WorkspaceKey], [WorkspaceName], [Description], [Icon], [DefaultRoute], [VisibilityStatusId], [IsDefault], [SortOrder], [CreatedAt], [UpdatedAt], [IsActive]) VALUES (1, N'default', N'Default Workspace', N'General user workspace', N'dashboard', N'/dashboard', 1, 1, 1, CAST(N'2026-06-27T09:11:41.977' AS DateTime), NULL, 1)
INSERT [dbo].[Workspaces] ([WorkspaceId], [WorkspaceKey], [WorkspaceName], [Description], [Icon], [DefaultRoute], [VisibilityStatusId], [IsDefault], [SortOrder], [CreatedAt], [UpdatedAt], [IsActive]) VALUES (2, N'it', N'IT Workspace', N'IT assets, tickets and inventory', N'devices', N'/it-assets/dashboard', 1, 0, 2, CAST(N'2026-06-27T09:11:41.977' AS DateTime), NULL, 1)
INSERT [dbo].[Workspaces] ([WorkspaceId], [WorkspaceKey], [WorkspaceName], [Description], [Icon], [DefaultRoute], [VisibilityStatusId], [IsDefault], [SortOrder], [CreatedAt], [UpdatedAt], [IsActive]) VALUES (3, N'printing', N'Printing Workspace', N'Printing queue, requests and paper inventory', N'print', N'/printing/dashboard', 1, 0, 3, CAST(N'2026-06-27T09:11:41.977' AS DateTime), NULL, 1)
INSERT [dbo].[Workspaces] ([WorkspaceId], [WorkspaceKey], [WorkspaceName], [Description], [Icon], [DefaultRoute], [VisibilityStatusId], [IsDefault], [SortOrder], [CreatedAt], [UpdatedAt], [IsActive]) VALUES (4, N'academic', N'Academic Workspace', N'Academic operations and student IDs', N'school', N'/academic/dashboard', 1, 0, 4, CAST(N'2026-06-27T09:11:41.977' AS DateTime), NULL, 1)
GO

INSERT [dbo].[YearLevels] ([YearLevelId], [SectionId], [YearLevelKey], [YearLevelName], [SortOrder], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (1, 1, N'FS1', N'FS1', 1, 1, CAST(N'2026-06-27T09:11:41.933' AS DateTime), NULL)
INSERT [dbo].[YearLevels] ([YearLevelId], [SectionId], [YearLevelKey], [YearLevelName], [SortOrder], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (2, 1, N'FS2', N'FS2', 2, 1, CAST(N'2026-06-27T09:11:41.933' AS DateTime), NULL)
INSERT [dbo].[YearLevels] ([YearLevelId], [SectionId], [YearLevelKey], [YearLevelName], [SortOrder], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (3, 2, N'Y1', N'Year 1', 3, 1, CAST(N'2026-06-27T09:11:41.933' AS DateTime), NULL)
INSERT [dbo].[YearLevels] ([YearLevelId], [SectionId], [YearLevelKey], [YearLevelName], [SortOrder], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (4, 2, N'Y2', N'Year 2', 4, 1, CAST(N'2026-06-27T09:11:41.933' AS DateTime), NULL)
INSERT [dbo].[YearLevels] ([YearLevelId], [SectionId], [YearLevelKey], [YearLevelName], [SortOrder], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (5, 2, N'Y3', N'Year 3', 5, 1, CAST(N'2026-06-27T09:11:41.933' AS DateTime), NULL)
INSERT [dbo].[YearLevels] ([YearLevelId], [SectionId], [YearLevelKey], [YearLevelName], [SortOrder], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (6, 2, N'Y4', N'Year 4', 6, 1, CAST(N'2026-06-27T09:11:41.933' AS DateTime), NULL)
INSERT [dbo].[YearLevels] ([YearLevelId], [SectionId], [YearLevelKey], [YearLevelName], [SortOrder], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (7, 2, N'Y5', N'Year 5', 7, 1, CAST(N'2026-06-27T09:11:41.933' AS DateTime), NULL)
INSERT [dbo].[YearLevels] ([YearLevelId], [SectionId], [YearLevelKey], [YearLevelName], [SortOrder], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (8, 2, N'Y6', N'Year 6', 8, 1, CAST(N'2026-06-27T09:11:41.933' AS DateTime), NULL)
INSERT [dbo].[YearLevels] ([YearLevelId], [SectionId], [YearLevelKey], [YearLevelName], [SortOrder], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (9, 3, N'Y7', N'Year 7', 9, 1, CAST(N'2026-06-27T09:11:41.933' AS DateTime), NULL)
INSERT [dbo].[YearLevels] ([YearLevelId], [SectionId], [YearLevelKey], [YearLevelName], [SortOrder], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (10, 3, N'Y8', N'Year 8', 10, 1, CAST(N'2026-06-27T09:11:41.933' AS DateTime), NULL)
INSERT [dbo].[YearLevels] ([YearLevelId], [SectionId], [YearLevelKey], [YearLevelName], [SortOrder], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (11, 3, N'Y9', N'Year 9', 11, 1, CAST(N'2026-06-27T09:11:41.933' AS DateTime), NULL)
INSERT [dbo].[YearLevels] ([YearLevelId], [SectionId], [YearLevelKey], [YearLevelName], [SortOrder], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (12, 3, N'Y10', N'Year 10', 12, 1, CAST(N'2026-06-27T09:11:41.933' AS DateTime), NULL)
INSERT [dbo].[YearLevels] ([YearLevelId], [SectionId], [YearLevelKey], [YearLevelName], [SortOrder], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (13, 3, N'Y11', N'Year 11', 13, 1, CAST(N'2026-06-27T09:11:41.933' AS DateTime), NULL)
INSERT [dbo].[YearLevels] ([YearLevelId], [SectionId], [YearLevelKey], [YearLevelName], [SortOrder], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (14, 4, N'Y12', N'Year 12', 14, 1, CAST(N'2026-06-27T09:11:41.933' AS DateTime), NULL)
INSERT [dbo].[YearLevels] ([YearLevelId], [SectionId], [YearLevelKey], [YearLevelName], [SortOrder], [IsActive], [CreatedAt], [UpdatedAt]) VALUES (15, 4, N'Y13', N'Year 13', 15, 1, CAST(N'2026-06-27T09:11:41.933' AS DateTime), NULL)
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Academic__CECEB85E9BEB6F27]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[AcademicYears] ADD UNIQUE NONCLUSTERED 
(
	[AcademicYearName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__AccessLe__0003F6C2E88EB543]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[AccessLevels] ADD UNIQUE NONCLUSTERED 
(
	[AccessLevelName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__AccessLe__5BDC3CB28EF1F69F]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[AccessLevels] ADD UNIQUE NONCLUSTERED 
(
	[AccessLevelKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_ActivityTimeline_Entity]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_ActivityTimeline_Entity] ON [dbo].[ActivityTimeline]
(
	[EntityType] ASC,
	[EntityId] ASC,
	[CreatedAt] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__AIPrompt__61C677E846159B4E]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[AIPrompts] ADD UNIQUE NONCLUSTERED 
(
	[PromptKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Announce__EDD99DA76DC5A004]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[AnnouncementBanners] ADD UNIQUE NONCLUSTERED 
(
	[BannerKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__ApiKeys__84301A253CC39028]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[ApiKeys] ADD UNIQUE NONCLUSTERED 
(
	[ApiKeyHash] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__ArchiveP__7DF846F40087FBA4]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[ArchivePolicies] ADD UNIQUE NONCLUSTERED 
(
	[PolicyKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_ArchiveRecords_Entity]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_ArchiveRecords_Entity] ON [dbo].[ArchiveRecords]
(
	[EntityType] ASC,
	[EntityId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Assignme__39CC8966E496F880]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[AssignmentTypes] ADD UNIQUE NONCLUSTERED 
(
	[AssignmentName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Assignme__AB658A33BB159065]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[AssignmentTypes] ADD UNIQUE NONCLUSTERED 
(
	[AssignmentKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_AuditLogs_User_CreatedAt]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_AuditLogs_User_CreatedAt] ON [dbo].[AuditLogs]
(
	[UserId] ASC,
	[CreatedAt] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_BackgroundJobLogs_Job_Status]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_BackgroundJobLogs_Job_Status] ON [dbo].[BackgroundJobLogs]
(
	[JobKey] ASC,
	[JobStatus] ASC,
	[StartedAt] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_BackupJobs_Status_StartedAt]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_BackupJobs_Status_StartedAt] ON [dbo].[BackupJobs]
(
	[BackupStatus] ASC,
	[StartedAt] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_Branding_School]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Branding] ADD  CONSTRAINT [UQ_Branding_School] UNIQUE NONCLUSTERED 
(
	[SchoolId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Branding_School]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_Branding_School] ON [dbo].[Branding]
(
	[SchoolId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_BrandingSlides_Branding]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_BrandingSlides_Branding] ON [dbo].[BrandingSlides]
(
	[BrandingId] ASC,
	[SortOrder] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Building__94E7067EB18C01E3]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Buildings] ADD UNIQUE NONCLUSTERED 
(
	[BuildingKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Buttons__8A94115A93E7AB6D]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Buttons] ADD UNIQUE NONCLUSTERED 
(
	[ButtonKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_CalendarEvents_StartAt]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_CalendarEvents_StartAt] ON [dbo].[CalendarEvents]
(
	[StartAt] ASC,
	[EndAt] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Calendar__F376BCE555AE12D7]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[CalendarEventTypes] ADD UNIQUE NONCLUSTERED 
(
	[EventTypeKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_Classes_AcademicYear_ClassKey]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Classes] ADD  CONSTRAINT [UQ_Classes_AcademicYear_ClassKey] UNIQUE NONCLUSTERED 
(
	[AcademicYearId] ASC,
	[ClassKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_DashboardKPIs]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[DashboardKPIs] ADD  CONSTRAINT [UQ_DashboardKPIs] UNIQUE NONCLUSTERED 
(
	[DashboardId] ASC,
	[KPIDefinitionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Dashboar__649ECE8F1A031B33]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Dashboards] ADD UNIQUE NONCLUSTERED 
(
	[DashboardKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_DashboardWidgets]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[DashboardWidgets] ADD  CONSTRAINT [UQ_DashboardWidgets] UNIQUE NONCLUSTERED 
(
	[DashboardId] ASC,
	[WidgetId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_DashboardWidgets_Dashboard]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_DashboardWidgets_Dashboard] ON [dbo].[DashboardWidgets]
(
	[DashboardId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_DepartmentPrintLimits]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[DepartmentPrintLimits] ADD  CONSTRAINT [UQ_DepartmentPrintLimits] UNIQUE NONCLUSTERED 
(
	[DepartmentId] ASC,
	[MonthNumber] ASC,
	[YearNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Departme__18D372EBD2B3F23C]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Departments] ADD UNIQUE NONCLUSTERED 
(
	[DepartmentKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Departme__D949CC34A8A67349]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Departments] ADD UNIQUE NONCLUSTERED 
(
	[DepartmentName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Departments_SchoolId]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_Departments_SchoolId] ON [dbo].[Departments]
(
	[SchoolId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_DocumentBranding_School_Key]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[DocumentBranding] ADD  CONSTRAINT [UQ_DocumentBranding_School_Key] UNIQUE NONCLUSTERED 
(
	[SchoolId] ASC,
	[BrandingKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_DocumentBranding_School]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_DocumentBranding_School] ON [dbo].[DocumentBranding]
(
	[SchoolId] ASC,
	[IsDefault] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Document__FBB94A3C8D4D4993]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[DocumentSequences] ADD UNIQUE NONCLUSTERED 
(
	[SequenceKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_DocumentSequences_Key]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_DocumentSequences_Key] ON [dbo].[DocumentSequences]
(
	[SequenceKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_EmailQueue_Status_QueuedAt]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_EmailQueue_Status_QueuedAt] ON [dbo].[EmailQueue]
(
	[Status] ASC,
	[QueuedAt] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__EmailTem__0E5F3CB7DCB4B12C]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[EmailTemplates] ADD UNIQUE NONCLUSTERED 
(
	[TemplateKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__EmailVer__BCB33F926B9E0D5A]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[EmailVerificationTokens] ADD UNIQUE NONCLUSTERED 
(
	[TokenHash] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_EntityComments_Entity]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_EntityComments_Entity] ON [dbo].[EntityComments]
(
	[EntityType] ASC,
	[EntityId] ASC,
	[CreatedAt] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_EntityFiles_Entity]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_EntityFiles_Entity] ON [dbo].[EntityFiles]
(
	[EntityType] ASC,
	[EntityId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_EntityTags]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[EntityTags] ADD  CONSTRAINT [UQ_EntityTags] UNIQUE NONCLUSTERED 
(
	[EntityType] ASC,
	[EntityId] ASC,
	[TagId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_EntityTags_Entity]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_EntityTags_Entity] ON [dbo].[EntityTags]
(
	[EntityType] ASC,
	[EntityId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__FeatureF__FCEFA3308F8FE5D2]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[FeatureFlags] ADD UNIQUE NONCLUSTERED 
(
	[FeatureKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__FeatureV__096C98C298A2106B]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[FeatureVisibilityStatuses] ADD UNIQUE NONCLUSTERED 
(
	[StatusKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__GlobalSe__9EC07B8F4FEE918B]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[GlobalSearchEntities] ADD UNIQUE NONCLUSTERED 
(
	[EntityKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_ImportErrorLogs_Type_Batch]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_ImportErrorLogs_Type_Batch] ON [dbo].[ImportErrorLogs]
(
	[ImportType] ASC,
	[BatchId] ASC,
	[IsResolved] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Integrat__2A3C5A4A6B65168C]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Integrations] ADD UNIQUE NONCLUSTERED 
(
	[IntegrationKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_IntegrationSettings]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[IntegrationSettings] ADD  CONSTRAINT [UQ_IntegrationSettings] UNIQUE NONCLUSTERED 
(
	[IntegrationId] ASC,
	[SettingKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Inventor__71DE00F092A0D0E5]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[InventoryItemTypes] ADD UNIQUE NONCLUSTERED 
(
	[ItemTypeKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_InventoryTransactions_PaperType_CreatedAt]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_InventoryTransactions_PaperType_CreatedAt] ON [dbo].[InventoryTransactions]
(
	[PaperType] ASC,
	[CreatedAt] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_ITAssetAssignments_Asset]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_ITAssetAssignments_Asset] ON [dbo].[ITAssetAssignments]
(
	[AssetId] ASC,
	[AssignedAt] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__ITAssetB__2206CE9B59B5E7EE]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[ITAssetBrands] ADD UNIQUE NONCLUSTERED 
(
	[BrandName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__ITAssetC__76B0FE40432E6E6C]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[ITAssetCategories] ADD UNIQUE NONCLUSTERED 
(
	[CategoryKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__ITAssetC__EA36D49BF515DF57]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[ITAssetConditions] ADD UNIQUE NONCLUSTERED 
(
	[ConditionKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_ITAssetGroupItems]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[ITAssetGroupItems] ADD  CONSTRAINT [UQ_ITAssetGroupItems] UNIQUE NONCLUSTERED 
(
	[AssetGroupId] ASC,
	[AssetId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_ITAssetGroupItems_Asset]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_ITAssetGroupItems_Asset] ON [dbo].[ITAssetGroupItems]
(
	[AssetId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__ITAssetG__E83E3716A9D7F664]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[ITAssetGroups] ADD UNIQUE NONCLUSTERED 
(
	[AssetGroupKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_ITAssetGroups_Room]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_ITAssetGroups_Room] ON [dbo].[ITAssetGroups]
(
	[RoomId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__ITAssetI__09729E3D3C7FF174]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[ITAssetIssueCategories] ADD UNIQUE NONCLUSTERED 
(
	[IssueCategoryKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_ITAssetIssueLogs_Asset_Status]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_ITAssetIssueLogs_Asset_Status] ON [dbo].[ITAssetIssueLogs]
(
	[AssetId] ASC,
	[IssueStatus] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__ITAssetI__B8D429B30D4CA17A]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[ITAssetIssueTypes] ADD UNIQUE NONCLUSTERED 
(
	[IssueTypeKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__ITAssetN__567CFA790E5C32B0]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[ITAssetNoteTypes] ADD UNIQUE NONCLUSTERED 
(
	[NoteTypeKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__ITAssets__89F276AB505747C2]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[ITAssets] ADD UNIQUE NONCLUSTERED 
(
	[AssetTag] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_ITAssets_AssetTag]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_ITAssets_AssetTag] ON [dbo].[ITAssets]
(
	[AssetTag] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_ITAssets_Category_Status]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_ITAssets_Category_Status] ON [dbo].[ITAssets]
(
	[ITAssetCategoryId] ASC,
	[ITAssetStatusId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_ITAssets_CurrentAssignedUser]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_ITAssets_CurrentAssignedUser] ON [dbo].[ITAssets]
(
	[CurrentAssignedUserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_ITAssets_CurrentRoom]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_ITAssets_CurrentRoom] ON [dbo].[ITAssets]
(
	[CurrentRoomId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_ITAssets_SchoolId]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_ITAssets_SchoolId] ON [dbo].[ITAssets]
(
	[SchoolId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__ITAssetS__096C98C247BA8A81]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[ITAssetStatuses] ADD UNIQUE NONCLUSTERED 
(
	[StatusKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__ITAssetT__A18766C96914E9C9]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[ITAssetTransferRequests] ADD UNIQUE NONCLUSTERED 
(
	[TransferRequestNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_ITAssetTransferRequests_Asset_Status]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_ITAssetTransferRequests_Asset_Status] ON [dbo].[ITAssetTransferRequests]
(
	[AssetId] ASC,
	[TransferStatus] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__ITTicket__CBED06DA1502F5DB]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[ITTickets] ADD UNIQUE NONCLUSTERED 
(
	[TicketNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__KPIDefin__DE5720B174473E0A]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[KPIDefinitions] ADD UNIQUE NONCLUSTERED 
(
	[KPIKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Language__8B8C8A341085C1CF]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Languages] ADD UNIQUE NONCLUSTERED 
(
	[LanguageCode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Location__C88254DE4D2FEDA8]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Locations] ADD UNIQUE NONCLUSTERED 
(
	[LocationKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_LoginHistory_User_CreatedAt]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_LoginHistory_User_CreatedAt] ON [dbo].[LoginHistory]
(
	[UserId] ASC,
	[CreatedAt] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__LookupCa__76B0FE40909739E9]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[LookupCategories] ADD UNIQUE NONCLUSTERED 
(
	[CategoryKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_LookupValues_Category_Key]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[LookupValues] ADD  CONSTRAINT [UQ_LookupValues_Category_Key] UNIQUE NONCLUSTERED 
(
	[LookupCategoryId] ASC,
	[ValueKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_LookupValues_Category]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_LookupValues_Category] ON [dbo].[LookupValues]
(
	[LookupCategoryId] ASC,
	[SortOrder] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_MenuGroupItems]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[MenuGroupItems] ADD  CONSTRAINT [UQ_MenuGroupItems] UNIQUE NONCLUSTERED 
(
	[MenuGroupId] ASC,
	[MenuId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__MenuGrou__36BB80D2645657CF]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[MenuGroups] ADD UNIQUE NONCLUSTERED 
(
	[GroupKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Menus__94C532E1CE1C25B9]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Menus] ADD UNIQUE NONCLUSTERED 
(
	[MenuKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Menus_Module]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_Menus_Module] ON [dbo].[Menus]
(
	[ModuleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Menus_Workspace_Sort]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_Menus_Workspace_Sort] ON [dbo].[Menus]
(
	[WorkspaceId] ASC,
	[SortOrder] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Modules__37DD7191512E5BC9]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Modules] ADD UNIQUE NONCLUSTERED 
(
	[ModuleKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Notifica__02B14D7661F897D6]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[NotificationChannels] ADD UNIQUE NONCLUSTERED 
(
	[ChannelKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Notifica__224AFDE8F14DBC6E]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[NotificationPreferenceTypes] ADD UNIQUE NONCLUSTERED 
(
	[PreferenceKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Notifications_User_IsRead]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_Notifications_User_IsRead] ON [dbo].[Notifications]
(
	[UserId] ASC,
	[IsRead] ASC,
	[CreatedAt] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__PaperInv__308F441C3F63D00A]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[PaperInventory] ADD UNIQUE NONCLUSTERED 
(
	[PaperType] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Password__BCB33F92F84518AD]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[PasswordResetTokens] ADD UNIQUE NONCLUSTERED 
(
	[TokenHash] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Permissions__36BB80D241145D70]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Permissions] ADD UNIQUE NONCLUSTERED 
(
	[PermissionKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Photocop__9ADA6BE083B96D7E]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[PhotocopyRequests] ADD UNIQUE NONCLUSTERED 
(
	[RequestNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_PhotocopyRequests_CurrentApprover_Status]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_PhotocopyRequests_CurrentApprover_Status] ON [dbo].[PhotocopyRequests]
(
	[CurrentApproverId] ASC,
	[Status] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_PhotocopyRequests_Department_SubmittedAt]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_PhotocopyRequests_Department_SubmittedAt] ON [dbo].[PhotocopyRequests]
(
	[DepartmentId] ASC,
	[SubmittedAt] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_PhotocopyRequests_SchoolId]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_PhotocopyRequests_SchoolId] ON [dbo].[PhotocopyRequests]
(
	[SchoolId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_PhotocopyRequests_Status_SubmittedAt]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_PhotocopyRequests_Status_SubmittedAt] ON [dbo].[PhotocopyRequests]
(
	[Status] ASC,
	[SubmittedAt] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_PhotocopyRequests_Queue] ******/
CREATE NONCLUSTERED INDEX [IX_PhotocopyRequests_Queue] ON [dbo].[PhotocopyRequests]
(
	[Status] ASC,
	[ClaimedByUserId] ASC,
	[SubmittedAt] DESC
)
INCLUDE([RequestNumber],[DepartmentId],[SubjectId],[TotalSheets],[DueDate])
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_PhotocopyRequests_Teacher_SubmittedAt]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_PhotocopyRequests_Teacher_SubmittedAt] ON [dbo].[PhotocopyRequests]
(
	[TeacherId] ASC,
	[SubmittedAt] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_PrintingLogs_RequestId]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_PrintingLogs_RequestId] ON [dbo].[PrintingLogs]
(
	[RequestId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Purposes__C44E9BC3E78F1CDF]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Purposes] ADD UNIQUE NONCLUSTERED 
(
	[PurposeName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Purposes__E93F8B49C09BDFD9]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Purposes] ADD UNIQUE NONCLUSTERED 
(
	[PurposeKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__QuickAct__A475B0C4922300F3]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[QuickActions] ADD UNIQUE NONCLUSTERED 
(
	[ActionKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__ReportDe__0261CF2D03DAB09B]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[ReportDefinitions] ADD UNIQUE NONCLUSTERED 
(
	[ReportKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_ReportDefinitions_Module]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_ReportDefinitions_Module] ON [dbo].[ReportDefinitions]
(
	[ModuleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_RequestApprovals_Approver_ActionDate]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_RequestApprovals_Approver_ActionDate] ON [dbo].[RequestApprovals]
(
	[ApproverId] ASC,
	[ActionDate] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_RequestApprovals_RequestId]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_RequestApprovals_RequestId] ON [dbo].[RequestApprovals]
(
	[RequestId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_RolePermissions]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[RolePermissions] ADD  CONSTRAINT [UQ_RolePermissions] UNIQUE NONCLUSTERED 
(
	[RoleId] ASC,
	[PermissionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Roles__8A2B6160BACCE615]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Roles] ADD UNIQUE NONCLUSTERED 
(
	[RoleName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Roles__D0EBA515C987C7AD]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Roles] ADD UNIQUE NONCLUSTERED 
(
	[RoleKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Rooms__A238A34643798A3B]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Rooms] ADD UNIQUE NONCLUSTERED 
(
	[RoomKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Schedule__DC6CF1BF936332E6]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[ScheduledJobs] ADD UNIQUE NONCLUSTERED 
(
	[JobKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_ScheduledJobs_NextRun]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_ScheduledJobs_NextRun] ON [dbo].[ScheduledJobs]
(
	[IsEnabled] ASC,
	[NextRunAt] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Schools__38CCE1FAFBD31B1A]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Schools] ADD UNIQUE NONCLUSTERED 
(
	[SchoolCode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_SchoolSettings]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[SchoolSettings] ADD  CONSTRAINT [UQ_SchoolSettings] UNIQUE NONCLUSTERED 
(
	[SchoolId] ASC,
	[SettingKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Sections__39EA1CF7CC6173FF]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Sections] ADD UNIQUE NONCLUSTERED 
(
	[SectionKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Sections__8DACF8BEC1265787]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Sections] ADD UNIQUE NONCLUSTERED 
(
	[SectionName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_StaffImportStaging_Batch]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_StaffImportStaging_Batch] ON [dbo].[StaffImportStaging]
(
	[StaffImportBatchId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_StaffImportStaging_EmployeeId]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_StaffImportStaging_EmployeeId] ON [dbo].[StaffImportStaging]
(
	[EmployeeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_StaffImportStaging_SchoolEmail]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_StaffImportStaging_SchoolEmail] ON [dbo].[StaffImportStaging]
(
	[SchoolEmail] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ__StaffPro__1788CC4D91BD470B]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[StaffProfiles] ADD UNIQUE NONCLUSTERED 
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__StatusGr__989734F004B426E1]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[StatusGroups] ADD UNIQUE NONCLUSTERED 
(
	[StatusGroupKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_StatusValues_Group_Key]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[StatusValues] ADD  CONSTRAINT [UQ_StatusValues_Group_Key] UNIQUE NONCLUSTERED 
(
	[StatusGroupId] ASC,
	[StatusKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_StatusValues_Group]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_StatusValues_Group] ON [dbo].[StatusValues]
(
	[StatusGroupId] ASC,
	[SortOrder] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_StudentClassEnrollments]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[StudentClassEnrollments] ADD  CONSTRAINT [UQ_StudentClassEnrollments] UNIQUE NONCLUSTERED 
(
	[StudentId] ASC,
	[AcademicYearId] ASC,
	[ClassId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_StudentClassEnrollments_Class]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_StudentClassEnrollments_Class] ON [dbo].[StudentClassEnrollments]
(
	[ClassId] ASC,
	[AcademicYearId] ASC,
	[IsCurrent] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__StudentI__F869ED6DFCC85CE0]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[StudentIdBatches] ADD UNIQUE NONCLUSTERED 
(
	[BatchNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_StudentIdCards_Batch_Student]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[StudentIdCards] ADD  CONSTRAINT [UQ_StudentIdCards_Batch_Student] UNIQUE NONCLUSTERED 
(
	[StudentIdBatchId] ASC,
	[StudentId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_StudentIdCards_Batch_Status]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_StudentIdCards_Batch_Status] ON [dbo].[StudentIdCards]
(
	[StudentIdBatchId] ASC,
	[CardStatus] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__StudentI__0E5F3CB7052202FB]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[StudentIdTemplates] ADD UNIQUE NONCLUSTERED 
(
	[TemplateKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Students__1FC886048DAB75D2]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Students] ADD UNIQUE NONCLUSTERED 
(
	[StudentCode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Students__B468CC97E48667C2]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Students] ADD UNIQUE NONCLUSTERED 
(
	[AdmissionNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Students_CurrentClass]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_Students_CurrentClass] ON [dbo].[Students]
(
	[CurrentClassId] ASC,
	[IsActive] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Students_SchoolId]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_Students_SchoolId] ON [dbo].[Students]
(
	[SchoolId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_SubjectPrintLimits]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[SubjectPrintLimits] ADD  CONSTRAINT [UQ_SubjectPrintLimits] UNIQUE NONCLUSTERED 
(
	[DepartmentId] ASC,
	[SubjectId] ASC,
	[MonthNumber] ASC,
	[YearNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Subjects__220721FBD2142F61]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Subjects] ADD UNIQUE NONCLUSTERED 
(
	[SubjectKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Subjects__4C5A7D55EEEE7051]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Subjects] ADD UNIQUE NONCLUSTERED 
(
	[SubjectName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_SystemHealthLogs_Service_CheckedAt]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_SystemHealthLogs_Service_CheckedAt] ON [dbo].[SystemHealthLogs]
(
	[ServiceName] ASC,
	[CheckedAt] DESC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__SystemSe__01E719AD11E5DBCA]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[SystemSettings] ADD UNIQUE NONCLUSTERED 
(
	[SettingKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Tags__CA370A7BA19C4F4E]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Tags] ADD UNIQUE NONCLUSTERED 
(
	[TagKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Tasks__6601A97CED908743]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Tasks] ADD UNIQUE NONCLUSTERED 
(
	[TaskNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_Tasks_Status_DueAt]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_Tasks_Status_DueAt] ON [dbo].[Tasks]
(
	[Status] ASC,
	[DueAt] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_Terms_AcademicYear_TermKey]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Terms] ADD  CONSTRAINT [UQ_Terms_AcademicYear_TermKey] UNIQUE NONCLUSTERED 
(
	[AcademicYearId] ASC,
	[TermKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Themes__6CAE74C481706C39]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Themes] ADD UNIQUE NONCLUSTERED 
(
	[ThemeKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__TopbarSe__01E719AD29BB509F]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[TopbarSettings] ADD UNIQUE NONCLUSTERED 
(
	[SettingKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_Translations]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Translations] ADD  CONSTRAINT [UQ_Translations] UNIQUE NONCLUSTERED 
(
	[LanguageId] ASC,
	[TranslationKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_UserAssignments_AssignmentType]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_UserAssignments_AssignmentType] ON [dbo].[UserAssignments]
(
	[AssignmentTypeId] ASC,
	[AcademicYearId] ASC,
	[IsActive] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_UserAssignments_User_IsActive]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_UserAssignments_User_IsActive] ON [dbo].[UserAssignments]
(
	[UserId] ASC,
	[IsActive] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_UserAssignmentScopes_Assignment]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_UserAssignmentScopes_Assignment] ON [dbo].[UserAssignmentScopes]
(
	[UserAssignmentId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_UserMenuPreferences]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[UserMenuPreferences] ADD  CONSTRAINT [UQ_UserMenuPreferences] UNIQUE NONCLUSTERED 
(
	[UserId] ASC,
	[MenuId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_UserNotificationPreferences]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[UserNotificationPreferences] ADD  CONSTRAINT [UQ_UserNotificationPreferences] UNIQUE NONCLUSTERED 
(
	[UserId] ASC,
	[NotificationPreferenceTypeId] ASC,
	[NotificationChannelId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_UserPermissionOverrides]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[UserPermissionOverrides] ADD  CONSTRAINT [UQ_UserPermissionOverrides] UNIQUE NONCLUSTERED 
(
	[UserId] ASC,
	[PermissionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__UserRegi__BCB33F927F6295AC]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[UserRegistrationTokens] ADD UNIQUE NONCLUSTERED 
(
	[TokenHash] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Users__7AD04F1065D7ADC8]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Users] ADD UNIQUE NONCLUSTERED 
(
	[EmployeeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Users__F4D00BA28E45AC57]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Users] ADD UNIQUE NONCLUSTERED 
(
	[SchoolEmail] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Users_DepartmentId]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_Users_DepartmentId] ON [dbo].[Users]
(
	[DepartmentId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Users_IsActive]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_Users_IsActive] ON [dbo].[Users]
(
	[IsActive] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Users_RoleId]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_Users_RoleId] ON [dbo].[Users]
(
	[RoleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Users_SchoolId]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_Users_SchoolId] ON [dbo].[Users]
(
	[SchoolId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Users_SectionId]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_Users_SectionId] ON [dbo].[Users]
(
	[SectionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__UserSess__5ADD80F470ECAC1D]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[UserSessions] ADD UNIQUE NONCLUSTERED 
(
	[SessionTokenHash] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_UserSubjects_User_Subject]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[UserSubjects] ADD  CONSTRAINT [UQ_UserSubjects_User_Subject] UNIQUE NONCLUSTERED 
(
	[UserId] ASC,
	[SubjectId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Widgets__78D4AA9F4B81C401]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Widgets] ADD UNIQUE NONCLUSTERED 
(
	[WidgetKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IX_Widgets_Module]    Script Date: 10/07/2026 12:54:07 PM ******/
CREATE NONCLUSTERED INDEX [IX_Widgets_Module] ON [dbo].[Widgets]
(
	[ModuleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_WorkflowSteps_Template_Step]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[WorkflowSteps] ADD  CONSTRAINT [UQ_WorkflowSteps_Template_Step] UNIQUE NONCLUSTERED 
(
	[WorkflowTemplateId] ASC,
	[StepKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Workflow__4B098444DFFBE338]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[WorkflowTemplates] ADD UNIQUE NONCLUSTERED 
(
	[WorkflowKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_WorkspaceRoles]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[WorkspaceRoles] ADD  CONSTRAINT [UQ_WorkspaceRoles] UNIQUE NONCLUSTERED 
(
	[WorkspaceId] ASC,
	[RoleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Workspac__BEEA5DAE2806C3E0]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[Workspaces] ADD UNIQUE NONCLUSTERED 
(
	[WorkspaceKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__YearLeve__BABD50AF5F315DD7]    Script Date: 10/07/2026 12:54:07 PM ******/
ALTER TABLE [dbo].[YearLevels] ADD UNIQUE NONCLUSTERED 
(
	[YearLevelKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[AcademicYears] ADD  DEFAULT ((0)) FOR [IsCurrent]
GO
ALTER TABLE [dbo].[AcademicYears] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[AcademicYears] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[AccessLevels] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[AccessLevels] ADD  DEFAULT ((0)) FOR [IsSystemLevel]
GO
ALTER TABLE [dbo].[AccessLevels] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[AccessLevels] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ActivityTimeline] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[AIPrompts] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[AIUsageLogs] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[AnnouncementBanners] ADD  DEFAULT ('Info') FOR [BannerType]
GO
ALTER TABLE [dbo].[AnnouncementBanners] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ApiKeys] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ArchivePolicies] ADD  DEFAULT ((0)) FOR [ArchiveByAcademicYear]
GO
ALTER TABLE [dbo].[ArchivePolicies] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[ArchivePolicies] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ArchiveRecords] ADD  DEFAULT ('Archived') FOR [ArchiveStatus]
GO
ALTER TABLE [dbo].[ArchiveRecords] ADD  DEFAULT (getdate()) FOR [ArchivedAt]
GO
ALTER TABLE [dbo].[ArchiveRuns] ADD  DEFAULT ('Pending') FOR [RunStatus]
GO
ALTER TABLE [dbo].[ArchiveRuns] ADD  DEFAULT ((0)) FOR [RecordsEvaluated]
GO
ALTER TABLE [dbo].[ArchiveRuns] ADD  DEFAULT ((0)) FOR [RecordsArchived]
GO
ALTER TABLE [dbo].[ArchiveRuns] ADD  DEFAULT (getdate()) FOR [StartedAt]
GO
ALTER TABLE [dbo].[AssignmentTypes] ADD  DEFAULT ((0)) FOR [IsSystemAssignment]
GO
ALTER TABLE [dbo].[AssignmentTypes] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[AssignmentTypes] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[AssignmentTypes] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[AuditLogs] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[BackgroundJobLogs] ADD  DEFAULT (getdate()) FOR [StartedAt]
GO
ALTER TABLE [dbo].[BackupJobs] ADD  DEFAULT ('Pending') FOR [BackupStatus]
GO
ALTER TABLE [dbo].[BackupJobs] ADD  DEFAULT (getdate()) FOR [StartedAt]
GO
ALTER TABLE [dbo].[Branding] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Branding] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Branding] ADD  CONSTRAINT [DF_Branding_UseSidebarGradient]  DEFAULT ((0)) FOR [UseSidebarGradient]
GO
ALTER TABLE [dbo].[Branding] ADD  CONSTRAINT [DF_Branding_UseTopbarGradient]  DEFAULT ((0)) FOR [UseTopbarGradient]
GO
ALTER TABLE [dbo].[BrandingSlides] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[BrandingSlides] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Buildings] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Buildings] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Buttons] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[CalendarEventAttendees] ADD  DEFAULT ('Pending') FOR [ResponseStatus]
GO
ALTER TABLE [dbo].[CalendarEventAttendees] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[CalendarEvents] ADD  DEFAULT ((0)) FOR [IsAllDay]
GO
ALTER TABLE [dbo].[CalendarEvents] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[CalendarEventTypes] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Classes] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Classes] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ConfigurationSnapshots] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[DashboardKPIs] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[DashboardKPIs] ADD  DEFAULT ((1)) FOR [IsVisible]
GO
ALTER TABLE [dbo].[Dashboards] ADD  DEFAULT ((0)) FOR [IsDefault]
GO
ALTER TABLE [dbo].[Dashboards] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[DashboardWidgets] ADD  DEFAULT ((0)) FOR [GridX]
GO
ALTER TABLE [dbo].[DashboardWidgets] ADD  DEFAULT ((0)) FOR [GridY]
GO
ALTER TABLE [dbo].[DashboardWidgets] ADD  DEFAULT ((4)) FOR [GridW]
GO
ALTER TABLE [dbo].[DashboardWidgets] ADD  DEFAULT ((2)) FOR [GridH]
GO
ALTER TABLE [dbo].[DashboardWidgets] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[DashboardWidgets] ADD  DEFAULT ((0)) FOR [IsRequired]
GO
ALTER TABLE [dbo].[DepartmentPrintLimits] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Departments] ADD  DEFAULT ((0)) FOR [IsAcademic]
GO
ALTER TABLE [dbo].[Departments] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Departments] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[Departments] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[DocumentBranding] ADD  DEFAULT ((0)) FOR [IsDefault]
GO
ALTER TABLE [dbo].[DocumentBranding] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[DocumentBranding] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[DocumentSequences] ADD  DEFAULT ((0)) FOR [CurrentValue]
GO
ALTER TABLE [dbo].[DocumentSequences] ADD  DEFAULT ((5)) FOR [PaddingLength]
GO
ALTER TABLE [dbo].[DocumentSequences] ADD  DEFAULT ((1)) FOR [ResetEveryYear]
GO
ALTER TABLE [dbo].[DocumentSequences] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[DocumentSequences] ADD  DEFAULT (getdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[EmailQueue] ADD  DEFAULT ('Pending') FOR [Status]
GO
ALTER TABLE [dbo].[EmailQueue] ADD  DEFAULT ((0)) FOR [Attempts]
GO
ALTER TABLE [dbo].[EmailQueue] ADD  DEFAULT (getdate()) FOR [QueuedAt]
GO
ALTER TABLE [dbo].[EmailTemplates] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[EmailTemplates] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[EmailVerificationTokens] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[EntityComments] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[EntityComments] ADD  DEFAULT ((0)) FOR [IsDeleted]
GO
ALTER TABLE [dbo].[EntityFiles] ADD  DEFAULT (getdate()) FOR [UploadedAt]
GO
ALTER TABLE [dbo].[EntityFiles] ADD  DEFAULT ((0)) FOR [IsDeleted]
GO
ALTER TABLE [dbo].[EntityTags] ADD  DEFAULT (getdate()) FOR [TaggedAt]
GO
ALTER TABLE [dbo].[FeatureFlags] ADD  DEFAULT ((0)) FOR [IsEnabled]
GO
ALTER TABLE [dbo].[FeatureFlags] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[FeatureVisibilityStatuses] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[FileStorage] ADD  DEFAULT (getdate()) FOR [UploadedAt]
GO
ALTER TABLE [dbo].[FileStorage] ADD  DEFAULT ((0)) FOR [IsDeleted]
GO
ALTER TABLE [dbo].[GlobalSearchEntities] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[GlobalSearchEntities] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ImportErrorLogs] ADD  DEFAULT ((0)) FOR [IsResolved]
GO
ALTER TABLE [dbo].[ImportErrorLogs] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Integrations] ADD  DEFAULT ((0)) FOR [IsConfigured]
GO
ALTER TABLE [dbo].[Integrations] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[IntegrationSettings] ADD  DEFAULT ((0)) FOR [IsSecret]
GO
ALTER TABLE [dbo].[IntegrationSettings] ADD  DEFAULT (getdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[InventoryItemTypes] ADD  DEFAULT ((1)) FOR [IsConsumable]
GO
ALTER TABLE [dbo].[InventoryItemTypes] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[InventoryTransactions] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ITAssetAssignments] ADD  DEFAULT (getdate()) FOR [AssignedAt]
GO
ALTER TABLE [dbo].[ITAssetBorrows] ADD  DEFAULT (getdate()) FOR [BorrowedAt]
GO
ALTER TABLE [dbo].[ITAssetBorrows] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ITAssetBrands] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[ITAssetCategories] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[ITAssetCategories] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ITAssetConditions] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[ITAssetDisposals] ADD  DEFAULT ('Ready for Disposal') FOR [DisposalStatus]
GO
ALTER TABLE [dbo].[ITAssetDisposals] ADD  DEFAULT (getdate()) FOR [RequestedAt]
GO
ALTER TABLE [dbo].[ITAssetGroupItems] ADD  DEFAULT (getdate()) FOR [AddedAt]
GO
ALTER TABLE [dbo].[ITAssetGroups] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[ITAssetGroups] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ITAssetImportBatches] ADD  DEFAULT ((0)) FOR [TotalRows]
GO
ALTER TABLE [dbo].[ITAssetImportBatches] ADD  DEFAULT ((0)) FOR [ValidRows]
GO
ALTER TABLE [dbo].[ITAssetImportBatches] ADD  DEFAULT ((0)) FOR [InvalidRows]
GO
ALTER TABLE [dbo].[ITAssetImportBatches] ADD  DEFAULT ((0)) FOR [ImportedRows]
GO
ALTER TABLE [dbo].[ITAssetImportBatches] ADD  DEFAULT ('Pending') FOR [Status]
GO
ALTER TABLE [dbo].[ITAssetImportBatches] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ITAssetImportStaging] ADD  DEFAULT ('Pending') FOR [ImportStatus]
GO
ALTER TABLE [dbo].[ITAssetImportStaging] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ITAssetIssueCategories] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[ITAssetIssueLogs] ADD  DEFAULT ('Open') FOR [IssueStatus]
GO
ALTER TABLE [dbo].[ITAssetIssueLogs] ADD  DEFAULT ('Normal') FOR [Priority]
GO
ALTER TABLE [dbo].[ITAssetIssueLogs] ADD  DEFAULT (getdate()) FOR [ReportedAt]
GO
ALTER TABLE [dbo].[ITAssetIssueTypes] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[ITAssetMaintenanceLogs] ADD  DEFAULT (getdate()) FOR [PerformedAt]
GO
ALTER TABLE [dbo].[ITAssetModels] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[ITAssetNeededLaptops] ADD  DEFAULT ('Pending Review') FOR [Status]
GO
ALTER TABLE [dbo].[ITAssetNeededLaptops] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ITAssetNotes] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ITAssetNoteTypes] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[ITAssetPrinterCopierDetails] ADD  DEFAULT ((1)) FOR [CanPrint]
GO
ALTER TABLE [dbo].[ITAssetPrinterCopierDetails] ADD  DEFAULT ((0)) FOR [CanCopy]
GO
ALTER TABLE [dbo].[ITAssetPrinterCopierDetails] ADD  DEFAULT ((0)) FOR [CanScan]
GO
ALTER TABLE [dbo].[ITAssetPrinterCopierDetails] ADD  DEFAULT ((0)) FOR [CanFax]
GO
ALTER TABLE [dbo].[ITAssetPrinterCopierDetails] ADD  DEFAULT ((0)) FOR [SupportsA3]
GO
ALTER TABLE [dbo].[ITAssetPrinterCopierDetails] ADD  DEFAULT ((1)) FOR [SupportsA4]
GO
ALTER TABLE [dbo].[ITAssetPrinterCopierDetails] ADD  DEFAULT ((0)) FOR [IsColor]
GO
ALTER TABLE [dbo].[ITAssetPrinterCopierDetails] ADD  DEFAULT ((0)) FOR [IsDuplex]
GO
ALTER TABLE [dbo].[ITAssetPrinterCopierDetails] ADD  DEFAULT ((1)) FOR [IsNetworked]
GO
ALTER TABLE [dbo].[ITAssets] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[ITAssets] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ITAssets] ADD  DEFAULT ((0)) FOR [IsDeleted]
GO
ALTER TABLE [dbo].[ITAssetStatuses] ADD  DEFAULT ((0)) FOR [IsFinalStatus]
GO
ALTER TABLE [dbo].[ITAssetStatuses] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[ITAssetStatusHistory] ADD  DEFAULT (getdate()) FOR [ChangedAt]
GO
ALTER TABLE [dbo].[ITAssetTransferRequests] ADD  DEFAULT ('Pending') FOR [TransferStatus]
GO
ALTER TABLE [dbo].[ITAssetTransferRequests] ADD  DEFAULT (getdate()) FOR [RequestedAt]
GO
ALTER TABLE [dbo].[ITTickets] ADD  DEFAULT ('Normal') FOR [Priority]
GO
ALTER TABLE [dbo].[ITTickets] ADD  DEFAULT ('Open') FOR [Status]
GO
ALTER TABLE [dbo].[ITTickets] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ITTickets] ADD  DEFAULT ((0)) FOR [IsDeleted]
GO
ALTER TABLE [dbo].[KPIDefinitions] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Languages] ADD  DEFAULT ((0)) FOR [IsDefault]
GO
ALTER TABLE [dbo].[Languages] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Locations] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Locations] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[LoginHistory] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[LookupCategories] ADD  DEFAULT ((0)) FOR [IsSystemCategory]
GO
ALTER TABLE [dbo].[LookupCategories] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[LookupCategories] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[LookupValues] ADD  DEFAULT ((0)) FOR [IsSystemValue]
GO
ALTER TABLE [dbo].[LookupValues] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[LookupValues] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[LookupValues] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[MenuGroupItems] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[MenuGroups] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[MenuGroups] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Menus] ADD  DEFAULT ((0)) FOR [IsPinned]
GO
ALTER TABLE [dbo].[Menus] ADD  DEFAULT ((1)) FOR [IsCollapsible]
GO
ALTER TABLE [dbo].[Menus] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[Menus] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Modules] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Modules] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[Modules] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[NotificationChannels] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[NotificationPreferenceTypes] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Notifications] ADD  DEFAULT ((0)) FOR [IsRead]
GO
ALTER TABLE [dbo].[Notifications] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[PaperDistributions] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[PaperInventory] ADD  DEFAULT ((0)) FOR [CurrentStock]
GO
ALTER TABLE [dbo].[PaperInventory] ADD  DEFAULT (getdate()) FOR [LastUpdated]
GO
ALTER TABLE [dbo].[PaperPurchases] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[PasswordResetTokens] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Permissions] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Permissions] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Permissions] ADD  DEFAULT ('platform') FOR [GroupKey]
GO
ALTER TABLE [dbo].[Permissions] ADD  DEFAULT ('Platform') FOR [GroupName]
GO
ALTER TABLE [dbo].[PhotocopyRequests] ADD  DEFAULT ('Normal') FOR [PriorityLevel]
GO
ALTER TABLE [dbo].[PhotocopyRequests] ADD  DEFAULT ('Pending') FOR [Status]
GO
ALTER TABLE [dbo].[PhotocopyRequests] ADD  DEFAULT ((0)) FOR [IsExam]
GO
ALTER TABLE [dbo].[PhotocopyRequests] ADD  DEFAULT (getdate()) FOR [SubmittedAt]
GO
ALTER TABLE [dbo].[PhotocopyRequests] ADD  DEFAULT ((0)) FOR [IsDeleted]
GO
ALTER TABLE [dbo].[PrinterMeterReadings] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[PrintingLogs] ADD  DEFAULT ((0)) FOR [PrintedPages]
GO
ALTER TABLE [dbo].[PrintingLogs] ADD  DEFAULT ((0)) FOR [PrintedSheets]
GO
ALTER TABLE [dbo].[PrintingLogs] ADD  DEFAULT (getdate()) FOR [PrintedAt]
GO
ALTER TABLE [dbo].[Purposes] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Purposes] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[Purposes] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[QuickActions] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[QuickActions] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ReportDefinitions] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[RequestApprovals] ADD  DEFAULT (getdate()) FOR [ActionDate]
GO
ALTER TABLE [dbo].[RequestAttachments] ADD  DEFAULT ((1)) FOR [Copies]
GO
ALTER TABLE [dbo].[RequestAttachments] ADD  DEFAULT (getdate()) FOR [UploadedAt]
GO
ALTER TABLE [dbo].[RestoreLogs] ADD  DEFAULT ('Pending') FOR [RestoreStatus]
GO
ALTER TABLE [dbo].[RestoreLogs] ADD  DEFAULT (getdate()) FOR [StartedAt]
GO
ALTER TABLE [dbo].[RolePermissions] ADD  DEFAULT ((1)) FOR [IsAllowed]
GO
ALTER TABLE [dbo].[RolePermissions] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Roles] ADD  DEFAULT ((0)) FOR [IsSystemRole]
GO
ALTER TABLE [dbo].[Roles] ADD  DEFAULT ((0)) FOR [IsProtected]
GO
ALTER TABLE [dbo].[Roles] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Roles] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Rooms] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Rooms] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[SavedReports] ADD  DEFAULT ((0)) FOR [IsShared]
GO
ALTER TABLE [dbo].[SavedReports] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ScheduledJobs] ADD  DEFAULT ((1)) FOR [IsEnabled]
GO
ALTER TABLE [dbo].[ScheduledJobs] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Schools] ADD  DEFAULT ('Asia/Dubai') FOR [TimeZone]
GO
ALTER TABLE [dbo].[Schools] ADD  DEFAULT ('AED') FOR [CurrencyCode]
GO
ALTER TABLE [dbo].[Schools] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Schools] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[SchoolSettings] ADD  DEFAULT ((1)) FOR [IsEditable]
GO
ALTER TABLE [dbo].[SchoolSettings] ADD  DEFAULT (getdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[Sections] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Sections] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[Sections] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[StaffImportBatches] ADD  DEFAULT ((0)) FOR [TotalRows]
GO
ALTER TABLE [dbo].[StaffImportBatches] ADD  DEFAULT ((0)) FOR [ValidRows]
GO
ALTER TABLE [dbo].[StaffImportBatches] ADD  DEFAULT ((0)) FOR [InvalidRows]
GO
ALTER TABLE [dbo].[StaffImportBatches] ADD  DEFAULT ((0)) FOR [DuplicateRows]
GO
ALTER TABLE [dbo].[StaffImportBatches] ADD  DEFAULT ((0)) FOR [ImportedRows]
GO
ALTER TABLE [dbo].[StaffImportBatches] ADD  DEFAULT ('Pending') FOR [Status]
GO
ALTER TABLE [dbo].[StaffImportBatches] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[StaffImportStaging] ADD  DEFAULT ('Pending') FOR [ValidationStatus]
GO
ALTER TABLE [dbo].[StaffImportStaging] ADD  DEFAULT ('Pending') FOR [ImportStatus]
GO
ALTER TABLE [dbo].[StaffImportStaging] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[StaffProfiles] ADD  DEFAULT ('Active') FOR [EmploymentStatus]
GO
ALTER TABLE [dbo].[StaffProfiles] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[StatusGroups] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[StatusGroups] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[StatusValues] ADD  DEFAULT ((0)) FOR [IsInitial]
GO
ALTER TABLE [dbo].[StatusValues] ADD  DEFAULT ((0)) FOR [IsFinal]
GO
ALTER TABLE [dbo].[StatusValues] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[StatusValues] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[StatusValues] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[StudentClassEnrollments] ADD  DEFAULT ((1)) FOR [IsCurrent]
GO
ALTER TABLE [dbo].[StudentClassEnrollments] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[StudentIdBatches] ADD  DEFAULT ('Draft') FOR [Status]
GO
ALTER TABLE [dbo].[StudentIdBatches] ADD  DEFAULT (getdate()) FOR [RequestedAt]
GO
ALTER TABLE [dbo].[StudentIdCards] ADD  DEFAULT ('Pending Verification') FOR [CardStatus]
GO
ALTER TABLE [dbo].[StudentIdCards] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[StudentIdTemplates] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Students] ADD  DEFAULT ('Active') FOR [StudentStatus]
GO
ALTER TABLE [dbo].[Students] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Students] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Students] ADD  DEFAULT ((0)) FOR [IsDeleted]
GO
ALTER TABLE [dbo].[SubjectPrintLimits] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Subjects] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Subjects] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[Subjects] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[SystemHealthLogs] ADD  DEFAULT (getdate()) FOR [CheckedAt]
GO
ALTER TABLE [dbo].[SystemSettings] ADD  DEFAULT ((1)) FOR [IsEditable]
GO
ALTER TABLE [dbo].[SystemSettings] ADD  DEFAULT (getdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[Tags] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Tags] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[TaskAssignments] ADD  DEFAULT (getdate()) FOR [AssignedAt]
GO
ALTER TABLE [dbo].[TaskChecklistItems] ADD  DEFAULT ((0)) FOR [IsCompleted]
GO
ALTER TABLE [dbo].[TaskChecklistItems] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[Tasks] ADD  DEFAULT ('Normal') FOR [Priority]
GO
ALTER TABLE [dbo].[Tasks] ADD  DEFAULT ('Open') FOR [Status]
GO
ALTER TABLE [dbo].[Tasks] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Terms] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[Terms] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Terms] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Themes] ADD  DEFAULT ((0)) FOR [IsDefault]
GO
ALTER TABLE [dbo].[Themes] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Themes] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[TopbarSettings] ADD  DEFAULT ((1)) FOR [ShowSearch]
GO
ALTER TABLE [dbo].[TopbarSettings] ADD  DEFAULT ((1)) FOR [ShowNotifications]
GO
ALTER TABLE [dbo].[TopbarSettings] ADD  DEFAULT ((1)) FOR [ShowWorkspaceSwitcher]
GO
ALTER TABLE [dbo].[TopbarSettings] ADD  DEFAULT ((1)) FOR [ShowProfileMenu]
GO
ALTER TABLE [dbo].[TopbarSettings] ADD  DEFAULT ((0)) FOR [AnnouncementBannerEnabled]
GO
ALTER TABLE [dbo].[TopbarSettings] ADD  DEFAULT (getdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[Translations] ADD  DEFAULT (getdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[UserAssignments] ADD  DEFAULT ((0)) FOR [IsPrimary]
GO
ALTER TABLE [dbo].[UserAssignments] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[UserAssignments] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[UserAssignmentScopes] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[UserMenuPreferences] ADD  DEFAULT ((0)) FOR [IsPinned]
GO
ALTER TABLE [dbo].[UserMenuPreferences] ADD  DEFAULT ((0)) FOR [IsHidden]
GO
ALTER TABLE [dbo].[UserMenuPreferences] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[UserNotificationPreferences] ADD  DEFAULT ((1)) FOR [IsEnabled]
GO
ALTER TABLE [dbo].[UserNotificationPreferences] ADD  DEFAULT (getdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[UserPermissionOverrides] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[UserRegistrationTokens] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ((1)) FOR [MustChangePassword]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ((0)) FOR [EmailVerified]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ((0)) FOR [IsRegistrationCompleted]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ((0)) FOR [IsLocked]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ((0)) FOR [FailedLoginAttempts]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ((0)) FOR [IsDeleted]
GO
ALTER TABLE [dbo].[UserSessions] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[UserSubjects] ADD  DEFAULT ((0)) FOR [IsPrimary]
GO
ALTER TABLE [dbo].[UserSubjects] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[UserSubjects] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Widgets] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[Widgets] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[WorkflowActions] ADD  DEFAULT (getdate()) FOR [ActionDate]
GO
ALTER TABLE [dbo].[WorkflowInstances] ADD  DEFAULT ('Pending') FOR [Status]
GO
ALTER TABLE [dbo].[WorkflowInstances] ADD  DEFAULT (getdate()) FOR [StartedAt]
GO
ALTER TABLE [dbo].[WorkflowSteps] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[WorkflowSteps] ADD  DEFAULT ((1)) FOR [IsRequired]
GO
ALTER TABLE [dbo].[WorkflowSteps] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[WorkflowTemplates] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[WorkspaceRoles] ADD  DEFAULT ((0)) FOR [IsDefault]
GO
ALTER TABLE [dbo].[WorkspaceRoles] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Workspaces] ADD  DEFAULT ((0)) FOR [IsDefault]
GO
ALTER TABLE [dbo].[Workspaces] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[Workspaces] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Workspaces] ADD  CONSTRAINT [DF_Workspaces_IsActive]  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[YearLevels] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[YearLevels] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[YearLevels] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ActivityTimeline]  WITH CHECK ADD  CONSTRAINT [FK_ActivityTimeline_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ActivityTimeline] CHECK CONSTRAINT [FK_ActivityTimeline_Users]
GO
ALTER TABLE [dbo].[AIPrompts]  WITH CHECK ADD  CONSTRAINT [FK_AIPrompts_Modules] FOREIGN KEY([ModuleId])
REFERENCES [dbo].[Modules] ([ModuleId])
GO
ALTER TABLE [dbo].[AIPrompts] CHECK CONSTRAINT [FK_AIPrompts_Modules]
GO
ALTER TABLE [dbo].[AIPrompts]  WITH CHECK ADD  CONSTRAINT [FK_AIPrompts_VisibilityStatuses] FOREIGN KEY([VisibilityStatusId])
REFERENCES [dbo].[FeatureVisibilityStatuses] ([VisibilityStatusId])
GO
ALTER TABLE [dbo].[AIPrompts] CHECK CONSTRAINT [FK_AIPrompts_VisibilityStatuses]
GO
ALTER TABLE [dbo].[AIUsageLogs]  WITH CHECK ADD  CONSTRAINT [FK_AIUsageLogs_Prompts] FOREIGN KEY([AIPromptId])
REFERENCES [dbo].[AIPrompts] ([AIPromptId])
GO
ALTER TABLE [dbo].[AIUsageLogs] CHECK CONSTRAINT [FK_AIUsageLogs_Prompts]
GO
ALTER TABLE [dbo].[AIUsageLogs]  WITH CHECK ADD  CONSTRAINT [FK_AIUsageLogs_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[AIUsageLogs] CHECK CONSTRAINT [FK_AIUsageLogs_Users]
GO
ALTER TABLE [dbo].[AnnouncementBanners]  WITH CHECK ADD  CONSTRAINT [FK_AnnouncementBanners_CreatedBy] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[AnnouncementBanners] CHECK CONSTRAINT [FK_AnnouncementBanners_CreatedBy]
GO
ALTER TABLE [dbo].[AnnouncementBanners]  WITH CHECK ADD  CONSTRAINT [FK_AnnouncementBanners_VisibilityStatuses] FOREIGN KEY([VisibilityStatusId])
REFERENCES [dbo].[FeatureVisibilityStatuses] ([VisibilityStatusId])
GO
ALTER TABLE [dbo].[AnnouncementBanners] CHECK CONSTRAINT [FK_AnnouncementBanners_VisibilityStatuses]
GO
ALTER TABLE [dbo].[ApiKeys]  WITH CHECK ADD  CONSTRAINT [FK_ApiKeys_CreatedBy] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ApiKeys] CHECK CONSTRAINT [FK_ApiKeys_CreatedBy]
GO
ALTER TABLE [dbo].[ArchivePolicies]  WITH CHECK ADD  CONSTRAINT [FK_ArchivePolicies_VisibilityStatuses] FOREIGN KEY([VisibilityStatusId])
REFERENCES [dbo].[FeatureVisibilityStatuses] ([VisibilityStatusId])
GO
ALTER TABLE [dbo].[ArchivePolicies] CHECK CONSTRAINT [FK_ArchivePolicies_VisibilityStatuses]
GO
ALTER TABLE [dbo].[ArchiveRecords]  WITH CHECK ADD  CONSTRAINT [FK_ArchiveRecords_Runs] FOREIGN KEY([ArchiveRunId])
REFERENCES [dbo].[ArchiveRuns] ([ArchiveRunId])
GO
ALTER TABLE [dbo].[ArchiveRecords] CHECK CONSTRAINT [FK_ArchiveRecords_Runs]
GO
ALTER TABLE [dbo].[ArchiveRuns]  WITH CHECK ADD  CONSTRAINT [FK_ArchiveRuns_Policies] FOREIGN KEY([ArchivePolicyId])
REFERENCES [dbo].[ArchivePolicies] ([ArchivePolicyId])
GO
ALTER TABLE [dbo].[ArchiveRuns] CHECK CONSTRAINT [FK_ArchiveRuns_Policies]
GO
ALTER TABLE [dbo].[ArchiveRuns]  WITH CHECK ADD  CONSTRAINT [FK_ArchiveRuns_StartedBy] FOREIGN KEY([StartedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ArchiveRuns] CHECK CONSTRAINT [FK_ArchiveRuns_StartedBy]
GO
ALTER TABLE [dbo].[AuditLogs]  WITH CHECK ADD  CONSTRAINT [FK_AuditLogs_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[AuditLogs] CHECK CONSTRAINT [FK_AuditLogs_Users]
GO
ALTER TABLE [dbo].[BackupJobs]  WITH CHECK ADD  CONSTRAINT [FK_BackupJobs_StartedBy] FOREIGN KEY([StartedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[BackupJobs] CHECK CONSTRAINT [FK_BackupJobs_StartedBy]
GO
ALTER TABLE [dbo].[Branding]  WITH CHECK ADD  CONSTRAINT [FK_Branding_DarkLogoFile] FOREIGN KEY([DarkLogoFileId])
REFERENCES [dbo].[FileStorage] ([FileId])
GO
ALTER TABLE [dbo].[Branding] CHECK CONSTRAINT [FK_Branding_DarkLogoFile]
GO
ALTER TABLE [dbo].[Branding]  WITH CHECK ADD  CONSTRAINT [FK_Branding_FaviconFile] FOREIGN KEY([FaviconFileId])
REFERENCES [dbo].[FileStorage] ([FileId])
GO
ALTER TABLE [dbo].[Branding] CHECK CONSTRAINT [FK_Branding_FaviconFile]
GO
ALTER TABLE [dbo].[Branding]  WITH CHECK ADD  CONSTRAINT [FK_Branding_LoginBackgroundFile] FOREIGN KEY([LoginBackgroundFileId])
REFERENCES [dbo].[FileStorage] ([FileId])
GO
ALTER TABLE [dbo].[Branding] CHECK CONSTRAINT [FK_Branding_LoginBackgroundFile]
GO
ALTER TABLE [dbo].[Branding]  WITH CHECK ADD  CONSTRAINT [FK_Branding_LoginVideoFile] FOREIGN KEY([LoginVideoFileId])
REFERENCES [dbo].[FileStorage] ([FileId])
GO
ALTER TABLE [dbo].[Branding] CHECK CONSTRAINT [FK_Branding_LoginVideoFile]
GO
ALTER TABLE [dbo].[Branding]  WITH CHECK ADD  CONSTRAINT [FK_Branding_LogoFile] FOREIGN KEY([LogoFileId])
REFERENCES [dbo].[FileStorage] ([FileId])
GO
ALTER TABLE [dbo].[Branding] CHECK CONSTRAINT [FK_Branding_LogoFile]
GO
ALTER TABLE [dbo].[Branding]  WITH CHECK ADD  CONSTRAINT [FK_Branding_Schools] FOREIGN KEY([SchoolId])
REFERENCES [dbo].[Schools] ([SchoolId])
GO
ALTER TABLE [dbo].[Branding] CHECK CONSTRAINT [FK_Branding_Schools]
GO
ALTER TABLE [dbo].[Branding]  WITH CHECK ADD  CONSTRAINT [FK_Branding_SmallLogoFile] FOREIGN KEY([SmallLogoFileId])
REFERENCES [dbo].[FileStorage] ([FileId])
GO
ALTER TABLE [dbo].[Branding] CHECK CONSTRAINT [FK_Branding_SmallLogoFile]
GO
ALTER TABLE [dbo].[Branding]  WITH CHECK ADD  CONSTRAINT [FK_Branding_UpdatedBy] FOREIGN KEY([UpdatedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[Branding] CHECK CONSTRAINT [FK_Branding_UpdatedBy]
GO
ALTER TABLE [dbo].[BrandingSlides]  WITH CHECK ADD  CONSTRAINT [FK_BrandingSlides_Branding] FOREIGN KEY([BrandingId])
REFERENCES [dbo].[Branding] ([BrandingId])
GO
ALTER TABLE [dbo].[BrandingSlides] CHECK CONSTRAINT [FK_BrandingSlides_Branding]
GO
ALTER TABLE [dbo].[BrandingSlides]  WITH CHECK ADD  CONSTRAINT [FK_BrandingSlides_FileStorage] FOREIGN KEY([FileId])
REFERENCES [dbo].[FileStorage] ([FileId])
GO
ALTER TABLE [dbo].[BrandingSlides] CHECK CONSTRAINT [FK_BrandingSlides_FileStorage]
GO
ALTER TABLE [dbo].[BrandingSlides]  WITH CHECK ADD  CONSTRAINT [FK_BrandingSlides_VisibilityStatuses] FOREIGN KEY([VisibilityStatusId])
REFERENCES [dbo].[FeatureVisibilityStatuses] ([VisibilityStatusId])
GO
ALTER TABLE [dbo].[BrandingSlides] CHECK CONSTRAINT [FK_BrandingSlides_VisibilityStatuses]
GO
ALTER TABLE [dbo].[Buttons]  WITH CHECK ADD  CONSTRAINT [FK_Buttons_FeatureFlags] FOREIGN KEY([FeatureFlagId])
REFERENCES [dbo].[FeatureFlags] ([FeatureFlagId])
GO
ALTER TABLE [dbo].[Buttons] CHECK CONSTRAINT [FK_Buttons_FeatureFlags]
GO
ALTER TABLE [dbo].[Buttons]  WITH CHECK ADD  CONSTRAINT [FK_Buttons_Modules] FOREIGN KEY([ModuleId])
REFERENCES [dbo].[Modules] ([ModuleId])
GO
ALTER TABLE [dbo].[Buttons] CHECK CONSTRAINT [FK_Buttons_Modules]
GO
ALTER TABLE [dbo].[Buttons]  WITH CHECK ADD  CONSTRAINT [FK_Buttons_Permissions] FOREIGN KEY([PermissionId])
REFERENCES [dbo].[Permissions] ([PermissionId])
GO
ALTER TABLE [dbo].[Buttons] CHECK CONSTRAINT [FK_Buttons_Permissions]
GO
ALTER TABLE [dbo].[Buttons]  WITH CHECK ADD  CONSTRAINT [FK_Buttons_VisibilityStatuses] FOREIGN KEY([VisibilityStatusId])
REFERENCES [dbo].[FeatureVisibilityStatuses] ([VisibilityStatusId])
GO
ALTER TABLE [dbo].[Buttons] CHECK CONSTRAINT [FK_Buttons_VisibilityStatuses]
GO
ALTER TABLE [dbo].[CalendarEventAttendees]  WITH CHECK ADD  CONSTRAINT [FK_CalendarEventAttendees_Events] FOREIGN KEY([CalendarEventId])
REFERENCES [dbo].[CalendarEvents] ([CalendarEventId])
GO
ALTER TABLE [dbo].[CalendarEventAttendees] CHECK CONSTRAINT [FK_CalendarEventAttendees_Events]
GO
ALTER TABLE [dbo].[CalendarEventAttendees]  WITH CHECK ADD  CONSTRAINT [FK_CalendarEventAttendees_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[CalendarEventAttendees] CHECK CONSTRAINT [FK_CalendarEventAttendees_Users]
GO
ALTER TABLE [dbo].[CalendarEvents]  WITH CHECK ADD  CONSTRAINT [FK_CalendarEvents_CreatedBy] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[CalendarEvents] CHECK CONSTRAINT [FK_CalendarEvents_CreatedBy]
GO
ALTER TABLE [dbo].[CalendarEvents]  WITH CHECK ADD  CONSTRAINT [FK_CalendarEvents_Rooms] FOREIGN KEY([RoomId])
REFERENCES [dbo].[Rooms] ([RoomId])
GO
ALTER TABLE [dbo].[CalendarEvents] CHECK CONSTRAINT [FK_CalendarEvents_Rooms]
GO
ALTER TABLE [dbo].[CalendarEvents]  WITH CHECK ADD  CONSTRAINT [FK_CalendarEvents_Schools] FOREIGN KEY([SchoolId])
REFERENCES [dbo].[Schools] ([SchoolId])
GO
ALTER TABLE [dbo].[CalendarEvents] CHECK CONSTRAINT [FK_CalendarEvents_Schools]
GO
ALTER TABLE [dbo].[CalendarEvents]  WITH CHECK ADD  CONSTRAINT [FK_CalendarEvents_Types] FOREIGN KEY([CalendarEventTypeId])
REFERENCES [dbo].[CalendarEventTypes] ([CalendarEventTypeId])
GO
ALTER TABLE [dbo].[CalendarEvents] CHECK CONSTRAINT [FK_CalendarEvents_Types]
GO
ALTER TABLE [dbo].[CalendarEventTypes]  WITH CHECK ADD  CONSTRAINT [FK_CalendarEventTypes_Modules] FOREIGN KEY([ModuleId])
REFERENCES [dbo].[Modules] ([ModuleId])
GO
ALTER TABLE [dbo].[CalendarEventTypes] CHECK CONSTRAINT [FK_CalendarEventTypes_Modules]
GO
ALTER TABLE [dbo].[Classes]  WITH CHECK ADD  CONSTRAINT [FK_Classes_AcademicYears] FOREIGN KEY([AcademicYearId])
REFERENCES [dbo].[AcademicYears] ([AcademicYearId])
GO
ALTER TABLE [dbo].[Classes] CHECK CONSTRAINT [FK_Classes_AcademicYears]
GO
ALTER TABLE [dbo].[Classes]  WITH CHECK ADD  CONSTRAINT [FK_Classes_Rooms] FOREIGN KEY([RoomId])
REFERENCES [dbo].[Rooms] ([RoomId])
GO
ALTER TABLE [dbo].[Classes] CHECK CONSTRAINT [FK_Classes_Rooms]
GO
ALTER TABLE [dbo].[Classes]  WITH CHECK ADD  CONSTRAINT [FK_Classes_Sections] FOREIGN KEY([SectionId])
REFERENCES [dbo].[Sections] ([SectionId])
GO
ALTER TABLE [dbo].[Classes] CHECK CONSTRAINT [FK_Classes_Sections]
GO
ALTER TABLE [dbo].[Classes]  WITH CHECK ADD  CONSTRAINT [FK_Classes_YearLevels] FOREIGN KEY([YearLevelId])
REFERENCES [dbo].[YearLevels] ([YearLevelId])
GO
ALTER TABLE [dbo].[Classes] CHECK CONSTRAINT [FK_Classes_YearLevels]
GO
ALTER TABLE [dbo].[ConfigurationSnapshots]  WITH CHECK ADD  CONSTRAINT [FK_ConfigurationSnapshots_CreatedBy] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ConfigurationSnapshots] CHECK CONSTRAINT [FK_ConfigurationSnapshots_CreatedBy]
GO
ALTER TABLE [dbo].[DashboardKPIs]  WITH CHECK ADD  CONSTRAINT [FK_DashboardKPIs_Dashboards] FOREIGN KEY([DashboardId])
REFERENCES [dbo].[Dashboards] ([DashboardId])
GO
ALTER TABLE [dbo].[DashboardKPIs] CHECK CONSTRAINT [FK_DashboardKPIs_Dashboards]
GO
ALTER TABLE [dbo].[DashboardKPIs]  WITH CHECK ADD  CONSTRAINT [FK_DashboardKPIs_KPIs] FOREIGN KEY([KPIDefinitionId])
REFERENCES [dbo].[KPIDefinitions] ([KPIDefinitionId])
GO
ALTER TABLE [dbo].[DashboardKPIs] CHECK CONSTRAINT [FK_DashboardKPIs_KPIs]
GO
ALTER TABLE [dbo].[Dashboards]  WITH CHECK ADD  CONSTRAINT [FK_Dashboards_AssignmentTypes] FOREIGN KEY([AssignmentTypeId])
REFERENCES [dbo].[AssignmentTypes] ([AssignmentTypeId])
GO
ALTER TABLE [dbo].[Dashboards] CHECK CONSTRAINT [FK_Dashboards_AssignmentTypes]
GO
ALTER TABLE [dbo].[Dashboards]  WITH CHECK ADD  CONSTRAINT [FK_Dashboards_Modules] FOREIGN KEY([ModuleId])
REFERENCES [dbo].[Modules] ([ModuleId])
GO
ALTER TABLE [dbo].[Dashboards] CHECK CONSTRAINT [FK_Dashboards_Modules]
GO
ALTER TABLE [dbo].[Dashboards]  WITH CHECK ADD  CONSTRAINT [FK_Dashboards_Roles] FOREIGN KEY([RoleId])
REFERENCES [dbo].[Roles] ([RoleId])
GO
ALTER TABLE [dbo].[Dashboards] CHECK CONSTRAINT [FK_Dashboards_Roles]
GO
ALTER TABLE [dbo].[Dashboards]  WITH CHECK ADD  CONSTRAINT [FK_Dashboards_VisibilityStatuses] FOREIGN KEY([VisibilityStatusId])
REFERENCES [dbo].[FeatureVisibilityStatuses] ([VisibilityStatusId])
GO
ALTER TABLE [dbo].[Dashboards] CHECK CONSTRAINT [FK_Dashboards_VisibilityStatuses]
GO
ALTER TABLE [dbo].[Dashboards]  WITH CHECK ADD  CONSTRAINT [FK_Dashboards_Workspaces] FOREIGN KEY([WorkspaceId])
REFERENCES [dbo].[Workspaces] ([WorkspaceId])
GO
ALTER TABLE [dbo].[Dashboards] CHECK CONSTRAINT [FK_Dashboards_Workspaces]
GO
ALTER TABLE [dbo].[DashboardWidgets]  WITH CHECK ADD  CONSTRAINT [FK_DashboardWidgets_Dashboards] FOREIGN KEY([DashboardId])
REFERENCES [dbo].[Dashboards] ([DashboardId])
GO
ALTER TABLE [dbo].[DashboardWidgets] CHECK CONSTRAINT [FK_DashboardWidgets_Dashboards]
GO
ALTER TABLE [dbo].[DashboardWidgets]  WITH CHECK ADD  CONSTRAINT [FK_DashboardWidgets_Widgets] FOREIGN KEY([WidgetId])
REFERENCES [dbo].[Widgets] ([WidgetId])
GO
ALTER TABLE [dbo].[DashboardWidgets] CHECK CONSTRAINT [FK_DashboardWidgets_Widgets]
GO
ALTER TABLE [dbo].[DepartmentPrintLimits]  WITH CHECK ADD  CONSTRAINT [FK_DepartmentPrintLimits_CreatedBy] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[DepartmentPrintLimits] CHECK CONSTRAINT [FK_DepartmentPrintLimits_CreatedBy]
GO
ALTER TABLE [dbo].[DepartmentPrintLimits]  WITH CHECK ADD  CONSTRAINT [FK_DepartmentPrintLimits_Departments] FOREIGN KEY([DepartmentId])
REFERENCES [dbo].[Departments] ([DepartmentId])
GO
ALTER TABLE [dbo].[DepartmentPrintLimits] CHECK CONSTRAINT [FK_DepartmentPrintLimits_Departments]
GO
ALTER TABLE [dbo].[Departments]  WITH CHECK ADD  CONSTRAINT [FK_Departments_Schools] FOREIGN KEY([SchoolId])
REFERENCES [dbo].[Schools] ([SchoolId])
GO
ALTER TABLE [dbo].[Departments] CHECK CONSTRAINT [FK_Departments_Schools]
GO
ALTER TABLE [dbo].[Departments]  WITH CHECK ADD  CONSTRAINT [FK_Departments_Sections] FOREIGN KEY([SectionId])
REFERENCES [dbo].[Sections] ([SectionId])
GO
ALTER TABLE [dbo].[Departments] CHECK CONSTRAINT [FK_Departments_Sections]
GO
ALTER TABLE [dbo].[DocumentBranding]  WITH CHECK ADD  CONSTRAINT [FK_DocumentBranding_HeaderLogoFile] FOREIGN KEY([HeaderLogoFileId])
REFERENCES [dbo].[FileStorage] ([FileId])
GO
ALTER TABLE [dbo].[DocumentBranding] CHECK CONSTRAINT [FK_DocumentBranding_HeaderLogoFile]
GO
ALTER TABLE [dbo].[DocumentBranding]  WITH CHECK ADD  CONSTRAINT [FK_DocumentBranding_Schools] FOREIGN KEY([SchoolId])
REFERENCES [dbo].[Schools] ([SchoolId])
GO
ALTER TABLE [dbo].[DocumentBranding] CHECK CONSTRAINT [FK_DocumentBranding_Schools]
GO
ALTER TABLE [dbo].[DocumentBranding]  WITH CHECK ADD  CONSTRAINT [FK_DocumentBranding_SignatureFile] FOREIGN KEY([SignatureFileId])
REFERENCES [dbo].[FileStorage] ([FileId])
GO
ALTER TABLE [dbo].[DocumentBranding] CHECK CONSTRAINT [FK_DocumentBranding_SignatureFile]
GO
ALTER TABLE [dbo].[DocumentBranding]  WITH CHECK ADD  CONSTRAINT [FK_DocumentBranding_UpdatedBy] FOREIGN KEY([UpdatedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[DocumentBranding] CHECK CONSTRAINT [FK_DocumentBranding_UpdatedBy]
GO
ALTER TABLE [dbo].[DocumentBranding]  WITH CHECK ADD  CONSTRAINT [FK_DocumentBranding_WatermarkFile] FOREIGN KEY([WatermarkFileId])
REFERENCES [dbo].[FileStorage] ([FileId])
GO
ALTER TABLE [dbo].[DocumentBranding] CHECK CONSTRAINT [FK_DocumentBranding_WatermarkFile]
GO
ALTER TABLE [dbo].[EmailTemplates]  WITH CHECK ADD  CONSTRAINT [FK_EmailTemplates_HeaderLogoFile] FOREIGN KEY([HeaderLogoFileId])
REFERENCES [dbo].[FileStorage] ([FileId])
GO
ALTER TABLE [dbo].[EmailTemplates] CHECK CONSTRAINT [FK_EmailTemplates_HeaderLogoFile]
GO
ALTER TABLE [dbo].[EmailTemplates]  WITH CHECK ADD  CONSTRAINT [FK_EmailTemplates_Schools] FOREIGN KEY([SchoolId])
REFERENCES [dbo].[Schools] ([SchoolId])
GO
ALTER TABLE [dbo].[EmailTemplates] CHECK CONSTRAINT [FK_EmailTemplates_Schools]
GO
ALTER TABLE [dbo].[EmailVerificationTokens]  WITH CHECK ADD  CONSTRAINT [FK_EmailVerificationTokens_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[EmailVerificationTokens] CHECK CONSTRAINT [FK_EmailVerificationTokens_Users]
GO
ALTER TABLE [dbo].[EntityComments]  WITH CHECK ADD  CONSTRAINT [FK_EntityComments_CreatedBy] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[EntityComments] CHECK CONSTRAINT [FK_EntityComments_CreatedBy]
GO
ALTER TABLE [dbo].[EntityComments]  WITH CHECK ADD  CONSTRAINT [FK_EntityComments_DeletedBy] FOREIGN KEY([DeletedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[EntityComments] CHECK CONSTRAINT [FK_EntityComments_DeletedBy]
GO
ALTER TABLE [dbo].[EntityFiles]  WITH CHECK ADD  CONSTRAINT [FK_EntityFiles_DeletedBy] FOREIGN KEY([DeletedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[EntityFiles] CHECK CONSTRAINT [FK_EntityFiles_DeletedBy]
GO
ALTER TABLE [dbo].[EntityFiles]  WITH CHECK ADD  CONSTRAINT [FK_EntityFiles_FileStorage] FOREIGN KEY([FileId])
REFERENCES [dbo].[FileStorage] ([FileId])
GO
ALTER TABLE [dbo].[EntityFiles] CHECK CONSTRAINT [FK_EntityFiles_FileStorage]
GO
ALTER TABLE [dbo].[EntityFiles]  WITH CHECK ADD  CONSTRAINT [FK_EntityFiles_UploadedBy] FOREIGN KEY([UploadedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[EntityFiles] CHECK CONSTRAINT [FK_EntityFiles_UploadedBy]
GO
ALTER TABLE [dbo].[EntityTags]  WITH CHECK ADD  CONSTRAINT [FK_EntityTags_TaggedBy] FOREIGN KEY([TaggedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[EntityTags] CHECK CONSTRAINT [FK_EntityTags_TaggedBy]
GO
ALTER TABLE [dbo].[EntityTags]  WITH CHECK ADD  CONSTRAINT [FK_EntityTags_Tags] FOREIGN KEY([TagId])
REFERENCES [dbo].[Tags] ([TagId])
GO
ALTER TABLE [dbo].[EntityTags] CHECK CONSTRAINT [FK_EntityTags_Tags]
GO
ALTER TABLE [dbo].[FeatureFlags]  WITH CHECK ADD  CONSTRAINT [FK_FeatureFlags_Modules] FOREIGN KEY([ModuleId])
REFERENCES [dbo].[Modules] ([ModuleId])
GO
ALTER TABLE [dbo].[FeatureFlags] CHECK CONSTRAINT [FK_FeatureFlags_Modules]
GO
ALTER TABLE [dbo].[FeatureFlags]  WITH CHECK ADD  CONSTRAINT [FK_FeatureFlags_VisibilityStatuses] FOREIGN KEY([VisibilityStatusId])
REFERENCES [dbo].[FeatureVisibilityStatuses] ([VisibilityStatusId])
GO
ALTER TABLE [dbo].[FeatureFlags] CHECK CONSTRAINT [FK_FeatureFlags_VisibilityStatuses]
GO
ALTER TABLE [dbo].[FileStorage]  WITH CHECK ADD  CONSTRAINT [FK_FileStorage_DeletedBy] FOREIGN KEY([DeletedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[FileStorage] CHECK CONSTRAINT [FK_FileStorage_DeletedBy]
GO
ALTER TABLE [dbo].[FileStorage]  WITH CHECK ADD  CONSTRAINT [FK_FileStorage_UploadedBy] FOREIGN KEY([UploadedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[FileStorage] CHECK CONSTRAINT [FK_FileStorage_UploadedBy]
GO
ALTER TABLE [dbo].[GlobalSearchEntities]  WITH CHECK ADD  CONSTRAINT [FK_GlobalSearchEntities_Modules] FOREIGN KEY([ModuleId])
REFERENCES [dbo].[Modules] ([ModuleId])
GO
ALTER TABLE [dbo].[GlobalSearchEntities] CHECK CONSTRAINT [FK_GlobalSearchEntities_Modules]
GO
ALTER TABLE [dbo].[GlobalSearchEntities]  WITH CHECK ADD  CONSTRAINT [FK_GlobalSearchEntities_Permissions] FOREIGN KEY([PermissionId])
REFERENCES [dbo].[Permissions] ([PermissionId])
GO
ALTER TABLE [dbo].[GlobalSearchEntities] CHECK CONSTRAINT [FK_GlobalSearchEntities_Permissions]
GO
ALTER TABLE [dbo].[GlobalSearchEntities]  WITH CHECK ADD  CONSTRAINT [FK_GlobalSearchEntities_VisibilityStatuses] FOREIGN KEY([VisibilityStatusId])
REFERENCES [dbo].[FeatureVisibilityStatuses] ([VisibilityStatusId])
GO
ALTER TABLE [dbo].[GlobalSearchEntities] CHECK CONSTRAINT [FK_GlobalSearchEntities_VisibilityStatuses]
GO
ALTER TABLE [dbo].[ImportErrorLogs]  WITH CHECK ADD  CONSTRAINT [FK_ImportErrorLogs_ResolvedBy] FOREIGN KEY([ResolvedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ImportErrorLogs] CHECK CONSTRAINT [FK_ImportErrorLogs_ResolvedBy]
GO
ALTER TABLE [dbo].[Integrations]  WITH CHECK ADD  CONSTRAINT [FK_Integrations_VisibilityStatuses] FOREIGN KEY([VisibilityStatusId])
REFERENCES [dbo].[FeatureVisibilityStatuses] ([VisibilityStatusId])
GO
ALTER TABLE [dbo].[Integrations] CHECK CONSTRAINT [FK_Integrations_VisibilityStatuses]
GO
ALTER TABLE [dbo].[IntegrationSettings]  WITH CHECK ADD  CONSTRAINT [FK_IntegrationSettings_Integrations] FOREIGN KEY([IntegrationId])
REFERENCES [dbo].[Integrations] ([IntegrationId])
GO
ALTER TABLE [dbo].[IntegrationSettings] CHECK CONSTRAINT [FK_IntegrationSettings_Integrations]
GO
ALTER TABLE [dbo].[InventoryItemTypes]  WITH CHECK ADD  CONSTRAINT [FK_InventoryItemTypes_VisibilityStatuses] FOREIGN KEY([VisibilityStatusId])
REFERENCES [dbo].[FeatureVisibilityStatuses] ([VisibilityStatusId])
GO
ALTER TABLE [dbo].[InventoryItemTypes] CHECK CONSTRAINT [FK_InventoryItemTypes_VisibilityStatuses]
GO
ALTER TABLE [dbo].[InventoryTransactions]  WITH CHECK ADD  CONSTRAINT [FK_InventoryTransactions_CreatedBy] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[InventoryTransactions] CHECK CONSTRAINT [FK_InventoryTransactions_CreatedBy]
GO
ALTER TABLE [dbo].[InventoryTransactions]  WITH CHECK ADD  CONSTRAINT [FK_InventoryTransactions_ItemTypes] FOREIGN KEY([InventoryItemTypeId])
REFERENCES [dbo].[InventoryItemTypes] ([InventoryItemTypeId])
GO
ALTER TABLE [dbo].[InventoryTransactions] CHECK CONSTRAINT [FK_InventoryTransactions_ItemTypes]
GO
ALTER TABLE [dbo].[ITAssetAssignments]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetAssignments_Assets] FOREIGN KEY([AssetId])
REFERENCES [dbo].[ITAssets] ([AssetId])
GO
ALTER TABLE [dbo].[ITAssetAssignments] CHECK CONSTRAINT [FK_ITAssetAssignments_Assets]
GO
ALTER TABLE [dbo].[ITAssetAssignments]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetAssignments_AssignedBy] FOREIGN KEY([AssignedByUserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ITAssetAssignments] CHECK CONSTRAINT [FK_ITAssetAssignments_AssignedBy]
GO
ALTER TABLE [dbo].[ITAssetAssignments]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetAssignments_AssignedToUser] FOREIGN KEY([AssignedToUserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ITAssetAssignments] CHECK CONSTRAINT [FK_ITAssetAssignments_AssignedToUser]
GO
ALTER TABLE [dbo].[ITAssetAssignments]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetAssignments_Departments] FOREIGN KEY([DepartmentId])
REFERENCES [dbo].[Departments] ([DepartmentId])
GO
ALTER TABLE [dbo].[ITAssetAssignments] CHECK CONSTRAINT [FK_ITAssetAssignments_Departments]
GO
ALTER TABLE [dbo].[ITAssetAssignments]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetAssignments_Locations] FOREIGN KEY([LocationId])
REFERENCES [dbo].[Locations] ([LocationId])
GO
ALTER TABLE [dbo].[ITAssetAssignments] CHECK CONSTRAINT [FK_ITAssetAssignments_Locations]
GO
ALTER TABLE [dbo].[ITAssetAssignments]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetAssignments_Rooms] FOREIGN KEY([RoomId])
REFERENCES [dbo].[Rooms] ([RoomId])
GO
ALTER TABLE [dbo].[ITAssetAssignments] CHECK CONSTRAINT [FK_ITAssetAssignments_Rooms]
GO
ALTER TABLE [dbo].[ITAssetCategories]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetCategories_VisibilityStatuses] FOREIGN KEY([VisibilityStatusId])
REFERENCES [dbo].[FeatureVisibilityStatuses] ([VisibilityStatusId])
GO
ALTER TABLE [dbo].[ITAssetCategories] CHECK CONSTRAINT [FK_ITAssetCategories_VisibilityStatuses]
GO
ALTER TABLE [dbo].[ITAssetDisposals]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetDisposals_ApprovedBy] FOREIGN KEY([ApprovedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ITAssetDisposals] CHECK CONSTRAINT [FK_ITAssetDisposals_ApprovedBy]
GO
ALTER TABLE [dbo].[ITAssetDisposals]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetDisposals_Assets] FOREIGN KEY([AssetId])
REFERENCES [dbo].[ITAssets] ([AssetId])
GO
ALTER TABLE [dbo].[ITAssetDisposals] CHECK CONSTRAINT [FK_ITAssetDisposals_Assets]
GO
ALTER TABLE [dbo].[ITAssetDisposals]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetDisposals_RequestedBy] FOREIGN KEY([RequestedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ITAssetDisposals] CHECK CONSTRAINT [FK_ITAssetDisposals_RequestedBy]
GO
ALTER TABLE [dbo].[ITAssetGroupItems]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetGroupItems_AddedBy] FOREIGN KEY([AddedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ITAssetGroupItems] CHECK CONSTRAINT [FK_ITAssetGroupItems_AddedBy]
GO
ALTER TABLE [dbo].[ITAssetGroupItems]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetGroupItems_Assets] FOREIGN KEY([AssetId])
REFERENCES [dbo].[ITAssets] ([AssetId])
GO
ALTER TABLE [dbo].[ITAssetGroupItems] CHECK CONSTRAINT [FK_ITAssetGroupItems_Assets]
GO
ALTER TABLE [dbo].[ITAssetGroupItems]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetGroupItems_Groups] FOREIGN KEY([AssetGroupId])
REFERENCES [dbo].[ITAssetGroups] ([AssetGroupId])
GO
ALTER TABLE [dbo].[ITAssetGroupItems] CHECK CONSTRAINT [FK_ITAssetGroupItems_Groups]
GO
ALTER TABLE [dbo].[ITAssetGroups]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetGroups_CreatedBy] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ITAssetGroups] CHECK CONSTRAINT [FK_ITAssetGroups_CreatedBy]
GO
ALTER TABLE [dbo].[ITAssetGroups]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetGroups_Departments] FOREIGN KEY([DepartmentId])
REFERENCES [dbo].[Departments] ([DepartmentId])
GO
ALTER TABLE [dbo].[ITAssetGroups] CHECK CONSTRAINT [FK_ITAssetGroups_Departments]
GO
ALTER TABLE [dbo].[ITAssetGroups]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetGroups_Locations] FOREIGN KEY([LocationId])
REFERENCES [dbo].[Locations] ([LocationId])
GO
ALTER TABLE [dbo].[ITAssetGroups] CHECK CONSTRAINT [FK_ITAssetGroups_Locations]
GO
ALTER TABLE [dbo].[ITAssetGroups]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetGroups_Rooms] FOREIGN KEY([RoomId])
REFERENCES [dbo].[Rooms] ([RoomId])
GO
ALTER TABLE [dbo].[ITAssetGroups] CHECK CONSTRAINT [FK_ITAssetGroups_Rooms]
GO
ALTER TABLE [dbo].[ITAssetGroups]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetGroups_VisibilityStatuses] FOREIGN KEY([VisibilityStatusId])
REFERENCES [dbo].[FeatureVisibilityStatuses] ([VisibilityStatusId])
GO
ALTER TABLE [dbo].[ITAssetGroups] CHECK CONSTRAINT [FK_ITAssetGroups_VisibilityStatuses]
GO
ALTER TABLE [dbo].[ITAssetImportBatches]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetImportBatches_UploadedBy] FOREIGN KEY([UploadedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ITAssetImportBatches] CHECK CONSTRAINT [FK_ITAssetImportBatches_UploadedBy]
GO
ALTER TABLE [dbo].[ITAssetImportStaging]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetImportStaging_Batch] FOREIGN KEY([ImportBatchId])
REFERENCES [dbo].[ITAssetImportBatches] ([ITAssetImportBatchId])
GO
ALTER TABLE [dbo].[ITAssetImportStaging] CHECK CONSTRAINT [FK_ITAssetImportStaging_Batch]
GO
ALTER TABLE [dbo].[ITAssetImportStaging]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetImportStaging_Brand] FOREIGN KEY([ResolvedBrandId])
REFERENCES [dbo].[ITAssetBrands] ([ITAssetBrandId])
GO
ALTER TABLE [dbo].[ITAssetImportStaging] CHECK CONSTRAINT [FK_ITAssetImportStaging_Brand]
GO
ALTER TABLE [dbo].[ITAssetImportStaging]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetImportStaging_Category] FOREIGN KEY([ResolvedCategoryId])
REFERENCES [dbo].[ITAssetCategories] ([ITAssetCategoryId])
GO
ALTER TABLE [dbo].[ITAssetImportStaging] CHECK CONSTRAINT [FK_ITAssetImportStaging_Category]
GO
ALTER TABLE [dbo].[ITAssetImportStaging]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetImportStaging_Condition] FOREIGN KEY([ResolvedConditionId])
REFERENCES [dbo].[ITAssetConditions] ([ITAssetConditionId])
GO
ALTER TABLE [dbo].[ITAssetImportStaging] CHECK CONSTRAINT [FK_ITAssetImportStaging_Condition]
GO
ALTER TABLE [dbo].[ITAssetImportStaging]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetImportStaging_Department] FOREIGN KEY([ResolvedDepartmentId])
REFERENCES [dbo].[Departments] ([DepartmentId])
GO
ALTER TABLE [dbo].[ITAssetImportStaging] CHECK CONSTRAINT [FK_ITAssetImportStaging_Department]
GO
ALTER TABLE [dbo].[ITAssetImportStaging]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetImportStaging_Location] FOREIGN KEY([ResolvedLocationId])
REFERENCES [dbo].[Locations] ([LocationId])
GO
ALTER TABLE [dbo].[ITAssetImportStaging] CHECK CONSTRAINT [FK_ITAssetImportStaging_Location]
GO
ALTER TABLE [dbo].[ITAssetImportStaging]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetImportStaging_MatchedUser] FOREIGN KEY([MatchedUserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ITAssetImportStaging] CHECK CONSTRAINT [FK_ITAssetImportStaging_MatchedUser]
GO
ALTER TABLE [dbo].[ITAssetImportStaging]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetImportStaging_Model] FOREIGN KEY([ResolvedModelId])
REFERENCES [dbo].[ITAssetModels] ([ITAssetModelId])
GO
ALTER TABLE [dbo].[ITAssetImportStaging] CHECK CONSTRAINT [FK_ITAssetImportStaging_Model]
GO
ALTER TABLE [dbo].[ITAssetImportStaging]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetImportStaging_Room] FOREIGN KEY([ResolvedRoomId])
REFERENCES [dbo].[Rooms] ([RoomId])
GO
ALTER TABLE [dbo].[ITAssetImportStaging] CHECK CONSTRAINT [FK_ITAssetImportStaging_Room]
GO
ALTER TABLE [dbo].[ITAssetImportStaging]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetImportStaging_Status] FOREIGN KEY([ResolvedStatusId])
REFERENCES [dbo].[ITAssetStatuses] ([ITAssetStatusId])
GO
ALTER TABLE [dbo].[ITAssetImportStaging] CHECK CONSTRAINT [FK_ITAssetImportStaging_Status]
GO
ALTER TABLE [dbo].[ITAssetIssueCategories]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetIssueCategories_AssetCategories] FOREIGN KEY([ITAssetCategoryId])
REFERENCES [dbo].[ITAssetCategories] ([ITAssetCategoryId])
GO
ALTER TABLE [dbo].[ITAssetIssueCategories] CHECK CONSTRAINT [FK_ITAssetIssueCategories_AssetCategories]
GO
ALTER TABLE [dbo].[ITAssetIssueLogs]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetIssueLogs_Assets] FOREIGN KEY([AssetId])
REFERENCES [dbo].[ITAssets] ([AssetId])
GO
ALTER TABLE [dbo].[ITAssetIssueLogs] CHECK CONSTRAINT [FK_ITAssetIssueLogs_Assets]
GO
ALTER TABLE [dbo].[ITAssetIssueLogs]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetIssueLogs_AssignedTo] FOREIGN KEY([AssignedToUserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ITAssetIssueLogs] CHECK CONSTRAINT [FK_ITAssetIssueLogs_AssignedTo]
GO
ALTER TABLE [dbo].[ITAssetIssueLogs]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetIssueLogs_IssueTypes] FOREIGN KEY([IssueTypeId])
REFERENCES [dbo].[ITAssetIssueTypes] ([IssueTypeId])
GO
ALTER TABLE [dbo].[ITAssetIssueLogs] CHECK CONSTRAINT [FK_ITAssetIssueLogs_IssueTypes]
GO
ALTER TABLE [dbo].[ITAssetIssueLogs]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetIssueLogs_ReportedBy] FOREIGN KEY([ReportedByUserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ITAssetIssueLogs] CHECK CONSTRAINT [FK_ITAssetIssueLogs_ReportedBy]
GO
ALTER TABLE [dbo].[ITAssetIssueTypes]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetIssueTypes_Categories] FOREIGN KEY([IssueCategoryId])
REFERENCES [dbo].[ITAssetIssueCategories] ([IssueCategoryId])
GO
ALTER TABLE [dbo].[ITAssetIssueTypes] CHECK CONSTRAINT [FK_ITAssetIssueTypes_Categories]
GO
ALTER TABLE [dbo].[ITAssetLaptopDetails]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetLaptopDetails_Assets] FOREIGN KEY([AssetId])
REFERENCES [dbo].[ITAssets] ([AssetId])
GO
ALTER TABLE [dbo].[ITAssetLaptopDetails] CHECK CONSTRAINT [FK_ITAssetLaptopDetails_Assets]
GO
ALTER TABLE [dbo].[ITAssetMaintenanceLogs]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetMaintenanceLogs_Assets] FOREIGN KEY([AssetId])
REFERENCES [dbo].[ITAssets] ([AssetId])
GO
ALTER TABLE [dbo].[ITAssetMaintenanceLogs] CHECK CONSTRAINT [FK_ITAssetMaintenanceLogs_Assets]
GO
ALTER TABLE [dbo].[ITAssetMaintenanceLogs]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetMaintenanceLogs_PerformedBy] FOREIGN KEY([PerformedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ITAssetMaintenanceLogs] CHECK CONSTRAINT [FK_ITAssetMaintenanceLogs_PerformedBy]
GO
ALTER TABLE [dbo].[ITAssetModels]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetModels_Brands] FOREIGN KEY([ITAssetBrandId])
REFERENCES [dbo].[ITAssetBrands] ([ITAssetBrandId])
GO
ALTER TABLE [dbo].[ITAssetModels] CHECK CONSTRAINT [FK_ITAssetModels_Brands]
GO
ALTER TABLE [dbo].[ITAssetModels]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetModels_Categories] FOREIGN KEY([ITAssetCategoryId])
REFERENCES [dbo].[ITAssetCategories] ([ITAssetCategoryId])
GO
ALTER TABLE [dbo].[ITAssetModels] CHECK CONSTRAINT [FK_ITAssetModels_Categories]
GO
ALTER TABLE [dbo].[ITAssetNeededLaptops]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetNeededLaptops_MatchedUser] FOREIGN KEY([MatchedUserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ITAssetNeededLaptops] CHECK CONSTRAINT [FK_ITAssetNeededLaptops_MatchedUser]
GO
ALTER TABLE [dbo].[ITAssetNetworkDetails]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetNetworkDetails_Assets] FOREIGN KEY([AssetId])
REFERENCES [dbo].[ITAssets] ([AssetId])
GO
ALTER TABLE [dbo].[ITAssetNetworkDetails] CHECK CONSTRAINT [FK_ITAssetNetworkDetails_Assets]
GO
ALTER TABLE [dbo].[ITAssetNotes]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetNotes_Assets] FOREIGN KEY([AssetId])
REFERENCES [dbo].[ITAssets] ([AssetId])
GO
ALTER TABLE [dbo].[ITAssetNotes] CHECK CONSTRAINT [FK_ITAssetNotes_Assets]
GO
ALTER TABLE [dbo].[ITAssetNotes]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetNotes_CreatedBy] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ITAssetNotes] CHECK CONSTRAINT [FK_ITAssetNotes_CreatedBy]
GO
ALTER TABLE [dbo].[ITAssetNotes]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetNotes_NoteTypes] FOREIGN KEY([NoteTypeId])
REFERENCES [dbo].[ITAssetNoteTypes] ([NoteTypeId])
GO
ALTER TABLE [dbo].[ITAssetNotes] CHECK CONSTRAINT [FK_ITAssetNotes_NoteTypes]
GO
ALTER TABLE [dbo].[ITAssetPhoneDetails]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetPhoneDetails_Assets] FOREIGN KEY([AssetId])
REFERENCES [dbo].[ITAssets] ([AssetId])
GO
ALTER TABLE [dbo].[ITAssetPhoneDetails] CHECK CONSTRAINT [FK_ITAssetPhoneDetails_Assets]
GO
ALTER TABLE [dbo].[ITAssetPrinterCopierDetails]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetPrinterCopierDetails_Assets] FOREIGN KEY([AssetId])
REFERENCES [dbo].[ITAssets] ([AssetId])
GO
ALTER TABLE [dbo].[ITAssetPrinterCopierDetails] CHECK CONSTRAINT [FK_ITAssetPrinterCopierDetails_Assets]
GO
ALTER TABLE [dbo].[ITAssetProjectorDetails]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetProjectorDetails_Assets] FOREIGN KEY([AssetId])
REFERENCES [dbo].[ITAssets] ([AssetId])
GO
ALTER TABLE [dbo].[ITAssetProjectorDetails] CHECK CONSTRAINT [FK_ITAssetProjectorDetails_Assets]
GO
ALTER TABLE [dbo].[ITAssets]  WITH CHECK ADD  CONSTRAINT [FK_ITAssets_Categories] FOREIGN KEY([ITAssetCategoryId])
REFERENCES [dbo].[ITAssetCategories] ([ITAssetCategoryId])
GO
ALTER TABLE [dbo].[ITAssets] CHECK CONSTRAINT [FK_ITAssets_Categories]
GO
ALTER TABLE [dbo].[ITAssets]  WITH CHECK ADD  CONSTRAINT [FK_ITAssets_Conditions] FOREIGN KEY([ITAssetConditionId])
REFERENCES [dbo].[ITAssetConditions] ([ITAssetConditionId])
GO
ALTER TABLE [dbo].[ITAssets] CHECK CONSTRAINT [FK_ITAssets_Conditions]
GO
ALTER TABLE [dbo].[ITAssets]  WITH CHECK ADD  CONSTRAINT [FK_ITAssets_CurrentAssignedUser] FOREIGN KEY([CurrentAssignedUserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ITAssets] CHECK CONSTRAINT [FK_ITAssets_CurrentAssignedUser]
GO
ALTER TABLE [dbo].[ITAssets]  WITH CHECK ADD  CONSTRAINT [FK_ITAssets_CurrentDepartment] FOREIGN KEY([CurrentDepartmentId])
REFERENCES [dbo].[Departments] ([DepartmentId])
GO
ALTER TABLE [dbo].[ITAssets] CHECK CONSTRAINT [FK_ITAssets_CurrentDepartment]
GO
ALTER TABLE [dbo].[ITAssets]  WITH CHECK ADD  CONSTRAINT [FK_ITAssets_CurrentLocation] FOREIGN KEY([CurrentLocationId])
REFERENCES [dbo].[Locations] ([LocationId])
GO
ALTER TABLE [dbo].[ITAssets] CHECK CONSTRAINT [FK_ITAssets_CurrentLocation]
GO
ALTER TABLE [dbo].[ITAssets]  WITH CHECK ADD  CONSTRAINT [FK_ITAssets_CurrentRoom] FOREIGN KEY([CurrentRoomId])
REFERENCES [dbo].[Rooms] ([RoomId])
GO
ALTER TABLE [dbo].[ITAssets] CHECK CONSTRAINT [FK_ITAssets_CurrentRoom]
GO
ALTER TABLE [dbo].[ITAssets]  WITH CHECK ADD  CONSTRAINT [FK_ITAssets_DeletedBy] FOREIGN KEY([DeletedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ITAssets] CHECK CONSTRAINT [FK_ITAssets_DeletedBy]
GO
ALTER TABLE [dbo].[ITAssets]  WITH CHECK ADD  CONSTRAINT [FK_ITAssets_Models] FOREIGN KEY([ITAssetModelId])
REFERENCES [dbo].[ITAssetModels] ([ITAssetModelId])
GO
ALTER TABLE [dbo].[ITAssets] CHECK CONSTRAINT [FK_ITAssets_Models]
GO
ALTER TABLE [dbo].[ITAssets]  WITH CHECK ADD  CONSTRAINT [FK_ITAssets_Schools] FOREIGN KEY([SchoolId])
REFERENCES [dbo].[Schools] ([SchoolId])
GO
ALTER TABLE [dbo].[ITAssets] CHECK CONSTRAINT [FK_ITAssets_Schools]
GO
ALTER TABLE [dbo].[ITAssets]  WITH CHECK ADD  CONSTRAINT [FK_ITAssets_Statuses] FOREIGN KEY([ITAssetStatusId])
REFERENCES [dbo].[ITAssetStatuses] ([ITAssetStatusId])
GO
ALTER TABLE [dbo].[ITAssets] CHECK CONSTRAINT [FK_ITAssets_Statuses]
GO
ALTER TABLE [dbo].[ITAssetStatusHistory]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetStatusHistory_Assets] FOREIGN KEY([AssetId])
REFERENCES [dbo].[ITAssets] ([AssetId])
GO
ALTER TABLE [dbo].[ITAssetStatusHistory] CHECK CONSTRAINT [FK_ITAssetStatusHistory_Assets]
GO
ALTER TABLE [dbo].[ITAssetStatusHistory]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetStatusHistory_ChangedBy] FOREIGN KEY([ChangedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ITAssetStatusHistory] CHECK CONSTRAINT [FK_ITAssetStatusHistory_ChangedBy]
GO
ALTER TABLE [dbo].[ITAssetStatusHistory]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetStatusHistory_NewStatus] FOREIGN KEY([NewStatusId])
REFERENCES [dbo].[ITAssetStatuses] ([ITAssetStatusId])
GO
ALTER TABLE [dbo].[ITAssetStatusHistory] CHECK CONSTRAINT [FK_ITAssetStatusHistory_NewStatus]
GO
ALTER TABLE [dbo].[ITAssetStatusHistory]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetStatusHistory_OldStatus] FOREIGN KEY([OldStatusId])
REFERENCES [dbo].[ITAssetStatuses] ([ITAssetStatusId])
GO
ALTER TABLE [dbo].[ITAssetStatusHistory] CHECK CONSTRAINT [FK_ITAssetStatusHistory_OldStatus]
GO
ALTER TABLE [dbo].[ITAssetTransferRequests]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetTransferRequests_ApprovedBy] FOREIGN KEY([ApprovedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ITAssetTransferRequests] CHECK CONSTRAINT [FK_ITAssetTransferRequests_ApprovedBy]
GO
ALTER TABLE [dbo].[ITAssetTransferRequests]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetTransferRequests_Assets] FOREIGN KEY([AssetId])
REFERENCES [dbo].[ITAssets] ([AssetId])
GO
ALTER TABLE [dbo].[ITAssetTransferRequests] CHECK CONSTRAINT [FK_ITAssetTransferRequests_Assets]
GO
ALTER TABLE [dbo].[ITAssetTransferRequests]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetTransferRequests_FromDepartment] FOREIGN KEY([FromDepartmentId])
REFERENCES [dbo].[Departments] ([DepartmentId])
GO
ALTER TABLE [dbo].[ITAssetTransferRequests] CHECK CONSTRAINT [FK_ITAssetTransferRequests_FromDepartment]
GO
ALTER TABLE [dbo].[ITAssetTransferRequests]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetTransferRequests_FromLocation] FOREIGN KEY([FromLocationId])
REFERENCES [dbo].[Locations] ([LocationId])
GO
ALTER TABLE [dbo].[ITAssetTransferRequests] CHECK CONSTRAINT [FK_ITAssetTransferRequests_FromLocation]
GO
ALTER TABLE [dbo].[ITAssetTransferRequests]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetTransferRequests_FromRoom] FOREIGN KEY([FromRoomId])
REFERENCES [dbo].[Rooms] ([RoomId])
GO
ALTER TABLE [dbo].[ITAssetTransferRequests] CHECK CONSTRAINT [FK_ITAssetTransferRequests_FromRoom]
GO
ALTER TABLE [dbo].[ITAssetTransferRequests]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetTransferRequests_FromUser] FOREIGN KEY([FromUserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ITAssetTransferRequests] CHECK CONSTRAINT [FK_ITAssetTransferRequests_FromUser]
GO
ALTER TABLE [dbo].[ITAssetTransferRequests]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetTransferRequests_RequestedBy] FOREIGN KEY([RequestedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ITAssetTransferRequests] CHECK CONSTRAINT [FK_ITAssetTransferRequests_RequestedBy]
GO
ALTER TABLE [dbo].[ITAssetTransferRequests]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetTransferRequests_ToDepartment] FOREIGN KEY([ToDepartmentId])
REFERENCES [dbo].[Departments] ([DepartmentId])
GO
ALTER TABLE [dbo].[ITAssetTransferRequests] CHECK CONSTRAINT [FK_ITAssetTransferRequests_ToDepartment]
GO
ALTER TABLE [dbo].[ITAssetTransferRequests]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetTransferRequests_ToLocation] FOREIGN KEY([ToLocationId])
REFERENCES [dbo].[Locations] ([LocationId])
GO
ALTER TABLE [dbo].[ITAssetTransferRequests] CHECK CONSTRAINT [FK_ITAssetTransferRequests_ToLocation]
GO
ALTER TABLE [dbo].[ITAssetTransferRequests]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetTransferRequests_ToRoom] FOREIGN KEY([ToRoomId])
REFERENCES [dbo].[Rooms] ([RoomId])
GO
ALTER TABLE [dbo].[ITAssetTransferRequests] CHECK CONSTRAINT [FK_ITAssetTransferRequests_ToRoom]
GO
ALTER TABLE [dbo].[ITAssetTransferRequests]  WITH CHECK ADD  CONSTRAINT [FK_ITAssetTransferRequests_ToUser] FOREIGN KEY([ToUserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ITAssetTransferRequests] CHECK CONSTRAINT [FK_ITAssetTransferRequests_ToUser]
GO
ALTER TABLE [dbo].[ITTickets]  WITH CHECK ADD  CONSTRAINT [FK_ITTickets_AssignedTo] FOREIGN KEY([AssignedTo])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ITTickets] CHECK CONSTRAINT [FK_ITTickets_AssignedTo]
GO
ALTER TABLE [dbo].[ITTickets]  WITH CHECK ADD  CONSTRAINT [FK_ITTickets_DeletedBy] FOREIGN KEY([DeletedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ITTickets] CHECK CONSTRAINT [FK_ITTickets_DeletedBy]
GO
ALTER TABLE [dbo].[ITTickets]  WITH CHECK ADD  CONSTRAINT [FK_ITTickets_RelatedAsset] FOREIGN KEY([RelatedAssetId])
REFERENCES [dbo].[ITAssets] ([AssetId])
GO
ALTER TABLE [dbo].[ITTickets] CHECK CONSTRAINT [FK_ITTickets_RelatedAsset]
GO
ALTER TABLE [dbo].[ITTickets]  WITH CHECK ADD  CONSTRAINT [FK_ITTickets_RequestedBy] FOREIGN KEY([RequestedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ITTickets] CHECK CONSTRAINT [FK_ITTickets_RequestedBy]
GO
ALTER TABLE [dbo].[KPIDefinitions]  WITH CHECK ADD  CONSTRAINT [FK_KPIDefinitions_Modules] FOREIGN KEY([ModuleId])
REFERENCES [dbo].[Modules] ([ModuleId])
GO
ALTER TABLE [dbo].[KPIDefinitions] CHECK CONSTRAINT [FK_KPIDefinitions_Modules]
GO
ALTER TABLE [dbo].[KPIDefinitions]  WITH CHECK ADD  CONSTRAINT [FK_KPIDefinitions_VisibilityStatuses] FOREIGN KEY([VisibilityStatusId])
REFERENCES [dbo].[FeatureVisibilityStatuses] ([VisibilityStatusId])
GO
ALTER TABLE [dbo].[KPIDefinitions] CHECK CONSTRAINT [FK_KPIDefinitions_VisibilityStatuses]
GO
ALTER TABLE [dbo].[Locations]  WITH CHECK ADD  CONSTRAINT [FK_Locations_Buildings] FOREIGN KEY([BuildingId])
REFERENCES [dbo].[Buildings] ([BuildingId])
GO
ALTER TABLE [dbo].[Locations] CHECK CONSTRAINT [FK_Locations_Buildings]
GO
ALTER TABLE [dbo].[LoginHistory]  WITH CHECK ADD  CONSTRAINT [FK_LoginHistory_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[LoginHistory] CHECK CONSTRAINT [FK_LoginHistory_Users]
GO
ALTER TABLE [dbo].[LookupCategories]  WITH CHECK ADD  CONSTRAINT [FK_LookupCategories_Modules] FOREIGN KEY([ModuleId])
REFERENCES [dbo].[Modules] ([ModuleId])
GO
ALTER TABLE [dbo].[LookupCategories] CHECK CONSTRAINT [FK_LookupCategories_Modules]
GO
ALTER TABLE [dbo].[LookupValues]  WITH CHECK ADD  CONSTRAINT [FK_LookupValues_Categories] FOREIGN KEY([LookupCategoryId])
REFERENCES [dbo].[LookupCategories] ([LookupCategoryId])
GO
ALTER TABLE [dbo].[LookupValues] CHECK CONSTRAINT [FK_LookupValues_Categories]
GO
ALTER TABLE [dbo].[LookupValues]  WITH CHECK ADD  CONSTRAINT [FK_LookupValues_Parent] FOREIGN KEY([ParentLookupValueId])
REFERENCES [dbo].[LookupValues] ([LookupValueId])
GO
ALTER TABLE [dbo].[LookupValues] CHECK CONSTRAINT [FK_LookupValues_Parent]
GO
ALTER TABLE [dbo].[MenuGroupItems]  WITH CHECK ADD  CONSTRAINT [FK_MenuGroupItems_MenuGroups] FOREIGN KEY([MenuGroupId])
REFERENCES [dbo].[MenuGroups] ([MenuGroupId])
GO
ALTER TABLE [dbo].[MenuGroupItems] CHECK CONSTRAINT [FK_MenuGroupItems_MenuGroups]
GO
ALTER TABLE [dbo].[MenuGroupItems]  WITH CHECK ADD  CONSTRAINT [FK_MenuGroupItems_Menus] FOREIGN KEY([MenuId])
REFERENCES [dbo].[Menus] ([MenuId])
GO
ALTER TABLE [dbo].[MenuGroupItems] CHECK CONSTRAINT [FK_MenuGroupItems_Menus]
GO
ALTER TABLE [dbo].[MenuGroups]  WITH CHECK ADD  CONSTRAINT [FK_MenuGroups_VisibilityStatuses] FOREIGN KEY([VisibilityStatusId])
REFERENCES [dbo].[FeatureVisibilityStatuses] ([VisibilityStatusId])
GO
ALTER TABLE [dbo].[MenuGroups] CHECK CONSTRAINT [FK_MenuGroups_VisibilityStatuses]
GO
ALTER TABLE [dbo].[MenuGroups]  WITH CHECK ADD  CONSTRAINT [FK_MenuGroups_Workspaces] FOREIGN KEY([WorkspaceId])
REFERENCES [dbo].[Workspaces] ([WorkspaceId])
GO
ALTER TABLE [dbo].[MenuGroups] CHECK CONSTRAINT [FK_MenuGroups_Workspaces]
GO
ALTER TABLE [dbo].[Menus]  WITH CHECK ADD  CONSTRAINT [FK_Menus_FeatureFlags] FOREIGN KEY([FeatureFlagId])
REFERENCES [dbo].[FeatureFlags] ([FeatureFlagId])
GO
ALTER TABLE [dbo].[Menus] CHECK CONSTRAINT [FK_Menus_FeatureFlags]
GO
ALTER TABLE [dbo].[Menus]  WITH CHECK ADD  CONSTRAINT [FK_Menus_Modules] FOREIGN KEY([ModuleId])
REFERENCES [dbo].[Modules] ([ModuleId])
GO
ALTER TABLE [dbo].[Menus] CHECK CONSTRAINT [FK_Menus_Modules]
GO
ALTER TABLE [dbo].[Menus]  WITH CHECK ADD  CONSTRAINT [FK_Menus_Parent] FOREIGN KEY([ParentMenuId])
REFERENCES [dbo].[Menus] ([MenuId])
GO
ALTER TABLE [dbo].[Menus] CHECK CONSTRAINT [FK_Menus_Parent]
GO
ALTER TABLE [dbo].[Menus]  WITH CHECK ADD  CONSTRAINT [FK_Menus_Permissions] FOREIGN KEY([PermissionId])
REFERENCES [dbo].[Permissions] ([PermissionId])
GO
ALTER TABLE [dbo].[Menus] CHECK CONSTRAINT [FK_Menus_Permissions]
GO
ALTER TABLE [dbo].[Menus]  WITH CHECK ADD  CONSTRAINT [FK_Menus_VisibilityStatuses] FOREIGN KEY([VisibilityStatusId])
REFERENCES [dbo].[FeatureVisibilityStatuses] ([VisibilityStatusId])
GO
ALTER TABLE [dbo].[Menus] CHECK CONSTRAINT [FK_Menus_VisibilityStatuses]
GO
ALTER TABLE [dbo].[Menus]  WITH CHECK ADD  CONSTRAINT [FK_Menus_Workspaces] FOREIGN KEY([WorkspaceId])
REFERENCES [dbo].[Workspaces] ([WorkspaceId])
GO
ALTER TABLE [dbo].[Menus] CHECK CONSTRAINT [FK_Menus_Workspaces]
GO
ALTER TABLE [dbo].[Modules]  WITH CHECK ADD  CONSTRAINT [FK_Modules_VisibilityStatuses] FOREIGN KEY([VisibilityStatusId])
REFERENCES [dbo].[FeatureVisibilityStatuses] ([VisibilityStatusId])
GO
ALTER TABLE [dbo].[Modules] CHECK CONSTRAINT [FK_Modules_VisibilityStatuses]
GO
ALTER TABLE [dbo].[Notifications]  WITH CHECK ADD  CONSTRAINT [FK_Notifications_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[Notifications] CHECK CONSTRAINT [FK_Notifications_Users]
GO
ALTER TABLE [dbo].[PaperDistributions]  WITH CHECK ADD  CONSTRAINT [FK_PaperDistributions_Departments] FOREIGN KEY([DepartmentId])
REFERENCES [dbo].[Departments] ([DepartmentId])
GO
ALTER TABLE [dbo].[PaperDistributions] CHECK CONSTRAINT [FK_PaperDistributions_Departments]
GO
ALTER TABLE [dbo].[PaperDistributions]  WITH CHECK ADD  CONSTRAINT [FK_PaperDistributions_RequestedBy] FOREIGN KEY([RequestedByUserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[PaperDistributions] CHECK CONSTRAINT [FK_PaperDistributions_RequestedBy]
GO
ALTER TABLE [dbo].[PaperPurchases]  WITH CHECK ADD  CONSTRAINT [FK_PaperPurchases_CreatedBy] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[PaperPurchases] CHECK CONSTRAINT [FK_PaperPurchases_CreatedBy]
GO
ALTER TABLE [dbo].[PasswordResetTokens]  WITH CHECK ADD  CONSTRAINT [FK_PasswordResetTokens_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[PasswordResetTokens] CHECK CONSTRAINT [FK_PasswordResetTokens_Users]
GO
ALTER TABLE [dbo].[Permissions]  WITH CHECK ADD  CONSTRAINT [FK_Permissions_Modules] FOREIGN KEY([ModuleId])
REFERENCES [dbo].[Modules] ([ModuleId])
GO
ALTER TABLE [dbo].[Permissions] CHECK CONSTRAINT [FK_Permissions_Modules]
GO
ALTER TABLE [dbo].[PhotocopyRequests]  WITH CHECK ADD  CONSTRAINT [FK_PhotocopyRequests_CurrentApprover] FOREIGN KEY([CurrentApproverId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[PhotocopyRequests] CHECK CONSTRAINT [FK_PhotocopyRequests_CurrentApprover]
GO
ALTER TABLE [dbo].[PhotocopyRequests]  WITH CHECK ADD  CONSTRAINT [FK_PhotocopyRequests_ClaimedBy] FOREIGN KEY([ClaimedByUserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[PhotocopyRequests] CHECK CONSTRAINT [FK_PhotocopyRequests_ClaimedBy]
GO
ALTER TABLE [dbo].[PhotocopyRequests]  WITH CHECK ADD  CONSTRAINT [FK_PhotocopyRequests_DeletedBy] FOREIGN KEY([DeletedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[PhotocopyRequests] CHECK CONSTRAINT [FK_PhotocopyRequests_DeletedBy]
GO
ALTER TABLE [dbo].[PhotocopyRequests]  WITH CHECK ADD  CONSTRAINT [FK_PhotocopyRequests_Departments] FOREIGN KEY([DepartmentId])
REFERENCES [dbo].[Departments] ([DepartmentId])
GO
ALTER TABLE [dbo].[PhotocopyRequests] CHECK CONSTRAINT [FK_PhotocopyRequests_Departments]
GO
ALTER TABLE [dbo].[PhotocopyRequests]  WITH CHECK ADD  CONSTRAINT [FK_PhotocopyRequests_Purposes] FOREIGN KEY([PurposeId])
REFERENCES [dbo].[Purposes] ([PurposeId])
GO
ALTER TABLE [dbo].[PhotocopyRequests] CHECK CONSTRAINT [FK_PhotocopyRequests_Purposes]
GO
ALTER TABLE [dbo].[PhotocopyRequests]  WITH CHECK ADD  CONSTRAINT [FK_PhotocopyRequests_Schools] FOREIGN KEY([SchoolId])
REFERENCES [dbo].[Schools] ([SchoolId])
GO
ALTER TABLE [dbo].[PhotocopyRequests] CHECK CONSTRAINT [FK_PhotocopyRequests_Schools]
GO
ALTER TABLE [dbo].[PhotocopyRequests]  WITH CHECK ADD  CONSTRAINT [FK_PhotocopyRequests_Sections] FOREIGN KEY([SectionId])
REFERENCES [dbo].[Sections] ([SectionId])
GO
ALTER TABLE [dbo].[PhotocopyRequests] CHECK CONSTRAINT [FK_PhotocopyRequests_Sections]
GO
ALTER TABLE [dbo].[PhotocopyRequests]  WITH CHECK ADD  CONSTRAINT [FK_PhotocopyRequests_Subjects] FOREIGN KEY([SubjectId])
REFERENCES [dbo].[Subjects] ([SubjectId])
GO
ALTER TABLE [dbo].[PhotocopyRequests] CHECK CONSTRAINT [FK_PhotocopyRequests_Subjects]
GO
ALTER TABLE [dbo].[PhotocopyRequests]  WITH CHECK ADD  CONSTRAINT [FK_PhotocopyRequests_Teacher] FOREIGN KEY([TeacherId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[PhotocopyRequests] CHECK CONSTRAINT [FK_PhotocopyRequests_Teacher]
GO
ALTER TABLE [dbo].[PrinterMeterReadings]  WITH CHECK ADD  CONSTRAINT [FK_PrinterMeterReadings_Assets] FOREIGN KEY([PrinterAssetId])
REFERENCES [dbo].[ITAssets] ([AssetId])
GO
ALTER TABLE [dbo].[PrinterMeterReadings] CHECK CONSTRAINT [FK_PrinterMeterReadings_Assets]
GO
ALTER TABLE [dbo].[PrinterMeterReadings]  WITH CHECK ADD  CONSTRAINT [FK_PrinterMeterReadings_RecordedBy] FOREIGN KEY([RecordedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[PrinterMeterReadings] CHECK CONSTRAINT [FK_PrinterMeterReadings_RecordedBy]
GO
ALTER TABLE [dbo].[PrintingLogs]  WITH CHECK ADD  CONSTRAINT [FK_PrintingLogs_PrintedBy] FOREIGN KEY([PrintedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[PrintingLogs] CHECK CONSTRAINT [FK_PrintingLogs_PrintedBy]
GO
ALTER TABLE [dbo].[PrintingWorkflowEvents]  WITH CHECK ADD  CONSTRAINT [FK_PrintingWorkflowEvents_Request] FOREIGN KEY([RequestId])
REFERENCES [dbo].[PhotocopyRequests] ([RequestId])
GO
ALTER TABLE [dbo].[PrintingWorkflowEvents] CHECK CONSTRAINT [FK_PrintingWorkflowEvents_Request]
GO
ALTER TABLE [dbo].[PrintingWorkflowEvents]  WITH CHECK ADD  CONSTRAINT [FK_PrintingWorkflowEvents_Actor] FOREIGN KEY([ActorUserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[PrintingWorkflowEvents] CHECK CONSTRAINT [FK_PrintingWorkflowEvents_Actor]
GO
ALTER TABLE [dbo].[PrintingJobConsumptions]  WITH CHECK ADD  CONSTRAINT [FK_PrintingJobConsumptions_Request] FOREIGN KEY([RequestId])
REFERENCES [dbo].[PhotocopyRequests] ([RequestId])
GO
ALTER TABLE [dbo].[PrintingJobConsumptions] CHECK CONSTRAINT [FK_PrintingJobConsumptions_Request]
GO
ALTER TABLE [dbo].[PrintingJobConsumptions]  WITH CHECK ADD  CONSTRAINT [FK_PrintingJobConsumptions_User] FOREIGN KEY([RecordedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[PrintingJobConsumptions] CHECK CONSTRAINT [FK_PrintingJobConsumptions_User]
GO
ALTER TABLE [dbo].[PrintingLogs]  WITH CHECK ADD  CONSTRAINT [FK_PrintingLogs_PrinterAsset] FOREIGN KEY([PrinterAssetId])
REFERENCES [dbo].[ITAssets] ([AssetId])
GO
ALTER TABLE [dbo].[PrintingLogs] CHECK CONSTRAINT [FK_PrintingLogs_PrinterAsset]
GO
ALTER TABLE [dbo].[PrintingLogs]  WITH CHECK ADD  CONSTRAINT [FK_PrintingLogs_Requests] FOREIGN KEY([RequestId])
REFERENCES [dbo].[PhotocopyRequests] ([RequestId])
GO
ALTER TABLE [dbo].[PrintingLogs] CHECK CONSTRAINT [FK_PrintingLogs_Requests]
GO
ALTER TABLE [dbo].[QuickActions]  WITH CHECK ADD  CONSTRAINT [FK_QuickActions_FeatureFlags] FOREIGN KEY([FeatureFlagId])
REFERENCES [dbo].[FeatureFlags] ([FeatureFlagId])
GO
ALTER TABLE [dbo].[QuickActions] CHECK CONSTRAINT [FK_QuickActions_FeatureFlags]
GO
ALTER TABLE [dbo].[QuickActions]  WITH CHECK ADD  CONSTRAINT [FK_QuickActions_Modules] FOREIGN KEY([ModuleId])
REFERENCES [dbo].[Modules] ([ModuleId])
GO
ALTER TABLE [dbo].[QuickActions] CHECK CONSTRAINT [FK_QuickActions_Modules]
GO
ALTER TABLE [dbo].[QuickActions]  WITH CHECK ADD  CONSTRAINT [FK_QuickActions_Permissions] FOREIGN KEY([PermissionId])
REFERENCES [dbo].[Permissions] ([PermissionId])
GO
ALTER TABLE [dbo].[QuickActions] CHECK CONSTRAINT [FK_QuickActions_Permissions]
GO
ALTER TABLE [dbo].[QuickActions]  WITH CHECK ADD  CONSTRAINT [FK_QuickActions_VisibilityStatuses] FOREIGN KEY([VisibilityStatusId])
REFERENCES [dbo].[FeatureVisibilityStatuses] ([VisibilityStatusId])
GO
ALTER TABLE [dbo].[QuickActions] CHECK CONSTRAINT [FK_QuickActions_VisibilityStatuses]
GO
ALTER TABLE [dbo].[ReportDefinitions]  WITH CHECK ADD  CONSTRAINT [FK_ReportDefinitions_CreatedBy] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[ReportDefinitions] CHECK CONSTRAINT [FK_ReportDefinitions_CreatedBy]
GO
ALTER TABLE [dbo].[ReportDefinitions]  WITH CHECK ADD  CONSTRAINT [FK_ReportDefinitions_Modules] FOREIGN KEY([ModuleId])
REFERENCES [dbo].[Modules] ([ModuleId])
GO
ALTER TABLE [dbo].[ReportDefinitions] CHECK CONSTRAINT [FK_ReportDefinitions_Modules]
GO
ALTER TABLE [dbo].[ReportDefinitions]  WITH CHECK ADD  CONSTRAINT [FK_ReportDefinitions_Permissions] FOREIGN KEY([PermissionId])
REFERENCES [dbo].[Permissions] ([PermissionId])
GO
ALTER TABLE [dbo].[ReportDefinitions] CHECK CONSTRAINT [FK_ReportDefinitions_Permissions]
GO
ALTER TABLE [dbo].[ReportDefinitions]  WITH CHECK ADD  CONSTRAINT [FK_ReportDefinitions_VisibilityStatuses] FOREIGN KEY([VisibilityStatusId])
REFERENCES [dbo].[FeatureVisibilityStatuses] ([VisibilityStatusId])
GO
ALTER TABLE [dbo].[ReportDefinitions] CHECK CONSTRAINT [FK_ReportDefinitions_VisibilityStatuses]
GO
ALTER TABLE [dbo].[RequestApprovals]  WITH CHECK ADD  CONSTRAINT [FK_RequestApprovals_Approver] FOREIGN KEY([ApproverId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[RequestApprovals] CHECK CONSTRAINT [FK_RequestApprovals_Approver]
GO
ALTER TABLE [dbo].[RequestApprovals]  WITH CHECK ADD  CONSTRAINT [FK_RequestApprovals_Requests] FOREIGN KEY([RequestId])
REFERENCES [dbo].[PhotocopyRequests] ([RequestId])
GO
ALTER TABLE [dbo].[RequestApprovals] CHECK CONSTRAINT [FK_RequestApprovals_Requests]
GO
ALTER TABLE [dbo].[RequestAttachments]  WITH CHECK ADD  CONSTRAINT [FK_RequestAttachments_FileStorage] FOREIGN KEY([FileId])
REFERENCES [dbo].[FileStorage] ([FileId])
GO
ALTER TABLE [dbo].[RequestAttachments] CHECK CONSTRAINT [FK_RequestAttachments_FileStorage]
GO
ALTER TABLE [dbo].[RequestAttachments]  WITH CHECK ADD  CONSTRAINT [FK_RequestAttachments_Requests] FOREIGN KEY([RequestId])
REFERENCES [dbo].[PhotocopyRequests] ([RequestId])
GO
ALTER TABLE [dbo].[RequestAttachments] CHECK CONSTRAINT [FK_RequestAttachments_Requests]
GO
ALTER TABLE [dbo].[RestoreLogs]  WITH CHECK ADD  CONSTRAINT [FK_RestoreLogs_BackupJobs] FOREIGN KEY([BackupJobId])
REFERENCES [dbo].[BackupJobs] ([BackupJobId])
GO
ALTER TABLE [dbo].[RestoreLogs] CHECK CONSTRAINT [FK_RestoreLogs_BackupJobs]
GO
ALTER TABLE [dbo].[RestoreLogs]  WITH CHECK ADD  CONSTRAINT [FK_RestoreLogs_RestoredBy] FOREIGN KEY([RestoredBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[RestoreLogs] CHECK CONSTRAINT [FK_RestoreLogs_RestoredBy]
GO
ALTER TABLE [dbo].[RolePermissions]  WITH CHECK ADD  CONSTRAINT [FK_RolePermissions_Permissions] FOREIGN KEY([PermissionId])
REFERENCES [dbo].[Permissions] ([PermissionId])
GO
ALTER TABLE [dbo].[RolePermissions] CHECK CONSTRAINT [FK_RolePermissions_Permissions]
GO
ALTER TABLE [dbo].[RolePermissions]  WITH CHECK ADD  CONSTRAINT [FK_RolePermissions_Roles] FOREIGN KEY([RoleId])
REFERENCES [dbo].[Roles] ([RoleId])
GO
ALTER TABLE [dbo].[RolePermissions] CHECK CONSTRAINT [FK_RolePermissions_Roles]
GO
ALTER TABLE [dbo].[Roles]  WITH CHECK ADD  CONSTRAINT [FK_Roles_AccessLevels] FOREIGN KEY([AccessLevelId])
REFERENCES [dbo].[AccessLevels] ([AccessLevelId])
GO
ALTER TABLE [dbo].[Roles] CHECK CONSTRAINT [FK_Roles_AccessLevels]
GO
ALTER TABLE [dbo].[Rooms]  WITH CHECK ADD  CONSTRAINT [FK_Rooms_Locations] FOREIGN KEY([LocationId])
REFERENCES [dbo].[Locations] ([LocationId])
GO
ALTER TABLE [dbo].[Rooms] CHECK CONSTRAINT [FK_Rooms_Locations]
GO
ALTER TABLE [dbo].[SavedReports]  WITH CHECK ADD  CONSTRAINT [FK_SavedReports_Definitions] FOREIGN KEY([ReportDefinitionId])
REFERENCES [dbo].[ReportDefinitions] ([ReportDefinitionId])
GO
ALTER TABLE [dbo].[SavedReports] CHECK CONSTRAINT [FK_SavedReports_Definitions]
GO
ALTER TABLE [dbo].[SavedReports]  WITH CHECK ADD  CONSTRAINT [FK_SavedReports_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[SavedReports] CHECK CONSTRAINT [FK_SavedReports_Users]
GO
ALTER TABLE [dbo].[ScheduledJobs]  WITH CHECK ADD  CONSTRAINT [FK_ScheduledJobs_VisibilityStatuses] FOREIGN KEY([VisibilityStatusId])
REFERENCES [dbo].[FeatureVisibilityStatuses] ([VisibilityStatusId])
GO
ALTER TABLE [dbo].[ScheduledJobs] CHECK CONSTRAINT [FK_ScheduledJobs_VisibilityStatuses]
GO
ALTER TABLE [dbo].[Schools]  WITH CHECK ADD  CONSTRAINT [FK_Schools_LogoFile] FOREIGN KEY([LogoFileId])
REFERENCES [dbo].[FileStorage] ([FileId])
GO
ALTER TABLE [dbo].[Schools] CHECK CONSTRAINT [FK_Schools_LogoFile]
GO
ALTER TABLE [dbo].[SchoolSettings]  WITH CHECK ADD  CONSTRAINT [FK_SchoolSettings_Schools] FOREIGN KEY([SchoolId])
REFERENCES [dbo].[Schools] ([SchoolId])
GO
ALTER TABLE [dbo].[SchoolSettings] CHECK CONSTRAINT [FK_SchoolSettings_Schools]
GO
ALTER TABLE [dbo].[StaffImportBatches]  WITH CHECK ADD  CONSTRAINT [FK_StaffImportBatches_UploadedBy] FOREIGN KEY([UploadedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[StaffImportBatches] CHECK CONSTRAINT [FK_StaffImportBatches_UploadedBy]
GO
ALTER TABLE [dbo].[StaffImportStaging]  WITH CHECK ADD  CONSTRAINT [FK_StaffImportStaging_Batches] FOREIGN KEY([StaffImportBatchId])
REFERENCES [dbo].[StaffImportBatches] ([StaffImportBatchId])
GO
ALTER TABLE [dbo].[StaffImportStaging] CHECK CONSTRAINT [FK_StaffImportStaging_Batches]
GO
ALTER TABLE [dbo].[StaffImportStaging]  WITH CHECK ADD  CONSTRAINT [FK_StaffImportStaging_MatchedUser] FOREIGN KEY([MatchedUserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[StaffImportStaging] CHECK CONSTRAINT [FK_StaffImportStaging_MatchedUser]
GO
ALTER TABLE [dbo].[StaffProfiles]  WITH CHECK ADD  CONSTRAINT [FK_StaffProfiles_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[StaffProfiles] CHECK CONSTRAINT [FK_StaffProfiles_Users]
GO
ALTER TABLE [dbo].[StatusGroups]  WITH CHECK ADD  CONSTRAINT [FK_StatusGroups_Modules] FOREIGN KEY([ModuleId])
REFERENCES [dbo].[Modules] ([ModuleId])
GO
ALTER TABLE [dbo].[StatusGroups] CHECK CONSTRAINT [FK_StatusGroups_Modules]
GO
ALTER TABLE [dbo].[StatusValues]  WITH CHECK ADD  CONSTRAINT [FK_StatusValues_Groups] FOREIGN KEY([StatusGroupId])
REFERENCES [dbo].[StatusGroups] ([StatusGroupId])
GO
ALTER TABLE [dbo].[StatusValues] CHECK CONSTRAINT [FK_StatusValues_Groups]
GO
ALTER TABLE [dbo].[StudentClassEnrollments]  WITH CHECK ADD  CONSTRAINT [FK_StudentClassEnrollments_AcademicYears] FOREIGN KEY([AcademicYearId])
REFERENCES [dbo].[AcademicYears] ([AcademicYearId])
GO
ALTER TABLE [dbo].[StudentClassEnrollments] CHECK CONSTRAINT [FK_StudentClassEnrollments_AcademicYears]
GO
ALTER TABLE [dbo].[StudentClassEnrollments]  WITH CHECK ADD  CONSTRAINT [FK_StudentClassEnrollments_Classes] FOREIGN KEY([ClassId])
REFERENCES [dbo].[Classes] ([ClassId])
GO
ALTER TABLE [dbo].[StudentClassEnrollments] CHECK CONSTRAINT [FK_StudentClassEnrollments_Classes]
GO
ALTER TABLE [dbo].[StudentClassEnrollments]  WITH CHECK ADD  CONSTRAINT [FK_StudentClassEnrollments_Students] FOREIGN KEY([StudentId])
REFERENCES [dbo].[Students] ([StudentId])
GO
ALTER TABLE [dbo].[StudentClassEnrollments] CHECK CONSTRAINT [FK_StudentClassEnrollments_Students]
GO
ALTER TABLE [dbo].[StudentIdBatches]  WITH CHECK ADD  CONSTRAINT [FK_StudentIdBatches_AcademicYears] FOREIGN KEY([AcademicYearId])
REFERENCES [dbo].[AcademicYears] ([AcademicYearId])
GO
ALTER TABLE [dbo].[StudentIdBatches] CHECK CONSTRAINT [FK_StudentIdBatches_AcademicYears]
GO
ALTER TABLE [dbo].[StudentIdBatches]  WITH CHECK ADD  CONSTRAINT [FK_StudentIdBatches_ApprovedBy] FOREIGN KEY([ApprovedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[StudentIdBatches] CHECK CONSTRAINT [FK_StudentIdBatches_ApprovedBy]
GO
ALTER TABLE [dbo].[StudentIdBatches]  WITH CHECK ADD  CONSTRAINT [FK_StudentIdBatches_Classes] FOREIGN KEY([ClassId])
REFERENCES [dbo].[Classes] ([ClassId])
GO
ALTER TABLE [dbo].[StudentIdBatches] CHECK CONSTRAINT [FK_StudentIdBatches_Classes]
GO
ALTER TABLE [dbo].[StudentIdBatches]  WITH CHECK ADD  CONSTRAINT [FK_StudentIdBatches_RequestedBy] FOREIGN KEY([RequestedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[StudentIdBatches] CHECK CONSTRAINT [FK_StudentIdBatches_RequestedBy]
GO
ALTER TABLE [dbo].[StudentIdBatches]  WITH CHECK ADD  CONSTRAINT [FK_StudentIdBatches_Sections] FOREIGN KEY([SectionId])
REFERENCES [dbo].[Sections] ([SectionId])
GO
ALTER TABLE [dbo].[StudentIdBatches] CHECK CONSTRAINT [FK_StudentIdBatches_Sections]
GO
ALTER TABLE [dbo].[StudentIdBatches]  WITH CHECK ADD  CONSTRAINT [FK_StudentIdBatches_Templates] FOREIGN KEY([TemplateId])
REFERENCES [dbo].[StudentIdTemplates] ([StudentIdTemplateId])
GO
ALTER TABLE [dbo].[StudentIdBatches] CHECK CONSTRAINT [FK_StudentIdBatches_Templates]
GO
ALTER TABLE [dbo].[StudentIdBatches]  WITH CHECK ADD  CONSTRAINT [FK_StudentIdBatches_VerifiedBy] FOREIGN KEY([VerifiedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[StudentIdBatches] CHECK CONSTRAINT [FK_StudentIdBatches_VerifiedBy]
GO
ALTER TABLE [dbo].[StudentIdBatches]  WITH CHECK ADD  CONSTRAINT [FK_StudentIdBatches_YearLevels] FOREIGN KEY([YearLevelId])
REFERENCES [dbo].[YearLevels] ([YearLevelId])
GO
ALTER TABLE [dbo].[StudentIdBatches] CHECK CONSTRAINT [FK_StudentIdBatches_YearLevels]
GO
ALTER TABLE [dbo].[StudentIdCards]  WITH CHECK ADD  CONSTRAINT [FK_StudentIdCards_Batches] FOREIGN KEY([StudentIdBatchId])
REFERENCES [dbo].[StudentIdBatches] ([StudentIdBatchId])
GO
ALTER TABLE [dbo].[StudentIdCards] CHECK CONSTRAINT [FK_StudentIdCards_Batches]
GO
ALTER TABLE [dbo].[StudentIdCards]  WITH CHECK ADD  CONSTRAINT [FK_StudentIdCards_Students] FOREIGN KEY([StudentId])
REFERENCES [dbo].[Students] ([StudentId])
GO
ALTER TABLE [dbo].[StudentIdCards] CHECK CONSTRAINT [FK_StudentIdCards_Students]
GO
ALTER TABLE [dbo].[StudentIdCards]  WITH CHECK ADD  CONSTRAINT [FK_StudentIdCards_VerifiedBy] FOREIGN KEY([VerifiedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[StudentIdCards] CHECK CONSTRAINT [FK_StudentIdCards_VerifiedBy]
GO
ALTER TABLE [dbo].[StudentIdTemplates]  WITH CHECK ADD  CONSTRAINT [FK_StudentIdTemplates_VisibilityStatuses] FOREIGN KEY([VisibilityStatusId])
REFERENCES [dbo].[FeatureVisibilityStatuses] ([VisibilityStatusId])
GO
ALTER TABLE [dbo].[StudentIdTemplates] CHECK CONSTRAINT [FK_StudentIdTemplates_VisibilityStatuses]
GO
ALTER TABLE [dbo].[Students]  WITH CHECK ADD  CONSTRAINT [FK_Students_Classes] FOREIGN KEY([CurrentClassId])
REFERENCES [dbo].[Classes] ([ClassId])
GO
ALTER TABLE [dbo].[Students] CHECK CONSTRAINT [FK_Students_Classes]
GO
ALTER TABLE [dbo].[Students]  WITH CHECK ADD  CONSTRAINT [FK_Students_DeletedBy] FOREIGN KEY([DeletedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[Students] CHECK CONSTRAINT [FK_Students_DeletedBy]
GO
ALTER TABLE [dbo].[Students]  WITH CHECK ADD  CONSTRAINT [FK_Students_PhotoFile] FOREIGN KEY([PhotoFileId])
REFERENCES [dbo].[FileStorage] ([FileId])
GO
ALTER TABLE [dbo].[Students] CHECK CONSTRAINT [FK_Students_PhotoFile]
GO
ALTER TABLE [dbo].[Students]  WITH CHECK ADD  CONSTRAINT [FK_Students_Schools] FOREIGN KEY([SchoolId])
REFERENCES [dbo].[Schools] ([SchoolId])
GO
ALTER TABLE [dbo].[Students] CHECK CONSTRAINT [FK_Students_Schools]
GO
ALTER TABLE [dbo].[Students]  WITH CHECK ADD  CONSTRAINT [FK_Students_Sections] FOREIGN KEY([SectionId])
REFERENCES [dbo].[Sections] ([SectionId])
GO
ALTER TABLE [dbo].[Students] CHECK CONSTRAINT [FK_Students_Sections]
GO
ALTER TABLE [dbo].[Students]  WITH CHECK ADD  CONSTRAINT [FK_Students_YearLevels] FOREIGN KEY([YearLevelId])
REFERENCES [dbo].[YearLevels] ([YearLevelId])
GO
ALTER TABLE [dbo].[Students] CHECK CONSTRAINT [FK_Students_YearLevels]
GO
ALTER TABLE [dbo].[SubjectPrintLimits]  WITH CHECK ADD  CONSTRAINT [FK_SubjectPrintLimits_CreatedBy] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[SubjectPrintLimits] CHECK CONSTRAINT [FK_SubjectPrintLimits_CreatedBy]
GO
ALTER TABLE [dbo].[SubjectPrintLimits]  WITH CHECK ADD  CONSTRAINT [FK_SubjectPrintLimits_DepartmentLimits] FOREIGN KEY([DepartmentLimitId])
REFERENCES [dbo].[DepartmentPrintLimits] ([DepartmentLimitId])
GO
ALTER TABLE [dbo].[SubjectPrintLimits] CHECK CONSTRAINT [FK_SubjectPrintLimits_DepartmentLimits]
GO
ALTER TABLE [dbo].[SubjectPrintLimits]  WITH CHECK ADD  CONSTRAINT [FK_SubjectPrintLimits_Departments] FOREIGN KEY([DepartmentId])
REFERENCES [dbo].[Departments] ([DepartmentId])
GO
ALTER TABLE [dbo].[SubjectPrintLimits] CHECK CONSTRAINT [FK_SubjectPrintLimits_Departments]
GO
ALTER TABLE [dbo].[SubjectPrintLimits]  WITH CHECK ADD  CONSTRAINT [FK_SubjectPrintLimits_HOD] FOREIGN KEY([HodUserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[SubjectPrintLimits] CHECK CONSTRAINT [FK_SubjectPrintLimits_HOD]
GO
ALTER TABLE [dbo].[SubjectPrintLimits]  WITH CHECK ADD  CONSTRAINT [FK_SubjectPrintLimits_Subjects] FOREIGN KEY([SubjectId])
REFERENCES [dbo].[Subjects] ([SubjectId])
GO
ALTER TABLE [dbo].[SubjectPrintLimits] CHECK CONSTRAINT [FK_SubjectPrintLimits_Subjects]
GO
ALTER TABLE [dbo].[Tags]  WITH CHECK ADD  CONSTRAINT [FK_Tags_Modules] FOREIGN KEY([ModuleId])
REFERENCES [dbo].[Modules] ([ModuleId])
GO
ALTER TABLE [dbo].[Tags] CHECK CONSTRAINT [FK_Tags_Modules]
GO
ALTER TABLE [dbo].[TaskAssignments]  WITH CHECK ADD  CONSTRAINT [FK_TaskAssignments_AssignedBy] FOREIGN KEY([AssignedByUserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[TaskAssignments] CHECK CONSTRAINT [FK_TaskAssignments_AssignedBy]
GO
ALTER TABLE [dbo].[TaskAssignments]  WITH CHECK ADD  CONSTRAINT [FK_TaskAssignments_AssignedTo] FOREIGN KEY([AssignedToUserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[TaskAssignments] CHECK CONSTRAINT [FK_TaskAssignments_AssignedTo]
GO
ALTER TABLE [dbo].[TaskAssignments]  WITH CHECK ADD  CONSTRAINT [FK_TaskAssignments_Tasks] FOREIGN KEY([TaskId])
REFERENCES [dbo].[Tasks] ([TaskId])
GO
ALTER TABLE [dbo].[TaskAssignments] CHECK CONSTRAINT [FK_TaskAssignments_Tasks]
GO
ALTER TABLE [dbo].[TaskChecklistItems]  WITH CHECK ADD  CONSTRAINT [FK_TaskChecklistItems_CompletedBy] FOREIGN KEY([CompletedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[TaskChecklistItems] CHECK CONSTRAINT [FK_TaskChecklistItems_CompletedBy]
GO
ALTER TABLE [dbo].[TaskChecklistItems]  WITH CHECK ADD  CONSTRAINT [FK_TaskChecklistItems_Tasks] FOREIGN KEY([TaskId])
REFERENCES [dbo].[Tasks] ([TaskId])
GO
ALTER TABLE [dbo].[TaskChecklistItems] CHECK CONSTRAINT [FK_TaskChecklistItems_Tasks]
GO
ALTER TABLE [dbo].[Tasks]  WITH CHECK ADD  CONSTRAINT [FK_Tasks_CreatedBy] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[Tasks] CHECK CONSTRAINT [FK_Tasks_CreatedBy]
GO
ALTER TABLE [dbo].[Tasks]  WITH CHECK ADD  CONSTRAINT [FK_Tasks_Modules] FOREIGN KEY([ModuleId])
REFERENCES [dbo].[Modules] ([ModuleId])
GO
ALTER TABLE [dbo].[Tasks] CHECK CONSTRAINT [FK_Tasks_Modules]
GO
ALTER TABLE [dbo].[Terms]  WITH CHECK ADD  CONSTRAINT [FK_Terms_AcademicYears] FOREIGN KEY([AcademicYearId])
REFERENCES [dbo].[AcademicYears] ([AcademicYearId])
GO
ALTER TABLE [dbo].[Terms] CHECK CONSTRAINT [FK_Terms_AcademicYears]
GO
ALTER TABLE [dbo].[Themes]  WITH CHECK ADD  CONSTRAINT [FK_Themes_LoginBackground] FOREIGN KEY([LoginBackgroundFileId])
REFERENCES [dbo].[FileStorage] ([FileId])
GO
ALTER TABLE [dbo].[Themes] CHECK CONSTRAINT [FK_Themes_LoginBackground]
GO
ALTER TABLE [dbo].[Themes]  WITH CHECK ADD  CONSTRAINT [FK_Themes_LogoFile] FOREIGN KEY([LogoFileId])
REFERENCES [dbo].[FileStorage] ([FileId])
GO
ALTER TABLE [dbo].[Themes] CHECK CONSTRAINT [FK_Themes_LogoFile]
GO
ALTER TABLE [dbo].[Themes]  WITH CHECK ADD  CONSTRAINT [FK_Themes_Schools] FOREIGN KEY([SchoolId])
REFERENCES [dbo].[Schools] ([SchoolId])
GO
ALTER TABLE [dbo].[Themes] CHECK CONSTRAINT [FK_Themes_Schools]
GO
ALTER TABLE [dbo].[Translations]  WITH CHECK ADD  CONSTRAINT [FK_Translations_Languages] FOREIGN KEY([LanguageId])
REFERENCES [dbo].[Languages] ([LanguageId])
GO
ALTER TABLE [dbo].[Translations] CHECK CONSTRAINT [FK_Translations_Languages]
GO
ALTER TABLE [dbo].[Translations]  WITH CHECK ADD  CONSTRAINT [FK_Translations_Modules] FOREIGN KEY([ModuleId])
REFERENCES [dbo].[Modules] ([ModuleId])
GO
ALTER TABLE [dbo].[Translations] CHECK CONSTRAINT [FK_Translations_Modules]
GO
ALTER TABLE [dbo].[UserAssignments]  WITH CHECK ADD  CONSTRAINT [FK_UserAssignments_AcademicYears] FOREIGN KEY([AcademicYearId])
REFERENCES [dbo].[AcademicYears] ([AcademicYearId])
GO
ALTER TABLE [dbo].[UserAssignments] CHECK CONSTRAINT [FK_UserAssignments_AcademicYears]
GO
ALTER TABLE [dbo].[UserAssignments]  WITH CHECK ADD  CONSTRAINT [FK_UserAssignments_AssignmentTypes] FOREIGN KEY([AssignmentTypeId])
REFERENCES [dbo].[AssignmentTypes] ([AssignmentTypeId])
GO
ALTER TABLE [dbo].[UserAssignments] CHECK CONSTRAINT [FK_UserAssignments_AssignmentTypes]
GO
ALTER TABLE [dbo].[UserAssignments]  WITH CHECK ADD  CONSTRAINT [FK_UserAssignments_Classes] FOREIGN KEY([ClassId])
REFERENCES [dbo].[Classes] ([ClassId])
GO
ALTER TABLE [dbo].[UserAssignments] CHECK CONSTRAINT [FK_UserAssignments_Classes]
GO
ALTER TABLE [dbo].[UserAssignments]  WITH CHECK ADD  CONSTRAINT [FK_UserAssignments_CreatedBy] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[UserAssignments] CHECK CONSTRAINT [FK_UserAssignments_CreatedBy]
GO
ALTER TABLE [dbo].[UserAssignments]  WITH CHECK ADD  CONSTRAINT [FK_UserAssignments_Departments] FOREIGN KEY([DepartmentId])
REFERENCES [dbo].[Departments] ([DepartmentId])
GO
ALTER TABLE [dbo].[UserAssignments] CHECK CONSTRAINT [FK_UserAssignments_Departments]
GO
ALTER TABLE [dbo].[UserAssignments]  WITH CHECK ADD  CONSTRAINT [FK_UserAssignments_Rooms] FOREIGN KEY([RoomId])
REFERENCES [dbo].[Rooms] ([RoomId])
GO
ALTER TABLE [dbo].[UserAssignments] CHECK CONSTRAINT [FK_UserAssignments_Rooms]
GO
ALTER TABLE [dbo].[UserAssignments]  WITH CHECK ADD  CONSTRAINT [FK_UserAssignments_Sections] FOREIGN KEY([SectionId])
REFERENCES [dbo].[Sections] ([SectionId])
GO
ALTER TABLE [dbo].[UserAssignments] CHECK CONSTRAINT [FK_UserAssignments_Sections]
GO
ALTER TABLE [dbo].[UserAssignments]  WITH CHECK ADD  CONSTRAINT [FK_UserAssignments_Subjects] FOREIGN KEY([SubjectId])
REFERENCES [dbo].[Subjects] ([SubjectId])
GO
ALTER TABLE [dbo].[UserAssignments] CHECK CONSTRAINT [FK_UserAssignments_Subjects]
GO
ALTER TABLE [dbo].[UserAssignments]  WITH CHECK ADD  CONSTRAINT [FK_UserAssignments_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[UserAssignments] CHECK CONSTRAINT [FK_UserAssignments_Users]
GO
ALTER TABLE [dbo].[UserAssignments]  WITH CHECK ADD  CONSTRAINT [FK_UserAssignments_YearLevels] FOREIGN KEY([YearLevelId])
REFERENCES [dbo].[YearLevels] ([YearLevelId])
GO
ALTER TABLE [dbo].[UserAssignments] CHECK CONSTRAINT [FK_UserAssignments_YearLevels]
GO
ALTER TABLE [dbo].[UserAssignmentScopes]  WITH CHECK ADD  CONSTRAINT [FK_UserAssignmentScopes_UserAssignments] FOREIGN KEY([UserAssignmentId])
REFERENCES [dbo].[UserAssignments] ([UserAssignmentId])
GO
ALTER TABLE [dbo].[UserAssignmentScopes] CHECK CONSTRAINT [FK_UserAssignmentScopes_UserAssignments]
GO
ALTER TABLE [dbo].[UserMenuPreferences]  WITH CHECK ADD  CONSTRAINT [FK_UserMenuPreferences_Menus] FOREIGN KEY([MenuId])
REFERENCES [dbo].[Menus] ([MenuId])
GO
ALTER TABLE [dbo].[UserMenuPreferences] CHECK CONSTRAINT [FK_UserMenuPreferences_Menus]
GO
ALTER TABLE [dbo].[UserMenuPreferences]  WITH CHECK ADD  CONSTRAINT [FK_UserMenuPreferences_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[UserMenuPreferences] CHECK CONSTRAINT [FK_UserMenuPreferences_Users]
GO
ALTER TABLE [dbo].[UserMenuPreferences]  WITH CHECK ADD  CONSTRAINT [FK_UserMenuPreferences_Workspaces] FOREIGN KEY([WorkspaceId])
REFERENCES [dbo].[Workspaces] ([WorkspaceId])
GO
ALTER TABLE [dbo].[UserMenuPreferences] CHECK CONSTRAINT [FK_UserMenuPreferences_Workspaces]
GO
ALTER TABLE [dbo].[UserNotificationPreferences]  WITH CHECK ADD  CONSTRAINT [FK_UserNotificationPreferences_Channels] FOREIGN KEY([NotificationChannelId])
REFERENCES [dbo].[NotificationChannels] ([NotificationChannelId])
GO
ALTER TABLE [dbo].[UserNotificationPreferences] CHECK CONSTRAINT [FK_UserNotificationPreferences_Channels]
GO
ALTER TABLE [dbo].[UserNotificationPreferences]  WITH CHECK ADD  CONSTRAINT [FK_UserNotificationPreferences_Types] FOREIGN KEY([NotificationPreferenceTypeId])
REFERENCES [dbo].[NotificationPreferenceTypes] ([NotificationPreferenceTypeId])
GO
ALTER TABLE [dbo].[UserNotificationPreferences] CHECK CONSTRAINT [FK_UserNotificationPreferences_Types]
GO
ALTER TABLE [dbo].[UserNotificationPreferences]  WITH CHECK ADD  CONSTRAINT [FK_UserNotificationPreferences_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[UserNotificationPreferences] CHECK CONSTRAINT [FK_UserNotificationPreferences_Users]
GO
ALTER TABLE [dbo].[UserPermissionOverrides]  WITH CHECK ADD  CONSTRAINT [FK_UserPermissionOverrides_CreatedBy] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[UserPermissionOverrides] CHECK CONSTRAINT [FK_UserPermissionOverrides_CreatedBy]
GO
ALTER TABLE [dbo].[UserPermissionOverrides]  WITH CHECK ADD  CONSTRAINT [FK_UserPermissionOverrides_Permissions] FOREIGN KEY([PermissionId])
REFERENCES [dbo].[Permissions] ([PermissionId])
GO
ALTER TABLE [dbo].[UserPermissionOverrides] CHECK CONSTRAINT [FK_UserPermissionOverrides_Permissions]
GO
ALTER TABLE [dbo].[UserPermissionOverrides]  WITH CHECK ADD  CONSTRAINT [FK_UserPermissionOverrides_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[UserPermissionOverrides] CHECK CONSTRAINT [FK_UserPermissionOverrides_Users]
GO
ALTER TABLE [dbo].[UserRegistrationTokens]  WITH CHECK ADD  CONSTRAINT [FK_UserRegistrationTokens_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[UserRegistrationTokens] CHECK CONSTRAINT [FK_UserRegistrationTokens_Users]
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD  CONSTRAINT [FK_Users_DefaultWorkspace] FOREIGN KEY([DefaultWorkspaceId])
REFERENCES [dbo].[Workspaces] ([WorkspaceId])
GO
ALTER TABLE [dbo].[Users] CHECK CONSTRAINT [FK_Users_DefaultWorkspace]
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD  CONSTRAINT [FK_Users_DeletedBy] FOREIGN KEY([DeletedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[Users] CHECK CONSTRAINT [FK_Users_DeletedBy]
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD  CONSTRAINT [FK_Users_Departments] FOREIGN KEY([DepartmentId])
REFERENCES [dbo].[Departments] ([DepartmentId])
GO
ALTER TABLE [dbo].[Users] CHECK CONSTRAINT [FK_Users_Departments]
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD  CONSTRAINT [FK_Users_Roles] FOREIGN KEY([RoleId])
REFERENCES [dbo].[Roles] ([RoleId])
GO
ALTER TABLE [dbo].[Users] CHECK CONSTRAINT [FK_Users_Roles]
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD  CONSTRAINT [FK_Users_Schools] FOREIGN KEY([SchoolId])
REFERENCES [dbo].[Schools] ([SchoolId])
GO
ALTER TABLE [dbo].[Users] CHECK CONSTRAINT [FK_Users_Schools]
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD  CONSTRAINT [FK_Users_Sections] FOREIGN KEY([SectionId])
REFERENCES [dbo].[Sections] ([SectionId])
GO
ALTER TABLE [dbo].[Users] CHECK CONSTRAINT [FK_Users_Sections]
GO
ALTER TABLE [dbo].[UserSessions]  WITH CHECK ADD  CONSTRAINT [FK_UserSessions_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[UserSessions] CHECK CONSTRAINT [FK_UserSessions_Users]
GO
ALTER TABLE [dbo].[UserSubjects]  WITH CHECK ADD  CONSTRAINT [FK_UserSubjects_Subjects] FOREIGN KEY([SubjectId])
REFERENCES [dbo].[Subjects] ([SubjectId])
GO
ALTER TABLE [dbo].[UserSubjects] CHECK CONSTRAINT [FK_UserSubjects_Subjects]
GO
ALTER TABLE [dbo].[UserSubjects]  WITH CHECK ADD  CONSTRAINT [FK_UserSubjects_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[UserSubjects] CHECK CONSTRAINT [FK_UserSubjects_Users]
GO
ALTER TABLE [dbo].[Widgets]  WITH CHECK ADD  CONSTRAINT [FK_Widgets_FeatureFlags] FOREIGN KEY([FeatureFlagId])
REFERENCES [dbo].[FeatureFlags] ([FeatureFlagId])
GO
ALTER TABLE [dbo].[Widgets] CHECK CONSTRAINT [FK_Widgets_FeatureFlags]
GO
ALTER TABLE [dbo].[Widgets]  WITH CHECK ADD  CONSTRAINT [FK_Widgets_Modules] FOREIGN KEY([ModuleId])
REFERENCES [dbo].[Modules] ([ModuleId])
GO
ALTER TABLE [dbo].[Widgets] CHECK CONSTRAINT [FK_Widgets_Modules]
GO
ALTER TABLE [dbo].[Widgets]  WITH CHECK ADD  CONSTRAINT [FK_Widgets_Permissions] FOREIGN KEY([PermissionId])
REFERENCES [dbo].[Permissions] ([PermissionId])
GO
ALTER TABLE [dbo].[Widgets] CHECK CONSTRAINT [FK_Widgets_Permissions]
GO
ALTER TABLE [dbo].[Widgets]  WITH CHECK ADD  CONSTRAINT [FK_Widgets_VisibilityStatuses] FOREIGN KEY([VisibilityStatusId])
REFERENCES [dbo].[FeatureVisibilityStatuses] ([VisibilityStatusId])
GO
ALTER TABLE [dbo].[Widgets] CHECK CONSTRAINT [FK_Widgets_VisibilityStatuses]
GO
ALTER TABLE [dbo].[WorkflowActions]  WITH CHECK ADD  CONSTRAINT [FK_WorkflowActions_ActionBy] FOREIGN KEY([ActionBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[WorkflowActions] CHECK CONSTRAINT [FK_WorkflowActions_ActionBy]
GO
ALTER TABLE [dbo].[WorkflowActions]  WITH CHECK ADD  CONSTRAINT [FK_WorkflowActions_Instances] FOREIGN KEY([WorkflowInstanceId])
REFERENCES [dbo].[WorkflowInstances] ([WorkflowInstanceId])
GO
ALTER TABLE [dbo].[WorkflowActions] CHECK CONSTRAINT [FK_WorkflowActions_Instances]
GO
ALTER TABLE [dbo].[WorkflowActions]  WITH CHECK ADD  CONSTRAINT [FK_WorkflowActions_Steps] FOREIGN KEY([WorkflowStepId])
REFERENCES [dbo].[WorkflowSteps] ([WorkflowStepId])
GO
ALTER TABLE [dbo].[WorkflowActions] CHECK CONSTRAINT [FK_WorkflowActions_Steps]
GO
ALTER TABLE [dbo].[WorkflowInstances]  WITH CHECK ADD  CONSTRAINT [FK_WorkflowInstances_StartedBy] FOREIGN KEY([StartedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[WorkflowInstances] CHECK CONSTRAINT [FK_WorkflowInstances_StartedBy]
GO
ALTER TABLE [dbo].[WorkflowInstances]  WITH CHECK ADD  CONSTRAINT [FK_WorkflowInstances_Templates] FOREIGN KEY([WorkflowTemplateId])
REFERENCES [dbo].[WorkflowTemplates] ([WorkflowTemplateId])
GO
ALTER TABLE [dbo].[WorkflowInstances] CHECK CONSTRAINT [FK_WorkflowInstances_Templates]
GO
ALTER TABLE [dbo].[WorkflowSteps]  WITH CHECK ADD  CONSTRAINT [FK_WorkflowSteps_AssignmentTypes] FOREIGN KEY([AssignmentTypeId])
REFERENCES [dbo].[AssignmentTypes] ([AssignmentTypeId])
GO
ALTER TABLE [dbo].[WorkflowSteps] CHECK CONSTRAINT [FK_WorkflowSteps_AssignmentTypes]
GO
ALTER TABLE [dbo].[WorkflowSteps]  WITH CHECK ADD  CONSTRAINT [FK_WorkflowSteps_Roles] FOREIGN KEY([RoleId])
REFERENCES [dbo].[Roles] ([RoleId])
GO
ALTER TABLE [dbo].[WorkflowSteps] CHECK CONSTRAINT [FK_WorkflowSteps_Roles]
GO
ALTER TABLE [dbo].[WorkflowSteps]  WITH CHECK ADD  CONSTRAINT [FK_WorkflowSteps_Templates] FOREIGN KEY([WorkflowTemplateId])
REFERENCES [dbo].[WorkflowTemplates] ([WorkflowTemplateId])
GO
ALTER TABLE [dbo].[WorkflowSteps] CHECK CONSTRAINT [FK_WorkflowSteps_Templates]
GO
ALTER TABLE [dbo].[WorkflowTemplates]  WITH CHECK ADD  CONSTRAINT [FK_WorkflowTemplates_Modules] FOREIGN KEY([ModuleId])
REFERENCES [dbo].[Modules] ([ModuleId])
GO
ALTER TABLE [dbo].[WorkflowTemplates] CHECK CONSTRAINT [FK_WorkflowTemplates_Modules]
GO
ALTER TABLE [dbo].[WorkflowTemplates]  WITH CHECK ADD  CONSTRAINT [FK_WorkflowTemplates_VisibilityStatuses] FOREIGN KEY([VisibilityStatusId])
REFERENCES [dbo].[FeatureVisibilityStatuses] ([VisibilityStatusId])
GO
ALTER TABLE [dbo].[WorkflowTemplates] CHECK CONSTRAINT [FK_WorkflowTemplates_VisibilityStatuses]
GO
ALTER TABLE [dbo].[WorkspaceRoles]  WITH CHECK ADD  CONSTRAINT [FK_WorkspaceRoles_Roles] FOREIGN KEY([RoleId])
REFERENCES [dbo].[Roles] ([RoleId])
GO
ALTER TABLE [dbo].[WorkspaceRoles] CHECK CONSTRAINT [FK_WorkspaceRoles_Roles]
GO
ALTER TABLE [dbo].[WorkspaceRoles]  WITH CHECK ADD  CONSTRAINT [FK_WorkspaceRoles_Workspaces] FOREIGN KEY([WorkspaceId])
REFERENCES [dbo].[Workspaces] ([WorkspaceId])
GO
ALTER TABLE [dbo].[WorkspaceRoles] CHECK CONSTRAINT [FK_WorkspaceRoles_Workspaces]
GO
ALTER TABLE [dbo].[Workspaces]  WITH CHECK ADD  CONSTRAINT [FK_Workspaces_VisibilityStatuses] FOREIGN KEY([VisibilityStatusId])
REFERENCES [dbo].[FeatureVisibilityStatuses] ([VisibilityStatusId])
GO
ALTER TABLE [dbo].[Workspaces] CHECK CONSTRAINT [FK_Workspaces_VisibilityStatuses]
GO
ALTER TABLE [dbo].[YearLevels]  WITH CHECK ADD  CONSTRAINT [FK_YearLevels_Sections] FOREIGN KEY([SectionId])
REFERENCES [dbo].[Sections] ([SectionId])
GO
ALTER TABLE [dbo].[YearLevels] CHECK CONSTRAINT [FK_YearLevels_Sections]
GO

/****** Object: Table [dbo].[ITAssetPartRequirements] ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ITAssetPartRequirements](
	[AssetPartRequirementId] [int] IDENTITY(1,1) NOT NULL,
	[AssetId] [int] NOT NULL,
	[AssetAssignmentId] [int] NULL,
	[AssetBorrowId] [int] NULL,
	[PartKey] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[PartName] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Quantity] [int] NOT NULL
		CONSTRAINT [DF_ITAssetPartRequirements_Quantity] DEFAULT ((1)),
	[RequirementStatus] [nvarchar](30) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL
		CONSTRAINT [DF_ITAssetPartRequirements_Status] DEFAULT (N'REQUIRED'),
	[RequestedByUserId] [int] NULL,
	[RequestedAt] [datetime2](0) NOT NULL
		CONSTRAINT [DF_ITAssetPartRequirements_RequestedAt] DEFAULT (sysdatetime()),
	[OrderedAt] [datetime2](0) NULL,
	[ReceivedAt] [datetime2](0) NULL,
	[Notes] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IsActive] [bit] NOT NULL
		CONSTRAINT [DF_ITAssetPartRequirements_IsActive] DEFAULT ((1)),
	[CreatedAt] [datetime2](0) NOT NULL
		CONSTRAINT [DF_ITAssetPartRequirements_CreatedAt] DEFAULT (sysdatetime()),
	[UpdatedAt] [datetime2](0) NULL,
	CONSTRAINT [PK_ITAssetPartRequirements] PRIMARY KEY CLUSTERED
	(
		[AssetPartRequirementId] ASC
	),
	CONSTRAINT [CK_ITAssetPartRequirements_OneSource] CHECK
	(
		(CASE WHEN [AssetAssignmentId] IS NULL THEN 0 ELSE 1 END) +
		(CASE WHEN [AssetBorrowId] IS NULL THEN 0 ELSE 1 END) = 1
	),
	CONSTRAINT [CK_ITAssetPartRequirements_PartKey] CHECK
	(
		[PartKey] IN
		(
			N'MONITOR',
			N'LCD',
			N'RAM',
			N'SSD',
			N'BATTERY',
			N'KEYBOARD',
			N'NETWORK_CARD'
		)
	),
	CONSTRAINT [CK_ITAssetPartRequirements_Quantity] CHECK ([Quantity] > 0),
	CONSTRAINT [CK_ITAssetPartRequirements_Status] CHECK
	(
		[RequirementStatus] IN
		(
			N'REQUIRED',
			N'ORDERED',
			N'RECEIVED',
			N'CANCELLED'
		)
	),
	CONSTRAINT [FK_ITAssetPartRequirements_Asset] FOREIGN KEY ([AssetId])
		REFERENCES [dbo].[ITAssets] ([AssetId]),
	CONSTRAINT [FK_ITAssetPartRequirements_Assignment] FOREIGN KEY ([AssetAssignmentId])
		REFERENCES [dbo].[ITAssetAssignments] ([AssetAssignmentId]),
	CONSTRAINT [FK_ITAssetPartRequirements_Borrow] FOREIGN KEY ([AssetBorrowId])
		REFERENCES [dbo].[ITAssetBorrows] ([AssetBorrowId]),
	CONSTRAINT [FK_ITAssetPartRequirements_RequestedBy] FOREIGN KEY ([RequestedByUserId])
		REFERENCES [dbo].[Users] ([UserId])
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
CREATE UNIQUE NONCLUSTERED INDEX [UX_ITAssetPartRequirements_AssignmentPart]
ON [dbo].[ITAssetPartRequirements] ([AssetAssignmentId], [PartKey])
WHERE ([AssetAssignmentId] IS NOT NULL)
GO
CREATE UNIQUE NONCLUSTERED INDEX [UX_ITAssetPartRequirements_BorrowPart]
ON [dbo].[ITAssetPartRequirements] ([AssetBorrowId], [PartKey])
WHERE ([AssetBorrowId] IS NOT NULL)
GO
CREATE NONCLUSTERED INDEX [IX_ITAssetPartRequirements_OrderQueue]
ON [dbo].[ITAssetPartRequirements] ([RequirementStatus], [IsActive], [PartKey])
INCLUDE ([AssetId], [PartName], [Quantity])
GO

PRINT N'OperationsPlatformDB installation script completed.';
GO

SELECT
    DB_NAME() AS DatabaseName,
    COUNT(*) AS UserTableCount
FROM sys.tables;
GO

