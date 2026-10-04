import React from 'react';
import darshanLogo from '../assets/exact_darshan_logo.png';
import { useWebsiteContent } from '../context/ContentContext';
import { resolveImageUrl } from '../utils/imageUrl';

export default function Logo({ className = "nav-logo-img", alt = "Darshan Journey Logo", style = {} }) {
  const { content } = useWebsiteContent();
  const dynamicLogo = content?.brand?.logoMain || content?.brand?.logo || content?.home?.logo;
  const logoSrc = resolveImageUrl(dynamicLogo, darshanLogo);

  return (
    <img 
      src={logoSrc} 
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
