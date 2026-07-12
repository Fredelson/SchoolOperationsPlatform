// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Protected Route
// ============================================

import { Navigate } from "react-router-dom";
import { Alert, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";

const normalizeRole = (role = "") =>
  String(role)
    .toLowerCase()
    .replaceAll(" ", "")
    .replaceAll("-", "")
    .trim();

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = normalizeRole(
    user?.role ||
      user?.Role ||
      user?.displayRole ||
      user?.user?.role ||
      user?.user?.Role ||
      ""
  );

  const allowed = allowedRoles?.map(normalizeRole) || [];

  if (allowedRoles && !allowed.includes(userRole)) {
    return <Alert severity="error" sx={{m:3}}><Typography fontWeight={700}>Access Denied</Typography>Your role is not authorized to open this workspace.</Alert>;
  }

  return children;
}
