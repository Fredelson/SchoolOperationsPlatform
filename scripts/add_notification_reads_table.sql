SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

IF OBJECT_ID(N'dbo.UserNotificationReads', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.UserNotificationReads(
    UserId int NOT NULL,
    ReadAt datetime NOT NULL
      CONSTRAINT DF_UserNotificationReads_ReadAt DEFAULT (GETDATE()),
    CONSTRAINT PK_UserNotificationReads PRIMARY KEY CLUSTERED (UserId ASC)
  );
END
GO

IF EXISTS (
  SELECT 1
  FROM sys.foreign_keys
  WHERE name = N'FK_UserNotificationReads_Users'
    AND parent_object_id = OBJECT_ID(N'dbo.UserNotificationReads')
    AND delete_referential_action <> 1
)
BEGIN
  ALTER TABLE dbo.UserNotificationReads
    DROP CONSTRAINT FK_UserNotificationReads_Users;
END
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.foreign_keys
  WHERE name = N'FK_UserNotificationReads_Users'
    AND parent_object_id = OBJECT_ID(N'dbo.UserNotificationReads')
)
BEGIN
  ALTER TABLE dbo.UserNotificationReads WITH CHECK
    ADD CONSTRAINT FK_UserNotificationReads_Users
      FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
      ON DELETE CASCADE;
END
GO
