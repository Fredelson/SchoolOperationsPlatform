IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ITAssetImportBatches]') AND name = N'UpdateRows')
BEGIN
  ALTER TABLE [dbo].[ITAssetImportBatches] ADD [UpdateRows] [int] NOT NULL DEFAULT 0;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ITAssetImportBatches]') AND name = N'IgnoredRows')
BEGIN
  ALTER TABLE [dbo].[ITAssetImportBatches] ADD [IgnoredRows] [int] NOT NULL DEFAULT 0;
END
GO
