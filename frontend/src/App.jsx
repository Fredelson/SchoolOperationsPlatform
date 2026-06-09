import { Routes, Route, Navigate } from "react-router-dom";

import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import HodDashboard from "./pages/hod/HodDashboard";
import LoginPage from "./pages/auth/LoginPage";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["Teacher", "SuperAdmin"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hod"
          element={
            <ProtectedRoute allowedRoles={["HOD", "SuperAdmin"]}>
              <HodDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}