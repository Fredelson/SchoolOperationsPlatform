const fs=require("fs");
const path=require("path");
const {poolPromise}=require("../database/connection");
const scripts=path.join(__dirname,"..","..","scripts");
async function main(){const pool=await poolPromise;try{console.log("PRE");await pool.request().batch(fs.readFileSync(path.join(scripts,"000_PreDeployment_Check.sql"),"utf8"));await pool.request().query("EXEC sys.sp_set_session_context @key=N'OperationsPlatformDryRun',@value=1;");console.log("DRY");await pool.request().batch(fs.readFileSync(path.join(scripts,"002_Final_Migration.sql"),"utf8"));await pool.request().query("EXEC sys.sp_set_session_context @key=N'OperationsPlatformDryRun',@value=NULL;");console.log("POST");await pool.request().batch(fs.readFileSync(path.join(scripts,"003_PostDeployment_Validation.sql"),"utf8"));console.log("FINAL RELEASE PACKAGE PASSED");}finally{await pool.close()}}
main().catch(e=>{console.error(e);process.exitCode=1});
