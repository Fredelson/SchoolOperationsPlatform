IF COL_LENGTH('dbo.ITAssetAssignments', 'ReturnNotes') IS NULL
BEGIN
    ALTER TABLE dbo.ITAssetAssignments
    ADD ReturnNotes NVARCHAR(MAX) NULL;
END;

IF COL_LENGTH('dbo.ITAssetAssignments', 'ReturnConditionId') IS NULL
BEGIN
    ALTER TABLE dbo.ITAssetAssignments
    ADD ReturnConditionId INT NULL;
END;

IF COL_LENGTH('dbo.ITAssetAssignments', 'ReturnIssueTypeIdsJson') IS NULL
BEGIN
    ALTER TABLE dbo.ITAssetAssignments
    ADD ReturnIssueTypeIdsJson NVARCHAR(MAX) NULL;
END;