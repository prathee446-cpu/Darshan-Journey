import React, { useState, useEffect } from 'react';
import GoldParticles from './GoldParticles';
import AuthModal from './AuthModal';
import VirtualDarshanModal from './VirtualDarshanModal';
import { Volume2, VolumeX, Flame } from 'lucide-react';

import shivaImg from '../assets/shiva_statue_transparent.png';
import deity1 from '../assets/deity_1.png';
import deity2 from '../assets/deity_2.png';
import deity3 from '../assets/deity_3.png';
import deity4 from '../assets/deity_4.png';

const HERO_IMAGES = [shivaImg, deity1, deity2, deity3, deity4];

export default function LandingPage({ onExplore }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDarshanOpen, setIsDarshanOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [diyaActive, setDiyaActive] = useState(true);

  // Switch center deity image every 2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio API synthesized ambient temple bell chime
  const toggleAudio = () => {
    if (!isPlayingAudio) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(432, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 4.5);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 4.5);
        setIsPlayingAudio(true);
        setTimeout(() => setIsPlayingAudio(false), 4500);
      } catch (e) {
        console.log('Audio init:', e);
      }
    } else {
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="app-container landing-mode">
      {/* Floating Gold Particles */}
      <GoldParticles />

      {/* Ambient Gold Radial Lighting & Vignette */}
      <div 
        className="bg-lighting" 
        style={{
          background: diyaActive
            ? 'radial-gradient(ellipse at center, rgba(245, 225, 164, 0.35) 0%, rgba(212, 175, 55, 0.18) 45%, rgba(0, 0, 0, 0) 80%)'
            : undefined
        }}
      />
      <div className="bg-vignette" />

      {/* Main 100vh Centered Flex Column */}
      <main className="landing-hero-center">
        {/* Split Title Layer + Centered Deity Carousel */}
        <div className="hero-title-statue-wrapper">
          <div className="hero-title-layer">
            <span className="hero-word left">DARSHAN</span>
            <span className="hero-word right">JOURNEY</span>
          </div>

          <div className="statue-container">
            {HERO_IMAGES.map((imgSrc, idx) => (
              <img 
                key={idx}
                src={imgSrc} 
                alt={`Divine Deity ${idx + 1}`} 
                className={`shiva-img ${idx === currentImageIndex ? 'active' : ''}`}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  height: '100%',
                  width: 'auto',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  opacity: idx === currentImageIndex ? 1 : 0,
                  transition: 'opacity 0.65s cubic-bezier(0.4, 0, 0.2, 1), filter 0.5s ease',
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.9)) drop-shadow(0 0 15px rgba(212, 175, 55, 0.15))'
                }}
                onClick={toggleAudio}
                title="Click to play meditative chime"
              />
            ))}
          </div>
        </div>

        {/* Compact Description (Font size 19px, Max-width 650px) */}
        <p className="hero-description-compact">
          Experience sacred pilgrimages across India's most divine temples. Begin your spiritual journey with comfort, devotion, and unforgettable memories.
        </p>

        {/* Explore Button with exact 32px spacing */}
        <button 
          className="btn-explore"
          onClick={onExplore}
          style={{ marginTop: '32px' }}
        >
          Explore &rarr;
        </button>
      </main>

      {/* Audio & Glow Controls */}
      <div className="audio-toggle-container">
        <button 
          className={`audio-btn ${isPlayingAudio ? 'active' : ''}`}
          onClick={toggleAudio}
          title={isPlayingAudio ? "Mute Meditative Audio" : "Play Meditative Bell Chime"}
        >
          {isPlayingAudio ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        <button 
          className={`diya-btn ${diyaActive ? 'active' : ''}`}
          onClick={() => setDiyaActive(!diyaActive)}
          title="Toggle Diya Flame & Ambient Glow"
        >
          <Flame size={18} />
        </button>
      </div>

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <VirtualDarshanModal isOpen={isDarshanOpen} onClose={() => setIsDarshanOpen(false)} />
    </div>
  );
}
