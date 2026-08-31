import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Plus, Search, Filter, Edit3, Trash2, 
  Power, Check, X, Sparkles, AlertCircle, Eye, MapPin, Clock,
  User, Mail, Phone, Lock, Key, RefreshCw, ShieldAlert, CheckCircle2,
  SlidersHorizontal, ExternalLink, Copy, CheckCheck, Landmark, Users, ArrowRight, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUploader from '../components/ImageUploader';
import { getAuthHeaders, getCurrentUser, saveUserSession } from '../utils/auth';

export default function TemplesPage() {
  const navigate = useNavigate();
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTemple, setEditingTemple] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // 1. VIEW IN-CHARGE MODAL STATE
  const [viewingInChargeTemple, setViewingInChargeTemple] = useState(null);

  // 2. MANAGE ACCESS MODAL STATE
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [accessModalTemple, setAccessModalTemple] = useState(null);
  const [accessSaving, setAccessSaving] = useState(false);

  // 3. MANAGE LOGIN MODAL STATE
  const [isManageLoginModalOpen, setIsManageLoginModalOpen] = useState(false);
  const [manageLoginTemple, setManageLoginTemple] = useState(null);
  const [loginCopied, setLoginCopied] = useState(false);

  // 4. RESET PASSWORD MODAL STATE
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [resetPasswordTemple, setResetPasswordTemple] = useState(null);
  const [resetPasswordForm, setResetPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [resetPasswordSaving, setResetPasswordSaving] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState('');

  // 5. ASSIGN IN-CHARGE MODAL STATE
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningTemple, setAssigningTemple] = useState(null);
  const [assignInChargeForm, setAssignInChargeForm] = useState({
    name: '',
    email: '',
    phone: '',
    designation: 'Senior Temple Supervisor',
    password: '',
    status: 'Active'
  });
  const [assignSaving, setAssignSaving] = useState(false);

  const currentUser = getCurrentUser();
  const isSuper = (currentUser?.role || '').toUpperCase().includes('SUPER');

  const [formData, setFormData] = useState({
    name: '',
    location: 'Madurai, Tamil Nadu',
    district: 'Madurai',
    category: 'Amman',
    description: '',
    image: 'https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=1200&q=80',
    openingTime: '5:00 AM',
    closingTime: '9:30 PM',
    darshanTimings: 'Morning: 5:00 AM – 12:30 PM | Evening: 4:00 PM – 9:30 PM',
    dressCode: 'Traditional attire required. Men: Dhoti/Veshti. Women: Saree/Salwar.',
    events: 'Chithirai Thiruvizha, Navarathri, Float Festival',
    availability: 'Open Daily',
    status: 'Active'
  });

  const fetchTemples = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/temples', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setTemples(data);
        } else {
          setError('Invalid temple data received from server.');
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        setError(errJson.message || `Server error (${res.status}). Please check database connection.`);
      }
    } catch (err) {
      console.error('Failed to fetch temples:', err);
      setError('Unable to load temples. Please check backend connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemples();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // --- 1. VIEW IN-CHARGE HANDLER ---
  const handleOpenViewInCharge = (temple) => {
    setViewingInChargeTemple(temple);
  };

  // --- 2. MANAGE ACCESS HANDLERS ---
  const handleOpenManageAccess = (temple) => {
    setAccessModalTemple(temple);
    setIsAccessModalOpen(true);
  };

  const handleSaveAccess = async (e) => {
    e.preventDefault();
    if (!accessModalTemple || !accessModalTemple.assignedInCharge) return;
    setAccessSaving(true);
    try {
      const res = await fetch(`/api/temples/${accessModalTemple.id}/assign-incharge`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          subAdminId: accessModalTemple.assignedInCharge.id,
          name: accessModalTemple.assignedInCharge.name,
          email: accessModalTemple.assignedInCharge.email,
          phone: accessModalTemple.assignedInCharge.phone,
          designation: accessModalTemple.assignedInCharge.designation,
          status: accessModalTemple.assignedInCharge.status
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✨ Temple access confirmed for ${accessModalTemple.assignedInCharge.name}!`);
        setIsAccessModalOpen(false);
        await fetchTemples();
      } else {
        alert(data.message || 'Failed to update access');
      }
    } catch (err) {
      alert('Error updating access: ' + err.message);
    } finally {
      setAccessSaving(false);
    }
  };

  // --- 3. MANAGE LOGIN HANDLERS ---
  const handleOpenManageLogin = (temple) => {
    setManageLoginTemple(temple);
    setLoginCopied(false);
    setIsManageLoginModalOpen(true);
  };

  const handleCopyLoginEmail = (email) => {
    navigator.clipboard.writeText(email);
    setLoginCopied(true);
    showToast(`📋 Copied login email '${email}' to clipboard`);
    setTimeout(() => setLoginCopied(false), 3000);
  };

  const handleToggleInChargeStatus = async (temple) => {
    if (!temple.assignedInCharge) return;
    const newStatus = temple.assignedInCharge.status === 'Active' ? 'Suspended' : 'Active';
    try {
      const res = await fetch(`/api/temples/${temple.id}/incharge/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Account status set to ${newStatus} for ${temple.assignedInCharge.name}`);
        setIsManageLoginModalOpen(false);
        await fetchTemples();
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // --- 4. RESET PASSWORD HANDLERS ---
  const handleOpenResetPassword = (temple) => {
    setResetPasswordTemple(temple);
    setResetPasswordForm({ newPassword: '', confirmPassword: '' });
    setResetPasswordError('');
    setIsResetPasswordModalOpen(true);
  };

  const handleSaveResetPassword = async (e) => {
    e.preventDefault();
    setResetPasswordError('');

    if (!resetPasswordForm.newPassword || resetPasswordForm.newPassword.trim().length < 4) {
      setResetPasswordError('Password must be at least 4 characters.');
      return;
    }

    if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
      setResetPasswordError('Passwords do not match. Please retype carefully.');
      return;
    }

    setResetPasswordSaving(true);
    try {
      const res = await fetch(`/api/temples/${resetPasswordTemple.id}/incharge/reset-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ password: resetPasswordForm.newPassword.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✨ Password updated successfully for ${resetPasswordTemple.assignedInCharge?.name}!`);
        setIsResetPasswordModalOpen(false);
      } else {
        setResetPasswordError(data.message || 'Failed to update password');
      }
    } catch (err) {
      setResetPasswordError('Network error updating password: ' + err.message);
    } finally {
      setResetPasswordSaving(false);
    }
  };

  // --- 5. ASSIGN / CHANGE TEMPLE IN-CHARGE MULTI-STEP MODAL STATE & HANDLERS ---
  const [assignStep, setAssignStep] = useState(1);
  const [personMode, setPersonMode] = useState('existing');
  const [allUsersList, setAllUsersList] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedExistingUser, setSelectedExistingUser] = useState(null);
  const [templePermissionsConfig, setTemplePermissionsConfig] = useState({
    canManageDetails: true,
    canManageServices: true,
    canManageBookings: true,
    canPublish: true
  });

  const fetchUsersForAssignment = async () => {
    try {
      const res = await fetch('/api/users', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        const devotees = Array.isArray(data) ? data : [];
        const combined = [
          ...devotees,
          { id: 'usr-arun', name: 'Arun Kumar', email: 'arun@darshanjourney.com', phone: '+91 98402 34567', designation: 'Temple Superintendent' },
          { id: 'usr-priya', name: 'Priya Sundaram', email: 'priya@darshanjourney.com', phone: '+91 98401 23456', designation: 'Pooja Archagar & In-Charge' },
          { id: 'usr-kumar', name: 'Kumar Raj', email: 'kumar@darshanjourney.com', phone: '+91 98403 45678', designation: 'Senior Ritual Coordinator' }
        ];
        const unique = Array.from(new Map(combined.map(item => [item.email.toLowerCase(), item])).values());
        setAllUsersList(unique);
      }
    } catch (e) {
      setAllUsersList([
        { id: 'usr-arun', name: 'Arun Kumar', email: 'arun@darshanjourney.com', phone: '+91 98402 34567', designation: 'Temple Superintendent' },
        { id: 'usr-priya', name: 'Priya Sundaram', email: 'priya@darshanjourney.com', phone: '+91 98401 23456', designation: 'Pooja Archagar & In-Charge' }
      ]);
    }
  };

  const handleOpenAssignInCharge = (temple, isChange = false) => {
    setAssigningTemple(temple);
    setAssignStep(1);
    setPersonMode('existing');
    setSelectedExistingUser(null);
    fetchUsersForAssignment();

    setAssignInChargeForm({
      name: isChange && temple.assignedInCharge ? temple.assignedInCharge.name : '',
      email: isChange && temple.assignedInCharge ? temple.assignedInCharge.email : '',
      phone: isChange && temple.assignedInCharge ? (temple.assignedInCharge.phone || '') : '',
      designation: `${temple.name} Superintendent`,
      password: '',
      confirmPassword: '',
      status: 'Active'
    });

    setTemplePermissionsConfig({
      canManageDetails: true,
      canManageServices: true,
      canManageBookings: true,
      canPublish: true
    });

    setIsAssignModalOpen(true);
  };

  const handleSelectExistingUser = (user) => {
    setSelectedExistingUser(user);
    setAssignInChargeForm(prev => ({
      ...prev,
      name: user.name || user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      designation: user.designation || `${assigningTemple?.name || 'Temple'} In-Charge`
    }));
  };

  const handleSaveMultiStepInCharge = async (e) => {
    e.preventDefault();
    if (!assigningTemple) return;

    if (assignInChargeForm.password && assignInChargeForm.confirmPassword && assignInChargeForm.password !== assignInChargeForm.confirmPassword) {
      alert('Passwords do not match. Please re-enter your password.');
      return;
    }

    setAssignSaving(true);

    try {
      const res = await fetch(`/api/temples/${assigningTemple.id}/assign-incharge`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          subAdminId: selectedExistingUser?.id || null,
          name: assignInChargeForm.name,
          email: assignInChargeForm.email,
          phone: assignInChargeForm.phone,
          designation: assignInChargeForm.designation,
          password: assignInChargeForm.password || 'admin123',
          status: assignInChargeForm.status || 'Active',
          permissions: templePermissionsConfig
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || `✨ Temple In-Charge ${assignInChargeForm.name} assigned successfully!`);
        setIsAssignModalOpen(false);
        await fetchTemples();
      } else {
        alert(data.message || 'Failed to assign Temple In-Charge');
      }
    } catch (err) {
      alert('Error assigning Temple In-Charge: ' + err.message);
    } finally {
      setAssignSaving(false);
    }
  };

  const handleDirectLaunchTempleSubAdmin = async (temple) => {
    if (!temple?.assignedInCharge) return;
    try {
      const res = await fetch('/api/auth/subadmin-switch-session', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          subAdminId: temple.assignedInCharge.id,
          email: temple.assignedInCharge.email,
          templeId: temple.id
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        saveUserSession(data.token, data.user, true);
        window.location.href = data.redirectUrl || '/sub-admin/temple/dashboard';
      } else {
        alert(data.message || 'Failed to activate Sub-Admin session');
      }
    } catch (err) {
      alert('Error launching Sub-Admin session: ' + err.message);
    }
  };

  // --- TEMPLE CRUD HANDLERS ---
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      location: 'Madurai, Tamil Nadu',
      district: 'Madurai',
      category: 'Shiva',
      description: '',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
      openingTime: '6:00 AM',
      closingTime: '9:00 PM',
      darshanTimings: 'Morning: 6:00 AM – 12:30 PM | Evening: 4:00 PM – 9:00 PM',
      dressCode: 'Traditional attire required.',
      events: 'Maha Shivaratri, Annual Brahmotsavam',
      availability: 'Open Daily',
      status: 'Active'
    });
    setEditingTemple(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (temple) => {
    setEditingTemple(temple);
    setFormData({
      name: temple.name || '',
      location: temple.location || '',
      district: temple.district || '',
      category: temple.category || 'Shiva',
      description: temple.description || '',
      image: temple.image || temple.coverImage || '',
      openingTime: temple.openingTime || '6:00 AM',
      closingTime: temple.closingTime || '9:00 PM',
      darshanTimings: temple.darshanTimings || 'Morning & Evening',
      dressCode: temple.dressCode || 'Traditional attire',
      events: temple.events || 'Temple Festivals',
      availability: temple.availability || 'Open Daily',
      status: temple.status || 'Active'
    });
    setIsAddModalOpen(true);
  };

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTemple) {
        const res = await fetch(`/api/temples/${editingTemple.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          showToast(`✨ Temple '${formData.name}' updated!`);
          await fetchTemples();
          setIsAddModalOpen(false);
        } else {
          const d = await res.json().catch(() => ({}));
          alert(d.message || 'Failed to update temple');
        }
      } else {
        const res = await fetch('/api/temples', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          showToast(`🙏 New sacred temple '${formData.name}' registered!`);
          await fetchTemples();
          setIsAddModalOpen(false);
        } else {
          const d = await res.json().catch(() => ({}));
          alert(d.message || 'Failed to register temple');
        }
      }
    } catch (err) {
      alert('Error saving temple: ' + err.message);
    }
  };

  const handleToggleStatus = async (temple) => {
    const newStatus = temple.status === 'Active' ? 'Disabled' : 'Active';
    try {
      const res = await fetch(`/api/temples/${temple.id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Temple status set to ${newStatus}`);
        setTemples(prev => prev.map(t => t.id === temple.id ? { ...t, status: newStatus } : t));
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.message || 'Failed to toggle status');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/temples/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        showToast('Temple shrine deleted from directory');
        setTemples(prev => prev.filter(t => t.id !== id));
        setDeleteConfirmId(null);
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.message || 'Failed to delete temple');
      }
    } catch (err) {
      alert('Error deleting temple: ' + err.message);
    }
  };

  const filteredTemples = temples.filter(t => {
    const q = searchTerm.toLowerCase();
    return (
      (t.name || '').toLowerCase().includes(q) ||
      (t.location || '').toLowerCase().includes(q) ||
      (t.district || '').toLowerCase().includes(q) ||
      (t.assignedInCharge?.name || '').toLowerCase().includes(q) ||
      (t.assignedInCharge?.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ padding: '2rem' }}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '1.5rem',
              right: '2rem',
              backgroundColor: 'var(--admin-primary-brown)',
              border: '1px solid var(--admin-gold)',
              borderRadius: '8px',
              padding: '0.85rem 1.4rem',
              color: '#FFFDF9',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.88rem'
            }}
          >
            <Sparkles size={16} style={{ color: 'var(--admin-gold)' }} />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem' }}>
        <div>
          <h1 className="serif-title" style={{ fontSize: '1.8rem', color: '#FFFDF9', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={28} style={{ color: 'var(--admin-gold)' }} />
            Sacred Temples & Temple In-Charge Management
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem' }}>
            Temple-level governors, overall branch responsibility, shrine timings, and Sub-Admin access.
          </p>
        </div>

        {isSuper && (
          <button
            onClick={handleOpenAdd}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
          >
            <Plus size={16} />
            Register New Temple
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.8rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
          <input
            type="text"
            placeholder="Search by temple name, city, or assigned Temple In-Charge..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.6rem',
              backgroundColor: 'rgba(18, 9, 7, 0.6)',
              border: '1px solid rgba(214, 181, 109, 0.25)',
              borderRadius: '8px',
              color: '#FFFDF9',
              fontSize: '0.9rem'
            }}
          />
        </div>
      </div>

      {/* Grid of Temples */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--admin-text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          Loading sacred temples and governance...
        </div>
      ) : error ? (
        <div style={{ padding: '2rem', backgroundColor: 'rgba(192, 90, 78, 0.1)', border: '1px solid rgba(192, 90, 78, 0.3)', borderRadius: '12px', color: '#FFFDF9', textAlign: 'center' }}>
          <AlertCircle size={32} style={{ color: 'var(--admin-danger)', margin: '0 auto 0.5rem' }} />
          <p style={{ fontWeight: 'bold' }}>{error}</p>
        </div>
      ) : filteredTemples.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'rgba(18, 9, 7, 0.4)', borderRadius: '12px', border: '1px dashed rgba(214, 181, 109, 0.2)' }}>
          <ShieldCheck size={40} style={{ color: 'var(--admin-text-muted)', margin: '0 auto 1rem' }} />
          <h3 className="serif-title" style={{ color: '#FFFDF9', fontSize: '1.2rem', marginBottom: '0.4rem' }}>No Temples Found</h3>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>No temples match your current search criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
          {filteredTemples.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                backgroundColor: 'rgba(30, 16, 12, 0.7)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(214, 181, 109, 0.22)',
                borderRadius: '14px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 8px 30px rgba(0,0,0,0.35)'
              }}
            >
              <div>
                {/* Header Banner: Temple Name, Location & Status */}
                <div style={{
                  padding: '1.2rem 1.4rem',
                  borderBottom: '1px solid rgba(214, 181, 109, 0.15)',
                  backgroundColor: 'rgba(18, 9, 7, 0.5)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <Landmark size={18} style={{ color: 'var(--admin-gold)' }} />
                      <h3 className="serif-title" style={{ fontSize: '1.25rem', color: '#FFFDF9', fontWeight: 'bold' }}>
                        {t.name}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--admin-text-muted)', fontSize: '0.82rem' }}>
                      <MapPin size={12} style={{ color: 'var(--admin-gold)' }} />
                      <span>{t.location}</span>
                    </div>
                  </div>

                  <span style={{
                    backgroundColor: t.status === 'Active' ? 'rgba(74, 140, 110, 0.2)' : 'rgba(192, 90, 78, 0.2)',
                    border: t.status === 'Active' ? '1px solid var(--admin-success)' : '1px solid var(--admin-danger)',
                    color: t.status === 'Active' ? 'var(--admin-success)' : 'var(--admin-danger)',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: t.status === 'Active' ? 'var(--admin-success)' : 'var(--admin-danger)' }} />
                    {t.status === 'Active' ? 'Active' : 'Disabled'}
                  </span>
                </div>

                {/* Content */}
                <div style={{ padding: '1.2rem 1.4rem' }}>
                  {/* TEMPLE IN-CHARGE STRUCTURED SECTION */}
                  <div style={{
                    backgroundColor: t.assignedInCharge ? 'rgba(214, 181, 109, 0.06)' : 'rgba(18, 9, 7, 0.4)',
                    border: t.assignedInCharge ? '1px solid rgba(214, 181, 109, 0.25)' : '1px dashed rgba(214, 181, 109, 0.2)',
                    borderRadius: '10px',
                    padding: '1.1rem',
                    marginBottom: '1rem'
                  }}>
                    {/* Section Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', borderBottom: '1px solid rgba(214, 181, 109, 0.12)', paddingBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <ShieldCheck size={15} style={{ color: 'var(--admin-gold)' }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--admin-gold)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Temple In-Charge
                        </span>
                      </div>

                      {t.assignedInCharge && (
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '0.12rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: t.assignedInCharge.status === 'Active' ? 'rgba(74, 140, 110, 0.2)' : 'rgba(192, 90, 78, 0.2)',
                          color: t.assignedInCharge.status === 'Active' ? 'var(--admin-success)' : 'var(--admin-danger)',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: t.assignedInCharge.status === 'Active' ? 'var(--admin-success)' : 'var(--admin-danger)' }} />
                          {t.assignedInCharge.status}
                        </span>
                      )}
                    </div>

                    {t.assignedInCharge ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                        {/* Person Details */}
                        <div>
                          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#FFFDF9', marginBottom: '0.1rem' }}>
                            {t.assignedInCharge.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                            {t.assignedInCharge.designation || 'Senior Temple Supervisor'}
                          </div>
                        </div>

                        {/* Contact Details */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.25rem', fontSize: '0.78rem', color: 'var(--admin-cream)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Mail size={12} style={{ color: 'var(--admin-gold)' }} />
                            <span>{t.assignedInCharge.email}</span>
                          </div>
                          {t.assignedInCharge.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Phone size={12} style={{ color: 'var(--admin-gold)' }} />
                              <span>{t.assignedInCharge.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Sub-Admin Account & Access */}
                        <div style={{ backgroundColor: 'rgba(18, 9, 7, 0.6)', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.15)', marginTop: '0.2rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', fontSize: '0.74rem' }}>
                            <span style={{ color: 'var(--admin-text-muted)' }}>Sub-Admin Login:</span>
                            <span style={{ color: 'var(--admin-gold)', fontWeight: '600' }}>{t.assignedInCharge.email}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem' }}>
                            <span style={{ color: 'var(--admin-text-muted)' }}>Access Scope:</span>
                            <span style={{ color: '#FFFDF9' }}>{t.name}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '0.5rem 0' }}>
                        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                          Overall temple governance and branch responsibility is unassigned.
                        </p>
                        {isSuper && (
                          <button
                            onClick={() => handleOpenAssignInCharge(t)}
                            className="btn-primary"
                            style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                          >
                            <User size={13} />
                            Assign Temple In-Charge
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 4 Action Buttons when In-Charge is assigned */}
                  {t.assignedInCharge ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.45rem' }}>
                      <button
                        onClick={() => handleOpenViewInCharge(t)}
                        style={{
                          padding: '0.45rem 0.3rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(214, 181, 109, 0.3)',
                          backgroundColor: 'rgba(214, 181, 109, 0.08)',
                          color: 'var(--admin-gold)',
                          fontSize: '0.74rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Eye size={12} />
                        View In-Charge
                      </button>

                      {isSuper && (
                        <>
                          <button
                            onClick={() => handleOpenManageAccess(t)}
                            style={{
                              padding: '0.45rem 0.3rem',
                              borderRadius: '6px',
                              border: '1px solid var(--admin-gold)',
                              backgroundColor: 'rgba(214, 181, 109, 0.15)',
                              color: 'var(--admin-gold)',
                              fontSize: '0.74rem',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.3rem',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <SlidersHorizontal size={12} />
                            Manage Access
                          </button>

                          <button
                            onClick={() => handleOpenManageLogin(t)}
                            style={{
                              padding: '0.45rem 0.3rem',
                              borderRadius: '6px',
                              border: '1px solid rgba(214, 181, 109, 0.3)',
                              backgroundColor: 'rgba(18, 9, 7, 0.8)',
                              color: 'var(--admin-cream)',
                              fontSize: '0.74rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.3rem',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Lock size={12} />
                            Manage Login
                          </button>

                          <button
                            onClick={() => handleOpenAssignInCharge(t, true)}
                            style={{
                              padding: '0.45rem 0.3rem',
                              borderRadius: '6px',
                              border: '1px solid rgba(142, 174, 104, 0.4)',
                              backgroundColor: 'rgba(142, 174, 104, 0.12)',
                              color: '#8EAE68',
                              fontSize: '0.74rem',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.3rem',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <RefreshCw size={12} />
                            Change In-Charge
                          </button>
                        </>
                      )}
                    </div>
                  ) : null}

                  {/* STAFF & EMPLOYEES DIRECTORY ACTION SECTION */}
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'rgba(214, 181, 109, 0.07)',
                    border: '1px solid rgba(214, 181, 109, 0.22)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--admin-gold)' }}>
                      <Users size={15} />
                      <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#FFFDF9' }}>
                        {t.employeesCount !== undefined ? t.employeesCount : 4} Staff / Employees
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(`/admin/temples/${t.id || t._id}/staff`)}
                      style={{
                        backgroundColor: 'var(--admin-gold)',
                        color: '#120907',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.42rem 0.85rem',
                        fontSize: '0.78rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        boxShadow: '0 2px 8px rgba(214, 181, 109, 0.3)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#E5C478';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--admin-gold)';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      View Staff
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Action Footer */}
              <div style={{ padding: '0.8rem 1.4rem', borderTop: '1px solid rgba(214, 181, 109, 0.12)', backgroundColor: 'rgba(18, 9, 7, 0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => handleToggleStatus(t)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: t.status === 'Active' ? 'var(--admin-success)' : 'var(--admin-text-muted)',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    cursor: 'pointer'
                  }}
                >
                  <Power size={13} />
                  {t.status === 'Active' ? 'Temple Active' : 'Temple Disabled'}
                </button>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleOpenEdit(t)}
                    style={{
                      background: 'none',
                      border: '1px solid rgba(214, 181, 109, 0.25)',
                      color: 'var(--admin-gold)',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <Edit3 size={12} />
                    Edit
                  </button>

                  {isSuper && (
                    <button
                      onClick={() => setDeleteConfirmId(t.id)}
                      style={{
                        background: 'none',
                        border: '1px solid rgba(192, 90, 78, 0.3)',
                        color: 'var(--admin-danger)',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. VIEW IN-CHARGE DETAILED MODAL                                           */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {viewingInChargeTemple && viewingInChargeTemple.assignedInCharge && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(6px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}
            onClick={() => setViewingInChargeTemple(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              style={{
                backgroundColor: 'var(--admin-bg-deep)',
                border: '1px solid var(--admin-gold)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '600px',
                padding: '2rem',
                boxShadow: '0 20px 60px rgba(0,0,0,0.85)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setViewingInChargeTemple(null)}
                style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'none', border: 'none', color: '#FFFDF9', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                <ShieldCheck size={24} style={{ color: 'var(--admin-gold)' }} />
                <h3 className="serif-title" style={{ fontSize: '1.35rem', color: '#FFFDF9' }}>
                  Temple In-Charge Details
                </h3>
              </div>
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem', marginBottom: '1.4rem' }}>
                Overall temple governor profile and branch scope for <strong>{viewingInChargeTemple.name}</strong>.
              </p>

              {/* Profile Card */}
              <div style={{ backgroundColor: 'rgba(18, 9, 7, 0.6)', border: '1px solid rgba(214, 181, 109, 0.2)', borderRadius: '10px', padding: '1.2rem', marginBottom: '1.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#FFFDF9', marginBottom: '0.15rem' }}>
                      {viewingInChargeTemple.assignedInCharge.name}
                    </h4>
                    <span style={{ color: 'var(--admin-gold)', fontSize: '0.82rem', fontWeight: '600' }}>
                      {viewingInChargeTemple.assignedInCharge.designation || 'Senior Temple Supervisor'}
                    </span>
                  </div>
                  <span style={{
                    backgroundColor: viewingInChargeTemple.assignedInCharge.status === 'Active' ? 'rgba(74, 140, 110, 0.2)' : 'rgba(192, 90, 78, 0.2)',
                    border: viewingInChargeTemple.assignedInCharge.status === 'Active' ? '1px solid var(--admin-success)' : '1px solid var(--admin-danger)',
                    color: viewingInChargeTemple.assignedInCharge.status === 'Active' ? 'var(--admin-success)' : 'var(--admin-danger)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.74rem',
                    fontWeight: 'bold'
                  }}>
                    🟢 {viewingInChargeTemple.assignedInCharge.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', fontSize: '0.82rem', borderTop: '1px solid rgba(214, 181, 109, 0.1)', paddingTop: '0.8rem' }}>
                  <div>
                    <span style={{ color: 'var(--admin-text-muted)', display: 'block', fontSize: '0.74rem' }}>Login Email / Username</span>
                    <strong style={{ color: '#FFFDF9' }}>{viewingInChargeTemple.assignedInCharge.email}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--admin-text-muted)', display: 'block', fontSize: '0.74rem' }}>Phone Number</span>
                    <strong style={{ color: '#FFFDF9' }}>{viewingInChargeTemple.assignedInCharge.phone || 'Not Specified'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--admin-text-muted)', display: 'block', fontSize: '0.74rem' }}>Temple Assignment</span>
                    <strong style={{ color: 'var(--admin-gold)' }}>{viewingInChargeTemple.name}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--admin-text-muted)', display: 'block', fontSize: '0.74rem' }}>District / Branch</span>
                    <strong style={{ color: '#FFFDF9' }}>{viewingInChargeTemple.district || viewingInChargeTemple.location}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    const t = viewingInChargeTemple;
                    setViewingInChargeTemple(null);
                    handleOpenManageLogin(t);
                  }}
                  style={{
                    padding: '0.6rem 1.1rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(214, 181, 109, 0.3)',
                    backgroundColor: 'rgba(18, 9, 7, 0.8)',
                    color: 'var(--admin-gold)',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Lock size={14} /> Manage Login
                </button>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  {isSuper && (
                    <button
                      onClick={() => {
                        const t = viewingInChargeTemple;
                        setViewingInChargeTemple(null);
                        handleOpenManageAccess(t);
                      }}
                      className="btn-primary"
                      style={{ padding: '0.6rem 1.2rem', fontSize: '0.82rem' }}
                    >
                      <SlidersHorizontal size={14} /> Manage Access
                    </button>
                  )}
                  <button
                    onClick={() => setViewingInChargeTemple(null)}
                    style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', background: 'transparent', color: 'var(--admin-text-muted)', cursor: 'pointer' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 2. MANAGE ACCESS MODAL                                                    */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAccessModalOpen && accessModalTemple && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(6px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}
            onClick={() => setIsAccessModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              style={{
                backgroundColor: 'var(--admin-bg-deep)',
                border: '1px solid var(--admin-gold)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '560px',
                padding: '2rem',
                boxShadow: '0 20px 60px rgba(0,0,0,0.85)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsAccessModalOpen(false)}
                style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'none', border: 'none', color: '#FFFDF9', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                <SlidersHorizontal size={22} style={{ color: 'var(--admin-gold)' }} />
                <h3 className="serif-title" style={{ fontSize: '1.35rem', color: '#FFFDF9' }}>
                  Manage Temple Access
                </h3>
              </div>
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem', marginBottom: '1.4rem' }}>
                Manage overall branch and temple governance scope for <strong>{accessModalTemple.assignedInCharge?.name}</strong>.
              </p>

              <form onSubmit={handleSaveAccess} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div style={{ backgroundColor: 'rgba(18, 9, 7, 0.65)', border: '1px solid rgba(214, 181, 109, 0.2)', borderRadius: '8px', padding: '1rem', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--admin-text-muted)' }}>Assigned Temple:</span>
                    <strong style={{ color: 'var(--admin-gold)' }}>{accessModalTemple.name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--admin-text-muted)' }}>District / Branch:</span>
                    <strong style={{ color: '#FFFDF9' }}>{accessModalTemple.district || accessModalTemple.location}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--admin-text-muted)' }}>Scope Level:</span>
                    <span style={{ color: 'var(--admin-success)', fontWeight: 'bold' }}>Overall Temple Governance</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsAccessModalOpen(false)}
                    style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', background: 'transparent', color: 'var(--admin-text-muted)', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={accessSaving}
                    style={{
                      padding: '0.6rem 1.6rem',
                      borderRadius: '6px',
                      border: '1px solid var(--admin-gold)',
                      background: 'linear-gradient(135deg, var(--admin-primary-brown), var(--admin-gold))',
                      color: '#FFFDF9',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {accessSaving ? 'Saving...' : 'Save Access'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 3. MANAGE LOGIN MODAL                                                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isManageLoginModalOpen && manageLoginTemple && manageLoginTemple.assignedInCharge && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(6px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}
            onClick={() => setIsManageLoginModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              style={{
                backgroundColor: 'var(--admin-bg-deep)',
                border: '1px solid var(--admin-gold)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '580px',
                padding: '2rem',
                boxShadow: '0 20px 60px rgba(0,0,0,0.85)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsManageLoginModalOpen(false)}
                style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'none', border: 'none', color: '#FFFDF9', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                <ShieldCheck size={22} style={{ color: 'var(--admin-gold)' }} />
                <h3 className="serif-title" style={{ fontSize: '1.35rem', color: '#FFFDF9' }}>
                  Temple Sub-Admin Account Management
                </h3>
              </div>

              {/* Account Credentials Display Box */}
              <div style={{ backgroundColor: 'rgba(18, 9, 7, 0.75)', border: '1px solid rgba(214, 181, 109, 0.25)', borderRadius: '10px', padding: '1.25rem', margin: '1rem 0 1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', fontSize: '0.84rem' }}>
                  <div>
                    <span style={{ color: 'var(--admin-text-muted)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase' }}>Person</span>
                    <strong style={{ color: '#FFFDF9', fontSize: '0.95rem' }}>{manageLoginTemple.assignedInCharge.name}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--admin-text-muted)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase' }}>Role</span>
                    <strong style={{ color: '#8EAE68', fontSize: '0.88rem' }}>Temple Sub-Admin</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--admin-text-muted)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase' }}>Assigned Temple</span>
                    <strong style={{ color: '#FFFDF9' }}>{manageLoginTemple.name}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--admin-text-muted)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase' }}>District / City</span>
                    <strong style={{ color: '#FFFDF9' }}>{manageLoginTemple.district || manageLoginTemple.location || 'Tamil Nadu'}</strong>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(214, 181, 109, 0.15)', paddingTop: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <div>
                      <span style={{ color: 'var(--admin-text-muted)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase' }}>Login Email</span>
                      <strong style={{ color: 'var(--admin-gold)', fontSize: '0.92rem' }}>{manageLoginTemple.assignedInCharge.email}</strong>
                    </div>
                    <button
                      onClick={() => handleCopyLoginEmail(manageLoginTemple.assignedInCharge.email)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '4px',
                        border: '1px solid rgba(214, 181, 109, 0.3)',
                        backgroundColor: 'rgba(214, 181, 109, 0.1)',
                        color: 'var(--admin-gold)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      {loginCopied ? <CheckCheck size={13} /> : <Copy size={13} />}
                      {loginCopied ? 'Copied' : 'Copy Email'}
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginTop: '0.6rem' }}>
                    <div>
                      <span style={{ color: 'var(--admin-text-muted)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase' }}>Account Status</span>
                      <span style={{
                        color: manageLoginTemple.assignedInCharge.status === 'Active' ? '#8EAE68' : 'var(--admin-danger)',
                        fontWeight: 'bold',
                        fontSize: '0.82rem'
                      }}>
                        🟢 {manageLoginTemple.assignedInCharge.status || 'Active'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--admin-text-muted)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase' }}>Login Destination</span>
                      <span style={{ color: 'var(--admin-gold)', fontWeight: '600', fontSize: '0.8rem' }}>
                        Temple Sub-Admin Dashboard
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button
                    onClick={() => {
                      const t = manageLoginTemple;
                      setIsManageLoginModalOpen(false);
                      handleOpenResetPassword(t);
                    }}
                    style={{
                      padding: '0.6rem 1.1rem',
                      borderRadius: '6px',
                      border: '1px solid var(--admin-gold)',
                      backgroundColor: 'rgba(214, 181, 109, 0.15)',
                      color: 'var(--admin-gold)',
                      fontSize: '0.82rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Key size={14} /> Reset Password
                  </button>

                  <button
                    onClick={() => handleToggleInChargeStatus(manageLoginTemple)}
                    style={{
                      padding: '0.6rem 1rem',
                      borderRadius: '6px',
                      border: '1px solid rgba(192, 90, 78, 0.35)',
                      backgroundColor: 'transparent',
                      color: manageLoginTemple.assignedInCharge.status === 'Active' ? 'var(--admin-danger)' : 'var(--admin-success)',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Power size={14} /> {manageLoginTemple.assignedInCharge.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                  </button>
                </div>

                <button
                  onClick={() => handleDirectLaunchTempleSubAdmin(manageLoginTemple)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '6px',
                    border: '1px solid #8EAE68',
                    backgroundColor: '#8EAE68',
                    color: '#120907',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem'
                  }}
                >
                  <ExternalLink size={14} /> Open Sub-Admin Login
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 4. RESET PASSWORD CONFIRMATION MODAL                                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isResetPasswordModalOpen && resetPasswordTemple && resetPasswordTemple.assignedInCharge && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(6px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}
            onClick={() => setIsResetPasswordModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              style={{
                backgroundColor: 'var(--admin-bg-deep)',
                border: '1px solid var(--admin-gold)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '480px',
                padding: '2rem',
                boxShadow: '0 20px 60px rgba(0,0,0,0.85)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsResetPasswordModalOpen(false)}
                style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'none', border: 'none', color: '#FFFDF9', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                <Key size={22} style={{ color: 'var(--admin-gold)' }} />
                <h3 className="serif-title" style={{ fontSize: '1.35rem', color: '#FFFDF9' }}>
                  Reset Sub-Admin Password
                </h3>
              </div>

              <div style={{ backgroundColor: 'rgba(18, 9, 7, 0.6)', border: '1px solid rgba(214, 181, 109, 0.2)', borderRadius: '8px', padding: '0.9rem', margin: '0.8rem 0 1.2rem', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ color: 'var(--admin-text-muted)' }}>Person:</span>
                  <strong style={{ color: '#FFFDF9' }}>{resetPasswordTemple.assignedInCharge.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--admin-text-muted)' }}>Login Email:</span>
                  <strong style={{ color: 'var(--admin-gold)' }}>{resetPasswordTemple.assignedInCharge.email}</strong>
                </div>
              </div>

              {resetPasswordError && (
                <div style={{ padding: '0.7rem', backgroundColor: 'rgba(192, 90, 78, 0.15)', border: '1px solid rgba(192, 90, 78, 0.4)', borderRadius: '6px', color: 'var(--admin-danger)', fontSize: '0.82rem', marginBottom: '1rem' }}>
                  {resetPasswordError}
                </div>
              )}

              <form onSubmit={handleSaveResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new sub-admin password"
                    value={resetPasswordForm.newPassword}
                    onChange={(e) => setResetPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    value={resetPasswordForm.confirmPassword}
                    onChange={(e) => setResetPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '0.6rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsResetPasswordModalOpen(false)}
                    style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', background: 'transparent', color: 'var(--admin-text-muted)', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={resetPasswordSaving}
                    style={{
                      padding: '0.6rem 1.5rem',
                      borderRadius: '6px',
                      border: '1px solid var(--admin-gold)',
                      background: 'linear-gradient(135deg, var(--admin-primary-brown), var(--admin-gold))',
                      color: '#FFFDF9',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {resetPasswordSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 5. MULTI-STEP ASSIGN / CHANGE TEMPLE IN-CHARGE WIZARD                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAssignModalOpen && assigningTemple && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(6px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}
            onClick={() => setIsAssignModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              style={{
                backgroundColor: 'var(--admin-bg-deep)',
                border: '1px solid var(--admin-gold)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '640px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '2rem',
                boxShadow: '0 20px 60px rgba(0,0,0,0.85)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsAssignModalOpen(false)}
                style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'none', border: 'none', color: '#FFFDF9', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                <ShieldCheck size={22} style={{ color: 'var(--admin-gold)' }} />
                <h3 className="serif-title" style={{ fontSize: '1.35rem', color: '#FFFDF9' }}>
                  Assign Temple In-Charge
                </h3>
              </div>
              <p style={{ color: 'var(--admin-gold)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                {assigningTemple.name} &nbsp;·&nbsp; {assigningTemple.district || assigningTemple.location}
              </p>

              {/* 3-Step Progress Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.75rem', position: 'relative' }}>
                {[
                  { step: 1, label: '1. Person' },
                  { step: 2, label: '2. Sub-Admin Account' },
                  { step: 3, label: '3. Temple Permissions' }
                ].map((s) => (
                  <div 
                    key={s.step} 
                    style={{ 
                      flex: 1, 
                      textAlign: 'center',
                      cursor: s.step < assignStep ? 'pointer' : 'default'
                    }}
                    onClick={() => { if (s.step < assignStep) setAssignStep(s.step); }}
                  >
                    <div 
                      style={{
                        height: '28px',
                        width: '28px',
                        borderRadius: '50%',
                        margin: '0 auto 0.3rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        backgroundColor: assignStep === s.step ? 'var(--admin-gold)' : (assignStep > s.step ? '#8EAE68' : 'rgba(214, 181, 109, 0.15)'),
                        color: assignStep === s.step ? '#120907' : (assignStep > s.step ? '#120907' : 'var(--admin-text-muted)'),
                        border: assignStep >= s.step ? 'none' : '1px solid rgba(214, 181, 109, 0.3)'
                      }}
                    >
                      {assignStep > s.step ? '✓' : s.step}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: assignStep >= s.step ? '#FFFDF9' : 'var(--admin-text-muted)', fontWeight: assignStep === s.step ? '700' : '500' }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* STEP 1: SELECT PERSON */}
              {assignStep === 1 && (
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <button
                      type="button"
                      onClick={() => setPersonMode('existing')}
                      style={{
                        flex: 1,
                        padding: '0.6rem',
                        borderRadius: '6px',
                        border: personMode === 'existing' ? '1px solid var(--admin-gold)' : '1px solid rgba(214, 181, 109, 0.2)',
                        backgroundColor: personMode === 'existing' ? 'rgba(200, 155, 75, 0.15)' : 'transparent',
                        color: personMode === 'existing' ? 'var(--admin-gold)' : 'var(--admin-text-muted)',
                        fontWeight: '600',
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      Select Existing User
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPersonMode('new');
                        setSelectedExistingUser(null);
                      }}
                      style={{
                        flex: 1,
                        padding: '0.6rem',
                        borderRadius: '6px',
                        border: personMode === 'new' ? '1px solid var(--admin-gold)' : '1px solid rgba(214, 181, 109, 0.2)',
                        backgroundColor: personMode === 'new' ? 'rgba(200, 155, 75, 0.15)' : 'transparent',
                        color: personMode === 'new' ? 'var(--admin-gold)' : 'var(--admin-text-muted)',
                        fontWeight: '600',
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      + Create New Person
                    </button>
                  </div>

                  {personMode === 'existing' ? (
                    <div>
                      <input
                        type="text"
                        placeholder="Search person (e.g. Arun Kumar, Priya, Kumar)..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '0.75rem' }}
                      />

                      <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem' }}>
                        {allUsersList
                          .filter(u => (u.name || '').toLowerCase().includes(userSearchTerm.toLowerCase()) || (u.email || '').toLowerCase().includes(userSearchTerm.toLowerCase()))
                          .map(u => (
                            <div
                              key={u.id || u.email}
                              onClick={() => handleSelectExistingUser(u)}
                              style={{
                                padding: '0.75rem',
                                borderRadius: '6px',
                                border: selectedExistingUser?.email === u.email ? '1px solid #8EAE68' : '1px solid rgba(214, 181, 109, 0.15)',
                                backgroundColor: selectedExistingUser?.email === u.email ? 'rgba(142, 174, 104, 0.15)' : 'rgba(18, 9, 7, 0.4)',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <div>
                                <div style={{ fontWeight: '600', color: '#FFFDF9', fontSize: '0.88rem' }}>{u.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{u.email} &nbsp;·&nbsp; {u.phone || 'No phone'}</div>
                              </div>
                              {selectedExistingUser?.email === u.email && (
                                <span style={{ color: '#8EAE68', fontWeight: '700', fontSize: '0.8rem' }}>Selected ✓</span>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-cream)', marginBottom: '0.3rem' }}>Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Arun Kumar"
                          value={assignInChargeForm.name}
                          onChange={(e) => setAssignInChargeForm(prev => ({ ...prev, name: e.target.value }))}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', fontSize: '0.88rem' }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-cream)', marginBottom: '0.3rem' }}>Email Address *</label>
                          <input
                            type="email"
                            required
                            placeholder="arun@darshanjourney.com"
                            value={assignInChargeForm.email}
                            onChange={(e) => setAssignInChargeForm(prev => ({ ...prev, email: e.target.value }))}
                            style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', fontSize: '0.88rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-cream)', marginBottom: '0.3rem' }}>Contact Phone</label>
                          <input
                            type="tel"
                            placeholder="+91 98402 34567"
                            value={assignInChargeForm.phone}
                            onChange={(e) => setAssignInChargeForm(prev => ({ ...prev, phone: e.target.value }))}
                            style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', fontSize: '0.88rem' }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-cream)', marginBottom: '0.3rem' }}>Designation</label>
                        <input
                          type="text"
                          placeholder="Temple Superintendent"
                          value={assignInChargeForm.designation}
                          onChange={(e) => setAssignInChargeForm(prev => ({ ...prev, designation: e.target.value }))}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', fontSize: '0.88rem' }}
                        />
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => setIsAssignModalOpen(false)}
                      style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', background: 'transparent', color: 'var(--admin-text-muted)', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!assignInChargeForm.name || !assignInChargeForm.email}
                      onClick={() => setAssignStep(2)}
                      style={{
                        padding: '0.6rem 1.5rem',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#8EAE68',
                        color: '#120907',
                        fontWeight: '700',
                        cursor: (!assignInChargeForm.name || !assignInChargeForm.email) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Continue to Account →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: CREATE TEMPLE SUB-ADMIN ACCOUNT */}
              {assignStep === 2 && (
                <div>
                  <div style={{ backgroundColor: 'rgba(18, 9, 7, 0.6)', border: '1px solid rgba(214, 181, 109, 0.2)', borderRadius: '8px', padding: '0.9rem', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Selected In-Charge</span>
                    <div style={{ fontWeight: '700', color: '#FFFDF9', fontSize: '0.95rem' }}>{assignInChargeForm.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--admin-gold)' }}>Role: Temple Sub-Admin ({assigningTemple.name})</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-cream)', marginBottom: '0.3rem' }}>Login Email *</label>
                      <input
                        type="email"
                        required
                        value={assignInChargeForm.email}
                        onChange={(e) => setAssignInChargeForm(prev => ({ ...prev, email: e.target.value }))}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-cream)', marginBottom: '0.3rem' }}>Initial Password</label>
                        <input
                          type="password"
                          placeholder="•••••••• (default: admin123)"
                          value={assignInChargeForm.password}
                          onChange={(e) => setAssignInChargeForm(prev => ({ ...prev, password: e.target.value }))}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', fontSize: '0.88rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-cream)', marginBottom: '0.3rem' }}>Confirm Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={assignInChargeForm.confirmPassword}
                          onChange={(e) => setAssignInChargeForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', fontSize: '0.88rem' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-cream)', marginBottom: '0.3rem' }}>Account Status</label>
                      <select
                        value={assignInChargeForm.status}
                        onChange={(e) => setAssignInChargeForm(prev => ({ ...prev, status: e.target.value }))}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', fontSize: '0.88rem', backgroundColor: 'rgba(18, 9, 7, 0.7)' }}
                      >
                        <option value="Active">Active 🟢</option>
                        <option value="Suspended">Suspended 🔴</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => setAssignStep(1)}
                      style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', background: 'transparent', color: 'var(--admin-text-muted)', cursor: 'pointer' }}
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignStep(3)}
                      style={{ padding: '0.6rem 1.5rem', borderRadius: '6px', border: 'none', backgroundColor: '#8EAE68', color: '#120907', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Configure Scope & Permissions →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: ASSIGN TEMPLE SCOPE & PERMISSIONS */}
              {assignStep === 3 && (
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--admin-gold)', fontWeight: '600' }}>
                      Temple Governance Scope for {assigningTemple.name}:
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', margin: '0.2rem 0 0' }}>
                      This Sub-Admin will have operational control scoped strictly to this temple only.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1.5rem' }}>
                    {[
                      { key: 'canManageDetails', label: 'Manage History & Timings' },
                      { key: 'canManageServices', label: 'Manage Temple Services' },
                      { key: 'canManageBookings', label: 'Oversee Temple Bookings' },
                      { key: 'canPublish', label: 'Publish Temple Announcements' }
                    ].map(p => (
                      <label
                        key={p.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.6rem 0.75rem',
                          borderRadius: '6px',
                          backgroundColor: templePermissionsConfig[p.key] ? 'rgba(142, 174, 104, 0.15)' : 'rgba(18, 9, 7, 0.4)',
                          border: templePermissionsConfig[p.key] ? '1px solid #8EAE68' : '1px solid rgba(214, 181, 109, 0.15)',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          color: templePermissionsConfig[p.key] ? '#FFFDF9' : 'var(--admin-text-muted)'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={templePermissionsConfig[p.key]}
                          onChange={(e) => setTemplePermissionsConfig({ ...templePermissionsConfig, [p.key]: e.target.checked })}
                          style={{ accentColor: '#8EAE68' }}
                        />
                        <span>{p.label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Summary Card */}
                  <div style={{ backgroundColor: 'rgba(18, 9, 7, 0.6)', border: '1px solid rgba(214, 181, 109, 0.2)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.25rem', fontSize: '0.78rem' }}>
                    <div style={{ color: 'var(--admin-gold)', fontWeight: '700', marginBottom: '0.3rem' }}>Assignment Summary:</div>
                    <div style={{ color: '#FFFDF9' }}>👤 Person: <strong>{assignInChargeForm.name}</strong> ({assignInChargeForm.email})</div>
                    <div style={{ color: '#FFFDF9' }}>🛕 Assigned Temple: <strong>{assigningTemple.name}</strong></div>
                    <div style={{ color: '#FFFDF9' }}>📍 Scope: <strong>Exclusively {assigningTemple.name}</strong> (No access to other temples or global settings)</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button
                      type="button"
                      onClick={() => setAssignStep(2)}
                      style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', background: 'transparent', color: 'var(--admin-text-muted)', cursor: 'pointer' }}
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      disabled={assignSaving}
                      onClick={handleSaveMultiStepInCharge}
                      style={{
                        padding: '0.65rem 1.75rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #8EAE68, var(--admin-gold))',
                        color: '#120907',
                        fontWeight: '800',
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                      }}
                    >
                      {assignSaving ? 'Assigning...' : 'Create & Assign In-Charge'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD / EDIT TEMPLE MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(5px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}
            onClick={() => setIsAddModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              style={{
                backgroundColor: 'var(--admin-bg-deep)',
                border: '1px solid var(--admin-gold)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '680px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '2rem',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'none', border: 'none', color: '#FFFDF9', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <h3 className="serif-title" style={{ fontSize: '1.3rem', color: '#FFFDF9', marginBottom: '1.5rem', borderBottom: '1px solid rgba(214, 181, 109, 0.2)', paddingBottom: '0.8rem' }}>
                {editingTemple ? 'Edit Temple Details' : 'Register New Temple Shrine'}
              </h3>

              <form onSubmit={handleSaveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                    Temple Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Meenakshi Sundareswarar Temple"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                      Location / Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g. Madurai, Tamil Nadu"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                      Deity Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.8)', color: '#FFFDF9', fontSize: '0.88rem' }}
                    >
                      <option value="Shiva">Shiva (Jyotirlinga & Paadal Petra)</option>
                      <option value="Amman">Amman / Shakti Peetham</option>
                      <option value="Vishnu">Vishnu / Divya Desam</option>
                      <option value="Murugan">Murugan (Arupadai Veedu)</option>
                      <option value="Ganesha">Ganesha / Vinayagar</option>
                      <option value="Navagraha">Navagraha Sthalam</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                      Opening Time
                    </label>
                    <input
                      type="text"
                      value={formData.openingTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, openingTime: e.target.value }))}
                      placeholder="e.g. 5:00 AM"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                      Closing Time
                    </label>
                    <input
                      type="text"
                      value={formData.closingTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, closingTime: e.target.value }))}
                      placeholder="e.g. 9:30 PM"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                    Darshan Timings Schedule
                  </label>
                  <input
                    type="text"
                    value={formData.darshanTimings}
                    onChange={(e) => setFormData(prev => ({ ...prev, darshanTimings: e.target.value }))}
                    placeholder="Morning: 5:00 AM – 12:30 PM | Evening: 4:00 PM – 9:30 PM"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                    Dress Code Guidelines
                  </label>
                  <input
                    type="text"
                    value={formData.dressCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, dressCode: e.target.value }))}
                    placeholder="Traditional attire. Men: Dhoti/Veshti. Women: Saree/Salwar."
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                    Key Events & Festivals
                  </label>
                  <input
                    type="text"
                    value={formData.events}
                    onChange={(e) => setFormData(prev => ({ ...prev, events: e.target.value }))}
                    placeholder="e.g. Chithirai Thiruvizha, Navarathri, Maha Shivaratri"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                    Historical & Architectural Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Historical chronicles, temple sanctum details, Gopuram architecture..."
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem', lineHeight: '1.4' }}
                  />
                </div>

                <ImageUploader
                  label="Temple Shrine Cover Photo"
                  value={formData.image}
                  onChange={(newUrl) => setFormData(prev => ({ ...prev, image: newUrl }))}
                  defaultImage="https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=1200&q=80"
                  helperText="Upload temple photo or paste image URL."
                />

                <div style={{ marginTop: '1.2rem', display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', background: 'transparent', color: 'var(--admin-text-muted)', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    style={{ padding: '0.6rem 1.5rem', borderRadius: '6px', border: '1px solid var(--admin-gold)', background: 'linear-gradient(135deg, var(--admin-primary-brown), var(--admin-gold))', color: '#FFFDF9', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    {editingTemple ? 'Update Temple' : 'Save Temple'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                backgroundColor: 'var(--admin-bg-deep)',
                border: '1px solid rgba(192, 90, 78, 0.4)',
                borderRadius: '12px',
                padding: '1.8rem',
                maxWidth: '420px',
                textAlign: 'center'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <AlertCircle size={36} style={{ color: 'var(--admin-danger)', margin: '0 auto 0.8rem' }} />
              <h4 className="serif-title" style={{ fontSize: '1.2rem', color: '#FFFDF9', marginBottom: '0.5rem' }}>
                Confirm Temple Removal
              </h4>
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.86rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                Are you sure you want to remove this sacred temple listing from the directory?
              </p>
              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  style={{ padding: '0.55rem 1.2rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.2)', background: 'transparent', color: '#FFFDF9', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  style={{ padding: '0.55rem 1.4rem', borderRadius: '6px', border: '1px solid var(--admin-danger)', background: 'var(--admin-danger)', color: '#FFFDF9', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Delete Temple
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
