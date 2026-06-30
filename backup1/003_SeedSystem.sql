/* ============================================================
   OPERATIONS PLATFORM
   003_SeedSystem.sql

   Seeds:
   - Arab Unity School
   - Academic foundation
   - Roles / assignment types
   - Modules / workspaces / statuses
   - IT asset categories / statuses / issue types
   - Inventory item types
   - Settings / branding / document sequences
   - Fred A0297 as SuperAdmin
   ============================================================ */

USE [OperationsPlatformDB];
GO

/* ============================================================
   18. SEED DATA
   ============================================================ */

INSERT INTO dbo.FeatureVisibilityStatuses (StatusKey, StatusName, Description, SortOrder)
VALUES
('Enabled', 'Enabled', 'Visible and available', 1),
('Hidden', 'Hidden', 'Exists but hidden from UI', 2),
('Disabled', 'Disabled', 'Inactive and not accessible', 3);
GO

INSERT INTO dbo.AcademicYears (AcademicYearName, StartDate, EndDate, IsCurrent)
VALUES ('2026-2027', '2026-08-25', '2027-07-10', 1);
GO

INSERT INTO dbo.Sections (SectionKey, SectionName, SortOrder)
VALUES
('FS', 'FS', 1),
('PRIMARY', 'Primary', 2),
('SECONDARY', 'Secondary', 3),
('SIXTH_FORM', 'Sixth Form', 4),
('INCLUSION', 'Inclusion', 5);
GO

INSERT INTO dbo.Departments (DepartmentKey, DepartmentName, DepartmentCode, DepartmentType, SectionId, IsAcademic, SortOrder)
VALUES
('FS', 'FS', 'FS', 'Academic', 1, 1, 1),
('PRIMARY', 'Primary', 'PRI', 'Academic', 2, 1, 2),
('SECONDARY', 'Secondary', 'SEC', 'Academic', 3, 1, 3),
('SIXTH_FORM', 'Sixth Form', 'SF', 'Academic', 4, 1, 4),
('INCLUSION', 'Inclusion', 'INC', 'Academic', 5, 1, 5),
('IT', 'IT Department', 'IT', 'Operations', NULL, 0, 6),
('ADMIN', 'Administration', 'ADM', 'Operations', NULL, 0, 7),
('CLINIC', 'Clinic', 'CLI', 'Operations', NULL, 0, 8),
('OPERATIONS', 'Operations', 'OPS', 'Operations', NULL, 0, 9);
GO

INSERT INTO dbo.YearLevels (SectionId, YearLevelKey, YearLevelName, SortOrder)
SELECT SectionId, 'FS1', 'FS1', 1 FROM dbo.Sections WHERE SectionKey='FS'
UNION ALL SELECT SectionId, 'FS2', 'FS2', 2 FROM dbo.Sections WHERE SectionKey='FS'
UNION ALL SELECT SectionId, 'Y1', 'Year 1', 3 FROM dbo.Sections WHERE SectionKey='PRIMARY'
UNION ALL SELECT SectionId, 'Y2', 'Year 2', 4 FROM dbo.Sections WHERE SectionKey='PRIMARY'
UNION ALL SELECT SectionId, 'Y3', 'Year 3', 5 FROM dbo.Sections WHERE SectionKey='PRIMARY'
UNION ALL SELECT SectionId, 'Y4', 'Year 4', 6 FROM dbo.Sections WHERE SectionKey='PRIMARY'
UNION ALL SELECT SectionId, 'Y5', 'Year 5', 7 FROM dbo.Sections WHERE SectionKey='PRIMARY'
UNION ALL SELECT SectionId, 'Y6', 'Year 6', 8 FROM dbo.Sections WHERE SectionKey='PRIMARY'
UNION ALL SELECT SectionId, 'Y7', 'Year 7', 9 FROM dbo.Sections WHERE SectionKey='SECONDARY'
UNION ALL SELECT SectionId, 'Y8', 'Year 8', 10 FROM dbo.Sections WHERE SectionKey='SECONDARY'
UNION ALL SELECT SectionId, 'Y9', 'Year 9', 11 FROM dbo.Sections WHERE SectionKey='SECONDARY'
UNION ALL SELECT SectionId, 'Y10', 'Year 10', 12 FROM dbo.Sections WHERE SectionKey='SECONDARY'
UNION ALL SELECT SectionId, 'Y11', 'Year 11', 13 FROM dbo.Sections WHERE SectionKey='SECONDARY'
UNION ALL SELECT SectionId, 'Y12', 'Year 12', 14 FROM dbo.Sections WHERE SectionKey='SIXTH_FORM'
UNION ALL SELECT SectionId, 'Y13', 'Year 13', 15 FROM dbo.Sections WHERE SectionKey='SIXTH_FORM';
GO

INSERT INTO dbo.Subjects (SubjectKey, SubjectName, SortOrder)
VALUES
('ENGLISH', 'English', 1),
('MATH', 'Math', 2),
('SCIENCE', 'Science', 3),
('ARABIC', 'Arabic', 4),
('ISLAMIC', 'Islamic', 5),
('HUMANITIES', 'Humanities', 6),
('ICT', 'ICT', 7),
('GENERAL', 'General', 8);
GO

INSERT INTO dbo.Purposes (PurposeKey, PurposeName, SortOrder)
VALUES
('CLASSWORK', 'Classwork', 1),
('HOMEWORK', 'Homework', 2),
('ASSESSMENT', 'Assessment', 3),
('EXAM', 'Exam', 4),
('REVISION', 'Revision', 5),
('ADMIN_DOCUMENT', 'Admin Document', 6),
('STUDENT_ID', 'Student ID', 7),
('DISPLAY', 'Display', 8),
('OTHER', 'Other', 9);
GO

INSERT INTO dbo.AccessLevels (AccessLevelKey, AccessLevelName, DisplayName, Description, SortOrder, IsSystemLevel)
VALUES
('TEACHER_LEVEL', 'TeacherLevel', 'Teacher Level', 'Teacher users', 1, 1),
('ADMIN_LEVEL', 'AdminLevel', 'Admin Level', 'Admin users and academic leadership', 2, 1),
('PLATFORM_ADMIN_LEVEL', 'PlatformAdminLevel', 'Platform Admin Level', 'IT/platform administrators', 3, 1),
('SUPER_ADMIN_LEVEL', 'SuperAdminLevel', 'Super Admin Level', 'Protected system owner', 4, 1);
GO

INSERT INTO dbo.Roles (RoleKey, RoleName, DisplayName, AccessLevelId, Description, IsSystemRole, IsProtected)
VALUES
('Teacher', 'Teacher', 'Teacher', 1, 'Teacher login role', 1, 0),
('Admin', 'Admin', 'Admin', 2, 'Admin and academic leadership login role', 1, 0),
('PlatformAdmin', 'Platform Admin', 'Platform Admin', 3, 'IT/platform admin role', 1, 0),
('SuperAdmin', 'Super Admin', 'Super Admin', 4, 'Protected system owner role', 1, 1);
GO

INSERT INTO dbo.AssignmentTypes (AssignmentKey, AssignmentName, Description, IsSystemAssignment, SortOrder)
VALUES
('HOD', 'HOD', 'Head of Department assignment', 1, 1),
('HOS', 'HOS', 'Head of Section assignment', 1, 2),
('HOMEROOM_TEACHER', 'Homeroom Teacher', 'Class homeroom teacher assignment', 1, 3),
('YEAR_LEADER', 'Year Leader', 'Year-level leadership assignment', 1, 4),
('DEPUTY_HEAD', 'Deputy Head', 'Deputy head assignment with flexible scope', 1, 5),
('HEAD_OF_OPERATIONS', 'Head of Operations', 'Operations leadership assignment', 1, 6),
('NURSE', 'Nurse', 'Clinic nurse assignment', 1, 7),
('TEACHING_ASSISTANT', 'Teaching Assistant', 'Teaching assistant assignment', 1, 8),
('IT_COORDINATOR', 'IT Coordinator', 'IT coordinator assignment', 0, 9),
('PRINTING_COORDINATOR', 'Printing Coordinator', 'Printing coordinator assignment', 0, 10);
GO

