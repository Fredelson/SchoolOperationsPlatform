SET NOCOUNT ON;
SET XACT_ABORT ON;

IF COL_LENGTH('dbo.ITAssetBorrows', 'ReturnConditionId') IS NULL
  ALTER TABLE dbo.ITAssetBorrows ADD ReturnConditionId INT NULL;

IF COL_LENGTH('dbo.ITAssetBorrows', 'ReturnIssueTypeIdsJson') IS NULL
  ALTER TABLE dbo.ITAssetBorrows ADD ReturnIssueTypeIdsJson NVARCHAR(MAX) NULL;

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_ITAssetBorrows_ReturnCondition')
  ALTER TABLE dbo.ITAssetBorrows ADD CONSTRAINT FK_ITAssetBorrows_ReturnCondition
    FOREIGN KEY (ReturnConditionId) REFERENCES dbo.ITAssetConditions(ITAssetConditionId);
