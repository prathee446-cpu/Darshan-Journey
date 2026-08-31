import React from 'react';
import darshanLogo from '../assets/exact_darshan_logo.png';

export default function Logo({ className = "nav-logo-img", alt = "Darshan Journey Logo", style = {} }) {
  return (
    <img 
      src={darshanLogo} 
      alt={alt} 
      className={className} 
      style={{
        objectFit: 'contain',
        height: 'auto',
        maxHeight: '100%',
        ...style
      }}
    />
  );
}
