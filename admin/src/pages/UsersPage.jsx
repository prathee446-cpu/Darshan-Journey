import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Plus, Search, Filter, Edit3, Trash2, 
  Sparkles, Check, X, Shield, Phone, Mail, Calendar, BookOpen, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [editingUser, setEditingUser] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Active',
    bookingCount: 0,
    totalSpent: '₹0'
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/users';
      const params = new URLSearchParams();
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (searchTerm) params.append('search', searchTerm);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setError('Invalid user data received from server.');
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        setError(errJson.message || `Server error (${res.status}). Unable to fetch user records.`);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Unable to load devotee directory. Please check backend server / MongoDB connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedStatus, searchTerm]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '+91 ',
      status: 'Active',
      bookingCount: 0,
      totalSpent: '₹0'
    });
    setEditingUser(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      status: user.status || 'Active',
      bookingCount: user.bookingCount || 0,
      totalSpent: user.totalSpent || '₹0'
    });
    setIsAddModalOpen(true);
  };

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          showToast(`Devotee profile '${formData.name}' updated!`);
          await fetchUsers();
          setIsAddModalOpen(false);
        }
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          showToast(`New devotee '${formData.name}' registered!`);
          await fetchUsers();
          setIsAddModalOpen(false);
        }
      }
    } catch (err) {
      alert('Error saving user: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Devotee account removed.');
        setUsers(prev => prev.filter(u => u.id !== id));
        setDeleteConfirmId(null);
      }
    } catch (err) {
      alert('Error deleting user: ' + err.message);
    }
  };

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
            Registered Devotees Directory
          </h2>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
            Manage pilgrim accounts, contact information, booking history, and VIP status tiers.
          </p>
        </div>

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
          Register New Devotee
        </button>
      </div>

      {/* Search and Filters */}
      <div className="glassmorphism" style={{ padding: '1rem 1.25rem', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(214, 181, 109, 0.5)' }} />
          <input
            type="text"
            placeholder="Search by devotee name, email, or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem 0.6rem 2.4rem',
              borderRadius: '8px',
              border: '1px solid rgba(214, 181, 109, 0.25)',
              backgroundColor: 'rgba(18, 9, 7, 0.6)',
              color: '#FFFDF9',
              fontSize: '0.85rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['ALL', 'ACTIVE', 'VIP', 'BLOCKED'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '20px',
                border: selectedStatus === status ? '1px solid var(--admin-gold)' : '1px solid rgba(214, 181, 109, 0.15)',
                backgroundColor: selectedStatus === status ? 'rgba(200, 155, 75, 0.18)' : 'transparent',
                color: selectedStatus === status ? '#FFFDF9' : 'var(--admin-text-muted)',
                fontSize: '0.78rem',
                fontWeight: selectedStatus === status ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            >
              {status}
            </button>
          ))}
        </div>
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
            onClick={fetchUsers}
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
          <p style={{ fontSize: '0.9rem', color: 'var(--admin-text-muted)' }}>Loading devotees directory from MongoDB...</p>
        </div>
      )}

      {/* Users Table */}
      {!loading && !error && users.length === 0 ? (
        <div className="glassmorphism" style={{ padding: '3rem', textAlign: 'center', borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.15)' }}>
          <Users size={36} style={{ color: 'var(--admin-gold)', opacity: 0.5, margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#FFFDF9', marginBottom: '0.5rem' }}>No Devotees Found</h3>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            {searchTerm || selectedStatus !== 'ALL'
              ? 'No registered users match your search criteria.'
              : 'No devotees are registered in the directory yet.'}
          </p>
          <button
            onClick={handleOpenAdd}
            style={{
              backgroundColor: 'var(--admin-primary-brown)',
              border: '1px solid var(--admin-gold)',
              color: '#FFFDF9',
              padding: '0.5rem 1.2rem',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Register Devotee
          </button>
        </div>
      ) : !loading && !error && (
        <div className="glassmorphism" style={{ borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.15)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(214, 181, 109, 0.2)', color: 'var(--admin-gold-light)', fontFamily: 'var(--font-serif)', fontSize: '0.78rem', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.9rem 1rem' }}>DEVOTEE</th>
                  <th style={{ padding: '0.9rem 1rem' }}>CONTACT INFO</th>
                  <th style={{ padding: '0.9rem 1rem' }}>REGISTRATION DATE</th>
                  <th style={{ padding: '0.9rem 1rem' }}>TOTAL BOOKINGS</th>
                  <th style={{ padding: '0.9rem 1rem' }}>STATUS</th>
                  <th style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody style={{ color: 'var(--admin-cream)' }}>
                {users.map(u => (
                  <tr 
                    key={u.id || u._id} 
                    style={{ borderBottom: '1px solid rgba(214, 181, 109, 0.08)', cursor: 'pointer', transition: 'background 0.2s' }}
                    onClick={() => navigate(`/admin/users/${u.id || u._id}`)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(214, 181, 109, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '0.95rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="flex-center" style={{ height: '36px', width: '36px', borderRadius: '50%', backgroundColor: 'rgba(200, 155, 75, 0.15)', border: '1px solid var(--admin-gold)', color: 'var(--admin-gold)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                          {(u.name || 'D').charAt(0)}
                        </div>
                        <div>
                          <span style={{ fontWeight: '600', color: '#FFFDF9', display: 'block' }}>{u.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--admin-gold)', opacity: 0.8 }}>ID: {u.id || u._id}</span>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '0.95rem 1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.8rem' }}>
                        <span style={{ color: '#FFFDF9', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Mail size={12} style={{ color: 'var(--admin-gold)' }} />
                          {u.email}
                        </span>
                        <span style={{ color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Phone size={12} />
                          {u.phone}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '0.95rem 1rem', whiteSpace: 'nowrap', color: 'var(--admin-cream)' }}>
                      {u.registrationDate || '2026-01-15'}
                    </td>

                    <td style={{ padding: '0.95rem 1rem' }}>
                      <span style={{ fontWeight: '600', color: 'var(--admin-gold)' }}>
                        {u.bookingCount || 0} Sevas
                      </span>
                    </td>

                    <td style={{ padding: '0.95rem 1rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 'bold',
                          backgroundColor: u.status === 'VIP' ? 'rgba(200, 155, 75, 0.2)' : u.status === 'Active' ? 'rgba(142, 174, 104, 0.15)' : 'rgba(192, 90, 78, 0.15)',
                          border: u.status === 'VIP' ? '1px solid var(--admin-gold)' : u.status === 'Active' ? '1px solid rgba(142, 174, 104, 0.35)' : '1px solid rgba(192, 90, 78, 0.35)',
                          color: u.status === 'VIP' ? 'var(--admin-gold)' : u.status === 'Active' ? 'var(--admin-success)' : 'var(--admin-danger)'
                        }}
                      >
                        {u.status || 'Active'}
                      </span>
                    </td>

                    <td style={{ padding: '0.95rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/users/${u.id || u._id}`);
                          }}
                          style={{
                            background: 'none',
                            border: '1px solid rgba(214, 181, 109, 0.3)',
                            color: 'var(--admin-gold)',
                            padding: '0.35rem',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          title="View devotee details"
                        >
                          <Eye size={13} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(u);
                          }}
                          style={{
                            background: 'none',
                            border: '1px solid rgba(214, 181, 109, 0.2)',
                            color: 'var(--admin-gold-light)',
                            padding: '0.35rem',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          title="Edit profile"
                        >
                          <Edit3 size={13} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(u.id);
                          }}
                          style={{
                            background: 'none',
                            border: '1px solid rgba(192, 90, 78, 0.3)',
                            color: 'var(--admin-danger)',
                            padding: '0.35rem',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          title="Delete profile"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT USER MODAL */}
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
                maxWidth: '520px',
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
                {editingUser ? 'Edit Devotee Profile' : 'Register New Devotee'}
              </h3>

              <form onSubmit={handleSaveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Prathika Sharma"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="devotee@example.com"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 98401 23456"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.6)', color: '#FFFDF9', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'var(--admin-cream)', fontSize: '0.82rem', marginBottom: '0.35rem', fontWeight: '500' }}>
                    Devotee Account Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.25)', backgroundColor: 'rgba(18, 9, 7, 0.8)', color: '#FFFDF9', fontSize: '0.88rem' }}
                  >
                    <option value="Active">Active Devotee</option>
                    <option value="VIP">VIP Patron / Sponsor</option>
                    <option value="Blocked">Blocked / Suspended</option>
                  </select>
                </div>

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
                    {editingUser ? 'Update Devotee' : 'Save Devotee'}
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
