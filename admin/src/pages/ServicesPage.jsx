import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Library, Plus, Search, Filter, Edit3, Trash2, 
  Power, Check, X, Sparkles, AlertCircle, Eye, Tag,
  Layers, FolderPlus, CheckCircle2, ChevronRight, ChevronDown,
  Settings2, Landmark, GitBranch, User, Mail, Phone, Lock,
  ShieldCheck, ShieldAlert, Key, CheckSquare, Square, RefreshCw,
  SlidersHorizontal, Award, BookOpen, ExternalLink, Copy, CheckCheck,
  Users, MapPin, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUploader from '../components/ImageUploader';
import { getAuthHeaders, getCurrentUser, saveUserSession } from '../utils/auth';

const PERMISSION_ACTIONS = [
  { key: 'canView', label: 'View', default: true },
  { key: 'canCreate', label: 'Create', default: true },
  { key: 'canEdit', label: 'Edit', default: true },
  { key: 'canDelete', label: 'Delete', default: false },
  { key: 'canPublish', label: 'Publish', default: true },
  { key: 'canManageBookings', label: 'Manage Bookings', default: true }
];

export default function ServicesPage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const isSuper = !currentUser || (currentUser.role || '').toUpperCase().includes('SUPER');
  const isServiceSubAdmin = (currentUser?.role || '').toUpperCase().includes('SERVICE');

  // Tabs: 'temples' (Services -> Temple -> Employee -> Works Hierarchy) | 'catalog' | 'categories'
  const [activeTab, setActiveTab] = useState('temples');
  
  // Data States
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Temple Search & Filters
  const [templeSearchTerm, setTempleSearchTerm] = useState('');
  const [templeCategoryFilter, setTempleCategoryFilter] = useState('ALL');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTempleFilter, setSelectedTempleFilter] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  
  // Service Add / Edit State
  const [editingService, setEditingService] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // 1. VIEW IN-CHARGE MODAL STATE
  const [viewingInChargeService, setViewingInChargeService] = useState(null);

  // 2. MANAGE ACCESS MODAL STATE
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [accessModalService, setAccessModalService] = useState(null);
  const [accessPermissionsForm, setAccessPermissionsForm] = useState([]);
  const [accessSaving, setAccessSaving] = useState(false);

  // 3. MANAGE LOGIN MODAL STATE
  const [isManageLoginModalOpen, setIsManageLoginModalOpen] = useState(false);
  const [manageLoginService, setManageLoginService] = useState(null);
  const [loginCopied, setLoginCopied] = useState(false);

  // 4. RESET PASSWORD MODAL STATE
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [resetPasswordService, setResetPasswordService] = useState(null);
  const [resetPasswordForm, setResetPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [resetPasswordSaving, setResetPasswordSaving] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState('');

  // 5. ASSIGN / CREATE NEW IN-CHARGE MODAL STATE
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningService, setAssigningService] = useState(null);
  const [assignInChargeForm, setAssignInChargeForm] = useState({
    name: '',
    email: '',
    phone: '',
    designation: 'Service In-Charge',
    password: '',
    status: 'Active'
  });
  const [assignSaving, setAssignSaving] = useState(false);

  // Category / Subcategory Modal states (Super Admin)
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catFormData, setCatFormData] = useState({ name: '', slug: '', description: '', status: 'Active' });
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedParentCatId, setSelectedParentCatId] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [subFormData, setSubFormData] = useState({ name: '', slug: '', description: '', status: 'Active' });

  // Form State for Service Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    templeId: 't-3',
    temple: 'Kapaleeshwarar Temple',
    location: 'Chennai',
    category: 'Pooja Services',
    categorySlug: 'pooja-services',
    categoryTitle: 'Pooja Services',
    subcategory: 'Abhishekam',
    subcategorySlug: 'abhishekam',
    description: '',
    price: '₹501',
    numericPrice: 501,
    image: '',
    availability: 'Available Daily',
    status: 'Active'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // 1. Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/service-categories', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // 2. Fetch Temples
  const fetchTemples = async () => {
    try {
      const res = await fetch('/api/temples', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setTemples(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching temples:', err);
    }
  };

  // 3. Fetch Services
  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/services', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setServices(Array.isArray(data) ? data : []);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setError(errJson.message || `Server error (${res.status}). Failed to load services.`);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Unable to load services. Please check server connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTemples();
    fetchServices();
  }, []);

  // --- 1. VIEW IN-CHARGE HANDLER ---
  const handleOpenViewInCharge = (service) => {
    setViewingInChargeService(service);
  };

  // --- 2. MANAGE ACCESS HANDLERS ---
  const handleOpenManageAccess = (service) => {
    setAccessModalService(service);
    const existingInCharge = service.assignedInCharge;

    const subcats = Array.isArray(service.subcategories) && service.subcategories.length > 0
      ? service.subcategories
      : [
          { id: `sub-${service.id}-1`, name: service.subcategory || 'General', slug: service.subcategorySlug || 'general' }
        ];

    const existingPerms = existingInCharge?.servicePermissions || [];

    const initialPermissions = subcats.map(sub => {
      const matchedPerm = existingPerms.find(p => p.subcategoryId === sub.id || (p.name && p.name.toLowerCase() === sub.name.toLowerCase()));
      return {
        subcategoryId: sub.id,
        name: sub.name,
        slug: sub.slug,
        description: sub.description || '',
        canView: matchedPerm ? matchedPerm.canView !== false : true,
        canCreate: matchedPerm ? !!matchedPerm.canCreate : true,
        canEdit: matchedPerm ? !!matchedPerm.canEdit : true,
        canDelete: matchedPerm ? !!matchedPerm.canDelete : false,
        canPublish: matchedPerm ? !!matchedPerm.canPublish : true,
        canManageBookings: matchedPerm ? !!matchedPerm.canManageBookings : true
      };
    });

    setAccessPermissionsForm(initialPermissions);
    setIsAccessModalOpen(true);
  };

  const handleToggleSubPermission = (subcategoryId, permKey) => {
    setAccessPermissionsForm(prev => prev.map(item => {
      if (item.subcategoryId === subcategoryId) {
        return { ...item, [permKey]: !item[permKey] };
      }
      return item;
    }));
  };

  const handleToggleAllPermissionsForSub = (subcategoryId, enableAll) => {
    setAccessPermissionsForm(prev => prev.map(item => {
      if (item.subcategoryId === subcategoryId) {
        return {
          ...item,
          canView: enableAll,
          canCreate: enableAll,
          canEdit: enableAll,
          canDelete: enableAll,
          canPublish: enableAll,
          canManageBookings: enableAll
        };
      }
      return item;
    }));
  };

  const handleSaveAccessPermissions = async (e) => {
    e.preventDefault();
    if (!accessModalService || !accessModalService.assignedInCharge) return;
    setAccessSaving(true);

    try {
      const res = await fetch(`/api/services/${accessModalService.id}/assign-incharge`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          subAdminId: accessModalService.assignedInCharge.id,
          name: accessModalService.assignedInCharge.name,
          email: accessModalService.assignedInCharge.email,
          phone: accessModalService.assignedInCharge.phone,
          designation: accessModalService.assignedInCharge.designation,
          status: accessModalService.assignedInCharge.status,
          servicePermissions: accessPermissionsForm
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✨ Permissions & access scope updated for ${accessModalService.assignedInCharge.name}!`);
        setIsAccessModalOpen(false);
        await fetchServices();
      } else {
        alert(data.message || 'Failed to update access permissions');
      }
    } catch (err) {
      alert('Error updating access: ' + err.message);
    } finally {
      setAccessSaving(false);
    }
  };

  // --- 3. MANAGE LOGIN HANDLERS ---
  const handleOpenManageLogin = (service) => {
    setManageLoginService(service);
    setLoginCopied(false);
    setIsManageLoginModalOpen(true);
  };

  const handleCopyLoginEmail = (email) => {
    navigator.clipboard.writeText(email);
    setLoginCopied(true);
    showToast(`📋 Copied login email '${email}' to clipboard`);
    setTimeout(() => setLoginCopied(false), 3000);
  };

  const handleToggleInChargeStatus = async (service) => {
    if (!service.assignedInCharge) return;
    const newStatus = service.assignedInCharge.status === 'Active' ? 'Suspended' : 'Active';
    try {
      const res = await fetch(`/api/services/${service.id}/incharge/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Account status updated to ${newStatus} for ${service.assignedInCharge.name}`);
        setIsManageLoginModalOpen(false);
        await fetchServices();
      } else {
        alert(data.message || 'Failed to update account status');
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  // --- 4. RESET PASSWORD HANDLERS ---
  const handleOpenResetPassword = (service) => {
    setResetPasswordService(service);
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
      const res = await fetch(`/api/services/${resetPasswordService.id}/incharge/reset-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ password: resetPasswordForm.newPassword.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✨ Password updated successfully for ${resetPasswordService.assignedInCharge?.name}!`);
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

  // --- 5. ASSIGN / CHANGE IN-CHARGE MULTI-STEP MODAL STATE & HANDLERS ---
  const [assignStep, setAssignStep] = useState(1);
  const [personMode, setPersonMode] = useState('existing'); // 'existing' | 'new'
  const [allUsersList, setAllUsersList] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedExistingUser, setSelectedExistingUser] = useState(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [assignedPermissionsConfig, setAssignedPermissionsConfig] = useState({
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canPublish: true,
    canManageBookings: true
  });

  const fetchUsersForAssignment = async () => {
    try {
      const res = await fetch('/api/users', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        const devotees = Array.isArray(data) ? data : [];
        // Add sample staff / devotees if list is small
        const combined = [
          ...devotees,
          { id: 'usr-priya', name: 'Priya Sundaram', email: 'priya@darshanjourney.com', phone: '+91 98401 23456', designation: 'Pooja Archagar & In-Charge' },
          { id: 'usr-arun', name: 'Arun Kumar', email: 'arun@darshanjourney.com', phone: '+91 98402 34567', designation: 'Temple Superintendent' },
          { id: 'usr-kumar', name: 'Kumar Raj', email: 'kumar@darshanjourney.com', phone: '+91 98403 45678', designation: 'Senior Ritual Coordinator' },
          { id: 'usr-anitha', name: 'Anitha Sundar', email: 'anitha@darshanjourney.com', phone: '+91 98404 56789', designation: 'Prasadam In-Charge' }
        ];
        // Remove duplicates by email
        const unique = Array.from(new Map(combined.map(item => [item.email.toLowerCase(), item])).values());
        setAllUsersList(unique);
      }
    } catch (e) {
      setAllUsersList([
        { id: 'usr-priya', name: 'Priya Sundaram', email: 'priya@darshanjourney.com', phone: '+91 98401 23456', designation: 'Pooja Archagar & In-Charge' },
        { id: 'usr-arun', name: 'Arun Kumar', email: 'arun@darshanjourney.com', phone: '+91 98402 34567', designation: 'Temple Superintendent' },
        { id: 'usr-kumar', name: 'Kumar Raj', email: 'kumar@darshanjourney.com', phone: '+91 98403 45678', designation: 'Senior Ritual Coordinator' },
        { id: 'usr-anitha', name: 'Anitha Sundar', email: 'anitha@darshanjourney.com', phone: '+91 98404 56789', designation: 'Prasadam In-Charge' }
      ]);
    }
  };

  const handleOpenAssignInCharge = (service, isChange = false) => {
    setAssigningService(service);
    setAssignStep(1);
    setPersonMode('existing');
    setSelectedExistingUser(null);
    fetchUsersForAssignment();

    // Default subcategories belonging ONLY to this service
    let subcats = [];
    if (Array.isArray(service.subcategories) && service.subcategories.length > 0) {
      subcats = service.subcategories.map(s => s.id || s.slug || s.name);
    } else {
      subcats = ['abhishekam', 'archana', 'homam', 'special-pooja'];
    }
    setSelectedSubcategories(subcats);

    setAssignInChargeForm({
      name: isChange && service.assignedInCharge ? service.assignedInCharge.name : '',
      email: isChange && service.assignedInCharge ? service.assignedInCharge.email : '',
      phone: isChange && service.assignedInCharge ? (service.assignedInCharge.phone || '') : '',
      designation: `${service.name} In-Charge`,
      password: '',
      confirmPassword: '',
      status: 'Active'
    });

    setAssignedPermissionsConfig({
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
      canPublish: true,
      canManageBookings: true
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
      designation: user.designation || `${assigningService?.name || 'Service'} In-Charge`
    }));
  };

  const handleSaveMultiStepInCharge = async (e) => {
    e.preventDefault();
    if (!assigningService) return;

    if (assignInChargeForm.password && assignInChargeForm.confirmPassword && assignInChargeForm.password !== assignInChargeForm.confirmPassword) {
      alert('Passwords do not match. Please re-enter your password.');
      return;
    }

    setAssignSaving(true);

    try {
      // Build subcategories with permissions
      const allSubcats = Array.isArray(assigningService.subcategories) && assigningService.subcategories.length > 0
        ? assigningService.subcategories
        : [
            { id: 'abhishekam', name: 'Abhishekam', slug: 'abhishekam' },
            { id: 'archana', name: 'Archana', slug: 'archana' },
            { id: 'homam', name: 'Homam', slug: 'homam' },
            { id: 'special-pooja', name: 'Special Pooja', slug: 'special-pooja' }
          ];

      const activeSubcats = allSubcats.filter(s => selectedSubcategories.includes(s.id || s.slug || s.name));
      const finalPerms = activeSubcats.map(sub => ({
        subcategoryId: sub.id || sub.slug,
        name: sub.name,
        slug: sub.slug,
        canView: assignedPermissionsConfig.canView,
        canCreate: assignedPermissionsConfig.canCreate,
        canEdit: assignedPermissionsConfig.canEdit,
        canDelete: assignedPermissionsConfig.canDelete,
        canPublish: assignedPermissionsConfig.canPublish,
        canManageBookings: assignedPermissionsConfig.canManageBookings
      }));

      const res = await fetch(`/api/services/${assigningService.id}/assign-incharge`, {
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
          servicePermissions: finalPerms
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || `✨ Service In-Charge ${assignInChargeForm.name} assigned successfully!`);
        setIsAssignModalOpen(false);
        await fetchServices();
      } else {
        alert(data.message || 'Failed to assign Service In-Charge');
      }
    } catch (err) {
      alert('Error assigning Service In-Charge: ' + err.message);
    } finally {
      setAssignSaving(false);
    }
  };

  const handleDirectLaunchSubAdmin = async (service) => {
    if (!service?.assignedInCharge) return;
    try {
      const res = await fetch('/api/auth/subadmin-switch-session', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          subAdminId: service.assignedInCharge.id,
          email: service.assignedInCharge.email,
          serviceId: service.id
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        saveUserSession(data.token, data.user, true);
        window.location.href = data.redirectUrl || '/sub-admin/service/dashboard';
      } else {
        alert(data.message || 'Failed to activate Sub-Admin session');
      }
    } catch (err) {
      alert('Error launching Sub-Admin session: ' + err.message);
    }
  };

  // --- SERVICE ADD / EDIT HANDLERS ---
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      templeId: temples[0]?.id || 't-3',
      temple: temples[0]?.name || 'Kapaleeshwarar Temple',
      location: temples[0]?.location || 'Chennai',
      category: categories[0]?.name || 'Pooja Services',
      categorySlug: categories[0]?.slug || 'pooja-services',
      categoryTitle: categories[0]?.name || 'Pooja Services',
      subcategory: categories[0]?.subcategories?.[0]?.name || 'Abhishekam',
      subcategorySlug: categories[0]?.subcategories?.[0]?.slug || 'abhishekam',
      description: '',
      price: '₹501',
      numericPrice: 501,
      image: '',
      availability: 'Available Daily',
      status: 'Active'
    });
    setEditingService(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name || '',
      templeId: service.templeId || 't-3',
      temple: service.temple || 'Kapaleeshwarar Temple',
      location: service.location || 'Chennai',
      category: service.categoryTitle || service.category || 'Pooja Services',
      categorySlug: service.categorySlug || 'pooja-services',
      categoryTitle: service.categoryTitle || service.category || 'Pooja Services',
      subcategory: service.subcategory || 'Abhishekam',
      subcategorySlug: service.subcategorySlug || 'abhishekam',
      description: service.description || '',
      price: service.price || '₹501',
      numericPrice: service.numericPrice || 501,
      image: service.image || '',
      availability: service.availability || 'Available Daily',
      status: service.status || 'Active'
    });
    setIsAddModalOpen(true);
  };

  const handleSaveServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        const res = await fetch(`/api/services/${editingService.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          showToast(`✨ Service '${formData.name}' updated!`);
          await fetchServices();
          setIsAddModalOpen(false);
        } else {
          const d = await res.json().catch(() => ({}));
          alert(d.message || 'Failed to update service');
        }
      } else {
        const res = await fetch('/api/services', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          showToast(`🙏 Sacred service '${formData.name}' added to catalog!`);
          await fetchServices();
          setIsAddModalOpen(false);
        } else {
          const d = await res.json().catch(() => ({}));
          alert(d.message || 'Failed to create service');
        }
      }
    } catch (err) {
      alert('Error saving service: ' + err.message);
    }
  };

  const handleToggleServiceStatus = async (service) => {
    const newStatus = service.status === 'Active' ? 'Disabled' : 'Active';
    try {
      const res = await fetch(`/api/services/${service.id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Service status set to ${newStatus}`);
        setServices(prev => prev.map(s => s.id === service.id ? { ...s, status: newStatus } : s));
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.message || 'Failed to toggle status');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDeleteService = async (id) => {
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        showToast('Service removed from catalog');
        setServices(prev => prev.filter(s => s.id !== id));
        setDeleteConfirmId(null);
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.message || 'Failed to delete service');
      }
    } catch (err) {
      alert('Error deleting service: ' + err.message);
    }
  };

  // --- CATEGORY CRUD HANDLERS ---
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const res = await fetch(`/api/service-categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(catFormData)
        });
        if (res.ok) {
          showToast('Category updated');
          await fetchCategories();
          setIsCatModalOpen(false);
        }
      } else {
        const res = await fetch('/api/service-categories', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(catFormData)
        });
        if (res.ok) {
          showToast('Category created');
          await fetchCategories();
          setIsCatModalOpen(false);
        }
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/service-categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        showToast('Category deleted');
        await fetchCategories();
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // --- SUBCATEGORY CRUD HANDLERS ---
  const handleSaveSubcategory = async (e) => {
    e.preventDefault();
    if (!selectedParentCatId) return;
    try {
      if (editingSubcategory) {
        const res = await fetch(`/api/service-categories/${selectedParentCatId}/subcategories/${editingSubcategory.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(subFormData)
        });
        if (res.ok) {
          showToast('Subcategory updated');
          await fetchCategories();
          setIsSubModalOpen(false);
        }
      } else {
        const res = await fetch(`/api/service-categories/${selectedParentCatId}/subcategories`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(subFormData)
        });
        if (res.ok) {
          showToast('Subcategory added');
          await fetchCategories();
          setIsSubModalOpen(false);
        }
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDeleteSubcategory = async (catId, subId) => {
    if (!confirm('Delete this subcategory?')) return;
    try {
      const res = await fetch(`/api/service-categories/${catId}/subcategories/${subId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        showToast('Subcategory deleted');
        await fetchCategories();
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Filtering Services
  const filteredServices = services.filter(s => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = (
      (s.name || '').toLowerCase().includes(q) ||
      (s.temple || '').toLowerCase().includes(q) ||
      (s.location || '').toLowerCase().includes(q) ||
      (s.category || '').toLowerCase().includes(q) ||
      (s.subcategory || '').toLowerCase().includes(q) ||
      (s.assignedInCharge?.name || '').toLowerCase().includes(q) ||
      (s.assignedInCharge?.email || '').toLowerCase().includes(q)
    );

    const matchesTemple = selectedTempleFilter === 'ALL' || (s.temple || '').toLowerCase().includes(selectedTempleFilter.toLowerCase());
    const matchesCat = selectedCategory === 'all' || (s.categorySlug || s.category || '').toLowerCase() === selectedCategory.toLowerCase();
    const matchesSub = selectedSubcategory === 'all' || (s.subcategorySlug || s.subcategory || '').toLowerCase() === selectedSubcategory.toLowerCase();

    return matchesSearch && matchesTemple && matchesCat && matchesSub;
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="serif-title" style={{ fontSize: '1.8rem', color: '#FFFDF9', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Library size={28} style={{ color: 'var(--admin-gold)' }} />
            {isServiceSubAdmin ? 'My Assigned Service' : 'Sacred Services & Service In-Charge Management'}
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem' }}>
            {isServiceSubAdmin 
              ? `Manage offerings and bookings for ${currentUser.serviceName || 'your assigned temple service'}.` 
              : 'Every sacred service has its own dedicated Service In-Charge, sub-admin login account, and granular subcategory access.'
            }
          </p>
        </div>

        {isSuper && (
          <button
            onClick={handleOpenAdd}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
          >
            <Plus size={16} />
            Add New Service
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.8rem', borderBottom: '1px solid rgba(214, 181, 109, 0.2)', marginBottom: '1.8rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('temples')}
          style={{
            padding: '0.8rem 1.4rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'temples' ? '2px solid var(--admin-gold)' : '2px solid transparent',
            color: activeTab === 'temples' ? 'var(--admin-gold)' : 'var(--admin-text-muted)',
            fontWeight: activeTab === 'temples' ? 'bold' : 'normal',
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Landmark size={16} />
          Temple & Staff Hierarchy ({temples.length})
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          style={{
            padding: '0.8rem 1.4rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'catalog' ? '2px solid var(--admin-gold)' : '2px solid transparent',
            color: activeTab === 'catalog' ? 'var(--admin-gold)' : 'var(--admin-text-muted)',
            fontWeight: activeTab === 'catalog' ? 'bold' : 'normal',
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Library size={16} />
          Service Catalog ({services.length})
        </button>

        {isSuper && (
          <button
            onClick={() => setActiveTab('categories')}
            style={{
              padding: '0.8rem 1.4rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'categories' ? '2px solid var(--admin-gold)' : '2px solid transparent',
              color: activeTab === 'categories' ? 'var(--admin-gold)' : 'var(--admin-text-muted)',
              fontWeight: activeTab === 'categories' ? 'bold' : 'normal',
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Layers size={16} />
            Taxonomy & Subcategories ({categories.length})
          </button>
        )}
      </div>

      {/* TAB 0: TEMPLE & STAFF HIERARCHY (LEVEL 1: TEMPLES LIST) */}
      {activeTab === 'temples' && (
        <div>
          {/* Top Filters & Search Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.8rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flex: 1, minWidth: '280px', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search temples by name, location, deity..."
                  value={templeSearchTerm}
                  onChange={(e) => setTempleSearchTerm(e.target.value)}
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
                {templeSearchTerm && (
                  <button
                    onClick={() => setTempleSearchTerm('')}
                    style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--admin-text-muted)', cursor: 'pointer' }}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <select
                value={templeCategoryFilter}
                onChange={(e) => setTempleCategoryFilter(e.target.value)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(18, 9, 7, 0.6)',
                  border: '1px solid rgba(214, 181, 109, 0.25)',
                  borderRadius: '8px',
                  color: '#FFFDF9',
                  fontSize: '0.88rem'
                }}
              >
                <option value="ALL">All Deities & Categories</option>
                <option value="Shiva">Lord Shiva</option>
                <option value="Amman">Goddess Amman / Parvati</option>
                <option value="Vishnu">Lord Vishnu / Perumal</option>
                <option value="Murugan">Lord Murugan</option>
              </select>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--admin-gold)' }}>
              Showing {temples.filter(t => {
                const q = templeSearchTerm.toLowerCase();
                const matchesSearch = (t.name || '').toLowerCase().includes(q) || (t.location || '').toLowerCase().includes(q) || (t.district || '').toLowerCase().includes(q);
                const matchesCat = templeCategoryFilter === 'ALL' || (t.category || '').toLowerCase() === templeCategoryFilter.toLowerCase();
                return matchesSearch && matchesCat;
              }).length} of {temples.length} Sacred Temples
            </div>
          </div>

          {/* Temples Grid */}
          {temples.filter(t => {
            const q = templeSearchTerm.toLowerCase();
            const matchesSearch = (t.name || '').toLowerCase().includes(q) || (t.location || '').toLowerCase().includes(q) || (t.district || '').toLowerCase().includes(q);
            const matchesCat = templeCategoryFilter === 'ALL' || (t.category || '').toLowerCase() === templeCategoryFilter.toLowerCase();
            return matchesSearch && matchesCat;
          }).length === 0 ? (
            <div style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              backgroundColor: 'rgba(40, 24, 20, 0.4)',
              borderRadius: '12px',
              border: '1px dashed rgba(214, 181, 109, 0.25)'
            }}>
              <Landmark size={48} style={{ color: 'var(--admin-gold)', margin: '0 auto 1rem', opacity: 0.6 }} />
              <h3 className="serif-title" style={{ color: 'var(--admin-cream)', marginBottom: '0.5rem' }}>No Temples Found</h3>
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>No temples match the search term "{templeSearchTerm}".</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '1.5rem'
            }}>
              {temples.filter(t => {
                const q = templeSearchTerm.toLowerCase();
                const matchesSearch = (t.name || '').toLowerCase().includes(q) || (t.location || '').toLowerCase().includes(q) || (t.district || '').toLowerCase().includes(q);
                const matchesCat = templeCategoryFilter === 'ALL' || (t.category || '').toLowerCase() === templeCategoryFilter.toLowerCase();
                return matchesSearch && matchesCat;
              }).map((temple) => {
                const employeesCount = temple.employeesCount !== undefined ? temple.employeesCount : 4;
                return (
                  <motion.div
                    key={temple.id || temple._id}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => navigate(`/admin/services/temple/${temple.id || temple._id}/staff`)}
                    style={{
                      backgroundColor: 'var(--admin-bg-card)',
                      border: '1px solid rgba(214, 181, 109, 0.2)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--admin-gold)';
                      e.currentTarget.style.backgroundColor = 'var(--admin-bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(214, 181, 109, 0.2)';
                      e.currentTarget.style.backgroundColor = 'var(--admin-bg-card)';
                    }}
                  >
                    <div>
                      {/* Image Thumbnail with Overlay Badges */}
                      <div style={{ position: 'relative', height: '180px', backgroundColor: 'var(--admin-bg-deep)' }}>
                        <img
                          src={temple.image || temple.coverImage || 'https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=800&q=80'}
                          alt={temple.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: '0.75rem',
                          right: '0.75rem',
                          backgroundColor: temple.status === 'Active' ? 'rgba(142, 174, 104, 0.9)' : 'rgba(217, 160, 91, 0.9)',
                          color: '#120907',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          textTransform: 'uppercase'
                        }}>
                          {temple.status || 'Active'}
                        </div>

                        {temple.category && (
                          <div style={{
                            position: 'absolute',
                            bottom: '0.75rem',
                            left: '0.75rem',
                            backgroundColor: 'rgba(18, 9, 7, 0.85)',
                            border: '1px solid var(--admin-gold)',
                            color: 'var(--admin-gold-light)',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px'
                          }}>
                            {temple.category}
                          </div>
                        )}
                      </div>

                      {/* Content Card Body */}
                      <div style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--admin-gold)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                          <MapPin size={14} />
                          <span>{temple.location || temple.district || 'Tamil Nadu, India'}</span>
                        </div>

                        <h3 className="serif-title" style={{ fontSize: '1.15rem', color: 'var(--admin-off-white)', marginBottom: '0.65rem' }}>
                          {temple.name}
                        </h3>

                        <p style={{
                          color: 'var(--admin-text-muted)',
                          fontSize: '0.85rem',
                          lineHeight: '1.5',
                          marginBottom: '0.75rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {temple.description || temple.history || 'Ancient sacred heritage temple dedicated to divine worship, Vedic ceremonies, and spiritual enlightenment.'}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer: Employees count & Click action */}
                    <div style={{
                      padding: '0.85rem 1.25rem',
                      borderTop: '1px solid rgba(214, 181, 109, 0.12)',
                      backgroundColor: 'rgba(18, 9, 7, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--admin-gold-light)', fontSize: '0.82rem', fontWeight: 600 }}>
                        <Users size={15} style={{ color: 'var(--admin-gold)' }} />
                        <span>{employeesCount} Staff / Employees</span>
                      </div>

                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.8rem',
                        color: 'var(--admin-gold)',
                        fontWeight: 700
                      }}>
                        View Staff <ArrowRight size={14} />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 1: SERVICE CATALOG */}
      {activeTab === 'catalog' && (
        <div>
          {/* Filters Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.8rem' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
              <input
                type="text"
                placeholder="Search services, temples, or Service In-Charge name..."
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

            {isSuper && temples.length > 0 && (
              <select
                value={selectedTempleFilter}
                onChange={(e) => setSelectedTempleFilter(e.target.value)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(18, 9, 7, 0.8)',
                  border: '1px solid rgba(214, 181, 109, 0.25)',
                  borderRadius: '8px',
                  color: '#FFFDF9',
                  fontSize: '0.88rem'
                }}
              >
                <option value="ALL">All Temples</option>
                {temples.map(t => (
                  <option key={t.id} value={t.name}>{t.name} ({t.district || 'TN'})</option>
                ))}
              </select>
            )}

            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSubcategory('all');
              }}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(18, 9, 7, 0.8)',
                border: '1px solid rgba(214, 181, 109, 0.25)',
                borderRadius: '8px',
                color: '#FFFDF9',
                fontSize: '0.88rem'
              }}
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id || c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Grid of Services */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--admin-text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem' }} />
              Loading sacred services & In-Charge assignments...
            </div>
          ) : error ? (
            <div style={{ padding: '2rem', backgroundColor: 'rgba(192, 90, 78, 0.1)', border: '1px solid rgba(192, 90, 78, 0.3)', borderRadius: '12px', color: '#FFFDF9', textAlign: 'center' }}>
              <AlertCircle size={32} style={{ color: 'var(--admin-danger)', margin: '0 auto 0.5rem' }} />
              <p style={{ fontWeight: 'bold' }}>{error}</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'rgba(18, 9, 7, 0.4)', borderRadius: '12px', border: '1px dashed rgba(214, 181, 109, 0.2)' }}>
              <Library size={40} style={{ color: 'var(--admin-text-muted)', margin: '0 auto 1rem' }} />
              <h3 className="serif-title" style={{ color: '#FFFDF9', fontSize: '1.2rem', marginBottom: '0.4rem' }}>No Services Match Criteria</h3>
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>Try clearing filters or search keywords.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
              {filteredServices.map((service) => (
                <motion.div
                  key={service.id}
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
                    {/* Header Banner: Service Name, Temple & Status */}
                    <div style={{
                      padding: '1.2rem 1.4rem',
                      borderBottom: '1px solid rgba(214, 181, 109, 0.15)',
                      backgroundColor: 'rgba(18, 9, 7, 0.5)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}>
                      <div>
                        <div 
                          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', cursor: 'pointer' }}
                          onClick={() => navigate(`/admin/services/${service.id || service._id}`)}
                        >
                          <Library size={18} style={{ color: 'var(--admin-gold)' }} />
                          <h3 className="serif-title" style={{ fontSize: '1.25rem', color: '#FFFDF9', fontWeight: 'bold', textDecoration: 'underline', textDecorationColor: 'transparent', transition: 'text-decoration-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.textDecorationColor = 'var(--admin-gold)'} onMouseLeave={(e) => e.currentTarget.style.textDecorationColor = 'transparent'}>
                            {service.name}
                          </h3>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--admin-text-muted)', fontSize: '0.82rem' }}>
                          <Landmark size={12} style={{ color: 'var(--admin-gold)' }} />
                          <span>{service.temple || 'Kapaleeshwarar Temple'} — {service.location || 'Chennai'}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                        <span style={{
                          backgroundColor: service.status === 'Active' ? 'rgba(74, 140, 110, 0.2)' : 'rgba(192, 90, 78, 0.2)',
                          border: service.status === 'Active' ? '1px solid var(--admin-success)' : '1px solid var(--admin-danger)',
                          color: service.status === 'Active' ? 'var(--admin-success)' : 'var(--admin-danger)',
                          padding: '0.15rem 0.55rem',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: service.status === 'Active' ? 'var(--admin-success)' : 'var(--admin-danger)' }} />
                          {service.status === 'Active' ? 'Active' : 'Disabled'}
                        </span>
                        <span style={{ color: 'var(--admin-gold)', fontWeight: 'bold', fontSize: '0.95rem' }}>
                          {service.price}
                        </span>
                      </div>
                    </div>

                    {/* Service In-Charge Structured Section */}
                    <div style={{ padding: '1.2rem 1.4rem' }}>
                      <div 
                        style={{
                          backgroundColor: service.assignedInCharge ? 'rgba(214, 181, 109, 0.06)' : 'rgba(18, 9, 7, 0.4)',
                          border: service.assignedInCharge ? '1px solid rgba(214, 181, 109, 0.25)' : '1px dashed rgba(214, 181, 109, 0.2)',
                          borderRadius: '10px',
                          padding: '1.1rem',
                          marginBottom: '1rem',
                          cursor: service.assignedInCharge ? 'pointer' : 'default'
                        }}
                        onClick={() => {
                          if (service.assignedInCharge) {
                            navigate(`/admin/services/${service.assignedInCharge.id || service.id}`);
                          }
                        }}
                      >
                        {/* Section Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', borderBottom: '1px solid rgba(214, 181, 109, 0.12)', paddingBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <User size={15} style={{ color: 'var(--admin-gold)' }} />
                            <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--admin-gold)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Service In-Charge
                            </span>
                          </div>

                          {service.assignedInCharge && (
                            <span style={{
                              fontSize: '0.7rem',
                              padding: '0.12rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor: service.assignedInCharge.status === 'Active' ? 'rgba(74, 140, 110, 0.2)' : 'rgba(192, 90, 78, 0.2)',
                              color: service.assignedInCharge.status === 'Active' ? 'var(--admin-success)' : 'var(--admin-danger)',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}>
                              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: service.assignedInCharge.status === 'Active' ? 'var(--admin-success)' : 'var(--admin-danger)' }} />
                              {service.assignedInCharge.status}
                            </span>
                          )}
                        </div>

                        {service.assignedInCharge ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                            {/* Person Details */}
                            <div>
                              <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#FFFDF9', marginBottom: '0.1rem' }}>
                                {service.assignedInCharge.name}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--admin-gold)' }}>
                                {service.assignedInCharge.designation || 'Senior Service Supervisor'}
                              </div>
                            </div>

                            {/* Contact Details */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.25rem', fontSize: '0.78rem', color: 'var(--admin-cream)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Mail size={12} style={{ color: 'var(--admin-gold)' }} />
                                <span>{service.assignedInCharge.email}</span>
                              </div>
                              {service.assignedInCharge.phone && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <Phone size={12} style={{ color: 'var(--admin-gold)' }} />
                                  <span>{service.assignedInCharge.phone}</span>
                                </div>
                              )}
                            </div>

                            {/* Sub-Admin Account & Login Email */}
                            <div style={{ backgroundColor: 'rgba(18, 9, 7, 0.6)', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.15)', marginTop: '0.2rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', fontSize: '0.74rem' }}>
                                <span style={{ color: 'var(--admin-text-muted)' }}>Sub-Admin Login:</span>
                                <span style={{ color: 'var(--admin-gold)', fontWeight: '600' }}>{service.assignedInCharge.email}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem' }}>
                                <span style={{ color: 'var(--admin-text-muted)' }}>Service Access:</span>
                                <span style={{ color: '#FFFDF9' }}>{service.name}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem', fontSize: '0.74rem' }}>
                                <span style={{ color: 'var(--admin-text-muted)' }}>Subcategories:</span>
                                <span style={{ color: 'var(--admin-cream)', fontWeight: '500' }}>
                                  {service.subcategories?.length || 4} assigned ({service.subcategories?.map(s => s.name).join(', ') || 'Abhishekam, Archana, Homam, Special Pooja'})
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ padding: '0.5rem 0' }}>
                            <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                              No Sub-Admin In-Charge assigned to this service yet.
                            </p>
                            {isSuper && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenAssignInCharge(service);
                                }}
                                className="btn-primary"
                                style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                              >
                                <User size={13} />
                                Assign Service In-Charge
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 4 Action Buttons when In-Charge is assigned */}
                      {service.assignedInCharge ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.45rem' }}>
                          <button
                            onClick={() => navigate(`/admin/services/${service.assignedInCharge.id || service.id}`)}
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
                            View In-Charge Profile
                          </button>

                          {isSuper && (
                            <>
                              <button
                                onClick={() => handleOpenManageAccess(service)}
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
                                onClick={() => handleOpenManageLogin(service)}
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
                                onClick={() => handleOpenAssignInCharge(service, true)}
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
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div style={{ padding: '0.8rem 1.4rem', borderTop: '1px solid rgba(214, 181, 109, 0.12)', backgroundColor: 'rgba(18, 9, 7, 0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={() => handleToggleServiceStatus(service)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: service.status === 'Active' ? 'var(--admin-success)' : 'var(--admin-text-muted)',
                        fontSize: '0.78rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Power size={13} />
                      {service.status === 'Active' ? 'Offering Active' : 'Offering Disabled'}
                    </button>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleOpenEdit(service)}
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
                        Edit Service
                      </button>

                      {isSuper && (
                        <button
                          onClick={() => setDeleteConfirmId(service.id)}
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
        </div>
      )}

      {/* TAB 2: TAXONOMY & SUBCATEGORIES */}
      {activeTab === 'categories' && isSuper && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 className="serif-title" style={{ fontSize: '1.3rem', color: '#FFFDF9' }}>
                Service Categories & Subcategory Hierarchy
              </h2>
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.84rem' }}>
                Define sacred categories and granular subcategories assigned to Service In-Charges.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCategory(null);
                setCatFormData({ name: '', slug: '', description: '', status: 'Active' });
                setIsCatModalOpen(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1.1rem',
                backgroundColor: 'rgba(214, 181, 109, 0.15)',
                border: '1px solid var(--admin-gold)',
                color: 'var(--admin-gold)',
                borderRadius: '6px',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <FolderPlus size={15} /> Add Category
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {categories.map((cat) => (
              <div
                key={cat.id || cat.slug}
                style={{
                  backgroundColor: 'rgba(30, 16, 12, 0.5)',
                  border: '1px solid rgba(214, 181, 109, 0.2)',
                  borderRadius: '10px',
                  padding: '1.2rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', borderBottom: '1px solid rgba(214, 181, 109, 0.1)', paddingBottom: '0.6rem' }}>
                  <div>
                    <h3 className="serif-title" style={{ color: '#FFFDF9', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Layers size={16} style={{ color: 'var(--admin-gold)' }} />
                      {cat.name}
                      <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontFamily: 'monospace' }}>({cat.slug})</span>
                    </h3>
                    <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>{cat.description || 'Standard service category.'}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setSelectedParentCatId(cat.id || cat.slug);
                        setEditingSubcategory(null);
                        setSubFormData({ name: '', slug: '', description: '', status: 'Active' });
                        setIsSubModalOpen(true);
                      }}
                      style={{
                        padding: '0.35rem 0.7rem',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(214, 181, 109, 0.3)',
                        color: 'var(--admin-gold)',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <Plus size={12} /> Add Subcategory
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setCatFormData({ name: cat.name, slug: cat.slug, description: cat.description || '', status: cat.status || 'Active' });
                        setIsCatModalOpen(true);
                      }}
                      style={{
                        padding: '0.35rem 0.6rem',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(214, 181, 109, 0.2)',
                        color: 'var(--admin-cream)',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id || cat.slug)}
                      style={{
                        padding: '0.35rem 0.6rem',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(192, 90, 78, 0.3)',
                        color: 'var(--admin-danger)',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Subcategories list */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {(cat.subcategories || []).map((sub) => (
                    <div
                      key={sub.id || sub.slug}
                      style={{
                        backgroundColor: 'rgba(18, 9, 7, 0.7)',
                        border: '1px solid rgba(214, 181, 109, 0.15)',
                        borderRadius: '6px',
                        padding: '0.45rem 0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        fontSize: '0.8rem',
                        color: '#FFFDF9'
                      }}
                    >
                      <Tag size={12} style={{ color: 'var(--admin-gold)' }} />
                      <span>{sub.name}</span>
                      <button
                        onClick={() => {
                          setSelectedParentCatId(cat.id || cat.slug);
                          setEditingSubcategory(sub);
                          setSubFormData({ name: sub.name, slug: sub.slug, description: sub.description || '', status: sub.status || 'Active' });
                          setIsSubModalOpen(true);
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--admin-text-muted)', cursor: 'pointer', padding: 0 }}
                      >
                        <Edit3 size={11} />
                      </button>
                      <button
                        onClick={() => handleDeleteSubcategory(cat.id || cat.slug, sub.id || sub.slug)}
                        style={{ background: 'none', border: 'none', color: 'var(--admin-danger)', cursor: 'pointer', padding: 0 }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {(!cat.subcategories || cat.subcategories.length === 0) && (
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', fontStyle: 'italic' }}>
                      No subcategories configured yet.
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. VIEW IN-CHARGE DETAILED MODAL                                           */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {viewingInChargeService && viewingInChargeService.assignedInCharge && (
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
            onClick={() => setViewingInChargeService(null)}
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
                maxWidth: '620px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '2rem',
                boxShadow: '0 20px 60px rgba(0,0,0,0.85)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setViewingInChargeService(null)}
                style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'none', border: 'none', color: '#FFFDF9', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                <User size={24} style={{ color: 'var(--admin-gold)' }} />
                <h3 className="serif-title" style={{ fontSize: '1.35rem', color: '#FFFDF9' }}>
                  Service In-Charge Details
                </h3>
              </div>
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem', marginBottom: '1.4rem' }}>
                Administrative profile and active access scope for <strong>{viewingInChargeService.name}</strong>.
              </p>

              {/* Profile Card */}
              <div style={{ backgroundColor: 'rgba(18, 9, 7, 0.6)', border: '1px solid rgba(214, 181, 109, 0.2)', borderRadius: '10px', padding: '1.2rem', marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#FFFDF9', marginBottom: '0.15rem' }}>
                      {viewingInChargeService.assignedInCharge.name}
                    </h4>
                    <span style={{ color: 'var(--admin-gold)', fontSize: '0.82rem', fontWeight: '600' }}>
                      {viewingInChargeService.assignedInCharge.designation || 'Service Supervisor'}
                    </span>
                  </div>
                  <span style={{
                    backgroundColor: viewingInChargeService.assignedInCharge.status === 'Active' ? 'rgba(74, 140, 110, 0.2)' : 'rgba(192, 90, 78, 0.2)',
                    border: viewingInChargeService.assignedInCharge.status === 'Active' ? '1px solid var(--admin-success)' : '1px solid var(--admin-danger)',
                    color: viewingInChargeService.assignedInCharge.status === 'Active' ? 'var(--admin-success)' : 'var(--admin-danger)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.74rem',
                    fontWeight: 'bold'
                  }}>
                    🟢 {viewingInChargeService.assignedInCharge.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', fontSize: '0.82rem', borderTop: '1px solid rgba(214, 181, 109, 0.1)', paddingTop: '0.8rem' }}>
                  <div>
                    <span style={{ color: 'var(--admin-text-muted)', display: 'block', fontSize: '0.74rem' }}>Login Email / Username</span>
                    <strong style={{ color: '#FFFDF9' }}>{viewingInChargeService.assignedInCharge.email}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--admin-text-muted)', display: 'block', fontSize: '0.74rem' }}>Phone Number</span>
                    <strong style={{ color: '#FFFDF9' }}>{viewingInChargeService.assignedInCharge.phone || 'Not Specified'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--admin-text-muted)', display: 'block', fontSize: '0.74rem' }}>Assigned Service</span>
                    <strong style={{ color: 'var(--admin-gold)' }}>{viewingInChargeService.name}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--admin-text-muted)', display: 'block', fontSize: '0.74rem' }}>Temple Shrine</span>
                    <strong style={{ color: '#FFFDF9' }}>{viewingInChargeService.temple || 'Kapaleeshwarar Temple'}</strong>
                  </div>
                </div>
              </div>

              {/* Assigned Subcategories & Permissions */}
              <div style={{ backgroundColor: 'rgba(18, 9, 7, 0.6)', border: '1px solid rgba(214, 181, 109, 0.2)', borderRadius: '10px', padding: '1.2rem', marginBottom: '1.4rem' }}>
                <h5 style={{ fontSize: '0.86rem', fontWeight: 'bold', color: 'var(--admin-gold)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.8rem' }}>
                  Assigned Subcategories & Granular Permissions
                </h5>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {(viewingInChargeService.assignedInCharge.servicePermissions?.length > 0
                    ? viewingInChargeService.assignedInCharge.servicePermissions
                    : (viewingInChargeService.subcategories || [
                        { name: 'Abhishekam', canView: true, canCreate: true, canEdit: true, canDelete: false, canPublish: true, canManageBookings: true },
                        { name: 'Archana', canView: true, canCreate: true, canEdit: true, canDelete: false, canPublish: true, canManageBookings: true },
                        { name: 'Homam', canView: true, canCreate: true, canEdit: false, canDelete: false, canPublish: true, canManageBookings: true },
                        { name: 'Special Pooja', canView: true, canCreate: false, canEdit: false, canDelete: false, canPublish: false, canManageBookings: true }
                      ])
                  ).map((perm, idx) => (
                    <div key={idx} style={{ backgroundColor: 'rgba(30, 16, 12, 0.6)', border: '1px solid rgba(214, 181, 109, 0.15)', borderRadius: '6px', padding: '0.6rem 0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#FFFDF9' }}>
                          ✓ {perm.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', fontSize: '0.72rem' }}>
                        <span style={{ color: perm.canView !== false ? 'var(--admin-success)' : 'var(--admin-text-muted)' }}>View {perm.canView !== false ? '✓' : '✕'}</span>
                        <span style={{ color: 'var(--admin-text-muted)' }}>•</span>
                        <span style={{ color: perm.canCreate ? 'var(--admin-success)' : 'var(--admin-text-muted)' }}>Create {perm.canCreate ? '✓' : '✕'}</span>
                        <span style={{ color: 'var(--admin-text-muted)' }}>•</span>
                        <span style={{ color: perm.canEdit ? 'var(--admin-success)' : 'var(--admin-text-muted)' }}>Edit {perm.canEdit ? '✓' : '✕'}</span>
                        <span style={{ color: 'var(--admin-text-muted)' }}>•</span>
                        <span style={{ color: perm.canDelete ? 'var(--admin-success)' : 'var(--admin-text-muted)' }}>Delete {perm.canDelete ? '✓' : '✕'}</span>
                        <span style={{ color: 'var(--admin-text-muted)' }}>•</span>
                        <span style={{ color: perm.canPublish ? 'var(--admin-success)' : 'var(--admin-text-muted)' }}>Publish {perm.canPublish ? '✓' : '✕'}</span>
                        <span style={{ color: 'var(--admin-text-muted)' }}>•</span>
                        <span style={{ color: perm.canManageBookings ? 'var(--admin-success)' : 'var(--admin-text-muted)' }}>Manage Bookings {perm.canManageBookings ? '✓' : '✕'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    const s = viewingInChargeService;
                    setViewingInChargeService(null);
                    handleOpenManageLogin(s);
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
                        const s = viewingInChargeService;
                        setViewingInChargeService(null);
                        handleOpenManageAccess(s);
                      }}
                      className="btn-primary"
                      style={{ padding: '0.6rem 1.2rem', fontSize: '0.82rem' }}
                    >
                      <SlidersHorizontal size={14} /> Configure Access
                    </button>
                  )}
                  <button
                    onClick={() => setViewingInChargeService(null)}
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
        {isAccessModalOpen && accessModalService && (
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
                maxWidth: '680px',
                maxHeight: '90vh',
                overflowY: 'auto',
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
                <SlidersHorizontal size={24} style={{ color: 'var(--admin-gold)' }} />
                <h3 className="serif-title" style={{ fontSize: '1.35rem', color: '#FFFDF9' }}>
                  Manage Access & Permissions
                </h3>
              </div>
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem', marginBottom: '1.2rem' }}>
                Configure assigned subcategories and action permissions for <strong>{accessModalService.assignedInCharge?.name}</strong> ({accessModalService.name}).
              </p>

              <form onSubmit={handleSaveAccessPermissions}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '1.5rem' }}>
                  {accessPermissionsForm.map((perm) => (
                    <div
                      key={perm.subcategoryId}
                      style={{
                        backgroundColor: 'rgba(18, 9, 7, 0.65)',
                        border: '1px solid rgba(214, 181, 109, 0.2)',
                        borderRadius: '8px',
                        padding: '0.9rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <div>
                          <span style={{ fontSize: '0.92rem', fontWeight: 'bold', color: '#FFFDF9' }}>
                            {perm.name}
                          </span>
                          {perm.description && (
                            <span style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)', marginLeft: '0.4rem' }}>
                              ({perm.description})
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleAllPermissionsForSub(perm.subcategoryId, true)}
                            style={{ background: 'none', border: 'none', color: 'var(--admin-gold)', fontSize: '0.74rem', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            Grant All
                          </button>
                          <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.74rem' }}>|</span>
                          <button
                            type="button"
                            onClick={() => handleToggleAllPermissionsForSub(perm.subcategoryId, false)}
                            style={{ background: 'none', border: 'none', color: 'var(--admin-danger)', fontSize: '0.74rem', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            Revoke
                          </button>
                        </div>
                      </div>

                      {/* Checkboxes */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem' }}>
                        {PERMISSION_ACTIONS.map(action => {
                          const isChecked = perm[action.key] !== false && perm[action.key] !== undefined ? perm[action.key] : false;
                          return (
                            <label
                              key={action.key}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                fontSize: '0.78rem',
                                color: isChecked ? 'var(--admin-cream)' : 'var(--admin-text-muted)',
                                cursor: 'pointer',
                                padding: '0.35rem 0.5rem',
                                borderRadius: '4px',
                                backgroundColor: isChecked ? 'rgba(214, 181, 109, 0.1)' : 'transparent',
                                border: isChecked ? '1px solid rgba(214, 181, 109, 0.3)' : '1px solid transparent'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleSubPermission(perm.subcategoryId, action.key)}
                                style={{ accentColor: 'var(--admin-gold)', cursor: 'pointer' }}
                              />
                              <span>{action.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
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
                    {accessSaving ? 'Saving Access...' : 'Save Access'}
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
        {isManageLoginModalOpen && manageLoginService && manageLoginService.assignedInCharge && (
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
                <Lock size={22} style={{ color: 'var(--admin-gold)' }} />
                <h3 className="serif-title" style={{ fontSize: '1.35rem', color: '#FFFDF9' }}>
                  Sub-Admin Account Management
                </h3>
              </div>

              {/* Sub-Admin Account Information Card */}
              <div style={{ backgroundColor: 'rgba(18, 9, 7, 0.75)', border: '1px solid rgba(214, 181, 109, 0.25)', borderRadius: '10px', padding: '1.25rem', margin: '1rem 0 1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', fontSize: '0.84rem' }}>
                  <div>
                    <span style={{ color: 'var(--admin-text-muted)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase' }}>Person</span>
                    <strong style={{ color: '#FFFDF9', fontSize: '0.95rem' }}>{manageLoginService.assignedInCharge.name}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--admin-text-muted)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase' }}>Role</span>
                    <strong style={{ color: '#8EAE68', fontSize: '0.88rem' }}>Service Sub-Admin</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--admin-text-muted)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase' }}>Assigned Service</span>
                    <strong style={{ color: '#FFFDF9' }}>{manageLoginService.name}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--admin-text-muted)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase' }}>Temple</span>
                    <strong style={{ color: '#FFFDF9' }}>{manageLoginService.temple || 'Kapaleeshwarar Temple — Chennai'}</strong>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(214, 181, 109, 0.15)', paddingTop: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <div>
                      <span style={{ color: 'var(--admin-text-muted)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase' }}>Login Email</span>
                      <strong style={{ color: 'var(--admin-gold)', fontSize: '0.92rem' }}>{manageLoginService.assignedInCharge.email}</strong>
                    </div>
                    <button
                      onClick={() => handleCopyLoginEmail(manageLoginService.assignedInCharge.email)}
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
                        color: manageLoginService.assignedInCharge.status === 'Active' ? '#8EAE68' : 'var(--admin-danger)',
                        fontWeight: 'bold',
                        fontSize: '0.82rem'
                      }}>
                        🟢 {manageLoginService.assignedInCharge.status || 'Active'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--admin-text-muted)', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase' }}>Login Destination</span>
                      <span style={{ color: 'var(--admin-gold)', fontWeight: '600', fontSize: '0.8rem' }}>
                        Service Sub-Admin Dashboard
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
                      const s = manageLoginService;
                      setIsManageLoginModalOpen(false);
                      handleOpenResetPassword(s);
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
                    onClick={() => handleToggleInChargeStatus(manageLoginService)}
                    style={{
                      padding: '0.6rem 1rem',
                      borderRadius: '6px',
                      border: '1px solid rgba(192, 90, 78, 0.35)',
                      backgroundColor: 'transparent',
                      color: manageLoginService.assignedInCharge.status === 'Active' ? 'var(--admin-danger)' : 'var(--admin-success)',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Power size={14} /> {manageLoginService.assignedInCharge.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                  </button>
                </div>

                <button
                  onClick={() => handleDirectLaunchSubAdmin(manageLoginService)}
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
        {isResetPasswordModalOpen && resetPasswordService && resetPasswordService.assignedInCharge && (
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
                  <strong style={{ color: '#FFFDF9' }}>{resetPasswordService.assignedInCharge.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--admin-text-muted)' }}>Login Email:</span>
                  <strong style={{ color: 'var(--admin-gold)' }}>{resetPasswordService.assignedInCharge.email}</strong>
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
      {/* 5. MULTI-STEP ASSIGN / CHANGE SERVICE IN-CHARGE WIZARD                    */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAssignModalOpen && assigningService && (
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
                <User size={22} style={{ color: 'var(--admin-gold)' }} />
                <h3 className="serif-title" style={{ fontSize: '1.35rem', color: '#FFFDF9' }}>
                  Assign Service In-Charge
                </h3>
              </div>
              <p style={{ color: 'var(--admin-gold)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                {assigningService.name} &nbsp;·&nbsp; {assigningService.temple || 'Kapaleeshwarar Temple — Chennai'}
              </p>

              {/* 4-Step Progress Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.75rem', position: 'relative' }}>
                {[
                  { step: 1, label: '1. Person' },
                  { step: 2, label: '2. Account' },
                  { step: 3, label: '3. Subcategories' },
                  { step: 4, label: '4. Permissions' }
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
                        placeholder="Search person (e.g. Priya, Arun, Kumar, Anitha)..."
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
                          placeholder="e.g. Priya Sundaram"
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
                            placeholder="priya@darshanjourney.com"
                            value={assignInChargeForm.email}
                            onChange={(e) => setAssignInChargeForm(prev => ({ ...prev, email: e.target.value }))}
                            style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', fontSize: '0.88rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--admin-cream)', marginBottom: '0.3rem' }}>Contact Phone</label>
                          <input
                            type="tel"
                            placeholder="+91 98401 23456"
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
                          placeholder="Service In-Charge"
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

              {/* STEP 2: CREATE SUB-ADMIN ACCOUNT */}
              {assignStep === 2 && (
                <div>
                  <div style={{ backgroundColor: 'rgba(18, 9, 7, 0.6)', border: '1px solid rgba(214, 181, 109, 0.2)', borderRadius: '8px', padding: '0.9rem', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Selected In-Charge</span>
                    <div style={{ fontWeight: '700', color: '#FFFDF9', fontSize: '0.95rem' }}>{assignInChargeForm.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--admin-gold)' }}>Role: Service Sub-Admin</div>
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
                      Assign Subcategories →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: ASSIGN SUBCATEGORIES */}
              {assignStep === 3 && (
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--admin-gold)', fontWeight: '600' }}>
                      Select Subcategories for {assigningService.name}:
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', margin: '0.2rem 0 0' }}>
                      Only offerings belonging strictly to this service are shown.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {(Array.isArray(assigningService.subcategories) && assigningService.subcategories.length > 0 ? assigningService.subcategories : [
                      { id: 'abhishekam', name: 'Abhishekam', slug: 'abhishekam' },
                      { id: 'archana', name: 'Archana', slug: 'archana' },
                      { id: 'homam', name: 'Homam', slug: 'homam' },
                      { id: 'special-pooja', name: 'Special Pooja', slug: 'special-pooja' }
                    ]).map((sub) => {
                      const subId = sub.id || sub.slug || sub.name;
                      const isSelected = selectedSubcategories.includes(subId);
                      return (
                        <label
                          key={subId}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            backgroundColor: isSelected ? 'rgba(142, 174, 104, 0.15)' : 'rgba(18, 9, 7, 0.4)',
                            border: isSelected ? '1px solid #8EAE68' : '1px solid rgba(214, 181, 109, 0.15)',
                            cursor: 'pointer'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              if (isSelected) {
                                setSelectedSubcategories(selectedSubcategories.filter(id => id !== subId));
                              } else {
                                setSelectedSubcategories([...selectedSubcategories, subId]);
                              }
                            }}
                            style={{ accentColor: '#8EAE68', width: '16px', height: '16px' }}
                          />
                          <div>
                            <span style={{ fontWeight: '600', color: '#FFFDF9', fontSize: '0.9rem' }}>{sub.name}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', display: 'block' }}>/{sub.slug || 'offering'}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => setAssignStep(2)}
                      style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', background: 'transparent', color: 'var(--admin-text-muted)', cursor: 'pointer' }}
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      disabled={selectedSubcategories.length === 0}
                      onClick={() => setAssignStep(4)}
                      style={{ padding: '0.6rem 1.5rem', borderRadius: '6px', border: 'none', backgroundColor: '#8EAE68', color: '#120907', fontWeight: '700', cursor: selectedSubcategories.length === 0 ? 'not-allowed' : 'pointer' }}
                    >
                      Configure Permissions →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: ASSIGN PERMISSIONS */}
              {assignStep === 4 && (
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--admin-gold)', fontWeight: '600' }}>
                      Configure Operational Permissions:
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', margin: '0.2rem 0 0' }}>
                      Select which capabilities this Service Sub-Admin will have over the {selectedSubcategories.length} selected subcategories.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1.5rem' }}>
                    {[
                      { key: 'canView', label: 'View Offerings & Ledger' },
                      { key: 'canCreate', label: 'Create New Offerings' },
                      { key: 'canEdit', label: 'Edit Offerings & Prices' },
                      { key: 'canDelete', label: 'Delete Offerings' },
                      { key: 'canPublish', label: 'Publish / Unpublish' },
                      { key: 'canManageBookings', label: 'Manage & Confirm Bookings' }
                    ].map(p => (
                      <label
                        key={p.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.6rem 0.75rem',
                          borderRadius: '6px',
                          backgroundColor: assignedPermissionsConfig[p.key] ? 'rgba(142, 174, 104, 0.15)' : 'rgba(18, 9, 7, 0.4)',
                          border: assignedPermissionsConfig[p.key] ? '1px solid #8EAE68' : '1px solid rgba(214, 181, 109, 0.15)',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          color: assignedPermissionsConfig[p.key] ? '#FFFDF9' : 'var(--admin-text-muted)'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={assignedPermissionsConfig[p.key]}
                          onChange={(e) => setAssignedPermissionsConfig({ ...assignedPermissionsConfig, [p.key]: e.target.checked })}
                          style={{ accentColor: '#8EAE68' }}
                        />
                        <span>{p.label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Summary Card */}
                  <div style={{ backgroundColor: 'rgba(18, 9, 7, 0.6)', border: '1px solid rgba(214, 181, 109, 0.2)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.25rem', fontSize: '0.78rem' }}>
                    <div style={{ color: 'var(--admin-gold)', fontWeight: '700', marginBottom: '0.3rem' }}>Assignment Summary:</div>
                    <div style={{ color: '#FFFDF9' }}>👤 In-Charge: <strong>{assignInChargeForm.name}</strong> ({assignInChargeForm.email})</div>
                    <div style={{ color: '#FFFDF9' }}>🛕 Service: <strong>{assigningService.name}</strong> ({assigningService.temple || 'Kapaleeshwarar Temple'})</div>
                    <div style={{ color: '#FFFDF9' }}>🏷️ Subcategories: <strong>{selectedSubcategories.length} items</strong></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button
                      type="button"
                      onClick={() => setAssignStep(3)}
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

      {/* SERVICE ADD / EDIT MODAL */}
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
                {editingService ? 'Edit Service Offering' : 'Add New Sacred Service'}
              </h3>

              <form onSubmit={handleSaveServiceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                    Service Offering Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Pooja Service or Special Abhishekam"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                      Associated Temple Shrine *
                    </label>
                    <select
                      value={formData.temple}
                      onChange={(e) => {
                        const selectedT = temples.find(t => t.name === e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          temple: e.target.value,
                          templeId: selectedT?.id || prev.templeId,
                          location: selectedT?.location || selectedT?.district || prev.location
                        }));
                      }}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.8)', color: '#FFFDF9', fontSize: '0.88rem' }}
                    >
                      {temples.map(t => (
                        <option key={t.id} value={t.name}>{t.name} ({t.district || 'TN'})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                      Price (₹) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.price}
                      onChange={(e) => {
                        const val = e.target.value;
                        const num = parseInt(val.replace(/[^0-9]/g, '')) || 0;
                        setFormData(prev => ({ ...prev, price: val, numericPrice: num }));
                      }}
                      placeholder="e.g. ₹501"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                      Category *
                    </label>
                    <select
                      value={formData.categorySlug}
                      onChange={(e) => {
                        const selectedCat = categories.find(c => c.slug === e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          categorySlug: e.target.value,
                          category: selectedCat?.name || e.target.value,
                          categoryTitle: selectedCat?.name || e.target.value
                        }));
                      }}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.8)', color: '#FFFDF9', fontSize: '0.88rem' }}
                    >
                      {categories.map(c => (
                        <option key={c.id || c.slug} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                      Subcategory *
                    </label>
                    <input
                      type="text"
                      value={formData.subcategory}
                      onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value, subcategorySlug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))}
                      placeholder="e.g. Abhishekam, Archana, Homam"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                    Service Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Vedic puja seva details, ritual procedure, and sacred blessings..."
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                  />
                </div>

                <ImageUploader
                  label="Service Offering Image"
                  value={formData.image}
                  onChange={(newUrl) => setFormData(prev => ({ ...prev, image: newUrl }))}
                  defaultImage="https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80"
                  helperText="Upload image or specify photo URL."
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
                    {editingService ? 'Update Service' : 'Save Service'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CATEGORY MODAL */}
      <AnimatePresence>
        {isCatModalOpen && (
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
            onClick={() => setIsCatModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              style={{
                backgroundColor: 'var(--admin-bg-deep)',
                border: '1px solid var(--admin-gold)',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '480px',
                padding: '1.8rem',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="serif-title" style={{ fontSize: '1.2rem', color: '#FFFDF9', marginBottom: '1.2rem' }}>
                {editingCategory ? 'Edit Service Category' : 'Add New Category'}
              </h3>
              <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Name *</label>
                  <input
                    type="text"
                    required
                    value={catFormData.name}
                    onChange={(e) => setCatFormData(prev => ({ ...prev, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Slug</label>
                  <input
                    type="text"
                    value={catFormData.slug}
                    onChange={(e) => setCatFormData(prev => ({ ...prev, slug: e.target.value }))}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Description</label>
                  <textarea
                    rows={2}
                    value={catFormData.description}
                    onChange={(e) => setCatFormData(prev => ({ ...prev, description: e.target.value }))}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setIsCatModalOpen(false)} style={{ padding: '0.55rem 1.2rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', background: 'transparent', color: '#FFFDF9', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '0.55rem 1.4rem', borderRadius: '6px', border: '1px solid var(--admin-gold)', background: 'var(--admin-gold)', color: '#120907', fontWeight: 'bold', cursor: 'pointer' }}>Save Category</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUBCATEGORY MODAL */}
      <AnimatePresence>
        {isSubModalOpen && (
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
            onClick={() => setIsSubModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              style={{
                backgroundColor: 'var(--admin-bg-deep)',
                border: '1px solid var(--admin-gold)',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '480px',
                padding: '1.8rem',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="serif-title" style={{ fontSize: '1.2rem', color: '#FFFDF9', marginBottom: '1.2rem' }}>
                {editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
              </h3>
              <form onSubmit={handleSaveSubcategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Subcategory Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abhishekam, Archana, Homam"
                    value={subFormData.name}
                    onChange={(e) => setSubFormData(prev => ({ ...prev, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Slug</label>
                  <input
                    type="text"
                    value={subFormData.slug}
                    onChange={(e) => setSubFormData(prev => ({ ...prev, slug: e.target.value }))}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Description</label>
                  <textarea
                    rows={2}
                    value={subFormData.description}
                    onChange={(e) => setSubFormData(prev => ({ ...prev, description: e.target.value }))}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setIsSubModalOpen(false)} style={{ padding: '0.55rem 1.2rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', background: 'transparent', color: '#FFFDF9', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '0.55rem 1.4rem', borderRadius: '6px', border: '1px solid var(--admin-gold)', background: 'var(--admin-gold)', color: '#120907', fontWeight: 'bold', cursor: 'pointer' }}>Save Subcategory</button>
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
                Confirm Service Removal
              </h4>
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.86rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                Are you sure you want to remove this sacred offering from the service catalog?
              </p>
              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  style={{ padding: '0.55rem 1.2rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.2)', background: 'transparent', color: '#FFFDF9', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteService(deleteConfirmId)}
                  style={{ padding: '0.55rem 1.4rem', borderRadius: '6px', border: '1px solid var(--admin-danger)', background: 'var(--admin-danger)', color: '#FFFDF9', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Delete Service
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
