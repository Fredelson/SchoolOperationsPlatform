USE OperationsPlatformDB;
GO

ALTER TABLE dbo.ITAssetImportStaging ADD
    ResolvedCategoryId INT NULL,
    ResolvedBrandId INT NULL,
    ResolvedModelId INT NULL,
    ResolvedStatusId INT NULL,
    ResolvedConditionId INT NULL,
    ResolvedDepartmentId INT NULL,
    ResolvedLocationId INT NULL,
    ResolvedRoomId INT NULL;
GO

ALTER TABLE dbo.ITAssetImportStaging
ADD CONSTRAINT FK_ITAssetImportStaging_Category
FOREIGN KEY (ResolvedCategoryId)
REFERENCES dbo.ITAssetCategories(ITAssetCategoryId);
GO

ALTER TABLE dbo.ITAssetImportStaging
ADD CONSTRAINT FK_ITAssetImportStaging_Brand
FOREIGN KEY (ResolvedBrandId)
REFERENCES dbo.ITAssetBrands(ITAssetBrandId);
GO

ALTER TABLE dbo.ITAssetImportStaging
ADD CONSTRAINT FK_ITAssetImportStaging_Model
FOREIGN KEY (ResolvedModelId)
REFERENCES dbo.ITAssetModels(ITAssetModelId);
GO

ALTER TABLE dbo.ITAssetImportStaging
ADD CONSTRAINT FK_ITAssetImportStaging_Status
FOREIGN KEY (ResolvedStatusId)
REFERENCES dbo.ITAssetStatuses(ITAssetStatusId);
GO

ALTER TABLE dbo.ITAssetImportStaging
ADD CONSTRAINT FK_ITAssetImportStaging_Condition
FOREIGN KEY (ResolvedConditionId)
REFERENCES dbo.ITAssetConditions(ITAssetConditionId);
GO

ALTER TABLE dbo.ITAssetImportStaging
ADD CONSTRAINT FK_ITAssetImportStaging_Department
FOREIGN KEY (ResolvedDepartmentId)
REFERENCES dbo.Departments(DepartmentId);
GO

ALTER TABLE dbo.ITAssetImportStaging
ADD CONSTRAINT FK_ITAssetImportStaging_Location
FOREIGN KEY (ResolvedLocationId)
REFERENCES dbo.Locations(LocationId);
GO

ALTER TABLE dbo.ITAssetImportStaging
ADD CONSTRAINT FK_ITAssetImportStaging_Room
FOREIGN KEY (ResolvedRoomId)
REFERENCES dbo.Rooms(RoomId);
GO