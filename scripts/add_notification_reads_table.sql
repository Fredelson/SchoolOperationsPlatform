IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = N'UserNotificationReads')
BEGIN
  CREATE TABLE [dbo].[UserNotificationReads](
    [UserId] [int] NOT NULL,
    [ReadAt] [datetime] NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_UserNotificationReads] PRIMARY KEY CLUSTERED ([UserId] ASC)
  );
END
GO
