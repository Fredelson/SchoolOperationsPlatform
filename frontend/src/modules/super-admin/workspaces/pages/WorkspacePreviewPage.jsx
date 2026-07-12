import { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, Divider, Paper, Stack, Typography } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { getUserWorkspacePreview } from "../services/workspaceService";

function MenuItems({items=[]}) { return <Stack sx={{pl:1}}>{items.map(item=><Box key={item.id}><Typography variant="body2">{item.label}</Typography>{item.children&&<MenuItems items={item.children}/>}</Box>)}</Stack>; }

export default function WorkspacePreviewPage() {
  const [params]=useSearchParams(),[data,setData]=useState(null),[error,setError]=useState("");
  const userId=params.get("userId");
  useEffect(()=>{if(userId)getUserWorkspacePreview(userId).then(setData).catch(e=>setError(e.response?.data?.message||e.message));},[userId]);
  if(!userId)return <Alert severity="error">A user must be selected for preview.</Alert>;
  if(error)return <Alert severity="error">{error}</Alert>;
  if(!data)return <CircularProgress/>;
  return <Stack spacing={2}>
    <Alert severity="warning" variant="filled">Preview Mode — read only. No create, update, delete, approval, transfer, import, or configuration action is available.</Alert>
    <Typography variant="h4">{data.user?.FullName}</Typography><Typography color="text.secondary">{data.workspace?.WorkspaceName||"Default workspace"} · {data.user?.RoleName}</Typography>
    <Stack direction={{xs:"column",md:"row"}} spacing={2} alignItems="flex-start">
      <Paper sx={{p:2,width:{xs:"100%",md:320}}}><Typography variant="h6">Sidebar</Typography><Divider sx={{my:1}}/>{data.sidebar?.map(section=><Box key={section.title} sx={{mb:2}}><Typography fontWeight={700}>{section.title}</Typography><MenuItems items={section.items}/></Box>)}</Paper>
      <Stack spacing={2} sx={{flex:1,width:"100%"}}><Paper sx={{p:2}}><Typography variant="h6">Workspace landing experience</Typography><Divider sx={{my:1}}/><Typography><b>Landing page:</b> {data.workspace?.DefaultRoute||"Not configured"}</Typography><Typography><b>Dashboard:</b> {data.configuration?.dashboards?.find(x=>x.DashboardId===data.workspace?.DefaultDashboardId)?.DashboardName||"Not configured"}</Typography></Paper><Paper sx={{p:2}}><Typography variant="h6">Visible buttons and widgets</Typography><Divider sx={{my:1}}/><Typography variant="subtitle2">Buttons</Typography><Stack direction="row" flexWrap="wrap" gap={1}>{(data.configuration?.buttons||[]).filter(x=>x.IsAssigned&&x.IsEnabled).map(x=><Typography key={x.ButtonId} variant="caption" sx={{border:1,borderColor:"divider",borderRadius:1,p:.75}}>{x.ButtonName}</Typography>)}</Stack><Typography variant="subtitle2" sx={{mt:2}}>Widgets</Typography><Stack direction="row" flexWrap="wrap" gap={1}>{(data.configuration?.widgets||[]).filter(x=>x.IsAssigned&&x.IsEnabled).map(x=><Typography key={x.WidgetId} variant="caption" sx={{border:1,borderColor:"divider",borderRadius:1,p:.75}}>{x.WidgetName}</Typography>)}</Stack></Paper><Paper sx={{p:2}}><Typography variant="h6">Effective permissions</Typography><Divider sx={{my:1}}/><Stack direction="row" flexWrap="wrap" gap={1}>{data.permissions?.allowedPermissionKeys?.map(key=><Typography key={key} variant="caption" sx={{border:1,borderColor:"divider",borderRadius:1,p:.75}}>{key}</Typography>)}</Stack></Paper></Stack>
    </Stack>
  </Stack>;
}
