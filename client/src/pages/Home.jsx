import FloatingLines from '../components/FloatingLines'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

// ── Intersection Observer hook ─────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true) },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

// ── Animated counter ───────────────────────────────────────────────────────
function Counter({ end, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0)
  const [ref, inView] = useInView(0.3)
  useEffect(() => {
    if (!inView) return
    let raf, start = null
    const duration = 1800
    const animate = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(ease * end))
      if (progress < 1) raf = requestAnimationFrame(animate)
      else setCount(end)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [inView, end])
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}

// ── FadeIn wrapper ─────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, direction = 'up' }) {
  const [ref, inView] = useInView(0.08)
  const from = direction === 'up' ? 'translateY(28px)' : direction === 'left' ? 'translateX(-28px)' : 'translateX(28px)'
  return (
    <div ref={ref} style={{
      opacity:   inView ? 1 : 0,
      transform: inView ? 'translate(0)' : from,
      transition: `opacity 0.9s ${delay}s cubic-bezier(0.16,1,0.3,1), transform 0.9s ${delay}s cubic-bezier(0.16,1,0.3,1)`,
    }}>
      {children}
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    setTimeout(() => setMounted(true), 100)
    const fn = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Stagger delay helper
  const d = (i, base = 0) => base + i * 0.08

  const FEATURES = [
    { color: '#00E5FF', title: 'AI Priority Engine',   desc: 'Every complaint auto-scored, categorized, and routed by Claude AI. Severity 1–10. Zero manual triage.' },
    { color: '#0EA5E9', title: 'Real-time Socket.io',  desc: 'Live status updates, admin alerts, and staff notifications — no refresh, instant sync.' },
    { color: '#6366F1', title: 'Kanban Board',          desc: 'Drag-drop complaints across stages. SLA timers on every card. Visual clarity for admins.' },
    { color: '#00E5FF', title: 'SLA Management',        desc: 'Auto-deadlines per issue type. Critical issues escalate in 2 hours. Breach alerts surface instantly.' },
    { color: '#0EA5E9', title: 'Role-based Access',     desc: 'JWT auth with refresh tokens. Students, Admins, Staff each see exactly what they need.' },
    { color: '#6366F1', title: 'Analytics Dashboard',   desc: 'Resolution rates, category trends, severity charts, daily activity — one view.' },
  ]

  const STEPS = [
    { num: '01', title: 'Student raises issue',      desc: 'With title, description, media evidence, location. Anonymous submission supported.' },
    { num: '02', title: 'AI scores and routes',       desc: 'Claude assigns severity 1–10, detects urgency, recommends department — instantly.' },
    { num: '03', title: 'Admin assigns with SLA',     desc: 'Admin sees live alerts, assigns to staff. SLA countdown starts automatically.' },
    { num: '04', title: 'Staff resolves with proof',  desc: 'Staff uploads evidence and marks complete. All parties notified in real-time.' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html { scroll-behavior: smooth; }

        body {
          background: #060B14;
          font-family: 'DM Sans', sans-serif;
          color: #E2E8F0;
          overflow-x: hidden;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #060B14; }
        ::-webkit-scrollbar-thumb { background: #1E3A5F; border-radius: 2px; }

        a { text-decoration: none; }

        /* ── Navbar ── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          transition: background 0.4s ease, border-color 0.4s ease;
        }
        .nav.scrolled {
          background: rgba(6,11,20,0.85);
          backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(0,229,255,0.08);
        }
        .nav-inner {
          max-width: 1160px; margin: 0 auto;
          padding: 20px 40px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .nav-brand {
          display: flex; align-items: center; gap: 10px; cursor: pointer;
        }
        .nav-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: rgba(0,229,255,0.1);
          border: 1px solid rgba(0,229,255,0.2);
          display: flex; align-items: center; justify-content: center;
          animation: breathe 4s ease-in-out infinite;
        }
        @keyframes breathe {
          0%,100% { box-shadow: 0 0 0 0 rgba(0,229,255,0.15); }
          50%      { box-shadow: 0 0 20px 4px rgba(0,229,255,0.1); }
        }
        .nav-wordmark {
          font-size: 16px; font-weight: 700;
          color: #F8FAFC; letter-spacing: -0.4px;
        }
        .nav-links {
          display: flex; align-items: center; gap: 4px;
        }
        .nav-link {
          padding: 7px 14px; border-radius: 8px;
          font-size: 13.5px; color: #64748B;
          cursor: pointer; background: none; border: none;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.18s, background 0.18s;
        }
        .nav-link:hover { color: #E2E8F0; background: rgba(255,255,255,0.04); }
        .nav-cta {
          margin-left: 8px;
          padding: 8px 20px; border-radius: 100px;
          background: rgba(0,229,255,0.08);
          border: 1px solid rgba(0,229,255,0.25);
          color: #00E5FF; font-size: 13.5px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: all 0.22s;
          display: flex; align-items: center; gap: 6px;
        }
        .nav-cta:hover {
          background: rgba(0,229,255,0.15);
          border-color: rgba(0,229,255,0.5);
          color: #fff;
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(0,229,255,0.15);
        }

        /* ── Hero ── */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          text-align: center;
          overflow: hidden;
          background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,40,80,0.5) 0%, transparent 70%);
        }

        /* Deep vignette over lines */
        .hero::before {
          content: '';
          position: absolute; inset: 0; z-index: 2;
          background:
            radial-gradient(ellipse 60% 50% at 50% 50%, rgba(6,11,20,0.3) 0%, rgba(6,11,20,0.0) 50%),
            linear-gradient(to bottom, rgba(6,11,20,0.6) 0%, rgba(6,11,20,0) 30%, rgba(6,11,20,0) 70%, rgba(6,11,20,0.9) 100%);
        }

        .hero-content {
          position: relative; z-index: 10;
          max-width: 860px; padding: 0 32px;
        }

        .hero-pill {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 5px 16px 5px 6px;
          background: rgba(0,229,255,0.06);
          border: 1px solid rgba(0,229,255,0.18);
          border-radius: 100px;
          font-size: 12.5px; color: #94A3B8;
          margin-bottom: 32px;
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.9s 0.15s ease, transform 0.9s 0.15s cubic-bezier(0.16,1,0.3,1);
        }
        .hero-pill.v { opacity:1; transform:translateY(0); }
        .hero-pill-tag {
          padding: 2px 10px; border-radius: 100px;
          background: rgba(0,229,255,0.12);
          border: 1px solid rgba(0,229,255,0.2);
          font-size: 11px; font-weight: 600; color: #00E5FF;
        }
        .hero-pill-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #00E5FF; animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .hero-title {
          font-size: clamp(42px, 6.5vw, 76px);
          font-weight: 700; line-height: 1.06;
          letter-spacing: -3px; margin-bottom: 22px;
          color: #F8FAFC;
          opacity: 0; transform: translateY(28px);
          transition: opacity 1s 0.25s ease, transform 1s 0.25s cubic-bezier(0.16,1,0.3,1);
        }
        .hero-title.v { opacity:1; transform:translateY(0); }

        .hero-title .line2 {
          background: linear-gradient(90deg, #00E5FF 0%, #0EA5E9 40%, #6366F1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-sub {
          font-size: 17px; color: #64748B; line-height: 1.75;
          max-width: 540px; margin: 0 auto 40px;
          font-weight: 400;
          opacity: 0; transform: translateY(22px);
          transition: opacity 1s 0.35s ease, transform 1s 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .hero-sub.v { opacity:1; transform:translateY(0); }

        .hero-actions {
          display: flex; align-items: center; justify-content: center;
          gap: 12px; flex-wrap: wrap;
          opacity: 0; transform: translateY(18px);
          transition: opacity 1s 0.45s ease, transform 1s 0.45s cubic-bezier(0.16,1,0.3,1);
        }
        .hero-actions.v { opacity:1; transform:translateY(0); }

        .btn-hero-primary {
          padding: 14px 30px; border-radius: 100px;
          background: linear-gradient(135deg, rgba(0,229,255,0.18), rgba(14,165,233,0.12));
          border: 1px solid rgba(0,229,255,0.35);
          color: #00E5FF; font-size: 14.5px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          position: relative; overflow: hidden;
          transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
          display: flex; align-items: center; gap: 8px;
        }
        .btn-hero-primary::after {
          content: ''; position: absolute;
          inset: 0; border-radius: 100px;
          background: linear-gradient(135deg, rgba(0,229,255,0.15), transparent);
          opacity: 0; transition: opacity 0.25s;
        }
        .btn-hero-primary:hover {
          border-color: rgba(0,229,255,0.6);
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0,229,255,0.2), 0 0 0 1px rgba(0,229,255,0.1);
        }
        .btn-hero-primary:hover::after { opacity: 1; }

        .btn-hero-secondary {
          padding: 14px 26px; border-radius: 100px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: #94A3B8; font-size: 14.5px; font-weight: 500;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: all 0.22s;
        }
        .btn-hero-secondary:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.2);
          color: #F8FAFC; transform: translateY(-1px);
        }

        /* Hero scroll indicator */
        .scroll-hint {
          position: absolute; bottom: 36px; left: 50%;
          transform: translateX(-50%); z-index: 10;
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          opacity: 0; animation: fadeHint 1s 1.5s forwards;
        }
        @keyframes fadeHint { to { opacity: 0.4; } }
        .scroll-hint-line {
          width: 1px; height: 40px;
          background: linear-gradient(to bottom, rgba(0,229,255,0.6), transparent);
          animation: scrollPulse 2s ease-in-out infinite;
        }
        @keyframes scrollPulse {
          0%,100% { transform: scaleY(1); opacity: 0.6; }
          50%      { transform: scaleY(0.6); opacity: 0.2; }
        }

        /* ── Stats ── */
        .stats-wrap {
          border-top: 1px solid rgba(0,229,255,0.06);
          border-bottom: 1px solid rgba(0,229,255,0.06);
          background: rgba(6,11,20,0.8);
          backdrop-filter: blur(20px);
        }
        .stats-inner {
          max-width: 1160px; margin: 0 auto; padding: 0 40px;
          display: grid; grid-template-columns: repeat(4,1fr);
        }
        .stat-item {
          padding: 36px 20px; text-align: center;
          border-right: 1px solid rgba(0,229,255,0.06);
          transition: background 0.2s;
        }
        .stat-item:last-child { border-right: none; }
        .stat-item:hover { background: rgba(0,229,255,0.03); }
        .stat-num {
          font-size: 36px; font-weight: 700;
          letter-spacing: -1.5px; line-height: 1;
          margin-bottom: 6px;
        }
        .stat-lbl { font-size: 12px; color: #475569; font-weight: 400; letter-spacing: 0.3px; }

        /* ── Generic section ── */
        .section-wrap { max-width: 1160px; margin: 0 auto; padding: 100px 40px; }

        .eyebrow {
          font-size: 11px; font-weight: 600; letter-spacing: 2.5px;
          text-transform: uppercase; margin-bottom: 14px;
          background: linear-gradient(90deg, #00E5FF, #6366F1);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .section-h2 {
          font-size: clamp(28px, 3.8vw, 44px); font-weight: 700;
          letter-spacing: -1.5px; line-height: 1.12;
          color: #F8FAFC; margin-bottom: 16px;
        }
        .section-p {
          font-size: 16px; color: #64748B;
          line-height: 1.75; max-width: 500px;
        }

        /* ── Features ── */
        .features-grid {
          display: grid; grid-template-columns: repeat(3,1fr);
          gap: 1px;
          background: rgba(0,229,255,0.06);
          border: 1px solid rgba(0,229,255,0.06);
          border-radius: 18px; overflow: hidden;
          margin-top: 56px;
        }
        .feat-card {
          background: #080E1A;
          padding: 32px 28px;
          transition: background 0.25s;
          cursor: default;
        }
        .feat-card:hover { background: #0C1525; }
        .feat-icon {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 18px;
        }
        .feat-title { font-size: 15px; font-weight: 600; color: #F1F5F9; margin-bottom: 10px; }
        .feat-desc  { font-size: 13.5px; color: '#475569'; line-height: 1.7; color: #64748B; }

        /* ── How it works ── */
        .how-bg {
          background: linear-gradient(180deg, #060B14 0%, #080E1A 40%, #060B14 100%);
          border-top: 1px solid rgba(0,229,255,0.05);
          border-bottom: 1px solid rgba(0,229,255,0.05);
        }
        .how-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .steps { display: flex; flex-direction: column; gap: 24px; margin-top: 44px; }
        .step {
          display: flex; gap: 18px; padding: 18px 20px;
          border-radius: 12px; border: 1px solid transparent;
          transition: all 0.25s;
          cursor: default;
        }
        .step:hover {
          background: rgba(0,229,255,0.03);
          border-color: rgba(0,229,255,0.1);
        }
        .step-num {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          background: rgba(0,229,255,0.08); border: 1px solid rgba(0,229,255,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #00E5FF; letter-spacing: 0.5px;
        }
        .step-title { font-size: 14px; font-weight: 600; color: #F1F5F9; margin-bottom: 5px; }
        .step-desc  { font-size: 13px; color: #64748B; line-height: 1.65; }

        /* Dashboard mockup */
        .mockup {
          background: #080E1A;
          border: 1px solid rgba(0,229,255,0.1);
          border-radius: 16px; overflow: hidden;
          box-shadow: 0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,229,255,0.05);
        }
        .mockup-bar {
          background: #060B14; padding: 11px 16px;
          border-bottom: 1px solid rgba(0,229,255,0.08);
          display: flex; align-items: center; gap: 6px;
        }
        .mockup-dot { width: 9px; height: 9px; border-radius: 50%; }
        .mockup-url {
          flex: 1; text-align: center;
          font-size: 10.5px; color: #334155; font-family: monospace;
        }
        .mockup-body { padding: 18px; }
        .mkp-stats {
          display: grid; grid-template-columns: repeat(3,1fr);
          gap: 8px; margin-bottom: 14px;
        }
        .mkp-stat {
          background: #0C1525; border: 1px solid rgba(0,229,255,0.08);
          border-radius: 10px; padding: 12px 14px;
        }
        .mkp-num { font-size: 20px; font-weight: 700; line-height: 1; margin-bottom: 3px; }
        .mkp-lbl { font-size: 10px; color: #475569; }
        .mkp-row {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 9px; margin-bottom: 6px;
          background: #0C1525; border: 1px solid rgba(0,229,255,0.06);
          transition: border-color 0.2s;
        }
        .mkp-row:hover { border-color: rgba(0,229,255,0.15); }
        .mkp-bar  { width: 3px; height: 28px; border-radius: 2px; flex-shrink: 0; }
        .mkp-t    { font-size: 11px; font-weight: 500; color: #CBD5E1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .mkp-s    { font-size: 9.5px; color: #475569; margin-top: 2px; }
        .mkp-badge {
          margin-left: auto; flex-shrink: 0;
          font-size: 9px; font-weight: 600; padding: 2px 7px; border-radius: 20px; border: 1px solid;
        }
        .ai-strip {
          margin-top: 12px; padding: 9px 12px; border-radius: 9px;
          background: rgba(0,229,255,0.04); border: 1px solid rgba(0,229,255,0.1);
          display: flex; align-items: center; gap: 8px;
        }
        .ai-dot { width: 6px; height: 6px; border-radius: 50%; background: #00E5FF; animation: blink 2s ease-in-out infinite; }
        .ai-text { font-size: 10.5px; color: #64748B; }
        .ai-text span { color: #00E5FF; }

        /* ── Roles ── */
        .roles-grid {
          display: grid; grid-template-columns: repeat(3,1fr);
          gap: 14px; margin-top: 52px;
        }
        .role-card {
          background: #080E1A;
          border: 1px solid rgba(0,229,255,0.08);
          border-radius: 16px; padding: 28px 24px;
          transition: all 0.25s; cursor: default;
        }
        .role-card:hover {
          background: #0C1525;
          border-color: rgba(0,229,255,0.2);
          transform: translateY(-3px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .role-eyebrow { font-size: 10px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
        .role-title { font-size: 18px; font-weight: 700; color: #F1F5F9; margin-bottom: 14px; }
        .role-list { list-style: none; }
        .role-list li {
          font-size: 13px; color: #64748B; padding: 7px 0;
          border-bottom: 1px solid rgba(0,229,255,0.05);
          display: flex; align-items: center; gap: 10px;
        }
        .role-list li:last-child { border-bottom: none; }
        .role-check { flex-shrink: 0; }

        /* ── CTA ── */
        .cta-wrap {
          text-align: center; padding: 100px 40px;
          position: relative; overflow: hidden;
          border-top: 1px solid rgba(0,229,255,0.05);
        }
        .cta-glow {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 700px; height: 500px;
          background: radial-gradient(ellipse, rgba(0,100,180,0.12) 0%, transparent 65%);
          pointer-events: none;
        }
        .cta-inner { position: relative; z-index: 2; max-width: 620px; margin: 0 auto; }
        .cta-h2 {
          font-size: clamp(30px,4vw,50px); font-weight: 700;
          letter-spacing: -2px; line-height: 1.1;
          color: #F8FAFC; margin-bottom: 16px;
        }
        .cta-p { font-size: 16px; color: #64748B; line-height: 1.75; margin-bottom: 36px; }
        .cta-btns { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }

        /* ── Footer ── */
        .footer-wrap {
          border-top: 1px solid rgba(0,229,255,0.05);
          padding: 28px 40px;
          max-width: 1160px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
        }
        .footer-copy { font-size: 12.5px; color: #1E3A5F; }
        .footer-links { display: flex; gap: 20px; }
        .footer-link { font-size: 12.5px; color: #1E3A5F; cursor: pointer; background: none; border: none; font-family: 'DM Sans',sans-serif; transition: color 0.18s; }
        .footer-link:hover { color: #64748B; }
      `}</style>

      {/* ── NAVBAR ──────────────────────────────────────────────────── */}
      <nav className={`nav ${scrollY > 30 ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <div className="nav-brand" onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}>
            <div className="nav-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="nav-wordmark">Resolva</span>
          </div>
          <div className="nav-links">
            <a href="#features"     className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How it works</a>
            <a href="#roles"        className="nav-link">Roles</a>
            <button className="nav-cta" onClick={() => navigate('/login')}>
              Sign in
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="hero">
        {/* Floating lines — full bleed */}
        <div style={{
  position: 'absolute', inset: 0,
  width: '100%', height: '100%',
  zIndex: 1,
}}>
  <FloatingLines
    linesGradient={['#1309b2', '#00B4D8', '#8d74f5', '#00E5FF']}
    enabledWaves={['top', 'middle', 'bottom']}
    lineCount={[8, 12, 6]}
    lineDistance={[8, 6, 4]}
    animationSpeed={0.35}
    interactive={true}
    bendRadius={3.5}
    bendStrength={-0.9}
    mouseDamping={0.03}
    parallax={true}
    parallaxStrength={0.15}
    mixBlendMode="screen"
  />
</div>
        <div className="hero-content">
          <div className={`hero-pill ${mounted ? 'v' : ''}`}>
            <div className="hero-pill-dot"/>
            <span className="hero-pill-tag">AI-Powered</span>
            Campus Issue Management
          </div>

          <h1 className={`hero-title ${mounted ? 'v' : ''}`}>
            Campus issues,<br/>
            <span className="line2">resolved intelligently.</span>
          </h1>

          <p className={`hero-sub ${mounted ? 'v' : ''}`}>
            Resolva connects students, admins, and staff in one real-time platform —
            powered by AI that thinks before you do.
          </p>

          <div className={`hero-actions ${mounted ? 'v' : ''}`}>
            <button className="btn-hero-primary" onClick={() => navigate('/register')}>
              Get started free
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
            <button className="btn-hero-secondary" onClick={() => navigate('/login')}>
              Go to dashboard
            </button>
          </div>
        </div>

        <div className="scroll-hint">
          <div className="scroll-hint-line"/>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────── */}
      <div className="stats-wrap">
        <div className="stats-inner">
          {[
            { end: 3,   suffix: '',    color: '#00E5FF', label: 'User roles'          },
            { end: 9,   suffix: '+',   color: '#0EA5E9', label: 'Issue categories'    },
            { end: 100, suffix: '%',   color: '#6366F1', label: 'Real-time sync'      },
            { end: 2,   suffix: 'hr',  color: '#00E5FF', label: 'Critical SLA window', prefix: '<' },
          ].map((s, i) => (
            <div className="stat-item" key={i}>
              <div className="stat-num" style={{ color: s.color }}>
                <Counter end={s.end} suffix={s.suffix} prefix={s.prefix || ''}/>
              </div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section id="features">
        <div className="section-wrap">
          <FadeIn>
            <div className="eyebrow">Platform capabilities</div>
            <div className="section-h2">Everything a campus<br/>operation needs.</div>
            <div className="section-p">Built with MERN + Socket.io + AI. Designed for real-world campus complexity without the bloat.</div>
          </FadeIn>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <FeatCard key={i} {...f} delay={d(i, 0.05)}/>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section id="how-it-works" className="how-bg">
        <div className="section-wrap">
          <div className="how-grid">
            <div>
              <FadeIn direction="left">
                <div className="eyebrow">The flow</div>
                <div className="section-h2">Complaint to resolution<br/>in four steps.</div>
                <div className="section-p">Every stakeholder involved. Full transparency at each stage.</div>
              </FadeIn>
              <div className="steps">
                {STEPS.map((s, i) => (
                  <FadeIn key={i} delay={d(i, 0.1)} direction="left">
                    <div className="step">
                      <div className="step-num">{s.num}</div>
                      <div>
                        <div className="step-title">{s.title}</div>
                        <div className="step-desc">{s.desc}</div>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>

            <FadeIn delay={0.15} direction="right">
              <div className="mockup">
                <div className="mockup-bar">
                  <div className="mockup-dot" style={{ background: '#EF4444' }}/>
                  <div className="mockup-dot" style={{ background: '#F59E0B' }}/>
                  <div className="mockup-dot" style={{ background: '#10B981' }}/>
                  <div className="mockup-url">resolva.app / admin / dashboard</div>
                </div>
                <div className="mockup-body">
                  <div className="mkp-stats">
                    {[
                      { num: '24', lbl: 'Open',     color: '#F59E0B' },
                      { num: '8',  lbl: 'Critical', color: '#EF4444' },
                      { num: '91%',lbl: 'Resolved', color: '#00E5FF' },
                    ].map((s, i) => (
                      <div className="mkp-stat" key={i}>
                        <div className="mkp-num" style={{ color: s.color }}>{s.num}</div>
                        <div className="mkp-lbl">{s.lbl}</div>
                      </div>
                    ))}
                  </div>
                  {[
                    { title: 'Water leak near electrical panel', status: 'Open',        priority: 'Critical', color: '#EF4444' },
                    { title: 'WiFi outage in C-Block hostel',    status: 'Assigned',    priority: 'High',     color: '#F59E0B' },
                    { title: 'Broken projector in Room 201',     status: 'In Progress', priority: 'Medium',   color: '#0EA5E9' },
                  ].map((c, i) => (
                    <div className="mkp-row" key={i}>
                      <div className="mkp-bar" style={{ background: c.color }}/>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div className="mkp-t">{c.title}</div>
                        <div className="mkp-s">{c.status}</div>
                      </div>
                      <div className="mkp-badge" style={{ color:c.color, background:`${c.color}12`, borderColor:`${c.color}30` }}>
                        {c.priority}
                      </div>
                    </div>
                  ))}
                  <div className="ai-strip">
                    <div className="ai-dot"/>
                    <div className="ai-text">
                      AI analyzed — <span>severity 9/10, critical routing active</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── ROLES ────────────────────────────────────────────────────── */}
      <section id="roles">
        <div className="section-wrap">
          <FadeIn>
            <div className="eyebrow">Who it's for</div>
            <div className="section-h2">Three roles.<br/>One platform.</div>
          </FadeIn>
          <div className="roles-grid">
            {[
              {
                eyebrow: 'Role 01', title: 'Students', color: '#00E5FF',
                items: ['Submit complaints with evidence', 'Track status in real-time', 'Vote on existing issues', 'Anonymous submission option', 'Full transparency timeline'],
              },
              {
                eyebrow: 'Role 02', title: 'Administrators', color: '#0EA5E9',
                items: ['Live complaint feed with AI scores', 'Assign to departments & staff', 'Kanban board with SLA timers', 'Analytics & resolution metrics', 'Override priority anytime'],
              },
              {
                eyebrow: 'Role 03', title: 'Staff', color: '#6366F1',
                items: ['See only assigned tasks', 'SLA countdown per task', 'Upload proof of resolution', 'Mark tasks in progress', 'Full complaint history'],
              },
            ].map((r, i) => (
              <FadeIn key={i} delay={d(i, 0.05)}>
                <div className="role-card" style={{ borderTopColor: `${r.color}30`, borderTopWidth: 2 }}>
                  <div className="role-eyebrow" style={{ color: r.color }}>{r.eyebrow}</div>
                  <div className="role-title">{r.title}</div>
                  <ul className="role-list">
                    {r.items.map((item, j) => (
                      <li key={j}>
                        <svg className="role-check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={r.color} strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="cta-wrap">
        <div className="cta-glow"/>
        <FadeIn>
          <div className="cta-inner">
            <div className="eyebrow">Get started</div>
            <div className="cta-h2">
              Your campus deserves<br/>
              <span style={{
                background: 'linear-gradient(90deg, #00E5FF, #6366F1)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                better infrastructure.
              </span>
            </div>
            <div className="cta-p">
              Join as a student to raise your voice, or sign in as admin to take control of every issue on campus.
            </div>
            <div className="cta-btns">
              <button className="btn-hero-primary" onClick={() => navigate('/register')}>
                Create free account
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
              <button className="btn-hero-secondary" onClick={() => navigate('/login')}>
                Sign in
              </button>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid rgba(0,229,255,0.05)' }}>
        <div className="footer-wrap">
          <div className="footer-copy">© 2025 Resolva — Campus Issue Management</div>
          <div className="footer-links">
            <a href="#features"     className="footer-link">Features</a>
            <a href="#how-it-works" className="footer-link">How it works</a>
            <button onClick={() => navigate('/login')} className="footer-link">Sign in</button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Feature card component ─────────────────────────────────────────────────
const FEAT_ICONS = [
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="15" rx="1"/></svg>,
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
]

function FeatCard({ color, title, desc, delay, index: _i }) {
  const [ref, inView] = useInView(0.05)
  const i = FEAT_ICONS.findIndex((_, idx) => idx === (_i || 0)) >= 0 ? (_i || 0) : 0
  return (
    <div ref={ref} className="feat-card" style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.8s ${delay}s cubic-bezier(0.16,1,0.3,1), transform 0.8s ${delay}s cubic-bezier(0.16,1,0.3,1)`,
    }}>
      <div className="feat-icon" style={{ background: `${color}10`, border: `1px solid ${color}20`, color }}>
        {FEAT_ICONS[_i % FEAT_ICONS.length]}
      </div>
      <div className="feat-title">{title}</div>
      <div className="feat-desc">{desc}</div>
    </div>
  )
}