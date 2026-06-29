USE OperationsPlatformDB;
GO

IF COL_LENGTH('dbo.Modules', 'WorkspaceId') IS NULL
BEGIN
    ALTER TABLE dbo.Modules ADD WorkspaceId INT NULL;
    ALTER TABLE dbo.Modules
    ADD CONSTRAINT FK_Modules_Workspaces
    FOREIGN KEY (WorkspaceId) REFERENCES dbo.Workspaces(WorkspaceId);
END
GO

IF COL_LENGTH('dbo.Modules', 'ParentModuleId') IS NULL
BEGIN
    ALTER TABLE dbo.Modules ADD ParentModuleId INT NULL;
    ALTER TABLE dbo.Modules
    ADD CONSTRAINT FK_Modules_ParentModule
    FOREIGN KEY (ParentModuleId) REFERENCES dbo.Modules(ModuleId);
END
GO

IF COL_LENGTH('dbo.Modules', 'FeatureFlagId') IS NULL
BEGIN
    ALTER TABLE dbo.Modules ADD FeatureFlagId INT NULL;
    ALTER TABLE dbo.Modules
    ADD CONSTRAINT FK_Modules_FeatureFlags
    FOREIGN KEY (FeatureFlagId) REFERENCES dbo.FeatureFlags(FeatureFlagId);
END
GO