$inputFile = "C:\Users\NAIS\Desktop\OperationsPlatform\backend\OperationsPlatformDB_Fresh_Install.sql"
$outputFile = "C:\Users\NAIS\Desktop\OperationsPlatform\backend\OperationsPlatformDB_Fresh_Schema_No_Users_Assets.sql"

$content = Get-Content $inputFile -Raw -Encoding UTF8
$lines = $content -split "`n"

$skipTables = @(
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
)

$outputLines = @()
$skipMode = $false
$currentTable = $null

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    
    $identityMatch = [regex]::Match($line, "SET IDENTITY_INSERT \[dbo\]\.\[(\w+)\] (ON|OFF)", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if ($identityMatch.Success) {
        $tableName = $identityMatch.Groups[1].Value
        $action = $identityMatch.Groups[2].Value
        if ($action -eq 'ON') {
            $currentTable = $tableName
        } else {
            $currentTable = $null
        }
        continue
    }
    
    $insertMatch = [regex]::Match($line, "INSERT \[dbo\]\.\[(\w+)\]", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if ($insertMatch.Success) {
        $tableName = $insertMatch.Groups[1].Value
        if ($skipTables -contains $tableName) {
            $skipMode = $true
            $i++
            while ($i -lt $lines.Count) {
                $trimmed = $lines[$i].Trim()
                if ($trimmed -eq 'GO') {
                    $i++
                    break
                }
                if ($lines[$i] -match '^(INSERT |SET |CREATE |ALTER |DROP |GO)' -and $trimmed -ne 'GO') {
                    break
                }
                $i++
            }
            continue
        } else {
            $outputLines += $line
            continue
        }
    }
    
    $outputLines += $line
}

$header = @(
    "USE [master];",
    "GO",
    "",
    "IF DB_ID(N'OperationsPlatformDB') IS NOT NULL",
    "BEGIN",
    "    ALTER DATABASE [OperationsPlatformDB] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;",
    "    DROP DATABASE [OperationsPlatformDB];",
    "END",
    "GO",
    "",
    "CREATE DATABASE [OperationsPlatformDB];",
    "GO",
    "",
    "ALTER DATABASE [OperationsPlatformDB] SET RECOVERY SIMPLE;",
    "GO",
    "",
    "USE [OperationsPlatformDB];",
    "GO",
    "",
    "SET NOCOUNT ON;",
    "SET XACT_ABORT ON;",
    "GO",
    "",
    "PRINT N'Beginning OperationsPlatformDB fresh schema installation (no users/assets)...';",
    "GO",
    ""
)

$finalContent = $header + $outputLines

# Remove original header from the content
$finalString = $finalContent -join "`n"
$finalString = [regex]::Replace($finalString, "USE \[master\];\s*GO\s*IF DB_ID.*?GO\s*ALTER DATABASE.*?GO\s*USE \[OperationsPlatformDB\];\s*GO\s*SET NOCOUNT ON;\s*SET XACT_ABORT ON;\s*GO\s*PRINT N'Beginning.*?GO;\s*", '', [System.Text.RegularExpressions.RegexOptions]::Singleline)

# Remove specific lines: super admin user, UAT test assets, Fred's test data
$finalLines = $finalString -split "`n"
$filteredLines = @()
foreach ($l in $finalLines) {
    if ($l -match "VALUES \(1, N'A0297'" -and $l -match 'INSERT \[dbo\]\.\[Users\]') { continue }
    if ($l -match "VALUES \(2, N'AUS-LAP-0002'" -and $l -match 'INSERT \[dbo\]\.\[ITAssets\]') { continue }
    if ($l -match "VALUES \(3, N'UAT-LAP-001'" -and $l -match 'INSERT \[dbo\]\.\[ITAssets\]') { continue }
    if ($l -match "INSERT \[dbo\]\.\[ITAssetAssignments\].*VALUES \(\d+, \d+, N'USER', 1,") { continue }
    if ($l -match "INSERT \[dbo\]\.\[ITAssetBorrows\].*VALUES \(\d+, \d+, 1, N'Fred'") { continue }
    if ($l -match "INSERT \[dbo\]\.\[AuditLogs\].*`"AssignedToUserId`":1" -and $l -match 'A0297') { continue }
    $filteredLines += $l
}

$filteredLines | Out-File -FilePath $outputFile -Encoding UTF8
Write-Host "Generated fresh schema at: $outputFile"
Write-Host "Excluded: Users, StaffProfiles, Students, ITAssets, and all transactional/activity tables."
Write-Host "Excluded: Super admin user (A0297) and UAT/test assets tied to user 1."
