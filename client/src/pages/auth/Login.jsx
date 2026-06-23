import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import axios from 'axios'
import toast from 'react-hot-toast'
import logo from '../../assets/logo.png'

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

      // Deep navy base — matches home page #060B14
      ctx.fillStyle = '#060B14'
      ctx.fillRect(0, 0, W, H)

      // Main spotlight — cyan/blue cone from top-left
      const spotCenterX = W * 0.14
      const spotCenterY = H * 0.0

      // Cone layer 1 — widest, most transparent
      const cone1 = ctx.createRadialGradient(
        spotCenterX, spotCenterY, 0,
        spotCenterX + W * 0.18, H * 0.85, H * 0.95
      )
      cone1.addColorStop(0,    'rgba(0, 180, 216, 0.0)')
      cone1.addColorStop(0.08, 'rgba(0, 150, 200, 0.08)')
      cone1.addColorStop(0.25, 'rgba(0, 120, 180, 0.05)')
      cone1.addColorStop(0.55, 'rgba(0, 80, 140, 0.025)')
      cone1.addColorStop(1,    'rgba(0, 0, 0, 0)')
      ctx.fillStyle = cone1
      ctx.fillRect(0, 0, W, H)

      // Cone layer 2 — medium, slightly brighter core
      const cone2 = ctx.createRadialGradient(
        spotCenterX, spotCenterY, 0,
        spotCenterX + W * 0.1, H * 0.75, H * 0.72
      )
      cone2.addColorStop(0,    'rgba(0, 229, 255, 0.0)')
      cone2.addColorStop(0.06, 'rgba(0, 200, 240, 0.10)')
      cone2.addColorStop(0.2,  'rgba(0, 165, 210, 0.06)')
      cone2.addColorStop(0.45, 'rgba(0, 120, 180, 0.025)')
      cone2.addColorStop(1,    'rgba(0, 0, 0, 0)')
      ctx.fillStyle = cone2
      ctx.fillRect(0, 0, W, H)

      // Cone layer 3 — tight bright core beam
      const cone3 = ctx.createRadialGradient(
        spotCenterX, spotCenterY, 0,
        spotCenterX + W * 0.055, H * 0.62, H * 0.52
      )
      cone3.addColorStop(0,    'rgba(0, 229, 255, 0.0)')
      cone3.addColorStop(0.04, 'rgba(0, 220, 255, 0.14)')
      cone3.addColorStop(0.14, 'rgba(14, 165, 233, 0.09)')
      cone3.addColorStop(0.3,  'rgba(0, 100, 180, 0.04)')
      cone3.addColorStop(0.6,  'rgba(0, 60, 120, 0.015)')
      cone3.addColorStop(1,    'rgba(0, 0, 0, 0)')
      ctx.fillStyle = cone3
      ctx.fillRect(0, 0, W, H)

      // Subtle indigo ambient — right side
      const ambientRight = ctx.createRadialGradient(W, H * 0.5, 0, W, H * 0.5, W * 0.55)
      ambientRight.addColorStop(0,   'rgba(99, 102, 241, 0.05)')
      ambientRight.addColorStop(0.5, 'rgba(80, 84, 200, 0.02)')
      ambientRight.addColorStop(1,   'rgba(0, 0, 0, 0)')
      ctx.fillStyle = ambientRight
      ctx.fillRect(0, 0, W, H)

      // Atmospheric haze in beam path
      ctx.save()
      ctx.globalAlpha = 0.4 + 0.06 * Math.sin(t * 0.5)
      const haze = ctx.createLinearGradient(spotCenterX, 0, W * 0.42, H * 0.7)
      haze.addColorStop(0,    'rgba(0, 180, 220, 0.00)')
      haze.addColorStop(0.15, 'rgba(0, 160, 210, 0.035)')
      haze.addColorStop(0.4,  'rgba(0, 130, 190, 0.02)')
      haze.addColorStop(0.7,  'rgba(0, 90, 150, 0.008)')
      haze.addColorStop(1,    'rgba(0, 0, 0, 0.00)')
      ctx.fillStyle = haze
      ctx.fillRect(0, 0, W, H)
      ctx.restore()

      // Floating dust motes — cyan tinted
      for (let i = 0; i < 45; i++) {
        const seed   = i * 137.508
        const px     = (Math.sin(seed * 0.7) * 0.4 + 0.3) * W * 0.48
        const baseY  = (Math.cos(seed * 0.3) * 0.5 + 0.5) * H
        const rise   = ((t * 14 + seed * 2.2) % H)
        const drift  = Math.sin(t * 0.35 + seed * 0.04) * 16
        const finalY = (baseY - rise + H) % H
        const beamAlpha = Math.max(0, 1 - px / (W * 0.45))
        const alpha  = (0.04 + 0.05 * Math.abs(Math.sin(t * 0.6 + i))) * beamAlpha
        const sz     = 0.6 + Math.abs(Math.sin(seed)) * 0.9

        ctx.beginPath()
        ctx.arc(px + drift, finalY, sz, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 229, 255, ${alpha})`
        ctx.fill()
      }

      // Stage / pedestal — cyan tinted
      const stageX  = W * 0.5
      const stageY  = H * 0.93
      const stageRX = W * 0.18
      const stageRY = H * 0.042

      const stageAmbient = ctx.createRadialGradient(stageX, stageY, 0, stageX, stageY, stageRX * 2.2)
      stageAmbient.addColorStop(0,    'rgba(0, 180, 220, 0.12)')
      stageAmbient.addColorStop(0.35, 'rgba(0, 140, 200, 0.05)')
      stageAmbient.addColorStop(0.7,  'rgba(0, 80, 160, 0.02)')
      stageAmbient.addColorStop(1,    'rgba(0, 0, 0, 0)')
      ctx.fillStyle = stageAmbient
      ctx.beginPath()
      ctx.ellipse(stageX, stageY, stageRX * 2.4, stageRY * 3.5, 0, 0, Math.PI * 2)
      ctx.fill()

      const stageFill = ctx.createLinearGradient(
        stageX - stageRX, stageY - stageRY,
        stageX + stageRX, stageY + stageRY
      )
      stageFill.addColorStop(0,    'rgba(4, 12, 28, 0.96)')
      stageFill.addColorStop(0.28, 'rgba(6, 18, 40, 0.98)')
      stageFill.addColorStop(0.5,  'rgba(8, 25, 55, 1.0)')
      stageFill.addColorStop(0.72, 'rgba(6, 18, 40, 0.98)')
      stageFill.addColorStop(1,    'rgba(4, 12, 28, 0.96)')
      ctx.fillStyle = stageFill
      ctx.beginPath()
      ctx.ellipse(stageX, stageY, stageRX, stageRY, 0, 0, Math.PI * 2)
      ctx.fill()

      // Stage rim highlight — cyan
      const rimGrad = ctx.createLinearGradient(stageX - stageRX, stageY, stageX + stageRX, stageY)
      rimGrad.addColorStop(0,    'rgba(0, 140, 200, 0)')
      rimGrad.addColorStop(0.2,  'rgba(0, 180, 230, 0.35)')
      rimGrad.addColorStop(0.42, 'rgba(0, 210, 250, 0.65)')
      rimGrad.addColorStop(0.5,  'rgba(0, 229, 255, 0.9)')
      rimGrad.addColorStop(0.58, 'rgba(0, 210, 250, 0.65)')
      rimGrad.addColorStop(0.8,  'rgba(0, 180, 230, 0.35)')
      rimGrad.addColorStop(1,    'rgba(0, 140, 200, 0)')
      ctx.strokeStyle = rimGrad
      ctx.lineWidth   = 1.2
      ctx.beginPath()
      ctx.ellipse(stageX, stageY, stageRX, stageRY, 0, 0, Math.PI * 2)
      ctx.stroke()

      // Final vignette
      const vig = ctx.createRadialGradient(W * 0.42, H * 0.45, 0, W * 0.42, H * 0.45, Math.max(W, H) * 0.8)
      vig.addColorStop(0,    'rgba(6, 11, 20, 0)')
      vig.addColorStop(0.38, 'rgba(6, 11, 20, 0.18)')
      vig.addColorStop(0.65, 'rgba(4, 8, 16, 0.55)')
      vig.addColorStop(1,    'rgba(2, 4, 10, 0.94)')
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
    const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, form, {
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
          background: #060B14;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
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

        .logo-img {
          width: 48px; height: 48px;
          border-radius: 12px;
          object-fit: contain;
          margin-bottom: 13px;
          animation: breathe 4s ease-in-out infinite;
        }
        @keyframes breathe {
          0%,100% { box-shadow: 0 0 20px rgba(0,229,255,0.1); }
          50%      { box-shadow: 0 0 40px rgba(0,229,255,0.22); }
        }

        .brand-name {
          font-size: 14px;
          font-weight: 700;
          color: #F8FAFC;
          letter-spacing: 3px;
          text-transform: uppercase;
          line-height: 1;
        }
        .brand-sub {
          font-size: 9px;
          color: #00B4D8;
          margin-top: 5px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          font-weight: 500;
        }

        /* Card */
        .card {
          background: rgba(8, 14, 26, 0.82);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 18px;
          padding: 30px;
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          box-shadow:
            0 0 0 1px rgba(0,229,255,0.05) inset,
            0 40px 100px rgba(0,0,0,0.75),
            0 0 60px rgba(0,180,216,0.05);
          transform-style: preserve-3d;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          position: relative;
          overflow: hidden;
        }

        /* Cyan top rim */
        .card::before {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg,
            transparent,
            rgba(0,180,216,0.4) 30%,
            rgba(0,229,255,0.65) 50%,
            rgba(0,180,216,0.4) 70%,
            transparent
          );
        }

        /* Inner cyan glow top */
        .card::after {
          content: '';
          position: absolute;
          top: -60px; left: 50%;
          transform: translateX(-50%);
          width: 200px; height: 100px;
          background: radial-gradient(ellipse, rgba(0,180,216,0.07) 0%, transparent 70%);
          pointer-events: none;
        }

        .card-title {
          font-size: 15px;
          font-weight: 600;
          color: #E2E8F0;
          margin-bottom: 20px;
          letter-spacing: 0.1px;
        }

        /* Fields */
        .fg { margin-bottom: 13px; }
        .fl {
          display: block;
          font-size: 9.5px;
          font-weight: 500;
          color: rgba(0,180,216,0.5);
          margin-bottom: 6px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .fw { position:relative; }
        .fi {
          width: 100%;
          padding: 10px 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(0,180,216,0.12);
          border-radius: 8px;
          color: #CBD5E1;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: all 0.25s ease;
          caret-color: #00E5FF;
        }
        .fi::placeholder { color: rgba(100,116,139,0.5); }
        .fi:focus {
          border-color: rgba(0,229,255,0.3);
          background: rgba(0,180,216,0.05);
          box-shadow: 0 0 0 3px rgba(0,180,216,0.07), 0 0 20px rgba(0,180,216,0.05);
        }

        .eye-btn {
          position: absolute;
          right: 11px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer;
          color: rgba(0,180,216,0.35);
          display: flex; align-items: center;
          padding: 0; transition: color 0.2s;
        }
        .eye-btn:hover { color: rgba(0,229,255,0.7); }

        .forgot { text-align:right; margin-top:5px; }
        .forgot a {
          font-size: 10.5px;
          color: rgba(0,180,216,0.35);
          text-decoration: none;
          transition: color 0.2s;
        }
        .forgot a:hover { color: rgba(0,229,255,0.7); }

        /* Cyan button */
        .btn {
          width: 100%;
          padding: 11px 18px;
          margin-top: 16px;
          background: linear-gradient(135deg,
            rgba(0,150,200,0.35),
            rgba(0,200,240,0.2),
            rgba(14,165,233,0.3)
          );
          border: 1px solid rgba(0,229,255,0.3);
          border-radius: 9px;
          color: #00E5FF;
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
          background: linear-gradient(90deg, transparent, rgba(0,229,255,0.1), transparent);
          animation: sheen 3s ease-in-out infinite;
        }
        @keyframes sheen { 0%{left:-60%} 50%,100%{left:110%} }

        .btn:hover:not(:disabled) {
          border-color: rgba(0,229,255,0.55);
          background: linear-gradient(135deg,
            rgba(0,180,216,0.45),
            rgba(0,229,255,0.28),
            rgba(14,165,233,0.4)
          );
          color: #fff;
          box-shadow: 0 8px 40px rgba(0,180,216,0.2), 0 0 20px rgba(0,229,255,0.1);
          transform: translateY(-1px);
        }
        .btn:disabled { opacity:0.4; cursor:not-allowed; }

        .btn-label { position:relative; z-index:1; }
        .btn-arrow {
          position: relative; z-index:1;
          width: 26px; height: 26px;
          border-radius: 50%;
          background: rgba(0,180,216,0.15);
          border: 1px solid rgba(0,229,255,0.25);
          display: flex; align-items:center; justify-content:center;
          transition: all 0.25s;
        }
        .btn:hover .btn-arrow {
          background: rgba(0,180,216,0.3);
          transform: translateX(2px);
        }

        .spin {
          width:13px; height:13px;
          border:1.5px solid rgba(0,180,216,0.3);
          border-top-color: #00E5FF;
          border-radius:50%;
          animation: sp 0.7s linear infinite;
        }
        @keyframes sp { to{transform:rotate(360deg)} }

        .divider { display:flex; align-items:center; gap:12px; margin:18px 0; }
        .dl { flex:1; height:1px; background:rgba(0,180,216,0.08); }
        .dt { font-size:10px; color:rgba(0,180,216,0.25); letter-spacing:0.5px; }

        .rl { text-align:center; font-size:12px; color:rgba(100,116,139,0.7); }
        .rl a { color:rgba(0,180,216,0.7); text-decoration:none; font-weight:500; transition:color 0.2s; }
        .rl a:hover { color:#00E5FF; }

        /* Demo */
        .demo {
          margin-top: 11px;
          background: rgba(6,11,20,0.8);
          border: 1px solid rgba(0,180,216,0.08);
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
          color:rgba(0,180,216,0.3);
          letter-spacing:0.9px;
          text-transform:uppercase;
          margin-bottom:9px;
        }
        .demo-r {
          display:flex; align-items:center;
          justify-content:space-between;
          padding:5px 0;
        }
        .demo-r + .demo-r { border-top:1px solid rgba(0,180,216,0.05); }
        .demo-role { font-size:11px; color:rgba(0,180,216,0.4); font-weight:500; min-width:48px; }
        .demo-cred { font-size:11px; color:rgba(100,116,139,0.4); }
        .demo-btn {
          font-size:10px;
          color:rgba(0,180,216,0.5);
          cursor:pointer; padding:2px 9px;
          border-radius:5px;
          border:1px solid rgba(0,180,216,0.15);
          background:rgba(0,180,216,0.05);
          transition:all 0.2s;
        }
        .demo-btn:hover {
          background:rgba(0,180,216,0.12);
          color:rgba(0,229,255,0.85);
          border-color:rgba(0,229,255,0.3);
        }
      `}</style>

      <div className="lr">
        <canvas ref={canvasRef} />

        <div className={`cw ${mounted ? 'v' : ''}`}>

          <div className={`brand ${mounted ? 'v' : ''}`}>
            <img src={logo} alt="Resolva" className="logo-img" />
            <div className="brand-name">Resolva</div>
            <div className="brand-sub">Campus Management</div>
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
