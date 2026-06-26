/* ============================================================
   OPERATIONS PLATFORM
   002_CreateTables.sql

   Creates the full enterprise schema objects.
   Run after 001_CreateDatabase.sql.

   SAFE:
   - Does NOT remove database.
   - Does NOT remove tables.
   - Best run on a fresh OperationsPlatformDB.
   ============================================================ */

/* ============================================================
   ARAB UNITY SCHOOL OPERATIONS PLATFORM
   FULL SYSTEM DATABASE SCHEMA - SAFE NEW DATABASE VERSION v2.0

   Includes:
   - Core users, roles, permissions
   - Staff import
   - Staff assignments and flexible assignment scopes
   - Academic structure
   - Student ID workflow
   - Printing management
   - Paper inventory
   - Advanced IT Asset Management
   - IT asset category detail tables
   - Rooms / Buildings / Locations
   - IT issue types and logs
   - IT asset notes instead of messy remarks
   - Asset lifecycle/status history
   - Feature visibility: Enabled / Hidden / Disabled
   - Sidebar/Menu Manager
   - Workspace Profiles
   - Dashboard Builder
   - Widget Manager
   - Topbar Manager
   - Quick Actions
   - Announcement Banners
   - Global Search configuration
   - Workflow engine
   - Security, audit, files, notifications

   IMPORTANT:
   - This script creates OperationsPlatformDB if it does not exist.
   - This script does NOT drop OperationsPlatformDB. Keep your old database as backup/reference.
   ============================================================ */

USE [OperationsPlatformDB];
GO


/* ============================================================
   1. COMMON LOOKUP / VISIBILITY
   ============================================================ */

CREATE TABLE dbo.FeatureVisibilityStatuses (
    VisibilityStatusId INT IDENTITY(1,1) PRIMARY KEY,
    StatusKey NVARCHAR(50) NOT NULL UNIQUE,
    StatusName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255) NULL,
    SortOrder INT NOT NULL DEFAULT 0
);
GO

/* ============================================================
   2. ACADEMIC / ORGANIZATION FOUNDATION
   ============================================================ */

CREATE TABLE dbo.AcademicYears (
    AcademicYearId INT IDENTITY(1,1) PRIMARY KEY,
    AcademicYearName NVARCHAR(50) NOT NULL UNIQUE,
    StartDate DATE NULL,
    EndDate DATE NULL,
    IsCurrent BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL
);
GO

CREATE TABLE dbo.Terms (
    TermId INT IDENTITY(1,1) PRIMARY KEY,
    AcademicYearId INT NOT NULL,
    TermKey NVARCHAR(50) NOT NULL,
    TermName NVARCHAR(100) NOT NULL,
    StartDate DATE NULL,
    EndDate DATE NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT UQ_Terms_AcademicYear_TermKey UNIQUE (AcademicYearId, TermKey),
    CONSTRAINT FK_Terms_AcademicYears FOREIGN KEY (AcademicYearId) REFERENCES dbo.AcademicYears(AcademicYearId)
);
GO

CREATE TABLE dbo.Sections (
    SectionId INT IDENTITY(1,1) PRIMARY KEY,
    SectionKey NVARCHAR(50) NOT NULL UNIQUE,
    SectionName NVARCHAR(100) NOT NULL UNIQUE,
    IsActive BIT NOT NULL DEFAULT 1,
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL
);
GO

CREATE TABLE dbo.YearLevels (
    YearLevelId INT IDENTITY(1,1) PRIMARY KEY,
    SectionId INT NULL,
    YearLevelKey NVARCHAR(50) NOT NULL UNIQUE,
    YearLevelName NVARCHAR(100) NOT NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_YearLevels_Sections FOREIGN KEY (SectionId) REFERENCES dbo.Sections(SectionId)
);
GO

CREATE TABLE dbo.Departments (
    DepartmentId INT IDENTITY(1,1) PRIMARY KEY,
    DepartmentKey NVARCHAR(50) NOT NULL UNIQUE,
    DepartmentName NVARCHAR(150) NOT NULL UNIQUE,
    DepartmentCode NVARCHAR(50) NULL,
    DepartmentType NVARCHAR(50) NULL,
    SectionId INT NULL,
    IsAcademic BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_Departments_Sections FOREIGN KEY (SectionId) REFERENCES dbo.Sections(SectionId)
);
GO

CREATE TABLE dbo.Subjects (
    SubjectId INT IDENTITY(1,1) PRIMARY KEY,
    SubjectKey NVARCHAR(50) NOT NULL UNIQUE,
    SubjectName NVARCHAR(100) NOT NULL UNIQUE,
    IsActive BIT NOT NULL DEFAULT 1,
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL
);
GO

CREATE TABLE dbo.Buildings (
    BuildingId INT IDENTITY(1,1) PRIMARY KEY,
    BuildingKey NVARCHAR(100) NOT NULL UNIQUE,
    BuildingName NVARCHAR(150) NOT NULL,
    Description NVARCHAR(255) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL
);
GO

CREATE TABLE dbo.Locations (
    LocationId INT IDENTITY(1,1) PRIMARY KEY,
    BuildingId INT NULL,
    LocationKey NVARCHAR(100) NOT NULL UNIQUE,
    LocationName NVARCHAR(150) NOT NULL,
    FloorName NVARCHAR(100) NULL,
    Description NVARCHAR(255) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_Locations_Buildings FOREIGN KEY (BuildingId) REFERENCES dbo.Buildings(BuildingId)
);
GO

CREATE TABLE dbo.Rooms (
    RoomId INT IDENTITY(1,1) PRIMARY KEY,
    LocationId INT NULL,
    RoomKey NVARCHAR(100) NOT NULL UNIQUE,
    RoomName NVARCHAR(150) NOT NULL,
    RoomType NVARCHAR(100) NULL,
    Capacity INT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_Rooms_Locations FOREIGN KEY (LocationId) REFERENCES dbo.Locations(LocationId)
);
GO

CREATE TABLE dbo.Classes (
    ClassId INT IDENTITY(1,1) PRIMARY KEY,
    AcademicYearId INT NOT NULL,
    SectionId INT NULL,
    YearLevelId INT NOT NULL,
    RoomId INT NULL,
    ClassKey NVARCHAR(50) NOT NULL,
    ClassName NVARCHAR(100) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT UQ_Classes_AcademicYear_ClassKey UNIQUE (AcademicYearId, ClassKey),
    CONSTRAINT FK_Classes_AcademicYears FOREIGN KEY (AcademicYearId) REFERENCES dbo.AcademicYears(AcademicYearId),
    CONSTRAINT FK_Classes_Sections FOREIGN KEY (SectionId) REFERENCES dbo.Sections(SectionId),
    CONSTRAINT FK_Classes_YearLevels FOREIGN KEY (YearLevelId) REFERENCES dbo.YearLevels(YearLevelId),
    CONSTRAINT FK_Classes_Rooms FOREIGN KEY (RoomId) REFERENCES dbo.Rooms(RoomId)
);
GO

CREATE TABLE dbo.Purposes (
    PurposeId INT IDENTITY(1,1) PRIMARY KEY,
    PurposeKey NVARCHAR(50) NOT NULL UNIQUE,
    PurposeName NVARCHAR(100) NOT NULL UNIQUE,
    IsActive BIT NOT NULL DEFAULT 1,
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL
);
GO

/* ============================================================
   3. USER / ACCESS FOUNDATION
   ============================================================ */

CREATE TABLE dbo.AccessLevels (
    AccessLevelId INT IDENTITY(1,1) PRIMARY KEY,
    AccessLevelKey NVARCHAR(50) NOT NULL UNIQUE,
    AccessLevelName NVARCHAR(50) NOT NULL UNIQUE,
    DisplayName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255) NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    IsSystemLevel BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL
);
GO

CREATE TABLE dbo.Roles (
    RoleId INT IDENTITY(1,1) PRIMARY KEY,
    RoleKey NVARCHAR(50) NOT NULL UNIQUE,
    RoleName NVARCHAR(100) NOT NULL UNIQUE,
    DisplayName NVARCHAR(100) NOT NULL,
    AccessLevelId INT NOT NULL,
    Description NVARCHAR(255) NULL,
    IsSystemRole BIT NOT NULL DEFAULT 0,
    IsProtected BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_Roles_AccessLevels FOREIGN KEY (AccessLevelId) REFERENCES dbo.AccessLevels(AccessLevelId)
);
GO

CREATE TABLE dbo.Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeId NVARCHAR(50) NOT NULL UNIQUE,
    FullName NVARCHAR(255) NOT NULL,
    SchoolEmail NVARCHAR(255) NOT NULL UNIQUE,
    PersonalEmail NVARCHAR(255) NULL,
    MobileNumber NVARCHAR(50) NULL,
    PasswordHash NVARCHAR(MAX) NULL,
    RoleId INT NOT NULL,
    DepartmentId INT NULL,
    SectionId INT NULL,
    DefaultWorkspaceId INT NULL,
    LegacyRole NVARCHAR(50) NULL,
    MustChangePassword BIT NOT NULL DEFAULT 1,
    EmailVerified BIT NOT NULL DEFAULT 0,
    IsRegistrationCompleted BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    IsLocked BIT NOT NULL DEFAULT 0,
    FailedLoginAttempts INT NOT NULL DEFAULT 0,
    LockedUntil DATETIME NULL,
    LastLoginAt DATETIME NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleId) REFERENCES dbo.Roles(RoleId),
    CONSTRAINT FK_Users_Departments FOREIGN KEY (DepartmentId) REFERENCES dbo.Departments(DepartmentId),
    CONSTRAINT FK_Users_Sections FOREIGN KEY (SectionId) REFERENCES dbo.Sections(SectionId)
);
GO

