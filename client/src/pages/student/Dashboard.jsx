import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/shared/Layout'
import { useAuthStore } from '../../store/authStore'
import { useMyComplaints } from '../../hooks/useComplaints'

const STATUS_CFG = {
  open:        { label: 'Open',        color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)' },
  assigned:    { label: 'Assigned',    color: '#00B4D8', bg: 'rgba(0,180,216,0.08)',   border: 'rgba(0,180,216,0.2)'  },
  in_progress: { label: 'In Progress', color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.2)' },
  resolved:    { label: 'Resolved',    color: '#22C55E', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)'  },
  verified:    { label: 'Verified',    color: '#22C55E', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)'  },
  rejected:    { label: 'Rejected',    color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)'  },
}

const PRIORITY_CFG = {
  low:      { label: 'Low',      color: '#64748B' },
  medium:   { label: 'Medium',   color: '#0EA5E9' },
  high:     { label: 'High',     color: '#F59E0B' },
  critical: { label: 'Critical', color: '#EF4444' },
}

const CAT_ICONS = {
  electrical: '⚡', plumbing: '🔧', wifi: '📶', hostel: '🏠',
  academic: '📚', food: '🍽️', safety: '🛡️', event: '📅', other: '📌',
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date)
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function StudentDashboard() {
  const { user } = useAuthStore()
  const [vis, setVis] = useState(false)
  const { data, isLoading } = useMyComplaints({ limit: 20 })
  const complaints = data?.complaints || []

  useEffect(() => { setTimeout(() => setVis(true), 60) }, [])

  const stats = [
    { num: complaints.length, label: 'Total', color: '#00E5FF', icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
    )},
    { num: complaints.filter(c => c.status === 'open').length, label: 'Open', color: '#F59E0B', icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    )},
    { num: complaints.filter(c => ['assigned','in_progress'].includes(c.status)).length, label: 'Active', color: '#8B5CF6', icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
    )},
    { num: complaints.filter(c => ['resolved','verified'].includes(c.status)).length, label: 'Resolved', color: '#22C55E', icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
    )},
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <Layout>
      <style>{`
        .sd {
          padding: 28px 32px;
          min-height: 100vh;
          background: #060B14;
          font-family: 'DM Sans', sans-serif;
        }

        /* Header */
        .sd-head {
          margin-bottom: 28px;
          opacity: 0; transform: translateY(10px);
          transition: all 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        .sd-head.v { opacity:1; transform:translateY(0); }
        .sd-greet {
          font-size: 11px; font-weight: 500;
          color: #475569; letter-spacing: 2px;
          text-transform: uppercase; margin-bottom: 4px;
        }
        .sd-title {
          font-size: 24px; font-weight: 700;
          color: #F8FAFC; letter-spacing: -0.6px;
        }
        .sd-title span {
          background: linear-gradient(90deg, #00E5FF, #6366F1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Stats */
        .sd-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px; margin-bottom: 28px;
          opacity: 0; transform: translateY(10px);
          transition: all 0.6s 0.08s cubic-bezier(0.16,1,0.3,1);
        }
        .sd-stats.v { opacity:1; transform:translateY(0); }

        .stat-card {
          background: #0C1525;
          border: 1px solid rgba(0,229,255,0.06);
          border-radius: 14px;
          padding: 18px 20px;
          position: relative; overflow: hidden;
          transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
        }
        .stat-card:hover {
          border-color: rgba(0,229,255,0.15);
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        }
        .stat-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--stat-color), transparent);
          opacity: 0.4;
        }
        .stat-top {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: 12px;
        }
        .stat-icon {
          width: 30px; height: 30px; border-radius: 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: center;
          color: var(--stat-color);
        }
        .stat-num {
          font-size: 28px; font-weight: 700;
          color: var(--stat-color);
          letter-spacing: -1.5px; line-height: 1;
          margin-bottom: 4px;
        }
        .stat-lbl {
          font-size: 11px; color: #475569;
          font-weight: 500; letter-spacing: 0.3px;
        }

        /* Section bar */
        .sec-bar {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          opacity: 0; transform: translateY(8px);
          transition: all 0.6s 0.14s cubic-bezier(0.16,1,0.3,1);
        }
        .sec-bar.v { opacity:1; transform:translateY(0); }

        .sec-left { display: flex; align-items: center; gap: 10px; }
        .sec-title { font-size: 14px; font-weight: 600; color: #F1F5F9; }
        .sec-count {
          font-size: 10px; color: #00E5FF; font-weight: 600;
          padding: 2px 8px; border-radius: 20px;
          background: rgba(0,229,255,0.08);
          border: 1px solid rgba(0,229,255,0.15);
        }

        .new-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px;
          background: rgba(0,229,255,0.08);
          border: 1px solid rgba(0,229,255,0.2);
          border-radius: 100px; color: #00E5FF;
          font-size: 12px; font-weight: 600;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
          letter-spacing: 0.2px;
        }
        .new-btn:hover {
          background: rgba(0,229,255,0.14);
          border-color: rgba(0,229,255,0.4);
          color: #fff;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,180,216,0.15);
        }

        /* List */
        .c-list {
          display: flex; flex-direction: column; gap: 8px;
          opacity: 0; transform: translateY(10px);
          transition: all 0.6s 0.18s cubic-bezier(0.16,1,0.3,1);
        }
        .c-list.v { opacity:1; transform:translateY(0); }

        .c-card {
          background: #0C1525;
          border: 1px solid rgba(0,229,255,0.06);
          border-radius: 12px;
          padding: 14px 16px;
          display: flex; align-items: center; gap: 14px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
          position: relative; overflow: hidden;
        }
        .c-card:hover {
          border-color: rgba(0,229,255,0.12);
          background: #0E1A2E;
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.25);
        }
        .c-card::before {
          content: '';
          position: absolute; top: 0; left: 0; bottom: 0;
          width: 3px;
          background: var(--pc);
          border-radius: 12px 0 0 12px;
          opacity: 0.8;
        }

        .c-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(0,229,255,0.08);
          display: flex; align-items: center;
          justify-content: center; font-size: 17px; flex-shrink: 0;
        }
        .c-body { flex: 1; min-width: 0; }
        .c-title {
          font-size: 13.5px; font-weight: 500; color: #E2E8F0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 6px;
        }
        .c-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .c-badge {
          font-size: 10px; font-weight: 500;
          padding: 2px 8px; border-radius: 20px;
          border: 1px solid;
        }
        .c-time { font-size: 10.5px; color: #475569; margin-left: 2px; }
        .c-score {
          margin-left: auto; flex-shrink: 0;
          font-size: 11px; color: #475569;
          display: flex; align-items: center; gap: 4px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          padding: 4px 10px; border-radius: 20px;
        }

        /* Empty */
        .empty {
          text-align: center; padding: 64px 20px;
          border: 1px dashed rgba(0,229,255,0.1);
          border-radius: 14px;
          background: rgba(0,229,255,0.02);
        }
        .empty-ico {
          width: 52px; height: 52px; border-radius: 14px;
          background: rgba(0,229,255,0.05);
          border: 1px solid rgba(0,229,255,0.1);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px; color: #00E5FF;
        }
        .empty-t { font-size: 14px; color: #E2E8F0; font-weight: 600; margin-bottom: 6px; }
        .empty-s { font-size: 12.5px; color: #475569; line-height: 1.6; }

        /* Skeleton */
        .skel {
          height: 68px; border-radius: 12px;
          background: linear-gradient(90deg, #0C1525 0%, #0E1A2E 50%, #0C1525 100%);
          background-size: 200% 100%;
          animation: sk 1.6s ease-in-out infinite;
          margin-bottom: 8px;
        }
        @keyframes sk {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Divider */
        .sec-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,229,255,0.08), transparent);
          margin-bottom: 20px;
        }
      `}</style>

      <div className="sd">

        {/* Header */}
        <div className={`sd-head ${vis ? 'v' : ''}`}>
          <div className="sd-greet">{greeting}</div>
          <div className="sd-title">
            Welcome back, <span>{user?.name?.split(' ')[0]}</span>
          </div>
        </div>

        {/* Stats */}
        <div className={`sd-stats ${vis ? 'v' : ''}`}>
          {stats.map((s, i) => (
            <div className="stat-card" key={i} style={{ '--stat-color': s.color }}>
              <div className="stat-top">
                <div className="stat-icon">{s.icon}</div>
              </div>
              <div className="stat-num">{isLoading ? '—' : s.num}</div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="sec-divider" />

        {/* Section bar */}
        <div className={`sec-bar ${vis ? 'v' : ''}`}>
          <div className="sec-left">
            <div className="sec-title">My Complaints</div>
            {!isLoading && complaints.length > 0 && (
              <span className="sec-count">{complaints.length} total</span>
            )}
          </div>
          <Link to="/student/new" className="new-btn">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New
          </Link>
        </div>

        {/* List */}
        <div className={`c-list ${vis ? 'v' : ''}`}>
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skel" />)
            : complaints.length === 0
              ? (
                <div className="empty">
                  <div className="empty-ico">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <div className="empty-t">No complaints yet</div>
                  <div className="empty-s">Submit your first complaint<br/>and track it in real-time</div>
                </div>
              )
              : complaints.map(c => {
                  const st = STATUS_CFG[c.status]    || STATUS_CFG.open
                  const pr = PRIORITY_CFG[c.priority] || PRIORITY_CFG.medium
                  return (
                    <div className="c-card" key={c._id} style={{ '--pc': pr.color }}>
                      <div className="c-icon">{CAT_ICONS[c.category] || '📌'}</div>
                      <div className="c-body">
                        <div className="c-title">{c.title}</div>
                        <div className="c-row">
                          <span className="c-badge" style={{ color: st.color, background: st.bg, borderColor: st.border }}>
                            {st.label}
                          </span>
                          <span className="c-badge" style={{ color: pr.color, background: 'rgba(255,255,255,0.03)', borderColor: pr.color + '25' }}>
                            {pr.label}
                          </span>
                          <span className="c-time">{timeAgo(c.createdAt)}</span>
                        </div>
                      </div>
                      <div className="c-score">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {c.severityScore}/10
                      </div>
                    </div>
                  )
                })
          }
        </div>

      </div>
    </Layout>
  )
}