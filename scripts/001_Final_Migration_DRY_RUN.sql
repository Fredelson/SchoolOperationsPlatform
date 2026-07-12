-- Run in SQLCMD mode from this directory.
-- It executes the exact production migration with dry-run context enabled.
SET NOCOUNT ON;
SET XACT_ABORT ON;
EXEC sys.sp_set_session_context @key=N'OperationsPlatformDryRun',@value=1;
:r .\002_Final_Migration.sql
EXEC sys.sp_set_session_context @key=N'OperationsPlatformDryRun',@value=NULL;
