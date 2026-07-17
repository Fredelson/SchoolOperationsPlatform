SET XACT_ABORT ON;

BEGIN TRANSACTION;

UPDATE dbo.ITAssetConditions
SET
  ConditionKey = N'NeedMaintenance',
  ConditionName = N'Need Maintenance',
  Description = N'Requires maintenance or repair'
WHERE ConditionKey = N'Poor';

COMMIT TRANSACTION;
