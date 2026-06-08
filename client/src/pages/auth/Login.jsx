import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm]               = useState({ email: '', password: '' })
  const [loading, setLoading]         = useState(false)
  const [mounted, setMounted]         = useState(false)
  const [showPass, setShowPass]       = useState(false)
  const cardRef   = useRef(null)
  const canvasRef = useRef(null)
  const animRef   = useRef(null)

  useEffect(() => { setTimeout(() => setMounted(true), 60) }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W = canvas.width  = window.innerWidth
    let H = canvas.height = window.innerHeight
    let t = 0

    const onResize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    const draw = () => {
  t += 0.003
  ctx.clearRect(0, 0, W, H)

  // Deep warm black base
  ctx.fillStyle = '#080600'
  ctx.fillRect(0, 0, W, H)

  // ── Main spotlight — soft cone from top-left ──────────────────────────
  // Multiple layered cones — blended soft edges, not hard triangle
  const spotCenterX = W * 0.14
  const spotCenterY = H * 0.0

  // Cone layer 1 — widest, most transparent
  const cone1 = ctx.createRadialGradient(
    spotCenterX, spotCenterY, 0,
    spotCenterX + W * 0.18, H * 0.85, H * 0.95
  )
  cone1.addColorStop(0,    'rgba(255, 220, 120, 0.0)')
  cone1.addColorStop(0.08, 'rgba(220, 170,  60, 0.09)')
  cone1.addColorStop(0.25, 'rgba(180, 130,  30, 0.06)')
  cone1.addColorStop(0.55, 'rgba(140, 100,  15, 0.03)')
  cone1.addColorStop(1,    'rgba(0,   0,     0, 0)')
  ctx.fillStyle = cone1
  ctx.fillRect(0, 0, W, H)

  // Cone layer 2 — medium, slightly brighter core
  const cone2 = ctx.createRadialGradient(
    spotCenterX, spotCenterY, 0,
    spotCenterX + W * 0.1, H * 0.75, H * 0.72
  )
  cone2.addColorStop(0,    'rgba(255, 230, 140, 0.0)')
  cone2.addColorStop(0.06, 'rgba(240, 190,  80, 0.12)')
  cone2.addColorStop(0.2,  'rgba(200, 150,  40, 0.07)')
  cone2.addColorStop(0.45, 'rgba(160, 110,  20, 0.03)')
  cone2.addColorStop(1,    'rgba(0,   0,     0, 0)')
  ctx.fillStyle = cone2
  ctx.fillRect(0, 0, W, H)

  // Cone layer 3 — tight bright core beam
  const cone3 = ctx.createRadialGradient(
    spotCenterX, spotCenterY, 0,
    spotCenterX + W * 0.055, H * 0.62, H * 0.52
  )
  cone3.addColorStop(0,    'rgba(255, 245, 180, 0.0)')
  cone3.addColorStop(0.04, 'rgba(255, 220, 100, 0.16)')
  cone3.addColorStop(0.14, 'rgba(220, 170,  55, 0.10)')
  cone3.addColorStop(0.3,  'rgba(180, 130,  30, 0.05)')
  cone3.addColorStop(0.6,  'rgba(120,  90,  10, 0.02)')
  cone3.addColorStop(1,    'rgba(0,    0,    0, 0)')
  ctx.fillStyle = cone3
  ctx.fillRect(0, 0, W, H)

  // ── Subtle warm ambient — left side wall bounce ────────────────────────
  const wallBounce = ctx.createRadialGradient(0, H * 0.4, 0, 0, H * 0.4, W * 0.45)
  wallBounce.addColorStop(0,   'rgba(160, 110, 20, 0.06)')
  wallBounce.addColorStop(0.5, 'rgba(120,  80, 10, 0.02)')
  wallBounce.addColorStop(1,   'rgba(0,     0,  0, 0)')
  ctx.fillStyle = wallBounce
  ctx.fillRect(0, 0, W, H)

  // ── Atmospheric haze in beam path ─────────────────────────────────────
  // Soft haze layer that follows beam direction
  ctx.save()
  ctx.globalAlpha = 0.4 + 0.08 * Math.sin(t * 0.5)
  const haze = ctx.createLinearGradient(
    spotCenterX, 0,
    W * 0.42, H * 0.7
  )
  haze.addColorStop(0,    'rgba(200, 150, 40, 0.00)')
  haze.addColorStop(0.15, 'rgba(180, 130, 30, 0.04)')
  haze.addColorStop(0.4,  'rgba(160, 110, 20, 0.025)')
  haze.addColorStop(0.7,  'rgba(130,  90, 10, 0.01)')
  haze.addColorStop(1,    'rgba(0,     0,  0, 0.00)')
  ctx.fillStyle = haze
  ctx.fillRect(0, 0, W, H)
  ctx.restore()

  // ── Floating dust motes in beam ────────────────────────────────────────
  for (let i = 0; i < 45; i++) {
    const seed   = i * 137.508
    // Confine particles within beam cone — left 0→50% width, full height
    const px     = (Math.sin(seed * 0.7) * 0.4 + 0.3) * W * 0.48
    const baseY  = (Math.cos(seed * 0.3) * 0.5 + 0.5) * H
    const rise   = ((t * 14 + seed * 2.2) % H)
    const drift  = Math.sin(t * 0.35 + seed * 0.04) * 16
    const finalY = (baseY - rise + H) % H
    // Fade out particles outside beam area
    const beamAlpha = Math.max(0, 1 - px / (W * 0.45))
    const alpha  = (0.05 + 0.06 * Math.abs(Math.sin(t * 0.6 + i))) * beamAlpha
    const sz     = 0.6 + Math.abs(Math.sin(seed)) * 0.9

    ctx.beginPath()
    ctx.arc(px + drift, finalY, sz, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 210, 100, ${alpha})`
    ctx.fill()
  }

  // ── Stage / pedestal ──────────────────────────────────────────────────
  const stageX  = W * 0.5
  const stageY  = H * 0.93
  const stageRX = W * 0.18
  const stageRY = H * 0.042

  // Stage outer ambient glow — lit by spotlight
  const stageAmbient = ctx.createRadialGradient(
    stageX, stageY, 0,
    stageX, stageY, stageRX * 2.2
  )
  stageAmbient.addColorStop(0,   'rgba(200, 150, 20, 0.14)')
  stageAmbient.addColorStop(0.35,'rgba(160, 110, 10, 0.06)')
  stageAmbient.addColorStop(0.7, 'rgba(100,  70,  5, 0.02)')
  stageAmbient.addColorStop(1,   'rgba(0,     0,  0, 0)')
  ctx.fillStyle = stageAmbient
  ctx.beginPath()
  ctx.ellipse(stageX, stageY, stageRX * 2.4, stageRY * 3.5, 0, 0, Math.PI * 2)
  ctx.fill()

  // Stage body — dark metallic surface
  const stageFill = ctx.createLinearGradient(
    stageX - stageRX, stageY - stageRY,
    stageX + stageRX, stageY + stageRY
  )
  stageFill.addColorStop(0,    'rgba(22, 16, 4, 0.96)')
  stageFill.addColorStop(0.28, 'rgba(48, 34, 8, 0.98)')
  stageFill.addColorStop(0.5,  'rgba(72, 52,12, 1.0)')
  stageFill.addColorStop(0.72, 'rgba(48, 34, 8, 0.98)')
  stageFill.addColorStop(1,    'rgba(22, 16, 4, 0.96)')
  ctx.fillStyle = stageFill
  ctx.beginPath()
  ctx.ellipse(stageX, stageY, stageRX, stageRY, 0, 0, Math.PI * 2)
  ctx.fill()

  // Stage rim highlight — gold
  const rimGrad = ctx.createLinearGradient(stageX - stageRX, stageY, stageX + stageRX, stageY)
  rimGrad.addColorStop(0,    'rgba(160, 110, 15, 0)')
  rimGrad.addColorStop(0.2,  'rgba(200, 155, 30, 0.4)')
  rimGrad.addColorStop(0.42, 'rgba(240, 185, 45, 0.75)')
  rimGrad.addColorStop(0.5,  'rgba(255, 210, 60, 0.95)')
  rimGrad.addColorStop(0.58, 'rgba(240, 185, 45, 0.75)')
  rimGrad.addColorStop(0.8,  'rgba(200, 155, 30, 0.4)')
  rimGrad.addColorStop(1,    'rgba(160, 110, 15, 0)')
  ctx.strokeStyle = rimGrad
  ctx.lineWidth   = 1.2
  ctx.beginPath()
  ctx.ellipse(stageX, stageY, stageRX, stageRY, 0, 0, Math.PI * 2)
  ctx.stroke()

  // ── Final vignette — deep edges ────────────────────────────────────────
  const vig = ctx.createRadialGradient(
    W * 0.42, H * 0.45, 0,
    W * 0.42, H * 0.45,
    Math.max(W, H) * 0.8
  )
  vig.addColorStop(0,    'rgba(8, 6, 0, 0)')
  vig.addColorStop(0.38, 'rgba(8, 6, 0, 0.18)')
  vig.addColorStop(0.65, 'rgba(5, 4, 0, 0.55)')
  vig.addColorStop(1,    'rgba(3, 2, 0, 0.94)')
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, W, H)

  animRef.current = requestAnimationFrame(draw)
}

    animRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const handleMouseMove = (e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const rotX  = ((e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)) * -4
    const rotY  = ((e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)) *  5
    card.style.transform = `perspective(1400px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px)`
  }
  const handleMouseLeave = () => {
    if (cardRef.current)
      cardRef.current.style.transform = 'perspective(1400px) rotateX(0deg) rotateY(0deg) translateZ(0px)'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', form, {
        withCredentials: true
      })
      setAuth(data.data.user, data.data.accessToken)
      toast.success(`Welcome, ${data.data.user.name}`)
      const role = data.data.user.role
      if (role === 'student') navigate('/student/dashboard')
      else if (role === 'admin') navigate('/admin/dashboard')
      else if (role === 'staff') navigate('/staff/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        * { box-sizing:border-box; margin:0; padding:0; }

        .lr {
          min-height: 100vh;
          background: #0a0800;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Geist', sans-serif;
          overflow: hidden;
          position: relative;
        }

        canvas {
          position: absolute;
          inset: 0;
          width: 100%; height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .cw {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 390px;
          padding: 0 20px;
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1);
        }
        .cw.v { opacity:1; transform:translateY(0); }

        /* Brand */
        .brand {
          text-align: center;
          margin-bottom: 22px;
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 1s 0.1s cubic-bezier(0.16,1,0.3,1), transform 1s 0.1s cubic-bezier(0.16,1,0.3,1);
        }
        .brand.v { opacity:1; transform:translateY(0); }

        .logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px; height: 42px;
          border-radius: 11px;
          background: linear-gradient(135deg, rgba(200,150,20,0.2), rgba(160,110,10,0.1));
          border: 1px solid rgba(200,160,40,0.25);
          margin-bottom: 13px;
          animation: breathe 4s ease-in-out infinite;
        }
        @keyframes breathe {
          0%,100% { box-shadow: 0 0 20px rgba(200,150,20,0.1); }
          50%      { box-shadow: 0 0 40px rgba(220,170,30,0.22); }
        }

        .brand-name {
          font-size: 19px;
          font-weight: 600;
          color: #e8d9a0;
          letter-spacing: -0.3px;
        }
        .brand-sub {
          font-size: 11.5px;
          color: rgba(200,160,40,0.35);
          margin-top: 4px;
          letter-spacing: 0.4px;
        }

        /* Card */
        .card {
          background: rgba(12,12,12,.78);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 18px;
          padding: 30px;
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          box-shadow:
            0 0 0 1px rgba(200,160,40,0.06) inset,
            0 40px 100px rgba(0,0,0,0.75),
            0 0 60px rgba(180,130,10,0.06);
          transform-style: preserve-3d;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          position: relative;
          overflow: hidden;
        }

        /* Gold top rim */
        .card::before {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg,
            transparent,
            rgba(220,170,40,0.5) 30%,
            rgba(255,210,60,0.7) 50%,
            rgba(220,170,40,0.5) 70%,
            transparent
          );
        }

        /* Inner gold glow top */
        .card::after {
          content: '';
          position: absolute;
          top: -60px; left: 50%;
          transform: translateX(-50%);
          width: 200px; height: 100px;
          background: radial-gradient(ellipse, rgba(200,150,20,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .card-title {
          font-size: 15px;
          font-weight: 600;
          color: #d4c080;
          margin-bottom: 20px;
          letter-spacing: 0.1px;
        }

        /* Fields */
        .fg { margin-bottom: 13px; }
        .fl {
          display: block;
          font-size: 9.5px;
          font-weight: 500;
          color: rgba(200,160,40,0.45);
          margin-bottom: 6px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .fw { position:relative; }
        .fi {
          width: 100%;
          padding: 10px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(200,160,40,0.12);
          border-radius: 8px;
          color: #d4c080;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: all 0.25s ease;
          caret-color: #c8a830;
        }
        .fi::placeholder { color: rgba(200,160,40,0.2); }
        .fi:focus {
          border-color: rgba(200,160,40,0.3);
          background: rgba(200,150,20,0.06);
          box-shadow: 0 0 0 3px rgba(200,150,20,0.07), 0 0 20px rgba(200,150,20,0.06);
        }

        .eye-btn {
          position: absolute;
          right: 11px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer;
          color: rgba(200,160,40,0.35);
          display: flex; align-items: center;
          padding: 0; transition: color 0.2s;
        }
        .eye-btn:hover { color: rgba(200,160,40,0.7); }

        .forgot { text-align:right; margin-top:5px; }
        .forgot a {
          font-size: 10.5px;
          color: rgba(200,160,40,0.3);
          text-decoration: none;
          transition: color 0.2s;
        }
        .forgot a:hover { color: rgba(200,160,40,0.65); }

        /* Gold button */
        .btn {
          width: 100%;
          padding: 11px 18px;
          margin-top: 16px;
          background: linear-gradient(135deg,
            rgba(180,130,15,0.4),
            rgba(220,170,30,0.25),
            rgba(160,110,10,0.35)
          );
          border: 1px solid rgba(220,170,40,0.35);
          border-radius: 9px;
          color: #e8c84a;
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .btn::before {
          content:'';
          position:absolute;
          top:0; left:-80%; width:60%; height:100%;
          background: linear-gradient(90deg, transparent, rgba(255,210,60,0.12), transparent);
          animation: sheen 3s ease-in-out infinite;
        }
        @keyframes sheen { 0%{left:-60%} 50%,100%{left:110%} }

        .btn:hover:not(:disabled) {
          border-color: rgba(220,170,40,0.55);
          background: linear-gradient(135deg,
            rgba(200,150,20,0.5),
            rgba(240,190,40,0.32),
            rgba(180,130,15,0.45)
          );
          color: #f5d860;
          box-shadow: 0 8px 40px rgba(180,130,10,0.25), 0 0 20px rgba(200,150,20,0.12);
          transform: translateY(-1px);
        }
        .btn:disabled { opacity:0.4; cursor:not-allowed; }

        .btn-label { position:relative; z-index:1; }
        .btn-arrow {
          position: relative; z-index:1;
          width: 26px; height: 26px;
          border-radius: 50%;
          background: rgba(200,150,20,0.2);
          border: 1px solid rgba(220,170,40,0.3);
          display: flex; align-items:center; justify-content:center;
          transition: all 0.25s;
        }
        .btn:hover .btn-arrow {
          background: rgba(200,150,20,0.35);
          transform: translateX(2px);
        }

        .spin {
          width:13px; height:13px;
          border:1.5px solid rgba(200,160,40,0.3);
          border-top-color: #e8c84a;
          border-radius:50%;
          animation: sp 0.7s linear infinite;
        }
        @keyframes sp { to{transform:rotate(360deg)} }

        .divider { display:flex; align-items:center; gap:12px; margin:18px 0; }
        .dl { flex:1; height:1px; background:rgba(200,160,40,0.08); }
        .dt { font-size:10px; color:rgba(200,160,40,0.22); letter-spacing:0.5px; }

        .rl { text-align:center; font-size:12px; color:rgba(200,160,40,0.3); }
        .rl a { color:rgba(220,180,50,0.6); text-decoration:none; font-weight:500; transition:color 0.2s; }
        .rl a:hover { color:rgba(240,200,60,0.9); }

        /* Demo */
        .demo {
          margin-top: 11px;
          background: rgba(10,8,0,0.75);
          border: 1px solid rgba(200,160,40,0.08);
          border-radius: 11px;
          padding: 13px 16px;
          backdrop-filter: blur(20px);
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 1s 0.35s cubic-bezier(0.16,1,0.3,1), transform 1s 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .demo.v { opacity:1; transform:translateY(0); }
        .demo-t {
          font-size:9px; font-weight:500;
          color:rgba(200,160,40,0.25);
          letter-spacing:0.9px;
          text-transform:uppercase;
          margin-bottom:9px;
        }
        .demo-r {
          display:flex; align-items:center;
          justify-content:space-between;
          padding:5px 0;
        }
        .demo-r + .demo-r { border-top:1px solid rgba(200,160,40,0.05); }
        .demo-role { font-size:11px; color:rgba(200,160,40,0.35); font-weight:500; min-width:48px; }
        .demo-cred { font-size:11px; color:rgba(200,160,40,0.2); }
        .demo-btn {
          font-size:10px;
          color:rgba(200,160,40,0.45);
          cursor:pointer; padding:2px 9px;
          border-radius:5px;
          border:1px solid rgba(200,160,40,0.15);
          background:rgba(200,150,20,0.05);
          transition:all 0.2s;
        }
        .demo-btn:hover {
          background:rgba(200,150,20,0.12);
          color:rgba(220,180,50,0.8);
          border-color:rgba(200,160,40,0.28);
        }
      `}</style>

      <div className="lr">
        <canvas ref={canvasRef} />

        <div className={`cw ${mounted ? 'v' : ''}`}>

          <div className={`brand ${mounted ? 'v' : ''}`}>
            <div className="logo">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
                stroke="rgba(220,170,40,0.8)" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div className="brand-name">Resolva</div>
            <div className="brand-sub">Campus Issue Management</div>
          </div>

          <div
            className="card"
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="card-title">Sign in</div>

            <form onSubmit={handleSubmit}>
              <div className="fg">
                <label className="fl">Email</label>
                <div className="fw">
                  <input type="email" className="fi"
                    placeholder="you@college.edu"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="fg">
                <label className="fl">Password</label>
                <div className="fw">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="fi"
                    placeholder="••••••••"
                    style={{ paddingRight: '38px' }}
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    required
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                    {showPass
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
                <div className="forgot"><a href="#">Forgot password?</a></div>
              </div>

              <button type="submit" className="btn" disabled={loading}>
                <span className="btn-label">
                  {loading ? <div className="spin" /> : 'Continue'}
                </span>
                <div className="btn-arrow">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              </button>
            </form>

            <div className="divider">
              <div className="dl"/><span className="dt">OR</span><div className="dl"/>
            </div>
            <div className="rl">No account? <Link to="/register">Create one</Link></div>
          </div>

          <div className={`demo ${mounted ? 'v' : ''}`}>
            <div className="demo-t">Quick access</div>
            {[
              { role: 'Student', email: 'arjun@college.edu',  password: 'Test@1234'  },
              { role: 'Admin',   email: 'admin@college.edu',  password: 'Admin@1234' },
              { role: 'Staff',   email: 'staff@college.edu',  password: 'Staff@1234' },
            ].map(({ role, email, password }) => (
              <div className="demo-r" key={role}>
                <span className="demo-role">{role}</span>
                <span className="demo-cred">{email}</span>
                <span className="demo-btn" onClick={() => setForm({ email, password })}>Fill</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}