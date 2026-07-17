SET XACT_ABORT ON;

BEGIN TRANSACTION;

IF COL_LENGTH('dbo.ITAssetBorrows', 'ReturnConditionId') IS NULL
BEGIN
  ALTER TABLE dbo.ITAssetBorrows
  ADD ReturnConditionId int NULL;
END;

IF COL_LENGTH('dbo.ITAssetBorrows', 'ReturnIssueTypeIdsJson') IS NULL
BEGIN
  ALTER TABLE dbo.ITAssetBorrows
  ADD ReturnIssueTypeIdsJson nvarchar(max) NULL;
END;

IF NOT EXISTS (
  SELECT 1
  FROM sys.foreign_keys fk
  INNER JOIN sys.foreign_key_columns fkc
    ON fk.object_id = fkc.constraint_object_id
  WHERE fk.parent_object_id = OBJECT_ID(N'dbo.ITAssetBorrows')
    AND fk.referenced_object_id = OBJECT_ID(N'dbo.ITAssetConditions')
    AND COL_NAME(fkc.parent_object_id, fkc.parent_column_id) = N'ReturnConditionId'
)
BEGIN
  ALTER TABLE dbo.ITAssetBorrows WITH CHECK
  ADD CONSTRAINT FK_ITAssetBorrows_ReturnCondition
    FOREIGN KEY (ReturnConditionId)
    REFERENCES dbo.ITAssetConditions (ITAssetConditionId);
END;

IF OBJECT_ID(N'dbo.ITAssetPartRequirements', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.ITAssetPartRequirements
  (
    AssetPartRequirementId int IDENTITY(1,1) NOT NULL,
    AssetId int NOT NULL,
    AssetAssignmentId int NULL,
    AssetBorrowId int NULL,
    PartKey nvarchar(50) NOT NULL,
    PartName nvarchar(100) NOT NULL,
    Quantity int NOT NULL
      CONSTRAINT DF_ITAssetPartRequirements_Quantity DEFAULT (1),
    RequirementStatus nvarchar(30) NOT NULL
      CONSTRAINT DF_ITAssetPartRequirements_Status DEFAULT (N'REQUIRED'),
    RequestedByUserId int NULL,
    RequestedAt datetime2(0) NOT NULL
      CONSTRAINT DF_ITAssetPartRequirements_RequestedAt DEFAULT (SYSDATETIME()),
    OrderedAt datetime2(0) NULL,
    ReceivedAt datetime2(0) NULL,
    Notes nvarchar(max) NULL,
    IsActive bit NOT NULL
      CONSTRAINT DF_ITAssetPartRequirements_IsActive DEFAULT (1),
    CreatedAt datetime2(0) NOT NULL
      CONSTRAINT DF_ITAssetPartRequirements_CreatedAt DEFAULT (SYSDATETIME()),
    UpdatedAt datetime2(0) NULL,
    CONSTRAINT PK_ITAssetPartRequirements
      PRIMARY KEY CLUSTERED (AssetPartRequirementId),
    CONSTRAINT CK_ITAssetPartRequirements_OneSource
      CHECK (
        (CASE WHEN AssetAssignmentId IS NULL THEN 0 ELSE 1 END) +
        (CASE WHEN AssetBorrowId IS NULL THEN 0 ELSE 1 END) = 1
      ),
    CONSTRAINT CK_ITAssetPartRequirements_PartKey
      CHECK (
        PartKey IN (
          N'MONITOR',
          N'LCD',
          N'RAM',
          N'SSD',
          N'BATTERY',
          N'KEYBOARD',
          N'NETWORK_CARD'
        )
      ),
    CONSTRAINT CK_ITAssetPartRequirements_Quantity
      CHECK (Quantity > 0),
    CONSTRAINT CK_ITAssetPartRequirements_Status
      CHECK (
        RequirementStatus IN (
          N'REQUIRED',
          N'ORDERED',
          N'RECEIVED',
          N'CANCELLED'
        )
      ),
    CONSTRAINT FK_ITAssetPartRequirements_Asset
      FOREIGN KEY (AssetId)
      REFERENCES dbo.ITAssets (AssetId),
    CONSTRAINT FK_ITAssetPartRequirements_Assignment
      FOREIGN KEY (AssetAssignmentId)
      REFERENCES dbo.ITAssetAssignments (AssetAssignmentId),
    CONSTRAINT FK_ITAssetPartRequirements_Borrow
      FOREIGN KEY (AssetBorrowId)
      REFERENCES dbo.ITAssetBorrows (AssetBorrowId),
    CONSTRAINT FK_ITAssetPartRequirements_RequestedBy
      FOREIGN KEY (RequestedByUserId)
      REFERENCES dbo.Users (UserId)
  );
END;

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE object_id = OBJECT_ID(N'dbo.ITAssetPartRequirements')
    AND name = N'UX_ITAssetPartRequirements_AssignmentPart'
)
BEGIN
  CREATE UNIQUE INDEX UX_ITAssetPartRequirements_AssignmentPart
    ON dbo.ITAssetPartRequirements (AssetAssignmentId, PartKey)
    WHERE AssetAssignmentId IS NOT NULL;
END;

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE object_id = OBJECT_ID(N'dbo.ITAssetPartRequirements')
    AND name = N'UX_ITAssetPartRequirements_BorrowPart'
)
BEGIN
  CREATE UNIQUE INDEX UX_ITAssetPartRequirements_BorrowPart
    ON dbo.ITAssetPartRequirements (AssetBorrowId, PartKey)
    WHERE AssetBorrowId IS NOT NULL;
END;

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE object_id = OBJECT_ID(N'dbo.ITAssetPartRequirements')
    AND name = N'IX_ITAssetPartRequirements_OrderQueue'
)
BEGIN
  CREATE INDEX IX_ITAssetPartRequirements_OrderQueue
    ON dbo.ITAssetPartRequirements
      (RequirementStatus, IsActive, PartKey)
    INCLUDE (AssetId, PartName, Quantity);
END;

COMMIT TRANSACTION;
