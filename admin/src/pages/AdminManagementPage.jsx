import React, { useState, useEffect } from 'react';
import { 
  User, Plus, Search, Edit3, Trash2, Power, 
  ShieldCheck, Shield, Sparkles, Check, X, Key,
  GitBranch, Landmark, Phone, Mail, Lock, Eye, EyeOff,
  AlertCircle, ShieldAlert, CheckCircle2, RefreshCw,
  FolderPlus, Layers, CheckSquare, Square, ChevronDown, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_CATEGORIES_PRESET = [
  {
    name: 'Pooja Services',
    slug: 'pooja-services',
    subcategories: [
      { name: 'Abhishekam', slug: 'abhishekam' },
      { name: 'Archana', slug: 'archana' },
      { name: 'Special Darshan', slug: 'special-darshan' },
      { name: 'Homam', slug: 'homam' }
    ]
  },
  {
    name: 'Prasadam',
    slug: 'prasadam',
    subcategories: [
      { name: 'Laddu', slug: 'laddu' },
      { name: 'Puliyodarai', slug: 'puliyodarai' },
      { name: 'Panchamirtham', slug: 'panchamirtham' }
    ]
  },
  {
    name: 'Astrology',
    slug: 'astrology',
    subcategories: [
      { name: 'Horoscope', slug: 'horoscope' },
      { name: 'Consultation', slug: 'consultation' },
      { name: 'Muhurtham', slug: 'muhurtham' }
    ]
  },
  {
    name: 'Other Services',
    slug: 'other-services',
    subcategories: [
      { name: 'Pooja Essentials', slug: 'pooja-essentials' },
      { name: 'Spiritual Accessories', slug: 'spiritual-accessories' },
      { name: 'Idols & Frames', slug: 'idols-and-frames' },
      { name: 'Devotional Wear', slug: 'devotional-wear' }
    ]
  }
];

const PERMISSION_ACTIONS = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
  { key: 'publish', label: 'Publish' }
];

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [branches, setBranches] = useState([]);
  const [availableCategories, setAvailableCategories] = useState(DEFAULT_CATEGORIES_PRESET);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('ALL');
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordResetAdmin, setPasswordResetAdmin] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({ 'pooja-services': true, 'prasadam': true });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'SUB_ADMIN',
    branch: 'Chennai',
    temple: 'Kapaleeshwarar Temple',
    templeId: 't-3',
    status: 'Active',
    password: '',
    assignedModules: ['services', 'bookings'],
    serviceAssignments: []
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('darshan_admin_token') || sessionStorage.getItem('darshan_admin_token') || '';
    const userJson = localStorage.getItem('darshan_admin_user') || sessionStorage.getItem('darshan_admin_user');
    let email = '';
    if (userJson) {
      try {
        const u = JSON.parse(userJson);
        email = u.email || '';
      } catch (e) {}
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-admin-token': token,
      'x-admin-email': email
    };
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Fetch branches and available temples
  const fetchBranches = async () => {
    try {
      const res = await fetch('/api/branches', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setBranches(data);
      }
    } catch (err) {
      console.error('Failed to fetch branches:', err);
    }
  };

  // Fetch service categories & subcategories
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/service-categories', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAvailableCategories(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admins', { headers: getAuthHeaders() });
      if (res.status === 403) {
        setIsSuperAdmin(false);
        setError('Access Denied: Only Super Admin can manage administrative users and Sub Admins.');
        setLoading(false);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAdmins(data);
          setIsSuperAdmin(true);
        } else {
          setError('Invalid admin roster format returned.');
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        setError(errJson.message || `Server error (${res.status}). Unable to fetch admin accounts.`);
      }
    } catch (err) {
      console.error('Failed to fetch admins:', err);
      setError('Unable to load admin accounts. Please check backend server / MongoDB Atlas connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchCategories();
    fetchAdmins();
  }, []);

  // When branch changes in form, automatically cascade select default temple
  const handleBranchChange = (selectedBranchName) => {
    const branchObj = branches.find(b => b.name.toLowerCase() === selectedBranchName.toLowerCase());
    const availableTemples = branchObj?.temples || [];
    const firstTemple = availableTemples[0];

    setFormData(prev => ({
      ...prev,
      branch: selectedBranchName,
      temple: firstTemple ? firstTemple.name : `${selectedBranchName} Temple`,
      templeId: firstTemple ? firstTemple.id : ''
    }));
  };

  const handleOpenAdd = () => {
    const defaultBranch = branches[0]?.name || 'Chennai';
    const defaultTemple = branches[0]?.temples[0]?.name || 'Kapaleeshwarar Temple';
    const defaultTempleId = branches[0]?.temples[0]?.id || 't-3';

    // Default template assignment (Pooja Services -> Abhishekam & Archana)
    const initialAssignments = [
      {
        category: 'Pooja Services',
        categorySlug: 'pooja-services',
        subcategories: [
          { name: 'Abhishekam', slug: 'abhishekam', permissions: ['view', 'edit'] },
          { name: 'Archana', slug: 'archana', permissions: ['view', 'edit'] }
        ]
      }
    ];

    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'SUB_ADMIN',
      branch: defaultBranch,
      temple: defaultTemple,
      templeId: defaultTempleId,
      status: 'Active',
      password: '',
      assignedModules: ['services', 'bookings'],
      serviceAssignments: initialAssignments
    });
    setEditingAdmin(null);
    setShowPassword(false);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name || '',
      email: admin.email || '',
      phone: admin.phone || '',
      role: admin.role || 'SUB_ADMIN',
      branch: admin.branch || 'Chennai',
      temple: admin.temple || 'Kapaleeshwarar Temple',
      templeId: admin.templeId || '',
      status: admin.status || 'Active',
      password: '',
      assignedModules: Array.isArray(admin.assignedModules) && admin.assignedModules.length > 0 
        ? admin.assignedModules 
        : ['services', 'bookings'],
      serviceAssignments: Array.isArray(admin.serviceAssignments) ? admin.serviceAssignments : []
    });
    setShowPassword(false);
    setIsAddModalOpen(true);
  };

  // Helper methods to manage Service Permission Matrix
  const toggleCategoryAssignment = (catObj) => {
    setFormData(prev => {
      const exists = prev.serviceAssignments.some(a => a.categorySlug === catObj.slug || a.category === catObj.name);
      if (exists) {
        return {
          ...prev,
          serviceAssignments: prev.serviceAssignments.filter(a => a.categorySlug !== catObj.slug && a.category !== catObj.name)
        };
      } else {
        const defaultSubs = (catObj.subcategories || []).map(s => ({
          name: s.name,
          slug: s.slug,
          permissions: ['view', 'edit']
        }));
        return {
          ...prev,
          serviceAssignments: [
            ...prev.serviceAssignments,
            {
              category: catObj.name,
              categorySlug: catObj.slug,
              subcategories: defaultSubs
            }
          ]
        };
      }
    });
  };

  const toggleSubcategoryAssignment = (catObj, subObj) => {
    setFormData(prev => {
      let assignments = [...prev.serviceAssignments];
      let catIndex = assignments.findIndex(a => a.categorySlug === catObj.slug || a.category === catObj.name);

      if (catIndex === -1) {
        assignments.push({
          category: catObj.name,
          categorySlug: catObj.slug,
          subcategories: [{ name: subObj.name, slug: subObj.slug, permissions: ['view', 'edit'] }]
        });
      } else {
        let subs = [...(assignments[catIndex].subcategories || [])];
        const subIndex = subs.findIndex(s => s.slug === subObj.slug || s.name === subObj.name);

        if (subIndex !== -1) {
          subs.splice(subIndex, 1);
        } else {
          subs.push({ name: subObj.name, slug: subObj.slug, permissions: ['view', 'edit'] });
        }

        if (subs.length === 0) {
          assignments.splice(catIndex, 1);
        } else {
          assignments[catIndex] = { ...assignments[catIndex], subcategories: subs };
        }
      }

      return { ...prev, serviceAssignments: assignments };
    });
  };

  const toggleSubcategoryPermission = (catObj, subObj, permissionKey) => {
    setFormData(prev => {
      let assignments = [...prev.serviceAssignments];
      let catIndex = assignments.findIndex(a => a.categorySlug === catObj.slug || a.category === catObj.name);

      if (catIndex === -1) {
        assignments.push({
          category: catObj.name,
          categorySlug: catObj.slug,
          subcategories: [{ name: subObj.name, slug: subObj.slug, permissions: [permissionKey] }]
        });
      } else {
        let subs = [...(assignments[catIndex].subcategories || [])];
        const subIndex = subs.findIndex(s => s.slug === subObj.slug || s.name === subObj.name);

        if (subIndex === -1) {
          subs.push({ name: subObj.name, slug: subObj.slug, permissions: [permissionKey] });
        } else {
          let perms = [...(subs[subIndex].permissions || [])];
          if (perms.includes(permissionKey)) {
            perms = perms.filter(p => p !== permissionKey);
          } else {
            perms.push(permissionKey);
          }
          subs[subIndex] = { ...subs[subIndex], permissions: perms };
        }
        assignments[catIndex] = { ...assignments[catIndex], subcategories: subs };
      }

      return { ...prev, serviceAssignments: assignments };
    });
  };

  const grantAllForSubcategory = (catObj, subObj) => {
    setFormData(prev => {
      let assignments = [...prev.serviceAssignments];
      let catIndex = assignments.findIndex(a => a.categorySlug === catObj.slug || a.category === catObj.name);
      const allPerms = ['view', 'create', 'edit', 'delete', 'publish'];

      if (catIndex === -1) {
        assignments.push({
          category: catObj.name,
          categorySlug: catObj.slug,
          subcategories: [{ name: subObj.name, slug: subObj.slug, permissions: allPerms }]
        });
      } else {
        let subs = [...(assignments[catIndex].subcategories || [])];
        const subIndex = subs.findIndex(s => s.slug === subObj.slug || s.name === subObj.name);
        if (subIndex === -1) {
          subs.push({ name: subObj.name, slug: subObj.slug, permissions: allPerms });
        } else {
          subs[subIndex] = { ...subs[subIndex], permissions: allPerms };
        }
        assignments[catIndex] = { ...assignments[catIndex], subcategories: subs };
      }
      return { ...prev, serviceAssignments: assignments };
    });
  };

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        const payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          branch: formData.role === 'SUPER_ADMIN' || formData.role === 'Super Admin' ? 'All Branches' : formData.branch,
          temple: formData.role === 'SUPER_ADMIN' || formData.role === 'Super Admin' ? 'All Temples' : formData.temple,
          templeId: formData.templeId,
          status: formData.status,
          assignedModules: formData.role === 'SUPER_ADMIN' || formData.role === 'Super Admin' ? [] : (formData.assignedModules || ['services', 'bookings']),
          serviceAssignments: formData.role === 'SUPER_ADMIN' || formData.role === 'Super Admin' ? [] : formData.serviceAssignments
        };
        if (formData.password && formData.password.trim()) {
          payload.password = formData.password.trim();
        }

        const res = await fetch(`/api/admins/${editingAdmin.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          showToast(`Sub Admin '${formData.name}' successfully updated with service permissions!`);
          await fetchAdmins();
          setIsAddModalOpen(false);
        } else {
          alert(data.message || 'Failed to update Sub Admin');
        }
      } else {
        const payload = {
          ...formData,
          branch: formData.role === 'SUPER_ADMIN' || formData.role === 'Super Admin' ? 'All Branches' : formData.branch,
          temple: formData.role === 'SUPER_ADMIN' || formData.role === 'Super Admin' ? 'All Temples' : formData.temple,
          assignedModules: formData.role === 'SUPER_ADMIN' || formData.role === 'Super Admin' ? [] : (formData.assignedModules || ['services', 'bookings']),
          serviceAssignments: formData.role === 'SUPER_ADMIN' || formData.role === 'Super Admin' ? [] : formData.serviceAssignments
        };
        const res = await fetch('/api/admins', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          showToast(`New Sub Admin '${formData.name}' registered with granular permissions!`);
          await fetchAdmins();
          setIsAddModalOpen(false);
        } else {
          alert(data.message || 'Failed to register Sub Admin');
        }
      }
    } catch (err) {
      alert('Error saving Sub Admin: ' + err.message);
    }
  };

  const handleToggleStatus = async (admin) => {
    const newStatus = admin.status === 'Active' ? 'Disabled' : 'Active';
    try {
      const res = await fetch(`/api/admins/${admin.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Sub Admin '${admin.name}' is now ${newStatus}`);
        await fetchAdmins();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.message || 'Failed to toggle status');
      }
    } catch (err) {
      alert('Status update failed: ' + err.message);
    }
  };

  const handleDelete = async (admin) => {
    if (admin.role === 'Super Admin' || admin.role === 'SUPER_ADMIN') {
      alert('Principal Super Admin account cannot be deleted.');
      return;
    }

    if (window.confirm(`Are you sure you want to revoke Sub Admin access for ${admin.name} (${admin.branch} branch)?`)) {
      try {
        const res = await fetch(`/api/admins/${admin.id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        if (res.ok) {
          showToast(`Sub Admin '${admin.name}' revoked.`);
          await fetchAdmins();
        } else {
          const d = await res.json().catch(() => ({}));
          alert(d.message || 'Failed to delete Sub Admin');
        }
      } catch (err) {
        alert('Delete failed: ' + err.message);
      }
    }
  };

  const handleOpenPasswordReset = (admin) => {
    setPasswordResetAdmin(admin);
    setNewPassword('');
    setShowPassword(false);
    setIsPasswordModalOpen(true);
  };

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    try {
      const res = await fetch(`/api/admins/${passwordResetAdmin.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ password: newPassword })
      });
      if (res.ok) {
        showToast(`Password successfully updated for ${passwordResetAdmin.name}!`);
        setIsPasswordModalOpen(false);
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.message || 'Failed to reset password');
      }
    } catch (err) {
      alert('Password reset failed: ' + err.message);
    }
  };

  const filteredAdmins = admins.filter(a => {
    const matchSearch = 
      (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.phone || '').includes(searchTerm) ||
      (a.branch || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.temple || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchBranch = filterBranch === 'ALL' || (a.branch || '').toLowerCase() === filterBranch.toLowerCase();
    return matchSearch && matchBranch;
  });

  const selectedBranchObj = branches.find(b => b.name.toLowerCase() === formData.branch.toLowerCase());
  const currentModalTemples = selectedBranchObj?.temples || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      
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
              backgroundColor: 'rgba(18, 9, 7, 0.95)',
              border: '1px solid var(--admin-gold)',
              color: '#FFFDF9',
              padding: '0.85rem 1.4rem',
              borderRadius: '10px',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
            }}
          >
            <CheckCircle2 size={18} style={{ color: 'var(--admin-gold)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.08em', color: 'var(--admin-gold)', textTransform: 'uppercase' }}>
              ACCESS CONTROL & RBAC
            </span>
            <span style={{ height: '4px', width: '4px', borderRadius: '50%', backgroundColor: 'var(--admin-gold)' }}></span>
            <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>MongoDB Atlas Secured</span>
          </div>
          <h1 className="serif-title" style={{ fontSize: '1.85rem', color: '#FFFDF9', margin: 0 }}>
            Sub Admin & Service Permissions Matrix
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.86rem', marginTop: '0.3rem', margin: 0 }}>
            Manage Branch $\rightarrow$ Temple $\rightarrow$ Service Categories $\rightarrow$ Subcategories granular permissions.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={fetchAdmins}
            style={{
              background: 'rgba(214, 181, 109, 0.1)',
              border: '1px solid rgba(214, 181, 109, 0.3)',
              color: 'var(--admin-gold)',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
            title="Refresh from MongoDB Atlas"
          >
            <RefreshCw size={14} />
            Sync Atlas
          </button>

          <button
            onClick={handleOpenAdd}
            style={{
              background: 'linear-gradient(135deg, var(--admin-primary-brown), var(--admin-gold))',
              border: '1px solid var(--admin-gold)',
              color: '#FFFDF9',
              padding: '0.6rem 1.4rem',
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
            <Plus size={16} />
            Add Sub Admin / In-Charge
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glassmorphism" style={{ padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(214, 181, 109, 0.15)', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(214, 181, 109, 0.4)' }} />
          <input
            type="text"
            placeholder="Search Sub Admins by name, email, branch, temple, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem 0.65rem 2.3rem',
              borderRadius: '8px',
              fontSize: '0.85rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', fontWeight: '500' }}>Filter Branch:</span>
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            style={{
              padding: '0.55rem 0.85rem',
              borderRadius: '6px',
              border: '1px solid rgba(214, 181, 109, 0.25)',
              backgroundColor: 'rgba(18, 9, 7, 0.8)',
              color: '#FFFDF9',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Branches ({admins.length})</option>
            {branches.map(b => (
              <option key={b.id || b.name} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub Admins Table */}
      {!loading && !error && (
        <div className="glassmorphism" style={{ borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.15)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(214, 181, 109, 0.2)', color: 'var(--admin-gold-light)', fontFamily: 'var(--font-serif)', fontSize: '0.78rem', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '1rem 1.1rem' }}>SUB ADMIN / CONTACT</th>
                  <th style={{ padding: '1rem 1.1rem' }}>BRANCH & TEMPLE</th>
                  <th style={{ padding: '1rem 1.1rem' }}>ASSIGNED SERVICE PERMISSIONS</th>
                  <th style={{ padding: '1rem 1.1rem' }}>ROLE</th>
                  <th style={{ padding: '1rem 1.1rem' }}>STATUS</th>
                  <th style={{ padding: '1rem 1.1rem', textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody style={{ color: 'var(--admin-cream)' }}>
                {filteredAdmins.map(a => {
                  const isSuper = a.role === 'Super Admin' || a.role === 'SUPER_ADMIN';
                  const assignments = a.serviceAssignments || [];

                  return (
                    <tr key={a.id} style={{ borderBottom: '1px solid rgba(214, 181, 109, 0.08)' }}>
                      {/* Name & Contact */}
                      <td style={{ padding: '1rem 1.1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <div className="flex-center" style={{ height: '38px', width: '38px', borderRadius: '50%', backgroundColor: isSuper ? 'var(--admin-gold)' : 'var(--admin-primary-brown)', color: isSuper ? '#1c0e0b' : 'var(--admin-gold)', border: '1px solid var(--admin-gold)', fontWeight: 'bold', fontSize: '0.95rem', flexShrink: 0 }}>
                            {a.name.charAt(0)}
                          </div>
                          <div>
                            <span style={{ fontWeight: '600', color: '#FFFDF9', display: 'block', fontSize: '0.92rem' }}>
                              {a.name}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.2rem', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Mail size={12} style={{ color: 'var(--admin-gold)' }} />
                                {a.email}
                              </span>
                              {a.phone && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Phone size={12} style={{ color: 'var(--admin-gold)' }} />
                                  {a.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Branch & Temple */}
                      <td style={{ padding: '1rem 1.1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '600', color: isSuper ? 'var(--admin-gold)' : '#FFFDF9' }}>
                            <GitBranch size={13} style={{ color: 'var(--admin-gold)' }} />
                            {a.branch || (isSuper ? 'All Branches' : 'Chennai')}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>
                            <Landmark size={12} style={{ color: 'var(--admin-gold)', opacity: 0.7 }} />
                            {a.temple || (isSuper ? 'All Temples' : 'Kapaleeshwarar Temple')}
                          </div>
                        </div>
                      </td>

                      {/* Assigned Service Permissions */}
                      <td style={{ padding: '1rem 1.1rem' }}>
                        {isSuper ? (
                          <span style={{ fontSize: '0.78rem', color: 'var(--admin-gold)', fontWeight: 'bold' }}>
                            ✨ Full Unrestricted Catalog Access
                          </span>
                        ) : assignments.length === 0 ? (
                          <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', fontStyle: 'italic' }}>
                            All Services under Temple (Standard)
                          </span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {assignments.map(assign => (
                              <div key={assign.categorySlug || assign.category} style={{ fontSize: '0.78rem' }}>
                                <strong style={{ color: 'var(--admin-gold)' }}>{assign.category}: </strong>
                                <span style={{ color: '#FFFDF9' }}>
                                  {(assign.subcategories || []).map(s => `${s.name} [${(s.permissions || []).join(',')}]`).join(' • ')}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Role */}
                      <td style={{ padding: '1rem 1.1rem' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: '20px',
                            fontSize: '0.74rem',
                            fontWeight: 'bold',
                            backgroundColor: isSuper ? 'rgba(200, 155, 75, 0.2)' : 'rgba(214, 181, 109, 0.08)',
                            border: isSuper ? '1px solid var(--admin-gold)' : '1px solid rgba(214, 181, 109, 0.25)',
                            color: isSuper ? 'var(--admin-gold)' : 'var(--admin-cream)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <ShieldCheck size={12} />
                          {isSuper ? 'Super Admin' : 'Sub Admin / In-Charge'}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1rem 1.1rem' }}>
                        <span
                          style={{
                            padding: '0.22rem 0.6rem',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: '600',
                            backgroundColor: a.status === 'Active' ? 'rgba(142, 174, 104, 0.15)' : 'rgba(192, 90, 78, 0.15)',
                            border: a.status === 'Active' ? '1px solid rgba(142, 174, 104, 0.35)' : '1px solid rgba(192, 90, 78, 0.35)',
                            color: a.status === 'Active' ? 'var(--admin-success)' : 'var(--admin-danger)'
                          }}
                        >
                          {a.status || 'Active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1rem 1.1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleToggleStatus(a)}
                            style={{
                              background: 'none',
                              border: '1px solid rgba(214, 181, 109, 0.2)',
                              color: a.status === 'Active' ? 'var(--admin-success)' : 'var(--admin-text-muted)',
                              padding: '0.4rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title={a.status === 'Active' ? 'Disable Sub Admin' : 'Enable Sub Admin'}
                          >
                            <Power size={14} />
                          </button>

                          <button
                            onClick={() => handleOpenPasswordReset(a)}
                            style={{
                              background: 'none',
                              border: '1px solid rgba(214, 181, 109, 0.2)',
                              color: 'var(--admin-gold)',
                              padding: '0.4rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title="Reset Password Credentials"
                          >
                            <Key size={14} />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(a)}
                            style={{
                              background: 'none',
                              border: '1px solid rgba(214, 181, 109, 0.2)',
                              color: 'var(--admin-gold-light)',
                              padding: '0.4rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title="Edit Permissions & Details"
                          >
                            <Edit3 size={14} />
                          </button>

                          {!isSuper && (
                            <button
                              onClick={() => handleDelete(a)}
                              style={{
                                background: 'none',
                                border: '1px solid rgba(192, 90, 78, 0.3)',
                                color: 'var(--admin-danger)',
                                padding: '0.4rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="Revoke Sub Admin Access"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT SUB ADMIN MODAL WITH PERMISSION MATRIX */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              overflowY: 'auto'
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
                padding: '2.2rem',
                boxShadow: '0 25px 70px rgba(0,0,0,0.85)',
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

              <h3 className="serif-title" style={{ fontSize: '1.35rem', color: '#FFFDF9', marginBottom: '0.3rem' }}>
                {editingAdmin ? 'Edit Sub Admin & Service Access Matrix' : 'Add Sub Admin / In-Charge'}
              </h3>
              <p style={{ color: 'var(--admin-gold)', fontSize: '0.8rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(214, 181, 109, 0.2)', paddingBottom: '0.8rem' }}>
                Assign Branch $\rightarrow$ Temple $\rightarrow$ Service Category $\rightarrow$ Subcategory granular permissions.
              </p>

              <form onSubmit={handleSaveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {/* Name */}
                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                    Sub Admin Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Arun Kumar"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                  />
                </div>

                {/* Email & Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                      Email / Login ID *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="arun@darshanjourney.com"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 98400 11223"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                {/* Role Level */}
                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                    Role Level *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.8)', color: '#FFFDF9', fontSize: '0.88rem' }}
                  >
                    <option value="SUB_ADMIN">Sub Admin / In-Charge (Scoped to Assigned Branch, Temple & Services)</option>
                    <option value="SUPER_ADMIN">Super Admin (Full Access to Entire System)</option>
                  </select>
                </div>

                {/* Branch & Temple Cascading Selector */}
                {formData.role !== 'SUPER_ADMIN' && formData.role !== 'Super Admin' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: 'rgba(200, 155, 75, 0.05)', padding: '0.9rem', borderRadius: '8px', border: '1px solid rgba(200, 155, 75, 0.18)' }}>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--admin-gold)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: 'bold' }}>
                        <GitBranch size={13} />
                        Assigned Branch *
                      </label>
                      <select
                        value={formData.branch}
                        onChange={(e) => handleBranchChange(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.3)', backgroundColor: 'rgba(18, 9, 7, 0.9)', color: '#FFFDF9', fontSize: '0.88rem' }}
                      >
                        {branches.map(b => (
                          <option key={b.id || b.name} value={b.name}>{b.name} Branch</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--admin-gold)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: 'bold' }}>
                        <Landmark size={13} />
                        Assigned Temple *
                      </label>
                      <select
                        value={formData.temple}
                        onChange={(e) => {
                          const chosenName = e.target.value;
                          const found = currentModalTemples.find(t => t.name === chosenName);
                          setFormData(prev => ({
                            ...prev,
                            temple: chosenName,
                            templeId: found ? found.id : prev.templeId
                          }));
                        }}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.3)', backgroundColor: 'rgba(18, 9, 7, 0.9)', color: '#FFFDF9', fontSize: '0.88rem' }}
                      >
                        {currentModalTemples.length > 0 ? (
                          currentModalTemples.map(t => (
                            <option key={t.id || t.name} value={t.name}>{t.name}</option>
                          ))
                        ) : (
                          <option value={`${formData.branch} Temple`}>{formData.branch} Temple</option>
                        )}
                      </select>
                    </div>
                  </div>
                )}

                {/* ASSIGNED PAGES & MODULES PERMISSIONS */}
                {formData.role !== 'SUPER_ADMIN' && formData.role !== 'Super Admin' && (
                  <div style={{ backgroundColor: 'rgba(200, 155, 75, 0.05)', border: '1px solid rgba(200, 155, 75, 0.25)', borderRadius: '10px', padding: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--admin-gold)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>
                      <CheckSquare size={15} />
                      Assigned Pages & Navigation Modules *
                    </label>
                    <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                      Select the specific modules this Sub Admin will see in their sidebar and be authorized to access.
                    </p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
                      {[
                        { key: 'services', label: 'Services' },
                        { key: 'bookings', label: 'Bookings' },
                        { key: 'temples', label: 'Temples' },
                        { key: 'users', label: 'Users' },
                        { key: 'payments', label: 'Payments' },
                        { key: 'reports', label: 'Reports' },
                        { key: 'media', label: 'Media' },
                        { key: 'website-content', label: 'Website Content' },
                        { key: 'about', label: 'About Us' }
                      ].map(mod => {
                        const isChecked = (formData.assignedModules || []).includes(mod.key);
                        return (
                          <label 
                            key={mod.key}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.45rem',
                              padding: '0.45rem 0.65rem',
                              borderRadius: '6px',
                              backgroundColor: isChecked ? 'rgba(200, 155, 75, 0.18)' : 'rgba(18, 9, 7, 0.5)',
                              border: isChecked ? '1px solid var(--admin-gold)' : '1px solid rgba(255,255,255,0.08)',
                              color: isChecked ? '#FFFDF9' : 'var(--admin-text-muted)',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              fontWeight: isChecked ? '600' : '400',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setFormData(prev => ({
                                  ...prev,
                                  assignedModules: checked 
                                    ? [...(prev.assignedModules || []), mod.key]
                                    : (prev.assignedModules || []).filter(k => k !== mod.key)
                                }));
                              }}
                              style={{ accentColor: 'var(--admin-gold)', cursor: 'pointer' }}
                            />
                            {mod.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SERVICE CATEGORIES & SUBCATEGORIES PERMISSIONS MATRIX */}
                {formData.role !== 'SUPER_ADMIN' && formData.role !== 'Super Admin' && (
                  <div style={{ backgroundColor: 'rgba(18, 9, 7, 0.9)', border: '1px solid rgba(214, 181, 109, 0.3)', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem', borderBottom: '1px solid rgba(214, 181, 109, 0.15)', paddingBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Layers size={16} style={{ color: 'var(--admin-gold)' }} />
                        <span style={{ fontSize: '0.88rem', fontWeight: 'bold', color: '#FFFDF9' }}>
                          Service Category & Subcategory Permissions Matrix
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--admin-gold-light)' }}>
                        HTTP 403 Enforced
                      </span>
                    </div>

                    <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
                      Select which categories & subcategories this Sub Admin can access, and grant specific action permissions (View, Create, Edit, Delete, Publish).
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                      {availableCategories.map(cat => {
                        const matchCatAssign = formData.serviceAssignments.find(a => a.categorySlug === cat.slug || a.category === cat.name);
                        const isCatSelected = !!matchCatAssign;
                        const isExpanded = expandedCategories[cat.slug] ?? false;

                        return (
                          <div key={cat.slug || cat.name} style={{ backgroundColor: 'rgba(214, 181, 109, 0.04)', border: isCatSelected ? '1px solid rgba(200, 155, 75, 0.4)' : '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.8rem' }}>
                            
                            {/* Category Header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }} onClick={() => toggleCategoryAssignment(cat)}>
                                {isCatSelected ? (
                                  <CheckSquare size={16} style={{ color: 'var(--admin-gold)' }} />
                                ) : (
                                  <Square size={16} style={{ color: 'var(--admin-text-muted)' }} />
                                )}
                                <strong style={{ color: isCatSelected ? 'var(--admin-gold)' : '#FFFDF9', fontSize: '0.9rem' }}>
                                  {cat.name}
                                </strong>
                              </div>

                              <button
                                type="button"
                                onClick={() => setExpandedCategories(prev => ({ ...prev, [cat.slug]: !isExpanded }))}
                                style={{ background: 'none', border: 'none', color: 'var(--admin-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}
                              >
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                {(cat.subcategories || []).length} Subcategories
                              </button>
                            </div>

                            {/* Subcategories Breakdown */}
                            {isExpanded && (
                              <div style={{ marginTop: '0.8rem', paddingLeft: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', borderLeft: '2px solid rgba(200, 155, 75, 0.2)' }}>
                                {(cat.subcategories || []).map(sub => {
                                  const assignedSub = matchCatAssign?.subcategories?.find(s => s.slug === sub.slug || s.name === sub.name);
                                  const isSubActive = !!assignedSub;
                                  const activePerms = assignedSub?.permissions || [];

                                  return (
                                    <div key={sub.slug || sub.name} style={{ backgroundColor: isSubActive ? 'rgba(200, 155, 75, 0.08)' : 'rgba(0,0,0,0.2)', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.15)' }}>
                                      
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isSubActive ? '0.45rem' : '0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => toggleSubcategoryAssignment(cat, sub)}>
                                          {isSubActive ? (
                                            <CheckSquare size={14} style={{ color: 'var(--admin-gold)' }} />
                                          ) : (
                                            <Square size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
                                          )}
                                          <span style={{ fontSize: '0.84rem', fontWeight: isSubActive ? 'bold' : 'normal', color: isSubActive ? '#FFFDF9' : 'var(--admin-text-muted)' }}>
                                            {sub.name}
                                          </span>
                                        </div>

                                        {isSubActive && (
                                          <button
                                            type="button"
                                            onClick={() => grantAllForSubcategory(cat, sub)}
                                            style={{ background: 'none', border: 'none', color: 'var(--admin-gold-light)', fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline' }}
                                          >
                                            Grant All
                                          </button>
                                        )}
                                      </div>

                                      {/* Action Permissions */}
                                      {isSubActive && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', paddingTop: '0.3rem', borderTop: '1px solid rgba(214, 181, 109, 0.1)' }}>
                                          {PERMISSION_ACTIONS.map(action => {
                                            const hasPerm = activePerms.includes(action.key);
                                            return (
                                              <button
                                                key={action.key}
                                                type="button"
                                                onClick={() => toggleSubcategoryPermission(cat, sub, action.key)}
                                                style={{
                                                  padding: '0.2rem 0.55rem',
                                                  borderRadius: '4px',
                                                  fontSize: '0.72rem',
                                                  fontWeight: '600',
                                                  cursor: 'pointer',
                                                  border: hasPerm ? '1px solid var(--admin-gold)' : '1px solid rgba(255,255,255,0.15)',
                                                  backgroundColor: hasPerm ? 'rgba(200, 155, 75, 0.25)' : 'transparent',
                                                  color: hasPerm ? 'var(--admin-gold)' : 'rgba(255,255,255,0.5)'
                                                }}
                                              >
                                                {hasPerm ? `✓ ${action.label}` : action.label}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Password & Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                      {editingAdmin ? 'Password (leave blank to keep)' : 'Secret Password *'}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required={!editingAdmin}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder={editingAdmin ? '••••••••' : 'Set password'}
                        style={{ width: '100%', padding: '0.65rem 2.2rem 0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(214, 181, 109, 0.5)', cursor: 'pointer' }}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                      Operational Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.8)', color: '#FFFDF9', fontSize: '0.88rem' }}
                    >
                      <option value="Active">Active (Permitted)</option>
                      <option value="Disabled">Disabled (Blocked)</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
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
                    {editingAdmin ? 'Update Sub Admin' : 'Create Sub Admin'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QUICK PASSWORD RESET MODAL */}
      <AnimatePresence>
        {isPasswordModalOpen && passwordResetAdmin && (
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
            onClick={() => setIsPasswordModalOpen(false)}
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
                maxWidth: '440px',
                padding: '2rem',
                boxShadow: '0 25px 70px rgba(0,0,0,0.85)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'none', border: 'none', color: '#FFFDF9', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
                <Key size={20} style={{ color: 'var(--admin-gold)' }} />
                <h3 className="serif-title" style={{ fontSize: '1.25rem', color: '#FFFDF9' }}>
                  Reset Credentials
                </h3>
              </div>
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem', marginBottom: '1.2rem' }}>
                Update login password for <strong style={{ color: '#FFFDF9' }}>{passwordResetAdmin.name}</strong> ({passwordResetAdmin.email}).
              </p>

              <form onSubmit={handlePasswordResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                    New Password (min 6 characters) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      style={{ width: '100%', padding: '0.7rem 2.4rem 0.7rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.3)', backgroundColor: 'rgba(18, 9, 7, 0.7)', color: '#FFFDF9', fontSize: '0.88rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(214, 181, 109, 0.5)', cursor: 'pointer' }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', background: 'transparent', color: 'var(--admin-text-muted)', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    style={{ padding: '0.6rem 1.4rem', borderRadius: '6px', border: '1px solid var(--admin-gold)', background: 'linear-gradient(135deg, var(--admin-primary-brown), var(--admin-gold))', color: '#FFFDF9', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Save New Password
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
