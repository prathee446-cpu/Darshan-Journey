import React, { useState, useEffect } from 'react';

/**
 * Floating Date & Time Badge matching reference theme
 * Displays live DATE and TIME in the bottom-right corner
 */
export default function FloatingDateTimeBadge() {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = now.getFullYear();
      setDateStr(`${dd}/${mm}/${yyyy}`);

      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const strHours = String(hours).padStart(2, '0');
      setTimeStr(`${strHours}:${minutes}:${seconds} ${ampm}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '1.25rem',
        right: '1.25rem',
        background: '#2C1A17',
        border: '1px solid #C8A96A',
        borderRadius: '12px',
        padding: '0.5rem 0.9rem',
        color: '#F4E4BC',
        fontFamily: 'monospace, sans-serif',
        fontSize: '0.78rem',
        fontWeight: 700,
        letterSpacing: '0.6px',
        boxShadow: '0 8px 24px rgba(44, 26, 23, 0.4)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem',
        pointerEvents: 'none'
      }}
    >
      <div style={{ color: '#F4E4BC' }}>
        <span style={{ color: '#C8A96A' }}>DATE:</span> {dateStr}
      </div>
      <div style={{ color: '#F4E4BC' }}>
        <span style={{ color: '#C8A96A' }}>TIME:</span> {timeStr}
      </div>
    </div>
  );
}
