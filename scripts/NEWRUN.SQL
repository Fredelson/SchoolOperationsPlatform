ALTER TABLE dbo.PermissionGroups
ADD IsActive BIT NOT NULL
CONSTRAINT DF_PermissionGroups_IsActive DEFAULT 1;

ALTER TABLE dbo.RolePermissions
ADD UpdatedAt DATETIME NULL;