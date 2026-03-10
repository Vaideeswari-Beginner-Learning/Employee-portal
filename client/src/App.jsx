import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import EmployeeDashboard from './pages/employee/Dashboard';
import AttendancePage from './pages/employee/Attendance';
import ReportsPage from './pages/employee/Reports';
import LeavePage from './pages/employee/Leave';
import SettingsPage from './pages/employee/Settings';

import AdminDashboard from './pages/admin/Dashboard';
import ManagerDashboard from './pages/admin/ManagerDashboard';
import EmployeeMgmt from './pages/admin/Employees';
import AdminAttendance from './pages/admin/Attendance';
import AdminReports from './pages/admin/Reports';
import AdminLeaves from './pages/admin/Leaves';
import AttendanceHub from './pages/admin/AttendanceHub';
import FieldTracking from './pages/employee/FieldTracking';
import LiveTracker from './pages/admin/LiveTracker';
import Announcements from './pages/admin/Announcements';

// Task Management Pages
import MyTasks from './pages/employee/MyTasks';
import AdminTaskPanel from './pages/admin/TaskAdminPanel';

// Global Comms Pages
import SupportChat from './pages/employee/SupportChat';
import AdminComms from './pages/admin/AdminComms';
import ManagerComms from './pages/admin/ManagerComms';
import PerformanceHub from './pages/admin/PerformanceHub';
import HolidayManager from './pages/admin/HolidayManager';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      <Route element={<MainLayout />}>
        {/* Employee Routes */}
        <Route path="/dashboard" element={<EmployeeDashboard />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/leave" element={<LeavePage />} />
        <Route path="/field-ops" element={<FieldTracking />} />
        <Route path="/tasks" element={<MyTasks />} />
        <Route path="/support" element={<SupportChat />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/admin/employees" element={<EmployeeMgmt />} />
        <Route path="/admin/attendance" element={<AdminAttendance />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/leaves" element={<AdminLeaves />} />
        <Route path="/admin/attendance-hub" element={<AttendanceHub />} />
        <Route path="/admin/live-tracker" element={<LiveTracker />} />
        <Route path="/admin/announcements" element={<Announcements />} />
        <Route path="/admin/tasks" element={<AdminTaskPanel />} />
        <Route path="/admin/merit" element={<PerformanceHub />} />
        <Route path="/admin/comms" element={<AdminComms />} />
        <Route path="/manager/comms" element={<ManagerComms />} />
        <Route path="/admin/holidays" element={<HolidayManager />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
