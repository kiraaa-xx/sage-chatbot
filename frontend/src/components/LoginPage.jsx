import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope, faLock, faUser, faEye, faEyeSlash,
  faArrowRight, faLeaf, faSpinner, faCircleCheck,
  faTriangleExclamation, faInfoCircle, faTimes,
  faCode, faDatabase, faServer, faGlobe, faHeart
} from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '../stores/authStore.js';
import styles from './LoginPage.module.css';

function Orbs() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    const orbs = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const spawnOrb = () => {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const angle = Math.random() * Math.PI * 2;
      const spawnR = 80 + Math.random() * 60;
      const size = 20 + Math.random() * 65;
      const speed = 0.45 + Math.random() * 0.9;
      const hue = 95 + Math.random() * 65;
      orbs.push({
        x: cx + Math.cos(angle) * spawnR, y: cy + Math.sin(angle) * spawnR,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        size, alpha: 0, maxAlpha: 0.3 + Math.random() * 0.35, hue,
        life: 0, maxLife: 220 + Math.random() * 200,
        fadeInEnd: 45, fadeOutStart: 165,
      });
    };
    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (frame % 16 === 0 && orbs.length < 24) spawnOrb();
      frame++;
      for (let i = orbs.length - 1; i >= 0; i--) {
        const o = orbs[i];
        o.x += o.vx; o.y += o.vy; o.life++;
        if (o.life < o.fadeInEnd) o.alpha = (o.life / o.fadeInEnd) * o.maxAlpha;
        else if (o.life > o.fadeOutStart) o.alpha = Math.max(0, o.maxAlpha * (1 - (o.life - o.fadeOutStart) / (o.maxLife - o.fadeOutStart)));
        else o.alpha = o.maxAlpha;
        if (o.life >= o.maxLife) { orbs.splice(i, 1); continue; }
        const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.size);
        grad.addColorStop(0, `hsla(${o.hue},72%,68%,${o.alpha})`);
        grad.addColorStop(0.45, `hsla(${o.hue},62%,58%,${o.alpha * 0.55})`);
        grad.addColorStop(1, `hsla(${o.hue},52%,48%,0)`);
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.size, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className={styles.orbCanvas} />;
}