CREATE TABLE dbo.StaffProfiles (
    StaffProfileId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL UNIQUE,
    StaffNumber NVARCHAR(50) NULL,
    JobTitle NVARCHAR(150) NULL,
    JoiningDate DATE NULL,
    LeavingDate DATE NULL,
    EmploymentStatus NVARCHAR(50) NOT NULL DEFAULT 'Active',
    Notes NVARCHAR(MAX) NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_StaffProfiles_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.AssignmentTypes (
    AssignmentTypeId INT IDENTITY(1,1) PRIMARY KEY,
    AssignmentKey NVARCHAR(100) NOT NULL UNIQUE,
    AssignmentName NVARCHAR(150) NOT NULL UNIQUE,
    Description NVARCHAR(255) NULL,
    IsSystemAssignment BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL
);
GO

CREATE TABLE dbo.UserAssignments (
    UserAssignmentId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    AssignmentTypeId INT NOT NULL,
    AcademicYearId INT NULL,
    DepartmentId INT NULL,
    SectionId INT NULL,
    SubjectId INT NULL,
    YearLevelId INT NULL,
    ClassId INT NULL,
    RoomId INT NULL,
    StartDate DATE NULL,
    EndDate DATE NULL,
    IsPrimary BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedBy INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_UserAssignments_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_UserAssignments_AssignmentTypes FOREIGN KEY (AssignmentTypeId) REFERENCES dbo.AssignmentTypes(AssignmentTypeId),
    CONSTRAINT FK_UserAssignments_AcademicYears FOREIGN KEY (AcademicYearId) REFERENCES dbo.AcademicYears(AcademicYearId),
    CONSTRAINT FK_UserAssignments_Departments FOREIGN KEY (DepartmentId) REFERENCES dbo.Departments(DepartmentId),
    CONSTRAINT FK_UserAssignments_Sections FOREIGN KEY (SectionId) REFERENCES dbo.Sections(SectionId),
    CONSTRAINT FK_UserAssignments_Subjects FOREIGN KEY (SubjectId) REFERENCES dbo.Subjects(SubjectId),
    CONSTRAINT FK_UserAssignments_YearLevels FOREIGN KEY (YearLevelId) REFERENCES dbo.YearLevels(YearLevelId),
    CONSTRAINT FK_UserAssignments_Classes FOREIGN KEY (ClassId) REFERENCES dbo.Classes(ClassId),
    CONSTRAINT FK_UserAssignments_Rooms FOREIGN KEY (RoomId) REFERENCES dbo.Rooms(RoomId),
    CONSTRAINT FK_UserAssignments_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.UserAssignmentScopes (
    AssignmentScopeId INT IDENTITY(1,1) PRIMARY KEY,
    UserAssignmentId INT NOT NULL,
    ScopeType NVARCHAR(50) NOT NULL,
    ScopeValue NVARCHAR(150) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_UserAssignmentScopes_UserAssignments FOREIGN KEY (UserAssignmentId) REFERENCES dbo.UserAssignments(UserAssignmentId)
);
GO

CREATE TABLE dbo.UserSubjects (
    UserSubjectId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    SubjectId INT NOT NULL,
    IsPrimary BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_UserSubjects_User_Subject UNIQUE (UserId, SubjectId),
    CONSTRAINT FK_UserSubjects_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_UserSubjects_Subjects FOREIGN KEY (SubjectId) REFERENCES dbo.Subjects(SubjectId)
);
GO

/* ============================================================
   4. STAFF IMPORT FOUNDATION
   ============================================================ */

CREATE TABLE dbo.StaffImportBatches (
    StaffImportBatchId INT IDENTITY(1,1) PRIMARY KEY,
    BatchName NVARCHAR(150) NOT NULL,
    OriginalFileName NVARCHAR(255) NULL,
    UploadedBy INT NULL,
    TotalRows INT NOT NULL DEFAULT 0,
    ValidRows INT NOT NULL DEFAULT 0,
    InvalidRows INT NOT NULL DEFAULT 0,
    DuplicateRows INT NOT NULL DEFAULT 0,
    ImportedRows INT NOT NULL DEFAULT 0,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    Remarks NVARCHAR(MAX) NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    ValidatedAt DATETIME NULL,
    ImportedAt DATETIME NULL,
    CONSTRAINT FK_StaffImportBatches_UploadedBy FOREIGN KEY (UploadedBy) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.StaffImportStaging (
    StaffImportStagingId INT IDENTITY(1,1) PRIMARY KEY,
    StaffImportBatchId INT NOT NULL,
    EmployeeId NVARCHAR(50) NOT NULL,
    FullName NVARCHAR(255) NOT NULL,
    SchoolEmail NVARCHAR(255) NOT NULL,
    DerivedRoleKey NVARCHAR(50) NULL,
    MatchedUserId INT NULL,
    ValidationStatus NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    ValidationMessage NVARCHAR(MAX) NULL,
    ImportStatus NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    ImportMessage NVARCHAR(MAX) NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    ImportedAt DATETIME NULL,
    CONSTRAINT FK_StaffImportStaging_Batches FOREIGN KEY (StaffImportBatchId) REFERENCES dbo.StaffImportBatches(StaffImportBatchId),
    CONSTRAINT FK_StaffImportStaging_MatchedUser FOREIGN KEY (MatchedUserId) REFERENCES dbo.Users(UserId)
);
GO

CREATE OR ALTER VIEW dbo.vw_StaffImportValidation AS
SELECT
    s.StaffImportStagingId,
    s.StaffImportBatchId,
    s.EmployeeId,
    s.FullName,
    s.SchoolEmail,
    CASE
        WHEN s.EmployeeId = 'A0297' THEN 'SuperAdmin'
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

/* ============================================================
   5. SECURITY / ONBOARDING
   ============================================================ */

CREATE TABLE dbo.UserRegistrationTokens (
    RegistrationTokenId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    TokenHash NVARCHAR(255) NOT NULL UNIQUE,
    ExpiresAt DATETIME NOT NULL,
    UsedAt DATETIME NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_UserRegistrationTokens_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.PasswordResetTokens (
    PasswordResetTokenId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    TokenHash NVARCHAR(255) NOT NULL UNIQUE,
    ExpiresAt DATETIME NOT NULL,
    UsedAt DATETIME NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_PasswordResetTokens_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.EmailVerificationTokens (
    EmailVerificationTokenId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    TokenHash NVARCHAR(255) NOT NULL UNIQUE,
    ExpiresAt DATETIME NOT NULL,
    UsedAt DATETIME NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_EmailVerificationTokens_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.LoginHistory (
    LoginHistoryId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NULL,
    EmployeeId NVARCHAR(50) NULL,
    SchoolEmail NVARCHAR(255) NULL,
    IsSuccessful BIT NOT NULL,
    FailureReason NVARCHAR(255) NULL,
    IpAddress NVARCHAR(50) NULL,
    UserAgent NVARCHAR(500) NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_LoginHistory_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.UserSessions (
    UserSessionId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    SessionTokenHash NVARCHAR(255) NOT NULL UNIQUE,
    IpAddress NVARCHAR(50) NULL,
    UserAgent NVARCHAR(500) NULL,
    ExpiresAt DATETIME NOT NULL,
    RevokedAt DATETIME NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_UserSessions_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
);
GO

/* ============================================================
   6. PLATFORM CONTROL FOUNDATION
   ============================================================ */

CREATE TABLE dbo.Modules (
    ModuleId INT IDENTITY(1,1) PRIMARY KEY,
    ModuleKey NVARCHAR(100) NOT NULL UNIQUE,
    ModuleName NVARCHAR(150) NOT NULL,
    Description NVARCHAR(255) NULL,
    Icon NVARCHAR(100) NULL,
    BaseRoute NVARCHAR(150) NULL,
    VisibilityStatusId INT NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_Modules_VisibilityStatuses FOREIGN KEY (VisibilityStatusId) REFERENCES dbo.FeatureVisibilityStatuses(VisibilityStatusId)
);
GO

CREATE TABLE dbo.PermissionGroups (
    PermissionGroupId INT IDENTITY(1,1) PRIMARY KEY,
    GroupKey NVARCHAR(100) NOT NULL UNIQUE,
    GroupName NVARCHAR(150) NOT NULL,
    Description NVARCHAR(255) NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL
);
GO

CREATE TABLE dbo.Permissions (
    PermissionId INT IDENTITY(1,1) PRIMARY KEY,
    PermissionKey NVARCHAR(100) NOT NULL UNIQUE,
    PermissionName NVARCHAR(150) NOT NULL,
    ModuleId INT NOT NULL,
    PermissionGroupId INT NULL,
    Description NVARCHAR(255) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_Permissions_Modules FOREIGN KEY (ModuleId) REFERENCES dbo.Modules(ModuleId),
    CONSTRAINT FK_Permissions_PermissionGroups FOREIGN KEY (PermissionGroupId) REFERENCES dbo.PermissionGroups(PermissionGroupId)
);
GO

CREATE TABLE dbo.RolePermissions (
    RolePermissionId INT IDENTITY(1,1) PRIMARY KEY,
    RoleId INT NOT NULL,
    PermissionId INT NOT NULL,
    IsAllowed BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_RolePermissions UNIQUE (RoleId, PermissionId),
    CONSTRAINT FK_RolePermissions_Roles FOREIGN KEY (RoleId) REFERENCES dbo.Roles(RoleId),
    CONSTRAINT FK_RolePermissions_Permissions FOREIGN KEY (PermissionId) REFERENCES dbo.Permissions(PermissionId)
);
GO

CREATE TABLE dbo.UserPermissionOverrides (
    UserPermissionOverrideId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    PermissionId INT NOT NULL,
    IsAllowed BIT NOT NULL,
    Reason NVARCHAR(255) NULL,
    CreatedBy INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_UserPermissionOverrides UNIQUE (UserId, PermissionId),
    CONSTRAINT FK_UserPermissionOverrides_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_UserPermissionOverrides_Permissions FOREIGN KEY (PermissionId) REFERENCES dbo.Permissions(PermissionId),
    CONSTRAINT FK_UserPermissionOverrides_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.FeatureFlags (
    FeatureFlagId INT IDENTITY(1,1) PRIMARY KEY,
    FeatureKey NVARCHAR(100) NOT NULL UNIQUE,
    FeatureName NVARCHAR(150) NOT NULL,
    Description NVARCHAR(255) NULL,
    ModuleId INT NULL,
    VisibilityStatusId INT NOT NULL,
    IsEnabled BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_FeatureFlags_Modules FOREIGN KEY (ModuleId) REFERENCES dbo.Modules(ModuleId),
    CONSTRAINT FK_FeatureFlags_VisibilityStatuses FOREIGN KEY (VisibilityStatusId) REFERENCES dbo.FeatureVisibilityStatuses(VisibilityStatusId)
);
GO

/* ============================================================
   7. SIDEBAR / MENU / WORKSPACE FOUNDATION
   ============================================================ */

CREATE TABLE dbo.Workspaces (
    WorkspaceId INT IDENTITY(1,1) PRIMARY KEY,
    WorkspaceKey NVARCHAR(100) NOT NULL UNIQUE,
    WorkspaceName NVARCHAR(150) NOT NULL,
    Description NVARCHAR(255) NULL,
    Icon NVARCHAR(100) NULL,
    DefaultRoute NVARCHAR(150) NULL,
    VisibilityStatusId INT NOT NULL,
    IsDefault BIT NOT NULL DEFAULT 0,
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_Workspaces_VisibilityStatuses FOREIGN KEY (VisibilityStatusId) REFERENCES dbo.FeatureVisibilityStatuses(VisibilityStatusId)
);
GO

CREATE TABLE dbo.WorkspaceRoles (
    WorkspaceRoleId INT IDENTITY(1,1) PRIMARY KEY,
    WorkspaceId INT NOT NULL,
    RoleId INT NOT NULL,
    IsDefault BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_WorkspaceRoles UNIQUE (WorkspaceId, RoleId),
    CONSTRAINT FK_WorkspaceRoles_Workspaces FOREIGN KEY (WorkspaceId) REFERENCES dbo.Workspaces(WorkspaceId),
    CONSTRAINT FK_WorkspaceRoles_Roles FOREIGN KEY (RoleId) REFERENCES dbo.Roles(RoleId)
);
GO

CREATE TABLE dbo.Menus (
    MenuId INT IDENTITY(1,1) PRIMARY KEY,
    WorkspaceId INT NULL,
    ModuleId INT NOT NULL,
    ParentMenuId INT NULL,
    MenuKey NVARCHAR(100) NOT NULL UNIQUE,
    MenuName NVARCHAR(150) NOT NULL,
    Route NVARCHAR(150) NULL,
    Icon NVARCHAR(100) NULL,
    PermissionId INT NULL,
    FeatureFlagId INT NULL,
    BadgeQueryKey NVARCHAR(100) NULL,
    VisibilityStatusId INT NOT NULL,
    IsPinned BIT NOT NULL DEFAULT 0,
    IsCollapsible BIT NOT NULL DEFAULT 1,
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_Menus_Workspaces FOREIGN KEY (WorkspaceId) REFERENCES dbo.Workspaces(WorkspaceId),
    CONSTRAINT FK_Menus_Modules FOREIGN KEY (ModuleId) REFERENCES dbo.Modules(ModuleId),
    CONSTRAINT FK_Menus_Parent FOREIGN KEY (ParentMenuId) REFERENCES dbo.Menus(MenuId),
    CONSTRAINT FK_Menus_Permissions FOREIGN KEY (PermissionId) REFERENCES dbo.Permissions(PermissionId),
    CONSTRAINT FK_Menus_FeatureFlags FOREIGN KEY (FeatureFlagId) REFERENCES dbo.FeatureFlags(FeatureFlagId),
    CONSTRAINT FK_Menus_VisibilityStatuses FOREIGN KEY (VisibilityStatusId) REFERENCES dbo.FeatureVisibilityStatuses(VisibilityStatusId)
);
GO

CREATE TABLE dbo.MenuGroups (
    MenuGroupId INT IDENTITY(1,1) PRIMARY KEY,
    WorkspaceId INT NULL,
    GroupKey NVARCHAR(100) NOT NULL UNIQUE,
    GroupName NVARCHAR(150) NOT NULL,
    Icon NVARCHAR(100) NULL,
    VisibilityStatusId INT NOT NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_MenuGroups_Workspaces FOREIGN KEY (WorkspaceId) REFERENCES dbo.Workspaces(WorkspaceId),
    CONSTRAINT FK_MenuGroups_VisibilityStatuses FOREIGN KEY (VisibilityStatusId) REFERENCES dbo.FeatureVisibilityStatuses(VisibilityStatusId)
);
GO

CREATE TABLE dbo.MenuGroupItems (
    MenuGroupItemId INT IDENTITY(1,1) PRIMARY KEY,
    MenuGroupId INT NOT NULL,
    MenuId INT NOT NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    CONSTRAINT UQ_MenuGroupItems UNIQUE (MenuGroupId, MenuId),
    CONSTRAINT FK_MenuGroupItems_MenuGroups FOREIGN KEY (MenuGroupId) REFERENCES dbo.MenuGroups(MenuGroupId),
    CONSTRAINT FK_MenuGroupItems_Menus FOREIGN KEY (MenuId) REFERENCES dbo.Menus(MenuId)
);
GO

CREATE TABLE dbo.UserMenuPreferences (
    UserMenuPreferenceId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    WorkspaceId INT NULL,
    MenuId INT NOT NULL,
    IsPinned BIT NOT NULL DEFAULT 0,
    IsHidden BIT NOT NULL DEFAULT 0,
    SortOrder INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT UQ_UserMenuPreferences UNIQUE (UserId, MenuId),
    CONSTRAINT FK_UserMenuPreferences_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_UserMenuPreferences_Workspaces FOREIGN KEY (WorkspaceId) REFERENCES dbo.Workspaces(WorkspaceId),
    CONSTRAINT FK_UserMenuPreferences_Menus FOREIGN KEY (MenuId) REFERENCES dbo.Menus(MenuId)
);
GO

ALTER TABLE dbo.Users
ADD CONSTRAINT FK_Users_DefaultWorkspace
FOREIGN KEY (DefaultWorkspaceId) REFERENCES dbo.Workspaces(WorkspaceId);
GO

/* ============================================================
   8. BUTTONS / WIDGETS / DASHBOARDS / QUICK ACTIONS / TOPBAR
   ============================================================ */

CREATE TABLE dbo.Buttons (
    ButtonId INT IDENTITY(1,1) PRIMARY KEY,
    ModuleId INT NOT NULL,
    ButtonKey NVARCHAR(100) NOT NULL UNIQUE,
    ButtonName NVARCHAR(150) NOT NULL,
    PermissionId INT NULL,
    FeatureFlagId INT NULL,
    VisibilityStatusId INT NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_Buttons_Modules FOREIGN KEY (ModuleId) REFERENCES dbo.Modules(ModuleId),
    CONSTRAINT FK_Buttons_Permissions FOREIGN KEY (PermissionId) REFERENCES dbo.Permissions(PermissionId),
    CONSTRAINT FK_Buttons_FeatureFlags FOREIGN KEY (FeatureFlagId) REFERENCES dbo.FeatureFlags(FeatureFlagId),
    CONSTRAINT FK_Buttons_VisibilityStatuses FOREIGN KEY (VisibilityStatusId) REFERENCES dbo.FeatureVisibilityStatuses(VisibilityStatusId)
);
GO

CREATE TABLE dbo.Widgets (
    WidgetId INT IDENTITY(1,1) PRIMARY KEY,
    ModuleId INT NULL,
    WidgetKey NVARCHAR(100) NOT NULL UNIQUE,
    WidgetName NVARCHAR(150) NOT NULL,
    WidgetType NVARCHAR(100) NULL,
    DataSourceKey NVARCHAR(100) NULL,
    Description NVARCHAR(255) NULL,
    PermissionId INT NULL,
    FeatureFlagId INT NULL,
    VisibilityStatusId INT NOT NULL,
    DefaultWidth INT NULL,
    DefaultHeight INT NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_Widgets_Modules FOREIGN KEY (ModuleId) REFERENCES dbo.Modules(ModuleId),
    CONSTRAINT FK_Widgets_Permissions FOREIGN KEY (PermissionId) REFERENCES dbo.Permissions(PermissionId),
    CONSTRAINT FK_Widgets_FeatureFlags FOREIGN KEY (FeatureFlagId) REFERENCES dbo.FeatureFlags(FeatureFlagId),
    CONSTRAINT FK_Widgets_VisibilityStatuses FOREIGN KEY (VisibilityStatusId) REFERENCES dbo.FeatureVisibilityStatuses(VisibilityStatusId)
);
GO

CREATE TABLE dbo.Dashboards (
    DashboardId INT IDENTITY(1,1) PRIMARY KEY,
    DashboardKey NVARCHAR(100) NOT NULL UNIQUE,
    DashboardName NVARCHAR(150) NOT NULL,
    WorkspaceId INT NULL,
    RoleId INT NULL,
    AssignmentTypeId INT NULL,
    ModuleId INT NULL,
    IsDefault BIT NOT NULL DEFAULT 0,
    VisibilityStatusId INT NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_Dashboards_Workspaces FOREIGN KEY (WorkspaceId) REFERENCES dbo.Workspaces(WorkspaceId),
    CONSTRAINT FK_Dashboards_Roles FOREIGN KEY (RoleId) REFERENCES dbo.Roles(RoleId),
    CONSTRAINT FK_Dashboards_AssignmentTypes FOREIGN KEY (AssignmentTypeId) REFERENCES dbo.AssignmentTypes(AssignmentTypeId),
    CONSTRAINT FK_Dashboards_Modules FOREIGN KEY (ModuleId) REFERENCES dbo.Modules(ModuleId),
    CONSTRAINT FK_Dashboards_VisibilityStatuses FOREIGN KEY (VisibilityStatusId) REFERENCES dbo.FeatureVisibilityStatuses(VisibilityStatusId)
);
GO

CREATE TABLE dbo.DashboardWidgets (
    DashboardWidgetId INT IDENTITY(1,1) PRIMARY KEY,
    DashboardId INT NOT NULL,
    WidgetId INT NOT NULL,
    GridX INT NOT NULL DEFAULT 0,
    GridY INT NOT NULL DEFAULT 0,
    GridW INT NOT NULL DEFAULT 4,
    GridH INT NOT NULL DEFAULT 2,
    SortOrder INT NOT NULL DEFAULT 0,
    IsRequired BIT NOT NULL DEFAULT 0,
    CONSTRAINT UQ_DashboardWidgets UNIQUE (DashboardId, WidgetId),
    CONSTRAINT FK_DashboardWidgets_Dashboards FOREIGN KEY (DashboardId) REFERENCES dbo.Dashboards(DashboardId),
    CONSTRAINT FK_DashboardWidgets_Widgets FOREIGN KEY (WidgetId) REFERENCES dbo.Widgets(WidgetId)
);
GO

CREATE TABLE dbo.QuickActions (
    QuickActionId INT IDENTITY(1,1) PRIMARY KEY,
    ActionKey NVARCHAR(100) NOT NULL UNIQUE,
    ActionName NVARCHAR(150) NOT NULL,
    ModuleId INT NULL,
    Route NVARCHAR(150) NULL,
    Icon NVARCHAR(100) NULL,
    PermissionId INT NULL,
    FeatureFlagId INT NULL,
    VisibilityStatusId INT NOT NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_QuickActions_Modules FOREIGN KEY (ModuleId) REFERENCES dbo.Modules(ModuleId),
    CONSTRAINT FK_QuickActions_Permissions FOREIGN KEY (PermissionId) REFERENCES dbo.Permissions(PermissionId),
    CONSTRAINT FK_QuickActions_FeatureFlags FOREIGN KEY (FeatureFlagId) REFERENCES dbo.FeatureFlags(FeatureFlagId),
    CONSTRAINT FK_QuickActions_VisibilityStatuses FOREIGN KEY (VisibilityStatusId) REFERENCES dbo.FeatureVisibilityStatuses(VisibilityStatusId)
);
GO

CREATE TABLE dbo.TopbarSettings (
    TopbarSettingId INT IDENTITY(1,1) PRIMARY KEY,
    SettingKey NVARCHAR(100) NOT NULL UNIQUE,
    ShowSearch BIT NOT NULL DEFAULT 1,
    ShowNotifications BIT NOT NULL DEFAULT 1,
    ShowWorkspaceSwitcher BIT NOT NULL DEFAULT 1,
    ShowProfileMenu BIT NOT NULL DEFAULT 1,
    AnnouncementBannerEnabled BIT NOT NULL DEFAULT 0,
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE dbo.AnnouncementBanners (
    AnnouncementBannerId INT IDENTITY(1,1) PRIMARY KEY,
    BannerKey NVARCHAR(100) NOT NULL UNIQUE,
    Title NVARCHAR(255) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    BannerType NVARCHAR(50) NOT NULL DEFAULT 'Info',
    VisibilityStatusId INT NOT NULL,
    StartAt DATETIME NULL,
    EndAt DATETIME NULL,
    CreatedBy INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_AnnouncementBanners_VisibilityStatuses FOREIGN KEY (VisibilityStatusId) REFERENCES dbo.FeatureVisibilityStatuses(VisibilityStatusId),
    CONSTRAINT FK_AnnouncementBanners_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.GlobalSearchEntities (
    GlobalSearchEntityId INT IDENTITY(1,1) PRIMARY KEY,
    EntityKey NVARCHAR(100) NOT NULL UNIQUE,
    EntityName NVARCHAR(150) NOT NULL,
    ModuleId INT NULL,
    SearchRouteTemplate NVARCHAR(255) NULL,
    PermissionId INT NULL,
    VisibilityStatusId INT NOT NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_GlobalSearchEntities_Modules FOREIGN KEY (ModuleId) REFERENCES dbo.Modules(ModuleId),
    CONSTRAINT FK_GlobalSearchEntities_Permissions FOREIGN KEY (PermissionId) REFERENCES dbo.Permissions(PermissionId),
    CONSTRAINT FK_GlobalSearchEntities_VisibilityStatuses FOREIGN KEY (VisibilityStatusId) REFERENCES dbo.FeatureVisibilityStatuses(VisibilityStatusId)
);
GO

/* ============================================================
   9. SHARED SYSTEM TABLES
   ============================================================ */

CREATE TABLE dbo.SystemSettings (
    SettingId INT IDENTITY(1,1) PRIMARY KEY,
    SettingKey NVARCHAR(100) NOT NULL UNIQUE,
    SettingValue NVARCHAR(MAX) NULL,
    SettingGroup NVARCHAR(100) NULL,
    Description NVARCHAR(255) NULL,
    IsEditable BIT NOT NULL DEFAULT 1,
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE dbo.FileStorage (
    FileId INT IDENTITY(1,1) PRIMARY KEY,
    OriginalFileName NVARCHAR(255) NOT NULL,
    StoredFileName NVARCHAR(255) NOT NULL,
    FilePath NVARCHAR(MAX) NOT NULL,
    FileType NVARCHAR(100) NULL,
    FileSizeKB DECIMAL(18,2) NULL,
    EntityType NVARCHAR(100) NULL,
    EntityId INT NULL,
    UploadedBy INT NULL,
    UploadedAt DATETIME NOT NULL DEFAULT GETDATE(),
    IsDeleted BIT NOT NULL DEFAULT 0,
    DeletedAt DATETIME NULL,
    DeletedBy INT NULL,
    CONSTRAINT FK_FileStorage_UploadedBy FOREIGN KEY (UploadedBy) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_FileStorage_DeletedBy FOREIGN KEY (DeletedBy) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.AuditLogs (
    AuditLogId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NULL,
    ActionType NVARCHAR(100) NOT NULL,
    EntityType NVARCHAR(100) NULL,
    EntityId NVARCHAR(100) NULL,
    Description NVARCHAR(MAX) NOT NULL,
    OldValue NVARCHAR(MAX) NULL,
    NewValue NVARCHAR(MAX) NULL,
    IpAddress NVARCHAR(50) NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_AuditLogs_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.ActivityTimeline (
    ActivityTimelineId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NULL,
    ModuleKey NVARCHAR(100) NULL,
    EntityType NVARCHAR(100) NOT NULL,
    EntityId NVARCHAR(100) NULL,
    ActivityType NVARCHAR(100) NOT NULL,
    ActivityTitle NVARCHAR(255) NOT NULL,
    ActivityDescription NVARCHAR(MAX) NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_ActivityTimeline_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.Notifications (
    NotificationId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Title NVARCHAR(255) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    NotificationType NVARCHAR(50) NULL,
    EntityType NVARCHAR(100) NULL,
    EntityId INT NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.EmailTemplates (
    EmailTemplateId INT IDENTITY(1,1) PRIMARY KEY,
    TemplateKey NVARCHAR(100) NOT NULL UNIQUE,
    TemplateName NVARCHAR(150) NOT NULL,
    Subject NVARCHAR(255) NOT NULL,
    BodyHtml NVARCHAR(MAX) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL
);
GO

CREATE TABLE dbo.EmailQueue (
    EmailQueueId INT IDENTITY(1,1) PRIMARY KEY,
    ToEmail NVARCHAR(255) NOT NULL,
    CcEmail NVARCHAR(500) NULL,
    BccEmail NVARCHAR(500) NULL,
    Subject NVARCHAR(255) NOT NULL,
    BodyHtml NVARCHAR(MAX) NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    Attempts INT NOT NULL DEFAULT 0,
    LastError NVARCHAR(MAX) NULL,
    RelatedEntityType NVARCHAR(100) NULL,
    RelatedEntityId INT NULL,
    QueuedAt DATETIME NOT NULL DEFAULT GETDATE(),
    SentAt DATETIME NULL
);
GO

/* ============================================================
   10. STUDENTS / STUDENT IDS
   ============================================================ */

CREATE TABLE dbo.Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    AdmissionNumber NVARCHAR(50) NOT NULL UNIQUE,
    StudentCode NVARCHAR(50) NULL UNIQUE,
    FirstName NVARCHAR(150) NOT NULL,
    LastName NVARCHAR(150) NULL,
    PreferredName NVARCHAR(150) NULL,
    SectionId INT NULL,
    YearLevelId INT NULL,
    CurrentClassId INT NULL,
    PhotoFileId INT NULL,
    Gender NVARCHAR(20) NULL,
    StudentStatus NVARCHAR(50) NOT NULL DEFAULT 'Active',
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_Students_Sections FOREIGN KEY (SectionId) REFERENCES dbo.Sections(SectionId),
    CONSTRAINT FK_Students_YearLevels FOREIGN KEY (YearLevelId) REFERENCES dbo.YearLevels(YearLevelId),
    CONSTRAINT FK_Students_Classes FOREIGN KEY (CurrentClassId) REFERENCES dbo.Classes(ClassId),
    CONSTRAINT FK_Students_PhotoFile FOREIGN KEY (PhotoFileId) REFERENCES dbo.FileStorage(FileId)
);
GO

CREATE TABLE dbo.StudentClassEnrollments (
    EnrollmentId INT IDENTITY(1,1) PRIMARY KEY,
    StudentId INT NOT NULL,
    AcademicYearId INT NOT NULL,
    ClassId INT NOT NULL,
    StartDate DATE NULL,
    EndDate DATE NULL,
    IsCurrent BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_StudentClassEnrollments UNIQUE (StudentId, AcademicYearId, ClassId),
    CONSTRAINT FK_StudentClassEnrollments_Students FOREIGN KEY (StudentId) REFERENCES dbo.Students(StudentId),
    CONSTRAINT FK_StudentClassEnrollments_AcademicYears FOREIGN KEY (AcademicYearId) REFERENCES dbo.AcademicYears(AcademicYearId),
    CONSTRAINT FK_StudentClassEnrollments_Classes FOREIGN KEY (ClassId) REFERENCES dbo.Classes(ClassId)
);
GO

CREATE TABLE dbo.StudentIdTemplates (
    StudentIdTemplateId INT IDENTITY(1,1) PRIMARY KEY,
    TemplateKey NVARCHAR(100) NOT NULL UNIQUE,
    TemplateName NVARCHAR(150) NOT NULL,
    Description NVARCHAR(255) NULL,
    VisibilityStatusId INT NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_StudentIdTemplates_VisibilityStatuses FOREIGN KEY (VisibilityStatusId) REFERENCES dbo.FeatureVisibilityStatuses(VisibilityStatusId)
);
GO

CREATE TABLE dbo.StudentIdBatches (
    StudentIdBatchId INT IDENTITY(1,1) PRIMARY KEY,
    BatchNumber NVARCHAR(50) NOT NULL UNIQUE,
    AcademicYearId INT NOT NULL,
    SectionId INT NULL,
    YearLevelId INT NULL,
    ClassId INT NULL,
    TemplateId INT NULL,
    RequestedBy INT NOT NULL,
    VerifiedBy INT NULL,
    ApprovedBy INT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Draft',
    RequestedAt DATETIME NOT NULL DEFAULT GETDATE(),
    VerifiedAt DATETIME NULL,
    ApprovedAt DATETIME NULL,
    SentToPrintingAt DATETIME NULL,
    Notes NVARCHAR(MAX) NULL,
    CONSTRAINT FK_StudentIdBatches_AcademicYears FOREIGN KEY (AcademicYearId) REFERENCES dbo.AcademicYears(AcademicYearId),
    CONSTRAINT FK_StudentIdBatches_Sections FOREIGN KEY (SectionId) REFERENCES dbo.Sections(SectionId),
    CONSTRAINT FK_StudentIdBatches_YearLevels FOREIGN KEY (YearLevelId) REFERENCES dbo.YearLevels(YearLevelId),
    CONSTRAINT FK_StudentIdBatches_Classes FOREIGN KEY (ClassId) REFERENCES dbo.Classes(ClassId),
    CONSTRAINT FK_StudentIdBatches_Templates FOREIGN KEY (TemplateId) REFERENCES dbo.StudentIdTemplates(StudentIdTemplateId),
    CONSTRAINT FK_StudentIdBatches_RequestedBy FOREIGN KEY (RequestedBy) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_StudentIdBatches_VerifiedBy FOREIGN KEY (VerifiedBy) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_StudentIdBatches_ApprovedBy FOREIGN KEY (ApprovedBy) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.StudentIdCards (
    StudentIdCardId INT IDENTITY(1,1) PRIMARY KEY,
    StudentIdBatchId INT NOT NULL,
    StudentId INT NOT NULL,
    CardStatus NVARCHAR(50) NOT NULL DEFAULT 'Pending Verification',
    VerifiedBy INT NULL,
    VerifiedAt DATETIME NULL,
    RejectionReason NVARCHAR(255) NULL,
    PrintedAt DATETIME NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_StudentIdCards_Batch_Student UNIQUE (StudentIdBatchId, StudentId),
    CONSTRAINT FK_StudentIdCards_Batches FOREIGN KEY (StudentIdBatchId) REFERENCES dbo.StudentIdBatches(StudentIdBatchId),
    CONSTRAINT FK_StudentIdCards_Students FOREIGN KEY (StudentId) REFERENCES dbo.Students(StudentId),
    CONSTRAINT FK_StudentIdCards_VerifiedBy FOREIGN KEY (VerifiedBy) REFERENCES dbo.Users(UserId)
);
GO

/* ============================================================
   11. WORKFLOW ENGINE
   ============================================================ */

CREATE TABLE dbo.WorkflowTemplates (
    WorkflowTemplateId INT IDENTITY(1,1) PRIMARY KEY,
    WorkflowKey NVARCHAR(100) NOT NULL UNIQUE,
    WorkflowName NVARCHAR(150) NOT NULL,
    ModuleId INT NULL,
    EntityType NVARCHAR(100) NOT NULL,
    VisibilityStatusId INT NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_WorkflowTemplates_Modules FOREIGN KEY (ModuleId) REFERENCES dbo.Modules(ModuleId),
    CONSTRAINT FK_WorkflowTemplates_VisibilityStatuses FOREIGN KEY (VisibilityStatusId) REFERENCES dbo.FeatureVisibilityStatuses(VisibilityStatusId)
);
GO

CREATE TABLE dbo.WorkflowSteps (
    WorkflowStepId INT IDENTITY(1,1) PRIMARY KEY,
    WorkflowTemplateId INT NOT NULL,
    StepKey NVARCHAR(100) NOT NULL,
    StepName NVARCHAR(150) NOT NULL,
    AssignmentTypeId INT NULL,
    RoleId INT NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    IsRequired BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_WorkflowSteps_Template_Step UNIQUE (WorkflowTemplateId, StepKey),
    CONSTRAINT FK_WorkflowSteps_Templates FOREIGN KEY (WorkflowTemplateId) REFERENCES dbo.WorkflowTemplates(WorkflowTemplateId),
    CONSTRAINT FK_WorkflowSteps_AssignmentTypes FOREIGN KEY (AssignmentTypeId) REFERENCES dbo.AssignmentTypes(AssignmentTypeId),
    CONSTRAINT FK_WorkflowSteps_Roles FOREIGN KEY (RoleId) REFERENCES dbo.Roles(RoleId)
);
GO

CREATE TABLE dbo.WorkflowInstances (
    WorkflowInstanceId INT IDENTITY(1,1) PRIMARY KEY,
    WorkflowTemplateId INT NOT NULL,
    EntityType NVARCHAR(100) NOT NULL,
    EntityId INT NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    StartedBy INT NULL,
    StartedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CompletedAt DATETIME NULL,
    CONSTRAINT FK_WorkflowInstances_Templates FOREIGN KEY (WorkflowTemplateId) REFERENCES dbo.WorkflowTemplates(WorkflowTemplateId),
    CONSTRAINT FK_WorkflowInstances_StartedBy FOREIGN KEY (StartedBy) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.WorkflowActions (
    WorkflowActionId INT IDENTITY(1,1) PRIMARY KEY,
    WorkflowInstanceId INT NOT NULL,
    WorkflowStepId INT NULL,
    ActionBy INT NOT NULL,
    ActionStatus NVARCHAR(50) NOT NULL,
    Remarks NVARCHAR(MAX) NULL,
    ActionDate DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_WorkflowActions_Instances FOREIGN KEY (WorkflowInstanceId) REFERENCES dbo.WorkflowInstances(WorkflowInstanceId),
    CONSTRAINT FK_WorkflowActions_Steps FOREIGN KEY (WorkflowStepId) REFERENCES dbo.WorkflowSteps(WorkflowStepId),
    CONSTRAINT FK_WorkflowActions_ActionBy FOREIGN KEY (ActionBy) REFERENCES dbo.Users(UserId)
);
GO

/* ============================================================
   12. PRINTING MANAGEMENT
   ============================================================ */

CREATE TABLE dbo.PhotocopyRequests (
    RequestId INT IDENTITY(1,1) PRIMARY KEY,
    RequestNumber NVARCHAR(50) NOT NULL UNIQUE,
    TeacherId INT NOT NULL,
    DepartmentId INT NOT NULL,
    SectionId INT NULL,
    SubjectId INT NOT NULL,
    PurposeId INT NOT NULL,
    Copies INT NOT NULL,
    TotalPages INT NOT NULL,
    TotalSheets INT NOT NULL,
    PriorityLevel NVARCHAR(20) NOT NULL DEFAULT 'Normal',
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    CurrentApproverId INT NULL,
    SourceModule NVARCHAR(100) NULL,
    SourceEntityType NVARCHAR(100) NULL,
    SourceEntityId INT NULL,
    PaperSize NVARCHAR(20) NULL,
    PrintType NVARCHAR(50) NULL,
    PrintSide NVARCHAR(20) NULL,
    IsExam BIT NOT NULL DEFAULT 0,
    DueDate DATETIME NULL,
    Remarks NVARCHAR(MAX) NULL,
    SubmittedAt DATETIME NOT NULL DEFAULT GETDATE(),
    ApprovedAt DATETIME NULL,
    PrintedAt DATETIME NULL,
    CompletedAt DATETIME NULL,
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_PhotocopyRequests_Teacher FOREIGN KEY (TeacherId) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_PhotocopyRequests_Departments FOREIGN KEY (DepartmentId) REFERENCES dbo.Departments(DepartmentId),
    CONSTRAINT FK_PhotocopyRequests_Sections FOREIGN KEY (SectionId) REFERENCES dbo.Sections(SectionId),
    CONSTRAINT FK_PhotocopyRequests_Subjects FOREIGN KEY (SubjectId) REFERENCES dbo.Subjects(SubjectId),
    CONSTRAINT FK_PhotocopyRequests_Purposes FOREIGN KEY (PurposeId) REFERENCES dbo.Purposes(PurposeId),
    CONSTRAINT FK_PhotocopyRequests_CurrentApprover FOREIGN KEY (CurrentApproverId) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.RequestApprovals (
    ApprovalId INT IDENTITY(1,1) PRIMARY KEY,
    RequestId INT NOT NULL,
    ApproverId INT NOT NULL,
    ApprovalRole NVARCHAR(50) NOT NULL,
    ApprovalStatus NVARCHAR(50) NOT NULL,
    Remarks NVARCHAR(MAX) NULL,
    ActionDate DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_RequestApprovals_Requests FOREIGN KEY (RequestId) REFERENCES dbo.PhotocopyRequests(RequestId),
    CONSTRAINT FK_RequestApprovals_Approver FOREIGN KEY (ApproverId) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.RequestAttachments (
    AttachmentId INT IDENTITY(1,1) PRIMARY KEY,
    RequestId INT NOT NULL,
    FileId INT NULL,
    OriginalFileName NVARCHAR(255) NOT NULL,
    StoredFileName NVARCHAR(255) NOT NULL,
    FilePath NVARCHAR(MAX) NULL,
    FileType NVARCHAR(100) NULL,
    FileSizeKB DECIMAL(18,2) NULL,
    PageCount INT NULL,
    Copies INT NOT NULL DEFAULT 1,
    TotalSheets INT NULL,
    UploadedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_RequestAttachments_Requests FOREIGN KEY (RequestId) REFERENCES dbo.PhotocopyRequests(RequestId),
    CONSTRAINT FK_RequestAttachments_FileStorage FOREIGN KEY (FileId) REFERENCES dbo.FileStorage(FileId)
);
GO

CREATE TABLE dbo.PrintingLogs (
    PrintingLogId INT IDENTITY(1,1) PRIMARY KEY,
    RequestId INT NOT NULL,
    PrintedBy INT NOT NULL,
    PrinterAssetId INT NULL,
    PrintedPages INT NOT NULL DEFAULT 0,
    PrintedSheets INT NOT NULL DEFAULT 0,
    Remarks NVARCHAR(MAX) NULL,
    PrintedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_PrintingLogs_Requests FOREIGN KEY (RequestId) REFERENCES dbo.PhotocopyRequests(RequestId),
    CONSTRAINT FK_PrintingLogs_PrintedBy FOREIGN KEY (PrintedBy) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.DepartmentPrintLimits (
    DepartmentLimitId INT IDENTITY(1,1) PRIMARY KEY,
    DepartmentId INT NOT NULL,
    MonthNumber INT NOT NULL,
    YearNumber INT NOT NULL,
    SheetLimit INT NOT NULL,
    CreatedBy INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT UQ_DepartmentPrintLimits UNIQUE (DepartmentId, MonthNumber, YearNumber),
    CONSTRAINT FK_DepartmentPrintLimits_Departments FOREIGN KEY (DepartmentId) REFERENCES dbo.Departments(DepartmentId),
    CONSTRAINT FK_DepartmentPrintLimits_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.SubjectPrintLimits (
    SubjectLimitId INT IDENTITY(1,1) PRIMARY KEY,
    DepartmentLimitId INT NOT NULL,
    DepartmentId INT NOT NULL,
    SubjectId INT NOT NULL,
    HodUserId INT NULL,
    MonthNumber INT NOT NULL,
    YearNumber INT NOT NULL,
    SheetLimit INT NOT NULL,
    CreatedBy INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT UQ_SubjectPrintLimits UNIQUE (DepartmentId, SubjectId, MonthNumber, YearNumber),
    CONSTRAINT FK_SubjectPrintLimits_DepartmentLimits FOREIGN KEY (DepartmentLimitId) REFERENCES dbo.DepartmentPrintLimits(DepartmentLimitId),
    CONSTRAINT FK_SubjectPrintLimits_Departments FOREIGN KEY (DepartmentId) REFERENCES dbo.Departments(DepartmentId),
    CONSTRAINT FK_SubjectPrintLimits_Subjects FOREIGN KEY (SubjectId) REFERENCES dbo.Subjects(SubjectId),
    CONSTRAINT FK_SubjectPrintLimits_HOD FOREIGN KEY (HodUserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_SubjectPrintLimits_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES dbo.Users(UserId)
);
GO

/* ============================================================
   13. INVENTORY / CONSUMABLES
   ============================================================ */

CREATE TABLE dbo.InventoryItemTypes (
    InventoryItemTypeId INT IDENTITY(1,1) PRIMARY KEY,
    ItemTypeKey NVARCHAR(100) NOT NULL UNIQUE,
    ItemTypeName NVARCHAR(150) NOT NULL,
    Description NVARCHAR(255) NULL,
    VisibilityStatusId INT NOT NULL,
    IsConsumable BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_InventoryItemTypes_VisibilityStatuses FOREIGN KEY (VisibilityStatusId) REFERENCES dbo.FeatureVisibilityStatuses(VisibilityStatusId)
);
GO

CREATE TABLE dbo.PaperInventory (
    InventoryId INT IDENTITY(1,1) PRIMARY KEY,
    PaperType VARCHAR(10) NOT NULL UNIQUE,
    CurrentStock INT NOT NULL DEFAULT 0,
    LastUpdated DATETIME NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE dbo.InventoryTransactions (
    TransactionId INT IDENTITY(1,1) PRIMARY KEY,
    InventoryItemTypeId INT NULL,
    PaperType VARCHAR(10) NULL,
    TransactionType VARCHAR(50) NOT NULL,
    Quantity INT NOT NULL,
    PreviousStock INT NOT NULL,
    NewStock INT NOT NULL,
    ReferenceId INT NULL,
    Remarks VARCHAR(255) NULL,
    CreatedBy INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_InventoryTransactions_ItemTypes FOREIGN KEY (InventoryItemTypeId) REFERENCES dbo.InventoryItemTypes(InventoryItemTypeId),
    CONSTRAINT FK_InventoryTransactions_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.PaperPurchases (
    PurchaseId INT IDENTITY(1,1) PRIMARY KEY,
    PaperType VARCHAR(10) NOT NULL,
    QuantityBoxes INT NOT NULL,
    TotalBundles AS (QuantityBoxes * 5) PERSISTED,
    TotalSheets AS (QuantityBoxes * 5 * 500) PERSISTED,
    PurchaseDate DATE NOT NULL,
    CreatedBy INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_PaperPurchases_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.PaperDistributions (
    DistributionId INT IDENTITY(1,1) PRIMARY KEY,
    PaperType VARCHAR(10) NOT NULL,
    BundlesIssued INT NOT NULL,
    IssuedTo VARCHAR(100) NOT NULL,
    IssuedDate DATE NOT NULL,
    ReceivedByName VARCHAR(100) NULL,
    RequestedByUserId INT NULL,
    DepartmentId INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_PaperDistributions_RequestedBy FOREIGN KEY (RequestedByUserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_PaperDistributions_Departments FOREIGN KEY (DepartmentId) REFERENCES dbo.Departments(DepartmentId)
);
GO

/* ============================================================
   14. ADVANCED IT ASSETS
   ============================================================ */

CREATE TABLE dbo.ITAssetCategories (
    ITAssetCategoryId INT IDENTITY(1,1) PRIMARY KEY,
    CategoryKey NVARCHAR(100) NOT NULL UNIQUE,
    CategoryName NVARCHAR(150) NOT NULL,
    Description NVARCHAR(255) NULL,
    VisibilityStatusId INT NOT NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_ITAssetCategories_VisibilityStatuses FOREIGN KEY (VisibilityStatusId) REFERENCES dbo.FeatureVisibilityStatuses(VisibilityStatusId)
);
GO

CREATE TABLE dbo.ITAssetStatuses (
    ITAssetStatusId INT IDENTITY(1,1) PRIMARY KEY,
    StatusKey NVARCHAR(100) NOT NULL UNIQUE,
    StatusName NVARCHAR(150) NOT NULL,
    Description NVARCHAR(255) NULL,
    IsFinalStatus BIT NOT NULL DEFAULT 0,
    SortOrder INT NOT NULL DEFAULT 0
);
GO

CREATE TABLE dbo.ITAssetConditions (
    ITAssetConditionId INT IDENTITY(1,1) PRIMARY KEY,
    ConditionKey NVARCHAR(100) NOT NULL UNIQUE,
    ConditionName NVARCHAR(150) NOT NULL,
    Description NVARCHAR(255) NULL,
    SortOrder INT NOT NULL DEFAULT 0
);
GO

CREATE TABLE dbo.ITAssetBrands (
    ITAssetBrandId INT IDENTITY(1,1) PRIMARY KEY,
    BrandName NVARCHAR(150) NOT NULL UNIQUE,
    IsActive BIT NOT NULL DEFAULT 1
);
GO

CREATE TABLE dbo.ITAssetModels (
    ITAssetModelId INT IDENTITY(1,1) PRIMARY KEY,
    ITAssetCategoryId INT NOT NULL,
    ITAssetBrandId INT NULL,
    ModelName NVARCHAR(150) NOT NULL,
    ModelDescription NVARCHAR(255) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_ITAssetModels_Categories FOREIGN KEY (ITAssetCategoryId) REFERENCES dbo.ITAssetCategories(ITAssetCategoryId),
    CONSTRAINT FK_ITAssetModels_Brands FOREIGN KEY (ITAssetBrandId) REFERENCES dbo.ITAssetBrands(ITAssetBrandId)
);
GO

CREATE TABLE dbo.ITAssets (
    AssetId INT IDENTITY(1,1) PRIMARY KEY,
    AssetTag NVARCHAR(100) NOT NULL UNIQUE,
    ITAssetCategoryId INT NOT NULL,
    ITAssetModelId INT NULL,
    ModelDescription NVARCHAR(255) NULL,
    SerialIpMac NVARCHAR(255) NULL,
    ITAssetStatusId INT NOT NULL,
    ITAssetConditionId INT NULL,
    CurrentAssignedUserId INT NULL,
    CurrentAssignedName NVARCHAR(255) NULL,
    CurrentAssignedEmployeeCode NVARCHAR(50) NULL,
    CurrentAssignedEmail NVARCHAR(255) NULL,
    CurrentRoomId INT NULL,
    CurrentDepartmentId INT NULL,
    CurrentLocationId INT NULL,
    AcquiredChangedDate DATE NULL,
    PreviousOwner NVARCHAR(255) NULL,
    SourceSheet NVARCHAR(150) NULL,
    SourceRow INT NULL,
    DuplicateTagStatus NVARCHAR(50) NULL,
    OriginalRecordId INT NULL,
    ImportBatchId INT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    CONSTRAINT FK_ITAssets_Categories FOREIGN KEY (ITAssetCategoryId) REFERENCES dbo.ITAssetCategories(ITAssetCategoryId),
    CONSTRAINT FK_ITAssets_Models FOREIGN KEY (ITAssetModelId) REFERENCES dbo.ITAssetModels(ITAssetModelId),
    CONSTRAINT FK_ITAssets_Statuses FOREIGN KEY (ITAssetStatusId) REFERENCES dbo.ITAssetStatuses(ITAssetStatusId),
    CONSTRAINT FK_ITAssets_Conditions FOREIGN KEY (ITAssetConditionId) REFERENCES dbo.ITAssetConditions(ITAssetConditionId),
    CONSTRAINT FK_ITAssets_CurrentAssignedUser FOREIGN KEY (CurrentAssignedUserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_ITAssets_CurrentRoom FOREIGN KEY (CurrentRoomId) REFERENCES dbo.Rooms(RoomId),
    CONSTRAINT FK_ITAssets_CurrentDepartment FOREIGN KEY (CurrentDepartmentId) REFERENCES dbo.Departments(DepartmentId),
    CONSTRAINT FK_ITAssets_CurrentLocation FOREIGN KEY (CurrentLocationId) REFERENCES dbo.Locations(LocationId)
);
GO

/* Category-specific details */
CREATE TABLE dbo.ITAssetLaptopDetails (
    AssetId INT PRIMARY KEY,
    Cpu NVARCHAR(150) NULL,
    Ram NVARCHAR(100) NULL,
    Storage NVARCHAR(100) NULL,
    OperatingSystem NVARCHAR(150) NULL,
    HasCharger BIT NULL,
    CONSTRAINT FK_ITAssetLaptopDetails_Assets FOREIGN KEY (AssetId) REFERENCES dbo.ITAssets(AssetId)
);
GO

CREATE TABLE dbo.ITAssetPrinterCopierDetails (
    AssetId INT PRIMARY KEY,
    CanPrint BIT NOT NULL DEFAULT 1,
    CanCopy BIT NOT NULL DEFAULT 0,
    CanScan BIT NOT NULL DEFAULT 0,
    CanFax BIT NOT NULL DEFAULT 0,
    SupportsA3 BIT NOT NULL DEFAULT 0,
    SupportsA4 BIT NOT NULL DEFAULT 1,
    IsColor BIT NOT NULL DEFAULT 0,
    IsDuplex BIT NOT NULL DEFAULT 0,
    IsNetworked BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_ITAssetPrinterCopierDetails_Assets FOREIGN KEY (AssetId) REFERENCES dbo.ITAssets(AssetId)
);
GO

CREATE TABLE dbo.ITAssetProjectorDetails (
    AssetId INT PRIMARY KEY,
    LampHours INT NULL,
    BrightnessLumens INT NULL,
    HasRemote BIT NULL,
    MountType NVARCHAR(100) NULL,
    CONSTRAINT FK_ITAssetProjectorDetails_Assets FOREIGN KEY (AssetId) REFERENCES dbo.ITAssets(AssetId)
);
GO

CREATE TABLE dbo.ITAssetNetworkDetails (
    AssetId INT PRIMARY KEY,
    IpAddress NVARCHAR(100) NULL,
    MacAddress NVARCHAR(100) NULL,
    PortCount INT NULL,
    FirmwareVersion NVARCHAR(100) NULL,
    RackLocation NVARCHAR(100) NULL,
    CONSTRAINT FK_ITAssetNetworkDetails_Assets FOREIGN KEY (AssetId) REFERENCES dbo.ITAssets(AssetId)
);
GO

CREATE TABLE dbo.ITAssetPhoneDetails (
    AssetId INT PRIMARY KEY,
    ExtensionNumber NVARCHAR(50) NULL,
    IpAddress NVARCHAR(100) NULL,
    MacAddress NVARCHAR(100) NULL,
    CONSTRAINT FK_ITAssetPhoneDetails_Assets FOREIGN KEY (AssetId) REFERENCES dbo.ITAssets(AssetId)
);
GO

CREATE TABLE dbo.ITAssetAssignments (
    AssetAssignmentId INT IDENTITY(1,1) PRIMARY KEY,
    AssetId INT NOT NULL,
    AssignmentTargetType NVARCHAR(50) NOT NULL, -- User, Room, Department, Location
    AssignedToUserId INT NULL,
    AssignedToName NVARCHAR(255) NULL,
    AssignedToEmail NVARCHAR(255) NULL,
    AssignedToEmployeeCode NVARCHAR(50) NULL,
    RoomId INT NULL,
    DepartmentId INT NULL,
    LocationId INT NULL,
    AssignedByUserId INT NULL,
    AssignedAt DATETIME NOT NULL DEFAULT GETDATE(),
    ReturnedAt DATETIME NULL,
    Notes NVARCHAR(MAX) NULL,
    CONSTRAINT FK_ITAssetAssignments_Assets FOREIGN KEY (AssetId) REFERENCES dbo.ITAssets(AssetId),
    CONSTRAINT FK_ITAssetAssignments_AssignedToUser FOREIGN KEY (AssignedToUserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_ITAssetAssignments_Rooms FOREIGN KEY (RoomId) REFERENCES dbo.Rooms(RoomId),
    CONSTRAINT FK_ITAssetAssignments_Departments FOREIGN KEY (DepartmentId) REFERENCES dbo.Departments(DepartmentId),
    CONSTRAINT FK_ITAssetAssignments_Locations FOREIGN KEY (LocationId) REFERENCES dbo.Locations(LocationId),
    CONSTRAINT FK_ITAssetAssignments_AssignedBy FOREIGN KEY (AssignedByUserId) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.ITAssetStatusHistory (
    AssetStatusHistoryId INT IDENTITY(1,1) PRIMARY KEY,
    AssetId INT NOT NULL,
    OldStatusId INT NULL,
    NewStatusId INT NOT NULL,
    ChangedBy INT NULL,
    ChangedAt DATETIME NOT NULL DEFAULT GETDATE(),
    Notes NVARCHAR(MAX) NULL,
    CONSTRAINT FK_ITAssetStatusHistory_Assets FOREIGN KEY (AssetId) REFERENCES dbo.ITAssets(AssetId),
    CONSTRAINT FK_ITAssetStatusHistory_OldStatus FOREIGN KEY (OldStatusId) REFERENCES dbo.ITAssetStatuses(ITAssetStatusId),
    CONSTRAINT FK_ITAssetStatusHistory_NewStatus FOREIGN KEY (NewStatusId) REFERENCES dbo.ITAssetStatuses(ITAssetStatusId),
    CONSTRAINT FK_ITAssetStatusHistory_ChangedBy FOREIGN KEY (ChangedBy) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.ITAssetNoteTypes (
    NoteTypeId INT IDENTITY(1,1) PRIMARY KEY,
    NoteTypeKey NVARCHAR(100) NOT NULL UNIQUE,
    NoteTypeName NVARCHAR(150) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1
);
GO

CREATE TABLE dbo.ITAssetNotes (
    AssetNoteId INT IDENTITY(1,1) PRIMARY KEY,
    AssetId INT NOT NULL,
    NoteTypeId INT NOT NULL,
    NoteText NVARCHAR(MAX) NOT NULL,
    CreatedBy INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_ITAssetNotes_Assets FOREIGN KEY (AssetId) REFERENCES dbo.ITAssets(AssetId),
    CONSTRAINT FK_ITAssetNotes_NoteTypes FOREIGN KEY (NoteTypeId) REFERENCES dbo.ITAssetNoteTypes(NoteTypeId),
    CONSTRAINT FK_ITAssetNotes_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.ITAssetIssueCategories (
    IssueCategoryId INT IDENTITY(1,1) PRIMARY KEY,
    IssueCategoryKey NVARCHAR(100) NOT NULL UNIQUE,
    IssueCategoryName NVARCHAR(150) NOT NULL,
    ITAssetCategoryId INT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_ITAssetIssueCategories_AssetCategories FOREIGN KEY (ITAssetCategoryId) REFERENCES dbo.ITAssetCategories(ITAssetCategoryId)
);
GO

CREATE TABLE dbo.ITAssetIssueTypes (
    IssueTypeId INT IDENTITY(1,1) PRIMARY KEY,
    IssueCategoryId INT NOT NULL,
    IssueTypeKey NVARCHAR(100) NOT NULL UNIQUE,
    IssueTypeName NVARCHAR(150) NOT NULL,
    Description NVARCHAR(255) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_ITAssetIssueTypes_Categories FOREIGN KEY (IssueCategoryId) REFERENCES dbo.ITAssetIssueCategories(IssueCategoryId)
);
GO

CREATE TABLE dbo.ITAssetIssueLogs (
    IssueLogId INT IDENTITY(1,1) PRIMARY KEY,
    AssetId INT NOT NULL,
    IssueTypeId INT NOT NULL,
    ReportedByUserId INT NULL,
    AssignedToUserId INT NULL,
    IssueStatus NVARCHAR(50) NOT NULL DEFAULT 'Open',
    Priority NVARCHAR(50) NOT NULL DEFAULT 'Normal',
    Description NVARCHAR(MAX) NULL,
    Resolution NVARCHAR(MAX) NULL,
    ReportedAt DATETIME NOT NULL DEFAULT GETDATE(),
    ResolvedAt DATETIME NULL,
    CONSTRAINT FK_ITAssetIssueLogs_Assets FOREIGN KEY (AssetId) REFERENCES dbo.ITAssets(AssetId),
    CONSTRAINT FK_ITAssetIssueLogs_IssueTypes FOREIGN KEY (IssueTypeId) REFERENCES dbo.ITAssetIssueTypes(IssueTypeId),
    CONSTRAINT FK_ITAssetIssueLogs_ReportedBy FOREIGN KEY (ReportedByUserId) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_ITAssetIssueLogs_AssignedTo FOREIGN KEY (AssignedToUserId) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.ITAssetMaintenanceLogs (
    MaintenanceLogId INT IDENTITY(1,1) PRIMARY KEY,
    AssetId INT NOT NULL,
    MaintenanceType NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    PerformedBy INT NULL,
    Cost DECIMAL(18,2) NULL,
    PerformedAt DATETIME NOT NULL DEFAULT GETDATE(),
    NextDueAt DATETIME NULL,
    CONSTRAINT FK_ITAssetMaintenanceLogs_Assets FOREIGN KEY (AssetId) REFERENCES dbo.ITAssets(AssetId),
    CONSTRAINT FK_ITAssetMaintenanceLogs_PerformedBy FOREIGN KEY (PerformedBy) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.ITAssetDisposals (
    DisposalId INT IDENTITY(1,1) PRIMARY KEY,
    AssetId INT NOT NULL,
    DisposalStatus NVARCHAR(50) NOT NULL DEFAULT 'Ready for Disposal',
    Reason NVARCHAR(MAX) NULL,
    RequestedBy INT NULL,
    ApprovedBy INT NULL,
    RequestedAt DATETIME NOT NULL DEFAULT GETDATE(),
    ApprovedAt DATETIME NULL,
    DisposedAt DATETIME NULL,
    CONSTRAINT FK_ITAssetDisposals_Assets FOREIGN KEY (AssetId) REFERENCES dbo.ITAssets(AssetId),
    CONSTRAINT FK_ITAssetDisposals_RequestedBy FOREIGN KEY (RequestedBy) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_ITAssetDisposals_ApprovedBy FOREIGN KEY (ApprovedBy) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.PrinterMeterReadings (
    PrinterMeterReadingId INT IDENTITY(1,1) PRIMARY KEY,
    PrinterAssetId INT NOT NULL,
    ReadingDate DATE NOT NULL,
    BlackCounter INT NULL,
    ColorCounter INT NULL,
    A3Counter INT NULL,
    A4Counter INT NULL,
    TotalPages INT NULL,
    RecordedBy INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_PrinterMeterReadings_Assets FOREIGN KEY (PrinterAssetId) REFERENCES dbo.ITAssets(AssetId),
    CONSTRAINT FK_PrinterMeterReadings_RecordedBy FOREIGN KEY (RecordedBy) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.ITAssetImportBatches (
    ITAssetImportBatchId INT IDENTITY(1,1) PRIMARY KEY,
    BatchName NVARCHAR(150) NOT NULL,
    OriginalFileName NVARCHAR(255) NULL,
    UploadedBy INT NULL,
    TotalRows INT NOT NULL DEFAULT 0,
    ValidRows INT NOT NULL DEFAULT 0,
    InvalidRows INT NOT NULL DEFAULT 0,
    ImportedRows INT NOT NULL DEFAULT 0,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    ImportedAt DATETIME NULL,
    CONSTRAINT FK_ITAssetImportBatches_UploadedBy FOREIGN KEY (UploadedBy) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.ITAssetImportStaging (
    ITAssetImportStagingId INT IDENTITY(1,1) PRIMARY KEY,
    ITAssetImportBatchId INT NOT NULL,
    AssetTag NVARCHAR(100) NULL,
    Category NVARCHAR(150) NULL,
    ModelDescription NVARCHAR(255) NULL,
    SerialIpMac NVARCHAR(255) NULL,
    AssignedPersonName NVARCHAR(255) NULL,
    EmployeeCode NVARCHAR(50) NULL,
    AssignedSchoolEmail NVARCHAR(255) NULL,
    DepartmentName NVARCHAR(150) NULL,
    LocationName NVARCHAR(150) NULL,
    StatusName NVARCHAR(150) NULL,
    AcquiredChangedDate NVARCHAR(100) NULL,
    RawRemarks NVARCHAR(MAX) NULL,
    PreviousOwner NVARCHAR(255) NULL,
    SourceSheet NVARCHAR(150) NULL,
    SourceRow INT NULL,
    DuplicateTagStatus NVARCHAR(50) NULL,
    OriginalRecordId INT NULL,
    MatchedUserId INT NULL,
    MatchStatus NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    MatchNotes NVARCHAR(MAX) NULL,
    ImportStatus NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    ImportMessage NVARCHAR(MAX) NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    ImportedAt DATETIME NULL,
    CONSTRAINT FK_ITAssetImportStaging_Batches FOREIGN KEY (ITAssetImportBatchId) REFERENCES dbo.ITAssetImportBatches(ITAssetImportBatchId),
    CONSTRAINT FK_ITAssetImportStaging_MatchedUser FOREIGN KEY (MatchedUserId) REFERENCES dbo.Users(UserId)
);
GO

CREATE TABLE dbo.ITAssetNeededLaptops (
    NeededLaptopId INT IDENTITY(1,1) PRIMARY KEY,
    AssetTag NVARCHAR(100) NULL,
    LaptopModel NVARCHAR(255) NULL,
    TeacherCode NVARCHAR(50) NULL,
    TeacherName NVARCHAR(255) NULL,
    MatchedUserId INT NULL,
    SourceSheet NVARCHAR(150) NULL,
    SourceRow INT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending Review',
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_ITAssetNeededLaptops_MatchedUser FOREIGN KEY (MatchedUserId) REFERENCES dbo.Users(UserId)
);
GO

/* FK from PrintingLogs to ITAssets */
ALTER TABLE dbo.PrintingLogs
ADD CONSTRAINT FK_PrintingLogs_PrinterAsset
FOREIGN KEY (PrinterAssetId) REFERENCES dbo.ITAssets(AssetId);
GO

/* ============================================================
   15. IT TICKETS
   ============================================================ */

CREATE TABLE dbo.ITTickets (
    TicketId INT IDENTITY(1,1) PRIMARY KEY,
    TicketNumber NVARCHAR(50) NOT NULL UNIQUE,
    RequestedBy INT NOT NULL,
    AssignedTo INT NULL,
    RelatedAssetId INT NULL,
    Title NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    Priority NVARCHAR(50) NOT NULL DEFAULT 'Normal',
    Status NVARCHAR(50) NOT NULL DEFAULT 'Open',
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    ClosedAt DATETIME NULL,
    CONSTRAINT FK_ITTickets_RequestedBy FOREIGN KEY (RequestedBy) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_ITTickets_AssignedTo FOREIGN KEY (AssignedTo) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_ITTickets_RelatedAsset FOREIGN KEY (RelatedAssetId) REFERENCES dbo.ITAssets(AssetId)
);
GO

/* ============================================================
   16. VIEWS
   ============================================================ */

CREATE VIEW dbo.vw_DepartmentMonthlyUsage AS
SELECT
    DepartmentId,
    MONTH(SubmittedAt) AS MonthNumber,
    YEAR(SubmittedAt) AS YearNumber,
    SUM(TotalSheets) AS UsedSheets
FROM dbo.PhotocopyRequests
WHERE Status IN ('Approved by HOD', 'Approved by HOS', 'Printing', 'Completed')
GROUP BY DepartmentId, MONTH(SubmittedAt), YEAR(SubmittedAt);
GO

CREATE VIEW dbo.vw_SubjectMonthlyUsage AS
SELECT
    DepartmentId,
    SubjectId,
    MONTH(SubmittedAt) AS MonthNumber,
    YEAR(SubmittedAt) AS YearNumber,
    SUM(TotalSheets) AS UsedSheets
FROM dbo.PhotocopyRequests
WHERE Status IN ('Approved by HOD', 'Approved by HOS', 'Printing', 'Completed')
GROUP BY DepartmentId, SubjectId, MONTH(SubmittedAt), YEAR(SubmittedAt);
GO

/* ============================================================
   17. INDEXES
   ============================================================ */

CREATE INDEX IX_Users_RoleId ON dbo.Users(RoleId);
CREATE INDEX IX_Users_DepartmentId ON dbo.Users(DepartmentId);
CREATE INDEX IX_Users_SectionId ON dbo.Users(SectionId);
CREATE INDEX IX_Users_IsActive ON dbo.Users(IsActive);

CREATE INDEX IX_StaffImportStaging_Batch ON dbo.StaffImportStaging(StaffImportBatchId);
CREATE INDEX IX_StaffImportStaging_EmployeeId ON dbo.StaffImportStaging(EmployeeId);
CREATE INDEX IX_StaffImportStaging_SchoolEmail ON dbo.StaffImportStaging(SchoolEmail);

CREATE INDEX IX_UserAssignments_User_IsActive ON dbo.UserAssignments(UserId, IsActive);
CREATE INDEX IX_UserAssignments_AssignmentType ON dbo.UserAssignments(AssignmentTypeId, AcademicYearId, IsActive);
CREATE INDEX IX_UserAssignmentScopes_Assignment ON dbo.UserAssignmentScopes(UserAssignmentId);

CREATE INDEX IX_Menus_Workspace_Sort ON dbo.Menus(WorkspaceId, SortOrder);
CREATE INDEX IX_Menus_Module ON dbo.Menus(ModuleId);
CREATE INDEX IX_Widgets_Module ON dbo.Widgets(ModuleId);
CREATE INDEX IX_DashboardWidgets_Dashboard ON dbo.DashboardWidgets(DashboardId);

CREATE INDEX IX_Students_CurrentClass ON dbo.Students(CurrentClassId, IsActive);
CREATE INDEX IX_StudentClassEnrollments_Class ON dbo.StudentClassEnrollments(ClassId, AcademicYearId, IsCurrent);
CREATE INDEX IX_StudentIdCards_Batch_Status ON dbo.StudentIdCards(StudentIdBatchId, CardStatus);

CREATE INDEX IX_PhotocopyRequests_Status_SubmittedAt ON dbo.PhotocopyRequests(Status, SubmittedAt DESC);
CREATE INDEX IX_PhotocopyRequests_Teacher_SubmittedAt ON dbo.PhotocopyRequests(TeacherId, SubmittedAt DESC);
CREATE INDEX IX_PhotocopyRequests_CurrentApprover_Status ON dbo.PhotocopyRequests(CurrentApproverId, Status);
CREATE INDEX IX_PhotocopyRequests_Department_SubmittedAt ON dbo.PhotocopyRequests(DepartmentId, SubmittedAt DESC);

CREATE INDEX IX_RequestApprovals_RequestId ON dbo.RequestApprovals(RequestId);
CREATE INDEX IX_RequestApprovals_Approver_ActionDate ON dbo.RequestApprovals(ApproverId, ActionDate DESC);
CREATE INDEX IX_PrintingLogs_RequestId ON dbo.PrintingLogs(RequestId);

CREATE INDEX IX_InventoryTransactions_PaperType_CreatedAt ON dbo.InventoryTransactions(PaperType, CreatedAt DESC);

CREATE INDEX IX_ITAssets_AssetTag ON dbo.ITAssets(AssetTag);
CREATE INDEX IX_ITAssets_Category_Status ON dbo.ITAssets(ITAssetCategoryId, ITAssetStatusId);
CREATE INDEX IX_ITAssets_CurrentAssignedUser ON dbo.ITAssets(CurrentAssignedUserId);
CREATE INDEX IX_ITAssets_CurrentRoom ON dbo.ITAssets(CurrentRoomId);
CREATE INDEX IX_ITAssetAssignments_Asset ON dbo.ITAssetAssignments(AssetId, AssignedAt DESC);
CREATE INDEX IX_ITAssetIssueLogs_Asset_Status ON dbo.ITAssetIssueLogs(AssetId, IssueStatus);
CREATE INDEX IX_ITAssetImportStaging_AssetTag ON dbo.ITAssetImportStaging(AssetTag);
CREATE INDEX IX_ITAssetImportStaging_EmployeeCode ON dbo.ITAssetImportStaging(EmployeeCode);
CREATE INDEX IX_ITAssetImportStaging_Email ON dbo.ITAssetImportStaging(AssignedSchoolEmail);

CREATE INDEX IX_AuditLogs_User_CreatedAt ON dbo.AuditLogs(UserId, CreatedAt DESC);
CREATE INDEX IX_ActivityTimeline_Entity ON dbo.ActivityTimeline(EntityType, EntityId, CreatedAt DESC);
CREATE INDEX IX_Notifications_User_IsRead ON dbo.Notifications(UserId, IsRead, CreatedAt DESC);
CREATE INDEX IX_LoginHistory_User_CreatedAt ON dbo.LoginHistory(UserId, CreatedAt DESC);
CREATE INDEX IX_EmailQueue_Status_QueuedAt ON dbo.EmailQueue(Status, QueuedAt);
GO

SELECT 'All schema tables, views, indexes, and constraints created successfully.' AS Result;
GO
