const users=require("../modules/users/services/userService");
const auth=require("../modules/auth/services/authService");
const {poolPromise}=require("../database/connection");
async function main(){const p=await poolPromise;try{const row=(await p.request().query("SELECT TOP 1 UserId FROM dbo.Users WHERE IsActive=1 AND ISNULL(IsDeleted,0)=0 ORDER BY UserId;")).recordset[0],list=await users.getUsers(),me=await auth.getMe(row.UserId);if(!Array.isArray(list.users)||!me.mainRole||!me.resolvedWorkspace||!Array.isArray(me.assignments)||!Array.isArray(me.scopes)||!Array.isArray(me.permissions))throw new Error("User/auth response validation failed.");console.log(JSON.stringify({userList:list.count,assignmentSummary:"passed",authShape:"passed",workspace:me.defaultRoute,permissions:me.permissions.length},null,2));}finally{await p.close()}}
main().catch(e=>{console.error(e);process.exitCode=1});