function AboutModal({ onClose }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}><FontAwesomeIcon icon={faTimes} /></button>
        <div className={styles.modalHeader}>
          <img src="/logo.png" alt="SAGE" className={styles.modalLogo} onError={e => e.target.style.display='none'} />
          <h2 className={styles.modalTitle}>About SAGE</h2>
          <p className={styles.modalSub}>Your Intelligent Companion</p>
        </div>
        <div className={styles.aboutGrid}>
          <div className={styles.aboutCard}>
            <span className={styles.aboutIcon}><FontAwesomeIcon icon={faCode} /></span>
            <div>
              <div className={styles.aboutLabel}>Frontend</div>
              <div className={styles.aboutValue}>React 18 + Vite — a fast, modern UI built with reusable components. State managed by Zustand. Styled with CSS Modules.</div>
            </div>
          </div>
          <div className={styles.aboutCard}>
            <span className={styles.aboutIcon}><FontAwesomeIcon icon={faServer} /></span>
            <div>
              <div className={styles.aboutLabel}>Backend</div>
              <div className={styles.aboutValue}>Node.js + Express — a lightweight REST API handling chat, image analysis, and conversation history routing.</div>
            </div>
          </div>
          <div className={styles.aboutCard}>
            <span className={styles.aboutIcon}><FontAwesomeIcon icon={faDatabase} /></span>
            <div>
              <div className={styles.aboutLabel}>Database & Auth</div>
              <div className={styles.aboutValue}>Supabase — manages user accounts and secure authentication. Think of it as open-source Firebase for your data.</div>
            </div>
          </div>
          <div className={styles.aboutCard}>
            <span className={styles.aboutIcon}>🧠</span>
            <div>
              <div className={styles.aboutLabel}>AI Models</div>
              <div className={styles.aboutValue}>Groq API powers chat (Llama 3.3 70B) and vision (Llama 4 Scout) — ultra-fast AI inference for real-time responses.</div>
            </div>
          </div>
          <div className={styles.aboutCard}>
            <span className={styles.aboutIcon}>🔍</span>
            <div>
              <div className={styles.aboutLabel}>Memory (RAG)</div>
              <div className={styles.aboutValue}>Retrieval-Augmented Generation — SAGE recalls context from your past conversations to give smarter, relevant answers.</div>
            </div>
          </div>
          <div className={styles.aboutCard}>
            <span className={styles.aboutIcon}><FontAwesomeIcon icon={faGlobe} /></span>
            <div>
              <div className={styles.aboutLabel}>Hosting</div>
              <div className={styles.aboutValue}>Runs locally on your machine — frontend on port 5173, backend on 3001. Deployable to Vercel or Render with ease.</div>
            </div>
          </div>
        </div>
        <div className={styles.aboutCredit}>
          <FontAwesomeIcon icon={faHeart} className={styles.heartIcon} />
          <span>Developed by <strong>Kris Chand</strong> &amp; <strong>Claude LLM</strong> ❤️</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { signIn, signUp, authError, clearError, loading } = useAuthStore();
  const [mode, setMode] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [localErr, setLocalErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const update = (k, v) => { setForm(f => ({ ...f, [k]: v })); clearError(); setLocalErr(''); };
  const validate = () => {
    if (!form.email.includes('@')) return 'Enter a valid email address.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (mode === 'signup' && !form.name.trim()) return 'Please enter your name.';
    return '';
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setLocalErr(err); return; }
    setSubmitting(true);
    if (mode === 'login') { await signIn(form.email, form.password); }
    else { const { error } = await signUp(form.email, form.password, form.name); if (!error) setMode('verify'); }
    setSubmitting(false);
  };
  const switchMode = (next) => { setMode(next); clearError(); setLocalErr(''); };
  const errorMsg = localErr || authError;

  if (mode === 'verify') {
    return (
      <div className={styles.page}>
        <Orbs />
        <div className={styles.verifyCenter}>
          <div className={styles.card}>
            <div className={styles.verifyIcon}><FontAwesomeIcon icon={faCircleCheck} /></div>
            <h2 className={styles.verifyTitle}>Check your email</h2>
            <p className={styles.verifySub}>We sent a confirmation link to <strong>{form.email}</strong>.<br />Click it to activate your account, then come back to log in.</p>
            <button className={styles.btn} onClick={() => setMode('login')}><span>Back to Login</span><FontAwesomeIcon icon={faArrowRight} /></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Orbs />

      <button className={styles.aboutBtn} onClick={() => setShowAbout(true)}>
        <FontAwesomeIcon icon={faInfoCircle} /><span>About</span>
      </button>

      {/* ── Hero header ── */}
      <header className={styles.heroTitle}>
        <div className={styles.rotatingLogoWrap}>
          <img src="/logo.png" alt="SAGE" className={styles.rotatingLogo}
            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
          <div className={styles.rotatingLogoFallback} style={{ display:'none' }}>
            <FontAwesomeIcon icon={faLeaf} />
          </div>
        </div>
        <h1 className={styles.siteName}>SAGE</h1>
        {/* ── CHANGE TAGLINE BELOW ── */}
        <p className={styles.tagline}>Upgrade Your Stage with SAGE</p>
      </header>

      {/* ── Login/signup card ── */}
      <main className={styles.center}>
        <div className={styles.card}>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${mode==='login'?styles.tabActive:''}`} onClick={() => switchMode('login')}>Sign In</button>
            <button className={`${styles.tab} ${mode==='signup'?styles.tabActive:''}`} onClick={() => switchMode('signup')}>Create Account</button>
          </div>
          <h2 className={styles.title}>{mode==='login' ? 'Welcome back' : 'Join SAGE'}</h2>
          <p className={styles.sub}>{mode==='login' ? 'Sign in to access your conversations and AI history.' : 'Create your account to start chatting with SAGE AI.'}</p>
          {errorMsg && (
            <div className={styles.errorBanner}>
              <FontAwesomeIcon icon={faTriangleExclamation} /><span>{errorMsg}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className={styles.form}>
            {mode==='signup' && (
              <div className={styles.field}>
                <label className={styles.label}>Full Name</label>
                <div className={styles.inputWrap}>
                  <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
                  <input type="text" className={styles.input} placeholder="Your name" value={form.name} onChange={e => update('name', e.target.value)} autoComplete="name" />
                </div>
              </div>
            )}
            <div className={styles.field}>
              <label className={styles.label}>Email Address</label>
              <div className={styles.inputWrap}>
                <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
                <input type="email" className={styles.input} placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} autoComplete="email" />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrap}>
                <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
                <input type={showPass?'text':'password'} className={styles.input} placeholder={mode==='signup'?'Min. 6 characters':'Your password'} value={form.password} onChange={e => update('password', e.target.value)} autoComplete={mode==='login'?'current-password':'new-password'} />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                  <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>
            <button type="submit" className={styles.btn} disabled={submitting||loading}>
              {submitting||loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <><span>{mode==='login'?'Sign In':'Create Account'}</span><FontAwesomeIcon icon={faArrowRight} /></>}
            </button>
          </form>
          <p className={styles.footer}>
            {mode==='login' ? "Don't have an account? " : 'Already have an account? '}
            <button className={styles.switchBtn} onClick={() => switchMode(mode==='login'?'signup':'login')}>
              {mode==='login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </main>

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </div>
  );
}