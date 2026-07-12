SET XACT_ABORT ON;
BEGIN TRANSACTION;

DECLARE @Enabled int=(SELECT TOP 1 VisibilityStatusId FROM dbo.FeatureVisibilityStatuses WHERE LOWER(StatusKey)='enabled');
DECLARE @AdminLevel int=(SELECT AccessLevelId FROM dbo.AccessLevels WHERE AccessLevelKey='ADMIN_LEVEL');
IF @Enabled IS NULL OR @AdminLevel IS NULL THROW 50001,'Required platform lookups are missing.',1;

/* Roles only. Real employees must be assigned through User Management. */
DECLARE @Roles TABLE(RoleKey nvarchar(100),RoleName nvarchar(150),DisplayName nvarchar(150),Description nvarchar(500));
INSERT @Roles VALUES
('HOD','Head of Department','HOD','Department approval and reporting role.'),
('HOS','Head of Section','HOS','Section approval and allocation role.'),
('Secretary','Secretary','Secretary','HOS-equivalent operational approval role.'),
('Librarian','Librarian','Librarian','Library circulation and member support role.'),
('LibraryAdmin','Library Administrator','Library Admin','Library configuration and administration role.');
MERGE dbo.Roles t USING @Roles s ON t.RoleKey=s.RoleKey
WHEN MATCHED THEN UPDATE SET RoleName=s.RoleName,DisplayName=s.DisplayName,Description=s.Description,AccessLevelId=@AdminLevel,IsActive=1,UpdatedAt=GETDATE()
WHEN NOT MATCHED THEN INSERT(RoleKey,RoleName,DisplayName,AccessLevelId,Description,IsSystemRole,IsProtected,IsActive,CreatedAt)
VALUES(s.RoleKey,s.RoleName,s.DisplayName,@AdminLevel,s.Description,1,0,1,GETDATE());

/* Shared Library module. */
IF NOT EXISTS(SELECT 1 FROM dbo.Modules WHERE ModuleKey='library_management')
 INSERT dbo.Modules(ModuleKey,ModuleName,Description,Icon,BaseRoute,VisibilityStatusId,IsActive,SortOrder,CreatedAt)
 VALUES('library_management','Library Management','Books, members, circulation, reservations, inventory and reports.','LocalLibrary','/library',@Enabled,1,90,GETDATE());
ELSE UPDATE dbo.Modules SET ModuleName='Library Management',Description='Books, members, circulation, reservations, inventory and reports.',Icon='LocalLibrary',BaseRoute='/library',VisibilityStatusId=@Enabled,IsActive=1,UpdatedAt=GETDATE() WHERE ModuleKey='library_management';
DECLARE @ModuleId int=(SELECT ModuleId FROM dbo.Modules WHERE ModuleKey='library_management');

IF NOT EXISTS(SELECT 1 FROM dbo.PermissionGroups WHERE GroupKey='library')
 INSERT dbo.PermissionGroups(GroupKey,GroupName,Description,SortOrder,CreatedAt) VALUES('library','Library','Library management permissions',90,GETDATE());
DECLARE @GroupId int=(SELECT PermissionGroupId FROM dbo.PermissionGroups WHERE GroupKey='library');

DECLARE @Permissions TABLE(PermissionKey nvarchar(200),PermissionName nvarchar(200),Description nvarchar(500));
INSERT @Permissions VALUES
('library.dashboard.view','View Library Dashboard','View library dashboard and summary metrics.'),
('library.books.view','View Books','Search and view books.'),('library.books.create','Create Books','Create book records.'),('library.books.update','Update Books','Update book records.'),('library.books.delete','Deactivate Books','Deactivate book records.'),
('library.categories.manage','Manage Book Categories','Create and maintain book categories.'),
('library.members.view','View Library Members','View library membership.'),('library.members.manage','Manage Library Members','Create and maintain memberships.'),
('library.loans.view','View Borrowing','View borrowing and return history.'),('library.loans.issue','Issue Books','Issue books to members.'),('library.loans.return','Return Books','Return issued books.'),('library.loans.renew','Renew Loans','Renew active loans.'),
('library.reservations.view','View Reservations','View book reservations.'),('library.reservations.manage','Manage Reservations','Create, fulfil and cancel reservations.'),
('library.overdue.view','View Overdue Items','View overdue loans.'),('library.inventory.manage','Manage Library Inventory','Adjust and audit book inventory.'),
('library.reports.view','View Library Reports','View and export library reports.'),('library.settings.manage','Manage Library Settings','Configure loan periods, renewals and fines.');
MERGE dbo.Permissions t USING @Permissions s ON t.PermissionKey=s.PermissionKey
WHEN MATCHED THEN UPDATE SET PermissionName=s.PermissionName,ModuleId=@ModuleId,PermissionGroupId=@GroupId,Description=s.Description,IsActive=1,UpdatedAt=GETDATE()
WHEN NOT MATCHED THEN INSERT(PermissionKey,PermissionName,ModuleId,PermissionGroupId,Description,IsActive,CreatedAt)
VALUES(s.PermissionKey,s.PermissionName,@ModuleId,@GroupId,s.Description,1,GETDATE());

