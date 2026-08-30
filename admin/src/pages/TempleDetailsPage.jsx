import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Landmark, Users, Calendar, Clock, MapPin, 
  Sparkles, Plus, Search, Filter, Mail, Phone, ShieldCheck, 
  Briefcase, CheckCircle2, AlertCircle, ChevronRight, UserCheck, 
  Layers, ExternalLink, X, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthHeaders } from '../utils/auth';

export default function TempleDetailsPage() {
  const { templeId } = useParams();
  const navigate = useNavigate();
  const cleanTempleId = (templeId || '').replace(/^:/, '');

  const [temple, setTemple] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Add Employee Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    role: 'Temple Staff',
    designation: 'Temple Staff',
    department: 'Administration & Operations',
    email: '',
    phone: '',
    shift: 'General (8:00 AM - 5:00 PM)',
    status: 'Active',
    image: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const targetTempleId = cleanTempleId || 't-1';
      // 1. Fetch Temple Details
      const templeRes = await fetch(`/api/temples/${targetTempleId}`, {
        headers: getAuthHeaders()
      });
      
      let templeData = null;
      if (templeRes.ok) {
        templeData = await templeRes.json();
        setTemple(templeData);
      } else {
        // Fallback: fetch all temples and search by ID
        const allTemplesRes = await fetch('/api/temples', { headers: getAuthHeaders() });
        if (allTemplesRes.ok) {
          const list = await allTemplesRes.json();
          templeData = list.find(t => t.id === targetTempleId || t._id === targetTempleId);
          if (templeData) setTemple(templeData);
        }
      }

      if (!templeData) {
        throw new Error('Temple not found or could not be loaded.');
      }

      // 2. Fetch Employees for this specific temple
      const empRes = await fetch(`/api/employees?templeId=${targetTempleId}`, {
        headers: getAuthHeaders()
      });
      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(Array.isArray(empData) ? empData : []);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error('Error loading temple details:', err);
      setError(err.message || 'Unable to load temple details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [templeId]);

  const handleAddEmployeeSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          templeId: temple.id || templeId,
          templeName: temple.name
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✨ ${formData.name} added to ${temple.name}!`);
        setIsAddModalOpen(false);
        setFormData({
          name: '',
          role: 'Temple Staff',
          designation: 'Temple Staff',
          department: 'Administration & Operations',
          email: '',
          phone: '',
          shift: 'General (8:00 AM - 5:00 PM)',
          status: 'Active',
          image: ''
        });
        await fetchData();
      } else {
        alert(data.message || 'Failed to add employee');
      }
    } catch (err) {
      alert('Error creating employee: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Distinct departments for filter
  const departments = ['ALL', ...Array.from(new Set(employees.map(e => e.department).filter(Boolean)))];

  // Filtered employees
  const filteredEmployees = employees.filter(e => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = (
      (e.name || '').toLowerCase().includes(q) ||
      (e.role || '').toLowerCase().includes(q) ||
      (e.designation || '').toLowerCase().includes(q) ||
      (e.department || '').toLowerCase().includes(q) ||
      (e.email || '').toLowerCase().includes(q) ||
      (e.phone || '').toLowerCase().includes(q)
    );
    const matchesDept = selectedDept === 'ALL' || e.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Summary Metrics
  const totalEmployeesCount = employees.length;
  const activeEmployeesCount = employees.filter(e => (e.status || 'Active').toLowerCase() === 'active').length;
  const totalTasksCount = employees.reduce((sum, e) => sum + (e.assignedWorksCount || 0), 0);

  if (loading) {
    return (
      <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <RefreshCw size={36} className="spin-slow" style={{ color: 'var(--admin-gold)', margin: '0 auto 1rem' }} />
        <h3 className="serif-title" style={{ color: 'var(--admin-cream)', marginBottom: '0.5rem' }}>Loading Temple Details...</h3>
        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>Retrieving temple information and staff roster</p>
      </div>
    );
  }

  if (error || !temple) {
    return (
      <div style={{ padding: '3rem 2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: 'var(--admin-danger)', margin: '0 auto 1rem' }} />
        <h2 className="serif-title" style={{ color: 'var(--admin-cream)', marginBottom: '0.8rem' }}>Temple Not Found</h2>
        <p style={{ color: 'var(--admin-text-muted)', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
          {error || `Unable to locate details for temple ID "${templeId}". It may have been removed or renamed.`}
        </p>
        <button
          onClick={() => navigate('/admin/temples')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.75rem 1.4rem',
            backgroundColor: 'var(--admin-primary-brown)',
            border: '1px solid var(--admin-gold)',
            borderRadius: '8px',
            color: 'var(--admin-off-white)',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={18} />
          Back to Services
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
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

      {/* Header & Breadcrumbs */}
      <div style={{ marginBottom: '1.5rem' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--admin-text-muted)', marginBottom: '1rem' }}>
          <button
            onClick={() => navigate('/admin/temples')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--admin-gold)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: 0,
              fontSize: '0.85rem',
              fontWeight: 500
            }}
          >
            <ArrowLeft size={16} />
            Temples
          </button>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--admin-off-white)', fontWeight: 600 }}>{temple.name}</span>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--admin-gold)' }}>Staff & Employees</span>
        </div>

        {/* Action Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ 
              fontSize: '0.75rem', 
              letterSpacing: '0.1em', 
              textTransform: 'uppercase', 
              color: 'var(--admin-gold)', 
              fontWeight: 700 
            }}>
              TEMPLE STAFF DIRECTORY — LEVEL 2
            </span>
            <h1 className="serif-title" style={{ fontSize: '1.85rem', color: 'var(--admin-off-white)', marginTop: '0.2rem' }}>
              {temple.name} Staff
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button
              onClick={() => navigate('/admin/temples')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.1rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(214, 181, 109, 0.25)',
                borderRadius: '8px',
                color: 'var(--admin-off-white)',
                cursor: 'pointer',
                fontSize: '0.86rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--admin-gold)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(214, 181, 109, 0.25)'}
            >
              <ArrowLeft size={16} />
              Back to Temples
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.2rem',
                backgroundColor: 'var(--admin-gold)',
                border: '1px solid var(--admin-gold-light)',
                borderRadius: '8px',
                color: '#120907',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.86rem',
                boxShadow: '0 4px 15px rgba(200, 155, 75, 0.25)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
            >
              <Plus size={16} />
              Add Employee
            </button>
          </div>
        </div>
      </div>

      {/* 1. Temple Overview Hero Card */}
      <div 
        style={{
          backgroundColor: 'var(--admin-bg-card)',
          border: '1px solid rgba(214, 181, 109, 0.2)',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '2rem',
          boxShadow: '0 8px 30px rgba(0,0,0,0.35)'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 420px) 1fr', gap: '0' }} className="temple-hero-grid">
          {/* Temple Photo */}
          <div style={{ position: 'relative', minHeight: '260px', backgroundColor: 'var(--admin-bg-deep)' }}>
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
              top: '1rem',
              left: '1rem',
              backgroundColor: temple.status === 'Active' ? 'rgba(142, 174, 104, 0.9)' : 'rgba(217, 160, 91, 0.9)',
              color: '#120907',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.25rem 0.65rem',
              borderRadius: '4px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              {temple.status || 'Active'}
            </div>
            {temple.category && (
              <div style={{
                position: 'absolute',
                bottom: '1rem',
                left: '1rem',
                backgroundColor: 'rgba(18, 9, 7, 0.85)',
                border: '1px solid var(--admin-gold)',
                color: 'var(--admin-gold-light)',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.25rem 0.65rem',
                borderRadius: '4px'
              }}>
                Deity / Type: {temple.category}
              </div>
            )}
          </div>

          {/* Temple Details Information */}
          <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--admin-gold)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <MapPin size={16} />
                <span>{temple.location || temple.district || 'Tamil Nadu, India'}</span>
              </div>

              <h2 className="serif-title" style={{ fontSize: '1.45rem', color: 'var(--admin-off-white)', marginBottom: '0.85rem' }}>
                {temple.name}
              </h2>

              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                {temple.description || temple.history || 'Ancient sacred heritage temple dedicated to divine worship, Vedic ceremonies, and spiritual enlightenment.'}
              </p>
            </div>

            {/* Quick Metadata Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.85rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(214, 181, 109, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <Clock size={16} style={{ color: 'var(--admin-gold)', marginTop: '0.2rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Darshan Timings</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--admin-cream)', fontWeight: 500 }}>
                    {temple.darshanTimings || `${temple.openingTime || '5:00 AM'} – ${temple.closingTime || '9:00 PM'}`}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <ShieldCheck size={16} style={{ color: 'var(--admin-gold)', marginTop: '0.2rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Dress Code</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--admin-cream)', fontWeight: 500 }}>
                    {temple.dressCode || 'Traditional South Indian Modest Wear'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <Calendar size={16} style={{ color: 'var(--admin-gold)', marginTop: '0.2rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Key Events</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--admin-cream)', fontWeight: 500 }}>
                    {temple.events || temple.festivals || 'Daily Vedic Pujas, Special Aaradhanam'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Summary Stats Bar */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{
          backgroundColor: 'var(--admin-bg-card)',
          border: '1px solid rgba(214, 181, 109, 0.15)',
          borderRadius: '10px',
          padding: '1.1rem 1.4rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            backgroundColor: 'rgba(200, 155, 75, 0.15)',
            border: '1px solid rgba(200, 155, 75, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--admin-gold)'
          }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Assigned Employees</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--admin-off-white)' }}>
              {totalEmployeesCount}
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--admin-bg-card)',
          border: '1px solid rgba(214, 181, 109, 0.15)',
          borderRadius: '10px',
          padding: '1.1rem 1.4rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            backgroundColor: 'rgba(142, 174, 104, 0.15)',
            border: '1px solid rgba(142, 174, 104, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--admin-success)'
          }}>
            <UserCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Active Staff</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--admin-success)' }}>
              {activeEmployeesCount}
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--admin-bg-card)',
          border: '1px solid rgba(214, 181, 109, 0.15)',
          borderRadius: '10px',
          padding: '1.1rem 1.4rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            backgroundColor: 'rgba(217, 160, 91, 0.15)',
            border: '1px solid rgba(217, 160, 91, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--admin-warning)'
          }}>
            <Briefcase size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Total Tasks Assigned</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--admin-warning)' }}>
              {totalTasksCount}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Employees / Persons Section */}
      <div style={{
        backgroundColor: 'var(--admin-bg-deep)',
        border: '1px solid rgba(214, 181, 109, 0.15)',
        borderRadius: '12px',
        padding: '1.75rem'
      }}>
        {/* Section Title & Controls */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid rgba(214, 181, 109, 0.12)',
          paddingBottom: '1.25rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Users size={20} style={{ color: 'var(--admin-gold)' }} />
              <h2 className="serif-title" style={{ fontSize: '1.25rem', color: 'var(--admin-off-white)' }}>
                Employees & Staff Members
              </h2>
              <span style={{
                backgroundColor: 'rgba(200, 155, 75, 0.18)',
                border: '1px solid var(--admin-gold)',
                color: 'var(--admin-gold-light)',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.15rem 0.55rem',
                borderRadius: '12px'
              }}>
                {filteredEmployees.length} of {employees.length}
              </span>
            </div>
            <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.84rem', marginTop: '0.3rem' }}>
              All employees associated with {temple.name}. Click an employee to view their assigned work and duties.
            </p>
          </div>

          {/* Search & Department Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.8rem 0.55rem 2.2rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  backgroundColor: 'rgba(18, 9, 7, 0.7)'
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '0.6rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--admin-text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {departments.length > 2 && (
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                style={{
                  padding: '0.55rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  backgroundColor: 'rgba(18, 9, 7, 0.7)'
                }}
              >
                {departments.map(d => (
                  <option key={d} value={d}>{d === 'ALL' ? 'All Departments' : d}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Employees Cards Grid */}
        {filteredEmployees.length === 0 ? (
          <div style={{
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            backgroundColor: 'rgba(40, 24, 20, 0.3)',
            borderRadius: '10px',
            border: '1px dashed rgba(214, 181, 109, 0.2)'
          }}>
            <Users size={40} style={{ color: 'var(--admin-gold)', margin: '0 auto 1rem', opacity: 0.6 }} />
            <h3 className="serif-title" style={{ color: 'var(--admin-cream)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
              No employees assigned to this temple.
            </h3>
            <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.86rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              {searchTerm || selectedDept !== 'ALL'
                ? 'No staff members match the current search filter.'
                : 'Click the button below to register a manager, priest, or staff member for this shrine.'}
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.3rem',
                backgroundColor: 'var(--admin-primary-brown)',
                border: '1px solid var(--admin-gold)',
                borderRadius: '8px',
                color: 'var(--admin-off-white)',
                cursor: 'pointer',
                fontSize: '0.86rem'
              }}
            >
              <Plus size={16} style={{ color: 'var(--admin-gold)' }} />
              Add First Employee
            </button>
          </div>
        ) : (
          <div 
            id="staff-roster"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem'
            }}
          >
            {filteredEmployees.map((emp) => (
              <motion.div
                key={emp.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigate(`/admin/temples/${temple?.id || cleanTempleId}/staff/${emp.id}`)}
                style={{
                  backgroundColor: 'var(--admin-bg-card)',
                  border: '1px solid rgba(214, 181, 109, 0.2)',
                  borderRadius: '10px',
                  padding: '1.35rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
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
                  {/* Top Row: Avatar & Status */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{ position: 'relative' }}>
                        <img
                          src={emp.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                          alt={emp.name}
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1.5px solid var(--admin-gold)'
                          }}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80';
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: emp.status === 'Active' ? '#8EAE68' : '#D9A05B',
                          border: '2px solid var(--admin-bg-card)'
                        }} />
                      </div>

                      <div>
                        <h3 style={{ fontSize: '1.05rem', color: 'var(--admin-off-white)', fontWeight: 600, marginBottom: '0.15rem' }}>
                          {emp.name}
                        </h3>
                        <span style={{
                          fontSize: '0.75rem',
                          color: 'var(--admin-gold)',
                          fontWeight: 600,
                          display: 'inline-block'
                        }}>
                          {emp.role || emp.designation}
                        </span>
                      </div>
                    </div>

                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: emp.status === 'Active' ? 'rgba(142, 174, 104, 0.15)' : 'rgba(217, 160, 91, 0.15)',
                      color: emp.status === 'Active' ? 'var(--admin-success)' : 'var(--admin-warning)',
                      border: `1px solid ${emp.status === 'Active' ? 'rgba(142, 174, 104, 0.3)' : 'rgba(217, 160, 91, 0.3)'}`
                    }}>
                      {emp.status || 'Active'}
                    </span>
                  </div>

                  {/* Department & Shift Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.9rem' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(214, 181, 109, 0.15)',
                      color: 'var(--admin-text-muted)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      {emp.department || 'Operations'}
                    </span>
                    {emp.shift && (
                      <span style={{
                        fontSize: '0.72rem',
                        backgroundColor: 'rgba(200, 155, 75, 0.08)',
                        border: '1px solid rgba(200, 155, 75, 0.15)',
                        color: 'var(--admin-gold-light)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px'
                      }}>
                        {emp.shift}
                      </span>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
                    {emp.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Mail size={13} style={{ color: 'var(--admin-gold)', flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.email}</span>
                      </div>
                    )}
                    {emp.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Phone size={13} style={{ color: 'var(--admin-gold)', flexShrink: 0 }} />
                        <span>{emp.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Footer: Work Count & Action */}
                <div style={{
                  paddingTop: '0.85rem',
                  borderTop: '1px solid rgba(214, 181, 109, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--admin-gold)' }}>
                    <Briefcase size={14} />
                    <span style={{ fontWeight: 600 }}>{emp.assignedWorksCount || 0} Assigned Works</span>
                  </div>

                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.78rem',
                    color: 'var(--admin-off-white)',
                    fontWeight: 600
                  }}>
                    View Tasks <ChevronRight size={14} style={{ color: 'var(--admin-gold)' }} />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ADD EMPLOYEE MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                backgroundColor: 'var(--admin-bg-card)',
                border: '1px solid var(--admin-gold)',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '540px',
                padding: '2rem',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Users size={20} style={{ color: 'var(--admin-gold)' }} />
                  <h3 className="serif-title" style={{ fontSize: '1.2rem', color: 'var(--admin-off-white)' }}>
                    Add Temple Employee
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--admin-text-muted)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddEmployeeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginBottom: '0.3rem' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suresh Sundaram"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginBottom: '0.3rem' }}>
                      Role / Designation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Archana Staff"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value, designation: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginBottom: '0.3rem' }}>
                      Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px' }}
                    >
                      <option value="Administration & Operations">Administration & Operations</option>
                      <option value="Vedic Rituals & Pujas">Vedic Rituals & Pujas</option>
                      <option value="Security & Crowd Control">Security & Crowd Control</option>
                      <option value="Sanitation & Facilities">Sanitation & Facilities</option>
                      <option value="Annadanam & Prasadam">Annadanam & Prasadam</option>
                      <option value="Devotee Assistance Desk">Devotee Assistance Desk</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginBottom: '0.3rem' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="staff@temple.org"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginBottom: '0.3rem' }}>
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="+91 98401 23456"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginBottom: '0.3rem' }}>
                      Shift Timings
                    </label>
                    <input
                      type="text"
                      placeholder="Morning (5:30 AM - 1:30 PM)"
                      value={formData.shift}
                      onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginBottom: '0.3rem' }}>
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px' }}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginBottom: '0.3rem' }}>
                    Photo Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    style={{
                      padding: '0.65rem 1.2rem',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(214, 181, 109, 0.3)',
                      borderRadius: '6px',
                      color: 'var(--admin-cream)',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '0.65rem 1.4rem',
                      backgroundColor: 'var(--admin-gold)',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#120907',
                      fontWeight: 700,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSubmitting ? 'Saving...' : 'Register Employee'}
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
