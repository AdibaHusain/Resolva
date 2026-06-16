import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import axios from 'axios'
import toast from 'react-hot-toast'
import logo from '../../assets/logo.png'

const NAV = {
  student: [
    {
      to: '/student/dashboard', label: 'Dashboard',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
    },
    {
      to: '/student/new', label: 'New Complaint',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
    },
    {
      to: '/student/complaints', label: 'My Complaints',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
    },
  ],
  admin: [
    {
      to: '/admin/dashboard', label: 'Dashboard',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
    },
    {
      to: '/admin/kanban', label: 'Kanban Board',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="15" rx="1"/></svg>
    },
    {
      to: '/admin/analytics', label: 'Analytics',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
    },
    {
  to: '/admin/heatmap', label: 'Campus Heatmap',
  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
},
  ],
  staff: [
    {
      to: '/staff/dashboard', label: 'My Tasks',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
    },
  ],
}

export default function Sidebar() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, { withCredentials: true })
    } catch {}
    clearAuth()
    navigate('/login')
    toast.success('Logged out')
  }

  const links = NAV[user?.role] || []

  return (
    <>
      <style>{`
        .sidebar {
          width: 224px;
          min-height: 100vh;
          background: #080E1A;
          border-right: 1px solid rgba(0,229,255,0.06);
          display: flex;
          flex-direction: column;
          padding: 0;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          height: 100vh;
          font-family: 'DM Sans', sans-serif;
        }

        .sb-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 18px 16px;
          border-bottom: 1px solid rgba(0,229,255,0.06);
          margin-bottom: 8px;
        }
        .sb-logo-img {
          width: 32px; height: 32px;
          border-radius: 8px;
          object-fit: contain;
          flex-shrink: 0;
        }
        .sb-brand-text { display: flex; flex-direction: column; gap: 1px; }
        .sb-name {
          font-size: 12px; font-weight: 700;
          color: #F8FAFC; letter-spacing: 2.5px;
          text-transform: uppercase; line-height: 1;
        }
        .sb-tagline {
          font-size: 8px; font-weight: 500;
          color: #00B4D8; letter-spacing: 1.5px;
          text-transform: uppercase; line-height: 1;
        }

        .sb-section {
          font-size: 9px; font-weight: 600;
          color: #334155;
          letter-spacing: 1.5px; text-transform: uppercase;
          padding: 12px 18px 6px;
        }

        .sb-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          font-size: 13px;
          color: #475569;
          text-decoration: none;
          transition: all 0.18s;
          margin: 1px 8px;
          border-radius: 8px;
          border: 1px solid transparent;
        }
        .sb-link:hover {
          color: #CBD5E1;
          background: rgba(255,255,255,0.03);
          border-color: rgba(0,229,255,0.05);
        }
        .sb-link.active {
          color: #00E5FF;
          background: rgba(0,229,255,0.07);
          border-color: rgba(0,229,255,0.12);
        }
        .sb-link.active svg { color: #00E5FF; opacity: 1; }
        .sb-link svg { flex-shrink: 0; opacity: 0.5; transition: opacity 0.18s; }
        .sb-link:hover svg { opacity: 0.8; }

        .sb-bottom {
          margin-top: auto;
          padding: 12px 14px;
          border-top: 1px solid rgba(0,229,255,0.06);
        }

        .sb-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 2px 12px;
        }
        .sb-avatar {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: rgba(0,180,216,0.1);
          border: 1px solid rgba(0,229,255,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 600;
          color: #00E5FF;
          flex-shrink: 0;
        }
        .sb-user-name {
          font-size: 12.5px; font-weight: 500;
          color: #E2E8F0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sb-user-role {
          font-size: 10px;
          color: #475569;
          text-transform: capitalize;
          margin-top: 1px;
          letter-spacing: 0.3px;
        }

        .sb-logout {
          width: 100%;
          padding: 8px 12px;
          background: transparent;
          border: 1px solid rgba(0,229,255,0.08);
          border-radius: 8px;
          color: #475569;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex; align-items: center; gap: 7px;
          transition: all 0.18s;
        }
        .sb-logout:hover {
          border-color: rgba(239,68,68,0.2);
          color: #EF4444;
          background: rgba(239,68,68,0.04);
        }

        /* Active indicator dot */
        .sb-link.active::before {
          content: '';
          position: absolute;
          left: 8px;
          width: 3px; height: 16px;
          background: linear-gradient(180deg, #00E5FF, #6366F1);
          border-radius: 2px;
          opacity: 0.8;
        }
        .sb-link { position: relative; }
      `}</style>

      <div className="sidebar">
        <div className="sb-brand">
          <img src={logo} alt="Resolva" className="sb-logo-img" />
          <div className="sb-brand-text">
            <div className="sb-name">Resolva</div>
            <div className="sb-tagline">Campus Mgmt</div>
          </div>
        </div>

        <div className="sb-section">Menu</div>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}

        <div className="sb-bottom">
          <div className="sb-user">
            <div className="sb-avatar">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="sb-user-name">{user?.name}</div>
              <div className="sb-user-role">{user?.role}</div>
            </div>
          </div>
          <button className="sb-logout" onClick={handleLogout}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </>
  )
}