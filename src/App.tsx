import "./App.css";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/landpage";
import RegisterPage from "./pages/register";
import StudentDashboard from "./pages/student-dashboard-dynamic";
import InstructorDashboard from "./pages/instructor-dashboard-dynamic";
import AdminDashboard from "./pages/admin-dashboard";
import { ProtectedRoute } from "./components/protected-route";
import { PublicRoute } from "./components/public-route";

function App() {
  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor-dashboard"
          element={
            <ProtectedRoute requiredRole="instructor">
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
