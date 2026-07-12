SET NOCOUNT ON;
SET XACT_ABORT ON;
PRINT 'ARAB UNITY SCHOOL OPERATIONS PLATFORM - PRE-DEPLOYMENT CHECK';
PRINT 'IMPORTANT: Take and verify a full SQL Server backup before deployment.';

SELECT DB_NAME() DatabaseName,DATABASEPROPERTYEX(DB_NAME(),'Version') DatabaseVersion,compatibility_level CompatibilityLevel,state_desc DatabaseState,recovery_model_desc RecoveryModel FROM sys.databases WHERE name=DB_NAME();
IF OBJECT_ID('dbo.SchemaVersions','U') IS NOT NULL EXEC('SELECT TOP (20) * FROM dbo.SchemaVersions ORDER BY 1 DESC;') ELSE PRINT 'INFO: dbo.SchemaVersions is not present; release readiness is validated from required schema objects below.';

DECLARE @RequiredTables TABLE(TableName sysname);
INSERT @RequiredTables VALUES('Users'),('Roles'),('AccessLevels'),('Permissions'),('RolePermissions'),('UserPermissionOverrides'),('Workspaces'),('WorkspaceRoles'),('WorkspaceModules'),('WorkspaceMenus'),('WorkspaceButtons'),('WorkspaceWidgets'),('AssignmentTypes'),('AssignmentTypeScopeTypes'),('AssignmentTypeWorkspaces'),('UserAssignments'),('UserAssignmentScopes'),('Modules'),('Menus'),('Buttons'),('Widgets'),('Dashboards');
SELECT r.TableName,CASE WHEN t.object_id IS NULL THEN 'FAIL' ELSE 'PASS' END Result FROM @RequiredTables r LEFT JOIN sys.tables t ON t.schema_id=SCHEMA_ID('dbo') AND t.name=r.TableName ORDER BY r.TableName;
IF EXISTS(SELECT 1 FROM @RequiredTables r WHERE OBJECT_ID('dbo.'+r.TableName,'U') IS NULL) THROW 52000,'Pre-deployment failed: required tables are missing.',1;

DECLARE @RequiredColumns TABLE(TableName sysname,ColumnName sysname);
INSERT @RequiredColumns VALUES('Users','RoleId'),('Users','DefaultWorkspaceId'),('Roles','RoleKey'),('Workspaces','WorkspaceKey'),('Workspaces','WorkspaceCategory'),('Workspaces','DefaultRoute'),('AssignmentTypes','AssignmentKey'),('AssignmentTypeWorkspaces','AssignmentTypeId'),('AssignmentTypeWorkspaces','WorkspaceId'),('UserAssignments','AssignmentTypeId'),('UserAssignments','IsPrimary'),('UserAssignments','IsActive'),('UserAssignmentScopes','ScopeType'),('UserAssignmentScopes','ScopeEntityId'),('UserAssignmentScopes','ScopeVersion'),('WorkspaceMenus','IsVisible'),('WorkspaceMenus','IsEnabled');
SELECT r.TableName,r.ColumnName,CASE WHEN c.column_id IS NULL THEN 'FAIL' ELSE 'PASS' END Result FROM @RequiredColumns r LEFT JOIN sys.columns c ON c.object_id=OBJECT_ID('dbo.'+r.TableName) AND c.name=r.ColumnName ORDER BY r.TableName,r.ColumnName;
IF EXISTS(SELECT 1 FROM @RequiredColumns r WHERE COL_LENGTH('dbo.'+r.TableName,r.ColumnName) IS NULL) THROW 52001,'Pre-deployment failed: required columns are missing.',1;

SELECT WorkspaceCategory,IsActive,COUNT(*) WorkspaceCount FROM dbo.Workspaces GROUP BY WorkspaceCategory,IsActive ORDER BY WorkspaceCategory,IsActive DESC;
SELECT RoleKey,RoleName,DisplayName,IsActive FROM dbo.Roles ORDER BY RoleKey;
SELECT AssignmentKey,AssignmentName,IsActive,SortOrder FROM dbo.AssignmentTypes ORDER BY SortOrder,AssignmentKey;
SELECT 'PASS' Result,'Pre-deployment schema and data inventory completed. Confirm backup before running 001 or 002.' Message;
