ALTER TABLE dbo.ITAssetAssignments
ADD ReturnNotes NVARCHAR(MAX) NULL,
    ReturnConditionId INT NULL,
    ReturnIssueTypeId INT NULL,
    ReturnIssuePriority NVARCHAR(50) NULL;