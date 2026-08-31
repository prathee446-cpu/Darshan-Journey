import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Landmark, Users, Briefcase, Calendar, 
  CheckCircle2, Clock, AlertCircle, Plus, Search, 
  Filter, Mail, Phone, ShieldCheck, ChevronRight, 
  Check, X, Sparkles, RefreshCw, Tag, AlertTriangle, 
  CheckCircle, PlayCircle, Clock3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthHeaders } from '../utils/auth';

export default function EmployeeDetailsPage() {
  const { templeId, employeeId } = useParams();
  const navigate = useNavigate();
  const cleanTempleId = (templeId || '').replace(/^:/, '');
  const cleanEmpId = (employeeId || '').replace(/^:/, '');

  const [employee, setEmployee] = useState(null);
  const [temple, setTemple] = useState(null);
  const [assignedWorks, setAssignedWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filters for Assigned Works
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Assign New Task Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    category: 'Darshan & Bookings',
    priority: 'High',
    status: 'In Progress',
    assignedDate: new Date().toISOString().slice(0, 10),
    dueDate: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Employee Details
      const empRes = await fetch(`/api/employees/${cleanEmpId}`, {
        headers: getAuthHeaders()
      });

      let empData = null;
      if (empRes.ok) {
        empData = await empRes.json();
        setEmployee(empData);
        setAssignedWorks(Array.isArray(empData.assignedWorks) ? empData.assignedWorks : []);
        if (empData.temple) {
          setTemple(empData.temple);
        }
      } else {
        // Fallback: fetch employees by temple
        const fallbackRes = await fetch(`/api/employees?templeId=${cleanTempleId}`, { headers: getAuthHeaders() });
        if (fallbackRes.ok) {
          const list = await fallbackRes.json();
          empData = list.find(e => e.id === cleanEmpId || e._id === cleanEmpId);
          if (empData) {
            setEmployee(empData);
            setAssignedWorks(empData.assignedWorks || []);
          }
        }
      }

      if (!empData) {
        throw new Error('Employee not found.');
      }

      // 2. Fetch Temple if not attached
      const targetTempleId = cleanTempleId || empData.templeId;
      if (!empData.temple && targetTempleId) {
        const templeRes = await fetch(`/api/temples/${targetTempleId}`, { headers: getAuthHeaders() });
        if (templeRes.ok) {
          const tData = await templeRes.json();
          setTemple(tData);
        }
      }
    } catch (err) {
      console.error('Error fetching employee details:', err);
      setError(err.message || 'Unable to load employee details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [templeId, employeeId]);

  const handleCreateTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskForm.title) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/employees/${employeeId}/works`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✨ Task '${taskForm.title}' assigned to ${employee?.name}!`);
        setIsAssignModalOpen(false);
        setTaskForm({
          title: '',
          description: '',
          category: 'Darshan & Bookings',
          priority: 'High',
          status: 'In Progress',
          assignedDate: new Date().toISOString().slice(0, 10),
          dueDate: ''
        });
        await fetchData();
      } else {
        alert(data.message || 'Failed to assign work');
      }
    } catch (err) {
      alert('Error creating task: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTaskStatus = async (workId, newStatus) => {
    try {
      const res = await fetch(`/api/works/${workId}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Task status updated to ${newStatus}`);
        setAssignedWorks(prev => prev.map(w => w.id === workId ? { ...w, status: newStatus } : w));
      } else {
        alert(data.message || 'Failed to update task status');
      }
    } catch (err) {
      alert('Error updating task: ' + err.message);
    }
  };

  // Filtered Works
  const filteredWorks = assignedWorks.filter(w => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = (
      (w.title || w.name || '').toLowerCase().includes(q) ||
      (w.description || '').toLowerCase().includes(q) ||
      (w.category || '').toLowerCase().includes(q)
    );
    const matchesStatus = statusFilter === 'ALL' || (w.status || '').toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === 'ALL' || (w.priority || '').toLowerCase() === priorityFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Counters
  const totalCount = assignedWorks.length;
  const inProgressCount = assignedWorks.filter(w => (w.status || '').toLowerCase() === 'in progress' || (w.status || '').toLowerCase() === 'active').length;
  const pendingCount = assignedWorks.filter(w => (w.status || '').toLowerCase() === 'pending').length;
  const completedCount = assignedWorks.filter(w => (w.status || '').toLowerCase() === 'completed').length;

  const templeName = temple?.name || employee?.templeName || 'Sacred Temple';

  if (loading) {
    return (
      <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <RefreshCw size={36} className="spin-slow" style={{ color: 'var(--admin-gold)', margin: '0 auto 1rem' }} />
        <h3 className="serif-title" style={{ color: 'var(--admin-cream)', marginBottom: '0.5rem' }}>Loading Person Details...</h3>
        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>Retrieving employee profile and assigned works</p>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div style={{ padding: '3rem 2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: 'var(--admin-danger)', margin: '0 auto 1rem' }} />
        <h2 className="serif-title" style={{ color: 'var(--admin-cream)', marginBottom: '0.8rem' }}>Employee Not Found</h2>
        <p style={{ color: 'var(--admin-text-muted)', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
          {error || `Unable to locate details for employee ID "${employeeId}".`}
        </p>
        <button
          onClick={() => navigate(`/admin/services/temple/${templeId}`)}
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
          Back to Temple Details
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

      {/* Header & Breadcrumb Hierarchy */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--admin-text-muted)', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/admin/temples')}
            style={{ background: 'none', border: 'none', color: 'var(--admin-gold)', cursor: 'pointer', padding: 0, fontSize: '0.85rem', fontWeight: 500 }}
          >
            Temples
          </button>
          <ChevronRight size={14} />
          <button
            onClick={() => navigate(`/admin/temples/${temple?.id || cleanTempleId}/staff`)}
            style={{ background: 'none', border: 'none', color: 'var(--admin-gold)', cursor: 'pointer', padding: 0, fontSize: '0.85rem', fontWeight: 500 }}
          >
            {templeName} Staff
          </button>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--admin-off-white)', fontWeight: 600 }}>{employee.name}</span>
        </div>

        {/* Action Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--admin-gold)', fontWeight: 700 }}>
              TEMPLE STAFF PROFILE & ASSIGNMENTS — LEVEL 3
            </span>
            <h1 className="serif-title" style={{ fontSize: '1.85rem', color: 'var(--admin-off-white)', marginTop: '0.2rem' }}>
              {employee.name}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button
              onClick={() => navigate(`/admin/temples/${temple?.id || cleanTempleId}/staff`)}
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
              Back to {templeName} Staff
            </button>

            <button
              onClick={() => setIsAssignModalOpen(true)}
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
                boxShadow: '0 4px 15px rgba(200, 155, 75, 0.25)'
              }}
            >
              <Plus size={16} />
              Assign New Work
            </button>
          </div>
        </div>
      </div>

      {/* 1. Person Details Card */}
      <div style={{
        backgroundColor: 'var(--admin-bg-card)',
        border: '1px solid rgba(214, 181, 109, 0.2)',
        borderRadius: '12px',
        padding: '1.75rem',
        marginBottom: '2rem',
        boxShadow: '0 8px 30px rgba(0,0,0,0.35)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          {/* Avatar & Core Bio */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <img
                src={employee.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                alt={employee.name}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2.5px solid var(--admin-gold)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                }}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80';
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: employee.status === 'Active' ? '#8EAE68' : '#D9A05B',
                border: '3px solid var(--admin-bg-card)'
              }} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                <h2 className="serif-title" style={{ fontSize: '1.5rem', color: 'var(--admin-off-white)' }}>
                  {employee.name}
                </h2>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '4px',
                  backgroundColor: employee.status === 'Active' ? 'rgba(142, 174, 104, 0.15)' : 'rgba(217, 160, 91, 0.15)',
                  color: employee.status === 'Active' ? 'var(--admin-success)' : 'var(--admin-warning)',
                  border: `1px solid ${employee.status === 'Active' ? 'rgba(142, 174, 104, 0.3)' : 'rgba(217, 160, 91, 0.3)'}`
                }}>
                  {employee.status || 'Active'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                <span style={{
                  fontSize: '0.88rem',
                  color: 'var(--admin-gold)',
                  fontWeight: 600
                }}>
                  {employee.role || employee.designation}
                </span>
                <span style={{ color: 'rgba(214, 181, 109, 0.4)' }}>•</span>
                <span style={{
                  fontSize: '0.82rem',
                  color: 'var(--admin-text-muted)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(214, 181, 109, 0.15)'
                }}>
                  {employee.department || 'Operations'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--admin-gold-light)', fontSize: '0.85rem' }}>
                <Landmark size={15} />
                <span>Belongs to: <strong>{templeName}</strong></span>
              </div>
            </div>
          </div>

          {/* Contact Details Column */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            fontSize: '0.85rem',
            color: 'var(--admin-text-muted)',
            backgroundColor: 'rgba(18, 9, 7, 0.5)',
            border: '1px solid rgba(214, 181, 109, 0.12)',
            borderRadius: '8px',
            padding: '1rem 1.25rem'
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--admin-gold)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.2rem' }}>
              Staff Contact & Schedule
            </div>
            {employee.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={14} style={{ color: 'var(--admin-gold)' }} />
                <span style={{ color: 'var(--admin-cream)' }}>{employee.email}</span>
              </div>
            )}
            {employee.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={14} style={{ color: 'var(--admin-gold)' }} />
                <span style={{ color: 'var(--admin-cream)' }}>{employee.phone}</span>
              </div>
            )}
            {employee.shift && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={14} style={{ color: 'var(--admin-gold)' }} />
                <span style={{ color: 'var(--admin-cream)' }}>Shift: {employee.shift}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Tasks Summary Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: 'var(--admin-bg-card)',
          border: '1px solid rgba(214, 181, 109, 0.15)',
          borderRadius: '10px',
          padding: '1.1rem 1.3rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.9rem'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '8px',
            backgroundColor: 'rgba(200, 155, 75, 0.15)',
            color: 'var(--admin-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Briefcase size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Total Tasks</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--admin-off-white)' }}>{totalCount}</div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--admin-bg-card)',
          border: '1px solid rgba(214, 181, 109, 0.15)',
          borderRadius: '10px',
          padding: '1.1rem 1.3rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.9rem'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '8px',
            backgroundColor: 'rgba(91, 146, 217, 0.15)',
            color: 'var(--admin-info)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <PlayCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>In Progress</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--admin-info)' }}>{inProgressCount}</div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--admin-bg-card)',
          border: '1px solid rgba(214, 181, 109, 0.15)',
          borderRadius: '10px',
          padding: '1.1rem 1.3rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.9rem'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '8px',
            backgroundColor: 'rgba(217, 160, 91, 0.15)',
            color: 'var(--admin-warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock3 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Pending Review</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--admin-warning)' }}>{pendingCount}</div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--admin-bg-card)',
          border: '1px solid rgba(214, 181, 109, 0.15)',
          borderRadius: '10px',
          padding: '1.1rem 1.3rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.9rem'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '8px',
            backgroundColor: 'rgba(142, 174, 104, 0.15)',
            color: 'var(--admin-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>Completed</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--admin-success)' }}>{completedCount}</div>
          </div>
        </div>
      </div>

      {/* 3. Assigned Work Section */}
      <div style={{
        backgroundColor: 'var(--admin-bg-deep)',
        border: '1px solid rgba(214, 181, 109, 0.15)',
        borderRadius: '12px',
        padding: '1.75rem'
      }}>
        {/* Section Header & Filters */}
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
              <Briefcase size={20} style={{ color: 'var(--admin-gold)' }} />
              <h2 className="serif-title" style={{ fontSize: '1.25rem', color: 'var(--admin-off-white)' }}>
                Assigned Work & Duties
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
                {filteredWorks.length} of {assignedWorks.length}
              </span>
            </div>
            <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.84rem', marginTop: '0.3rem' }}>
              Specific tasks, services, and operational responsibilities currently assigned to {employee.name}.
            </p>
          </div>

          {/* Search & Filter dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '200px' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
              <input
                type="text"
                placeholder="Search duties..."
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
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.55rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                backgroundColor: 'rgba(18, 9, 7, 0.7)'
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                padding: '0.55rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                backgroundColor: 'rgba(18, 9, 7, 0.7)'
              }}
            >
              <option value="ALL">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Normal">Normal</option>
            </select>
          </div>
        </div>

        {/* Assigned Works List */}
        {filteredWorks.length === 0 ? (
          <div style={{
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            backgroundColor: 'rgba(40, 24, 20, 0.3)',
            borderRadius: '10px',
            border: '1px dashed rgba(214, 181, 109, 0.2)'
          }}>
            <Briefcase size={40} style={{ color: 'var(--admin-gold)', margin: '0 auto 1rem', opacity: 0.6 }} />
            <h3 className="serif-title" style={{ color: 'var(--admin-cream)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
              No work currently assigned.
            </h3>
            <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.86rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              {searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                ? 'No assigned work matches your selected filters.'
                : `Assign a duty or task to ${employee.name} to track their sacred service responsibilities.`}
            </p>
            <button
              onClick={() => setIsAssignModalOpen(true)}
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
              Assign Work
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredWorks.map((work, index) => {
              const priority = work.priority || 'Medium';
              const status = work.status || 'In Progress';

              let priorityBg = 'rgba(214, 181, 109, 0.15)';
              let priorityColor = 'var(--admin-gold-light)';
              if (priority.toLowerCase() === 'urgent') {
                priorityBg = 'rgba(192, 90, 78, 0.2)';
                priorityColor = 'var(--admin-danger)';
              } else if (priority.toLowerCase() === 'high') {
                priorityBg = 'rgba(217, 160, 91, 0.2)';
                priorityColor = 'var(--admin-warning)';
              }

              let statusBg = 'rgba(91, 146, 217, 0.15)';
              let statusColor = 'var(--admin-info)';
              if (status.toLowerCase() === 'completed') {
                statusBg = 'rgba(142, 174, 104, 0.15)';
                statusColor = 'var(--admin-success)';
              } else if (status.toLowerCase() === 'pending') {
                statusBg = 'rgba(217, 160, 91, 0.15)';
                statusColor = 'var(--admin-warning)';
              }

              return (
                <motion.div
                  key={work.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    backgroundColor: 'var(--admin-bg-card)',
                    border: '1px solid rgba(214, 181, 109, 0.18)',
                    borderRadius: '10px',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--admin-gold)';
                    e.currentTarget.style.backgroundColor = 'var(--admin-bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(214, 181, 109, 0.18)';
                    e.currentTarget.style.backgroundColor = 'var(--admin-bg-card)';
                  }}
                >
                  {/* Top Bar of Task */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(200, 155, 75, 0.12)',
                        border: '1px solid rgba(200, 155, 75, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--admin-gold)',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                      }}>
                        {index + 1}
                      </div>

                      <div>
                        <h3 style={{ fontSize: '1.05rem', color: 'var(--admin-off-white)', fontWeight: 600, marginBottom: '0.2rem' }}>
                          {work.title || work.name}
                        </h3>
                        {work.category && (
                          <span style={{
                            fontSize: '0.72rem',
                            color: 'var(--admin-gold)',
                            backgroundColor: 'rgba(200, 155, 75, 0.08)',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            border: '1px solid rgba(200, 155, 75, 0.2)'
                          }}>
                            {work.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Badges: Priority & Status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.6rem',
                        borderRadius: '4px',
                        backgroundColor: priorityBg,
                        color: priorityColor,
                        border: `1px solid ${priorityColor}44`,
                        textTransform: 'uppercase'
                      }}>
                        {priority} Priority
                      </span>

                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.6rem',
                        borderRadius: '4px',
                        backgroundColor: statusBg,
                        color: statusColor,
                        border: `1px solid ${statusColor}44`,
                        textTransform: 'uppercase'
                      }}>
                        {status}
                      </span>
                    </div>
                  </div>

                  {/* Task Description */}
                  {work.description && (
                    <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', lineHeight: '1.55', margin: '0.1rem 0' }}>
                      {work.description}
                    </p>
                  )}

                  {/* Footer: Dates & Quick Action Dropdown */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.8rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(214, 181, 109, 0.1)',
                    fontSize: '0.8rem',
                    color: 'var(--admin-text-muted)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                      {work.assignedDate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Calendar size={13} style={{ color: 'var(--admin-gold)' }} />
                          <span>Assigned: <strong style={{ color: 'var(--admin-cream)' }}>{work.assignedDate}</strong></span>
                        </div>
                      )}
                      {work.dueDate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Clock size={13} style={{ color: 'var(--admin-warning)' }} />
                          <span>Due: <strong style={{ color: 'var(--admin-cream)' }}>{work.dueDate}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Quick Status Switcher */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Update Status:</span>
                      <select
                        value={work.status || 'In Progress'}
                        onChange={(e) => handleUpdateTaskStatus(work.id, e.target.value)}
                        style={{
                          padding: '0.3rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          backgroundColor: 'rgba(18, 9, 7, 0.8)',
                          color: 'var(--admin-gold-light)',
                          borderColor: 'rgba(214, 181, 109, 0.3)'
                        }}
                      >
                        <option value="In Progress">In Progress</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Active">Active</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ASSIGN WORK MODAL */}
      <AnimatePresence>
        {isAssignModalOpen && (
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
                  <Briefcase size={20} style={{ color: 'var(--admin-gold)' }} />
                  <h3 className="serif-title" style={{ fontSize: '1.2rem', color: 'var(--admin-off-white)' }}>
                    Assign Work to {employee.name}
                  </h3>
                </div>
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--admin-text-muted)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateTaskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginBottom: '0.3rem' }}>
                    Work / Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Manage Darshan bookings"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginBottom: '0.3rem' }}>
                    Description / Scope of Work
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe specific duties, checkpoints, and responsibilities..."
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginBottom: '0.3rem' }}>
                      Category / Service
                    </label>
                    <select
                      value={taskForm.category}
                      onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px' }}
                    >
                      <option value="Darshan & Bookings">Darshan & Bookings</option>
                      <option value="Pooja Services">Pooja Services</option>
                      <option value="Festival & Logistics">Festival & Logistics</option>
                      <option value="Staff Governance">Staff Governance</option>
                      <option value="Prasadam Operations">Prasadam Operations</option>
                      <option value="Security & Crowd">Security & Crowd</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginBottom: '0.3rem' }}>
                      Priority Level
                    </label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px' }}
                    >
                      <option value="Urgent">Urgent</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Normal">Normal</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginBottom: '0.3rem' }}>
                      Assigned Date
                    </label>
                    <input
                      type="date"
                      value={taskForm.assignedDate}
                      onChange={(e) => setTaskForm({ ...taskForm, assignedDate: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginBottom: '0.3rem' }}>
                      Due Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginBottom: '0.3rem' }}>
                    Initial Status
                  </label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '6px' }}
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(false)}
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
                    {isSubmitting ? 'Assigning...' : 'Assign Duty'}
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
