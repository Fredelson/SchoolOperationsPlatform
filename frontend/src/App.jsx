// ============================================
// ARAB UNITY SCHOOL
// Main App Routes
// Role-based protected routes
// ============================================

import { Routes, Route, Navigate } from "react-router-dom";

// Auth
import LoginPage from "./pages/auth/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";

// Teacher pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import MyRequests from "./pages/teacher/MyRequests";
import CreateRequest from "./pages/teacher/CreateRequest";
import RequestDetails from "./pages/teacher/RequestDetails";
import TeacherReports from "./pages/teacher/TeacherReports";

// HOD / HOS pages
import HodDashboard from "./pages/hod/HodDashboard";
import HosDashboard from "./pages/hos/HosDashboard";
import HodRequestsPage from "./pages/hod/HodRequestsPage";
import DepartmentLimitsPage from "./pages/printing/DepartmentLimitsPage";
import SubjectAllocationPage from "./pages/hos/SubjectAllocationPage";

// Printing page
import PrintingDashboard from "./pages/printing/PrintingDashboard";
import UserManagement from "./pages/admin/UserManagement";

// Reusable common page
import Profile from "./pages/common/Profile";

export default function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />

      {/* ================= TEACHER ROUTES ================= */}

      <Route
        path="/teacher"
        element={<Navigate to="/teacher/dashboard" replace />}
      />

      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Teacher", "SuperAdmin"]}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/profile"
        element={
          <ProtectedRoute allowedRoles={["Teacher", "SuperAdmin"]}>
            <Profile />
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
        path="/printing/department-limits"
        element={
          <ProtectedRoute allowedRoles={["PrintingAdmin", "SuperAdmin"]}>
            <DepartmentLimitsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/reports"
        element={
          <ProtectedRoute allowedRoles={["Teacher", "SuperAdmin"]}>
            <TeacherReports />
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

      {/* ================= HOD ROUTES ================= */}

      <Route
        path="/hod"
        element={<Navigate to="/hod/dashboard" replace />}
      />

      <Route
        path="/hod/dashboard"
        element={
          <ProtectedRoute allowedRoles={["HOD", "SuperAdmin"]}>
            <HodDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hos/subject-allocation"
        element={
          <ProtectedRoute allowedRoles={["HOS", "SuperAdmin"]}>
            <SubjectAllocationPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/hod/profile"
        element={
          <ProtectedRoute allowedRoles={["HOD", "SuperAdmin"]}>
            <Profile />
          </ProtectedRoute>
        }
      />

                <Route
            path="/hod/pending-requests"
            element={
              <ProtectedRoute allowedRoles={["HOD", "SuperAdmin"]}>
                <HodRequestsPage type="pending" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hod/approved-requests"
            element={
              <ProtectedRoute allowedRoles={["HOD", "SuperAdmin"]}>
                <HodRequestsPage type="approved" />
              </ProtectedRoute>
            }
          />

        <Route
          path="/hod/rejected-requests"
          element={
            <ProtectedRoute allowedRoles={["HOD", "SuperAdmin"]}>
              <HodRequestsPage type="rejected" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hod/returned-requests"
          element={
            <ProtectedRoute allowedRoles={["HOD", "SuperAdmin"]}>
              <HodRequestsPage type="returned" />
            </ProtectedRoute>
          }
        />

      {/* HOD reuses MyRequests page */}
      <Route
        path="/hod/my-requests"
        element={
          <ProtectedRoute allowedRoles={["HOD", "SuperAdmin"]}>
            <MyRequests />
          </ProtectedRoute>
        }
      />

      {/* HOD reuses CreateRequest page */}
      <Route
        path="/hod/create-request"
        element={
          <ProtectedRoute allowedRoles={["HOD", "SuperAdmin"]}>
            <CreateRequest />
          </ProtectedRoute>
        }
      />

      {/* HOD reuses RequestDetails page */}
      <Route
        path="/hod/request-details/:id"
        element={
          <ProtectedRoute allowedRoles={["HOD", "SuperAdmin"]}>
            <RequestDetails />
          </ProtectedRoute>
        }
      />

      {/* ================= HOS ROUTES ================= */}

      <Route
        path="/hos"
        element={<Navigate to="/hos/dashboard" replace />}
      />

      <Route
        path="/hos/dashboard"
        element={
          <ProtectedRoute allowedRoles={["HOS", "SuperAdmin"]}>
            <HosDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/hos/profile"
        element={
          <ProtectedRoute allowedRoles={["HOS", "SuperAdmin"]}>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* ================= PRINTING ADMIN ROUTES ================= */}

      <Route
        path="/printing"
        element={<Navigate to="/printing/dashboard" replace />}
      />

      <Route
        path="/printing/dashboard"
        element={
          <ProtectedRoute allowedRoles={["PrintingAdmin", "SuperAdmin"]}>
            <PrintingDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/printing/profile"
        element={
          <ProtectedRoute allowedRoles={["PrintingAdmin", "SuperAdmin"]}>
            <Profile />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/printing/user-management"
        element={
          <ProtectedRoute allowedRoles={["PrintingAdmin", "Admin", "SuperAdmin"]}>
            <UserManagement />
          </ProtectedRoute>
        }
      />

      {/* Default route */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Unknown routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}