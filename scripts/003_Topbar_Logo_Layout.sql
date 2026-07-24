USE [OperationsPlatformDB];
GO

SET XACT_ABORT ON;
GO

IF OBJECT_ID(N'dbo.Branding', N'U') IS NULL
BEGIN
  THROW 50001, 'dbo.Branding was not found in OperationsPlatformDB. Verify the database name and deployment target.', 1;
END;
GO

IF HAS_PERMS_BY_NAME(N'dbo.Branding', N'OBJECT', N'ALTER') <> 1
BEGIN
  THROW 50002, 'The current SQL login does not have ALTER permission on dbo.Branding.', 1;
END;
GO

BEGIN TRANSACTION;

IF COL_LENGTH('dbo.Branding', 'TopbarLogoX') IS NULL
BEGIN
  ALTER TABLE dbo.Branding ADD TopbarLogoX int NULL;
END;

IF COL_LENGTH('dbo.Branding', 'TopbarLogoY') IS NULL
BEGIN
  ALTER TABLE dbo.Branding ADD TopbarLogoY int NULL;
END;

IF COL_LENGTH('dbo.Branding', 'TopbarLogoWidth') IS NULL
BEGIN
  ALTER TABLE dbo.Branding ADD TopbarLogoWidth int NULL;
END;

IF COL_LENGTH('dbo.Branding', 'TopbarLogoHeight') IS NULL
BEGIN
  ALTER TABLE dbo.Branding ADD TopbarLogoHeight int NULL;
END;

EXEC sys.sp_executesql N'
  UPDATE dbo.Branding
  SET
    TopbarLogoX =
      CASE
        WHEN (
          TopbarLogoX BETWEEN 0 AND 188
          AND TopbarLogoY BETWEEN 0 AND 54
          AND TopbarLogoWidth BETWEEN 32 AND 180
          AND TopbarLogoHeight BETWEEN 24 AND 68
          AND TopbarLogoX + TopbarLogoWidth <= 220
          AND TopbarLogoY + TopbarLogoHeight <= 78
        ) OR (
          TopbarLogoX = 16
          AND TopbarLogoY = 96
          AND TopbarLogoWidth = 72
          AND TopbarLogoHeight = 72
        )
        THEN 1200
        ELSE COALESCE(TopbarLogoX, 1200)
      END,
    TopbarLogoY =
      CASE
        WHEN (
          TopbarLogoX BETWEEN 0 AND 188
          AND TopbarLogoY BETWEEN 0 AND 54
          AND TopbarLogoWidth BETWEEN 32 AND 180
          AND TopbarLogoHeight BETWEEN 24 AND 68
          AND TopbarLogoX + TopbarLogoWidth <= 220
          AND TopbarLogoY + TopbarLogoHeight <= 78
        ) OR (
          TopbarLogoX = 16
          AND TopbarLogoY = 96
          AND TopbarLogoWidth = 72
          AND TopbarLogoHeight = 72
        )
        THEN 96
        ELSE COALESCE(TopbarLogoY, 96)
      END,
    TopbarLogoWidth =
      CASE
        WHEN (
          TopbarLogoX BETWEEN 0 AND 188
          AND TopbarLogoY BETWEEN 0 AND 54
          AND TopbarLogoWidth BETWEEN 32 AND 180
          AND TopbarLogoHeight BETWEEN 24 AND 68
          AND TopbarLogoX + TopbarLogoWidth <= 220
          AND TopbarLogoY + TopbarLogoHeight <= 78
        ) OR (
          TopbarLogoX = 16
          AND TopbarLogoY = 96
          AND TopbarLogoWidth = 72
          AND TopbarLogoHeight = 72
        )
        THEN 72
        ELSE COALESCE(TopbarLogoWidth, 72)
      END,
    TopbarLogoHeight =
      CASE
        WHEN (
          TopbarLogoX BETWEEN 0 AND 188
          AND TopbarLogoY BETWEEN 0 AND 54
          AND TopbarLogoWidth BETWEEN 32 AND 180
          AND TopbarLogoHeight BETWEEN 24 AND 68
          AND TopbarLogoX + TopbarLogoWidth <= 220
          AND TopbarLogoY + TopbarLogoHeight <= 78
        ) OR (
          TopbarLogoX = 16
          AND TopbarLogoY = 96
          AND TopbarLogoWidth = 72
          AND TopbarLogoHeight = 72
        )
        THEN 72
        ELSE COALESCE(TopbarLogoHeight, TopbarLogoWidth, 72)
      END;
';

COMMIT TRANSACTION;
GO
