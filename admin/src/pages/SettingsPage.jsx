import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Globe, Phone, Mail, MapPin, 
  Sparkles, Check, Bell, Shield, Sliders, RefreshCw, 
  AlertCircle, Users, Activity, TrendingUp, AlertTriangle,
  Server, ShieldAlert, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AVAILABLE_MODULES = [
  { key: 'dashboard', label: 'Dashboard', desc: 'Operational dashboard overview, KPIs, and recent bookings ledger' },
  { key: 'services', label: 'Services', desc: 'Temple poojas, sevas, rituals, and catalog management' },
  { key: 'bookings', label: 'Bookings', desc: 'Devotee seva reservations, status approval, and voucher ledger' },
  { key: 'temples', label: 'Temples', desc: 'Sacred temple shrines, deities, sanctum staff, and hierarchy' },
  { key: 'users', label: 'Users', desc: 'Registered devotee directory, contact profiles, and seva history' },
  { key: 'payments', label: 'Payments', desc: 'Sacred payments ledger, transaction logs, and receipts' },
  { key: 'reports', label: 'Reports', desc: 'Spiritual insights, operational statistics, and analytics' },
  { key: 'media', label: 'Media', desc: 'Media gallery assets and sacred deity imagery' },
  { key: 'website-content', label: 'Website Content', desc: 'Homepage hero banners, announcements, and darshan content' },
  { key: 'about', label: 'About Us', desc: 'Temple trust history, mission, and sacred heritage info' }
];

