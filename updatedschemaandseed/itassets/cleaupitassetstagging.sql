USE OperationsPlatformDB;
GO

/* ============================================================
   IT Asset Import Staging Cleanup
   Purpose:
   Align staging table with final Excel import template.
   ============================================================ */

IF OBJECT_ID('dbo.ITAssetImportStaging', 'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.ITAssetImportStaging;
END
GO

CREATE TABLE dbo.ITAssetImportStaging
(
    ImportStagingId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,

    ImportBatchId INT NOT NULL,

    AssetTag NVARCHAR(200) NOT NULL,

    CategoryName NVARCHAR(300) NULL,
    BrandName NVARCHAR(300) NULL,
    ModelName NVARCHAR(300) NULL,

    DepartmentName NVARCHAR(300) NULL,
    LocationName NVARCHAR(300) NULL,
    RoomName NVARCHAR(300) NULL,

    StatusName NVARCHAR(300) NULL,
    ConditionName NVARCHAR(300) NULL,

    PurchaseDate DATE NULL,
    EmployeeCode NVARCHAR(100) NULL,
    Remarks NVARCHAR(MAX) NULL,

    SourceSheet NVARCHAR(300) NULL,
    SourceRow INT NULL,

    MatchedUserId INT NULL,
    MatchStatus NVARCHAR(100) NULL,

    DuplicateTagStatus NVARCHAR(100) NULL,
    ImportStatus NVARCHAR(100) NOT NULL DEFAULT('Pending'),
    ImportMessage NVARCHAR(MAX) NULL,

    CreatedAt DATETIME NOT NULL DEFAULT(GETDATE()),
    ImportedAt DATETIME NULL,

    CONSTRAINT FK_ITAssetImportStaging_Batch
        FOREIGN KEY (ImportBatchId)
        REFERENCES dbo.ITAssetImportBatches(ITAssetImportBatchId),

    CONSTRAINT FK_ITAssetImportStaging_MatchedUser
        FOREIGN KEY (MatchedUserId)
        REFERENCES dbo.Users(UserId)
);
GO