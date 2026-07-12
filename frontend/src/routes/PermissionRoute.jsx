import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { usePermissions } from "../context/PermissionContext";

export default function PermissionRoute({ permissionKey, children }) {
  const { loading, hasPermission } = usePermissions();
  if (loading) return <Box sx={{display:"grid",placeItems:"center",minHeight:240}}><CircularProgress /></Box>;
  if (!hasPermission(permissionKey)) return <Alert severity="error" sx={{mt:2}}><Typography fontWeight={700}>Access Denied</Typography>You do not have the required permission: {permissionKey}</Alert>;
  return children;
}
