/* ============================================================
   OPERATIONS PLATFORM
   999_PostRunValidation.sql

   Run this after all create/seed scripts.
   ============================================================ */

USE [OperationsPlatformDB];
GO

SELECT COUNT(*) AS TableCount
FROM sys.tables
WHERE is_ms_shipped = 0;
GO

SELECT
    r.RoleKey,
    COUNT(u.UserId) AS UserCount
FROM dbo.Roles r
LEFT JOIN dbo.Users u ON u.RoleId = r.RoleId
GROUP BY r.RoleKey
ORDER BY r.RoleKey;
GO

SELECT EmployeeId, FullName, SchoolEmail, LegacyRole, IsActive
FROM dbo.Users
WHERE EmployeeId = N'A0297';
GO

SELECT SchoolCode, SchoolName
FROM dbo.Schools;
GO

SELECT 'Post-run validation completed.' AS Result;
GO
