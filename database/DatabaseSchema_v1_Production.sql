USE [master]
GO
/****** Object:  Database [PhotocopyManagementDB]    Script Date: 22/06/2026 2:51:47 AM ******/
CREATE DATABASE [PhotocopyManagementDB];
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [PhotocopyManagementDB].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [PhotocopyManagementDB] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [PhotocopyManagementDB] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [PhotocopyManagementDB] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [PhotocopyManagementDB] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [PhotocopyManagementDB] SET ARITHABORT OFF 
GO
ALTER DATABASE [PhotocopyManagementDB] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [PhotocopyManagementDB] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [PhotocopyManagementDB] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [PhotocopyManagementDB] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [PhotocopyManagementDB] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [PhotocopyManagementDB] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [PhotocopyManagementDB] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [PhotocopyManagementDB] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [PhotocopyManagementDB] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [PhotocopyManagementDB] SET  ENABLE_BROKER 
GO
ALTER DATABASE [PhotocopyManagementDB] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [PhotocopyManagementDB] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [PhotocopyManagementDB] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [PhotocopyManagementDB] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [PhotocopyManagementDB] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [PhotocopyManagementDB] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [PhotocopyManagementDB] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [PhotocopyManagementDB] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [PhotocopyManagementDB] SET  MULTI_USER 
GO
ALTER DATABASE [PhotocopyManagementDB] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [PhotocopyManagementDB] SET DB_CHAINING OFF 
GO
ALTER DATABASE [PhotocopyManagementDB] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [PhotocopyManagementDB] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [PhotocopyManagementDB] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [PhotocopyManagementDB] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
ALTER DATABASE [PhotocopyManagementDB] SET QUERY_STORE = ON
GO
ALTER DATABASE [PhotocopyManagementDB] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [PhotocopyManagementDB]
GO
/****** Object:  Table [dbo].[PhotocopyRequests]    Script Date: 22/06/2026 2:51:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PhotocopyRequests](
	[RequestId] [int] IDENTITY(1,1) NOT NULL,
	[RequestNumber] [nvarchar](50) NOT NULL,
	[TeacherId] [int] NOT NULL,
	[DepartmentId] [int] NOT NULL,
	[SubjectId] [int] NOT NULL,
	[PurposeId] [int] NOT NULL,
	[Copies] [int] NOT NULL,
	[TotalPages] [int] NOT NULL,
	[TotalSheets] [int] NOT NULL,
	[PriorityLevel] [nvarchar](20) NULL,
	[Status] [nvarchar](50) NULL,
	[CurrentApproverId] [int] NULL,
	[SubmittedAt] [datetime] NULL,
	[ApprovedAt] [datetime] NULL,
	[PrintedAt] [datetime] NULL,
	[CompletedAt] [datetime] NULL,
	[Remarks] [nvarchar](max) NULL,
	[PaperSize] [nvarchar](20) NULL,
	[PrintType] [nvarchar](50) NULL,
	[DueDate] [datetime] NULL,
	[PrintSide] [nvarchar](20) NULL,
	[IsExam] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[RequestId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  View [dbo].[vw_DepartmentMonthlyUsage]    Script Date: 22/06/2026 2:51:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- ============================================
-- Monthly department usage from requests
-- Counts sheets from approved / printing / completed requests
-- ============================================

CREATE VIEW [dbo].[vw_DepartmentMonthlyUsage] AS
SELECT
    DepartmentId,
    MONTH(SubmittedAt) AS MonthNumber,
    YEAR(SubmittedAt) AS YearNumber,
    SUM(TotalSheets) AS UsedSheets
FROM PhotocopyRequests
WHERE Status IN (
    'Approved by HOD',
    'Approved by HOS',
    'Printing',
    'Completed'
)
GROUP BY
    DepartmentId,
    MONTH(SubmittedAt),
    YEAR(SubmittedAt);
GO
/****** Object:  View [dbo].[vw_SubjectMonthlyUsage]    Script Date: 22/06/2026 2:51:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- ============================================
-- Monthly subject usage from requests
-- Counts sheets from approved / printing / completed requests
-- ============================================

CREATE VIEW [dbo].[vw_SubjectMonthlyUsage] AS
SELECT
    DepartmentId,
    SubjectId,
    MONTH(SubmittedAt) AS MonthNumber,
    YEAR(SubmittedAt) AS YearNumber,
    SUM(TotalSheets) AS UsedSheets
FROM PhotocopyRequests
WHERE Status IN (
    'Approved by HOD',
    'Approved by HOS',
    'Printing',
    'Completed'
)
GROUP BY
    DepartmentId,
    SubjectId,
    MONTH(SubmittedAt),
    YEAR(SubmittedAt);
GO
/****** Object:  Table [dbo].[AuditLogs]    Script Date: 22/06/2026 2:51:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AuditLogs](
	[AuditLogId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NULL,
	[ActionType] [nvarchar](100) NOT NULL,
	[Description] [nvarchar](max) NOT NULL,
	[CreatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[AuditLogId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DepartmentPrintLimits]    Script Date: 22/06/2026 2:51:47 AM ******/
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
	[CreatedAt] [datetime] NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[DepartmentLimitId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Departments]    Script Date: 22/06/2026 2:51:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Departments](
	[DepartmentId] [int] IDENTITY(1,1) NOT NULL,
	[DepartmentName] [nvarchar](100) NOT NULL,
	[IsActive] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[DepartmentId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[InventoryItems]    Script Date: 22/06/2026 2:51:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[InventoryItems](
	[ItemId] [int] IDENTITY(1,1) NOT NULL,
	[ItemName] [nvarchar](255) NOT NULL,
	[Category] [nvarchar](100) NOT NULL,
	[CurrentStock] [int] NOT NULL,
	[MinimumStock] [int] NOT NULL,
	[Unit] [nvarchar](50) NOT NULL,
	[IsActive] [bit] NULL,
	[CreatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[ItemId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[InventoryTransactions]    Script Date: 22/06/2026 2:51:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[InventoryTransactions](
	[TransactionId] [int] IDENTITY(1,1) NOT NULL,
	[PaperType] [varchar](10) NOT NULL,
	[TransactionType] [varchar](50) NOT NULL,
	[Quantity] [int] NOT NULL,
	[PreviousStock] [int] NOT NULL,
	[NewStock] [int] NOT NULL,
	[ReferenceId] [int] NULL,
	[Remarks] [varchar](255) NULL,
	[CreatedBy] [int] NULL,
	[CreatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[TransactionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Notifications]    Script Date: 22/06/2026 2:51:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Notifications](
	[NotificationId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[Title] [nvarchar](255) NOT NULL,
	[Message] [nvarchar](max) NOT NULL,
	[IsRead] [bit] NULL,
	[CreatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[NotificationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PaperDistributions]    Script Date: 22/06/2026 2:51:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PaperDistributions](
	[DistributionId] [int] IDENTITY(1,1) NOT NULL,
	[PaperType] [varchar](10) NOT NULL,
	[BundlesIssued] [int] NOT NULL,
	[IssuedTo] [varchar](100) NOT NULL,
	[IssuedDate] [date] NOT NULL,
	[CreatedAt] [datetime] NULL,
	[ReceivedByName] [varchar](100) NULL,
	[RequestedByUserId] [int] NULL,
	[DepartmentId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[DistributionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PaperInventory]    Script Date: 22/06/2026 2:51:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PaperInventory](
	[InventoryId] [int] IDENTITY(1,1) NOT NULL,
	[PaperType] [varchar](10) NULL,
	[CurrentStock] [int] NOT NULL,
	[LastUpdated] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[InventoryId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PaperPurchases]    Script Date: 22/06/2026 2:51:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PaperPurchases](
	[PurchaseId] [int] IDENTITY(1,1) NOT NULL,
	[PaperType] [varchar](10) NOT NULL,
	[QuantityBoxes] [int] NOT NULL,
	[TotalBundles]  AS ([QuantityBoxes]*(5)) PERSISTED,
	[TotalSheets]  AS (([QuantityBoxes]*(5))*(500)) PERSISTED,
	[PurchaseDate] [date] NOT NULL,
	[CreatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[PurchaseId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PrintingLogs]    Script Date: 22/06/2026 2:51:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PrintingLogs](
	[PrintingLogId] [int] IDENTITY(1,1) NOT NULL,
	[RequestId] [int] NOT NULL,
	[PrintedBy] [int] NOT NULL,
	[PrintedPages] [int] NOT NULL,
	[PrintedSheets] [int] NOT NULL,
	[Remarks] [nvarchar](max) NULL,
	[PrintedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[PrintingLogId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Purposes]    Script Date: 22/06/2026 2:51:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Purposes](
	[PurposeId] [int] IDENTITY(1,1) NOT NULL,
	[PurposeName] [nvarchar](100) NOT NULL,
	[IsActive] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[PurposeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RequestApprovals]    Script Date: 22/06/2026 2:51:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RequestApprovals](
	[ApprovalId] [int] IDENTITY(1,1) NOT NULL,
	[RequestId] [int] NOT NULL,
	[ApproverId] [int] NOT NULL,
	[ApprovalRole] [nvarchar](50) NOT NULL,
	[ApprovalStatus] [nvarchar](50) NOT NULL,
	[Remarks] [nvarchar](max) NULL,
	[ActionDate] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[ApprovalId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RequestAttachments]    Script Date: 22/06/2026 2:51:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RequestAttachments](
	[AttachmentId] [int] IDENTITY(1,1) NOT NULL,
	[RequestId] [int] NOT NULL,
	[OriginalFileName] [nvarchar](255) NOT NULL,
	[StoredFileName] [nvarchar](255) NOT NULL,
	[FilePath] [nvarchar](max) NULL,
	[FileType] [nvarchar](100) NULL,
	[FileSizeKB] [decimal](18, 2) NULL,
	[PageCount] [int] NULL,
	[Copies] [int] NOT NULL,
	[TotalSheets] [int] NULL,
	[UploadedAt] [datetime] NULL,
	[DocumentName] [nvarchar](255) NULL,
	[PaperSize] [nvarchar](20) NULL,
	[PrintType] [nvarchar](50) NULL,
	[PrintColor] [nvarchar](50) NULL,
	[PagesPerSheet] [int] NULL,
	[PageSelection] [nvarchar](50) NULL,
	[CustomPageRange] [nvarchar](100) NULL,
	[SelectedPages] [int] NULL,
	[SheetsPerSet] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[AttachmentId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SubjectPrintLimits]    Script Date: 22/06/2026 2:51:47 AM ******/
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
	[CreatedAt] [datetime] NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[SubjectLimitId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Subjects]    Script Date: 22/06/2026 2:51:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Subjects](
	[SubjectId] [int] IDENTITY(1,1) NOT NULL,
	[SubjectName] [nvarchar](100) NOT NULL,
	[IsActive] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[SubjectId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Users]    Script Date: 22/06/2026 2:51:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[UserId] [int] IDENTITY(1,1) NOT NULL,
	[EmployeeId] [nvarchar](50) NOT NULL,
	[FullName] [nvarchar](255) NOT NULL,
	[SchoolEmail] [nvarchar](255) NOT NULL,
	[DepartmentId] [int] NULL,
	[Subject] [nvarchar](100) NULL,
	[Role] [nvarchar](50) NOT NULL,
	[PasswordHash] [nvarchar](max) NOT NULL,
	[MustChangePassword] [bit] NULL,
	[IsActive] [bit] NULL,
	[CreatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserSubjects]    Script Date: 22/06/2026 2:51:47 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserSubjects](
	[UserSubjectId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[SubjectId] [int] NOT NULL,
	[IsActive] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[UserSubjectId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET IDENTITY_INSERT [dbo].[Departments] ON 

INSERT [dbo].[Departments] ([DepartmentId], [DepartmentName], [IsActive]) VALUES (1, N'FS', 1)
INSERT [dbo].[Departments] ([DepartmentId], [DepartmentName], [IsActive]) VALUES (2, N'Primary', 1)
INSERT [dbo].[Departments] ([DepartmentId], [DepartmentName], [IsActive]) VALUES (3, N'Secondary', 1)
INSERT [dbo].[Departments] ([DepartmentId], [DepartmentName], [IsActive]) VALUES (4, N'Sixth Form', 1)
INSERT [dbo].[Departments] ([DepartmentId], [DepartmentName], [IsActive]) VALUES (5, N'Inclusion', 1)
INSERT [dbo].[Departments] ([DepartmentId], [DepartmentName], [IsActive]) VALUES (6, N'IT', 1)
INSERT [dbo].[Departments] ([DepartmentId], [DepartmentName], [IsActive]) VALUES (7, N'Administration', 1)
SET IDENTITY_INSERT [dbo].[Departments] OFF
GO
SET IDENTITY_INSERT [dbo].[InventoryItems] ON 

INSERT [dbo].[InventoryItems] ([ItemId], [ItemName], [Category], [CurrentStock], [MinimumStock], [Unit], [IsActive], [CreatedAt]) VALUES (1, N'A4 Paper', N'Paper', 70, 10, N'Box', 1, CAST(N'2026-06-09T16:29:30.907' AS DateTime))
INSERT [dbo].[InventoryItems] ([ItemId], [ItemName], [Category], [CurrentStock], [MinimumStock], [Unit], [IsActive], [CreatedAt]) VALUES (2, N'A3 Paper', N'Paper', 10, 5, N'Box', 1, CAST(N'2026-06-09T16:29:30.907' AS DateTime))
INSERT [dbo].[InventoryItems] ([ItemId], [ItemName], [Category], [CurrentStock], [MinimumStock], [Unit], [IsActive], [CreatedAt]) VALUES (3, N'Black Toner', N'Toner', 5, 2, N'Piece', 1, CAST(N'2026-06-09T16:29:30.907' AS DateTime))
INSERT [dbo].[InventoryItems] ([ItemId], [ItemName], [Category], [CurrentStock], [MinimumStock], [Unit], [IsActive], [CreatedAt]) VALUES (4, N'Staple Holder SH-10', N'Riso Supplies', 5, 2, N'Box', 1, CAST(N'2026-06-09T16:29:30.907' AS DateTime))
INSERT [dbo].[InventoryItems] ([ItemId], [ItemName], [Category], [CurrentStock], [MinimumStock], [Unit], [IsActive], [CreatedAt]) VALUES (5, N'Brown Envelope', N'Stationery', 2000, 500, N'Piece', 1, CAST(N'2026-06-09T16:29:30.907' AS DateTime))
INSERT [dbo].[InventoryItems] ([ItemId], [ItemName], [Category], [CurrentStock], [MinimumStock], [Unit], [IsActive], [CreatedAt]) VALUES (6, N'White Label FSLA1-100', N'Stationery', 4, 2, N'Bundle', 1, CAST(N'2026-06-09T16:29:30.907' AS DateTime))
SET IDENTITY_INSERT [dbo].[InventoryItems] OFF
GO
SET IDENTITY_INSERT [dbo].[PaperInventory] ON 

INSERT [dbo].[PaperInventory] ([InventoryId], [PaperType], [CurrentStock], [LastUpdated]) VALUES (1, N'A4', 0, CAST(N'2026-06-22T02:21:24.230' AS DateTime))
INSERT [dbo].[PaperInventory] ([InventoryId], [PaperType], [CurrentStock], [LastUpdated]) VALUES (2, N'A3', 0, CAST(N'2026-06-22T02:21:24.230' AS DateTime))
SET IDENTITY_INSERT [dbo].[PaperInventory] OFF
GO
SET IDENTITY_INSERT [dbo].[Purposes] ON 

INSERT [dbo].[Purposes] ([PurposeId], [PurposeName], [IsActive]) VALUES (1, N'Classwork', 1)
INSERT [dbo].[Purposes] ([PurposeId], [PurposeName], [IsActive]) VALUES (2, N'Homework', 1)
INSERT [dbo].[Purposes] ([PurposeId], [PurposeName], [IsActive]) VALUES (3, N'Assessment', 1)
INSERT [dbo].[Purposes] ([PurposeId], [PurposeName], [IsActive]) VALUES (4, N'Mock Exam', 1)
INSERT [dbo].[Purposes] ([PurposeId], [PurposeName], [IsActive]) VALUES (5, N'Final Exam', 1)
INSERT [dbo].[Purposes] ([PurposeId], [PurposeName], [IsActive]) VALUES (6, N'Display Board', 1)
INSERT [dbo].[Purposes] ([PurposeId], [PurposeName], [IsActive]) VALUES (7, N'End of Unit', 1)
INSERT [dbo].[Purposes] ([PurposeId], [PurposeName], [IsActive]) VALUES (8, N'Other', 1)
INSERT [dbo].[Purposes] ([PurposeId], [PurposeName], [IsActive]) VALUES (9, N'Winter Exam', 1)
SET IDENTITY_INSERT [dbo].[Purposes] OFF
GO
SET IDENTITY_INSERT [dbo].[Subjects] ON 

INSERT [dbo].[Subjects] ([SubjectId], [SubjectName], [IsActive]) VALUES (1, N'English', 1)
INSERT [dbo].[Subjects] ([SubjectId], [SubjectName], [IsActive]) VALUES (2, N'Math', 1)
INSERT [dbo].[Subjects] ([SubjectId], [SubjectName], [IsActive]) VALUES (3, N'Science', 1)
INSERT [dbo].[Subjects] ([SubjectId], [SubjectName], [IsActive]) VALUES (4, N'Arabic', 1)
INSERT [dbo].[Subjects] ([SubjectId], [SubjectName], [IsActive]) VALUES (5, N'Islamic', 1)
INSERT [dbo].[Subjects] ([SubjectId], [SubjectName], [IsActive]) VALUES (6, N'Humanities', 1)
INSERT [dbo].[Subjects] ([SubjectId], [SubjectName], [IsActive]) VALUES (7, N'ICT', 1)
INSERT [dbo].[Subjects] ([SubjectId], [SubjectName], [IsActive]) VALUES (8, N'MSC', 1)
INSERT [dbo].[Subjects] ([SubjectId], [SubjectName], [IsActive]) VALUES (9, N'French', 1)
SET IDENTITY_INSERT [dbo].[Subjects] OFF
GO
SET IDENTITY_INSERT [dbo].[Users] ON 

INSERT [dbo].[Users] ([UserId], [EmployeeId], [FullName], [SchoolEmail], [DepartmentId], [Subject], [Role], [PasswordHash], [MustChangePassword], [IsActive], [CreatedAt]) VALUES (1, N'A0297', N'Fredelson', N'fredelson@arabunityschool.ae', 7, NULL, N'PrintingAdmin', N'$2b$10$4W1/aD1wTk4t7f4oVhoIjuCgFikn8nih2CivsdjquMlB4Pyx9qcRW', 1, 1, CAST(N'2026-06-22T02:35:22.337' AS DateTime))
SET IDENTITY_INSERT [dbo].[Users] OFF
GO
/****** Object:  Index [UQ_DepartmentPrintLimits]    Script Date: 22/06/2026 2:51:47 AM ******/
ALTER TABLE [dbo].[DepartmentPrintLimits] ADD  CONSTRAINT [UQ_DepartmentPrintLimits] UNIQUE NONCLUSTERED 
(
	[DepartmentId] ASC,
	[MonthNumber] ASC,
	[YearNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Departme__D949CC343D4B11DD]    Script Date: 22/06/2026 2:51:47 AM ******/
ALTER TABLE [dbo].[Departments] ADD UNIQUE NONCLUSTERED 
(
	[DepartmentName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Photocop__9ADA6BE01E953DFC]    Script Date: 22/06/2026 2:51:47 AM ******/
ALTER TABLE [dbo].[PhotocopyRequests] ADD UNIQUE NONCLUSTERED 
(
	[RequestNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Purposes__C44E9BC357DC188A]    Script Date: 22/06/2026 2:51:47 AM ******/
ALTER TABLE [dbo].[Purposes] ADD UNIQUE NONCLUSTERED 
(
	[PurposeName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_SubjectPrintLimits]    Script Date: 22/06/2026 2:51:47 AM ******/
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
/****** Object:  Index [UQ__Subjects__4C5A7D55BA448724]    Script Date: 22/06/2026 2:51:47 AM ******/
ALTER TABLE [dbo].[Subjects] ADD UNIQUE NONCLUSTERED 
(
	[SubjectName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Users__7AD04F10C5AA3C0B]    Script Date: 22/06/2026 2:51:47 AM ******/
ALTER TABLE [dbo].[Users] ADD UNIQUE NONCLUSTERED 
(
	[EmployeeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Users__F4D00BA206F1D027]    Script Date: 22/06/2026 2:51:47 AM ******/
ALTER TABLE [dbo].[Users] ADD UNIQUE NONCLUSTERED 
(
	[SchoolEmail] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_User_Subject]    Script Date: 22/06/2026 2:51:47 AM ******/
ALTER TABLE [dbo].[UserSubjects] ADD  CONSTRAINT [UQ_User_Subject] UNIQUE NONCLUSTERED 
(
	[UserId] ASC,
	[SubjectId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[AuditLogs] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[DepartmentPrintLimits] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Departments] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[InventoryItems] ADD  DEFAULT ((0)) FOR [CurrentStock]
GO
ALTER TABLE [dbo].[InventoryItems] ADD  DEFAULT ((0)) FOR [MinimumStock]
GO
ALTER TABLE [dbo].[InventoryItems] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[InventoryItems] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[InventoryTransactions] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Notifications] ADD  DEFAULT ((0)) FOR [IsRead]
GO
ALTER TABLE [dbo].[Notifications] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[PaperDistributions] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[PaperInventory] ADD  DEFAULT (getdate()) FOR [LastUpdated]
GO
ALTER TABLE [dbo].[PaperPurchases] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[PhotocopyRequests] ADD  DEFAULT ('Normal') FOR [PriorityLevel]
GO
ALTER TABLE [dbo].[PhotocopyRequests] ADD  DEFAULT ('Pending') FOR [Status]
GO
ALTER TABLE [dbo].[PhotocopyRequests] ADD  DEFAULT (getdate()) FOR [SubmittedAt]
GO
ALTER TABLE [dbo].[PhotocopyRequests] ADD  DEFAULT ((0)) FOR [IsExam]
GO
ALTER TABLE [dbo].[PrintingLogs] ADD  DEFAULT ((0)) FOR [PrintedPages]
GO
ALTER TABLE [dbo].[PrintingLogs] ADD  DEFAULT ((0)) FOR [PrintedSheets]
GO
ALTER TABLE [dbo].[PrintingLogs] ADD  DEFAULT (getdate()) FOR [PrintedAt]
GO
ALTER TABLE [dbo].[Purposes] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[RequestApprovals] ADD  DEFAULT (getdate()) FOR [ActionDate]
GO
ALTER TABLE [dbo].[RequestAttachments] ADD  DEFAULT ((1)) FOR [Copies]
GO
ALTER TABLE [dbo].[RequestAttachments] ADD  DEFAULT (getdate()) FOR [UploadedAt]
GO
ALTER TABLE [dbo].[SubjectPrintLimits] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Subjects] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ((1)) FOR [MustChangePassword]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[UserSubjects] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[AuditLogs]  WITH CHECK ADD FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
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
ALTER TABLE [dbo].[InventoryTransactions]  WITH CHECK ADD  CONSTRAINT [FK_InventoryTransactions_CreatedBy] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[InventoryTransactions] CHECK CONSTRAINT [FK_InventoryTransactions_CreatedBy]
GO
ALTER TABLE [dbo].[Notifications]  WITH CHECK ADD FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[PhotocopyRequests]  WITH CHECK ADD FOREIGN KEY([CurrentApproverId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[PhotocopyRequests]  WITH CHECK ADD FOREIGN KEY([DepartmentId])
REFERENCES [dbo].[Departments] ([DepartmentId])
GO
ALTER TABLE [dbo].[PhotocopyRequests]  WITH CHECK ADD FOREIGN KEY([PurposeId])
REFERENCES [dbo].[Purposes] ([PurposeId])
GO
ALTER TABLE [dbo].[PhotocopyRequests]  WITH CHECK ADD FOREIGN KEY([SubjectId])
REFERENCES [dbo].[Subjects] ([SubjectId])
GO
ALTER TABLE [dbo].[PhotocopyRequests]  WITH CHECK ADD FOREIGN KEY([TeacherId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[PrintingLogs]  WITH CHECK ADD FOREIGN KEY([PrintedBy])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[PrintingLogs]  WITH CHECK ADD FOREIGN KEY([RequestId])
REFERENCES [dbo].[PhotocopyRequests] ([RequestId])
GO
ALTER TABLE [dbo].[RequestApprovals]  WITH CHECK ADD FOREIGN KEY([ApproverId])
REFERENCES [dbo].[Users] ([UserId])
GO
ALTER TABLE [dbo].[RequestApprovals]  WITH CHECK ADD FOREIGN KEY([RequestId])
REFERENCES [dbo].[PhotocopyRequests] ([RequestId])
GO
ALTER TABLE [dbo].[RequestAttachments]  WITH CHECK ADD FOREIGN KEY([RequestId])
REFERENCES [dbo].[PhotocopyRequests] ([RequestId])
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
ALTER TABLE [dbo].[Users]  WITH CHECK ADD FOREIGN KEY([DepartmentId])
REFERENCES [dbo].[Departments] ([DepartmentId])
GO
ALTER TABLE [dbo].[UserSubjects]  WITH CHECK ADD FOREIGN KEY([SubjectId])
REFERENCES [dbo].[Subjects] ([SubjectId])
GO
ALTER TABLE [dbo].[UserSubjects]  WITH CHECK ADD FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
GO
USE [master]
GO
ALTER DATABASE [PhotocopyManagementDB] SET  READ_WRITE 
GO
