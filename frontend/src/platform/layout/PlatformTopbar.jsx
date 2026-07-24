import {useEffect,useMemo,useState} from "react";
import {Alert,Avatar,Badge,Box,Button,Dialog,DialogActions,DialogContent,DialogTitle,Divider,IconButton,InputBase,List,ListItem,ListItemText,Menu,MenuItem,Stack,Typography,alpha,useTheme} from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import {useLocation,useNavigate} from "react-router-dom";
import {useAuth} from "../../context/AuthContext";
import api from "../../services/api";
import { getNotificationReadAtService, markAllNotificationsAsReadService } from "../../modules/notifications/services/notificationReadService";

const messages=[{id:1,from:"IT Service Desk",subject:"Operations Platform workspace guide",time:"Today"},{id:2,from:"School Operations",subject:"Weekly administration update",time:"Yesterday"}];
const normalized=value=>String(value||"").replace(/[\s_-]/g,"").toLowerCase();

export default function PlatformTopbar({height=78,onMenuClick}){
  const theme=useTheme(),navigate=useNavigate(),location=useLocation(),{user,logout}=useAuth();
  const liveToken=sessionStorage.getItem("liveModeToken");let liveUser=null;try{if(liveToken)liveUser=JSON.parse(atob(liveToken.split(".")[1].replaceAll("-","+").replaceAll("_","/")))}catch{liveUser=null}const effectiveUser=liveUser?.liveMode?liveUser:user;
  const role=normalized(effectiveUser?.roleKey||effectiveUser?.role),admin=role==="superadmin"||role==="platformadmin",canNotify=admin;
  const[anchor,setAnchor]=useState(null),[panel,setPanel]=useState(null),[activities,setActivities]=useState([]),[readAt,setReadAt]=useState(null),[dialog,setDialog]=useState(null);
  useEffect(()=>{
    if(!canNotify)return;
    let mounted=true;
    Promise.all([
      api.get("/superadmin/audit-logs",{params:{limit:12}}).then(r=>r.data?.auditLogs||[]).catch(()=>[]),
      getNotificationReadAtService().then(r=>r.readAt||null).catch(()=>null)
    ]).then(([logs, serverReadAt])=>{
      if(!mounted)return;
      setActivities(logs);
      const persistedReadAt = serverReadAt || localStorage.getItem("topbarNotificationsReadAt") || "";
      setReadAt(persistedReadAt);
    }).catch(()=>{if(mounted){setActivities([]);}});
    return ()=>{mounted=false};
  },[canNotify]);
  const unread=useMemo(()=>activities.filter(x=>!readAt||new Date(x.CreatedAt)>new Date(readAt)).length,[activities,readAt]);
  const openMenu=(event,type)=>{setAnchor(event.currentTarget);setPanel(type)},close=()=>{setAnchor(null);setPanel(null)};
  const markRead=async()=>{
    const now=new Date().toISOString();
    localStorage.setItem("topbarNotificationsReadAt",now);
    setReadAt(now);
    try{await markAllNotificationsAsReadService()}catch{/* best-effort */}
  };
  const profileRoute=location.pathname.startsWith("/teacher")?"/teacher/profile":location.pathname.startsWith("/hod")?"/hod/profile":location.pathname.startsWith("/hos")?"/hos/profile":location.pathname.startsWith("/printing")?"/printing/profile":location.pathname.startsWith("/library")?"/library/profile":role==="platformadmin"?"/platform-admin/profile":role==="printingadmin"?"/printing/profile":"/super-admin/profile";
  const signOut=()=>{logout();navigate("/login",{replace:true})};
  const topbar=theme.palette.platform?.topbarBackground||theme.palette.primary.dark,text=theme.palette.primary.contrastText;
  return <Box sx={{height,px:{xs:2,md:4},display:"flex",alignItems:"center",justifyContent:"space-between",gap:2,color:text,background:topbar,position:"fixed",inset:"0 0 auto 0",zIndex:1300,borderBottom:`1px solid ${alpha(text,.15)}`}}>
    <Stack direction="row" sx={{alignItems:"center",minWidth:40,height:"100%"}}><IconButton onClick={onMenuClick} sx={{color:text,display:{lg:"none"}}}><MenuOutlinedIcon/></IconButton></Stack>
    <Box sx={{width:{md:320,xl:460},height:44,px:2,display:{xs:"none",md:"flex"},alignItems:"center",gap:1,borderRadius:99,bgcolor:alpha(text,.1),border:`1px solid ${alpha(text,.2)}`}}><SearchOutlinedIcon/><InputBase fullWidth placeholder="Search workspace..." sx={{color:text}}/></Box>
    <Stack direction="row" spacing={.5} sx={{alignItems:"center"}}>
      {canNotify&&<IconButton aria-label="Notifications" onClick={e=>openMenu(e,"notifications")} sx={{color:text}}><Badge badgeContent={unread} color="error"><NotificationsNoneOutlinedIcon/></Badge></IconButton>}
      {admin&&<IconButton aria-label="Messages" onClick={e=>openMenu(e,"messages")} sx={{color:text}}><Badge badgeContent={messages.length} color="error"><MailOutlineOutlinedIcon/></Badge></IconButton>}
      {admin&&<IconButton aria-label="Settings" onClick={()=>navigate("/super-admin/settings")} sx={{color:text,display:{xs:"none",md:"inline-flex"}}}><SettingsOutlinedIcon/></IconButton>}
      {admin&&<IconButton aria-label="Help" onClick={()=>setDialog("help")} sx={{color:text,display:{xs:"none",md:"inline-flex"}}}><HelpOutlineOutlinedIcon/></IconButton>}
      <Button onClick={e=>openMenu(e,"user")} sx={{color:text,textTransform:"none",minWidth:0}} startIcon={<Avatar sx={{width:38,height:38}}>{effectiveUser?.fullName?.[0]||"U"}</Avatar>}><Box sx={{display:{xs:"none",lg:"block"},textAlign:"left"}}><Typography variant="body2" fontWeight={800}>{effectiveUser?.fullName}</Typography><Typography variant="caption" sx={{opacity:.8}}>{effectiveUser?.roleName||effectiveUser?.role}</Typography></Box></Button>
    </Stack>
    <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close} PaperProps={{sx:{width:panel==="user"?220:380,maxWidth:"95vw"}}}>
      {panel==="notifications"&&<Box><Stack direction="row" sx={{justifyContent:"space-between",alignItems:"center",px:2,py:1}}><Typography fontWeight={800}>Recent activity</Typography><Button size="small" onClick={markRead}>Mark read</Button></Stack><Divider/>{activities.length?activities.map(x=><MenuItem key={x.AuditLogId} onClick={close} sx={{whiteSpace:"normal"}}><ListItemText primary={`${x.ActionType} · ${x.EntityType||"Platform"}`} secondary={`${x.FullName||"System"} · ${new Date(x.CreatedAt).toLocaleString()}`}/></MenuItem>):<MenuItem disabled>No recent permitted activity</MenuItem>}<Divider/><MenuItem onClick={()=>{close();navigate("/super-admin/audit-logs");}}>View all</MenuItem></Box>}
      {panel==="messages"&&<Box><Typography px={2} py={1} fontWeight={800}>Messages</Typography><Divider/><List dense>{messages.map(x=><ListItem key={x.id}><ListItemText primary={x.subject} secondary={`${x.from} · ${x.time}`}/></ListItem>)}</List><Alert severity="info" sx={{m:1}}>Static preview. Email integration will be added later.</Alert></Box>}
      {panel==="user"&&<><MenuItem onClick={()=>{close();navigate(profileRoute)}}>Profile</MenuItem><MenuItem onClick={()=>{close();setDialog("help")}}>Help Center</MenuItem><Divider/><MenuItem onClick={signOut}>Logout</MenuItem></>}
    </Menu>
    <Dialog open={dialog==="help"} onClose={()=>setDialog(null)} fullWidth maxWidth="sm"><DialogTitle>Help Center</DialogTitle><DialogContent><Stack spacing={2}><Typography>Workspace guides, permission explanations, and support contacts will be available here.</Typography><Alert severity="info">For access or operational support, contact the IT Service Desk.</Alert></Stack></DialogContent><DialogActions><Button onClick={()=>setDialog(null)}>Close</Button></DialogActions></Dialog>
  </Box>;
}

