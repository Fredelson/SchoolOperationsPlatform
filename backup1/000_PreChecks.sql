/* ============================================================
   OPERATIONS PLATFORM
   000_PreChecks.sql

   Run this before creating the new database.
   It checks whether old and new databases exist.
   ============================================================ */

USE [master];
GO

SELECT
    DB_NAME(database_id) AS DatabaseName,
    create_date,
    state_desc
FROM sys.databases
WHERE name IN (N'PhotocopyManagementDB', N'OperationsPlatformDB')
ORDER BY name;
GO

IF DB_ID(N'PhotocopyManagementDB') IS NOT NULL
    PRINT 'PhotocopyManagementDB exists and will NOT be modified by this package.';

IF DB_ID(N'OperationsPlatformDB') IS NOT NULL
    PRINT 'OperationsPlatformDB already exists. If tables already exist, CreateTables may fail unless this is a fresh database.';
ELSE
    PRINT 'OperationsPlatformDB does not exist yet. 001_CreateDatabase.sql will create it.';
GO
