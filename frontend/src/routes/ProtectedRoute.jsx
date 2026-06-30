// ============================================
// ARAB UNITY SCHOOL
// Operations Platform
// Protected Route
// ============================================

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const normalizeRole = (role = "") =>
  String(role)
    .toLowerCase()
    .replaceAll(" ", "")
    .replaceAll("-", "")
    .trim();

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  console.log("AUTH USER:", user);
console.log("AUTH LOADING:", loading);

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
    console.log("BLOCKED ROLE:", userRole);
    console.log("ALLOWED ROLES:", allowed);
    console.log("USER:", user);

    return <Navigate to="/login" replace />;
  }
  console.log("NORMALIZED USER ROLE:", userRole);
console.log("ALLOWED ROLES:", allowed);

  return children;
}
