import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Register() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [step, setStep]         = useState(1) // 2-step form
  const [loading, setLoading]   = useState(false)
  const [mounted, setMounted]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    role: 'student', rollNumber: '', hostelBlock: '', department: ''
  })
  const cardRef  = useRef(null)
  const canvasRef = useRef(null)
  const animRef   = useRef(null)

  useEffect(() => { setTimeout(() => setMounted(true), 80) }, [])

  // ── Same canvas as Login — Gold spotlight ──────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W = canvas.width  = window.innerWidth
    let H = canvas.height = window.innerHeight
    let t = 0
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight }
    window.addEventListener('resize', onResize)

    const draw = () => {
      t += 0.003
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#080600'
      ctx.fillRect(0, 0, W, H)

      const spotX = W * 0.14, spotY = H * 0.0

      const cone1 = ctx.createRadialGradient(spotX, spotY, 0, spotX + W*0.18, H*0.85, H*0.95)
      cone1.addColorStop(0,    'rgba(255,220,120,0.0)')
      cone1.addColorStop(0.08, 'rgba(220,170,60,0.09)')
      cone1.addColorStop(0.25, 'rgba(180,130,30,0.06)')
      cone1.addColorStop(0.55, 'rgba(140,100,15,0.03)')
      cone1.addColorStop(1,    'rgba(0,0,0,0)')
      ctx.fillStyle = cone1; ctx.fillRect(0, 0, W, H)

      const cone2 = ctx.createRadialGradient(spotX, spotY, 0, spotX + W*0.1, H*0.75, H*0.72)
      cone2.addColorStop(0,    'rgba(255,230,140,0.0)')
      cone2.addColorStop(0.06, 'rgba(240,190,80,0.12)')
      cone2.addColorStop(0.2,  'rgba(200,150,40,0.07)')
      cone2.addColorStop(0.45, 'rgba(160,110,20,0.03)')
      cone2.addColorStop(1,    'rgba(0,0,0,0)')
      ctx.fillStyle = cone2; ctx.fillRect(0, 0, W, H)

      const cone3 = ctx.createRadialGradient(spotX, spotY, 0, spotX + W*0.055, H*0.62, H*0.52)
      cone3.addColorStop(0,    'rgba(255,245,180,0.0)')
      cone3.addColorStop(0.04, 'rgba(255,220,100,0.16)')
      cone3.addColorStop(0.14, 'rgba(220,170,55,0.10)')
      cone3.addColorStop(0.3,  'rgba(180,130,30,0.05)')
      cone3.addColorStop(0.6,  'rgba(120,90,10,0.02)')
      cone3.addColorStop(1,    'rgba(0,0,0,0)')
      ctx.fillStyle = cone3; ctx.fillRect(0, 0, W, H)

      ctx.save()
      ctx.globalAlpha = 0.4 + 0.08 * Math.sin(t * 0.5)
      const haze = ctx.createLinearGradient(spotX, 0, W*0.42, H*0.7)
      haze.addColorStop(0, 'rgba(200,150,40,0.00)')
      haze.addColorStop(0.15, 'rgba(180,130,30,0.04)')
      haze.addColorStop(0.7, 'rgba(130,90,10,0.01)')
      haze.addColorStop(1, 'rgba(0,0,0,0.00)')
      ctx.fillStyle = haze; ctx.fillRect(0, 0, W, H)
      ctx.restore()

      for (let i = 0; i < 45; i++) {
        const seed = i * 137.508
        const px = (Math.sin(seed*0.7)*0.4+0.3)*W*0.48
        const rise = ((t*14+seed*2.2)%H)
        const drift = Math.sin(t*0.35+seed*0.04)*16
        const finalY = ((Math.cos(seed*0.3)*0.5+0.5)*H - rise + H) % H
        const beamAlpha = Math.max(0, 1-px/(W*0.45))
        const alpha = (0.05+0.06*Math.abs(Math.sin(t*0.6+i)))*beamAlpha
        ctx.beginPath()
        ctx.arc(px+drift, finalY, 0.6+Math.abs(Math.sin(seed))*0.9, 0, Math.PI*2)
        ctx.fillStyle = `rgba(255,210,100,${alpha})`
        ctx.fill()
      }

      const stageX=W*0.5, stageY=H*0.93, stageRX=W*0.18, stageRY=H*0.042
      const stageGlow = ctx.createRadialGradient(stageX,stageY,0,stageX,stageY,stageRX*2.2)
      stageGlow.addColorStop(0,'rgba(200,150,20,0.14)')
      stageGlow.addColorStop(0.35,'rgba(160,110,10,0.06)')
      stageGlow.addColorStop(1,'rgba(0,0,0,0)')
      ctx.fillStyle=stageGlow
      ctx.beginPath(); ctx.ellipse(stageX,stageY,stageRX*2.4,stageRY*3.5,0,0,Math.PI*2); ctx.fill()

      const sf=ctx.createLinearGradient(stageX-stageRX,stageY-stageRY,stageX+stageRX,stageY+stageRY)
      sf.addColorStop(0,'rgba(22,16,4,0.96)'); sf.addColorStop(0.5,'rgba(72,52,12,1.0)'); sf.addColorStop(1,'rgba(22,16,4,0.96)')
      ctx.fillStyle=sf; ctx.beginPath(); ctx.ellipse(stageX,stageY,stageRX,stageRY,0,0,Math.PI*2); ctx.fill()

      const rg=ctx.createLinearGradient(stageX-stageRX,stageY,stageX+stageRX,stageY)
      rg.addColorStop(0,'rgba(160,110,15,0)'); rg.addColorStop(0.5,'rgba(255,210,60,0.95)'); rg.addColorStop(1,'rgba(160,110,15,0)')
      ctx.strokeStyle=rg; ctx.lineWidth=1.2
      ctx.beginPath(); ctx.ellipse(stageX,stageY,stageRX,stageRY,0,0,Math.PI*2); ctx.stroke()

      const vig=ctx.createRadialGradient(W*0.42,H*0.45,0,W*0.42,H*0.45,Math.max(W,H)*0.8)
      vig.addColorStop(0,'rgba(8,6,0,0)'); vig.addColorStop(0.65,'rgba(5,4,0,0.55)'); vig.addColorStop(1,'rgba(3,2,0,0.94)')
      ctx.fillStyle=vig; ctx.fillRect(0,0,W,H)

      animRef.current = requestAnimationFrame(draw)
    }
    animRef.current = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', onResize) }
  }, [])

  const handleMouseMove = (e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const rotX = ((e.clientY-rect.top-rect.height/2)/(rect.height/2))*-3
    const rotY = ((e.clientX-rect.left-rect.width/2)/(rect.width/2))*4
    card.style.transform = `perspective(1400px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px)`
  }
  const handleMouseLeave = () => {
    if (cardRef.current)
      cardRef.current.style.transform = 'perspective(1400px) rotateX(0deg) rotateY(0deg) translateZ(0px)'
  }

  const handleNext = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return toast.error('Fill all fields')
    if (form.password.length < 6) return toast.error('Password min 6 characters')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/register', form, {
        withCredentials: true
      })
      setAuth(data.data.user, data.data.accessToken)
      toast.success(`Welcome to Resolva, ${data.data.user.name}!`)
      const role = data.data.user.role
      if (role === 'student') navigate('/student/dashboard')
      else if (role === 'admin') navigate('/admin/dashboard')
      else if (role === 'staff') navigate('/staff/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const roles = [
  {
    value: 'student',
    label: 'Student',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    )
  },
  {
    value: 'staff',
    label: 'Staff',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07M8.46 8.46a5 5 0 0 0 0 7.07"/>
      </svg>
    )
  },
  {
    value: 'admin',
    label: 'Administrator',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    )
  },
]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        * { box-sizing:border-box; margin:0; padding:0; }

        .lr {
          min-height: 100vh;
          background: #080600;
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden; position: relative;
        }

        canvas { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:0; }

        .cw {
          position:relative; z-index:10;
          width:100%; max-width:420px; padding:0 20px;
          opacity:0; transform:translateY(28px);
          transition: opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1);
        }
        .cw.v { opacity:1; transform:translateY(0); }

        /* Brand */
        .brand {
          text-align:center; margin-bottom:20px;
          opacity:0; transform:translateY(12px);
          transition: opacity 1s 0.1s cubic-bezier(0.16,1,0.3,1), transform 1s 0.1s cubic-bezier(0.16,1,0.3,1);
        }
        .brand.v { opacity:1; transform:translateY(0); }
        .logo {
          display:inline-flex; align-items:center; justify-content:center;
          width:40px; height:40px; border-radius:10px;
          background:linear-gradient(135deg,rgba(200,150,20,0.2),rgba(160,110,10,0.1));
          border:1px solid rgba(200,160,40,0.25); margin-bottom:12px;
          animation: breathe 4s ease-in-out infinite;
        }
        @keyframes breathe {
          0%,100%{box-shadow:0 0 20px rgba(200,150,20,0.1);}
          50%{box-shadow:0 0 40px rgba(220,170,30,0.22);}
        }
        .brand-name { font-size:18px; font-weight:600; color:#e8d9a0; letter-spacing:-0.3px; }
        .brand-sub { font-size:11px; color:rgba(200,160,40,0.35); margin-top:3px; }

        /* Step indicator */
        .steps {
          display:flex; align-items:center; justify-content:center;
          gap:8px; margin-bottom:20px;
        }
        .step-dot {
          width:28px; height:4px; border-radius:2px;
          transition: all 0.4s ease;
        }
        .step-dot.active { background:rgba(220,170,40,0.8); }
        .step-dot.done   { background:rgba(220,170,40,0.4); }
        .step-dot.idle   { background:rgba(255,255,255,0.1); }
        .step-label {
          font-size:11px; color:rgba(200,160,40,0.45);
          letter-spacing:0.5px; margin-left:4px;
        }

        /* Card */
        .card {
          background:rgba(12,12,12,0.82);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:18px; padding:28px 30px;
          backdrop-filter:blur(40px); -webkit-backdrop-filter:blur(40px);
          box-shadow: 0 0 0 1px rgba(200,160,40,0.06) inset, 0 40px 100px rgba(0,0,0,0.75);
          transform-style:preserve-3d;
          transition: transform 0.18s ease;
          position:relative; overflow:hidden;
        }
        .card::before {
          content:''; position:absolute; top:0; left:10%; right:10%; height:1px;
          background:linear-gradient(90deg,transparent,rgba(220,170,40,0.5) 30%,rgba(255,210,60,0.7) 50%,rgba(220,170,40,0.5) 70%,transparent);
        }

        .card-title { font-size:16px; font-weight:600; color:#d4c080; margin-bottom:4px; letter-spacing:0.1px; }
        .card-sub   { font-size:12px; color:rgba(200,160,40,0.35); margin-bottom:22px; }

        /* Fields */
        .fg { margin-bottom:13px; }
        .fl {
          display:block; font-size:9.5px; font-weight:500;
          color:rgba(200,160,40,0.45); margin-bottom:6px;
          letter-spacing:1px; text-transform:uppercase;
        }
        .fw { position:relative; }
        .fi {
          width:100%; padding:10px 14px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(200,160,40,0.12); border-radius:8px;
          color:#d4c080; font-size:13px; font-family:'DM Sans',sans-serif;
          outline:none; transition:all 0.25s ease; caret-color:#c8a830;
        }
        .fi::placeholder { color:rgba(200,160,40,0.2); }
        .fi:focus {
          border-color:rgba(200,160,40,0.3); background:rgba(200,150,20,0.06);
          box-shadow:0 0 0 3px rgba(200,150,20,0.07);
        }

        .eye-btn {
          position:absolute; right:11px; top:50%; transform:translateY(-50%);
          background:none; border:none; cursor:pointer;
          color:rgba(200,160,40,0.35); display:flex; padding:0; transition:color 0.2s;
        }
        .eye-btn:hover { color:rgba(200,160,40,0.7); }

        /* Role selector */
        .role-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
        .role-btn {
          padding:10px 6px; border-radius:8px; cursor:pointer;
          border:1px solid rgba(200,160,40,0.1);
          background:rgba(255,255,255,0.03);
          text-align:center; transition:all 0.2s ease;
        }
        .role-btn:hover { border-color:rgba(200,160,40,0.25); background:rgba(200,150,20,0.06); }
        .role-btn.selected {
          border-color:rgba(220,170,40,0.45);
          background:rgba(200,150,20,0.12);
          box-shadow:0 0 12px rgba(200,150,20,0.1);
        }
        .role-icon {
  width: 36px; height: 36px;
  border-radius: 8px;
  background: rgba(200,150,20,0.08);
  border: 1px solid rgba(200,160,40,0.12);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 8px;
  color: rgba(200,160,40,0.5);
  transition: all 0.2s;
}
  .role-btn.selected .role-icon {
  background: rgba(200,150,20,0.18);
  border-color: rgba(220,170,40,0.35);
  color: #e8c84a;
}
        .role-label { font-size:11px; color:rgba(200,160,40,0.6); font-weight:500; }
        .role-btn.selected .role-label { color:#e8c84a; }

        /* Row grid */
        .fg-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:13px; }

        /* Button */
        .btn {
          width:100%; padding:11px 18px; margin-top:6px;
          background:linear-gradient(135deg,rgba(180,130,15,0.4),rgba(220,170,30,0.25),rgba(160,110,10,0.35));
          border:1px solid rgba(220,170,40,0.35); border-radius:9px;
          color:#e8c84a; font-size:13px; font-weight:500;
          font-family:'DM Sans',sans-serif; cursor:pointer;
          position:relative; overflow:hidden; transition:all 0.25s ease;
          display:flex; align-items:center; justify-content:space-between;
        }
        .btn::before {
          content:''; position:absolute; top:0; left:-80%; width:60%; height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,210,60,0.12),transparent);
          animation:sheen 3s ease-in-out infinite;
        }
        @keyframes sheen { 0%{left:-60%} 50%,100%{left:110%} }
        .btn:hover:not(:disabled) {
          border-color:rgba(220,170,40,0.55);
          background:linear-gradient(135deg,rgba(200,150,20,0.5),rgba(240,190,40,0.32),rgba(180,130,15,0.45));
          color:#f5d860; box-shadow:0 8px 40px rgba(180,130,10,0.25);
          transform:translateY(-1px);
        }
        .btn:disabled { opacity:0.4; cursor:not-allowed; }
        .btn-label { position:relative; z-index:1; }
        .btn-arrow {
          position:relative; z-index:1; width:26px; height:26px; border-radius:50%;
          background:rgba(200,150,20,0.2); border:1px solid rgba(220,170,40,0.3);
          display:flex; align-items:center; justify-content:center; transition:all 0.25s;
        }
        .btn:hover .btn-arrow { background:rgba(200,150,20,0.35); transform:translateX(2px); }

        .btn-back {
          width:100%; padding:10px; margin-top:8px;
          background:transparent; border:1px solid rgba(255,255,255,0.06);
          border-radius:9px; color:rgba(200,160,40,0.35);
          font-size:12px; font-family:'DM Sans',sans-serif;
          cursor:pointer; transition:all 0.2s;
          display:flex; align-items:center; justify-content:center; gap:6px;
        }
        .btn-back:hover { border-color:rgba(200,160,40,0.2); color:rgba(200,160,40,0.6); }

        .spin {
          width:13px; height:13px;
          border:1.5px solid rgba(200,160,40,0.3); border-top-color:#e8c84a;
          border-radius:50%; animation:sp 0.7s linear infinite;
        }
        @keyframes sp { to{transform:rotate(360deg)} }

        .divider { display:flex; align-items:center; gap:12px; margin:16px 0; }
        .dl { flex:1; height:1px; background:rgba(200,160,40,0.08); }
        .dt { font-size:10px; color:rgba(200,160,40,0.22); letter-spacing:0.5px; }

        .rl { text-align:center; font-size:12px; color:rgba(200,160,40,0.3); }
        .rl a { color:rgba(220,180,50,0.6); text-decoration:none; font-weight:500; transition:color 0.2s; }
        .rl a:hover { color:rgba(240,200,60,0.9); }

        /* Step transition */
        .step-panel {
          animation: stepIn 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes stepIn {
          from { opacity:0; transform:translateX(12px); }
          to   { opacity:1; transform:translateX(0); }
        }
      `}</style>

      <div className="lr">
        <canvas ref={canvasRef} />

        <div className={`cw ${mounted ? 'v' : ''}`}>

          {/* Brand */}
          <div className={`brand ${mounted ? 'v' : ''}`}>
            <div className="logo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="rgba(220,170,40,0.8)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div className="brand-name">Resolva</div>
            <div className="brand-sub">Campus Issue Management</div>
          </div>

          {/* Step indicator */}
          <div className="steps">
            <div className={`step-dot ${step >= 1 ? 'active' : 'idle'}`}/>
            <div className={`step-dot ${step >= 2 ? 'active' : 'idle'}`}/>
            <span className="step-label">Step {step} of 2</span>
          </div>

          {/* Card */}
          <div className="card" ref={cardRef}
            onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>

            {/* ── STEP 1 — Basic info ── */}
            {step === 1 && (
              <div className="step-panel">
                <div className="card-title">Create account</div>
                <div className="card-sub">Basic information</div>

                <form onSubmit={handleNext}>
                  <div className="fg">
                    <label className="fl">Full name</label>
                    <input type="text" className="fi"
                      placeholder="Arjun Sharma"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      required
                    />
                  </div>

                  <div className="fg">
                    <label className="fl">Email</label>
                    <input type="email" className="fi"
                      placeholder="you@college.edu"
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      required
                    />
                  </div>

                  <div className="fg">
                    <label className="fl">Password</label>
                    <div className="fw">
                      <input
                        type={showPass ? 'text' : 'password'}
                        className="fi"
                        placeholder="Min 6 characters"
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
                  </div>

                  <button type="submit" className="btn">
                    <span className="btn-label">Continue</span>
                    <div className="btn-arrow">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </div>
                  </button>
                </form>

                <div className="divider"><div className="dl"/><span className="dt">OR</span><div className="dl"/></div>
                <div className="rl">Already have account? <Link to="/login">Sign in</Link></div>
              </div>
            )}

            {/* ── STEP 2 — Role + Details ── */}
            {step === 2 && (
              <div className="step-panel">
                <div className="card-title">Your role</div>
                <div className="card-sub">Select your position on campus</div>

                <form onSubmit={handleSubmit}>
                  {/* Role selector */}
                  <div className="fg">
                    <label className="fl">I am a</label>
                    <div className="role-grid">
                      {roles.map(r => (
                        <div
                          key={r.value}
                          className={`role-btn ${form.role === r.value ? 'selected' : ''}`}
                          onClick={() => setForm({...form, role: r.value})}
                        >
                          <div className="role-icon">{r.icon}</div>
                          <div className="role-label">{r.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Student fields */}
                  {form.role === 'student' && (
                    <div className="fg-row">
                      <div>
                        <label className="fl">Roll number</label>
                        <input type="text" className="fi" placeholder="CS21B001"
                          value={form.rollNumber}
                          onChange={e => setForm({...form, rollNumber: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="fl">Hostel block</label>
                        <input type="text" className="fi" placeholder="C-Block"
                          value={form.hostelBlock}
                          onChange={e => setForm({...form, hostelBlock: e.target.value})}
                        />
                      </div>
                    </div>
                  )}

                  {/* Staff / Admin fields */}
                  {(form.role === 'staff' || form.role === 'admin') && (
                    <div className="fg">
                      <label className="fl">Department</label>
                      <select className="fi"
                        value={form.department}
                        onChange={e => setForm({...form, department: e.target.value})}
                        style={{ cursor: 'pointer' }}
                      >
                        <option value="">Select department</option>
                        <option value="Electrical & Maintenance">Electrical & Maintenance</option>
                        <option value="Civil & Plumbing">Civil & Plumbing</option>
                        <option value="IT & Network">IT & Network</option>
                        <option value="Hostel Administration">Hostel Administration</option>
                        <option value="Academic Affairs">Academic Affairs</option>
                        <option value="Mess & Catering">Mess & Catering</option>
                        <option value="Security & Safety">Security & Safety</option>
                        <option value="General Administration">General Administration</option>
                      </select>
                    </div>
                  )}

                  <button type="submit" className="btn" disabled={loading}>
                    <span className="btn-label">
                      {loading ? <div className="spin"/> : 'Create account'}
                    </span>
                    <div className="btn-arrow">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </div>
                  </button>
                </form>

                <button className="btn-back" onClick={() => setStep(1)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                  </svg>
                  Back
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}