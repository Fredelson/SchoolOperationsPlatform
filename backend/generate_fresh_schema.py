import re

input_file = r"C:\Users\NAIS\Desktop\OperationsPlatform\backend\OperationsPlatformDB_Fresh_Install.sql"
output_file = r"C:\Users\NAIS\Desktop\OperationsPlatform\backend\OperationsPlatformDB_Fresh_Schema_No_Users_Assets.sql"

with open(input_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Split into lines for easier processing
lines = content.split('\n')

# Find the line where seed data starts (after table definitions)
# We want to keep table creation, views, indexes, and constraints
# But filter out data inserts for users, assets, and transactional tables

# Tables we want to KEEP seed data for (reference/master data)
allowed_tables = {
    'AccessLevels', 'AcademicYears', 'AssignmentTypes', 'ArchivePolicies',
    'Branding', 'Buildings', 'Buttons', 'CalendarEventTypes',
    'Departments', 'DocumentBranding', 'DocumentSequences',
    'EmailTemplates', 'FeatureFlags', 'FeatureVisibilityStatuses',
    'FileStorage', 'GlobalSearchEntities', 'Integrations', 'IntegrationSettings',
    'InventoryItemTypes', 'ITAssetBrands', 'ITAssetCategories', 'ITAssetConditions',
    'ITAssetIssueCategories', 'ITAssetIssueTypes', 'ITAssetModels',
    'ITAssetNoteTypes', 'ITAssetStatuses',
    'Languages', 'Locations', 'LookupCategories', 'LookupValues',
    'MenuGroups', 'Menus', 'Modules',
    'NotificationChannels', 'NotificationPreferenceTypes',
    'Permissions', 'PrintLimits', 'PaperInventory',
    'Purposes', 'QuickActions', 'KPIDefinitions', 'ReportDefinitions',
    'RolePermissions', 'Roles', 'Rooms',
    'SavedReports', 'ScheduledJobs', 'Schools', 'SchoolSettings',
    'Sections', 'StaffImportBatches', 'StaffImportStaging',
    'StatusGroups', 'StatusValues', 'Students',
    'SubjectPrintLimits', 'Subjects', 'SystemSettings', 'Tags',
    'TaskAssignments', 'TaskChecklistItems', 'Tasks', 'Terms', 'Themes',
    'TopbarSettings', 'Translations', 'UserAssignments', 'UserAssignmentScopes',
    'UserMenuPreferences', 'UserNotificationPreferences', 'UserPermissionOverrides',
    'UserRegistrationTokens', 'UserSessions', 'UserSubjects',
    'Widgets', 'WorkflowActions', 'WorkflowInstances', 'WorkflowSteps',
    'WorkflowTemplates', 'WorkspaceRoles', 'Workspaces', 'YearLevels',
    'ArchiveRecords', 'ArchiveRuns', 'AIPrompts', 'AnnouncementBanners',
    'ApiKeys', 'BackgroundJobLogs', 'BackupJobs', 'BrandingSlides',
    'Classes', 'ConfigurationSnapshots', 'DashboardKPIs', 'Dashboards', 'DashboardWidgets',
    'EmailQueue', 'EntityComments', 'EntityFiles', 'EntityTags',
    'ImportErrorLogs', 'InventoryTransactions', 'PaperDistributions', 'PaperPurchases',
    'PrinterMeterReadings', 'PrintingLogs', 'PrintingWorkflowEvents', 'PrintingJobConsumptions',
    'RequestApprovals', 'RequestAttachments', 'RestoreLogs',
    'StudentClassEnrollments', 'StudentIdBatches', 'StudentIdCards', 'StudentIdTemplates',
    'SystemHealthLogs', 'CalendarEvents', 'CalendarEventAttendees'
}

# Tables we want to completely SKIP (users, assets, and all transactional/activity data)
skip_tables = {
    'Users', 'StaffProfiles', 'StaffImportBatches', 'StaffImportStaging',
    'Students', 'ITAssets', 'ITAssetAssignments', 'ITAssetBorrows', 'ITAssetDisposals',
    'ITAssetGroupItems', 'ITAssetGroups', 'ITAssetImportBatches', 'ITAssetImportStaging',
    'ITAssetIssueLogs', 'ITAssetLaptopDetails', 'ITAssetMaintenanceLogs',
    'ITAssetNeededLaptops', 'ITAssetNetworkDetails', 'ITAssetNotes',
    'ITAssetPartRequirements', 'ITAssetPhoneDetails', 'ITAssetPrinterCopierDetails',
    'ITAssetProjectorDetails', 'ITAssetStatusHistory', 'ITAssetTransferRequests',
    'AuditLogs', 'ActivityTimeline', 'LoginHistory', 'Notifications',
    'PasswordResetTokens', 'EmailVerificationTokens', 'AIUsageLogs',
    'CalendarEventAttendees', 'CalendarEvents',
    'PaperDistributions', 'SubjectPrintLimits', 'TaskAssignments',
    'ITTickets', 'PrinterMeterReadings', 'PrintingWorkflowEvents',
    'PrintingLogs', 'PhotocopyRequests', 'PrintingRequests', 'PrintingJobConsumptions',
    'SavedReports', 'UserSessions', 'UserSubjects',
    'ArchiveRecords', 'ArchiveRuns', 'ArchivePolicies',
    'AIPrompts', 'AnnouncementBanners', 'ApiKeys', 'BackgroundJobLogs',
    'BackupJobs', 'BrandingSlides', 'Classes', 'ConfigurationSnapshots',
    'DashboardKPIs', 'Dashboards', 'DashboardWidgets', 'EmailQueue',
    'EntityComments', 'EntityFiles', 'EntityTags', 'ImportErrorLogs',
    'InventoryTransactions', 'PaperPurchases', 'RequestApprovals',
    'RequestAttachments', 'RestoreLogs', 'StudentClassEnrollments',
    'StudentIdBatches', 'StudentIdCards', 'StudentIdTemplates',
    'SystemHealthLogs', 'TaskChecklistItems', 'Tasks',
    'WorkflowActions', 'WorkflowInstances', 'WorkflowSteps', 'WorkflowTemplates'
}

# State tracking
in_seed_data = False
output_lines = []
current_table = None

i = 0
while i < len(lines):
    line = lines[i]
    
    # Detect SET IDENTITY_INSERT blocks
    identity_match = re.match(r"SET IDENTITY_INSERT \[dbo\]\.\[(\w+)\] (ON|OFF)", line, re.IGNORECASE)
    if identity_match:
        table_name = identity_match.group(1)
        action = identity_match.group(2)
        if action == 'ON':
            current_table = table_name
        else:
            current_table = None
        i += 1
        continue
    
    # Detect INSERT INTO lines
    insert_match = re.match(r"INSERT \[dbo\]\.\[(\w+)\]", line)
    if insert_match:
        table_name = insert_match.group(1)
        if table_name in skip_tables:
            # Skip this INSERT block
            # We need to skip until we hit GO or the next INSERT/SET/END
            i += 1
            while i < len(lines):
                if lines[i].strip().upper() == 'GO':
                    i += 1
                    break
                if re.match(r"(INSERT |SET |CREATE |ALTER |DROP |GO)", lines[i], re.IGNORECASE):
                    break
                i += 1
            continue
        else:
            # Keep this line
            output_lines.append(line)
            i += 1
            continue
    
    output_lines.append(line)
    i += 1

# Now also remove the super admin user line specifically if it exists
# and remove A0297 references from ITAssetAssignments and ITAssetBorrows
final_lines = []
for line in output_lines:
    # Skip super admin user insert
    if "VALUES (1, N'A0297'" in line and 'INSERT [dbo].[Users]' in line:
        continue
    # Skip UAT test assets and Fred's test data
    if "VALUES (2, N'AUS-LAP-0002'" in line and 'INSERT [dbo].[ITAssets]' in line:
        continue
    if "VALUES (3, N'UAT-LAP-001'" in line and 'INSERT [dbo].[ITAssets]' in line:
        continue
    # Skip asset assignments tied to user 1 / A0297
    if re.search(r"INSERT \[dbo\]\.\[ITAssetAssignments\].*VALUES \(\d+, \d+, N'USER', 1,", line):
        continue
    if re.search(r"INSERT \[dbo\]\.\[ITAssetBorrows\].*VALUES \(\d+, \d+, 1, N'Fred'", line):
        continue
    # Skip audit logs tied to test assets/user 1
    if re.search(r"INSERT \[dbo\]\.\[AuditLogs\].*\"AssignedToUserId\":1", line) and 'A0297' in line:
        continue
    final_lines.append(line)

# Prepend proper drop/create database
header = """USE [master];
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

"""

# Remove the old database creation block from the original content
# Find the first GO after ALTER DATABASE SET RECOVERY SIMPLE
content_final = header + '\n'.join(final_lines)

# Remove the original USE [master]; ... CREATE DATABASE block
# Find and remove the original header
original_header_pattern = r"USE \[master\];\s*GO\s*IF DB_ID.*?GO\s*ALTER DATABASE.*?GO\s*USE \[OperationsPlatformDB\];\s*GO\s*SET NOCOUNT ON;\s*SET XACT_ABORT ON;\s*GO\s*PRINT N'Beginning.*?GO;\s*"
content_final = re.sub(original_header_pattern, '', content_final, flags=re.DOTALL)

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(content_final)

print(f"Generated fresh schema at: {output_file}")
print("Excluded: Users, StaffProfiles, Students, ITAssets, and all transactional/activity tables.")
print("Excluded: Super admin user (A0297) and UAT/test assets tied to user 1.")
