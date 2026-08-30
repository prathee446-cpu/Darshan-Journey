import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  CreditCard, Search, Filter, Eye, EyeOff, Printer, Download, 
  Sparkles, CheckCircle2, AlertCircle, IndianRupee, X,
  ArrowLeft, ChevronRight, Building2, User, Phone, Mail,
  Calendar, Clock, ShieldCheck, FileText, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { getAuthHeaders } from '../utils/auth';

// Professional Branded PDF Receipt Generator
export function generatePaymentReceiptPDF(payment) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Background Canvas
    doc.setFillColor(254, 252, 246);
    doc.rect(0, 0, 210, 297, 'F');

    // Outer Golden Border
    doc.setDrawColor(214, 181, 109);
    doc.setLineWidth(1);
    doc.rect(10, 10, 190, 277);

    // Inner Border
    doc.setDrawColor(230, 210, 160);
    doc.setLineWidth(0.3);
    doc.rect(12, 12, 186, 273);

    // Header Banner
    doc.setFillColor(34, 18, 12);
    doc.rect(12, 12, 186, 36, 'F');

    // Brand Title
    doc.setTextColor(214, 181, 109);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('DARSHAN JOURNEY', 105, 25, { align: 'center' });

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(245, 235, 220);
    doc.text('Sacred Temple Darshan & Vedic Seva Reservations Ledger', 105, 33, { align: 'center' });
    doc.text('Official E-Receipt & Tax Invoice', 105, 40, { align: 'center' });

    // Receipt Number & Date Strip
    doc.setFillColor(245, 240, 228);
    doc.rect(15, 54, 180, 16, 'F');
    doc.setDrawColor(214, 181, 109);
    doc.setLineWidth(0.5);
    doc.rect(15, 54, 180, 16);

    doc.setFontSize(10);
    doc.setTextColor(50, 30, 20);
    doc.setFont('helvetica', 'bold');
    doc.text(`RECEIPT NO: ${payment.receiptNumber || 'REC-' + (payment.transactionId || '').slice(-6)}`, 20, 64);
    doc.text(`DATE: ${payment.date || new Date().toISOString().slice(0, 10)}`, 140, 64);

    // Devotee & Reservation Details
    let y = 82;
    doc.setFontSize(12);
    doc.setTextColor(160, 110, 40);
    doc.setFont('helvetica', 'bold');
    doc.text('DEVOTEE & RESERVATION DETAILS', 20, y);
    
    doc.setDrawColor(214, 181, 109);
    doc.setLineWidth(0.4);
    doc.line(20, y + 2, 190, y + 2);
    y += 9;

    const leftColX = 20;
    const rightColX = 110;

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(70, 50, 40);
    doc.text('Primary Devotee:', leftColX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${payment.customer || 'Devotee'}`, leftColX + 35, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Booking Ref:', rightColX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${payment.bookingId || 'N/A'}`, rightColX + 30, y);
    y += 7.5;

    doc.setFont('helvetica', 'bold');
    doc.text('Contact Phone:', leftColX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${payment.phone || 'N/A'}`, leftColX + 35, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Email Address:', rightColX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${payment.email || 'N/A'}`, rightColX + 30, y);
    y += 7.5;

    doc.setFont('helvetica', 'bold');
    doc.text('Sacred Temple:', leftColX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${payment.temple || 'Tamil Nadu Shrine'}`, leftColX + 35, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Location:', rightColX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${payment.templeLocation || 'Tamil Nadu'}`, rightColX + 30, y);
    y += 7.5;

    doc.setFont('helvetica', 'bold');
    doc.text('Seva / Service:', leftColX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${payment.service || 'Special Seva'}`, leftColX + 35, y);
    y += 13;

    // Transaction & Account Information
    doc.setFontSize(12);
    doc.setTextColor(160, 110, 40);
    doc.setFont('helvetica', 'bold');
    doc.text('TRANSACTION & ACCOUNT INFORMATION', 20, y);
    doc.line(20, y + 2, 190, y + 2);
    y += 9;

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(70, 50, 40);
    doc.text('Transaction ID:', leftColX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${payment.transactionId || 'N/A'}`, leftColX + 35, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Payment ID:', rightColX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${payment.paymentId || 'N/A'}`, rightColX + 30, y);
    y += 7.5;

    doc.setFont('helvetica', 'bold');
    doc.text('Payment Mode:', leftColX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${payment.paymentMethod || 'UPI'}`, leftColX + 35, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Payment Status:', rightColX, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 120, 60);
    doc.text(`${payment.paymentStatus || 'SUCCESS'}`, rightColX + 30, y);
    doc.setTextColor(70, 50, 40);
    y += 7.5;

    // ACCOUNT NUMBER INCLUSION (Masked for privacy/security)
    doc.setFont('helvetica', 'bold');
    doc.text('Account Number:', leftColX, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 20, 15);
    doc.text(`${payment.accountNumber || 'XXXX XXXX 4821'}`, leftColX + 35, y);
    doc.setTextColor(70, 50, 40);

    doc.setFont('helvetica', 'bold');
    doc.text('Gateway Ref:', rightColX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${payment.gatewayRef || 'GW-UPI-892104'}`, rightColX + 30, y);
    y += 13;

    // Payment Financial Breakdown
    doc.setFillColor(245, 240, 228);
    doc.rect(15, y, 180, 40, 'F');
    doc.setDrawColor(214, 181, 109);
    doc.setLineWidth(0.5);
    doc.rect(15, y, 180, 40);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Seva Offering Subtotal:', 25, y + 9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rs. ${payment.subtotal || payment.numericAmount || 501}`, 165, y + 9, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.text('Temple Convenience & Maintenance:', 25, y + 17);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rs. ${payment.addons || 0}`, 165, y + 17, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.text('Applicable GST / Taxes:', 25, y + 25);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rs. ${payment.gst || 0}`, 165, y + 25, { align: 'right' });

    doc.setDrawColor(214, 181, 109);
    doc.line(25, y + 28, 185, y + 28);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 18, 12);
    doc.text('TOTAL AMOUNT PAID:', 25, y + 35);
    doc.setTextColor(40, 120, 60);
    doc.text(`${payment.amount || 'Rs. ' + (payment.numericAmount || 501)}`, 165, y + 35, { align: 'right' });

    // Footer & Disclaimer
    y += 52;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 100, 90);
    doc.text('This is a computer generated official sacred seva receipt and does not require a physical signature.', 105, y, { align: 'center' });
    doc.text('For queries regarding darshan timings or seva guidelines, contact support@darshanjourney.com', 105, y + 5, { align: 'center' });

    // Download PDF
    const filename = `Darshan_Receipt_${payment.bookingId || payment.transactionId || 'Payment'}.pdf`;
    doc.save(filename);
    return true;
  } catch (err) {
    console.error('Failed to generate PDF receipt:', err);
    alert('Failed to generate PDF receipt: ' + err.message);
    return false;
  }
}

