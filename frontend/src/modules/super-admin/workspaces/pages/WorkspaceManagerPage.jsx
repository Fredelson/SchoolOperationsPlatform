import { useEffect, useState } from "react";
import { Alert, Autocomplete, Box, Button, Checkbox, Chip, CircularProgress, MenuItem, Paper, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import usePageTitle from "@platform/hooks/usePageTitle";
import { usePermissions } from "../../../../context/PermissionContext";
import { useAuth } from "../../../../context/AuthContext";
import { getWorkspaceConfiguration, listWorkspaces, saveWorkspaceAssignments, saveWorkspaceDashboard, searchWorkspacePreviewUsers, startLiveMode } from "../services/workspaceService";

const tabs = ["Settings", "Modules", "Navigation", "Buttons", "Widgets", "Dashboard", "Permissions", "Profiles", "Preview"];

export default function WorkspaceManagerPage() {
  usePageTitle("AUS | Workspace Manager");
  const {hasPermission}=usePermissions();
  const {user}=useAuth();
  const canConfigure=hasPermission("workspace.configure");
  const isSuperAdmin=String(user?.roleKey||user?.role||"").replace(/[\s_-]/g,"").toLowerCase()==="superadmin";
  const [workspaces,setWorkspaces]=useState([]),[workspaceId,setWorkspaceId]=useState(""),[config,setConfig]=useState(null),[tab,setTab]=useState(0),[loading,setLoading]=useState(true),[error,setError]=useState("");
  const [previewUserId,setPreviewUserId]=useState("");
  const [previewUsers,setPreviewUsers]=useState([]),[previewSearch,setPreviewSearch]=useState("");
  const [liveReason,setLiveReason]=useState("");
  const [dashboardId,setDashboardId]=useState(""),[defaultRoute,setDefaultRoute]=useState("");
  useEffect(()=>{listWorkspaces().then(items=>{setWorkspaces(items);if(items[0])setWorkspaceId(items[0].WorkspaceId);}).catch(e=>setError(e.response?.data?.message||e.message)).finally(()=>setLoading(false));},[]);
  useEffect(()=>{if(!workspaceId)return;setLoading(true);getWorkspaceConfiguration(workspaceId).then(data=>{setConfig(data);setDashboardId(data.workspace?.DefaultDashboardId||"");setDefaultRoute(data.workspace?.DefaultRoute||"");}).catch(e=>setError(e.response?.data?.message||e.message)).finally(()=>setLoading(false));},[workspaceId]);
  useEffect(()=>{if(tab!==8)return;const timer=setTimeout(()=>searchWorkspacePreviewUsers(previewSearch).then(setPreviewUsers).catch(e=>setError(e.response?.data?.message||e.message)),250);return()=>clearTimeout(timer);},[previewSearch,tab]);
  const rows = tab===1?config?.modules:tab===2?config?.navigation:tab===3?config?.buttons:tab===4?config?.widgets:tab===5?config?.dashboards:tab===7?config?.profiles:null;
  const assignmentType=tab===1?"modules":tab===2?"navigation":tab===3?"buttons":tab===4?"widgets":tab===7?"profiles":null;
  const assignmentField={modules:"modules",navigation:"navigation",buttons:"buttons",widgets:"widgets",profiles:"profiles"}[assignmentType];
  const idField={modules:"ModuleId",navigation:"MenuId",buttons:"ButtonId",widgets:"WidgetId",profiles:"RoleId"}[assignmentType];
  const toggleAssignment=(index)=>setConfig(previous=>({...previous,[assignmentField]:previous[assignmentField].map((item,i)=>i===index?{...item,IsAssigned:!item.IsAssigned}:item)}));
  const updateAssignment=(index,field,value)=>setConfig(previous=>({...previous,[assignmentField]:previous[assignmentField].map((item,i)=>i===index?{...item,[field]:value}:item)}));
  const saveAssignments=async()=>{setLoading(true);setError("");try{const items=config[assignmentField].filter(x=>x.IsAssigned).map(x=>({id:x[idField],isVisible:true,isEnabled:x.IsEnabled!==false,isDefault:true,sortOrder:x.SortOrder,groupKey:x.GroupKey,groupName:x.GroupName,groupSortOrder:x.GroupSortOrder,parentMenuId:x.ParentMenuId}));setConfig(await saveWorkspaceAssignments(workspaceId,assignmentType,items));}catch(e){setError(e.response?.data?.message||e.message);}finally{setLoading(false);}};
  return <Stack spacing={2}>
    <Box><Typography variant="h4">Workspace Manager</Typography><Typography color="text.secondary">Presentation assignments never grant permissions.</Typography></Box>
    {error&&<Alert severity="error">{error}</Alert>}
    <TextField select label="Workspace" value={workspaceId} onChange={e=>setWorkspaceId(e.target.value)} sx={{maxWidth:420}}>{workspaces.map(w=><MenuItem key={w.WorkspaceId} value={w.WorkspaceId}>{w.WorkspaceName}</MenuItem>)}</TextField>
    <Paper><Tabs value={tab} onChange={(_,v)=>setTab(v)} variant="scrollable">{tabs.map(x=><Tab key={x} label={x}/>)}</Tabs></Paper>
    {loading?<CircularProgress/>:<Paper sx={{p:3}}>
      {!canConfigure&&<Alert severity="info" sx={{mb:2}}>Read-only inspection mode. Configuration controls are disabled at the API layer.</Alert>}
      {tab===0&&<Stack spacing={1}><Typography variant="h6">{config?.workspace?.WorkspaceName}</Typography><Typography>{config?.workspace?.Description||"No description"}</Typography><Chip label={config?.workspace?.DefaultRoute||"No landing route"} sx={{width:"fit-content"}}/></Stack>}
      {tab===6&&<Alert severity="info">Workspace membership controls visibility only. Role permissions and user overrides are resolved by Permission Resolver.</Alert>}
      {tab===5&&<Stack spacing={2}><TextField disabled={!canConfigure} select label="Default dashboard" value={dashboardId} onChange={e=>setDashboardId(e.target.value)}><MenuItem value="">No dashboard</MenuItem>{(config?.dashboards||[]).map(item=><MenuItem key={item.DashboardId} value={item.DashboardId}>{item.DashboardName}</MenuItem>)}</TextField><TextField disabled={!canConfigure} select label="Default landing route" value={defaultRoute} onChange={e=>setDefaultRoute(e.target.value)}>{(config?.navigation||[]).filter(item=>item.IsAssigned&&item.Route).map(item=><MenuItem key={item.MenuId} value={item.Route}>{item.MenuName} — {item.Route}</MenuItem>)}</TextField>{canConfigure&&<Button variant="contained" onClick={async()=>{setLoading(true);try{const data=await saveWorkspaceDashboard(workspaceId,dashboardId,defaultRoute);setConfig(data);}catch(e){setError(e.response?.data?.message||e.message);}finally{setLoading(false);}}}>Save dashboard and landing route</Button>}</Stack>}
      {assignmentType&&canConfigure&&<Button sx={{mb:2}} variant="contained" onClick={saveAssignments}>Save {assignmentType} assignments</Button>}
      {tab===8&&<Stack spacing={2}><Alert severity="warning">Preview opens separately and is read-only. It uses the selected user’s effective role permissions and overrides.</Alert><Autocomplete options={previewUsers} value={previewUsers.find(item=>String(item.UserId)===String(previewUserId))||null} onInputChange={(_,value,reason)=>{if(reason==="input")setPreviewSearch(value)}} onChange={(_,value)=>setPreviewUserId(value?.UserId||"")} getOptionLabel={item=>`${item.FullName} (${item.EmployeeId}) — ${item.RoleName}`} renderInput={params=><TextField {...params} label="Search user by name, employee ID, or email"/>}/><Button disabled={!previewUserId} variant="contained" onClick={()=>window.open(`/super-admin/workspace-preview?userId=${encodeURIComponent(previewUserId)}`,"_blank","noopener,noreferrer")}>Open user preview</Button>{isSuperAdmin&&<><Alert severity="error">Live Mode performs real actions with the target user’s permissions. Super Admin only; all activity is audited.</Alert><TextField label="Required troubleshooting reason" value={liveReason} onChange={e=>setLiveReason(e.target.value)}/><Button color="error" variant="contained" disabled={!previewUserId||liveReason.trim().length<10} onClick={async()=>{if(!window.confirm("Enter Live Mode as this user? Real permitted actions will be possible."))return;try{const result=await startLiveMode(previewUserId,liveReason);window.open(`/live-workspace#liveToken=${encodeURIComponent(result.token)}`,"_blank","noopener,noreferrer");}catch(e){setError(e.response?.data?.message||e.message);}}}>Enter Live Mode</Button></>}</Stack>}
      {Array.isArray(rows)&&tab!==5&&tab!==8&&<Stack spacing={1}>{rows.length?rows.map((row,index)=><Paper variant="outlined" sx={{p:1.5}} key={row.ModuleId||row.MenuId||row.ButtonId||row.WidgetId||row.DashboardId||row.RoleId||index}>{assignmentType&&<Checkbox checked={Boolean(row.IsAssigned)} onChange={()=>toggleAssignment(index)}/>}<Typography component="span">{row.ModuleName||row.MenuName||row.ButtonName||row.WidgetName||row.DashboardName||row.RoleName}</Typography>{assignmentType&&assignmentType!=="profiles"&&<TextField size="small" type="number" label="Sort" value={row.SortOrder??0} onChange={e=>updateAssignment(index,"SortOrder",Number(e.target.value))} sx={{width:100,ml:2}}/>}{assignmentType==="navigation"&&<><TextField size="small" label="Group" value={row.GroupName||"Main"} onChange={e=>updateAssignment(index,"GroupName",e.target.value)} sx={{width:180,ml:1}}/><TextField size="small" type="number" label="Group sort" value={row.GroupSortOrder??0} onChange={e=>updateAssignment(index,"GroupSortOrder",Number(e.target.value))} sx={{width:120,ml:1}}/></>}<Typography variant="caption" display="block" color="text.secondary">{row.BaseRoute||row.Route||row.ModuleKey||row.RoleKey||"Configured record"}</Typography></Paper>):<Typography color="text.secondary">No supported records assigned.</Typography>}</Stack>}
    </Paper>}
  </Stack>;
}
