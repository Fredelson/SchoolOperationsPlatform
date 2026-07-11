import { Alert, Paper, Stack, Typography } from "@mui/material";
import { useAuth } from "@context/AuthContext";
export default function LiveModeHomePage(){const {user}=useAuth();return <Stack spacing={2}><Alert severity="error">You are operating with this user’s real permissions and data scope. All routes and actions are audited.</Alert><Paper sx={{p:3}}><Typography variant="h4">Live Mode</Typography><Typography sx={{mt:1}}>Operating as {user?.fullName} ({user?.roleName||user?.role}). Select a permitted function from the sidebar.</Typography></Paper></Stack>;}
