import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import ExploreTemplesPage from './components/ExploreTemplesPage';
import ServicesPage from './components/ServicesPage';
import ServiceCategoryListPage from './components/ServiceCategoryListPage';
import ServiceItemDetailsPage from './components/ServiceItemDetailsPage';
import ServiceDetailsPage from './components/ServiceDetailsPage';
import ServicePaymentSummaryPage from './components/ServicePaymentSummaryPage';
import ServiceBookingConfirmedPage from './components/ServiceBookingConfirmedPage';
import BlogDetailsPage from './components/BlogDetailsPage';
import LoginPage from './components/LoginPage';
import AboutPage from './components/AboutPage';
import QuickBookingPage from './components/QuickBookingPage';
import ContactPage from './components/ContactPage';
import UserDashboardPage from './components/UserDashboardPage';
import DateTimeWidget from './components/DateTimeWidget';
import { AuthProvider } from './context/AuthContext';
import MaintenanceGuard from './components/MaintenanceGuard';

// Admin Panel Imports
import '../admin/src/index.css';
import AdminLayout from '../admin/src/components/AdminLayout';
import RoleProtectedRoute from '../admin/src/components/RoleProtectedRoute';
import AdminLoginPage from '../admin/src/pages/LoginPage';
import AdminDashboardPage from '../admin/src/pages/DashboardPage';
import AdminWebsiteContentPage from '../admin/src/pages/WebsiteContentPage';
import AdminAboutUsPage from '../admin/src/pages/AboutUsPage';
import AdminServicesPage from '../admin/src/pages/ServicesPage';
import AdminServiceDetailsPage from '../admin/src/pages/ServiceDetailsPage';
import AdminTempleDetailsPage from '../admin/src/pages/TempleDetailsPage';
import AdminEmployeeDetailsPage from '../admin/src/pages/EmployeeDetailsPage';
import AdminTemplesPage from '../admin/src/pages/TemplesPage';
import AdminBookingsPage from '../admin/src/pages/BookingsPage';
import AdminUsersPage from '../admin/src/pages/UsersPage';
import AdminUserDetailsPage from '../admin/src/pages/UserDetailsPage';
import AdminPaymentsPage from '../admin/src/pages/PaymentsPage';
import AdminReportsPage from '../admin/src/pages/ReportsPage';
import AdminMediaPage from '../admin/src/pages/MediaPage';
import AdminManagementPage from '../admin/src/pages/AdminManagementPage';
import AdminSettingsPage from '../admin/src/pages/SettingsPage';

// Sub-Admin Dedicated Modular Views
import SubAdminRoot from '../admin/src/pages/subadmin/SubAdminRoot';
import ServiceSubAdminLayout from '../admin/src/components/ServiceSubAdminLayout';
import ServiceSubAdminDashboard from '../admin/src/pages/subadmin/ServiceSubAdminDashboard';
import ServiceDetailsView from '../admin/src/pages/subadmin/ServiceDetailsView';
import ServiceSubcategoriesView from '../admin/src/pages/subadmin/ServiceSubcategoriesView';
import ServiceBookingsView from '../admin/src/pages/subadmin/ServiceBookingsView';
import SubAdminProfileView from '../admin/src/pages/subadmin/SubAdminProfileView';

import TempleSubAdminLayout from '../admin/src/components/TempleSubAdminLayout';
import TempleSubAdminDashboard from '../admin/src/pages/subadmin/TempleSubAdminDashboard';
import TempleOverviewView from '../admin/src/pages/subadmin/TempleOverviewView';
import TempleServicesView from '../admin/src/pages/subadmin/TempleServicesView';
import TempleBookingsView from '../admin/src/pages/subadmin/TempleBookingsView';