/* Library business schema. */
IF OBJECT_ID('dbo.LibraryCategories','U') IS NULL CREATE TABLE dbo.LibraryCategories(
 LibraryCategoryId int IDENTITY PRIMARY KEY,CategoryKey nvarchar(100) NOT NULL UNIQUE,CategoryName nvarchar(150) NOT NULL,Description nvarchar(500) NULL,SortOrder int NOT NULL DEFAULT 0,IsActive bit NOT NULL DEFAULT 1,CreatedAt datetime NOT NULL DEFAULT GETDATE(),UpdatedAt datetime NULL);
IF OBJECT_ID('dbo.LibraryBooks','U') IS NULL CREATE TABLE dbo.LibraryBooks(
 LibraryBookId int IDENTITY PRIMARY KEY,ISBN nvarchar(30) NULL,Barcode nvarchar(100) NOT NULL UNIQUE,Title nvarchar(300) NOT NULL,Author nvarchar(250) NULL,Publisher nvarchar(200) NULL,PublicationYear int NULL,LibraryCategoryId int NULL REFERENCES dbo.LibraryCategories(LibraryCategoryId),ShelfLocation nvarchar(100) NULL,TotalCopies int NOT NULL DEFAULT 1,AvailableCopies int NOT NULL DEFAULT 1,Description nvarchar(1000) NULL,IsActive bit NOT NULL DEFAULT 1,CreatedAt datetime NOT NULL DEFAULT GETDATE(),UpdatedAt datetime NULL,CONSTRAINT CK_LibraryBooks_Copies CHECK(TotalCopies>=0 AND AvailableCopies>=0 AND AvailableCopies<=TotalCopies));
IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE name='IX_LibraryBooks_Search' AND object_id=OBJECT_ID('dbo.LibraryBooks')) CREATE INDEX IX_LibraryBooks_Search ON dbo.LibraryBooks(Title,Author,ISBN);
IF OBJECT_ID('dbo.LibraryMembers','U') IS NULL CREATE TABLE dbo.LibraryMembers(
 LibraryMemberId int IDENTITY PRIMARY KEY,UserId int NOT NULL REFERENCES dbo.Users(UserId),MembershipNumber nvarchar(100) NOT NULL UNIQUE,JoinedAt datetime NOT NULL DEFAULT GETDATE(),ExpiresAt datetime NULL,MaxActiveLoans int NOT NULL DEFAULT 5,IsActive bit NOT NULL DEFAULT 1,CreatedAt datetime NOT NULL DEFAULT GETDATE(),UpdatedAt datetime NULL,CONSTRAINT UQ_LibraryMembers_User UNIQUE(UserId));
IF OBJECT_ID('dbo.LibraryLoans','U') IS NULL CREATE TABLE dbo.LibraryLoans(
 LibraryLoanId int IDENTITY PRIMARY KEY,LibraryBookId int NOT NULL REFERENCES dbo.LibraryBooks(LibraryBookId),LibraryMemberId int NOT NULL REFERENCES dbo.LibraryMembers(LibraryMemberId),IssuedAt datetime NOT NULL DEFAULT GETDATE(),DueAt datetime NOT NULL,ReturnedAt datetime NULL,RenewalCount int NOT NULL DEFAULT 0,Status nvarchar(30) NOT NULL DEFAULT 'Issued',IssueCondition nvarchar(200) NULL,ReturnCondition nvarchar(200) NULL,Notes nvarchar(1000) NULL,IssuedBy int NOT NULL REFERENCES dbo.Users(UserId),ReturnedBy int NULL REFERENCES dbo.Users(UserId),CreatedAt datetime NOT NULL DEFAULT GETDATE(),UpdatedAt datetime NULL,CONSTRAINT CK_LibraryLoans_Status CHECK(Status IN('Issued','Returned','Overdue','Lost','Cancelled')));
IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE name='IX_LibraryLoans_Active' AND object_id=OBJECT_ID('dbo.LibraryLoans')) CREATE INDEX IX_LibraryLoans_Active ON dbo.LibraryLoans(LibraryMemberId,Status,DueAt);
IF OBJECT_ID('dbo.LibraryReservations','U') IS NULL CREATE TABLE dbo.LibraryReservations(
 LibraryReservationId int IDENTITY PRIMARY KEY,LibraryBookId int NOT NULL REFERENCES dbo.LibraryBooks(LibraryBookId),LibraryMemberId int NOT NULL REFERENCES dbo.LibraryMembers(LibraryMemberId),ReservedAt datetime NOT NULL DEFAULT GETDATE(),ExpiresAt datetime NULL,FulfilledAt datetime NULL,Status nvarchar(30) NOT NULL DEFAULT 'Pending',Notes nvarchar(500) NULL,CreatedBy int NOT NULL REFERENCES dbo.Users(UserId),CreatedAt datetime NOT NULL DEFAULT GETDATE(),UpdatedAt datetime NULL,CONSTRAINT CK_LibraryReservations_Status CHECK(Status IN('Pending','Ready','Fulfilled','Cancelled','Expired')));
IF OBJECT_ID('dbo.LibraryInventoryTransactions','U') IS NULL CREATE TABLE dbo.LibraryInventoryTransactions(
 LibraryInventoryTransactionId int IDENTITY PRIMARY KEY,LibraryBookId int NOT NULL REFERENCES dbo.LibraryBooks(LibraryBookId),TransactionType nvarchar(30) NOT NULL,Quantity int NOT NULL,PreviousTotal int NOT NULL,NewTotal int NOT NULL,Reason nvarchar(500) NOT NULL,PerformedBy int NOT NULL REFERENCES dbo.Users(UserId),CreatedAt datetime NOT NULL DEFAULT GETDATE(),CONSTRAINT CK_LibraryInventory_Type CHECK(TransactionType IN('Opening','Purchase','Donation','Adjustment','Lost','Damaged','Withdrawal')));
IF OBJECT_ID('dbo.LibrarySettings','U') IS NULL CREATE TABLE dbo.LibrarySettings(
 LibrarySettingId int IDENTITY PRIMARY KEY,SettingKey nvarchar(100) NOT NULL UNIQUE,SettingValue nvarchar(500) NOT NULL,Description nvarchar(500) NULL,UpdatedBy int NULL REFERENCES dbo.Users(UserId),CreatedAt datetime NOT NULL DEFAULT GETDATE(),UpdatedAt datetime NULL);
MERGE dbo.LibrarySettings t USING (VALUES('default_loan_days','14','Default borrowing period in days'),('max_renewals','2','Maximum renewals per loan'),('reservation_expiry_days','3','Days a ready reservation remains available')) s(SettingKey,SettingValue,Description) ON t.SettingKey=s.SettingKey
WHEN NOT MATCHED THEN INSERT(SettingKey,SettingValue,Description) VALUES(s.SettingKey,s.SettingValue,s.Description);

/* Workspace/module/role mappings. */
DECLARE @WorkspaceId int=(SELECT WorkspaceId FROM dbo.Workspaces WHERE WorkspaceKey='library-admin');
DECLARE @SuperWorkspaceId int=(SELECT WorkspaceId FROM dbo.Workspaces WHERE WorkspaceKey='super-admin');
IF @WorkspaceId IS NULL THROW 50002,'Library workspace is missing. Run 20260711_workspace_configuration.sql first.',1;
MERGE dbo.WorkspaceModules t USING (SELECT @WorkspaceId WorkspaceId,@ModuleId ModuleId) s ON t.WorkspaceId=s.WorkspaceId AND t.ModuleId=s.ModuleId
WHEN NOT MATCHED THEN INSERT(WorkspaceId,ModuleId,IsVisible,IsEnabled,SortOrder) VALUES(s.WorkspaceId,s.ModuleId,1,1,10)
WHEN MATCHED THEN UPDATE SET IsVisible=1,IsEnabled=1,SortOrder=10,UpdatedAt=GETDATE();
IF @SuperWorkspaceId IS NOT NULL MERGE dbo.WorkspaceModules t USING (SELECT @SuperWorkspaceId WorkspaceId,@ModuleId ModuleId) s ON t.WorkspaceId=s.WorkspaceId AND t.ModuleId=s.ModuleId WHEN NOT MATCHED THEN INSERT(WorkspaceId,ModuleId,IsVisible,IsEnabled,SortOrder) VALUES(s.WorkspaceId,s.ModuleId,1,1,90) WHEN MATCHED THEN UPDATE SET IsVisible=1,IsEnabled=1,UpdatedAt=GETDATE();
MERGE dbo.WorkspaceRoles t USING (SELECT @WorkspaceId WorkspaceId,RoleId FROM dbo.Roles WHERE RoleKey IN('Librarian','LibraryAdmin')) s ON t.WorkspaceId=s.WorkspaceId AND t.RoleId=s.RoleId
WHEN NOT MATCHED THEN INSERT(WorkspaceId,RoleId,IsDefault,CreatedAt) VALUES(s.WorkspaceId,s.RoleId,1,GETDATE());

