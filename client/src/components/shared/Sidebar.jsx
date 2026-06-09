import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import axios from 'axios'
import toast from 'react-hot-toast'

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
          background: #151922;
          border-right: 1px solid #2A3140;
          display: flex;
          flex-direction: column;
          padding: 0;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .sb-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 18px 18px;
          border-bottom: 1px solid #2A3140;
          margin-bottom: 4px;
        }
        .sb-logo {
          width: 32px; height: 32px;
          border-radius: 8px;
          background: rgba(245,196,81,0.12);
          border: 1px solid rgba(245,196,81,0.2);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .sb-name {
          font-size: 15px; font-weight: 600;
          color: #FFFFFF; letter-spacing: -0.3px;
        }

        .sb-section {
          font-size: 9.5px; font-weight: 500;
          color: #A0A8B8;
          letter-spacing: 1px; text-transform: uppercase;
          padding: 16px 18px 6px;
          opacity: 0.5;
        }

        .sb-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 18px;
          font-size: 13px;
          color: #A0A8B8;
          text-decoration: none;
          transition: all 0.18s;
          border-left: 2px solid transparent;
          margin: 1px 8px;
          border-radius: 8px;
        }
        .sb-link:hover {
          color: #FFFFFF;
          background: rgba(255,255,255,0.04);
        }
        .sb-link.active {
          color: #F5C451;
          background: rgba(245,196,81,0.08);
          border-left: none;
          box-shadow: none;
        }
        .sb-link.active svg { color: #F5C451; }
        .sb-link svg { flex-shrink: 0; opacity: 0.7; }
        .sb-link.active svg { opacity: 1; }

        .sb-bottom {
          margin-top: auto;
          padding: 14px 16px;
          border-top: 1px solid #2A3140;
        }

        .sb-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0 12px;
        }
        .sb-avatar {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(245,196,81,0.25), rgba(245,196,81,0.1));
          border: 1px solid rgba(245,196,81,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 600; color: #F5C451;
          flex-shrink: 0;
        }
        .sb-user-name {
          font-size: 12.5px; font-weight: 500;
          color: #FFFFFF;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sb-user-role {
          font-size: 10.5px;
          color: #A0A8B8;
          text-transform: capitalize;
          margin-top: 1px;
        }

        .sb-logout {
          width: 100%;
          padding: 8px 12px;
          background: transparent;
          border: 1px solid #2A3140;
          border-radius: 8px;
          color: #A0A8B8;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex; align-items: center; gap: 7px;
          transition: all 0.18s;
        }
        .sb-logout:hover {
          border-color: rgba(245,196,81,0.2);
          color: #F5C451;
          background: rgba(245,196,81,0.04);
        }
      `}</style>

      <div className="sidebar">
        <div className="sb-brand">
          <div className="sb-logo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#F5C451" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div className="sb-name">Resolva</div>
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
            <div>
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