SET XACT_ABORT ON;

BEGIN TRANSACTION;

IF COL_LENGTH('dbo.StaffImportStaging', 'AssignmentKey') IS NULL
BEGIN
  ALTER TABLE dbo.StaffImportStaging
  ADD AssignmentKey nvarchar(100) NULL;
END;

IF COL_LENGTH('dbo.StaffImportStaging', 'ScopeType') IS NULL
BEGIN
  ALTER TABLE dbo.StaffImportStaging
  ADD ScopeType nvarchar(50) NULL;
END;

IF COL_LENGTH('dbo.StaffImportStaging', 'ScopeName') IS NULL
BEGIN
  ALTER TABLE dbo.StaffImportStaging
  ADD ScopeName nvarchar(255) NULL;
END;

COMMIT TRANSACTION;
