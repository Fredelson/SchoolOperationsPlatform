# Operations Platform Database Package

Run in this exact order in SSMS:

1. 000_PreChecks.sql
2. 001_CreateDatabase.sql
3. 002_CreateTables.sql
4. 003_SeedSystem.sql
5. 004_SeedPermissions.sql
6. 005_SeedStaff.sql
7. 006_SeedStudents.sql
8. 007_SeedAssets.sql
9. 999_PostRunValidation.sql

Database:
- OperationsPlatformDB

Safety:
- Creates/uses OperationsPlatformDB.
- Does not remove or modify PhotocopyManagementDB.
- Does not contain database removal, table removal, or single-user mode commands.

Tenant seed:
- First school/tenant: Arab Unity School
- School code remains AUS_DUBAI
- Branding seed is for Arab Unity School

Required SuperAdmin seed:
- A0297
- Fred
- fredelson@arabunityschool.ae
- SuperAdmin

Important:
- Replace the placeholder bcrypt hash in 003_SeedSystem.sql before testing real login.
- Staff, students, and assets are intentionally separate import/seed steps.
