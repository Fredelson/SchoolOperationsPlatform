USE OperationsPlatformDB;
GO

/* ============================================================
   Arab Unity School Operations Platform
   Branding Gradient Upgrade
   ============================================================ */

IF COL_LENGTH('dbo.Branding', 'UseSidebarGradient') IS NULL
BEGIN
    ALTER TABLE dbo.Branding
    ADD UseSidebarGradient BIT NOT NULL
        CONSTRAINT DF_Branding_UseSidebarGradient DEFAULT 0;
END
GO

IF COL_LENGTH('dbo.Branding', 'SidebarGradientStart') IS NULL
BEGIN
    ALTER TABLE dbo.Branding
    ADD SidebarGradientStart NVARCHAR(20) NULL;
END
GO

IF COL_LENGTH('dbo.Branding', 'SidebarGradientEnd') IS NULL
BEGIN
    ALTER TABLE dbo.Branding
    ADD SidebarGradientEnd NVARCHAR(20) NULL;
END
GO

IF COL_LENGTH('dbo.Branding', 'SidebarGradientDirection') IS NULL
BEGIN
    ALTER TABLE dbo.Branding
    ADD SidebarGradientDirection NVARCHAR(30) NULL;
END
GO

IF COL_LENGTH('dbo.Branding', 'UseTopbarGradient') IS NULL
BEGIN
    ALTER TABLE dbo.Branding
    ADD UseTopbarGradient BIT NOT NULL
        CONSTRAINT DF_Branding_UseTopbarGradient DEFAULT 0;
END
GO

IF COL_LENGTH('dbo.Branding', 'TopbarGradientStart') IS NULL
BEGIN
    ALTER TABLE dbo.Branding
    ADD TopbarGradientStart NVARCHAR(20) NULL;
END
GO

IF COL_LENGTH('dbo.Branding', 'TopbarGradientEnd') IS NULL
BEGIN
    ALTER TABLE dbo.Branding
    ADD TopbarGradientEnd NVARCHAR(20) NULL;
END
GO

IF COL_LENGTH('dbo.Branding', 'TopbarGradientDirection') IS NULL
BEGIN
    ALTER TABLE dbo.Branding
    ADD TopbarGradientDirection NVARCHAR(30) NULL;
END
GO

/* Optional default gradient values */
UPDATE dbo.Branding
SET
    UseTopbarGradient = 1,
    TopbarGradientStart = ISNULL(TopbarGradientStart, '#007A3D'),
    TopbarGradientEnd = ISNULL(TopbarGradientEnd, '#002B5B'),
    TopbarGradientDirection = ISNULL(TopbarGradientDirection, '90deg'),

    UseSidebarGradient = 1,
    SidebarGradientStart = ISNULL(SidebarGradientStart, '#002B5B'),
    SidebarGradientEnd = ISNULL(SidebarGradientEnd, '#061B52'),
    SidebarGradientDirection = ISNULL(SidebarGradientDirection, '180deg')
WHERE IsActive = 1;
GO

SELECT
    BrandingId,
    UseSidebarGradient,
    SidebarGradientStart,
    SidebarGradientEnd,
    SidebarGradientDirection,
    UseTopbarGradient,
    TopbarGradientStart,
    TopbarGradientEnd,
    TopbarGradientDirection
FROM dbo.Branding;
GO