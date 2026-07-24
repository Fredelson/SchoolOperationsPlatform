IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Notifications]') AND name = N'Link')
BEGIN
  ALTER TABLE [dbo].[Notifications] ADD [Link] [nvarchar](500) NULL;
END
GO
