SET XACT_ABORT ON;

BEGIN TRANSACTION;

ALTER TABLE dbo.StaffImportStaging
ADD DepartmentName nvarchar(255) NULL;

ALTER TABLE dbo.StaffImportStaging
ADD SubjectName nvarchar(255) NULL;

COMMIT TRANSACTION;
