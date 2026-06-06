// React Router
import { Routes, Route, Navigate } from "react-router-dom";

// Teacher Dashboard
import TeacherDashboard from "./pages/teacher/TeacherDashboard";

// HOD Dashboard
import HodDashboard from "./pages/hod/HodDashboard";

export default function App() {
  return (
    <Routes>
      {/* Default page: Teacher Dashboard */}
      <Route path="/" element={<TeacherDashboard />} />

      {/* Optional teacher route */}
      <Route path="/teacher" element={<TeacherDashboard />} />

      {/* HOD Dashboard */}
      <Route path="/hod" element={<HodDashboard />} />

      {/* Wrong URL fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}