SET XACT_ABORT ON;
SET NOCOUNT ON;

BEGIN TRANSACTION;

PRINT N'Nulling user references in reference tables...';
UPDATE dbo.ITAssetGroups SET CreatedBy = NULL WHERE CreatedBy IS NOT NULL;

PRINT N'Clearing user-related transactional data...';

DELETE FROM dbo.ActivityTimeline;
DELETE FROM dbo.AIUsageLogs;
DELETE FROM dbo.AnnouncementBanners;
DELETE FROM dbo.ApiKeys;
DELETE FROM dbo.AuditLogs;
DELETE FROM dbo.BackupJobs;
DELETE FROM dbo.CalendarEventAttendees;
DELETE FROM dbo.ConfigurationSnapshots;
DELETE FROM dbo.EmailVerificationTokens;
DELETE FROM dbo.EntityComments;
DELETE FROM dbo.EntityFiles;
DELETE FROM dbo.EntityTags;
DELETE FROM dbo.ImportErrorLogs;
DELETE FROM dbo.ArchiveRuns;
DELETE FROM dbo.ArchiveRecords;
DELETE FROM dbo.RestoreLogs;
DELETE FROM dbo.Notifications;
DELETE FROM dbo.PasswordResetTokens;
DELETE FROM dbo.SavedReports;
DELETE FROM dbo.UserAssignmentScopes;
DELETE FROM dbo.UserAssignments;
DELETE FROM dbo.UserMenuPreferences;
DELETE FROM dbo.UserNotificationPreferences;
DELETE FROM dbo.UserPermissionOverrides;
DELETE FROM dbo.UserRegistrationTokens;
DELETE FROM dbo.UserSessions;
DELETE FROM dbo.UserSubjects;
DELETE FROM dbo.StaffProfiles;
DELETE FROM dbo.Tasks;
DELETE FROM dbo.TaskChecklistItems;
DELETE FROM dbo.TaskAssignments;
DELETE FROM dbo.StudentIdCards;
DELETE FROM dbo.StudentIdBatches;
DELETE FROM dbo.LibraryMembers;
DELETE FROM dbo.LibraryReservations;
DELETE FROM dbo.LibraryLoans;
DELETE FROM dbo.LibraryInventoryTransactions;
DELETE FROM dbo.PaperPurchases;
DELETE FROM dbo.PaperDistributions;
DELETE FROM dbo.PrintingLogs;
DELETE FROM dbo.RequestApprovals;
DELETE FROM dbo.RequestAttachments;
DELETE FROM dbo.PhotocopyRequests;

PRINT N'Clearing asset-related data...';

DELETE FROM dbo.ITAssetTransferRequests;
DELETE FROM dbo.ITAssetDisposals;
DELETE FROM dbo.ITAssetIssueLogs;
DELETE FROM dbo.ITAssetMaintenanceLogs;
DELETE FROM dbo.ITAssetNotes;
DELETE FROM dbo.ITAssetStatusHistory;
DELETE FROM dbo.ITAssetAssignments;
DELETE FROM dbo.ITAssetBorrows;
DELETE FROM dbo.ITAssetGroupItems;
DELETE FROM dbo.ITAssetLaptopDetails;
DELETE FROM dbo.ITAssetPhoneDetails;
DELETE FROM dbo.ITAssetPrinterCopierDetails;
DELETE FROM dbo.ITAssetProjectorDetails;
DELETE FROM dbo.ITAssetNetworkDetails;
DELETE FROM dbo.ITAssetNeededLaptops;
DELETE FROM dbo.ITAssets;

DELETE FROM dbo.ITAssetImportStaging;
DELETE FROM dbo.ITAssetImportBatches;

DELETE FROM dbo.ITTickets;
DELETE FROM dbo.PrinterMeterReadings;

DELETE FROM dbo.StaffImportStaging;
DELETE FROM dbo.StaffImportBatches;

PRINT N'Clearing users...';
DELETE FROM dbo.Users WHERE UserId <> 1;

COMMIT TRANSACTION;

PRINT N'Data cleanup completed successfully.';
