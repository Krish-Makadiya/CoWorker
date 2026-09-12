import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import FederationDashboard from './pages/FederationDashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<Landing />} />

        {/* Registration */}
        <Route path="/register/:role" element={<RegisterPage />} />

        {/* Login */}
        <Route path="/login/:role" element={<LoginPage />} />

        {/* Dashboards */}
        <Route
          path="/dashboard/customer"
          element={
            <ProtectedRoute allowedRole="customer">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/worker"
          element={
            <ProtectedRoute allowedRole="worker">
              <WorkerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/cooperative"
          element={
            <ProtectedRoute allowedRole="cooperative">
              <FederationDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