function BlogDetailsWrapper(props) {
  const navigate = useNavigate();
  const { slug } = useParams();
  return (
    <BlogDetailsPage 
      {...props}
      slug={slug}
      onGoToHome={() => { navigate('/home'); window.scrollTo(0, 0); }}
      onGoToLanding={() => { navigate('/'); window.scrollTo(0, 0); }}
      onExploreTemples={() => { navigate('/explore'); window.scrollTo(0, 0); }}
      onGoToProducts={() => { navigate('/services'); window.scrollTo(0, 0); }}
      onGoToServices={() => { navigate('/services'); window.scrollTo(0, 0); }}
      onGoToLogin={() => { navigate('/login'); window.scrollTo(0, 0); }}
      onGoToContact={() => { navigate('/contact'); window.scrollTo(0, 0); }}
      onGoToAbout={() => { navigate('/about'); window.scrollTo(0, 0); }}
      onGoToDashboard={() => { navigate('/dashboard'); window.scrollTo(0, 0); }}
      onOpenBooking={() => { navigate('/quick-booking'); window.scrollTo(0, 0); }}
      onNavigateToBlog={(newSlug) => { navigate(`/blogs/${newSlug}`); window.scrollTo(0, 0); }}
    />
  );
}

function AppRoutes() {
  const navigate = useNavigate();

  const navProps = {
    onGoToHome: () => { navigate('/'); window.scrollTo(0, 0); },
    onGoToLanding: () => { navigate('/'); window.scrollTo(0, 0); },
    onExploreTemples: () => { navigate('/explore'); window.scrollTo(0, 0); },
    onGoToProducts: () => { navigate('/services'); window.scrollTo(0, 0); },
    onGoToServices: () => { navigate('/services'); window.scrollTo(0, 0); },
    onGoToLogin: () => { navigate('/login'); window.scrollTo(0, 0); },
    onGoToAbout: () => { navigate('/about'); window.scrollTo(0, 0); },
    onGoToContact: () => { navigate('/contact'); window.scrollTo(0, 0); },
    onGoToDashboard: () => { navigate('/dashboard'); window.scrollTo(0, 0); },
    onOpenBooking: () => { navigate('/quick-booking'); window.scrollTo(0, 0); },
  };

  return (
    <Routes>
      {/* ─── PUBLIC DEVOTEE ROUTES ─── */}
      <Route 
        path="/" 
        element={
          <MaintenanceGuard>
            <HomePage 
              {...navProps} 
              onGoToBlog={(slug) => { navigate(`/blogs/${slug}`); window.scrollTo(0, 0); }} 
            />
          </MaintenanceGuard>
        } 
      />
      <Route 
        path="/home" 
        element={
          <MaintenanceGuard>
            <HomePage 
              {...navProps} 
              onGoToBlog={(slug) => { navigate(`/blogs/${slug}`); window.scrollTo(0, 0); }} 
            />
          </MaintenanceGuard>
        } 
      />
      <Route 
        path="/landing" 
        element={
          <MaintenanceGuard>
            <LandingPage onExplore={() => { navigate('/'); window.scrollTo(0, 0); }} />
          </MaintenanceGuard>
        } 
      />
      <Route 
        path="/explore" 
        element={
          <MaintenanceGuard>
            <ExploreTemplesPage {...navProps} />
          </MaintenanceGuard>
        } 
      />
      <Route 
        path="/services" 
        element={
          <MaintenanceGuard>
            <ServicesPage {...navProps} />
          </MaintenanceGuard>
        } 
      />
      <Route 
        path="/services/category/:slug" 
        element={
          <MaintenanceGuard>
            <ServiceCategoryListPage {...navProps} />
          </MaintenanceGuard>
        } 
      />
      <Route 
        path="/services/item/:id" 
        element={
          <MaintenanceGuard>
            <ServiceItemDetailsPage {...navProps} />
          </MaintenanceGuard>
        } 
      />
      <Route 
        path="/services/details" 
        element={
          <MaintenanceGuard>
            <ServiceDetailsPage {...navProps} />
          </MaintenanceGuard>
        } 
      />
      <Route 
        path="/services/summary" 
        element={
          <MaintenanceGuard>
            <ServicePaymentSummaryPage {...navProps} />
          </MaintenanceGuard>
        } 
      />
      <Route 
        path="/services/confirmed" 
        element={
          <MaintenanceGuard>
            <ServiceBookingConfirmedPage {...navProps} />
          </MaintenanceGuard>
        } 
      />
      <Route 
        path="/products" 
        element={
          <MaintenanceGuard>
            <ServicesPage {...navProps} />
          </MaintenanceGuard>
        } 
      />
      <Route 
        path="/about" 
        element={
          <MaintenanceGuard>
            <AboutPage {...navProps} />
          </MaintenanceGuard>
        } 
      />
      <Route 
        path="/quick-booking" 
        element={
          <MaintenanceGuard>
            <QuickBookingPage {...navProps} />
          </MaintenanceGuard>
        } 
      />
      <Route 
        path="/quick-booking/booking" 
        element={
          <MaintenanceGuard>
            <QuickBookingPage {...navProps} />
          </MaintenanceGuard>
        } 
      />
      <Route 
        path="/booking" 
        element={
          <MaintenanceGuard>
            <QuickBookingPage {...navProps} />
          </MaintenanceGuard>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <MaintenanceGuard>
            <UserDashboardPage {...navProps} />
          </MaintenanceGuard>
        } 
      />
      <Route 
        path="/login" 
        element={<LoginPage {...navProps} />} 
      />
      <Route 
        path="/contact" 
        element={
          <MaintenanceGuard>
            <ContactPage {...navProps} />
          </MaintenanceGuard>
        } 
      />
      <Route 
        path="/blogs/:slug" 
        element={
          <MaintenanceGuard>
            <BlogDetailsWrapper {...navProps} />
          </MaintenanceGuard>
        } 
      />

      {/* ─── ADMIN & SUB-ADMIN AUTHENTICATION ─── */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* ─── SUPER ADMIN DEDICATED ROUTES ─── */}
      <Route 
        path="/admin" 
        element={<AdminLayout />}
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="website-content" element={<AdminWebsiteContentPage />} />
        <Route path="about" element={<AdminAboutUsPage />} />
        
        {/* Services -> Temple -> Staff/Employee -> Assigned Work 3-Level Hierarchy */}
        <Route path="services" element={<AdminServicesPage />} />
        <Route path="services/:id" element={<AdminServiceDetailsPage />} />
        <Route path="services/profile/:profileId" element={<AdminServiceDetailsPage />} />
        <Route path="services/temple/:templeId" element={<AdminTempleDetailsPage />} />
        <Route path="services/temple/:templeId/staff" element={<AdminTempleDetailsPage />} />
        <Route path="services/temple/:templeId/employees" element={<AdminTempleDetailsPage />} />
        <Route path="services/temple/:templeId/employee/:employeeId" element={<AdminEmployeeDetailsPage />} />
        <Route path="services/temple/:templeId/staff/:employeeId" element={<AdminEmployeeDetailsPage />} />
        <Route path="services/temple/:templeId/employees/:employeeId" element={<AdminEmployeeDetailsPage />} />
        <Route path="services/temple/:templeId/person/:employeeId" element={<AdminEmployeeDetailsPage />} />
        <Route path="services/temple/:templeId/bookings" element={<AdminTempleDetailsPage />} />

        <Route path="services/temples/:templeId" element={<AdminTempleDetailsPage />} />
        <Route path="services/temples/:templeId/staff" element={<AdminTempleDetailsPage />} />
        <Route path="services/temples/:templeId/employees" element={<AdminTempleDetailsPage />} />
        <Route path="services/temples/:templeId/employee/:employeeId" element={<AdminEmployeeDetailsPage />} />
        <Route path="services/temples/:templeId/staff/:employeeId" element={<AdminEmployeeDetailsPage />} />
        <Route path="services/temples/:templeId/bookings" element={<AdminTempleDetailsPage />} />

        <Route path="temples" element={<AdminTemplesPage />} />
        <Route path="temples/:templeId" element={<AdminTempleDetailsPage />} />
        <Route path="temples/:templeId/staff" element={<AdminTempleDetailsPage />} />
        <Route path="temples/:templeId/employees" element={<AdminTempleDetailsPage />} />
        <Route path="temples/:templeId/employee/:employeeId" element={<AdminEmployeeDetailsPage />} />
        <Route path="temples/:templeId/staff/:employeeId" element={<AdminEmployeeDetailsPage />} />
        <Route path="temples/:templeId/employees/:employeeId" element={<AdminEmployeeDetailsPage />} />
        <Route path="temples/:templeId/person/:employeeId" element={<AdminEmployeeDetailsPage />} />

        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="bookings/temple/:templeId" element={<AdminBookingsPage />} />
        <Route path="bookings/temple/:templeId/booking/:bookingId" element={<AdminBookingsPage />} />
        <Route path="bookings/:bookingId" element={<AdminBookingsPage />} />
        <Route path="bookings/:id" element={<AdminBookingsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="users/:id" element={<AdminUserDetailsPage />} />
        <Route path="users/:userId" element={<AdminUserDetailsPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
        <Route path="payments/transaction/:transactionId" element={<AdminPaymentsPage />} />
        <Route path="payments/:paymentId" element={<AdminPaymentsPage />} />
        <Route path="payments/:id" element={<AdminPaymentsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="media" element={<AdminMediaPage />} />
        <Route path="sub-admin" element={<SubAdminRoot />} />
        <Route path="admin-management" element={<AdminManagementPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>

      {/* ─── SUB-ADMIN GENERAL ROOT ROUTE ─── */}
      <Route
        path="/sub-admin"
        element={
          <RoleProtectedRoute allowedRoles={['SERVICE_SUB_ADMIN', 'TEMPLE_SUB_ADMIN', 'SUB_ADMIN', 'SUPER_ADMIN']}>
            <SubAdminRoot />
          </RoleProtectedRoute>
        }
      />

      {/* ─── SERVICE SUB-ADMIN DEDICATED ROUTES ─── */}
      <Route
        path="/sub-admin/service"
        element={
          <RoleProtectedRoute allowedRoles={['SERVICE_SUB_ADMIN', 'SUPER_ADMIN']}>
            <ServiceSubAdminLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<ServiceSubAdminDashboard />} />
        <Route path="dashboard" element={<ServiceSubAdminDashboard />} />
        <Route path="details" element={<ServiceDetailsView />} />
        <Route path="subcategories" element={<ServiceSubcategoriesView />} />
        <Route path="bookings" element={<ServiceBookingsView />} />
        <Route path="profile" element={<SubAdminProfileView />} />
        <Route path="*" element={<Navigate to="/sub-admin/service/dashboard" replace />} />
      </Route>

      {/* ─── TEMPLE SUB-ADMIN DEDICATED ROUTES ─── */}
      <Route
        path="/sub-admin/temple"
        element={
          <RoleProtectedRoute allowedRoles={['TEMPLE_SUB_ADMIN', 'SUPER_ADMIN']}>
            <TempleSubAdminLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<TempleSubAdminDashboard />} />
        <Route path="dashboard" element={<TempleSubAdminDashboard />} />
        <Route path="overview" element={<TempleOverviewView />} />
        <Route path="services" element={<TempleServicesView />} />
        <Route path="bookings" element={<TempleBookingsView />} />
        <Route path="profile" element={<SubAdminProfileView />} />
        <Route path="*" element={<Navigate to="/sub-admin/temple/dashboard" replace />} />
      </Route>

      {/* ─── Fallback for unknown public routes ─── */}
      <Route 
        path="*" 
        element={<HomePage {...navProps} onGoToBlog={(slug) => { navigate(`/blogs/${slug}`); window.scrollTo(0, 0); }} />} 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <DateTimeWidget />
      </BrowserRouter>
    </AuthProvider>
  );
}
