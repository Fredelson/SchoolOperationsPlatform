import { Routes, Route, Navigate } from "react-router-dom";

import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import MyRequests from "./pages/teacher/MyRequests";
import CreateRequest from "./pages/teacher/CreateRequest";
import RequestDetails from "./pages/teacher/RequestDetails";

import HodDashboard from "./pages/hod/HodDashboard";
import LoginPage from "./pages/auth/LoginPage";

import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
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
        path="/teacher/my-requests"
        element={
          <ProtectedRoute allowedRoles={["Teacher", "SuperAdmin"]}>
            <MyRequests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/create-request"
        element={
          <ProtectedRoute allowedRoles={["Teacher", "SuperAdmin"]}>
            <CreateRequest />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/request-details/:id"
        element={
          <ProtectedRoute allowedRoles={["Teacher", "SuperAdmin"]}>
            <RequestDetails />
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
  );
}