const {poolPromise}=require("../../config/db");

const getDashboard=async(req,res)=>{try{const pool=await poolPromise,result=await pool.request().query(`
  SELECT (SELECT COUNT(1) FROM dbo.Modules) TotalModules,(SELECT COUNT(1) FROM dbo.Modules WHERE IsActive=1) ActiveModules,(SELECT COUNT(1) FROM dbo.Workspaces WHERE IsActive=1) ActiveWorkspaces,(SELECT COUNT(1) FROM dbo.Users WHERE IsActive=1 AND ISNULL(IsDeleted,0)=0) ActiveUsers;
  SELECT (SELECT COUNT(1) FROM dbo.Schools WHERE IsActive=1) Schools,(SELECT COUNT(1) FROM dbo.Departments WHERE IsActive=1) Departments,(SELECT COUNT(1) FROM dbo.Sections WHERE IsActive=1) Sections,(SELECT COUNT(1) FROM dbo.YearLevels WHERE IsActive=1) YearGroups;
  SELECT ModuleId,ModuleKey,ModuleName,BaseRoute,IsActive,UpdatedAt FROM dbo.Modules ORDER BY IsActive DESC,SortOrder,ModuleName;
  SELECT TOP 12 a.AuditLogId,a.ActionType,a.EntityType,a.EntityId,a.Description,a.CreatedAt,u.FullName,u.EmployeeId FROM dbo.AuditLogs a LEFT JOIN dbo.Users u ON u.UserId=a.UserId ORDER BY a.CreatedAt DESC;
  SELECT COUNT(1) Events24Hours,COUNT(DISTINCT UserId) ActiveActors,SUM(CASE WHEN ActionType LIKE '%DELETE%' OR ActionType LIKE '%DEACTIVATE%' THEN 1 ELSE 0 END) SensitiveChanges FROM dbo.AuditLogs WHERE CreatedAt>=DATEADD(hour,-24,GETDATE());
  SELECT (SELECT COUNT(1) FROM dbo.Users WHERE IsLocked=1 OR LockedUntil>GETDATE()) LockedUsers,(SELECT COUNT(1) FROM dbo.Modules WHERE IsActive=0) InactiveModules,(SELECT COUNT(1) FROM dbo.Workspaces WHERE IsActive=0) InactiveWorkspaces;
  SELECT TOP 10 AuditLogId,ActionType,EntityType,Description,CreatedAt FROM dbo.AuditLogs WHERE ActionType LIKE '%PENDING%' OR ActionType LIKE '%SUBMIT%' OR ActionType LIKE '%REQUEST%' ORDER BY CreatedAt DESC;
  `);const health=result.recordsets[0][0];return res.status(200).json({platformHealth:{...health,status:health.ActiveModules===health.TotalModules?"Healthy":"Attention"},organizationOverview:result.recordsets[1][0],moduleHealth:result.recordsets[2],recentActivity:result.recordsets[3],auditSummary:result.recordsets[4][0],criticalAlerts:result.recordsets[5][0],pendingApprovals:result.recordsets[6]});}catch(error){console.error("Get dashboard error:",error);return res.status(500).json({message:"Failed to load dashboard."});}};
module.exports={getDashboard};
