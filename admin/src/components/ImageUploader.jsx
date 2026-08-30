import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, RefreshCw, Eye } from 'lucide-react';

export default function ImageUploader({ 
  label = "Image Asset", 
  value = "", 
  onChange, 
  defaultImage = "",
  helperText = "Paste an image URL or upload a local image file directly." 
}) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to Base64 data URL and upload to backend
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Data,
            name: file.name.split('.')[0]
          })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.url) {
            onChange(json.url);
            setPreviewError(false);
          }
        } else {
          // Fallback to direct base64 data URL
          onChange(base64Data);
          setPreviewError(false);
        }
      } catch (err) {
        // Fallback: direct base64
        onChange(base64Data);
        setPreviewError(false);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange('');
    setPreviewError(false);
  };

  const handleResetDefault = () => {
    if (defaultImage) {
      onChange(defaultImage);
      setPreviewError(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div className="flex-between">
        <label style={{ color: 'var(--admin-cream)', fontSize: '0.82rem', fontWeight: '500' }}>
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--admin-danger)',
              fontSize: '0.72rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem'
            }}
          >
            <X size={12} />
            Clear Image
          </button>
        )}
      </div>

      {/* URL Input & Upload Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <LinkIcon size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(214, 181, 109, 0.4)' }} />
          <input
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setPreviewError(false);
            }}
            placeholder="Paste image URL (https://...) or choose file"
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem 0.6rem 2rem',
              borderRadius: '6px',
              border: '1px solid rgba(214, 181, 109, 0.25)',
              backgroundColor: 'rgba(18, 9, 7, 0.6)',
              color: '#FFFDF9',
              fontSize: '0.84rem'
            }}
          />
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          style={{
            background: 'rgba(214, 181, 109, 0.12)',
            border: '1px solid rgba(214, 181, 109, 0.3)',
            color: 'var(--admin-gold)',
            padding: '0.6rem 0.9rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            whiteSpace: 'nowrap'
          }}
        >
          <Upload size={14} />
          {isUploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>

      {helperText && (
        <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
          {helperText}
        </span>
      )}

      {/* Visual Live Preview Card */}
      {value && (
        <div 
          style={{ 
            marginTop: '0.4rem', 
            borderRadius: '8px', 
            overflow: 'hidden', 
            border: '1.5px solid rgba(214, 181, 109, 0.3)',
            backgroundColor: 'rgba(18, 9, 7, 0.5)',
            position: 'relative'
          }}
        >
          <div style={{ height: '140px', width: '100%', position: 'relative' }}>
            <img 
              src={value} 
              alt={label} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setPreviewError(true)}
            />
            {previewError && (
              <div 
                style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  backgroundColor: 'rgba(18, 9, 7, 0.9)', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--admin-danger)',
                  fontSize: '0.78rem',
                  gap: '0.3rem'
                }}
              >
                <ImageIcon size={20} />
                <span>Image failed to load. Please check URL or file.</span>
              </div>
            )}
          </div>

          <div style={{ padding: '0.4rem 0.75rem', backgroundColor: 'rgba(18, 9, 7, 0.85)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
            <span style={{ color: 'var(--admin-gold)', fontWeight: 'bold' }}>
              Active Image Reference
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{ background: 'none', border: 'none', color: 'var(--admin-cream)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Replace Photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
