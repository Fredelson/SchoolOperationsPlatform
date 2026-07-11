const repository = require("../repositories/accessLevelRepository");
const { validate } = require("../validators/accessLevelValidator");
const serviceError = require("../../../shared/helpers/serviceError");

const id = (value) => { const parsed=Number(value); if(!parsed) throw serviceError.badRequest("Valid access level ID is required."); return parsed; };
async function list(query={}) { const page=Math.max(Number(query.page)||1,1); const pageSize=Math.min(Math.max(Number(query.pageSize||query.limit)||10,1),100); return repository.list({search:String(query.search||"").trim(),status:query.status||"",page,pageSize}); }
async function getById(value) { const record=await repository.byId(id(value)); if(!record) throw serviceError.notFound("Access level not found."); return record; }
async function ensureUnique(data, exclude=null) { if(await repository.duplicate(data.accessLevelKey,data.accessLevelName,exclude)) throw serviceError.conflict("Access level key or name already exists."); }
async function create(payload) { const data=validate(payload); await ensureUnique(data); return repository.create(data); }
async function update(value,payload) { const accessLevelId=id(value); const current=await getById(accessLevelId); const data=validate(payload); if(current.IsSystemLevel&&!data.isActive) throw serviceError.badRequest("System access levels cannot be deactivated."); await ensureUnique(data,accessLevelId); return repository.update(accessLevelId,data); }
async function setActive(value,active) { const current=await getById(value); if(current.IsSystemLevel && !active) throw serviceError.badRequest("System access levels cannot be deactivated."); return repository.setActive(current.AccessLevelId,active); }
async function remove(value) { const current=await getById(value); if(current.IsSystemLevel) throw serviceError.badRequest("System access levels cannot be deleted."); const use=await repository.usage(current.AccessLevelId); if(use?.RoleCount) throw serviceError.conflict("Access level is assigned to roles and cannot be deleted."); await repository.remove(current.AccessLevelId); return current; }
module.exports={list,getById,create,update,setActive,remove};
