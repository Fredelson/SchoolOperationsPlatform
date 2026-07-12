const {poolPromise}=require("../database/connection");
(async()=>{const p=await poolPromise;const r=await p.request().query(`
SELECT c.name ColumnName,t.name DataType,c.max_length MaxLength,c.is_nullable IsNullable FROM sys.columns c JOIN sys.types t ON t.user_type_id=c.user_type_id WHERE c.object_id=OBJECT_ID('dbo.Workspaces') ORDER BY c.column_id;
SELECT WorkspaceId,WorkspaceKey,WorkspaceName,DefaultRoute,IsDefault,SortOrder,IsActive FROM dbo.Workspaces ORDER BY SortOrder,WorkspaceId;
SELECT AssignmentTypeId,AssignmentKey,AssignmentName,IsActive FROM dbo.AssignmentTypes ORDER BY SortOrder,AssignmentTypeId;
SELECT a.AssignmentKey,w.WorkspaceKey,atw.IsActive FROM dbo.AssignmentTypeWorkspaces atw JOIN dbo.AssignmentTypes a ON a.AssignmentTypeId=atw.AssignmentTypeId JOIN dbo.Workspaces w ON w.WorkspaceId=atw.WorkspaceId ORDER BY a.AssignmentKey,w.WorkspaceKey;
SELECT r.RoleKey,w.WorkspaceKey,wr.IsDefault FROM dbo.WorkspaceRoles wr JOIN dbo.Roles r ON r.RoleId=wr.RoleId JOIN dbo.Workspaces w ON w.WorkspaceId=wr.WorkspaceId ORDER BY r.RoleKey,w.WorkspaceKey;
SELECT m.MenuKey,m.MenuName,m.Route,p.PermissionKey FROM dbo.Menus m LEFT JOIN dbo.Permissions p ON p.PermissionId=m.PermissionId WHERE m.Route IN('/hod/dashboard','/hos/dashboard','/library/dashboard','/teacher/dashboard','/platform-admin/dashboard','/printing/dashboard') ORDER BY m.Route;
`);console.log(JSON.stringify({columns:r.recordsets[0],workspaces:r.recordsets[1],assignmentTypes:r.recordsets[2],assignmentMappings:r.recordsets[3],roleMappings:r.recordsets[4],existingRoutes:r.recordsets[5]},null,2));await p.close()})().catch(e=>{console.error(e);process.exitCode=1});
