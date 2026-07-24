-- ============================================================
-- ARAB UNITY SCHOOL OPERATIONS PLATFORM
-- User & Asset Data Reset Script (Preserves SuperAdmin User)
-- ============================================================
--
-- WARNING:
-- This script DELETES ALL transactional/activity data,
-- all IT assets, and all users EXCEPT the SuperAdmin user (A0297).
--
-- Preserved reference/master data:
-- - Roles, Permissions, Menus, Modules
-- - Departments, Sections, Subjects, YearGroups
-- - ITAssetStatuses, Categories, Brands, Models, Conditions
-- - Locations, Rooms
-- - SuperAdmin user (EmployeeId = A0297)
--
-- Run this in SQL Server Management Studio against OperationsPlatformDB.
-- ============================================================

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;

PRINT N'--- Deleting asset-related child records...';

DELETE FROM dbo.ITAssetPartRequirements WHERE 1 = 1;
DELETE FROM dbo.ITAssetStatusHistory WHERE 1 = 1;
DELETE FROM dbo.ITAssetMaintenanceLogs WHERE 1 = 1;
DELETE FROM dbo.ITAssetIssueLogs WHERE 1 = 1;
DELETE FROM dbo.ITAssetNotes WHERE 1 = 1;
DELETE FROM dbo.ITAssetAssignments WHERE 1 = 1;
DELETE FROM dbo.ITAssetTransferRequests WHERE 1 = 1;
DELETE FROM dbo.ITAssetDisposals WHERE 1 = 1;
DELETE FROM dbo.ITAssetGroupItems WHERE 1 = 1;
DELETE FROM dbo.ITAssetLaptopDetails WHERE 1 = 1;
DELETE FROM dbo.ITAssetNetworkDetails WHERE 1 = 1;
DELETE FROM dbo.ITAssetPhoneDetails WHERE 1 = 1;
DELETE FROM dbo.ITAssetPrinterCopierDetails WHERE 1 = 1;
DELETE FROM dbo.ITAssetProjectorDetails WHERE 1 = 1;
DELETE FROM dbo.ITAssetNeededLaptops WHERE 1 = 1;
DELETE FROM dbo.ITAssetImportStaging WHERE 1 = 1;
DELETE FROM dbo.ITAssetImportBatches WHERE 1 = 1;

PRINT N'--- Deleting all assets...';

DELETE FROM dbo.ITAssets WHERE 1 = 1;

PRINT N'--- Deleting user-related child records...';

DELETE FROM dbo.UserAssignmentScopes WHERE 1 = 1;
DELETE FROM dbo.UserAssignments WHERE 1 = 1;
DELETE FROM dbo.UserPermissionOverrides WHERE 1 = 1;
DELETE FROM dbo.UserSessions WHERE 1 = 1;
DELETE FROM dbo.UserNotificationPreferences WHERE 1 = 1;
DELETE FROM dbo.UserMenuPreferences WHERE 1 = 1;
DELETE FROM dbo.UserSubjects WHERE 1 = 1;
DELETE FROM dbo.UserRegistrationTokens WHERE 1 = 1;
DELETE FROM dbo.StaffProfiles WHERE 1 = 1;
DELETE FROM dbo.StaffImportStaging WHERE 1 = 1;
DELETE FROM dbo.StaffImportBatches WHERE 1 = 1;
DELETE FROM dbo.SavedReports WHERE 1 = 1;
DELETE FROM dbo.LoginHistory WHERE 1 = 1;
DELETE FROM dbo.Notifications WHERE 1 = 1;
DELETE FROM dbo.PasswordResetTokens WHERE 1 = 1;
DELETE FROM dbo.EmailVerificationTokens WHERE 1 = 1;
DELETE FROM dbo.AIUsageLogs WHERE 1 = 1;
DELETE FROM dbo.CalendarEventAttendees WHERE 1 = 1;
DELETE FROM dbo.ActivityTimeline WHERE 1 = 1;
DELETE FROM dbo.AuditLogs WHERE 1 = 1;
DELETE FROM dbo.PaperDistributions WHERE 1 = 1;
DELETE FROM dbo.SubjectPrintLimits WHERE 1 = 1;
DELETE FROM dbo.TaskAssignments WHERE 1 = 1;
DELETE FROM dbo.ITTickets WHERE 1 = 1;
DELETE FROM dbo.PrinterMeterReadings WHERE 1 = 1;
DELETE FROM dbo.PrintingWorkflowEvents WHERE 1 = 1;
DELETE FROM dbo.PrintingLogs WHERE 1 = 1;
DELETE FROM dbo.PhotocopyRequests WHERE 1 = 1;
DELETE FROM dbo.WorkspaceLiveSessions WHERE 1 = 1;

PRINT N'--- Nullifying user references in reference tables...';

UPDATE dbo.Branding SET UpdatedBy = NULL WHERE UpdatedBy IS NOT NULL;

PRINT N'--- Deleting all users except SuperAdmin (A0297)...';

DELETE FROM dbo.Users WHERE EmployeeId <> N'A0297';

PRINT N'--- Resetting identity seeds...';

DBCC CHECKIDENT ('dbo.ITAssets', RESEED, 0);
DBCC CHECKIDENT ('dbo.ITAssetMaintenanceLogs', RESEED, 0);
DBCC CHECKIDENT ('dbo.ITAssetIssueLogs', RESEED, 0);
DBCC CHECKIDENT ('dbo.ITAssetAssignments', RESEED, 0);
DBCC CHECKIDENT ('dbo.ITAssetTransferRequests', RESEED, 0);
DBCC CHECKIDENT ('dbo.ITAssetDisposals', RESEED, 0);
DBCC CHECKIDENT ('dbo.ITAssetImportBatches', RESEED, 0);
DBCC CHECKIDENT ('dbo.ITAssetImportStaging', RESEED, 0);
DBCC CHECKIDENT ('dbo.ITAssetPartRequirements', RESEED, 0);
DBCC CHECKIDENT ('dbo.ITAssetStatusHistory', RESEED, 0);
DBCC CHECKIDENT ('dbo.ITAssetNotes', RESEED, 0);
DBCC CHECKIDENT ('dbo.ITAssetGroupItems', RESEED, 0);
DBCC CHECKIDENT ('dbo.Users', RESEED, 0);
DBCC CHECKIDENT ('dbo.UserAssignments', RESEED, 0);
DBCC CHECKIDENT ('dbo.UserAssignmentScopes', RESEED, 0);
DBCC CHECKIDENT ('dbo.UserPermissionOverrides', RESEED, 0);
DBCC CHECKIDENT ('dbo.UserSessions', RESEED, 0);
DBCC CHECKIDENT ('dbo.StaffImportBatches', RESEED, 0);
DBCC CHECKIDENT ('dbo.StaffImportStaging', RESEED, 0);
DBCC CHECKIDENT ('dbo.ActivityTimeline', RESEED, 0);
DBCC CHECKIDENT ('dbo.AuditLogs', RESEED, 0);
DBCC CHECKIDENT ('dbo.LoginHistory', RESEED, 0);
DBCC CHECKIDENT ('dbo.ITTickets', RESEED, 0);
DBCC CHECKIDENT ('dbo.PrintingWorkflowEvents', RESEED, 0);
DBCC CHECKIDENT ('dbo.PhotocopyRequests', RESEED, 0);

COMMIT TRANSACTION;

PRINT N'--- Data reset complete. SuperAdmin user (A0297) preserved. ---';
