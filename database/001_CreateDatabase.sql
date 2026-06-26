/* ============================================================
   OPERATIONS PLATFORM
   001_CreateDatabase.sql

   SAFE:
   - Creates OperationsPlatformDB only if it does not exist.
   - Does NOT remove or modify PhotocopyManagementDB.
   ============================================================ */

USE [master];
GO

IF DB_ID(N'OperationsPlatformDB') IS NULL
BEGIN
    CREATE DATABASE [OperationsPlatformDB];
END
GO

USE [OperationsPlatformDB];
GO

SELECT 'OperationsPlatformDB is ready.' AS Result;
GO
