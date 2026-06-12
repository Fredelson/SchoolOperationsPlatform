import { Routes, Route, Navigate } from "react-router-dom";

import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import MyRequests from "./pages/teacher/MyRequests";
import CreateRequest from "./pages/teacher/CreateRequest";
import RequestDetails from "./pages/teacher/RequestDetails";

import HodDashboard from "./pages/hod/HodDashboard";
import HosDashboard from "./pages/hos/HosDashboard";

import LoginPage from "./pages/auth/LoginPage";

import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* Public login route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Teacher dashboard */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={["Teacher", "SuperAdmin"]}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      {/* Teacher request list */}
      <Route
        path="/teacher/my-requests"
        element={
          <ProtectedRoute allowedRoles={["Teacher", "SuperAdmin"]}>
            <MyRequests />
          </ProtectedRoute>
        }
      />

      {/* Create request */}
      <Route
        path="/teacher/create-request"
        element={
          <ProtectedRoute allowedRoles={["Teacher", "SuperAdmin"]}>
            <CreateRequest />
          </ProtectedRoute>
        }
      />

      {/* Teacher request details */}
      <Route
        path="/teacher/request-details/:id"
        element={
          <ProtectedRoute allowedRoles={["Teacher", "SuperAdmin"]}>
            <RequestDetails />
          </ProtectedRoute>
        }
      />

      {/* HOD dashboard */}
      <Route
        path="/hod"
        element={
          <ProtectedRoute allowedRoles={["HOD", "SuperAdmin"]}>
            <HodDashboard />
          </ProtectedRoute>
        }
      />

      {/* HOS dashboard */}
      <Route
        path="/hos"
        element={
          <ProtectedRoute allowedRoles={["HOS", "SuperAdmin"]}>
            <HosDashboard />
          </ProtectedRoute>
        }
      />

      {/* Default route */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Unknown route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}