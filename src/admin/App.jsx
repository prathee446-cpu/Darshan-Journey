import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import WebsiteContentPage from './pages/WebsiteContentPage';
import AboutUsPage from './pages/AboutUsPage';
import ServicesPage from './pages/ServicesPage';
import TemplesPage from './pages/TemplesPage';
import BookingsPage from './pages/BookingsPage';
import UsersPage from './pages/UsersPage';
import PaymentsPage from './pages/PaymentsPage';
import ReportsPage from './pages/ReportsPage';
import MediaPage from './pages/MediaPage';
import AdminManagementPage from './pages/AdminManagementPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

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
          
          {/* 2. Website Content Management */}
          <Route path="website-content" element={<WebsiteContentPage />} />

          {/* 3. About Us Editorial Operations */}
          <Route path="about-us" element={<AboutUsPage />} />

          {/* 4. Services & Products Catalog */}
          <Route path="services" element={<ServicesPage />} />

          {/* 5. Sacred Temples Directory */}
          <Route path="temples" element={<TemplesPage />} />

          {/* 6. Devotee Bookings Ledger */}
          <Route path="bookings" element={<BookingsPage />} />

          {/* 7. Registered Devotees Directory */}
          <Route path="users" element={<UsersPage />} />

          {/* 8. Sacred Payments & Transactions Ledger */}
          <Route path="payments" element={<PaymentsPage />} />

          {/* 9. Spiritual Insights & Reports Analytics */}
          <Route path="reports" element={<ReportsPage />} />

          {/* 10. Media Gallery & Asset Vault */}
          <Route path="media" element={<MediaPage />} />

          {/* 11. Admin Management & Governance */}
          <Route path="admin-management" element={<AdminManagementPage />} />

          {/* 12. Global Portal Settings */}
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Redirect unknown routes to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