DECLARE @Enabled INT = (SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Enabled');
DECLARE @Hidden INT = (SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Hidden');
DECLARE @Disabled INT = (SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Disabled');

INSERT INTO dbo.Modules (ModuleKey, ModuleName, Description, Icon, BaseRoute, VisibilityStatusId, SortOrder)
VALUES
('super_admin', 'Super Admin Control Center', 'Main platform control center', 'admin_panel_settings', '/super-admin', @Enabled, 1),
('user_access', 'User & Access Management', 'Users, roles, permissions, imports and assignments', 'manage_accounts', '/super-admin/user-access', @Enabled, 2),
('academic_operations', 'Academic Operations', 'Academic structure, students and student IDs', 'school', '/academic', @Enabled, 3),
('printing', 'Printing Management', 'Printing requests, approvals and queue', 'print', '/printing', @Enabled, 4),
('inventory', 'Inventory Management', 'Paper inventory and transactions', 'inventory_2', '/inventory', @Enabled, 5),
('it_assets', 'IT Asset Management', 'IT assets and assignments', 'devices', '/it-assets', @Enabled, 6),
('it_service_desk', 'IT Service Desk', 'IT tickets and support workflow', 'support_agent', '/it-service-desk', @Enabled, 7),
('reports', 'Reports & Analytics', 'Reports and dashboards', 'analytics', '/reports', @Enabled, 8),
('workflow_engine', 'Workflow Engine', 'Reusable workflow approvals', 'account_tree', '/workflow-engine', @Hidden, 9),
('communication', 'Communication Center', 'Notifications and email queue', 'campaign', '/communication', @Hidden, 10),
('system_control', 'System Control Center', 'Settings, backup, security and audit', 'settings', '/system-control', @Enabled, 11);
GO

DECLARE @Enabled2 INT = (SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Enabled');
DECLARE @Hidden2 INT = (SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Hidden');
DECLARE @Disabled2 INT = (SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Disabled');

INSERT INTO dbo.Workspaces (WorkspaceKey, WorkspaceName, Description, Icon, DefaultRoute, VisibilityStatusId, IsDefault, SortOrder)
VALUES
('default', 'Default Workspace', 'General user workspace', 'dashboard', '/dashboard', @Enabled2, 1, 1),
('it', 'IT Workspace', 'IT assets, tickets and inventory', 'devices', '/it-assets/dashboard', @Enabled2, 0, 2),
('printing', 'Printing Workspace', 'Printing queue, requests and paper inventory', 'print', '/printing/dashboard', @Enabled2, 0, 3),
('academic', 'Academic Workspace', 'Academic operations and student IDs', 'school', '/academic/dashboard', @Enabled2, 0, 4);
GO

INSERT INTO dbo.ITAssetStatuses (StatusKey, StatusName, Description, IsFinalStatus, SortOrder)
VALUES
('Available', 'Available', 'Available for assignment', 0, 1),
('Assigned', 'Assigned', 'Currently assigned', 0, 2),
('Faulty', 'Faulty', 'Reported faulty or broken', 0, 3),
('UnderRepair', 'Under Repair', 'Currently under repair', 0, 4),
('ReadyForDisposal', 'Ready for Disposal', 'Inspected and ready for disposal approval', 0, 5),
('Disposed', 'Disposed', 'Disposed asset', 1, 6),
('Lost', 'Lost', 'Lost asset', 1, 7),
('Stolen', 'Stolen', 'Stolen asset', 1, 8),
('Archived', 'Archived', 'Archived historical record', 1, 9);
GO

INSERT INTO dbo.ITAssetConditions (ConditionKey, ConditionName, Description, SortOrder)
VALUES
('Excellent', 'Excellent', 'Excellent condition', 1),
('Good', 'Good', 'Good usable condition', 2),
('Fair', 'Fair', 'Fair condition', 3),
('Poor', 'Poor', 'Poor condition', 4),
('Damaged', 'Damaged', 'Damaged but may be repairable', 5),
('BeyondRepair', 'Beyond Repair', 'Not repairable', 6);
GO

DECLARE @Enabled3 INT = (SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Enabled');
DECLARE @Hidden3 INT = (SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Hidden');
DECLARE @Disabled3 INT = (SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Disabled');

INSERT INTO dbo.ITAssetCategories (CategoryKey, CategoryName, Description, VisibilityStatusId, SortOrder)
VALUES
('Laptop', 'Laptop', 'Staff and student laptop assets', @Enabled3, 1),
('Desktop', 'Desktop / Admin PC', 'Desktop computers', @Enabled3, 2),
('ComputerLabPC', 'Computer Lab PC', 'Lab computers', @Enabled3, 3),
('PrinterCopier', 'Printer / Copier', 'Printer and photocopier devices', @Enabled3, 4),
('Projector', 'Projector', 'Classroom and hall projectors', @Enabled3, 5),
('AccessPoint', 'Access Point', 'Wireless access points', @Enabled3, 6),
('Switch', 'Switch', 'Network switches', @Enabled3, 7),
('FirewallNetwork', 'Firewall / Network', 'Firewall and network devices', @Enabled3, 8),
('CCTVCamera', 'CCTV Camera', 'CCTV cameras', @Enabled3, 9),
('IPPhone', 'IP Phone', 'IP phones', @Enabled3, 10),
('LEDDisplay', 'LED Screen', 'LED displays and screens', @Enabled3, 11),
('ServerOther', 'Server / Other Equipment', 'Servers and infrastructure', @Enabled3, 12),
('Tablet', 'iPad / Tablet', 'Tablet devices', @Enabled3, 13),
('ClassroomSpeaker', 'Classroom Speaker / Trunking', 'Audio and classroom trunking', @Enabled3, 14),
('SoftwareLicense', 'Software License', 'Software licenses', @Hidden3, 15);
GO

INSERT INTO dbo.ITAssetNoteTypes (NoteTypeKey, NoteTypeName)
VALUES
('General', 'General'),
('Repair', 'Repair'),
('Damage', 'Damage'),
('Return', 'Return'),
('Replacement', 'Replacement'),
('Warranty', 'Warranty'),
('Disposal', 'Disposal'),
('Transfer', 'Transfer'),
('Inspection', 'Inspection');
GO

DECLARE @LaptopCat INT = (SELECT ITAssetCategoryId FROM dbo.ITAssetCategories WHERE CategoryKey='Laptop');
DECLARE @ProjectorCat INT = (SELECT ITAssetCategoryId FROM dbo.ITAssetCategories WHERE CategoryKey='Projector');
DECLARE @PrinterCat INT = (SELECT ITAssetCategoryId FROM dbo.ITAssetCategories WHERE CategoryKey='PrinterCopier');

INSERT INTO dbo.ITAssetIssueCategories (IssueCategoryKey, IssueCategoryName, ITAssetCategoryId)
VALUES
('LaptopIssues', 'Laptop Issues', @LaptopCat),
('ProjectorIssues', 'Projector Issues', @ProjectorCat),
('PrinterCopierIssues', 'Printer / Copier Issues', @PrinterCat);
GO

DECLARE @LaptopIssueCat INT = (SELECT IssueCategoryId FROM dbo.ITAssetIssueCategories WHERE IssueCategoryKey='LaptopIssues');
DECLARE @ProjectorIssueCat INT = (SELECT IssueCategoryId FROM dbo.ITAssetIssueCategories WHERE IssueCategoryKey='ProjectorIssues');
DECLARE @PrinterIssueCat INT = (SELECT IssueCategoryId FROM dbo.ITAssetIssueCategories WHERE IssueCategoryKey='PrinterCopierIssues');

INSERT INTO dbo.ITAssetIssueTypes (IssueCategoryId, IssueTypeKey, IssueTypeName)
VALUES
(@LaptopIssueCat, 'KeyboardIssue', 'Keyboard Issue'),
(@LaptopIssueCat, 'MotherboardIssue', 'Motherboard Issue'),
(@LaptopIssueCat, 'BatteryIssue', 'Battery Issue'),
(@LaptopIssueCat, 'ChargerIssue', 'Charger Issue'),
(@LaptopIssueCat, 'RamUpgradeNeeded', 'RAM Upgrade Needed'),
(@LaptopIssueCat, 'SsdUpgradeNeeded', 'SSD Upgrade Needed'),
(@LaptopIssueCat, 'ScreenIssue', 'Screen Issue'),
(@LaptopIssueCat, 'OsInstallation', 'OS Installation'),
(@LaptopIssueCat, 'SlowPerformance', 'Slow Performance'),
(@ProjectorIssueCat, 'BulbReplacement', 'Bulb Replacement'),
(@ProjectorIssueCat, 'LowBrightness', 'Low Brightness'),
(@ProjectorIssueCat, 'HdmiPortIssue', 'HDMI Port Issue'),
(@ProjectorIssueCat, 'RemoteMissing', 'Remote Missing'),
(@ProjectorIssueCat, 'FilterCleaning', 'Filter Cleaning'),
(@ProjectorIssueCat, 'Overheating', 'Overheating'),
(@ProjectorIssueCat, 'NoDisplay', 'No Display'),
(@PrinterIssueCat, 'PaperJam', 'Paper Jam'),
(@PrinterIssueCat, 'TonerIssue', 'Toner Issue'),
(@PrinterIssueCat, 'DrumIssue', 'Drum Issue'),
(@PrinterIssueCat, 'NetworkIssue', 'Network Issue'),
(@PrinterIssueCat, 'ScannerIssue', 'Scanner Issue');
GO

DECLARE @Enabled4 INT = (SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Enabled');
DECLARE @Hidden4 INT = (SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Hidden');
DECLARE @Disabled4 INT = (SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Disabled');

INSERT INTO dbo.InventoryItemTypes (ItemTypeKey, ItemTypeName, Description, VisibilityStatusId, IsConsumable)
VALUES
('PaperA4', 'A4 Paper', 'A4 paper inventory', @Enabled4, 1),
('PaperA3', 'A3 Paper', 'A3 paper inventory', @Enabled4, 1),
('Toner', 'Toner', 'Toner tracking, disabled until needed', @Disabled4, 1),
('ProjectorLamp', 'Projector Lamp', 'Projector lamp consumables', @Hidden4, 1),
('SSD', 'SSD', 'SSD replacement stock', @Hidden4, 1),
('RAM', 'RAM', 'RAM replacement stock', @Hidden4, 1),
('Mouse', 'Mouse', 'Mouse inventory', @Hidden4, 1),
('Keyboard', 'Keyboard', 'Keyboard inventory', @Hidden4, 1),
('Charger', 'Charger', 'Laptop charger inventory', @Hidden4, 1),
('PVCIDCards', 'PVC ID Cards', 'Student ID card consumables', @Hidden4, 1),
('IDRibbon', 'ID Ribbon', 'Student ID printer ribbon', @Hidden4, 1);
GO

INSERT INTO dbo.PaperInventory (PaperType, CurrentStock)
VALUES ('A4', 0), ('A3', 0);
GO

INSERT INTO dbo.SystemSettings (SettingKey, SettingValue, SettingGroup, Description, IsEditable)
VALUES
('platform.name', 'Operations Platform', 'Branding', 'Main platform name', 1),
('platform.school', 'Arab Unity School', 'Branding', 'School name', 1),
('printing.approval.threshold_sheets', '500', 'Printing', 'Sheets above this require HOS approval', 1),
('registration.teacher.self_activation_enabled', 'true', 'Registration', 'Allow imported staff registration', 1),
('student_id.homeroom_verification_required', 'true', 'Student ID', 'Require homeroom verification before printing IDs', 1),
('feature.printer_meter_readings.visibility', 'Hidden', 'IT Assets', 'Printer meter reading feature visibility', 1),
('feature.toner_tracking.visibility', 'Disabled', 'Inventory', 'Toner tracking feature visibility', 1),
('sidebar.dynamic_enabled', 'true', 'Navigation', 'Use database-driven sidebar menu', 1);
GO



/* ============================================================
   19. FINAL ENTERPRISE FOUNDATION ADDITIONS
   ============================================================ */

/* -----------------------------
   Backup / Restore Tracking
   ----------------------------- */

CREATE TABLE dbo.BackupJobs (
    BackupJobId INT IDENTITY(1,1) PRIMARY KEY,
    BackupType NVARCHAR(50) NOT NULL, -- Full, Differential, Log, Manual
    BackupStatus NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    BackupFilePath NVARCHAR(MAX) NULL,
    StartedBy INT NULL,
    StartedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CompletedAt DATETIME NULL,
    ErrorMessage NVARCHAR(MAX) NULL,
    CONSTRAINT FK_BackupJobs_StartedBy FOREIGN KEY (StartedBy) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.RestoreLogs (
    RestoreLogId INT IDENTITY(1,1) PRIMARY KEY,
    BackupJobId INT NULL,
    RestoreStatus NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    RestoreReason NVARCHAR(MAX) NULL,
    RestoredBy INT NULL,
    StartedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CompletedAt DATETIME NULL,
    ErrorMessage NVARCHAR(MAX) NULL,
    CONSTRAINT FK_RestoreLogs_BackupJobs FOREIGN KEY (BackupJobId) REFERENCES dbo.BackupJobs(BackupJobId),
    CONSTRAINT FK_RestoreLogs_RestoredBy FOREIGN KEY (RestoredBy) REFERENCES dbo.Users(UserId)
);
GO

/* -----------------------------
   Archive Policies / Archive Runs
   ----------------------------- */

CREATE TABLE dbo.ArchivePolicies (
    ArchivePolicyId INT IDENTITY(1,1) PRIMARY KEY,
    PolicyKey NVARCHAR(100) NOT NULL UNIQUE,
    PolicyName NVARCHAR(150) NOT NULL,
    EntityType NVARCHAR(100) NOT NULL,
    RetentionMonths INT NULL,
    ArchiveByAcademicYear BIT NOT NULL DEFAULT 0,
    VisibilityStatusId INT NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_ArchivePolicies_VisibilityStatuses FOREIGN KEY (VisibilityStatusId) REFERENCES dbo.FeatureVisibilityStatuses(VisibilityStatusId)
);
GO

CREATE TABLE dbo.ArchiveRuns (
    ArchiveRunId INT IDENTITY(1,1) PRIMARY KEY,
    ArchivePolicyId INT NOT NULL,
    RunStatus NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    RecordsEvaluated INT NOT NULL DEFAULT 0,
    RecordsArchived INT NOT NULL DEFAULT 0,
    StartedBy INT NULL,
    StartedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CompletedAt DATETIME NULL,
    ErrorMessage NVARCHAR(MAX) NULL,
    CONSTRAINT FK_ArchiveRuns_Policies FOREIGN KEY (ArchivePolicyId) REFERENCES dbo.ArchivePolicies(ArchivePolicyId),
    CONSTRAINT FK_ArchiveRuns_StartedBy FOREIGN KEY (StartedBy) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.ArchiveRecords (
    ArchiveRecordId INT IDENTITY(1,1) PRIMARY KEY,
    ArchiveRunId INT NOT NULL,
    EntityType NVARCHAR(100) NOT NULL,
    EntityId NVARCHAR(100) NOT NULL,
    ArchiveStatus NVARCHAR(50) NOT NULL DEFAULT 'Archived',
    ArchiveData NVARCHAR(MAX) NULL,
    ArchivedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_ArchiveRecords_Runs FOREIGN KEY (ArchiveRunId) REFERENCES dbo.ArchiveRuns(ArchiveRunId)
);
GO

/* -----------------------------
   Import Error Logs
   ----------------------------- */

CREATE TABLE dbo.ImportErrorLogs (
    ImportErrorLogId INT IDENTITY(1,1) PRIMARY KEY,
    ImportType NVARCHAR(100) NOT NULL, -- Staff, ITAsset, Student, Inventory
    BatchId INT NULL,
    SourceSheet NVARCHAR(150) NULL,
    SourceRow INT NULL,
    RawData NVARCHAR(MAX) NULL,
    ErrorType NVARCHAR(100) NOT NULL,
    ErrorMessage NVARCHAR(MAX) NOT NULL,
    IsResolved BIT NOT NULL DEFAULT 0,
    ResolvedBy INT NULL,
    ResolvedAt DATETIME NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_ImportErrorLogs_ResolvedBy FOREIGN KEY (ResolvedBy) REFERENCES dbo.Users(UserId)
);
GO

/* -----------------------------
   Asset Groups
   Example: Room 205 IT Setup
   ----------------------------- */

CREATE TABLE dbo.ITAssetGroups (
    AssetGroupId INT IDENTITY(1,1) PRIMARY KEY,
    AssetGroupKey NVARCHAR(100) NOT NULL UNIQUE,
    AssetGroupName NVARCHAR(150) NOT NULL,
    GroupType NVARCHAR(100) NULL, -- Room Setup, Staff Kit, Lab Setup, Network Rack
    RoomId INT NULL,
    DepartmentId INT NULL,
    LocationId INT NULL,
    VisibilityStatusId INT NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedBy INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_ITAssetGroups_Rooms FOREIGN KEY (RoomId) REFERENCES dbo.Rooms(RoomId),
    CONSTRAINT FK_ITAssetGroups_Departments FOREIGN KEY (DepartmentId) REFERENCES dbo.Departments(DepartmentId),
    CONSTRAINT FK_ITAssetGroups_Locations FOREIGN KEY (LocationId) REFERENCES dbo.Locations(LocationId),
    CONSTRAINT FK_ITAssetGroups_VisibilityStatuses FOREIGN KEY (VisibilityStatusId) REFERENCES dbo.FeatureVisibilityStatuses(VisibilityStatusId),
    CONSTRAINT FK_ITAssetGroups_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.ITAssetGroupItems (
    AssetGroupItemId INT IDENTITY(1,1) PRIMARY KEY,
    AssetGroupId INT NOT NULL,
    AssetId INT NOT NULL,
    RoleInGroup NVARCHAR(100) NULL, -- Main PC, Projector, Speaker, AP, Phone
    AddedBy INT NULL,
    AddedAt DATETIME NOT NULL DEFAULT GETDATE(),
    RemovedAt DATETIME NULL,
    CONSTRAINT UQ_ITAssetGroupItems UNIQUE (AssetGroupId, AssetId),
    CONSTRAINT FK_ITAssetGroupItems_Groups FOREIGN KEY (AssetGroupId) REFERENCES dbo.ITAssetGroups(AssetGroupId),
    CONSTRAINT FK_ITAssetGroupItems_Assets FOREIGN KEY (AssetId) REFERENCES dbo.ITAssets(AssetId),
    CONSTRAINT FK_ITAssetGroupItems_AddedBy FOREIGN KEY (AddedBy) REFERENCES dbo.Users(UserId)
);
GO

/* -----------------------------
   Asset Transfer Requests
   ----------------------------- */

CREATE TABLE dbo.ITAssetTransferRequests (
    AssetTransferRequestId INT IDENTITY(1,1) PRIMARY KEY,
    TransferRequestNumber NVARCHAR(50) NOT NULL UNIQUE,
    AssetId INT NOT NULL,
    RequestedBy INT NOT NULL,
    ApprovedBy INT NULL,
    FromUserId INT NULL,
    ToUserId INT NULL,
    FromRoomId INT NULL,
    ToRoomId INT NULL,
    FromDepartmentId INT NULL,
    ToDepartmentId INT NULL,
    FromLocationId INT NULL,
    ToLocationId INT NULL,
    TransferReason NVARCHAR(MAX) NULL,
    TransferStatus NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    RequestedAt DATETIME NOT NULL DEFAULT GETDATE(),
    ApprovedAt DATETIME NULL,
    CompletedAt DATETIME NULL,
    CONSTRAINT FK_ITAssetTransferRequests_Assets FOREIGN KEY (AssetId) REFERENCES dbo.ITAssets(AssetId),
    CONSTRAINT FK_ITAssetTransferRequests_RequestedBy FOREIGN KEY (RequestedBy) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_ITAssetTransferRequests_ApprovedBy FOREIGN KEY (ApprovedBy) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_ITAssetTransferRequests_FromUser FOREIGN KEY (FromUserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_ITAssetTransferRequests_ToUser FOREIGN KEY (ToUserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_ITAssetTransferRequests_FromRoom FOREIGN KEY (FromRoomId) REFERENCES dbo.Rooms(RoomId),
    CONSTRAINT FK_ITAssetTransferRequests_ToRoom FOREIGN KEY (ToRoomId) REFERENCES dbo.Rooms(RoomId),
    CONSTRAINT FK_ITAssetTransferRequests_FromDepartment FOREIGN KEY (FromDepartmentId) REFERENCES dbo.Departments(DepartmentId),
    CONSTRAINT FK_ITAssetTransferRequests_ToDepartment FOREIGN KEY (ToDepartmentId) REFERENCES dbo.Departments(DepartmentId),
    CONSTRAINT FK_ITAssetTransferRequests_FromLocation FOREIGN KEY (FromLocationId) REFERENCES dbo.Locations(LocationId),
    CONSTRAINT FK_ITAssetTransferRequests_ToLocation FOREIGN KEY (ToLocationId) REFERENCES dbo.Locations(LocationId)
);
GO

/* -----------------------------
   Notification Preferences
   ----------------------------- */

CREATE TABLE dbo.NotificationChannels (
    NotificationChannelId INT IDENTITY(1,1) PRIMARY KEY,
    ChannelKey NVARCHAR(100) NOT NULL UNIQUE,
    ChannelName NVARCHAR(150) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1
);
GO

CREATE TABLE dbo.NotificationPreferenceTypes (
    NotificationPreferenceTypeId INT IDENTITY(1,1) PRIMARY KEY,
    PreferenceKey NVARCHAR(100) NOT NULL UNIQUE,
    PreferenceName NVARCHAR(150) NOT NULL,
    Description NVARCHAR(255) NULL,
    IsActive BIT NOT NULL DEFAULT 1
);
GO

CREATE TABLE dbo.UserNotificationPreferences (
    UserNotificationPreferenceId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    NotificationPreferenceTypeId INT NOT NULL,
    NotificationChannelId INT NOT NULL,
    IsEnabled BIT NOT NULL DEFAULT 1,
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_UserNotificationPreferences UNIQUE (UserId, NotificationPreferenceTypeId, NotificationChannelId),
    CONSTRAINT FK_UserNotificationPreferences_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_UserNotificationPreferences_Types FOREIGN KEY (NotificationPreferenceTypeId) REFERENCES dbo.NotificationPreferenceTypes(NotificationPreferenceTypeId),
    CONSTRAINT FK_UserNotificationPreferences_Channels FOREIGN KEY (NotificationChannelId) REFERENCES dbo.NotificationChannels(NotificationChannelId)
);
GO

/* -----------------------------
   Report Definitions
   ----------------------------- */

CREATE TABLE dbo.ReportDefinitions (
    ReportDefinitionId INT IDENTITY(1,1) PRIMARY KEY,
    ReportKey NVARCHAR(100) NOT NULL UNIQUE,
    ReportName NVARCHAR(150) NOT NULL,
    ModuleId INT NULL,
    Description NVARCHAR(255) NULL,
    DataSourceKey NVARCHAR(100) NULL,
    DefaultFiltersJson NVARCHAR(MAX) NULL,
    PermissionId INT NULL,
    VisibilityStatusId INT NOT NULL,
    CreatedBy INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_ReportDefinitions_Modules FOREIGN KEY (ModuleId) REFERENCES dbo.Modules(ModuleId),
    CONSTRAINT FK_ReportDefinitions_Permissions FOREIGN KEY (PermissionId) REFERENCES dbo.Permissions(PermissionId),
    CONSTRAINT FK_ReportDefinitions_VisibilityStatuses FOREIGN KEY (VisibilityStatusId) REFERENCES dbo.FeatureVisibilityStatuses(VisibilityStatusId),
    CONSTRAINT FK_ReportDefinitions_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.SavedReports (
    SavedReportId INT IDENTITY(1,1) PRIMARY KEY,
    ReportDefinitionId INT NOT NULL,
    UserId INT NOT NULL,
    SavedReportName NVARCHAR(150) NOT NULL,
    FiltersJson NVARCHAR(MAX) NULL,
    IsShared BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_SavedReports_Definitions FOREIGN KEY (ReportDefinitionId) REFERENCES dbo.ReportDefinitions(ReportDefinitionId),
    CONSTRAINT FK_SavedReports_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
);
GO

/* -----------------------------
   System Health / Job Logs
   ----------------------------- */

CREATE TABLE dbo.SystemHealthLogs (
    SystemHealthLogId INT IDENTITY(1,1) PRIMARY KEY,
    ServiceName NVARCHAR(150) NOT NULL,
    HealthStatus NVARCHAR(50) NOT NULL,
    Message NVARCHAR(MAX) NULL,
    CheckedAt DATETIME NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE dbo.BackgroundJobLogs (
    BackgroundJobLogId INT IDENTITY(1,1) PRIMARY KEY,
    JobKey NVARCHAR(100) NOT NULL,
    JobName NVARCHAR(150) NOT NULL,
    JobStatus NVARCHAR(50) NOT NULL,
    StartedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CompletedAt DATETIME NULL,
    ErrorMessage NVARCHAR(MAX) NULL
);
GO

/* -----------------------------
   Module / Permission / Menu Snapshots
   ----------------------------- */

CREATE TABLE dbo.ConfigurationSnapshots (
    ConfigurationSnapshotId INT IDENTITY(1,1) PRIMARY KEY,
    SnapshotType NVARCHAR(100) NOT NULL, -- Modules, Menus, Permissions, Widgets, Settings
    SnapshotName NVARCHAR(150) NOT NULL,
    SnapshotData NVARCHAR(MAX) NOT NULL,
    CreatedBy INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_ConfigurationSnapshots_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES dbo.Users(UserId)
);
GO

/* ============================================================
   20. SOFT DELETE COLUMNS FOR CRITICAL TABLES
   ============================================================ */

ALTER TABLE dbo.Users ADD IsDeleted BIT NOT NULL DEFAULT 0, DeletedAt DATETIME NULL, DeletedBy INT NULL;
GO
ALTER TABLE dbo.Users ADD CONSTRAINT FK_Users_DeletedBy FOREIGN KEY (DeletedBy) REFERENCES dbo.Users(UserId);
GO

ALTER TABLE dbo.ITAssets ADD IsDeleted BIT NOT NULL DEFAULT 0, DeletedAt DATETIME NULL, DeletedBy INT NULL;
GO
ALTER TABLE dbo.ITAssets ADD CONSTRAINT FK_ITAssets_DeletedBy FOREIGN KEY (DeletedBy) REFERENCES dbo.Users(UserId);
GO

ALTER TABLE dbo.PhotocopyRequests ADD IsDeleted BIT NOT NULL DEFAULT 0, DeletedAt DATETIME NULL, DeletedBy INT NULL;
GO
ALTER TABLE dbo.PhotocopyRequests ADD CONSTRAINT FK_PhotocopyRequests_DeletedBy FOREIGN KEY (DeletedBy) REFERENCES dbo.Users(UserId);
GO

ALTER TABLE dbo.Students ADD IsDeleted BIT NOT NULL DEFAULT 0, DeletedAt DATETIME NULL, DeletedBy INT NULL;
GO
ALTER TABLE dbo.Students ADD CONSTRAINT FK_Students_DeletedBy FOREIGN KEY (DeletedBy) REFERENCES dbo.Users(UserId);
GO

ALTER TABLE dbo.ITTickets ADD IsDeleted BIT NOT NULL DEFAULT 0, DeletedAt DATETIME NULL, DeletedBy INT NULL;
GO
ALTER TABLE dbo.ITTickets ADD CONSTRAINT FK_ITTickets_DeletedBy FOREIGN KEY (DeletedBy) REFERENCES dbo.Users(UserId);
GO

/* ============================================================
   21. FINAL ADDITION INDEXES
   ============================================================ */

CREATE INDEX IX_BackupJobs_Status_StartedAt ON dbo.BackupJobs(BackupStatus, StartedAt DESC);
CREATE INDEX IX_ArchiveRecords_Entity ON dbo.ArchiveRecords(EntityType, EntityId);
CREATE INDEX IX_ImportErrorLogs_Type_Batch ON dbo.ImportErrorLogs(ImportType, BatchId, IsResolved);
CREATE INDEX IX_ITAssetGroups_Room ON dbo.ITAssetGroups(RoomId);
CREATE INDEX IX_ITAssetGroupItems_Asset ON dbo.ITAssetGroupItems(AssetId);
CREATE INDEX IX_ITAssetTransferRequests_Asset_Status ON dbo.ITAssetTransferRequests(AssetId, TransferStatus);
CREATE INDEX IX_ReportDefinitions_Module ON dbo.ReportDefinitions(ModuleId);
CREATE INDEX IX_SystemHealthLogs_Service_CheckedAt ON dbo.SystemHealthLogs(ServiceName, CheckedAt DESC);
CREATE INDEX IX_BackgroundJobLogs_Job_Status ON dbo.BackgroundJobLogs(JobKey, JobStatus, StartedAt DESC);
GO

/* ============================================================
   22. FINAL ADDITION SEED DATA
   ============================================================ */

DECLARE @EnabledFinal INT = (SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Enabled');
DECLARE @HiddenFinal INT = (SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Hidden');
DECLARE @DisabledFinal INT = (SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Disabled');

INSERT INTO dbo.NotificationChannels (ChannelKey, ChannelName)
VALUES
('InApp', 'In-App Notification'),
('Email', 'Email'),
('System', 'System Alert');
GO

INSERT INTO dbo.NotificationPreferenceTypes (PreferenceKey, PreferenceName, Description)
VALUES
('PrintingUpdates', 'Printing Updates', 'Printing request status and approval updates'),
('AssetUpdates', 'Asset Updates', 'Asset assignment, transfer and repair updates'),
('StudentIdUpdates', 'Student ID Updates', 'Student ID verification and approval updates'),
('SecurityAlerts', 'Security Alerts', 'Login, password and security alerts'),
('SystemAnnouncements', 'System Announcements', 'Platform announcements and banners');
GO

DECLARE @EnabledArchive INT = (SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Enabled');
DECLARE @HiddenArchive INT = (SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Hidden');

INSERT INTO dbo.ArchivePolicies (PolicyKey, PolicyName, EntityType, RetentionMonths, ArchiveByAcademicYear, VisibilityStatusId)
VALUES
('printing_requests_archive', 'Printing Requests Archive', 'PhotocopyRequests', 36, 1, @EnabledArchive),
('it_asset_history_archive', 'IT Asset History Archive', 'ITAssets', 60, 0, @HiddenArchive),
('it_tickets_archive', 'IT Tickets Archive', 'ITTickets', 36, 1, @HiddenArchive),
('student_id_archive', 'Student ID Archive', 'StudentIdBatches', 36, 1, @HiddenArchive);
GO

SELECT 'Final enterprise additions completed successfully.' AS FinalAdditionsResult;
GO



/* ============================================================
   23. v4 ENTERPRISE FOUNDATION ADDITIONS
   ============================================================ */

/* -----------------------------
   Multi-School / Tenant Support
   ----------------------------- */

CREATE TABLE dbo.Schools (
    SchoolId INT IDENTITY(1,1) PRIMARY KEY,
    SchoolCode NVARCHAR(50) NOT NULL UNIQUE,
    SchoolName NVARCHAR(255) NOT NULL,
    LogoFileId INT NULL,
    Address NVARCHAR(MAX) NULL,
    Phone NVARCHAR(100) NULL,
    Email NVARCHAR(255) NULL,
    Website NVARCHAR(255) NULL,
    TimeZone NVARCHAR(100) NOT NULL DEFAULT 'Asia/Dubai',
    CurrencyCode NVARCHAR(10) NOT NULL DEFAULT 'AED',
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_Schools_LogoFile FOREIGN KEY (LogoFileId) REFERENCES dbo.FileStorage(FileId)
);
GO

CREATE TABLE dbo.SchoolSettings (
    SchoolSettingId INT IDENTITY(1,1) PRIMARY KEY,
    SchoolId INT NOT NULL,
    SettingKey NVARCHAR(150) NOT NULL,
    SettingValue NVARCHAR(MAX) NULL,
    SettingGroup NVARCHAR(100) NULL,
    IsEditable BIT NOT NULL DEFAULT 1,
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_SchoolSettings UNIQUE (SchoolId, SettingKey),
    CONSTRAINT FK_SchoolSettings_Schools FOREIGN KEY (SchoolId) REFERENCES dbo.Schools(SchoolId)
);
GO

/* Add nullable SchoolId to key tables so current single-school use remains simple */
ALTER TABLE dbo.Users ADD SchoolId INT NULL;
GO
ALTER TABLE dbo.Users ADD CONSTRAINT FK_Users_Schools FOREIGN KEY (SchoolId) REFERENCES dbo.Schools(SchoolId);
GO

ALTER TABLE dbo.Departments ADD SchoolId INT NULL;
GO
ALTER TABLE dbo.Departments ADD CONSTRAINT FK_Departments_Schools FOREIGN KEY (SchoolId) REFERENCES dbo.Schools(SchoolId);
GO

ALTER TABLE dbo.Students ADD SchoolId INT NULL;
GO
ALTER TABLE dbo.Students ADD CONSTRAINT FK_Students_Schools FOREIGN KEY (SchoolId) REFERENCES dbo.Schools(SchoolId);
GO

ALTER TABLE dbo.ITAssets ADD SchoolId INT NULL;
GO
ALTER TABLE dbo.ITAssets ADD CONSTRAINT FK_ITAssets_Schools FOREIGN KEY (SchoolId) REFERENCES dbo.Schools(SchoolId);
GO

ALTER TABLE dbo.PhotocopyRequests ADD SchoolId INT NULL;
GO
ALTER TABLE dbo.PhotocopyRequests ADD CONSTRAINT FK_PhotocopyRequests_Schools FOREIGN KEY (SchoolId) REFERENCES dbo.Schools(SchoolId);
GO

/* -----------------------------
   Universal Status Engine
   ----------------------------- */

CREATE TABLE dbo.StatusGroups (
    StatusGroupId INT IDENTITY(1,1) PRIMARY KEY,
    StatusGroupKey NVARCHAR(100) NOT NULL UNIQUE,
    StatusGroupName NVARCHAR(150) NOT NULL,
    ModuleId INT NULL,
    EntityType NVARCHAR(100) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_StatusGroups_Modules FOREIGN KEY (ModuleId) REFERENCES dbo.Modules(ModuleId)
);
GO

CREATE TABLE dbo.StatusValues (
    StatusValueId INT IDENTITY(1,1) PRIMARY KEY,
    StatusGroupId INT NOT NULL,
    StatusKey NVARCHAR(100) NOT NULL,
    StatusName NVARCHAR(150) NOT NULL,
    ColorHex NVARCHAR(20) NULL,
    Icon NVARCHAR(100) NULL,
    IsInitial BIT NOT NULL DEFAULT 0,
    IsFinal BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT UQ_StatusValues_Group_Key UNIQUE (StatusGroupId, StatusKey),
    CONSTRAINT FK_StatusValues_Groups FOREIGN KEY (StatusGroupId) REFERENCES dbo.StatusGroups(StatusGroupId)
);
GO

/* -----------------------------
   Universal Files / Comments / Tags
   ----------------------------- */

CREATE TABLE dbo.EntityFiles (
    EntityFileId INT IDENTITY(1,1) PRIMARY KEY,
    EntityType NVARCHAR(100) NOT NULL,
    EntityId NVARCHAR(100) NOT NULL,
    FileId INT NOT NULL,
    FilePurpose NVARCHAR(100) NULL, -- Photo, Attachment, Invoice, Warranty, Evidence, Damage Photo
    UploadedBy INT NULL,
    UploadedAt DATETIME NOT NULL DEFAULT GETDATE(),
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletedAt DATETIME NULL,
    DeletedBy INT NULL,
    CONSTRAINT FK_EntityFiles_FileStorage FOREIGN KEY (FileId) REFERENCES dbo.FileStorage(FileId),
    CONSTRAINT FK_EntityFiles_UploadedBy FOREIGN KEY (UploadedBy) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_EntityFiles_DeletedBy FOREIGN KEY (DeletedBy) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.EntityComments (
    EntityCommentId INT IDENTITY(1,1) PRIMARY KEY,
    EntityType NVARCHAR(100) NOT NULL,
    EntityId NVARCHAR(100) NOT NULL,
    CommentText NVARCHAR(MAX) NOT NULL,
    CommentType NVARCHAR(100) NULL,
    CreatedBy INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletedAt DATETIME NULL,
    DeletedBy INT NULL,
    CONSTRAINT FK_EntityComments_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_EntityComments_DeletedBy FOREIGN KEY (DeletedBy) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.Tags (
    TagId INT IDENTITY(1,1) PRIMARY KEY,
    TagKey NVARCHAR(100) NOT NULL UNIQUE,
    TagName NVARCHAR(150) NOT NULL,
    ColorHex NVARCHAR(20) NULL,
    ModuleId INT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Tags_Modules FOREIGN KEY (ModuleId) REFERENCES dbo.Modules(ModuleId)
);
GO

CREATE TABLE dbo.EntityTags (
    EntityTagId INT IDENTITY(1,1) PRIMARY KEY,
    EntityType NVARCHAR(100) NOT NULL,
    EntityId NVARCHAR(100) NOT NULL,
    TagId INT NOT NULL,
    TaggedBy INT NULL,
    TaggedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_EntityTags UNIQUE (EntityType, EntityId, TagId),
    CONSTRAINT FK_EntityTags_Tags FOREIGN KEY (TagId) REFERENCES dbo.Tags(TagId),
    CONSTRAINT FK_EntityTags_TaggedBy FOREIGN KEY (TaggedBy) REFERENCES dbo.Users(UserId)
);
GO

/* -----------------------------
   Lookup Manager
   ----------------------------- */

CREATE TABLE dbo.LookupCategories (
    LookupCategoryId INT IDENTITY(1,1) PRIMARY KEY,
    CategoryKey NVARCHAR(100) NOT NULL UNIQUE,
    CategoryName NVARCHAR(150) NOT NULL,
    ModuleId INT NULL,
    IsSystemCategory BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_LookupCategories_Modules FOREIGN KEY (ModuleId) REFERENCES dbo.Modules(ModuleId)
);
GO

CREATE TABLE dbo.LookupValues (
    LookupValueId INT IDENTITY(1,1) PRIMARY KEY,
    LookupCategoryId INT NOT NULL,
    ValueKey NVARCHAR(100) NOT NULL,
    ValueName NVARCHAR(150) NOT NULL,
    ValueDescription NVARCHAR(255) NULL,
    ParentLookupValueId INT NULL,
    ColorHex NVARCHAR(20) NULL,
    Icon NVARCHAR(100) NULL,
    IsSystemValue BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT UQ_LookupValues_Category_Key UNIQUE (LookupCategoryId, ValueKey),
    CONSTRAINT FK_LookupValues_Categories FOREIGN KEY (LookupCategoryId) REFERENCES dbo.LookupCategories(LookupCategoryId),
    CONSTRAINT FK_LookupValues_Parent FOREIGN KEY (ParentLookupValueId) REFERENCES dbo.LookupValues(LookupValueId)
);
GO

/* -----------------------------
   Calendar Engine
   ----------------------------- */

CREATE TABLE dbo.CalendarEventTypes (
    CalendarEventTypeId INT IDENTITY(1,1) PRIMARY KEY,
    EventTypeKey NVARCHAR(100) NOT NULL UNIQUE,
    EventTypeName NVARCHAR(150) NOT NULL,
    ModuleId INT NULL,
    ColorHex NVARCHAR(20) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_CalendarEventTypes_Modules FOREIGN KEY (ModuleId) REFERENCES dbo.Modules(ModuleId)
);
GO

CREATE TABLE dbo.CalendarEvents (
    CalendarEventId INT IDENTITY(1,1) PRIMARY KEY,
    SchoolId INT NULL,
    CalendarEventTypeId INT NOT NULL,
    Title NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    StartAt DATETIME NOT NULL,
    EndAt DATETIME NULL,
    IsAllDay BIT NOT NULL DEFAULT 0,
    LocationText NVARCHAR(255) NULL,
    RoomId INT NULL,
    EntityType NVARCHAR(100) NULL,
    EntityId NVARCHAR(100) NULL,
    CreatedBy INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_CalendarEvents_Schools FOREIGN KEY (SchoolId) REFERENCES dbo.Schools(SchoolId),
    CONSTRAINT FK_CalendarEvents_Types FOREIGN KEY (CalendarEventTypeId) REFERENCES dbo.CalendarEventTypes(CalendarEventTypeId),
    CONSTRAINT FK_CalendarEvents_Rooms FOREIGN KEY (RoomId) REFERENCES dbo.Rooms(RoomId),
    CONSTRAINT FK_CalendarEvents_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.CalendarEventAttendees (
    CalendarEventAttendeeId INT IDENTITY(1,1) PRIMARY KEY,
    CalendarEventId INT NOT NULL,
    UserId INT NULL,
    Email NVARCHAR(255) NULL,
    ResponseStatus NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_CalendarEventAttendees_Events FOREIGN KEY (CalendarEventId) REFERENCES dbo.CalendarEvents(CalendarEventId),
    CONSTRAINT FK_CalendarEventAttendees_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
);
GO

/* -----------------------------
   Task Engine
   ----------------------------- */

CREATE TABLE dbo.Tasks (
    TaskId INT IDENTITY(1,1) PRIMARY KEY,
    TaskNumber NVARCHAR(50) NOT NULL UNIQUE,
    Title NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    ModuleId INT NULL,
    EntityType NVARCHAR(100) NULL,
    EntityId NVARCHAR(100) NULL,
    Priority NVARCHAR(50) NOT NULL DEFAULT 'Normal',
    Status NVARCHAR(50) NOT NULL DEFAULT 'Open',
    DueAt DATETIME NULL,
    CreatedBy INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CompletedAt DATETIME NULL,
    CONSTRAINT FK_Tasks_Modules FOREIGN KEY (ModuleId) REFERENCES dbo.Modules(ModuleId),
    CONSTRAINT FK_Tasks_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.TaskAssignments (
    TaskAssignmentId INT IDENTITY(1,1) PRIMARY KEY,
    TaskId INT NOT NULL,
    AssignedToUserId INT NOT NULL,
    AssignedByUserId INT NULL,
    AssignedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CompletedAt DATETIME NULL,
    CONSTRAINT FK_TaskAssignments_Tasks FOREIGN KEY (TaskId) REFERENCES dbo.Tasks(TaskId),
    CONSTRAINT FK_TaskAssignments_AssignedTo FOREIGN KEY (AssignedToUserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_TaskAssignments_AssignedBy FOREIGN KEY (AssignedByUserId) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.TaskChecklistItems (
    TaskChecklistItemId INT IDENTITY(1,1) PRIMARY KEY,
    TaskId INT NOT NULL,
    ChecklistText NVARCHAR(255) NOT NULL,
    IsCompleted BIT NOT NULL DEFAULT 0,
    CompletedBy INT NULL,
    CompletedAt DATETIME NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    CONSTRAINT FK_TaskChecklistItems_Tasks FOREIGN KEY (TaskId) REFERENCES dbo.Tasks(TaskId),
    CONSTRAINT FK_TaskChecklistItems_CompletedBy FOREIGN KEY (CompletedBy) REFERENCES dbo.Users(UserId)
);
GO

/* -----------------------------
   Integration Manager
   ----------------------------- */

CREATE TABLE dbo.Integrations (
    IntegrationId INT IDENTITY(1,1) PRIMARY KEY,
    IntegrationKey NVARCHAR(100) NOT NULL UNIQUE,
    IntegrationName NVARCHAR(150) NOT NULL,
    IntegrationType NVARCHAR(100) NOT NULL, -- SMTP, Microsoft365, Google, SMS, WhatsApp, FortiGate, SIS
    VisibilityStatusId INT NOT NULL,
    IsConfigured BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_Integrations_VisibilityStatuses FOREIGN KEY (VisibilityStatusId) REFERENCES dbo.FeatureVisibilityStatuses(VisibilityStatusId)
);
GO

CREATE TABLE dbo.IntegrationSettings (
    IntegrationSettingId INT IDENTITY(1,1) PRIMARY KEY,
    IntegrationId INT NOT NULL,
    SettingKey NVARCHAR(150) NOT NULL,
    SettingValue NVARCHAR(MAX) NULL,
    IsSecret BIT NOT NULL DEFAULT 0,
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_IntegrationSettings UNIQUE (IntegrationId, SettingKey),
    CONSTRAINT FK_IntegrationSettings_Integrations FOREIGN KEY (IntegrationId) REFERENCES dbo.Integrations(IntegrationId)
);
GO

CREATE TABLE dbo.ApiKeys (
    ApiKeyId INT IDENTITY(1,1) PRIMARY KEY,
    ApiKeyName NVARCHAR(150) NOT NULL,
    ApiKeyHash NVARCHAR(255) NOT NULL UNIQUE,
    ScopeJson NVARCHAR(MAX) NULL,
    CreatedBy INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    ExpiresAt DATETIME NULL,
    RevokedAt DATETIME NULL,
    CONSTRAINT FK_ApiKeys_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES dbo.Users(UserId)
);
GO

/* -----------------------------
   Scheduled Jobs
   ----------------------------- */

CREATE TABLE dbo.ScheduledJobs (
    ScheduledJobId INT IDENTITY(1,1) PRIMARY KEY,
    JobKey NVARCHAR(100) NOT NULL UNIQUE,
    JobName NVARCHAR(150) NOT NULL,
    JobDescription NVARCHAR(255) NULL,
    CronExpression NVARCHAR(100) NULL,
    RunEveryMinutes INT NULL,
    VisibilityStatusId INT NOT NULL,
    IsEnabled BIT NOT NULL DEFAULT 1,
    LastRunAt DATETIME NULL,
    NextRunAt DATETIME NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_ScheduledJobs_VisibilityStatuses FOREIGN KEY (VisibilityStatusId) REFERENCES dbo.FeatureVisibilityStatuses(VisibilityStatusId)
);
GO

/* -----------------------------
   KPI Engine
   ----------------------------- */

CREATE TABLE dbo.KPIDefinitions (
    KPIDefinitionId INT IDENTITY(1,1) PRIMARY KEY,
    KPIKey NVARCHAR(100) NOT NULL UNIQUE,
    KPIName NVARCHAR(150) NOT NULL,
    ModuleId INT NULL,
    DataSourceKey NVARCHAR(100) NULL,
    CalculationSql NVARCHAR(MAX) NULL,
    Icon NVARCHAR(100) NULL,
    ColorHex NVARCHAR(20) NULL,
    VisibilityStatusId INT NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_KPIDefinitions_Modules FOREIGN KEY (ModuleId) REFERENCES dbo.Modules(ModuleId),
    CONSTRAINT FK_KPIDefinitions_VisibilityStatuses FOREIGN KEY (VisibilityStatusId) REFERENCES dbo.FeatureVisibilityStatuses(VisibilityStatusId)
);
GO

CREATE TABLE dbo.DashboardKPIs (
    DashboardKPIId INT IDENTITY(1,1) PRIMARY KEY,
    DashboardId INT NOT NULL,
    KPIDefinitionId INT NOT NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    IsVisible BIT NOT NULL DEFAULT 1,
    CONSTRAINT UQ_DashboardKPIs UNIQUE (DashboardId, KPIDefinitionId),
    CONSTRAINT FK_DashboardKPIs_Dashboards FOREIGN KEY (DashboardId) REFERENCES dbo.Dashboards(DashboardId),
    CONSTRAINT FK_DashboardKPIs_KPIs FOREIGN KEY (KPIDefinitionId) REFERENCES dbo.KPIDefinitions(KPIDefinitionId)
);
GO

/* -----------------------------
   Document Number Generator
   ----------------------------- */

CREATE TABLE dbo.DocumentSequences (
    DocumentSequenceId INT IDENTITY(1,1) PRIMARY KEY,
    SequenceKey NVARCHAR(100) NOT NULL UNIQUE,
    EntityType NVARCHAR(100) NOT NULL,
    Prefix NVARCHAR(50) NOT NULL,
    CurrentValue INT NOT NULL DEFAULT 0,
    PaddingLength INT NOT NULL DEFAULT 5,
    ResetEveryYear BIT NOT NULL DEFAULT 1,
    LastResetYear INT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE()
);
GO

/* -----------------------------
   Theme Manager / Localization
   ----------------------------- */

CREATE TABLE dbo.Themes (
    ThemeId INT IDENTITY(1,1) PRIMARY KEY,
    SchoolId INT NULL,
    ThemeKey NVARCHAR(100) NOT NULL UNIQUE,
    ThemeName NVARCHAR(150) NOT NULL,
    PrimaryColor NVARCHAR(20) NULL,
    SecondaryColor NVARCHAR(20) NULL,
    AccentColor NVARCHAR(20) NULL,
    SidebarStyle NVARCHAR(50) NULL,
    LogoFileId INT NULL,
    LoginBackgroundFileId INT NULL,
    IsDefault BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_Themes_Schools FOREIGN KEY (SchoolId) REFERENCES dbo.Schools(SchoolId),
    CONSTRAINT FK_Themes_LogoFile FOREIGN KEY (LogoFileId) REFERENCES dbo.FileStorage(FileId),
    CONSTRAINT FK_Themes_LoginBackground FOREIGN KEY (LoginBackgroundFileId) REFERENCES dbo.FileStorage(FileId)
);
GO

CREATE TABLE dbo.Languages (
    LanguageId INT IDENTITY(1,1) PRIMARY KEY,
    LanguageCode NVARCHAR(20) NOT NULL UNIQUE,
    LanguageName NVARCHAR(100) NOT NULL,
    IsDefault BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1
);
GO

CREATE TABLE dbo.Translations (
    TranslationId INT IDENTITY(1,1) PRIMARY KEY,
    LanguageId INT NOT NULL,
    TranslationKey NVARCHAR(200) NOT NULL,
    TranslationValue NVARCHAR(MAX) NOT NULL,
    ModuleId INT NULL,
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_Translations UNIQUE (LanguageId, TranslationKey),
    CONSTRAINT FK_Translations_Languages FOREIGN KEY (LanguageId) REFERENCES dbo.Languages(LanguageId),
    CONSTRAINT FK_Translations_Modules FOREIGN KEY (ModuleId) REFERENCES dbo.Modules(ModuleId)
);
GO

/* -----------------------------
   AI Ready Foundation
   ----------------------------- */

CREATE TABLE dbo.AIPrompts (
    AIPromptId INT IDENTITY(1,1) PRIMARY KEY,
    PromptKey NVARCHAR(100) NOT NULL UNIQUE,
    PromptName NVARCHAR(150) NOT NULL,
    ModuleId INT NULL,
    PromptText NVARCHAR(MAX) NOT NULL,
    VisibilityStatusId INT NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_AIPrompts_Modules FOREIGN KEY (ModuleId) REFERENCES dbo.Modules(ModuleId),
    CONSTRAINT FK_AIPrompts_VisibilityStatuses FOREIGN KEY (VisibilityStatusId) REFERENCES dbo.FeatureVisibilityStatuses(VisibilityStatusId)
);
GO

CREATE TABLE dbo.AIUsageLogs (
    AIUsageLogId INT IDENTITY(1,1) PRIMARY KEY,
    AIPromptId INT NULL,
    UserId INT NULL,
    ModuleKey NVARCHAR(100) NULL,
    EntityType NVARCHAR(100) NULL,
    EntityId NVARCHAR(100) NULL,
    InputSummary NVARCHAR(MAX) NULL,
    OutputSummary NVARCHAR(MAX) NULL,
    TokenCount INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_AIUsageLogs_Prompts FOREIGN KEY (AIPromptId) REFERENCES dbo.AIPrompts(AIPromptId),
    CONSTRAINT FK_AIUsageLogs_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
);
GO

/* ============================================================
   24. v4 INDEXES
   ============================================================ */

CREATE INDEX IX_Users_SchoolId ON dbo.Users(SchoolId);
CREATE INDEX IX_Departments_SchoolId ON dbo.Departments(SchoolId);
CREATE INDEX IX_Students_SchoolId ON dbo.Students(SchoolId);
CREATE INDEX IX_ITAssets_SchoolId ON dbo.ITAssets(SchoolId);
CREATE INDEX IX_PhotocopyRequests_SchoolId ON dbo.PhotocopyRequests(SchoolId);

CREATE INDEX IX_StatusValues_Group ON dbo.StatusValues(StatusGroupId, SortOrder);
CREATE INDEX IX_EntityFiles_Entity ON dbo.EntityFiles(EntityType, EntityId);
CREATE INDEX IX_EntityComments_Entity ON dbo.EntityComments(EntityType, EntityId, CreatedAt DESC);
CREATE INDEX IX_EntityTags_Entity ON dbo.EntityTags(EntityType, EntityId);
CREATE INDEX IX_LookupValues_Category ON dbo.LookupValues(LookupCategoryId, SortOrder);
CREATE INDEX IX_CalendarEvents_StartAt ON dbo.CalendarEvents(StartAt, EndAt);
CREATE INDEX IX_Tasks_Status_DueAt ON dbo.Tasks(Status, DueAt);
CREATE INDEX IX_ScheduledJobs_NextRun ON dbo.ScheduledJobs(IsEnabled, NextRunAt);
CREATE INDEX IX_DocumentSequences_Key ON dbo.DocumentSequences(SequenceKey);
GO

/* ============================================================
   25. v4 SEED DATA
   ============================================================ */

DECLARE @EnabledV4 INT = (SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Enabled');
DECLARE @HiddenV4 INT = (SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Hidden');
DECLARE @DisabledV4 INT = (SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Disabled');

INSERT INTO dbo.Schools (SchoolCode, SchoolName, Email, TimeZone, CurrencyCode)
VALUES ('AUS_DUBAI', 'Arab Unity School', 'info@arabunityschool.ae', 'Asia/Dubai', 'AED');
GO

DECLARE @SchoolIdV4 INT = (SELECT SchoolId FROM dbo.Schools WHERE SchoolCode = 'AUS_DUBAI');

UPDATE dbo.Departments SET SchoolId = @SchoolIdV4;
UPDATE dbo.Users SET SchoolId = @SchoolIdV4 WHERE SchoolId IS NULL;
GO

DECLARE @SchoolIdSettings INT = (SELECT SchoolId FROM dbo.Schools WHERE SchoolCode = 'AUS_DUBAI');

INSERT INTO dbo.SchoolSettings (SchoolId, SettingKey, SettingValue, SettingGroup)
VALUES
(@SchoolIdSettings, 'printing.approval.threshold_sheets', '500', 'Printing'),
(@SchoolIdSettings, 'registration.self_activation_enabled', 'true', 'Registration'),
(@SchoolIdSettings, 'student_id.homeroom_verification_required', 'true', 'Student ID'),
(@SchoolIdSettings, 'timezone', 'Asia/Dubai', 'General'),
(@SchoolIdSettings, 'currency', 'AED', 'General');
GO

INSERT INTO dbo.Languages (LanguageCode, LanguageName, IsDefault)
VALUES
('en', 'English', 1),
('ar', 'Arabic', 0);
GO

DECLARE @EnabledSeq INT = (SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Enabled');

INSERT INTO dbo.DocumentSequences (SequenceKey, EntityType, Prefix, CurrentValue, PaddingLength, ResetEveryYear)
VALUES
('printing_request', 'PhotocopyRequests', 'PR-', 0, 5, 1),
('it_ticket', 'ITTickets', 'IT-', 0, 5, 1),
('student_id_batch', 'StudentIdBatches', 'SID-', 0, 5, 1),
('asset_transfer', 'ITAssetTransferRequests', 'AT-', 0, 5, 1),
('task', 'Tasks', 'TASK-', 0, 5, 1);
GO

INSERT INTO dbo.CalendarEventTypes (EventTypeKey, EventTypeName, ColorHex)
VALUES
('General', 'General', '#64748B'),
('Maintenance', 'Maintenance', '#F59E0B'),
('Printing', 'Printing', '#0F766E'),
('StudentID', 'Student ID', '#2563EB'),
('Meeting', 'Meeting', '#7C3AED');
GO

INSERT INTO dbo.LookupCategories (CategoryKey, CategoryName, IsSystemCategory)
VALUES
('Priority', 'Priority', 1),
('Gender', 'Gender', 1),
('PrintSide', 'Print Side', 1),
('PaperSize', 'Paper Size', 1),
('IssuePriority', 'Issue Priority', 1);
GO

DECLARE @PriorityCat INT = (SELECT LookupCategoryId FROM dbo.LookupCategories WHERE CategoryKey='Priority');
DECLARE @GenderCat INT = (SELECT LookupCategoryId FROM dbo.LookupCategories WHERE CategoryKey='Gender');
DECLARE @PrintSideCat INT = (SELECT LookupCategoryId FROM dbo.LookupCategories WHERE CategoryKey='PrintSide');
DECLARE @PaperSizeCat INT = (SELECT LookupCategoryId FROM dbo.LookupCategories WHERE CategoryKey='PaperSize');

INSERT INTO dbo.LookupValues (LookupCategoryId, ValueKey, ValueName, SortOrder)
VALUES
(@PriorityCat, 'Low', 'Low', 1),
(@PriorityCat, 'Normal', 'Normal', 2),
(@PriorityCat, 'High', 'High', 3),
(@PriorityCat, 'Urgent', 'Urgent', 4),
(@GenderCat, 'Boys', 'Boys', 1),
(@GenderCat, 'Girls', 'Girls', 2),
(@PrintSideCat, 'SingleSided', 'Single Sided', 1),
(@PrintSideCat, 'DoubleSided', 'Double Sided', 2),
(@PaperSizeCat, 'A4', 'A4', 1),
(@PaperSizeCat, 'A3', 'A3', 2);
GO

DECLARE @EnabledTheme INT = (SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Enabled');
DECLARE @SchoolTheme INT = (SELECT SchoolId FROM dbo.Schools WHERE SchoolCode = 'AUS_DUBAI');

INSERT INTO dbo.Themes (SchoolId, ThemeKey, ThemeName, PrimaryColor, SecondaryColor, AccentColor, SidebarStyle, IsDefault)
VALUES (@SchoolTheme, 'aus_default', 'AUS Default Theme', '#0F766E', '#0F172A', '#22C55E', 'fixed-sidebar', 1);
GO

DECLARE @HiddenIntegration INT = (SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Hidden');
DECLARE @DisabledIntegration INT = (SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Disabled');

INSERT INTO dbo.Integrations (IntegrationKey, IntegrationName, IntegrationType, VisibilityStatusId, IsConfigured)
VALUES
('smtp_email', 'SMTP Email', 'SMTP', @HiddenIntegration, 0),
('microsoft_365', 'Microsoft 365', 'Microsoft365', @HiddenIntegration, 0),
('google_workspace', 'Google Workspace', 'Google', @HiddenIntegration, 0),
('sms_gateway', 'SMS Gateway', 'SMS', @DisabledIntegration, 0),
('fortigate', 'FortiGate', 'Firewall', @HiddenIntegration, 0);
GO

DECLARE @HiddenScheduledJob INT = (SELECT VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Hidden');

INSERT INTO dbo.ScheduledJobs (JobKey, JobName, JobDescription, RunEveryMinutes, VisibilityStatusId, IsEnabled)
VALUES
('email_queue_processor', 'Email Queue Processor', 'Processes pending email queue', 5, @HiddenScheduledJob, 0),
('backup_job', 'Database Backup Job', 'Runs scheduled database backup', 1440, @HiddenScheduledJob, 0),
('asset_maintenance_reminder', 'Asset Maintenance Reminder', 'Checks upcoming asset maintenance schedules', 1440, @HiddenScheduledJob, 0),
('archive_policy_runner', 'Archive Policy Runner', 'Runs archive policies', 1440, @HiddenScheduledJob, 0);
GO

SELECT 'v4 enterprise foundation additions completed successfully.' AS V4AdditionsResult;
GO



/* ============================================================
   v4.2 BRANDING FOUNDATION ADDITIONS
   ============================================================ */

/* ------------------------------------------------------------
   Dedicated Branding
   Purpose:
   - Store school logo, favicon, login background, colors, footer,
     and UI branding without hardcoding files in React.
   - Frontend should call GET /api/system/branding and render values.
   ------------------------------------------------------------ */

IF OBJECT_ID('dbo.Branding', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Branding (
        BrandingId INT IDENTITY(1,1) PRIMARY KEY,
        SchoolId INT NOT NULL,

        LogoFileId INT NULL,
        SmallLogoFileId INT NULL,
        DarkLogoFileId INT NULL,
        FaviconFileId INT NULL,
        LoginBackgroundFileId INT NULL,
        LoginVideoFileId INT NULL,

        PrimaryColor NVARCHAR(20) NULL,
        SecondaryColor NVARCHAR(20) NULL,
        AccentColor NVARCHAR(20) NULL,
        SidebarColor NVARCHAR(20) NULL,
        TopbarColor NVARCHAR(20) NULL,
        LoginCardColor NVARCHAR(20) NULL,

        LoginTitle NVARCHAR(255) NULL,
        LoginSubtitle NVARCHAR(255) NULL,
        FooterText NVARCHAR(500) NULL,

        Website NVARCHAR(255) NULL,
        SupportEmail NVARCHAR(255) NULL,
        SupportPhone NVARCHAR(100) NULL,

        IsActive BIT NOT NULL DEFAULT 1,
        UpdatedBy INT NULL,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME NULL,

        CONSTRAINT UQ_Branding_School UNIQUE (SchoolId),
        CONSTRAINT FK_Branding_Schools FOREIGN KEY (SchoolId) REFERENCES dbo.Schools(SchoolId),
        CONSTRAINT FK_Branding_LogoFile FOREIGN KEY (LogoFileId) REFERENCES dbo.FileStorage(FileId),
        CONSTRAINT FK_Branding_SmallLogoFile FOREIGN KEY (SmallLogoFileId) REFERENCES dbo.FileStorage(FileId),
        CONSTRAINT FK_Branding_DarkLogoFile FOREIGN KEY (DarkLogoFileId) REFERENCES dbo.FileStorage(FileId),
        CONSTRAINT FK_Branding_FaviconFile FOREIGN KEY (FaviconFileId) REFERENCES dbo.FileStorage(FileId),
        CONSTRAINT FK_Branding_LoginBackgroundFile FOREIGN KEY (LoginBackgroundFileId) REFERENCES dbo.FileStorage(FileId),
        CONSTRAINT FK_Branding_LoginVideoFile FOREIGN KEY (LoginVideoFileId) REFERENCES dbo.FileStorage(FileId),
        CONSTRAINT FK_Branding_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES dbo.Users(UserId)
    );
END
GO

/* ------------------------------------------------------------
   Branding Slides
   Purpose:
   - Optional login page carousel / announcement imagery.
   - Can be disabled/hidden through VisibilityStatus.
   ------------------------------------------------------------ */

IF OBJECT_ID('dbo.BrandingSlides', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.BrandingSlides (
        BrandingSlideId INT IDENTITY(1,1) PRIMARY KEY,
        BrandingId INT NOT NULL,
        FileId INT NULL,
        SlideTitle NVARCHAR(255) NULL,
        SlideSubtitle NVARCHAR(500) NULL,
        ButtonText NVARCHAR(100) NULL,
        ButtonUrl NVARCHAR(500) NULL,
        VisibilityStatusId INT NOT NULL,
        StartAt DATETIME NULL,
        EndAt DATETIME NULL,
        SortOrder INT NOT NULL DEFAULT 0,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME NULL,

        CONSTRAINT FK_BrandingSlides_Branding FOREIGN KEY (BrandingId) REFERENCES dbo.Branding(BrandingId),
        CONSTRAINT FK_BrandingSlides_FileStorage FOREIGN KEY (FileId) REFERENCES dbo.FileStorage(FileId),
        CONSTRAINT FK_BrandingSlides_VisibilityStatuses FOREIGN KEY (VisibilityStatusId) REFERENCES dbo.FeatureVisibilityStatuses(VisibilityStatusId)
    );
END
GO

/* ------------------------------------------------------------
   Document Branding
   Purpose:
   - Central branding for PDFs, reports, exported documents,
     inventory reports, printing reports, ID forms, etc.
   ------------------------------------------------------------ */

IF OBJECT_ID('dbo.DocumentBranding', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.DocumentBranding (
        DocumentBrandingId INT IDENTITY(1,1) PRIMARY KEY,
        SchoolId INT NOT NULL,
        BrandingKey NVARCHAR(100) NOT NULL,
        BrandingName NVARCHAR(150) NOT NULL,

        HeaderLogoFileId INT NULL,
        WatermarkFileId INT NULL,
        SignatureFileId INT NULL,

        HeaderText NVARCHAR(500) NULL,
        FooterText NVARCHAR(500) NULL,
        DisclaimerText NVARCHAR(MAX) NULL,

        PrimaryColor NVARCHAR(20) NULL,
        SecondaryColor NVARCHAR(20) NULL,

        IsDefault BIT NOT NULL DEFAULT 0,
        IsActive BIT NOT NULL DEFAULT 1,
        UpdatedBy INT NULL,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME NULL,

        CONSTRAINT UQ_DocumentBranding_School_Key UNIQUE (SchoolId, BrandingKey),
        CONSTRAINT FK_DocumentBranding_Schools FOREIGN KEY (SchoolId) REFERENCES dbo.Schools(SchoolId),
        CONSTRAINT FK_DocumentBranding_HeaderLogoFile FOREIGN KEY (HeaderLogoFileId) REFERENCES dbo.FileStorage(FileId),
        CONSTRAINT FK_DocumentBranding_WatermarkFile FOREIGN KEY (WatermarkFileId) REFERENCES dbo.FileStorage(FileId),
        CONSTRAINT FK_DocumentBranding_SignatureFile FOREIGN KEY (SignatureFileId) REFERENCES dbo.FileStorage(FileId),
        CONSTRAINT FK_DocumentBranding_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES dbo.Users(UserId)
    );
END
GO

/* ------------------------------------------------------------
   Email Template Branding Upgrade
   Purpose:
   - Let system emails use school logo/footer without hardcoding.
   ------------------------------------------------------------ */

IF COL_LENGTH('dbo.EmailTemplates', 'SchoolId') IS NULL
BEGIN
    ALTER TABLE dbo.EmailTemplates ADD SchoolId INT NULL;
    ALTER TABLE dbo.EmailTemplates ADD HeaderLogoFileId INT NULL;
    ALTER TABLE dbo.EmailTemplates ADD FooterText NVARCHAR(500) NULL;

    ALTER TABLE dbo.EmailTemplates
    ADD CONSTRAINT FK_EmailTemplates_Schools
    FOREIGN KEY (SchoolId) REFERENCES dbo.Schools(SchoolId);

    ALTER TABLE dbo.EmailTemplates
    ADD CONSTRAINT FK_EmailTemplates_HeaderLogoFile
    FOREIGN KEY (HeaderLogoFileId) REFERENCES dbo.FileStorage(FileId);
END
GO

/* ------------------------------------------------------------
   Theme Cleanup/Alignment
   Note:
   - Themes may still contain LogoFileId/LoginBackgroundFileId
     from earlier schema versions.
   - Keep them nullable for backward compatibility.
   - Branding table is now the source of truth for logos/images.
   ------------------------------------------------------------ */

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_Branding_School'
      AND object_id = OBJECT_ID('dbo.Branding')
)
BEGIN
    CREATE INDEX IX_Branding_School ON dbo.Branding(SchoolId);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_BrandingSlides_Branding'
      AND object_id = OBJECT_ID('dbo.BrandingSlides')
)
BEGIN
    CREATE INDEX IX_BrandingSlides_Branding ON dbo.BrandingSlides(BrandingId, SortOrder);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_DocumentBranding_School'
      AND object_id = OBJECT_ID('dbo.DocumentBranding')
)
BEGIN
    CREATE INDEX IX_DocumentBranding_School ON dbo.DocumentBranding(SchoolId, IsDefault);
END
GO

/* ------------------------------------------------------------
   Branding Seed
   The logo files are intentionally NULL until you upload them.
   After upload, the UI/backend will update LogoFileId/FaviconFileId.
   ------------------------------------------------------------ */

DECLARE @BrandingSchoolId INT = (SELECT TOP 1 SchoolId FROM dbo.Schools WHERE SchoolCode = 'AUS_DUBAI');
DECLARE @BrandingEnabledId INT = (SELECT TOP 1 VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE StatusKey = 'Enabled');

IF @BrandingSchoolId IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM dbo.Branding WHERE SchoolId = @BrandingSchoolId)
BEGIN
    INSERT INTO dbo.Branding (
        SchoolId,
        LogoFileId,
        SmallLogoFileId,
        DarkLogoFileId,
        FaviconFileId,
        LoginBackgroundFileId,
        LoginVideoFileId,
        PrimaryColor,
        SecondaryColor,
        AccentColor,
        SidebarColor,
        TopbarColor,
        LoginCardColor,
        LoginTitle,
        LoginSubtitle,
        FooterText,
        Website,
        SupportEmail,
        SupportPhone,
        IsActive
    )
    VALUES (
        @BrandingSchoolId,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        '#0F766E',
        '#0F172A',
        '#22C55E',
        '#0F172A',
        '#FFFFFF',
        '#FFFFFF',
        'Operations Platform',
        'Arab Unity School',
        '© Arab Unity School. All rights reserved.',
        'https://www.arabunityschool.ae',
        'fredelson@arabunityschool.ae',
        NULL,
        1
    );
END
GO

DECLARE @DocBrandingSchoolId INT = (SELECT TOP 1 SchoolId FROM dbo.Schools WHERE SchoolCode = 'AUS_DUBAI');

IF @DocBrandingSchoolId IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM dbo.DocumentBranding
    WHERE SchoolId = @DocBrandingSchoolId
      AND BrandingKey = 'aus_default_document'
)
BEGIN
    INSERT INTO dbo.DocumentBranding (
        SchoolId,
        BrandingKey,
        BrandingName,
        HeaderLogoFileId,
        WatermarkFileId,
        SignatureFileId,
        HeaderText,
        FooterText,
        DisclaimerText,
        PrimaryColor,
        SecondaryColor,
        IsDefault,
        IsActive
    )
    VALUES (
        @DocBrandingSchoolId,
        'aus_default_document',
        'AUS Default Document Branding',
        NULL,
        NULL,
        NULL,
        'Arab Unity School',
        'Generated by Operations Platform',
        NULL,
        '#0F766E',
        '#0F172A',
        1,
        1
    );
END
GO

SELECT 'v4.2 branding foundation additions completed successfully.' AS BrandingResult;
GO




/* ============================================================
   REQUIRED SUPER ADMIN SEED
   A0297 / Fred / fredelson@arabunityschool.ae

   Replace @TempPasswordHash with a real bcrypt hash before
   testing real login.
   ============================================================ */

USE [OperationsPlatformDB];
GO

DECLARE @TempPasswordHash NVARCHAR(MAX) = N'$2b$10$REPLACE_WITH_REAL_BCRYPT_HASH';
DECLARE @FredSchoolId INT = (SELECT TOP 1 SchoolId FROM dbo.Schools WHERE SchoolCode = 'AUS_DUBAI');
DECLARE @FredRoleId INT = (SELECT TOP 1 RoleId FROM dbo.Roles WHERE RoleKey = 'SuperAdmin');
DECLARE @FredDepartmentId INT = (SELECT TOP 1 DepartmentId FROM dbo.Departments WHERE DepartmentName = 'IT Department');

IF @FredRoleId IS NULL
BEGIN
    THROW 51000, 'SuperAdmin role was not found. Check system role seed first.', 1;
END;

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE EmployeeId = N'A0297')
BEGIN
    INSERT INTO dbo.Users (
        EmployeeId,
        FullName,
        SchoolEmail,
        PasswordHash,
        RoleId,
        DepartmentId,
        SectionId,
        SchoolId,
        LegacyRole,
        MustChangePassword,
        EmailVerified,
        IsRegistrationCompleted,
        IsActive
    )
    VALUES (
        N'A0297',
        N'Fred',
        N'fredelson@arabunityschool.ae',
        @TempPasswordHash,
        @FredRoleId,
        @FredDepartmentId,
        NULL,
        @FredSchoolId,
        N'SuperAdmin',
        1,
        1,
        1,
        1
    );
END
ELSE
BEGIN
    UPDATE dbo.Users
    SET
        FullName = N'Fred',
        SchoolEmail = N'fredelson@arabunityschool.ae',
        RoleId = @FredRoleId,
        DepartmentId = @FredDepartmentId,
        SectionId = NULL,
        SchoolId = @FredSchoolId,
        LegacyRole = N'SuperAdmin',
        IsActive = 1,
        IsDeleted = 0,
        UpdatedAt = GETDATE()
    WHERE EmployeeId = N'A0297';
END
GO

SELECT 'Fred SuperAdmin seed completed.' AS Result;
GO

SELECT 'System seed completed successfully.' AS Result;
GO
