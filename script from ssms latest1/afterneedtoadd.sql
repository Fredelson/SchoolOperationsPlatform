IF COL_LENGTH('dbo.Workspaces', 'IsActive') IS NULL
BEGIN
    ALTER TABLE dbo.Workspaces
    ADD IsActive BIT NOT NULL
        CONSTRAINT DF_Workspaces_IsActive DEFAULT (1);
END;