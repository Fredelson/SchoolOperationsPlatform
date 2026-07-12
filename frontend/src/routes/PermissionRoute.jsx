import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { usePermissions } from "../context/PermissionContext";
import {useLocation} from "react-router-dom";

export default function PermissionRoute({ permissionKey, children, requireVisible=false }) {
  const { loading, hasPermission,isRouteVisible } = usePermissions();const location=useLocation();
  if (loading) return <Box sx={{display:"grid",placeItems:"center",minHeight:240}}><CircularProgress /></Box>;
  if (!hasPermission(permissionKey)) return <Alert severity="error" sx={{mt:2}}><Typography fontWeight={700}>Access Denied</Typography>You do not have the required permission: {permissionKey}</Alert>;
  if(requireVisible&&!isRouteVisible(location.pathname))return <Alert severity="error" sx={{mt:2}}><Typography fontWeight={700}>Workspace Page Hidden</Typography>This page is not visible in your active workspace.</Alert>;
  return children;
}