/* Role permissions: Librarian receives operations; LibraryAdmin receives all. */
INSERT dbo.RolePermissions(RoleId,PermissionId,IsAllowed,CreatedAt)
SELECT r.RoleId,p.PermissionId,1,GETDATE() FROM dbo.Roles r CROSS JOIN dbo.Permissions p WHERE p.ModuleId=@ModuleId
AND (r.RoleKey='LibraryAdmin' OR (r.RoleKey='Librarian' AND p.PermissionKey NOT IN('library.books.delete','library.settings.manage')))
AND NOT EXISTS(SELECT 1 FROM dbo.RolePermissions rp WHERE rp.RoleId=r.RoleId AND rp.PermissionId=p.PermissionId);

/* Menus reuse the single Library implementation. */
DECLARE @Menus TABLE(MenuKey nvarchar(150),MenuName nvarchar(150),Route nvarchar(300),Icon nvarchar(100),PermissionKey nvarchar(200),SortOrder int);
INSERT @Menus VALUES
('library_dashboard','Library Dashboard','/library/dashboard','Dashboard','library.dashboard.view',10),('library_books','Books','/library/books','MenuBook','library.books.view',20),('library_categories','Categories','/library/categories','Category','library.categories.manage',30),('library_members','Members','/library/members','People','library.members.view',40),('library_borrowing','Borrowing','/library/borrowing','LibraryBooks','library.loans.view',50),('library_returns','Returns','/library/returns','AssignmentReturned','library.loans.return',60),('library_reservations','Reservations','/library/reservations','Bookmark','library.reservations.view',70),('library_overdue','Overdue Items','/library/overdue','Warning','library.overdue.view',80),('library_inventory','Inventory','/library/inventory','Inventory','library.inventory.manage',90),('library_reports','Reports','/library/reports','Assessment','library.reports.view',100),('library_settings','Settings','/library/settings','Settings','library.settings.manage',110);
MERGE dbo.Menus t USING (SELECT m.*,p.PermissionId FROM @Menus m JOIN dbo.Permissions p ON p.PermissionKey=m.PermissionKey) s ON t.MenuKey=s.MenuKey
WHEN MATCHED THEN UPDATE SET WorkspaceId=@WorkspaceId,ModuleId=@ModuleId,MenuName=s.MenuName,Route=s.Route,Icon=s.Icon,PermissionId=s.PermissionId,VisibilityStatusId=@Enabled,SortOrder=s.SortOrder,UpdatedAt=GETDATE()
WHEN NOT MATCHED THEN INSERT(WorkspaceId,ModuleId,MenuKey,MenuName,Route,Icon,PermissionId,VisibilityStatusId,IsPinned,IsCollapsible,SortOrder,CreatedAt) VALUES(@WorkspaceId,@ModuleId,s.MenuKey,s.MenuName,s.Route,s.Icon,s.PermissionId,@Enabled,0,0,s.SortOrder,GETDATE());
MERGE dbo.WorkspaceMenus t USING (SELECT @WorkspaceId WorkspaceId,m.MenuId,m.SortOrder FROM dbo.Menus m JOIN @Menus x ON x.MenuKey=m.MenuKey) s ON t.WorkspaceId=s.WorkspaceId AND t.MenuId=s.MenuId
WHEN NOT MATCHED THEN INSERT(WorkspaceId,MenuId,GroupKey,GroupName,GroupSortOrder,IsVisible,IsEnabled,SortOrder) VALUES(s.WorkspaceId,s.MenuId,'LIBRARY','Library',10,1,1,s.SortOrder)
WHEN MATCHED THEN UPDATE SET GroupKey='LIBRARY',GroupName='Library',GroupSortOrder=10,IsVisible=1,IsEnabled=1,SortOrder=s.SortOrder,UpdatedAt=GETDATE();
IF @SuperWorkspaceId IS NOT NULL MERGE dbo.WorkspaceMenus t USING (SELECT @SuperWorkspaceId WorkspaceId,m.MenuId,m.SortOrder FROM dbo.Menus m JOIN @Menus x ON x.MenuKey=m.MenuKey) s ON t.WorkspaceId=s.WorkspaceId AND t.MenuId=s.MenuId WHEN NOT MATCHED THEN INSERT(WorkspaceId,MenuId,GroupKey,GroupName,GroupSortOrder,IsVisible,IsEnabled,SortOrder) VALUES(s.WorkspaceId,s.MenuId,'LIBRARY','Library',80,1,1,s.SortOrder) WHEN MATCHED THEN UPDATE SET IsVisible=1,IsEnabled=1,SortOrder=s.SortOrder,UpdatedAt=GETDATE();