export default function PaymentsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const transactionIdParam = params.transactionId || params.paymentId || params.id;

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('ALL');

  // Single Transaction Details State
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [loadingTxn, setLoadingTxn] = useState(false);
  const [showFullAccount, setShowFullAccount] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Fetch all payments ledger
  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/payments', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPayments(data);
        } else {
          setError('Invalid payment records received from server.');
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        setError(errJson.message || `Server error (${res.status}). Unable to fetch payments.`);
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setError('Unable to load payment audit records. Please check the backend server / MongoDB connection.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch single transaction details
  const fetchTransactionDetails = async (tId) => {
    if (!tId) return;
    setLoadingTxn(true);
    setError(null);
    try {
      const res = await fetch(`/api/payments/transaction/${encodeURIComponent(tId)}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedTxn(data);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setError(errJson.message || `Transaction not found (${res.status}).`);
      }
    } catch (err) {
      console.error('Failed to fetch transaction details:', err);
      setError('Unable to load transaction details.');
    } finally {
      setLoadingTxn(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    if (transactionIdParam) {
      fetchTransactionDetails(transactionIdParam);
    } else {
      setSelectedTxn(null);
    }
  }, [transactionIdParam]);

  const handleDownloadReceipt = (payment, e) => {
    if (e) e.stopPropagation();
    const success = generatePaymentReceiptPDF(payment);
    if (success) {
      showToast(`📄 Receipt for ${payment.transactionId} downloaded successfully!`);
    }
  };

  const filteredPayments = payments.filter(p => {
    const matchesMethod = selectedMethod === 'ALL' || (p.paymentMethod || '').toLowerCase().includes(selectedMethod.toLowerCase());
    const s = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      (p.transactionId || '').toLowerCase().includes(s) ||
      (p.paymentId || '').toLowerCase().includes(s) ||
      (p.bookingId || '').toLowerCase().includes(s) ||
      (p.customer || '').toLowerCase().includes(s) ||
      (p.temple || '').toLowerCase().includes(s) ||
      (p.accountNumber || '').toLowerCase().includes(s);
    return matchesMethod && matchesSearch;
  });

  const totalAmountSum = filteredPayments.reduce((acc, p) => acc + (p.numericAmount || 501), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', minHeight: '80vh' }}>
      
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

      {/* Global Error Banner */}
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
              <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Database Notice</div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)' }}>{error}</div>
            </div>
          </div>
          <button
            onClick={() => {
              if (transactionIdParam) fetchTransactionDetails(transactionIdParam);
              else fetchPayments();
            }}
            style={{
              backgroundColor: 'rgba(192, 90, 78, 0.3)',
              border: '1px solid rgba(192, 90, 78, 0.6)',
              color: '#FFFDF9',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.82rem'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW B: SINGLE TRANSACTION & ACCOUNT DETAILS VIEW                         */}
      {/* ========================================================================= */}
      {transactionIdParam && selectedTxn && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Breadcrumb Hierarchy */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--admin-text-muted)', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/admin/payments')}
              style={{ background: 'none', border: 'none', color: 'var(--admin-gold)', cursor: 'pointer', padding: 0, fontSize: '0.85rem', fontWeight: 500 }}
            >
              Payments
            </button>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--admin-off-white)', fontWeight: 600 }}>
              Transaction #{selectedTxn.transactionId}
            </span>
          </div>

          {/* Action Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--admin-gold)', fontWeight: 700 }}>
                PAYMENT AUDIT & SETTLEMENT DETAILS
              </span>
              <h1 className="serif-title" style={{ fontSize: '1.85rem', color: 'var(--admin-off-white)', marginTop: '0.2rem' }}>
                Transaction #{selectedTxn.transactionId}
              </h1>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/admin/payments')}
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
                  fontSize: '0.86rem'
                }}
              >
                <ArrowLeft size={16} />
                Back to Payments
              </button>

              <button
                onClick={() => handleDownloadReceipt(selectedTxn)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.2rem',
                  backgroundColor: 'var(--admin-gold)',
                  border: '1px solid var(--admin-gold-light)',
                  borderRadius: '8px',
                  color: '#120907',
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  fontWeight: 600
                }}
              >
                <Download size={16} />
                Download PDF Receipt
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            
            {/* Card 1: Transaction & Gateway Info */}
            <div className="glassmorphism" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid rgba(214, 181, 109, 0.15)', paddingBottom: '0.75rem' }}>
                <CreditCard size={20} style={{ color: 'var(--admin-gold)' }} />
                <h3 className="serif-title" style={{ fontSize: '1.15rem', color: '#FFFDF9', margin: 0 }}>Transaction & Settlement</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.88rem' }}>
                <div>
                  <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Transaction ID</span>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--admin-gold-light)', marginTop: '0.2rem' }}>
                    {selectedTxn.transactionId}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Payment ID</span>
                  <div style={{ fontWeight: 600, color: 'var(--admin-off-white)', marginTop: '0.2rem' }}>
                    {selectedTxn.paymentId}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Payment Method</span>
                  <div style={{ color: 'var(--admin-off-white)', marginTop: '0.2rem' }}>
                    {selectedTxn.paymentMethod}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Gateway Ref</span>
                  <div style={{ fontFamily: 'monospace', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>
                    {selectedTxn.gatewayRef}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Payment Date</span>
                  <div style={{ color: 'var(--admin-off-white)', marginTop: '0.2rem' }}>
                    {selectedTxn.date}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Payment Status</span>
                  <div style={{ marginTop: '0.2rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: selectedTxn.paymentStatus === 'SUCCESS' || selectedTxn.paymentStatus === 'PAID' ? 'rgba(142, 174, 104, 0.2)' : 'rgba(192, 90, 78, 0.2)',
                        color: selectedTxn.paymentStatus === 'SUCCESS' || selectedTxn.paymentStatus === 'PAID' ? '#8EAE68' : '#C05A4E'
                      }}
                    >
                      {selectedTxn.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Account Details (Masked with toggle) */}
            <div className="glassmorphism" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(214, 181, 109, 0.15)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <ShieldCheck size={20} style={{ color: 'var(--admin-gold)' }} />
                  <h3 className="serif-title" style={{ fontSize: '1.15rem', color: '#FFFDF9', margin: 0 }}>Account Information</h3>
                </div>

                <button
                  onClick={() => setShowFullAccount(!showFullAccount)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.35rem 0.75rem',
                    backgroundColor: 'rgba(214, 181, 109, 0.1)',
                    border: '1px solid rgba(214, 181, 109, 0.3)',
                    borderRadius: '6px',
                    color: 'var(--admin-gold)',
                    fontSize: '0.76rem',
                    cursor: 'pointer'
                  }}
                >
                  {showFullAccount ? <EyeOff size={13} /> : <Eye size={13} />}
                  {showFullAccount ? 'Hide Account' : 'Show Full Account'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem' }}>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(214, 181, 109, 0.15)' }}>
                  <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', display: 'block' }}>
                    Linked Devotee Account Number / VPA
                  </span>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: 700, color: 'var(--admin-gold)', marginTop: '0.3rem' }}>
                    {showFullAccount ? selectedTxn.fullAccountNumber : selectedTxn.accountNumber}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>
                    {showFullAccount ? 'Full account reference shown (Authorized Admin view)' : 'Account masked for privacy & security standards'}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Payer Name</span>
                    <div style={{ fontWeight: 600, color: 'var(--admin-off-white)', marginTop: '0.2rem' }}>
                      {selectedTxn.customer}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Bank / Channel</span>
                    <div style={{ color: 'var(--admin-off-white)', marginTop: '0.2rem' }}>
                      {selectedTxn.bankName}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Contact Phone</span>
                    <div style={{ color: 'var(--admin-off-white)', marginTop: '0.2rem' }}>
                      {selectedTxn.phone}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Email</span>
                    <div style={{ color: 'var(--admin-off-white)', marginTop: '0.2rem', wordBreak: 'break-all' }}>
                      {selectedTxn.email}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Linked Booking & Seva */}
            <div className="glassmorphism" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid rgba(214, 181, 109, 0.15)', paddingBottom: '0.75rem' }}>
                <Building2 size={20} style={{ color: 'var(--admin-gold)' }} />
                <h3 className="serif-title" style={{ fontSize: '1.15rem', color: '#FFFDF9', margin: 0 }}>Linked Seva & Shrine</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.88rem' }}>
                <div>
                  <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Booking Reference</span>
                  <div style={{ fontWeight: 600, color: 'var(--admin-gold)', marginTop: '0.2rem' }}>
                    {selectedTxn.bookingId}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Sacred Shrine</span>
                  <div style={{ fontWeight: 600, color: 'var(--admin-off-white)', marginTop: '0.2rem' }}>
                    {selectedTxn.temple}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)' }}>
                    {selectedTxn.templeLocation}
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>Pooja / Seva Description</span>
                  <div style={{ color: 'var(--admin-off-white)', marginTop: '0.2rem' }}>
                    {selectedTxn.service}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Financial Summary & Receipt Download */}
            <div className="glassmorphism" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid rgba(214, 181, 109, 0.15)', paddingBottom: '0.75rem' }}>
                <FileText size={20} style={{ color: 'var(--admin-gold)' }} />
                <h3 className="serif-title" style={{ fontSize: '1.15rem', color: '#FFFDF9', margin: 0 }}>Financial Breakdown & Receipt</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem' }}>
                <div className="flex-between">
                  <span style={{ color: 'var(--admin-text-muted)' }}>Seva Subtotal:</span>
                  <span style={{ color: 'var(--admin-off-white)' }}>₹{selectedTxn.subtotal || selectedTxn.numericAmount}</span>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--admin-text-muted)' }}>Temple Maintenance:</span>
                  <span style={{ color: 'var(--admin-off-white)' }}>₹{selectedTxn.addons || 0}</span>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--admin-text-muted)' }}>Applicable Taxes:</span>
                  <span style={{ color: 'var(--admin-off-white)' }}>₹{selectedTxn.gst || 0}</span>
                </div>
                <div className="flex-between" style={{ paddingTop: '0.8rem', borderTop: '1px dashed rgba(214, 181, 109, 0.25)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--admin-gold)' }}>Total Amount Paid:</span>
                  <span style={{ fontWeight: 700, color: '#8EAE68', fontSize: '1.25rem' }}>
                    {selectedTxn.amount || `₹${selectedTxn.numericAmount}`}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <button
                  onClick={() => handleDownloadReceipt(selectedTxn)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(214, 181, 109, 0.15)',
                    border: '1px solid var(--admin-gold)',
                    borderRadius: '8px',
                    color: 'var(--admin-gold)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Download size={16} />
                  Download Official PDF Receipt
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW A: MASTER PAYMENTS LEDGER TABLE                                      */}
      {/* ========================================================================= */}
      {!transactionIdParam && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
          
          {/* Header */}
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--admin-gold)', fontWeight: 700 }}>
                FINANCIAL AUDIT & OFFERINGS
              </span>
              <h2 className="serif-title" style={{ fontSize: '1.85rem', color: '#FFFDF9', marginTop: '0.2rem', marginBottom: '0.2rem' }}>
                Sacred Offerings & Payments Ledger
              </h2>
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
                Audit log of UPI transactions, account details, and devotee offerings with instant PDF receipt downloads.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ padding: '0.55rem 1.2rem', borderRadius: '8px', backgroundColor: 'rgba(200, 155, 75, 0.12)', border: '1px solid rgba(200, 155, 75, 0.3)', color: 'var(--admin-gold)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                Total Filtered: ₹{totalAmountSum.toLocaleString('en-IN')}
              </div>
              <button
                onClick={fetchPayments}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'transparent',
                  border: '1px solid rgba(214, 181, 109, 0.25)',
                  color: '#FFFDF9',
                  padding: '0.55rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="glassmorphism" style={{ padding: '1rem 1.25rem', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(214, 181, 109, 0.5)' }} />
              <input
                type="text"
                placeholder="Search by Transaction ID, Booking ID, Devotee, Temple or Account..."
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

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['ALL', 'UPI', 'CARD', 'NETBANKING'].map(method => (
                <button
                  key={method}
                  onClick={() => setSelectedMethod(method)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '20px',
                    border: selectedMethod === method ? '1px solid var(--admin-gold)' : '1px solid rgba(214, 181, 109, 0.15)',
                    backgroundColor: selectedMethod === method ? 'rgba(200, 155, 75, 0.18)' : 'transparent',
                    color: selectedMethod === method ? '#FFFDF9' : 'var(--admin-text-muted)',
                    fontSize: '0.78rem',
                    fontWeight: selectedMethod === method ? 'bold' : 'normal',
                    cursor: 'pointer'
                  }}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Spinner */}
          {loading && !error && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--admin-gold)' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
              <p style={{ fontSize: '0.9rem', color: 'var(--admin-text-muted)' }}>Loading payments audit log from MongoDB...</p>
            </div>
          )}

          {/* Transactions Table */}
          {!loading && !error && filteredPayments.length === 0 ? (
            <div className="glassmorphism" style={{ padding: '3rem', textAlign: 'center', borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.15)' }}>
              <CreditCard size={36} style={{ color: 'var(--admin-gold)', opacity: 0.5, margin: '0 auto 1rem' }} />
              <h3 style={{ color: '#FFFDF9', marginBottom: '0.5rem' }}>No Transactions Found</h3>
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto' }}>
                {searchTerm || selectedMethod !== 'ALL'
                  ? 'No transaction records match your search filter.'
                  : 'No payment transactions have been logged yet.'}
              </p>
            </div>
          ) : !loading && !error && (
            <div className="glassmorphism" style={{ borderRadius: '14px', border: '1px solid rgba(214, 181, 109, 0.15)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(214, 181, 109, 0.2)', color: 'var(--admin-gold-light)', fontFamily: 'var(--font-serif)', fontSize: '0.78rem', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '0.9rem 1rem' }}>TRANSACTION ID</th>
                      <th style={{ padding: '0.9rem 1rem' }}>BOOKING ID</th>
                      <th style={{ padding: '0.9rem 1rem' }}>DEVOTEE</th>
                      <th style={{ padding: '0.9rem 1rem' }}>SEVA / TEMPLE</th>
                      <th style={{ padding: '0.9rem 1rem' }}>ACCOUNT NUMBER</th>
                      <th style={{ padding: '0.9rem 1rem' }}>PAYMENT METHOD</th>
                      <th style={{ padding: '0.9rem 1rem' }}>AMOUNT</th>
                      <th style={{ padding: '0.9rem 1rem' }}>STATUS</th>
                      <th style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>RECEIPT</th>
                    </tr>
                  </thead>
                  <tbody style={{ color: 'var(--admin-cream)' }}>
                    {filteredPayments.map(p => (
                      <tr 
                        key={p.transactionId} 
                        style={{ 
                          borderBottom: '1px solid rgba(214, 181, 109, 0.08)',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(214, 181, 109, 0.06)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {/* Clickable Transaction ID */}
                        <td style={{ padding: '0.95rem 1rem' }}>
                          <button
                            onClick={() => navigate(`/admin/payments/transaction/${encodeURIComponent(p.transactionId)}`)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--admin-gold)',
                              fontFamily: 'monospace',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              padding: 0,
                              fontSize: '0.88rem',
                              textAlign: 'left',
                              textDecoration: 'underline',
                              textUnderlineOffset: '3px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#FFFDF9'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--admin-gold)'}
                            title="Click to view complete transaction and account details"
                          >
                            {p.transactionId}
                          </button>
                        </td>

                        <td style={{ padding: '0.95rem 1rem', fontWeight: '500', color: 'var(--admin-off-white)' }}>
                          {p.bookingId}
                        </td>

                        <td style={{ padding: '0.95rem 1rem' }}>
                          <span style={{ fontWeight: '600', color: '#FFFDF9', display: 'block' }}>{p.customer}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{p.phone || p.email}</span>
                        </td>

                        <td style={{ padding: '0.95rem 1rem' }}>
                          <span style={{ color: 'var(--admin-cream)', display: 'block' }}>{p.service}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{p.temple}</span>
                        </td>

                        {/* Masked Account Number Column */}
                        <td style={{ padding: '0.95rem 1rem', fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--admin-gold-light)' }}>
                          {p.accountNumber || 'XXXX XXXX 4821'}
                        </td>

                        <td style={{ padding: '0.95rem 1rem' }}>
                          <span style={{ backgroundColor: 'rgba(214, 181, 109, 0.08)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(214, 181, 109, 0.2)', fontSize: '0.75rem', color: 'var(--admin-cream)' }}>
                            {p.paymentMethod}
                          </span>
                        </td>

                        <td style={{ padding: '0.95rem 1rem', fontWeight: 'bold', color: '#8EAE68', fontSize: '0.95rem' }}>
                          {p.amount || `₹${p.numericAmount}`}
                        </td>

                        <td style={{ padding: '0.95rem 1rem' }}>
                          <span
                            style={{
                              padding: '0.15rem 0.5rem',
                              borderRadius: '10px',
                              fontSize: '0.72rem',
                              fontWeight: 'bold',
                              backgroundColor: p.paymentStatus === 'SUCCESS' || p.paymentStatus === 'PAID' ? 'rgba(142, 174, 104, 0.15)' : 'rgba(192, 90, 78, 0.15)',
                              border: p.paymentStatus === 'SUCCESS' || p.paymentStatus === 'PAID' ? '1px solid rgba(142, 174, 104, 0.35)' : '1px solid rgba(192, 90, 78, 0.35)',
                              color: p.paymentStatus === 'SUCCESS' || p.paymentStatus === 'PAID' ? '#8EAE68' : '#C05A4E'
                            }}
                          >
                            {p.paymentStatus}
                          </span>
                        </td>

                        {/* Action Buttons: View Details & Download Receipt */}
                        <td style={{ padding: '0.95rem 1rem', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => navigate(`/admin/payments/transaction/${encodeURIComponent(p.transactionId)}`)}
                              style={{
                                background: 'rgba(214, 181, 109, 0.12)',
                                border: '1px solid rgba(214, 181, 109, 0.25)',
                                color: 'var(--admin-gold)',
                                padding: '0.35rem 0.65rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}
                              title="View Transaction Details"
                            >
                              <Eye size={13} />
                              Details
                            </button>

                            <button
                              onClick={(e) => handleDownloadReceipt(p, e)}
                              style={{
                                background: 'rgba(142, 174, 104, 0.15)',
                                border: '1px solid rgba(142, 174, 104, 0.35)',
                                color: '#8EAE68',
                                padding: '0.35rem 0.65rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                fontWeight: 600
                              }}
                              title="Download PDF Receipt"
                            >
                              <Download size={13} />
                              Receipt
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

        </div>
      )}

    </div>
  );
}
