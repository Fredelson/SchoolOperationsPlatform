const repo=require("../repositories/libraryRepository");
async function list(resource,q){const page=Math.max(Number(q.page)||1,1),limit=Math.min(Math.max(Number(q.limit)||20,1),100);const r=await repo.list(resource,{search:String(q.search||"").trim(),page,limit});return{data:r.rows,pagination:{page,limit,total:r.total,totalPages:Math.ceil(r.total/limit)}};}
module.exports={list,dashboard:repo.dashboard};
