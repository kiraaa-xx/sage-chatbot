import React, { useEffect, useState } from 'react';
import styles from './IntroAnimation.module.css';

export default function IntroAnimation({ onDone }) {
  const [phase, setPhase] = useState('enter'); // enter → text → exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('text'), 600);
    const t2 = setTimeout(() => setPhase('exit'), 2800);
    const t3 = setTimeout(() => onDone(), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div className={`${styles.overlay} ${phase === 'exit' ? styles.exit : ''}`}>
      {/* Animated particle dots */}
      <div className={styles.particles}>
        {[...Array(16)].map((_, i) => (
          <div key={i} className={styles.particle} style={{
            '--angle': `${i * 22.5}deg`,
            '--delay': `${i * 0.06}s`,
            '--dist': `${90 + Math.sin(i) * 30}px`
          }} />
        ))}
      </div>

      {/* Rings */}
      <div className={styles.ring1} />
      <div className={styles.ring2} />
      <div className={styles.ring3} />

      {/* Logo */}
      <div className={`${styles.logoWrap} ${phase !== 'enter' ? styles.logoVisible : ''}`}>
        {/* User's actual logo goes here — falls back to SVG */}
        <img
          src="/logo.png"
          alt="Sage"
          className={styles.logoImg}
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
        {/* Fallback SVG logo */}
        <div className={styles.logoFallback} style={{ display: 'none' }}>
          <svg width="72" height="72" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="38" fill="url(#intro-g1)" />
            <path d="M40 12 C40 12, 54 24, 54 40 C54 56, 40 68, 40 68" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
            <path d="M40 12 C40 12, 26 24, 26 40 C26 56, 40 68, 40 68" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
            <path d="M14 40 C14 40, 26 26, 40 26 C54 26, 66 40, 66 40" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4"/>
            <circle cx="40" cy="40" r="7" fill="white" opacity="0.95"/>
            <defs>
              <linearGradient id="intro-g1" x1="0" y1="0" x2="80" y2="80">
                <stop offset="0%" stopColor="#84B179"/>
                <stop offset="100%" stopColor="#C7EABB"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Name */}
        <div className={`${styles.name} ${phase === 'text' || phase === 'exit' ? styles.nameVisible : ''}`}>
          Sage
        </div>

        {/* Tagline */}
        <div className={`${styles.tagline} ${phase === 'text' || phase === 'exit' ? styles.taglineVisible : ''}`}>
          Your Intelligent Companion
        </div>
      </div>
    </div>
  );
}
