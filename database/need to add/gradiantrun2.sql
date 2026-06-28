USE OperationsPlatformDB;
GO

/* ============================================================
   Branding Background Engine Upgrade
   Supports:
   - Solid
   - Linear Gradient
   - Radial Gradient
   - Conic Gradient
   ============================================================ */

IF COL_LENGTH('dbo.Branding', 'SidebarBackgroundType') IS NULL
BEGIN
    ALTER TABLE dbo.Branding
    ADD SidebarBackgroundType NVARCHAR(30) NULL;
END
GO

IF COL_LENGTH('dbo.Branding', 'TopbarBackgroundType') IS NULL
BEGIN
    ALTER TABLE dbo.Branding
    ADD TopbarBackgroundType NVARCHAR(30) NULL;
END
GO

IF COL_LENGTH('dbo.Branding', 'SidebarGradientMiddle') IS NULL
BEGIN
    ALTER TABLE dbo.Branding
    ADD SidebarGradientMiddle NVARCHAR(20) NULL;
END
GO

IF COL_LENGTH('dbo.Branding', 'TopbarGradientMiddle') IS NULL
BEGIN
    ALTER TABLE dbo.Branding
    ADD TopbarGradientMiddle NVARCHAR(20) NULL;
END
GO

IF COL_LENGTH('dbo.Branding', 'SidebarGradientPosition') IS NULL
BEGIN
    ALTER TABLE dbo.Branding
    ADD SidebarGradientPosition NVARCHAR(50) NULL;
END
GO

IF COL_LENGTH('dbo.Branding', 'TopbarGradientPosition') IS NULL
BEGIN
    ALTER TABLE dbo.Branding
    ADD TopbarGradientPosition NVARCHAR(50) NULL;
END
GO

/* ============================================================
   Safe Defaults
   ============================================================ */

UPDATE dbo.Branding
SET
    SidebarBackgroundType = ISNULL(SidebarBackgroundType, 'linear'),
    TopbarBackgroundType = ISNULL(TopbarBackgroundType, 'linear'),

    SidebarGradientMiddle = ISNULL(SidebarGradientMiddle, NULL),
    TopbarGradientMiddle = ISNULL(TopbarGradientMiddle, NULL),

    SidebarGradientPosition = ISNULL(SidebarGradientPosition, 'center'),
    TopbarGradientPosition = ISNULL(TopbarGradientPosition, 'center')
WHERE IsActive = 1;
GO

SELECT
    BrandingId,
    SidebarBackgroundType,
    SidebarGradientStart,
    SidebarGradientMiddle,
    SidebarGradientEnd,
    SidebarGradientDirection,
    SidebarGradientPosition,
    TopbarBackgroundType,
    TopbarGradientStart,
    TopbarGradientMiddle,
    TopbarGradientEnd,
    TopbarGradientDirection,
    TopbarGradientPosition
FROM dbo.Branding;
GO