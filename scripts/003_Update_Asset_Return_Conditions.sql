SET XACT_ABORT ON;

BEGIN TRANSACTION;

UPDATE dbo.ITAssetConditions
SET
  ConditionName = N'Need Parts',
  Description = N'Requires replacement parts or repair'
WHERE ConditionKey = N'Damaged';

COMMIT TRANSACTION;
