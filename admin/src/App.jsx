import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import WebsiteContentPage from './pages/WebsiteContentPage';
import AboutUsPage from './pages/AboutUsPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailsPage from './pages/ServiceDetailsPage';
import TemplesPage from './pages/TemplesPage';
import TempleDetailsPage from './pages/TempleDetailsPage';
import EmployeeDetailsPage from './pages/EmployeeDetailsPage';
import BookingsPage from './pages/BookingsPage';
import UsersPage from './pages/UsersPage';
import UserDetailsPage from './pages/UserDetailsPage';
import PaymentsPage from './pages/PaymentsPage';
import ReportsPage from './pages/ReportsPage';
import MediaPage from './pages/MediaPage';
import AdminManagementPage from './pages/AdminManagementPage';
import SettingsPage from './pages/SettingsPage';
import AdminProfilePage from './pages/AdminProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Protected Dashboard & Operations Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* 1. Dashboard Overview */}
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          
          {/* 2. Website Content Management */}
          <Route path="website-content" element={<WebsiteContentPage />} />

          {/* 3. About Us Editorial Operations */}
          <Route path="about" element={<AboutUsPage />} />
          <Route path="about-us" element={<AboutUsPage />} />

          {/* 4. Services & Products Catalog */}
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/:id" element={<ServiceDetailsPage />} />
          <Route path="services/profile/:profileId" element={<ServiceDetailsPage />} />
          <Route path="services/temple/:templeId" element={<TempleDetailsPage />} />
          <Route path="services/temple/:templeId/staff" element={<TempleDetailsPage />} />
          <Route path="services/temple/:templeId/employees" element={<TempleDetailsPage />} />
          <Route path="services/temple/:templeId/employee/:employeeId" element={<EmployeeDetailsPage />} />
          <Route path="services/temple/:templeId/staff/:employeeId" element={<EmployeeDetailsPage />} />
          <Route path="services/temple/:templeId/employees/:employeeId" element={<EmployeeDetailsPage />} />
          <Route path="services/temple/:templeId/person/:employeeId" element={<EmployeeDetailsPage />} />
          <Route path="services/temple/:templeId/bookings" element={<TempleDetailsPage />} />

          {/* 5. Sacred Temples Directory */}
          <Route path="temples" element={<TemplesPage />} />
          <Route path="temples/:templeId" element={<TempleDetailsPage />} />
          <Route path="temples/:templeId/staff" element={<TempleDetailsPage />} />
          <Route path="temples/:templeId/employees" element={<TempleDetailsPage />} />
          <Route path="temples/:templeId/employee/:employeeId" element={<EmployeeDetailsPage />} />
          <Route path="temples/:templeId/staff/:employeeId" element={<EmployeeDetailsPage />} />
          <Route path="temples/:templeId/employees/:employeeId" element={<EmployeeDetailsPage />} />
          <Route path="temples/:templeId/person/:employeeId" element={<EmployeeDetailsPage />} />

          {/* 6. Devotee Bookings Ledger */}
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="bookings/temple/:templeId" element={<BookingsPage />} />
          <Route path="bookings/temple/:templeId/booking/:bookingId" element={<BookingsPage />} />
          <Route path="bookings/:bookingId" element={<BookingsPage />} />
          <Route path="bookings/:id" element={<BookingsPage />} />

          {/* 7. Registered Devotees Directory */}
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:id" element={<UserDetailsPage />} />
          <Route path="users/:userId" element={<UserDetailsPage />} />

          {/* 8. Sacred Payments & Transactions Ledger */}
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="payments/transaction/:transactionId" element={<PaymentsPage />} />
          <Route path="payments/:paymentId" element={<PaymentsPage />} />
          <Route path="payments/:id" element={<PaymentsPage />} />

          {/* 9. Spiritual Insights & Reports Analytics */}
          <Route path="reports" element={<ReportsPage />} />

          {/* 10. Media Gallery & Asset Vault */}
          <Route path="media" element={<MediaPage />} />

          {/* 11. Admin Management & Governance */}
          <Route path="admin-management" element={<AdminManagementPage />} />

          {/* 12. Global Portal Settings */}
          <Route path="settings" element={<SettingsPage />} />

          {/* 13. Dedicated Administrator Profile & Credentials */}
          <Route path="profile" element={<AdminProfilePage />} />
        </Route>

        {/* /admin Prefix Support */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="website-content" element={<WebsiteContentPage />} />
          <Route path="about" element={<AboutUsPage />} />
          <Route path="about-us" element={<AboutUsPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/:id" element={<ServiceDetailsPage />} />
          <Route path="services/profile/:profileId" element={<ServiceDetailsPage />} />
          <Route path="services/temple/:templeId" element={<TempleDetailsPage />} />
          <Route path="services/temple/:templeId/staff" element={<TempleDetailsPage />} />
          <Route path="services/temple/:templeId/employees" element={<TempleDetailsPage />} />
          <Route path="services/temple/:templeId/employee/:employeeId" element={<EmployeeDetailsPage />} />
          <Route path="services/temple/:templeId/staff/:employeeId" element={<EmployeeDetailsPage />} />
          <Route path="services/temple/:templeId/employees/:employeeId" element={<EmployeeDetailsPage />} />
          <Route path="services/temple/:templeId/person/:employeeId" element={<EmployeeDetailsPage />} />
          <Route path="services/temple/:templeId/bookings" element={<TempleDetailsPage />} />

          <Route path="temples" element={<TemplesPage />} />
          <Route path="temples/:templeId" element={<TempleDetailsPage />} />
          <Route path="temples/:templeId/staff" element={<TempleDetailsPage />} />
          <Route path="temples/:templeId/employees" element={<TempleDetailsPage />} />
          <Route path="temples/:templeId/employee/:employeeId" element={<EmployeeDetailsPage />} />
          <Route path="temples/:templeId/staff/:employeeId" element={<EmployeeDetailsPage />} />
          <Route path="temples/:templeId/employees/:employeeId" element={<EmployeeDetailsPage />} />
          <Route path="temples/:templeId/person/:employeeId" element={<EmployeeDetailsPage />} />

          <Route path="bookings" element={<BookingsPage />} />
          <Route path="bookings/temple/:templeId" element={<BookingsPage />} />
          <Route path="bookings/temple/:templeId/booking/:bookingId" element={<BookingsPage />} />
          <Route path="bookings/:bookingId" element={<BookingsPage />} />
          <Route path="bookings/:id" element={<BookingsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:id" element={<UserDetailsPage />} />
          <Route path="users/:userId" element={<UserDetailsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="payments/transaction/:transactionId" element={<PaymentsPage />} />
          <Route path="payments/:paymentId" element={<PaymentsPage />} />
          <Route path="payments/:id" element={<PaymentsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="media" element={<MediaPage />} />
          <Route path="admin-management" element={<AdminManagementPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
        </Route>

        {/* Redirect unknown routes to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