IF NOT EXISTS(SELECT 1 FROM dbo.Dashboards WHERE DashboardKey='library_dashboard') INSERT dbo.Dashboards(DashboardKey,DashboardName,WorkspaceId,RoleId,ModuleId,IsDefault,VisibilityStatusId,CreatedAt) VALUES('library_dashboard','Library Dashboard',@WorkspaceId,(SELECT RoleId FROM dbo.Roles WHERE RoleKey='LibraryAdmin'),@ModuleId,1,@Enabled,GETDATE());
DECLARE @DashboardId int=(SELECT DashboardId FROM dbo.Dashboards WHERE DashboardKey='library_dashboard');
UPDATE dbo.Workspaces SET DefaultRoute='/library/dashboard',DefaultDashboardId=@DashboardId,UpdatedAt=GETDATE() WHERE WorkspaceId=@WorkspaceId;

DECLARE @Widgets TABLE(WidgetKey nvarchar(100),WidgetName nvarchar(150),DataSourceKey nvarchar(150),PermissionKey nvarchar(200),SortOrder int);
INSERT @Widgets VALUES('library_total_books','Total Books','library.dashboard.total_books','library.dashboard.view',10),('library_active_loans','Active Loans','library.dashboard.active_loans','library.loans.view',20),('library_overdue_loans','Overdue Loans','library.dashboard.overdue','library.overdue.view',30),('library_pending_reservations','Pending Reservations','library.dashboard.reservations','library.reservations.view',40);
MERGE dbo.Widgets t USING (SELECT w.*,p.PermissionId FROM @Widgets w JOIN dbo.Permissions p ON p.PermissionKey=w.PermissionKey) s ON t.WidgetKey=s.WidgetKey
WHEN MATCHED THEN UPDATE SET ModuleId=@ModuleId,WidgetName=s.WidgetName,WidgetType='KPI',DataSourceKey=s.DataSourceKey,PermissionId=s.PermissionId,VisibilityStatusId=@Enabled,DefaultWidth=3,DefaultHeight=1,SortOrder=s.SortOrder,UpdatedAt=GETDATE()
WHEN NOT MATCHED THEN INSERT(ModuleId,WidgetKey,WidgetName,WidgetType,DataSourceKey,PermissionId,VisibilityStatusId,DefaultWidth,DefaultHeight,SortOrder,CreatedAt) VALUES(@ModuleId,s.WidgetKey,s.WidgetName,'KPI',s.DataSourceKey,s.PermissionId,@Enabled,3,1,s.SortOrder,GETDATE());
MERGE dbo.WorkspaceWidgets t USING (SELECT @WorkspaceId WorkspaceId,w.WidgetId,w.SortOrder FROM dbo.Widgets w JOIN @Widgets x ON x.WidgetKey=w.WidgetKey) s ON t.WorkspaceId=s.WorkspaceId AND t.WidgetId=s.WidgetId
WHEN NOT MATCHED THEN INSERT(WorkspaceId,WidgetId,IsVisible,IsEnabled,SortOrder) VALUES(s.WorkspaceId,s.WidgetId,1,1,s.SortOrder)
WHEN MATCHED THEN UPDATE SET IsVisible=1,IsEnabled=1,SortOrder=s.SortOrder;
IF @SuperWorkspaceId IS NOT NULL MERGE dbo.WorkspaceWidgets t USING (SELECT @SuperWorkspaceId WorkspaceId,w.WidgetId,w.SortOrder FROM dbo.Widgets w JOIN @Widgets x ON x.WidgetKey=w.WidgetKey) s ON t.WorkspaceId=s.WorkspaceId AND t.WidgetId=s.WidgetId WHEN NOT MATCHED THEN INSERT(WorkspaceId,WidgetId,IsVisible,IsEnabled,SortOrder) VALUES(s.WorkspaceId,s.WidgetId,1,1,s.SortOrder) WHEN MATCHED THEN UPDATE SET IsVisible=1,IsEnabled=1,SortOrder=s.SortOrder;

COMMIT;
