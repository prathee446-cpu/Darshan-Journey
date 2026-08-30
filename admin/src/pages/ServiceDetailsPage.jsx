import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Library, Landmark, User, Mail, Phone, 
  ShieldCheck, CheckCircle2, AlertCircle, Clock, MapPin, 
  Sparkles, Tag, DollarSign, Calendar, Layers, ExternalLink,
  Edit3, Check, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getAuthHeaders, getCurrentUser, isSuperAdminUser } from '../utils/auth';

export default function ServiceDetailsPage() {
  const { id, profileId, serviceId } = useParams();
  const targetId = id || profileId || serviceId;
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const isSuper = isSuperAdminUser(currentUser);

  const [record, setRecord] = useState(null);
  const [recordType, setRecordType] = useState('service'); // 'service' or 'inCharge'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const fetchRecordData = async () => {
    if (!targetId) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Attempt to fetch as Service
      const srvRes = await fetch(`/api/services/${encodeURIComponent(targetId)}`, {
        headers: getAuthHeaders()
      });

      if (srvRes.ok) {
        const srvData = await srvRes.json();
        setRecord(srvData);
        setRecordType('service');
        setLoading(false);
        return;
      }

      // 2. Attempt to fetch from all services if direct ID didn't match
      const allSrvRes = await fetch('/api/services', { headers: getAuthHeaders() });
      if (allSrvRes.ok) {
        const list = await allSrvRes.json();
        const found = list.find(s => 
          String(s.id) === String(targetId) || 
          String(s._id) === String(targetId) ||
          String(s.slug) === String(targetId) ||
          String(s.serviceInChargeId) === String(targetId)
        );
        if (found) {
          setRecord(found);
          setRecordType('service');
          setLoading(false);
          return;
        }
      }

      // 3. Attempt to fetch as In-Charge Admin / Staff Profile
      const adminRes = await fetch('/api/admins', { headers: getAuthHeaders() });
      if (adminRes.ok) {
        const admins = await adminRes.json();
        const foundAdmin = admins.find(a => 
          String(a.id) === String(targetId) || 
          String(a._id) === String(targetId) ||
          (a.name && a.name.toLowerCase().replace(/\s+/g, '-') === targetId.toLowerCase())
        );
        if (foundAdmin) {
          setRecord(foundAdmin);
          setRecordType('inCharge');
          setLoading(false);
          return;
        }
      }

      // 4. Attempt to fetch as Employee
      const empRes = await fetch(`/api/employees/${encodeURIComponent(targetId)}`, {
        headers: getAuthHeaders()
      });
      if (empRes.ok) {
        const empData = await empRes.json();
        setRecord(empData);
        setRecordType('inCharge');
        setLoading(false);
        return;
      }

      throw new Error(`No service or profile found matching identifier "${targetId}".`);
    } catch (err) {
      console.error('Error fetching service details:', err);
      setError(err.message || 'Unable to load service details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordData();
  }, [targetId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* Toast */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: 'rgba(18, 9, 7, 0.95)',
            border: '1px solid var(--admin-gold)',
            color: '#FFFDF9',
            padding: '0.8rem 1.25rem',
            borderRadius: '8px',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
          }}
        >
          <CheckCircle2 size={16} style={{ color: 'var(--admin-gold)' }} />
          <span style={{ fontSize: '0.85rem' }}>{toastMessage}</span>
        </motion.div>
      )}

      {/* Top Header & Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          onClick={() => navigate('/admin/services')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: '1px solid rgba(214, 181, 109, 0.3)',
            color: 'var(--admin-gold)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <ArrowLeft size={16} />
          Back to Services
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={fetchRecordData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(214, 181, 109, 0.1)',
              border: '1px solid rgba(214, 181, 109, 0.3)',
              color: 'var(--admin-gold)',
              padding: '0.5rem 0.9rem',
              borderRadius: '6px',
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="glassmorphism" style={{ padding: '3rem', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(214, 181, 109, 0.15)' }}>
          <div 
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid rgba(214, 181, 109, 0.2)',
              borderTopColor: 'var(--admin-gold)',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              animation: 'spin 0.8s linear infinite'
            }} 
          />
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>Loading record data...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="glassmorphism" style={{ padding: '2.5rem', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(192, 90, 78, 0.4)' }}>
          <AlertCircle size={36} style={{ color: 'var(--admin-danger)', margin: '0 auto 1rem' }} />
          <h3 className="serif-title" style={{ fontSize: '1.25rem', color: '#FFFDF9', marginBottom: '0.5rem' }}>Record Not Found</h3>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', maxWidth: '450px', margin: '0 auto 1.5rem' }}>{error}</p>
          <button
            onClick={() => navigate('/admin/services')}
            style={{
              backgroundColor: 'var(--admin-primary-brown)',
              border: '1px solid var(--admin-gold)',
              color: '#FFFDF9',
              padding: '0.55rem 1.25rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Return to Services List
          </button>
        </div>
      )}

      {/* Record Content */}
      {!loading && !error && record && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Main Hero Card */}
          <div 
            className="glassmorphism" 
            style={{ 
              borderRadius: '16px', 
              border: '1px solid rgba(214, 181, 109, 0.25)', 
              padding: '2rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '2rem',
              alignItems: 'center',
              backgroundColor: 'rgba(25, 12, 10, 0.65)'
            }}
          >
            {/* Image / Avatar */}
            <div style={{ position: 'relative' }}>
              {record.image ? (
                <img 
                  src={record.image} 
                  alt={record.name}
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: recordType === 'inCharge' ? '50%' : '12px',
                    objectFit: 'cover',
                    border: '2px solid var(--admin-gold)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.5)'
                  }} 
                />
              ) : (
                <div 
                  className="flex-center"
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: recordType === 'inCharge' ? '50%' : '12px',
                    backgroundColor: 'rgba(200, 155, 75, 0.15)',
                    border: '2px solid var(--admin-gold)',
                    color: 'var(--admin-gold)',
                    fontSize: '2.5rem',
                    fontWeight: 'bold'
                  }}
                >
                  {(record.name || 'S').charAt(0)}
                </div>
              )}
            </div>

            {/* Main Info */}
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <span 
                  style={{ 
                    padding: '0.2rem 0.65rem', 
                    borderRadius: '12px', 
                    fontSize: '0.72rem', 
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(200, 155, 75, 0.18)',
                    border: '1px solid var(--admin-gold)',
                    color: 'var(--admin-gold)'
                  }}
                >
                  {recordType === 'inCharge' ? 'PERSON / IN-CHARGE PROFILE' : 'SERVICE OFFERING'}
                </span>
                
                <span 
                  style={{ 
                    padding: '0.2rem 0.65rem', 
                    borderRadius: '12px', 
                    fontSize: '0.72rem', 
                    fontWeight: 'bold',
                    backgroundColor: record.status === 'Active' ? 'rgba(142, 174, 104, 0.15)' : 'rgba(192, 90, 78, 0.15)',
                    border: record.status === 'Active' ? '1px solid rgba(142, 174, 104, 0.4)' : '1px solid rgba(192, 90, 78, 0.4)',
                    color: record.status === 'Active' ? 'var(--admin-success)' : 'var(--admin-danger)'
                  }}
                >
                  {record.status || 'Active'}
                </span>
              </div>

              <h1 className="serif-title" style={{ fontSize: '1.8rem', color: '#FFFDF9', margin: '0 0 0.5rem 0' }}>
                {record.name || record.title}
              </h1>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
                {(record.temple || record.templeName) && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Landmark size={14} style={{ color: 'var(--admin-gold)' }} />
                    {record.temple || record.templeName}
                  </span>
                )}
                {(record.location || record.district) && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} style={{ color: 'var(--admin-gold)' }} />
                    {record.location || record.district}
                  </span>
                )}
                {record.price && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--admin-gold)', fontWeight: 'bold' }}>
                    <DollarSign size={14} />
                    {record.price}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Specs Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            
            {/* Left Card: Core Details */}
            <div className="glassmorphism" style={{ padding: '1.75rem', borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.18)' }}>
              <h3 className="serif-title" style={{ fontSize: '1.15rem', color: '#FFFDF9', marginBottom: '1rem', borderBottom: '1px solid rgba(214, 181, 109, 0.15)', paddingBottom: '0.5rem' }}>
                {recordType === 'inCharge' ? 'Contact & Assignment Details' : 'Service Specifications'}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--admin-text-muted)' }}>Identifier / ID:</span>
                  <span style={{ color: '#FFFDF9', fontFamily: 'monospace', fontWeight: 'bold' }}>{record.id || record._id}</span>
                </div>

                {record.email && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--admin-text-muted)' }}>Email:</span>
                    <span style={{ color: '#FFFDF9' }}>{record.email}</span>
                  </div>
                )}

                {record.phone && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--admin-text-muted)' }}>Phone:</span>
                    <span style={{ color: '#FFFDF9' }}>{record.phone}</span>
                  </div>
                )}

                {record.designation && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--admin-text-muted)' }}>Designation:</span>
                    <span style={{ color: 'var(--admin-gold)' }}>{record.designation}</span>
                  </div>
                )}

                {record.category && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--admin-text-muted)' }}>Category:</span>
                    <span style={{ color: '#FFFDF9' }}>{record.category}</span>
                  </div>
                )}

                {record.subcategory && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--admin-text-muted)' }}>Subcategory:</span>
                    <span style={{ color: '#FFFDF9' }}>{record.subcategory}</span>
                  </div>
                )}

                {record.availability && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--admin-text-muted)' }}>Availability:</span>
                    <span style={{ color: 'var(--admin-success)' }}>{record.availability}</span>
                  </div>
                )}

                {record.description && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ color: 'var(--admin-text-muted)', display: 'block', marginBottom: '0.3rem' }}>Description:</span>
                    <p style={{ color: '#FFFDF9', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                      {record.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Card: Assigned In-Charge Person or Subcategories */}
            <div className="glassmorphism" style={{ padding: '1.75rem', borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.18)' }}>
              <h3 className="serif-title" style={{ fontSize: '1.15rem', color: '#FFFDF9', marginBottom: '1rem', borderBottom: '1px solid rgba(214, 181, 109, 0.15)', paddingBottom: '0.5rem' }}>
                {recordType === 'service' ? 'Assigned In-Charge Officer' : 'Assigned Offerings & Scope'}
              </h3>

              {recordType === 'service' ? (
                record.assignedInCharge ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div 
                        className="flex-center"
                        style={{
                          width: '45px',
                          height: '45px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(200, 155, 75, 0.2)',
                          border: '1px solid var(--admin-gold)',
                          color: 'var(--admin-gold)',
                          fontWeight: 'bold',
                          fontSize: '1.1rem'
                        }}
                      >
                        {record.assignedInCharge.name.charAt(0)}
                      </div>
                      <div>
                        <span style={{ fontWeight: '600', color: '#FFFDF9', display: 'block', fontSize: '0.95rem' }}>
                          {record.assignedInCharge.name}
                        </span>
                        <span style={{ color: 'var(--admin-gold)', fontSize: '0.78rem' }}>
                          {record.assignedInCharge.designation || 'Service In-Charge'}
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FFFDF9' }}>
                        <Mail size={13} style={{ color: 'var(--admin-gold)' }} />
                        {record.assignedInCharge.email}
                      </span>
                      {record.assignedInCharge.phone && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Phone size={13} />
                          {record.assignedInCharge.phone}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
                    No specific in-charge currently assigned to this service offering.
                  </p>
                )
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem' }}>
                    Branch: <strong style={{ color: '#FFFDF9' }}>{record.branch || 'All Branches'}</strong> | Temple: <strong style={{ color: '#FFFDF9' }}>{record.temple || 'All Temples'}</strong>
                  </p>
                  
                  {Array.isArray(record.serviceAssignments) && record.serviceAssignments.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {record.serviceAssignments.map((a, idx) => (
                        <div key={idx} style={{ backgroundColor: 'rgba(214, 181, 109, 0.06)', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(214, 181, 109, 0.15)' }}>
                          <span style={{ color: 'var(--admin-gold)', fontSize: '0.85rem', fontWeight: 'bold', display: 'block' }}>
                            {a.category || a.name}
                          </span>
                          <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem' }}>
                            {(a.subcategories || []).map(s => s.name).join(', ') || 'All Subcategories'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
                      Full module operational permissions active.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Subcategories Offerings (if service) */}
          {recordType === 'service' && Array.isArray(record.subcategories) && record.subcategories.length > 0 && (
            <div className="glassmorphism" style={{ padding: '1.75rem', borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.18)' }}>
              <h3 className="serif-title" style={{ fontSize: '1.15rem', color: '#FFFDF9', marginBottom: '1rem' }}>
                Included Seva Offerings & Subcategories ({record.subcategories.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                {record.subcategories.map((sub, idx) => (
                  <div 
                    key={sub.id || idx}
                    style={{
                      backgroundColor: 'rgba(200, 155, 75, 0.05)',
                      border: '1px solid rgba(200, 155, 75, 0.2)',
                      borderRadius: '8px',
                      padding: '1rem'
                    }}
                  >
                    <span style={{ fontWeight: 'bold', color: 'var(--admin-gold)', display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                      {sub.name}
                    </span>
                    <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', margin: 0 }}>
                      {sub.description || 'Sacred sanctum seva and offerings.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
