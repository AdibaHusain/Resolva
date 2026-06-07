import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const cardRef = useRef(null)
  const particlesRef = useRef([])

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
  }, [])

  // 3D card tilt on mouse move
  const handleMouseMove = (e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -4
    const rotateY = ((x - centerX) / centerX) * 5
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`
  }

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)'
    }
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

  // Generate particles
  const particles = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 10,
    opacity: Math.random() * 0.4 + 0.1,
  }))

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

        .login-root {
          min-height: 100vh;
          background: #050816;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Outfit', sans-serif;
          overflow: hidden;
          position: relative;
        }

        /* Orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(120px);
          opacity: 0;
          transition: opacity 2s ease;
        }
        .orb.vis { opacity: 1; }
        .orb-green {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(0,245,160,0.22) 0%, transparent 65%);
          top: -180px; left: -120px;
          animation: floatA 20s ease-in-out infinite alternate;
        }
        .orb-cyan {
          width: 420px; height: 420px;
          background: radial-gradient(circle, rgba(0,201,255,0.18) 0%, transparent 65%);
          bottom: -140px; right: -80px;
          animation: floatB 25s ease-in-out infinite alternate;
        }
        .orb-mid {
          width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(0,245,160,0.08) 0%, transparent 70%);
          top: 55%; left: 30%;
          animation: floatC 16s ease-in-out infinite alternate;
        }

        @keyframes floatA { from { transform: translate(0,0); } to { transform: translate(70px, 50px); } }
        @keyframes floatB { from { transform: translate(0,0); } to { transform: translate(-50px, -70px); } }
        @keyframes floatC { from { transform: translate(0,0) scale(1); } to { transform: translate(30px,-30px) scale(1.2); } }

        /* Particles */
        .particle {
          position: absolute;
          border-radius: 50%;
          background: #00F5A0;
          pointer-events: none;
          animation: particleFloat linear infinite;
        }
        @keyframes particleFloat {
          0% { transform: translateY(0px) translateX(0px); opacity: var(--op); }
          33% { transform: translateY(-30px) translateX(12px); }
          66% { transform: translateY(-15px) translateX(-10px); }
          100% { transform: translateY(0px) translateX(0px); opacity: var(--op); }
        }

        /* Card wrapper */
        .card-wrap {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          padding: 0 20px;
          opacity: 0;
          transform: translateY(30px) scale(0.98);
          transition: opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1);
        }
        .card-wrap.vis { opacity: 1; transform: translateY(0) scale(1); }

        /* Brand */
        .brand {
          text-align: center;
          margin-bottom: 32px;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.9s 0.1s cubic-bezier(0.16,1,0.3,1), transform 0.9s 0.1s cubic-bezier(0.16,1,0.3,1);
        }
        .brand.vis { opacity: 1; transform: translateY(0); }

        .logo-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 52px; height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(0,245,160,0.15), rgba(0,201,255,0.1));
          border: 1px solid rgba(0,245,160,0.25);
          margin-bottom: 18px;
          animation: breathe 4s ease-in-out infinite;
          box-shadow: 0 0 40px rgba(0,245,160,0.15), 0 8px 32px rgba(0,0,0,0.4);
        }
        @keyframes breathe {
          0%,100% { transform: scale(1); box-shadow: 0 0 40px rgba(0,245,160,0.15), 0 8px 32px rgba(0,0,0,0.4); }
          50% { transform: scale(1.04); box-shadow: 0 0 60px rgba(0,245,160,0.25), 0 12px 40px rgba(0,0,0,0.4); }
        }

        .brand-name {
          font-size: 24px;
          font-weight: 700;
          color: #f0fdf4;
          letter-spacing: -0.5px;
        }
        .brand-sub {
          font-size: 13px;
          color: #1e3a2f;
          color: rgba(0,245,160,0.35);
          margin-top: 5px;
          font-weight: 400;
          letter-spacing: 0.5px;
        }

        /* 3D Card */
        .card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 36px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow:
            0 0 0 1px rgba(0,245,160,0.05) inset,
            0 20px 80px rgba(0,0,0,0.5),
            0 0 60px rgba(0,245,160,0.04);
          transform-style: preserve-3d;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          position: relative;
          overflow: hidden;
        }

        /* Top shimmer edge */
        .card::before {
          content: '';
          position: absolute;
          top: 0; left: 15%; right: 15%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,245,160,0.3), transparent);
        }

        /* Radial glow center */
        .card::after {
          content: '';
          position: absolute;
          top: -60px; left: 50%;
          transform: translateX(-50%);
          width: 200px; height: 120px;
          background: radial-gradient(ellipse, rgba(0,245,160,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .card-title {
          font-size: 17px;
          font-weight: 600;
          color: #ecfdf5;
          margin-bottom: 28px;
          letter-spacing: -0.2px;
        }

        /* Fields */
        .field-group { margin-bottom: 16px; }

        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          color: rgba(0,245,160,0.45);
          margin-bottom: 8px;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .field-wrap {
          position: relative;
          transition: transform 0.2s ease;
        }
        .field-wrap.foc { transform: translateY(-1px); }

        .field-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          color: #ecfdf5;
          font-size: 14px;
          font-family: 'Outfit', sans-serif;
          font-weight: 400;
          outline: none;
          transition: all 0.3s ease;
          caret-color: #00F5A0;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.15); }
        .field-input:focus {
          border-color: rgba(0,245,160,0.4);
          background: rgba(0,245,160,0.04);
          box-shadow: 0 0 0 3px rgba(0,245,160,0.08), 0 0 30px rgba(0,245,160,0.08);
        }

        .field-glow {
          position: absolute;
          bottom: -1px; left: 25%; right: 25%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #00F5A0, transparent);
          opacity: 0;
          transition: all 0.35s ease;
        }
        .field-wrap.foc .field-glow {
          opacity: 1;
          left: 8%; right: 8%;
        }

        /* Button */
        .btn-submit {
          width: 100%;
          padding: 13px;
          margin-top: 10px;
          background: linear-gradient(135deg, rgba(0,245,160,0.15), rgba(0,201,255,0.1));
          border: 1px solid rgba(0,245,160,0.3);
          border-radius: 10px;
          color: #00F5A0;
          font-size: 14px;
          font-weight: 500;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.25s ease;
          letter-spacing: 0.3px;
        }

        /* Shine sweep */
        .btn-submit::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0,245,160,0.12), transparent);
          animation: shine 3s ease-in-out infinite;
        }
        @keyframes shine {
          0% { left: -100%; }
          40%, 100% { left: 100%; }
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          border-color: rgba(0,245,160,0.5);
          box-shadow: 0 8px 40px rgba(0,245,160,0.2), 0 0 20px rgba(0,245,160,0.1);
          color: #fff;
        }
        .btn-submit:active:not(:disabled) { transform: translateY(0); }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          position: relative;
          z-index: 1;
        }

        .spinner {
          width: 14px; height: 14px;
          border: 1.5px solid rgba(0,245,160,0.3);
          border-top-color: #00F5A0;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.05);
        }
        .divider-text { font-size: 11px; color: rgba(255,255,255,0.18); letter-spacing: 0.5px; }

        .register-link {
          text-align: center;
          font-size: 13px;
          color: rgba(255,255,255,0.3);
        }
        .register-link a {
          color: rgba(0,245,160,0.7);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        .register-link a:hover { color: #00F5A0; }

        /* Demo box */
        .demo-box {
          margin-top: 14px;
          background: rgba(0,245,160,0.02);
          border: 1px solid rgba(0,245,160,0.08);
          border-radius: 12px;
          padding: 16px 20px;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.9s 0.35s cubic-bezier(0.16,1,0.3,1), transform 0.9s 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .demo-box.vis { opacity: 1; transform: translateY(0); }

        .demo-title {
          font-size: 10px;
          font-weight: 500;
          color: rgba(0,245,160,0.3);
          letter-spacing: 0.8px;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .demo-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 0;
        }
        .demo-row + .demo-row { border-top: 1px solid rgba(255,255,255,0.03); }
        .demo-role {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          font-weight: 500;
          min-width: 52px;
        }
        .demo-cred {
          font-size: 11px;
          color: rgba(255,255,255,0.2);
        }
        .demo-fill {
          font-size: 10px;
          color: rgba(0,245,160,0.6);
          cursor: pointer;
          padding: 3px 10px;
          border-radius: 5px;
          border: 1px solid rgba(0,245,160,0.2);
          background: rgba(0,245,160,0.05);
          transition: all 0.2s;
          letter-spacing: 0.3px;
        }
        .demo-fill:hover {
          background: rgba(0,245,160,0.12);
          color: #00F5A0;
          border-color: rgba(0,245,160,0.35);
        }
      `}</style>

      <div className="login-root">
        {/* Orbs */}
        <div className={`orb orb-green ${mounted ? 'vis' : ''}`} />
        <div className={`orb orb-cyan ${mounted ? 'vis' : ''}`} />
        <div className={`orb orb-mid ${mounted ? 'vis' : ''}`} />

        {/* Particles */}
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              '--op': p.opacity,
              opacity: p.opacity,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}

        <div className={`card-wrap ${mounted ? 'vis' : ''}`}>

          {/* Brand */}
          <div className={`brand ${mounted ? 'vis' : ''}`}>
            <div className="logo-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00F5A0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div className="brand-name">Resolva</div>
            <div className="brand-sub">Campus Issue Management</div>
          </div>

          {/* 3D Card */}
          <div
            className="card"
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="card-title">Sign in</div>

            <form onSubmit={handleSubmit}>
              <div className="field-group">
                <label className="field-label">Email</label>
                <div className={`field-wrap ${focusedField === 'email' ? 'foc' : ''}`}>
                  <input
                    type="email"
                    className="field-input"
                    placeholder="you@college.edu"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                  <div className="field-glow" />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Password</label>
                <div className={`field-wrap ${focusedField === 'password' ? 'foc' : ''}`}>
                  <input
                    type="password"
                    className="field-input"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                  <div className="field-glow" />
                </div>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                <div className="btn-inner">
                  {loading && <div className="spinner" />}
                  {loading ? 'Signing in...' : 'Continue'}
                </div>
              </button>
            </form>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">OR</span>
              <div className="divider-line" />
            </div>

            <div className="register-link">
              No account? <Link to="/register">Create one</Link>
            </div>
          </div>

          {/* Demo box */}
          <div className={`demo-box ${mounted ? 'vis' : ''}`}>
            <div className="demo-title">Quick access</div>
            {[
              { role: 'Student', email: 'arjun@college.edu',  password: 'Test@1234'  },
              { role: 'Admin',   email: 'admin@college.edu',  password: 'Admin@1234' },
              { role: 'Staff',   email: 'staff@college.edu',  password: 'Staff@1234' },
            ].map(({ role, email, password }) => (
              <div className="demo-row" key={role}>
                <span className="demo-role">{role}</span>
                <span className="demo-cred">{email}</span>
                <span className="demo-fill" onClick={() => setForm({ email, password })}>Fill</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}