const PERMISSION_ACTIONS = [
  { key: 'canView', label: 'View' },
  { key: 'canCreate', label: 'Create' },
  { key: 'canEdit', label: 'Edit' },
  { key: 'canDelete', label: 'Delete' },
  { key: 'canApprove', label: 'Approve' },
  { key: 'canReject', label: 'Reject' },
  { key: 'canDownload', label: 'Download' },
  { key: 'canManage', label: 'Manage' }
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 1. General, Contact, Operations, & Website Status State
  const [formData, setFormData] = useState({
    platformName: "Darshan Journey",
    tagline: "Sacred Temple Journey, Virtual Darshan & Vedic Pilgrimage Portal",
    supportEmail: "contact@darshanjourney.com",
    supportPhone: "+91 98765 43210",
    whatsappHelpline: "+91 98765 43211",
    templeAddress: "Temple Corridor, 108 Sacred Way, Mylapore, Chennai, Tamil Nadu - 600004",
    currency: "INR (₹)",
    timezone: "Asia/Kolkata (IST +5:30)",
    autoConfirmBookings: true,
    enableSmsAlerts: true,
    enableEmailReceipts: true,
    maintenanceMode: false,
    websiteStatus: "active",
    maintenanceMessage: "Our website is currently undergoing maintenance. Please check back shortly."
  });

  // 2. Sub Admin Access Management State
  const [adminsList, setAdminsList] = useState([]);
  const [selectedAdminId, setSelectedAdminId] = useState('');
  const [subAdminAssignedModules, setSubAdminAssignedModules] = useState(['services', 'bookings']);
  const [subAdminModulePerms, setSubAdminModulePerms] = useState({});
  const [isSavingPerms, setIsSavingPerms] = useState(false);

  // 3. Workload Management State
  const [workloadCapacity, setWorkloadCapacity] = useState(50);
  const [assignedPeopleCount, setAssignedPeopleCount] = useState(35);
  const [activeTasks, setActiveTasks] = useState(20);
  const [pendingTasks, setPendingTasks] = useState(10);
  const [completedTasks, setCompletedTasks] = useState(45);
  const [isSavingWorkload, setIsSavingWorkload] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Global Settings
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          setFormData(prev => ({
            ...prev,
            ...data,
            websiteStatus: data.websiteStatus || (data.maintenanceMode ? 'maintenance' : 'active')
          }));
        }
      }

      // 2. Fetch Admins list for Access & Workload Management
      const adminsRes = await fetch('/api/admins');
      if (adminsRes.ok) {
        const admins = await adminsRes.json();
        if (Array.isArray(admins)) {
          setAdminsList(admins);
          const firstSubAdmin = admins.find(a => a.role !== 'SUPER_ADMIN' && a.role !== 'Super Admin') || admins[0];
          if (firstSubAdmin) {
            loadAdminDetails(firstSubAdmin);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Unable to load portal configuration. Please check backend server / MongoDB connection.');
    } finally {
      setLoading(false);
    }
  };

  const loadAdminDetails = (admin) => {
    setSelectedAdminId(admin.id || admin._id);
    const assigned = Array.isArray(admin.assignedModules) && admin.assignedModules.length > 0
      ? admin.assignedModules
      : ['services', 'bookings'];
    setSubAdminAssignedModules(assigned);

    // Build permissions matrix
    const perms = admin.modulePermissions || {};
    const fullPerms = {};
    AVAILABLE_MODULES.forEach(mod => {
      fullPerms[mod.key] = perms[mod.key] || {
        canView: true,
        canCreate: mod.key === 'bookings' || mod.key === 'services',
        canEdit: true,
        canDelete: false,
        canApprove: true,
        canReject: false,
        canDownload: true,
        canManage: false
      };
    });
    setSubAdminModulePerms(fullPerms);

    // Workload fields
    setWorkloadCapacity(admin.maxCapacity || 50);
    setAssignedPeopleCount(admin.assignedPeopleCount !== undefined ? admin.assignedPeopleCount : 35);
    setActiveTasks(admin.activeTasks !== undefined ? admin.activeTasks : 20);
    setPendingTasks(admin.pendingTasks !== undefined ? admin.pendingTasks : 10);
    setCompletedTasks(admin.completedTasks !== undefined ? admin.completedTasks : 45);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleAdminSelect = (id) => {
    const found = adminsList.find(a => (a.id || a._id) === id);
    if (found) {
      loadAdminDetails(found);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Save General, Contact, Operations, and Website Status
  const handleSave = async (e) => {
    e?.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        showToast('✨ Portal settings synchronized successfully!');
      } else {
        alert('Failed to save settings.');
      }
    } catch (err) {
      alert('Error updating settings: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Save Sub Admin Access Permissions
  const handleSavePermissions = async () => {
    if (!selectedAdminId) return;
    setIsSavingPerms(true);
    try {
      const res = await fetch(`/api/admins/${selectedAdminId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedModules: subAdminAssignedModules,
          modulePermissions: subAdminModulePerms
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('🛡️ Sub Admin module access & permissions updated successfully!');
        setAdminsList(prev => prev.map(a => (a.id === selectedAdminId || a._id === selectedAdminId) ? { ...a, assignedModules: subAdminAssignedModules, modulePermissions: subAdminModulePerms } : a));
      } else {
        alert(data.message || 'Failed to update Sub Admin permissions');
      }
    } catch (err) {
      alert('Error saving permissions: ' + err.message);
    } finally {
      setIsSavingPerms(false);
    }
  };

  // Save Sub Admin Workload Limits
  const handleSaveWorkload = async () => {
    if (!selectedAdminId) return;
    setIsSavingWorkload(true);
    try {
      const res = await fetch(`/api/admins/${selectedAdminId}/workload`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxCapacity: workloadCapacity,
          assignedPeopleCount,
          activeTasks,
          pendingTasks,
          completedTasks
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('📊 Sub Admin workload capacity metrics updated successfully!');
        setAdminsList(prev => prev.map(a => (a.id === selectedAdminId || a._id === selectedAdminId) ? { ...a, maxCapacity: workloadCapacity, assignedPeopleCount, activeTasks, pendingTasks, completedTasks } : a));
      } else {
        alert(data.message || 'Failed to update workload');
      }
    } catch (err) {
      alert('Error updating workload: ' + err.message);
    } finally {
      setIsSavingWorkload(false);
    }
  };

  const selectedAdmin = adminsList.find(a => (a.id || a._id) === selectedAdminId);
  const remainingCapacity = Math.max(0, workloadCapacity - assignedPeopleCount);
  const workloadPercentage = workloadCapacity > 0 ? Math.min(100, Math.round((assignedPeopleCount / workloadCapacity) * 100)) : 100;
  const isOverCapacity = assignedPeopleCount >= workloadCapacity;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 9999,
              backgroundColor: 'var(--admin-bg-sidebar)',
              border: '1px solid var(--admin-gold)',
              color: '#FFFDF9',
              padding: '0.85rem 1.4rem',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.9rem'
            }}
          >
            <Sparkles size={16} style={{ color: 'var(--admin-gold)' }} />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="serif-title" style={{ fontSize: '1.6rem', color: '#FFFDF9', marginBottom: '0.2rem' }}>
            Global Portal Settings
          </h2>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
            Configure website metadata, support contact channels, operational notifications, Sub Admin access, workload capacity, and website status.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            background: 'linear-gradient(135deg, var(--admin-primary-brown), var(--admin-gold))',
            border: '1px solid var(--admin-gold)',
            color: '#FFFDF9',
            padding: '0.6rem 1.5rem',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 15px rgba(200, 155, 75, 0.3)'
          }}
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {/* Tab Navigation (Existing 3 Tabs + 3 Extended Sections) */}
      <div className="glassmorphism" style={{ padding: '0.5rem', borderRadius: '10px', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', width: 'fit-content' }}>
        {[
          { id: 'general', label: 'Platform Information', icon: Globe },
          { id: 'contact', label: 'Contact & Helplines', icon: Phone },
          { id: 'operations', label: 'Operations & Alerts', icon: Sliders },
          { id: 'subadmin-access', label: 'Sub Admin Access Management', icon: Shield },
          { id: 'workload', label: 'Workload Management', icon: Activity },
          { id: 'website-status', label: 'Website Status', icon: Server }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1.1rem',
                borderRadius: '6px',
                border: isActive ? '1px solid var(--admin-gold)' : 'none',
                backgroundColor: isActive ? 'rgba(200, 155, 75, 0.2)' : 'transparent',
                color: isActive ? '#FFFDF9' : 'var(--admin-text-muted)',
                fontWeight: isActive ? '600' : 'normal',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={15} style={{ color: isActive ? 'var(--admin-gold)' : 'inherit' }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Error Banner */}
      {error && (
        <div
          style={{
            backgroundColor: 'rgba(192, 90, 78, 0.15)',
            border: '1px solid rgba(192, 90, 78, 0.4)',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            color: '#FFFDF9'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={24} style={{ color: 'var(--admin-danger)', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Database Connection Alert</div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)' }}>{error}</div>
            </div>
          </div>
          <button
            onClick={fetchSettings}
            style={{
              backgroundColor: 'rgba(192, 90, 78, 0.3)',
              border: '1px solid rgba(192, 90, 78, 0.6)',
              color: '#FFFDF9',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.82rem',
              whiteSpace: 'nowrap'
            }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && !error && (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--admin-gold)' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ fontSize: '0.9rem', color: 'var(--admin-text-muted)' }}>Loading portal settings from MongoDB...</p>
        </div>
      )}

      {/* Tab Panels */}
      {!loading && (
        <div>
          {/* ========================================================================= */}
          {/* TAB 1: GENERAL PLATFORM INFO (EXISTING) */}
          {/* ========================================================================= */}
          {activeTab === 'general' && (
            <div className="glassmorphism" style={{ padding: '1.8rem', borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.18)', display: 'flex', flexDirection: 'column', gap: '1.2rem', maxWidth: '750px' }}>
              <h3 className="serif-title" style={{ fontSize: '1.15rem', color: 'var(--admin-gold)', borderBottom: '1px solid rgba(214, 181, 109, 0.15)', paddingBottom: '0.6rem' }}>
                Platform Brand & Identity
              </h3>

              <div>
                <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                  Platform Name
                </label>
                <input
                  type="text"
                  value={formData.platformName}
                  onChange={(e) => handleChange('platformName', e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                  Primary Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                    Default Currency
                  </label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                    System Timezone
                  </label>
                  <input
                    type="text"
                    value={formData.timezone}
                    onChange={(e) => handleChange('timezone', e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: CONTACT & HELPLINES (EXISTING) */}
          {/* ========================================================================= */}
          {activeTab === 'contact' && (
            <div className="glassmorphism" style={{ padding: '1.8rem', borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.18)', display: 'flex', flexDirection: 'column', gap: '1.2rem', maxWidth: '750px' }}>
              <h3 className="serif-title" style={{ fontSize: '1.15rem', color: 'var(--admin-gold)', borderBottom: '1px solid rgba(214, 181, 109, 0.15)', paddingBottom: '0.6rem' }}>
                Public Devotee Support Desk
              </h3>

              <div>
                <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                  Support Email Address
                </label>
                <input
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) => handleChange('supportEmail', e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                    Support Phone Line
                  </label>
                  <input
                    type="text"
                    value={formData.supportPhone}
                    onChange={(e) => handleChange('supportPhone', e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                    WhatsApp Helpline
                  </label>
                  <input
                    type="text"
                    value={formData.whatsappHelpline}
                    onChange={(e) => handleChange('whatsappHelpline', e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                  Sanctuary Address / Registered Office
                </label>
                <textarea
                  rows={3}
                  value={formData.templeAddress}
                  onChange={(e) => handleChange('templeAddress', e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem', lineHeight: '1.4' }}
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: OPERATIONS & ALERTS (EXISTING) */}
          {/* ========================================================================= */}
          {activeTab === 'operations' && (
            <div className="glassmorphism" style={{ padding: '1.8rem', borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.18)', display: 'flex', flexDirection: 'column', gap: '1.2rem', maxWidth: '750px' }}>
              <h3 className="serif-title" style={{ fontSize: '1.15rem', color: 'var(--admin-gold)', borderBottom: '1px solid rgba(214, 181, 109, 0.15)', paddingBottom: '0.6rem' }}>
                Operational Rules & Notifications
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid rgba(214, 181, 109, 0.1)' }}>
                  <div>
                    <strong style={{ color: '#FFFDF9', fontSize: '0.9rem', display: 'block' }}>Auto-Confirm Online Bookings</strong>
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem' }}>Automatically approve confirmed UPI transactions without manual intervention.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.autoConfirmBookings}
                    onChange={(e) => handleChange('autoConfirmBookings', e.target.checked)}
                    style={{ height: '20px', width: '20px', accentColor: 'var(--admin-gold)', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid rgba(214, 181, 109, 0.1)' }}>
                  <div>
                    <strong style={{ color: '#FFFDF9', fontSize: '0.9rem', display: 'block' }}>Email Receipts & Vouchers</strong>
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem' }}>Dispatch instant PDF sacred seva vouchers to registered devotee email IDs.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.enableEmailReceipts}
                    onChange={(e) => handleChange('enableEmailReceipts', e.target.checked)}
                    style={{ height: '20px', width: '20px', accentColor: 'var(--admin-gold)', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid rgba(214, 181, 109, 0.1)' }}>
                  <div>
                    <strong style={{ color: '#FFFDF9', fontSize: '0.9rem', display: 'block' }}>SMS Status Alerts</strong>
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem' }}>Send real-time SMS darshan reminders to devotees 2 hours before slotted pooja.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.enableSmsAlerts}
                    onChange={(e) => handleChange('enableSmsAlerts', e.target.checked)}
                    style={{ height: '20px', width: '20px', accentColor: 'var(--admin-gold)', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0' }}>
                  <div>
                    <strong style={{ color: 'var(--admin-danger)', fontSize: '0.9rem', display: 'block' }}>Portal Maintenance Mode</strong>
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem' }}>Temporarily show sacred maintenance banner to public visitors during database rituals.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.maintenanceMode}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      handleChange('maintenanceMode', checked);
                      handleChange('websiteStatus', checked ? 'maintenance' : 'active');
                    }}
                    style={{ height: '20px', width: '20px', accentColor: 'var(--admin-danger)', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: COMPLETE SUB ADMIN ACCESS MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === 'subadmin-access' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Select Sub Admin Bar */}
              <div className="glassmorphism" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.25)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', backgroundColor: 'rgba(25, 12, 10, 0.75)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
                  <div className="flex-center" style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'rgba(200, 155, 75, 0.2)', border: '1px solid var(--admin-gold)', color: 'var(--admin-gold)' }}>
                    <Shield size={22} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--admin-gold)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Select Sub Admin Account
                    </label>
                    <select
                      value={selectedAdminId}
                      onChange={(e) => handleAdminSelect(e.target.value)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'rgba(18, 9, 7, 0.9)',
                        border: '1px solid rgba(214, 181, 109, 0.4)',
                        borderRadius: '6px',
                        color: '#FFFDF9',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        marginTop: '0.2rem',
                        minWidth: '240px'
                      }}
                    >
                      {adminsList.map(a => (
                        <option key={a.id || a._id} value={a.id || a._id}>
                          {a.name} ({a.email}) — {a.role}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedAdmin && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>
                    <div>
                      <span>Assigned Location: </span>
                      <strong style={{ color: '#FFFDF9' }}>{selectedAdmin.temple || selectedAdmin.branch || 'Kapaleeshwarar Temple'}</strong>
                    </div>
                    <div>
                      <span>Status: </span>
                      <span style={{ color: selectedAdmin.status === 'Active' ? 'var(--admin-success)' : 'var(--admin-danger)', fontWeight: 'bold' }}>
                        {selectedAdmin.status || 'Active'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Module & Granular Permissions Matrix */}
              <div className="glassmorphism" style={{ padding: '1.8rem', borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(214, 181, 109, 0.15)', paddingBottom: '0.8rem' }}>
                  <div>
                    <h3 className="serif-title" style={{ fontSize: '1.25rem', color: '#FFFDF9', margin: 0 }}>
                      Sub Admin Access Management
                    </h3>
                    <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem', margin: '0.2rem 0 0 0' }}>
                      Assign or remove pages/modules and enable/disable individual actions (View, Create, Edit, Delete, Approve, Reject, Download, Manage).
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSubAdminAssignedModules(AVAILABLE_MODULES.map(m => m.key));
                        const allPerms = {};
                        AVAILABLE_MODULES.forEach(m => {
                          allPerms[m.key] = { canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canReject: true, canDownload: true, canManage: true };
                        });
                        setSubAdminModulePerms(allPerms);
                      }}
                      style={{ padding: '0.45rem 0.9rem', backgroundColor: 'rgba(200, 155, 75, 0.15)', border: '1px solid rgba(200, 155, 75, 0.4)', color: 'var(--admin-gold)', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      Grant All
                    </button>

                    <button
                      type="button"
                      onClick={handleSavePermissions}
                      disabled={isSavingPerms}
                      style={{
                        padding: '0.45rem 1.2rem',
                        backgroundColor: 'var(--admin-primary-brown)',
                        border: '1px solid var(--admin-gold)',
                        color: '#FFFDF9',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        boxShadow: '0 4px 12px rgba(200,155,75,0.25)'
                      }}
                    >
                      <Save size={14} />
                      {isSavingPerms ? 'Saving Permissions...' : 'Save Permissions'}
                    </button>
                  </div>
                </div>

                {/* Modules Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {AVAILABLE_MODULES.map(mod => {
                    const isAssigned = subAdminAssignedModules.includes(mod.key);
                    const perms = subAdminModulePerms[mod.key] || { canView: true, canEdit: true };

                    return (
                      <div 
                        key={mod.key}
                        style={{
                          backgroundColor: isAssigned ? 'rgba(200, 155, 75, 0.06)' : 'rgba(18, 9, 7, 0.4)',
                          border: isAssigned ? '1px solid rgba(200, 155, 75, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '10px',
                          padding: '1rem 1.25rem',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {/* Module Header with Toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isAssigned ? '0.8rem' : 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <input
                              type="checkbox"
                              checked={isAssigned}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setSubAdminAssignedModules(prev => 
                                  checked ? [...prev, mod.key] : prev.filter(k => k !== mod.key)
                                );
                              }}
                              style={{ width: '18px', height: '18px', accentColor: 'var(--admin-gold)', cursor: 'pointer' }}
                            />
                            <div>
                              <strong style={{ color: isAssigned ? '#FFFDF9' : 'var(--admin-text-muted)', fontSize: '0.95rem' }}>
                                {mod.label}
                              </strong>
                              <span style={{ display: 'block', color: 'var(--admin-text-muted)', fontSize: '0.76rem' }}>
                                {mod.desc}
                              </span>
                            </div>
                          </div>

                          <span 
                            style={{ 
                              fontSize: '0.72rem', 
                              padding: '0.15rem 0.55rem', 
                              borderRadius: '12px', 
                              fontWeight: 'bold',
                              backgroundColor: isAssigned ? 'rgba(142, 174, 104, 0.18)' : 'rgba(192, 90, 78, 0.15)',
                              color: isAssigned ? 'var(--admin-success)' : 'var(--admin-danger)',
                              border: isAssigned ? '1px solid rgba(142, 174, 104, 0.4)' : '1px solid rgba(192, 90, 78, 0.4)'
                            }}
                          >
                            {isAssigned ? 'MODULE ACCESS ENABLED' : 'MODULE ACCESS DISABLED'}
                          </span>
                        </div>

                        {/* Granular Checkboxes (Only shown if module access is enabled) */}
                        {isAssigned && (
                          <div 
                            style={{ 
                              display: 'grid', 
                              gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))', 
                              gap: '0.5rem', 
                              paddingTop: '0.8rem', 
                              borderTop: '1px solid rgba(214, 181, 109, 0.12)' 
                            }}
                          >
                            {PERMISSION_ACTIONS.map(act => {
                              const isChecked = !!perms[act.key];
                              return (
                                <label 
                                  key={act.key}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    padding: '0.35rem 0.6rem',
                                    borderRadius: '6px',
                                    backgroundColor: isChecked ? 'rgba(200, 155, 75, 0.15)' : 'rgba(18, 9, 7, 0.6)',
                                    border: isChecked ? '1px solid var(--admin-gold)' : '1px solid rgba(255, 255, 255, 0.08)',
                                    color: isChecked ? '#FFFDF9' : 'var(--admin-text-muted)',
                                    fontSize: '0.78rem',
                                    cursor: 'pointer',
                                    fontWeight: isChecked ? '600' : 'normal'
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      setSubAdminModulePerms(prev => ({
                                        ...prev,
                                        [mod.key]: {
                                          ...(prev[mod.key] || {}),
                                          [act.key]: checked
                                        }
                                      }));
                                    }}
                                    style={{ accentColor: 'var(--admin-gold)', cursor: 'pointer' }}
                                  />
                                  {act.label}
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: WORKLOAD MANAGEMENT & MAXIMUM PERSON CAPACITY */}
          {/* ========================================================================= */}
          {activeTab === 'workload' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Select Sub Admin Bar */}
              <div className="glassmorphism" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.25)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', backgroundColor: 'rgba(25, 12, 10, 0.75)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
                  <div className="flex-center" style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'rgba(200, 155, 75, 0.2)', border: '1px solid var(--admin-gold)', color: 'var(--admin-gold)' }}>
                    <Activity size={22} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--admin-gold)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Sub Admin Workload Profile
                    </label>
                    <select
                      value={selectedAdminId}
                      onChange={(e) => handleAdminSelect(e.target.value)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'rgba(18, 9, 7, 0.9)',
                        border: '1px solid rgba(214, 181, 109, 0.4)',
                        borderRadius: '6px',
                        color: '#FFFDF9',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        marginTop: '0.2rem',
                        minWidth: '240px'
                      }}
                    >
                      {adminsList.map(a => (
                        <option key={a.id || a._id} value={a.id || a._id}>
                          {a.name} ({a.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveWorkload}
                  disabled={isSavingWorkload}
                  style={{
                    padding: '0.6rem 1.4rem',
                    backgroundColor: 'var(--admin-primary-brown)',
                    border: '1px solid var(--admin-gold)',
                    color: '#FFFDF9',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 4px 15px rgba(200, 155, 75, 0.25)'
                  }}
                >
                  <Save size={15} />
                  {isSavingWorkload ? 'Saving Workload...' : 'Save Workload Limits'}
                </button>
              </div>

              {/* Overload Warning Banner */}
              {isOverCapacity && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    backgroundColor: 'rgba(192, 90, 78, 0.2)',
                    border: '1px solid var(--admin-danger)',
                    borderRadius: '12px',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    color: '#FFFDF9'
                  }}
                >
                  <AlertTriangle size={32} style={{ color: 'var(--admin-danger)', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '1rem', color: '#FFFDF9', display: 'block', marginBottom: '0.2rem' }}>
                      ⚠️ Maximum workload capacity reached ({assignedPeopleCount} / {workloadCapacity})
                    </strong>
                    <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)' }}>
                      Please assign this person, devotee, or booking to another Sub Admin until capacity becomes available.
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Workload Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
                
                {/* 1. People Assigned */}
                <div className="glassmorphism" style={{ padding: '1.4rem', borderRadius: '12px', border: '1px solid rgba(214, 181, 109, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Current People Assigned
                    </span>
                    <Users size={16} style={{ color: 'var(--admin-gold)' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FFFDF9', fontFamily: 'var(--font-serif)' }}>
                      {assignedPeopleCount}
                    </span>
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
                      / {workloadCapacity} allowed
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.8rem' }}>
                    <input
                      type="number"
                      min="0"
                      value={assignedPeopleCount}
                      onChange={(e) => setAssignedPeopleCount(Math.max(0, parseInt(e.target.value) || 0))}
                      style={{ width: '80px', padding: '0.3rem 0.5rem', backgroundColor: 'rgba(18,9,7,0.7)', border: '1px solid rgba(214,181,109,0.3)', borderRadius: '4px', color: '#FFFDF9', fontSize: '0.82rem' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Assigned Count</span>
                  </div>
                </div>

                {/* 2. Maximum People Allowed (Individually Editable) */}
                <div className="glassmorphism" style={{ padding: '1.4rem', borderRadius: '12px', border: '1px solid rgba(214, 181, 109, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--admin-gold)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
                      Maximum People Allowed
                    </span>
                    <Sliders size={16} style={{ color: 'var(--admin-gold)' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--admin-gold)', fontFamily: 'var(--font-serif)' }}>
                      {workloadCapacity}
                    </span>
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>people</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.8rem' }}>
                    <input
                      type="number"
                      min="1"
                      value={workloadCapacity}
                      onChange={(e) => setWorkloadCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{ width: '80px', padding: '0.3rem 0.5rem', backgroundColor: 'rgba(18,9,7,0.7)', border: '1px solid var(--admin-gold)', borderRadius: '4px', color: 'var(--admin-gold)', fontSize: '0.82rem', fontWeight: 'bold' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--admin-gold-light)' }}>Edit Max Limit</span>
                  </div>
                </div>

                {/* 3. Remaining Capacity */}
                <div className="glassmorphism" style={{ padding: '1.4rem', borderRadius: '12px', border: '1px solid rgba(214, 181, 109, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Remaining Available Capacity
                    </span>
                    <TrendingUp size={16} style={{ color: remainingCapacity > 0 ? 'var(--admin-success)' : 'var(--admin-danger)' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: remainingCapacity > 0 ? 'var(--admin-success)' : 'var(--admin-danger)', fontFamily: 'var(--font-serif)' }}>
                      {remainingCapacity}
                    </span>
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>slots open</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: remainingCapacity > 0 ? 'var(--admin-success)' : 'var(--admin-danger)', display: 'block', marginTop: '0.9rem' }}>
                    {remainingCapacity > 0 ? 'Available for new assignments' : 'Capacity full'}
                  </span>
                </div>

                {/* 4. Total Workload Indicator */}
                <div className="glassmorphism" style={{ padding: '1.4rem', borderRadius: '12px', border: '1px solid rgba(214, 181, 109, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Workload Indicator
                    </span>
                    <span style={{ fontWeight: 'bold', color: workloadPercentage >= 90 ? 'var(--admin-danger)' : (workloadPercentage >= 70 ? 'var(--admin-gold)' : 'var(--admin-success)'), fontSize: '0.9rem' }}>
                      {workloadPercentage}% Workload
                    </span>
                  </div>

                  <div style={{ height: '10px', backgroundColor: 'rgba(18, 9, 7, 0.8)', borderRadius: '6px', overflow: 'hidden', margin: '0.8rem 0 0.5rem 0', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${workloadPercentage}%`,
                        backgroundColor: workloadPercentage >= 90 ? 'var(--admin-danger)' : (workloadPercentage >= 70 ? 'var(--admin-gold)' : 'var(--admin-success)'),
                        transition: 'width 0.4s ease'
                      }} 
                    />
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                    {assignedPeopleCount} / {workloadCapacity} People Assigned
                  </span>
                </div>
              </div>

              {/* Tasks Breakdown */}
              <div className="glassmorphism" style={{ padding: '1.6rem', borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.2)' }}>
                <h3 className="serif-title" style={{ fontSize: '1.15rem', color: '#FFFDF9', marginBottom: '1rem', borderBottom: '1px solid rgba(214, 181, 109, 0.15)', paddingBottom: '0.5rem' }}>
                  Sub Admin Tasks Overview
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ backgroundColor: 'rgba(200, 155, 75, 0.08)', border: '1px solid rgba(200, 155, 75, 0.25)', borderRadius: '8px', padding: '1rem' }}>
                    <span style={{ color: 'var(--admin-gold)', fontSize: '0.78rem', fontWeight: 'bold', display: 'block', marginBottom: '0.2rem' }}>
                      ACTIVE WORK / TASKS
                    </span>
                    <input
                      type="number"
                      value={activeTasks}
                      onChange={(e) => setActiveTasks(parseInt(e.target.value) || 0)}
                      style={{ width: '80px', padding: '0.4rem', backgroundColor: 'rgba(18,9,7,0.8)', border: '1px solid rgba(214,181,109,0.3)', borderRadius: '4px', color: '#FFFDF9', fontSize: '1.2rem', fontWeight: 'bold' }}
                    />
                  </div>

                  <div style={{ backgroundColor: 'rgba(217, 160, 91, 0.08)', border: '1px solid rgba(217, 160, 91, 0.25)', borderRadius: '8px', padding: '1rem' }}>
                    <span style={{ color: '#D9A05B', fontSize: '0.78rem', fontWeight: 'bold', display: 'block', marginBottom: '0.2rem' }}>
                      PENDING WORK / TASKS
                    </span>
                    <input
                      type="number"
                      value={pendingTasks}
                      onChange={(e) => setPendingTasks(parseInt(e.target.value) || 0)}
                      style={{ width: '80px', padding: '0.4rem', backgroundColor: 'rgba(18,9,7,0.8)', border: '1px solid rgba(217,160,91,0.3)', borderRadius: '4px', color: '#FFFDF9', fontSize: '1.2rem', fontWeight: 'bold' }}
                    />
                  </div>

                  <div style={{ backgroundColor: 'rgba(142, 174, 104, 0.08)', border: '1px solid rgba(142, 174, 104, 0.25)', borderRadius: '8px', padding: '1rem' }}>
                    <span style={{ color: 'var(--admin-success)', fontSize: '0.78rem', fontWeight: 'bold', display: 'block', marginBottom: '0.2rem' }}>
                      COMPLETED WORK / TASKS
                    </span>
                    <input
                      type="number"
                      value={completedTasks}
                      onChange={(e) => setCompletedTasks(parseInt(e.target.value) || 0)}
                      style={{ width: '80px', padding: '0.4rem', backgroundColor: 'rgba(18,9,7,0.8)', border: '1px solid rgba(142,174,104,0.3)', borderRadius: '4px', color: '#FFFDF9', fontSize: '1.2rem', fontWeight: 'bold' }}
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: WEBSITE OFFICIAL STATUS & MAINTENANCE CONTROL */}
          {/* ========================================================================= */}
          {activeTab === 'website-status' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div className="glassmorphism" style={{ padding: '2rem', borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(25, 12, 10, 0.7)' }}>
                <h3 className="serif-title" style={{ fontSize: '1.3rem', color: '#FFFDF9', marginBottom: '0.4rem' }}>
                  Website Official Status
                </h3>
                <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  Control whether the official public Darshan Journey website is available or undergoing maintenance.
                </p>

                {/* Status Toggle Radio Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.2rem', marginBottom: '1.8rem' }}>
                  
                  {/* Option 1: Website Active */}
                  <div
                    onClick={() => {
                      handleChange('websiteStatus', 'active');
                      handleChange('maintenanceMode', false);
                    }}
                    style={{
                      padding: '1.4rem',
                      borderRadius: '12px',
                      border: formData.websiteStatus === 'active' ? '2px solid var(--admin-success)' : '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: formData.websiteStatus === 'active' ? 'rgba(142, 174, 104, 0.15)' : 'rgba(18, 9, 7, 0.5)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: formData.websiteStatus === 'active' ? '6px solid var(--admin-success)' : '2px solid rgba(255,255,255,0.3)', backgroundColor: '#120907', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ color: '#FFFDF9', fontSize: '1.05rem', display: 'block', marginBottom: '0.25rem' }}>
                        🟢 Website Active
                      </strong>
                      <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem', margin: 0, lineHeight: '1.4' }}>
                        The official public website works normally. Devotees can view temples, book poojas, and explore services.
                      </p>
                    </div>
                  </div>

                  {/* Option 2: Maintenance Mode */}
                  <div
                    onClick={() => {
                      handleChange('websiteStatus', 'maintenance');
                      handleChange('maintenanceMode', true);
                    }}
                    style={{
                      padding: '1.4rem',
                      borderRadius: '12px',
                      border: formData.websiteStatus === 'maintenance' ? '2px solid var(--admin-danger)' : '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: formData.websiteStatus === 'maintenance' ? 'rgba(192, 90, 78, 0.18)' : 'rgba(18, 9, 7, 0.5)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: formData.websiteStatus === 'maintenance' ? '6px solid var(--admin-danger)' : '2px solid rgba(255,255,255,0.3)', backgroundColor: '#120907', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ color: '#FFFDF9', fontSize: '1.05rem', display: 'block', marginBottom: '0.25rem' }}>
                        🔴 Temporarily Unavailable / Maintenance Mode
                      </strong>
                      <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem', margin: 0, lineHeight: '1.4' }}>
                        Public website visitors see the "We'll Be Back Soon" maintenance screen. <strong>Admin panel continues working normally.</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Maintenance Message Editor */}
                <div style={{ marginBottom: '1.8rem' }}>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>
                    Maintenance Message Notice
                  </label>
                  <textarea
                    rows={3}
                    value={formData.maintenanceMessage}
                    onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                    placeholder="Our website is currently undergoing maintenance. Please check back shortly."
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(214, 181, 109, 0.3)',
                      backgroundColor: 'rgba(18, 9, 7, 0.8)',
                      color: '#FFFDF9',
                      fontSize: '0.9rem',
                      lineHeight: '1.5'
                    }}
                  />
                </div>

                {/* Safety Callout */}
                <div style={{ backgroundColor: 'rgba(200, 155, 75, 0.1)', border: '1px solid rgba(200, 155, 75, 0.3)', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <ShieldAlert size={22} style={{ color: 'var(--admin-gold)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.84rem', color: 'var(--admin-cream)' }}>
                    <strong>Admin Routes Exemption:</strong> <code>/admin</code>, <code>/admin/login</code>, <code>/admin/dashboard</code>, and <code>/admin/settings</code> are never blocked, so administrative operations remain uninterrupted.
                  </span>
                </div>

                {/* Save Button */}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    padding: '0.65rem 1.6rem',
                    backgroundColor: formData.websiteStatus === 'maintenance' ? 'var(--admin-danger)' : 'var(--admin-primary-brown)',
                    border: '1px solid var(--admin-gold)',
                    color: '#FFFDF9',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                  }}
                >
                  <Save size={16} />
                  {isSaving ? 'Updating Status...' : `Apply ${formData.websiteStatus === 'maintenance' ? 'Maintenance Mode' : 'Live Website'} Status`}
                </button>
              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
}
