import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/shared/Layout'
import { useAuthStore } from '../../store/authStore'
import { useMyComplaints } from '../../hooks/useComplaints'

const STATUS_CFG = {
  open:        { label: 'Open',        color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)' },
  assigned:    { label: 'Assigned',    color: '#60A5FA', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.25)' },
  in_progress: { label: 'In Progress', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.25)' },
  resolved:    { label: 'Resolved',    color: '#22C55E', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)'  },
  verified:    { label: 'Verified',    color: '#22C55E', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)'  },
  rejected:    { label: 'Rejected',    color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)'  },
}

const PRIORITY_CFG = {
  low:      { label: 'Low',      color: '#A0A8B8' },
  medium:   { label: 'Medium',   color: '#60A5FA' },
  high:     { label: 'High',     color: '#F59E0B' },
  critical: { label: 'Critical', color: '#EF4444' },
}

const CAT_ICONS = {
  electrical:'⚡', plumbing:'🔧', wifi:'📶', hostel:'🏠',
  academic:'📚', food:'🍽️', safety:'🛡️', event:'📅', other:'📌',
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date)
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs/24)}d ago`
}

export default function StudentDashboard() {
  const { user }     = useAuthStore()
  const [vis, setVis] = useState(false)
  const { data, isLoading } = useMyComplaints({ limit: 20 })
  const complaints = data?.complaints || []

  useEffect(() => { setTimeout(() => setVis(true), 60) }, [])

  const stats = [
    { num: complaints.length,                                              label: 'Total',       color: '#F5C451', dot: '#F5C451' },
    { num: complaints.filter(c => c.status === 'open').length,             label: 'Open',        color: '#F59E0B', dot: '#F59E0B' },
    { num: complaints.filter(c => ['assigned','in_progress'].includes(c.status)).length, label: 'Active', color: '#8B5CF6', dot: '#8B5CF6' },
    { num: complaints.filter(c => ['resolved','verified'].includes(c.status)).length,   label: 'Resolved', color: '#22C55E', dot: '#22C55E' },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <Layout>
      <style>{`
        .sd {
          padding: 28px 32px;
          min-height: 100vh;
        }

        /* Header */
        .sd-head {
          margin-bottom: 24px;
          opacity: 0; transform: translateY(10px);
          transition: all 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        .sd-head.v { opacity:1; transform:translateY(0); }
        .sd-greet {
          font-size: 11px; font-weight: 500;
          color: #A0A8B8; letter-spacing: 0.8px;
          text-transform: uppercase; margin-bottom: 3px;
        }
        .sd-title {
          font-size: 22px; font-weight: 600;
          color: #FFFFFF; letter-spacing: -0.4px;
        }
        .sd-title span { color: #F5C451; }

        /* Stats */
        .sd-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px; margin-bottom: 24px;
          opacity: 0; transform: translateY(10px);
          transition: all 0.6s 0.08s cubic-bezier(0.16,1,0.3,1);
        }
        .sd-stats.v { opacity:1; transform:translateY(0); }

        .stat-card {
          background: #1C212B;
          border: 1px solid #2A3140;
          border-radius: 12px;
          padding: 16px 18px;
          position: relative; overflow: hidden;
          transition: border-color 0.2s, transform 0.2s;
        }
        .stat-card:hover { border-color: rgba(245,196,81,0.2); transform: translateY(-1px); }
        .stat-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: var(--stat-color);
          opacity: 0.5; border-radius: 12px 12px 0 0;
        }
        .stat-num {
          font-size: 26px; font-weight: 700;
          color: var(--stat-color);
          letter-spacing: -1px; line-height: 1;
          margin-bottom: 5px;
        }
        .stat-lbl {
          font-size: 11px; color: #A0A8B8;
          font-weight: 500; letter-spacing: 0.3px;
        }

        /* Section bar */
        .sec-bar {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          opacity: 0; transform: translateY(8px);
          transition: all 0.6s 0.14s cubic-bezier(0.16,1,0.3,1);
        }
        .sec-bar.v { opacity:1; transform:translateY(0); }
        .sec-title { font-size: 13px; font-weight: 600; color: #FFFFFF; }
        .sec-count { font-size: 11px; color: #A0A8B8; }

        .new-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px;
          background: rgba(245,196,81,0.1);
          border: 1px solid rgba(245,196,81,0.25);
          border-radius: 8px; color: #F5C451;
          font-size: 12px; font-weight: 500;
          text-decoration: none; transition: all 0.18s;
        }
        .new-btn:hover {
          background: rgba(245,196,81,0.16);
          border-color: rgba(245,196,81,0.4);
          transform: translateY(-1px);
        }

        /* List */
        .c-list {
          display: flex; flex-direction: column; gap: 8px;
          opacity: 0; transform: translateY(10px);
          transition: all 0.6s 0.18s cubic-bezier(0.16,1,0.3,1);
        }
        .c-list.v { opacity:1; transform:translateY(0); }

        .c-card {
          background: #1C212B;
          border: 1px solid #2A3140;
          border-radius: 12px;
          padding: 14px 16px;
          display: flex; align-items: center; gap: 14px;
          cursor: pointer;
          transition: all 0.18s;
          position: relative; overflow: hidden;
        }
        .c-card:hover {
          border-color: rgba(245,196,81,0.15);
          background: #202736;
          transform: translateY(-1px);
        }
        .c-card::before {
          content: '';
          position: absolute; top: 0; left: 0; bottom: 0;
          width: 3px;
          background: var(--pc);
          border-radius: 12px 0 0 12px;
        }

        .c-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid #2A3140;
          display: flex; align-items: center;
          justify-content: center; font-size: 17px; flex-shrink: 0;
        }
        .c-body { flex: 1; min-width: 0; }
        .c-title {
          font-size: 13.5px; font-weight: 500; color: #FFFFFF;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 6px;
        }
        .c-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .c-badge {
          font-size: 10px; font-weight: 500;
          padding: 2px 8px; border-radius: 20px;
          border: 1px solid;
        }
        .c-time { font-size: 10.5px; color: #A0A8B8; margin-left: 2px; }
        .c-score {
          margin-left: auto; flex-shrink: 0;
          font-size: 11px; color: #A0A8B8;
          display: flex; align-items: center; gap: 3px;
        }

        /* Empty */
        .empty {
          text-align: center; padding: 56px 20px;
          border: 1px dashed #2A3140; border-radius: 14px;
        }
        .empty-ico {
          width: 48px; height: 48px; border-radius: 12px;
          background: rgba(255,255,255,0.03); border: 1px solid #2A3140;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px;
        }
        .empty-t { font-size:14px; color:#FFFFFF; font-weight:500; margin-bottom:5px; }
        .empty-s { font-size:12px; color:#A0A8B8; }

        /* Skeleton */
        .skel {
          height: 68px; border-radius: 12px; background: #1C212B;
          animation: sk 1.4s ease-in-out infinite;
        }
        @keyframes sk {
          0%,100% { opacity: 0.5; }
          50%      { opacity: 1; }
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
              <div className="stat-num">{isLoading ? '—' : s.num}</div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Section bar */}
        <div className={`sec-bar ${vis ? 'v' : ''}`}>
          <div>
            <div className="sec-title">My Complaints</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            {!isLoading && <span className="sec-count">{complaints.length} total</span>}
            <Link to="/student/new" className="new-btn">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New
            </Link>
          </div>
        </div>

        {/* List */}
        <div className={`c-list ${vis ? 'v' : ''}`}>
          {isLoading
            ? Array.from({length: 4}).map((_, i) => <div key={i} className="skel" style={{marginBottom:'8px'}}/>)
            : complaints.length === 0
              ? (
                <div className="empty">
                  <div className="empty-ico">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A0A8B8" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <div className="empty-t">No complaints yet</div>
                  <div className="empty-s">Submit your first complaint to get started</div>
                </div>
              )
              : complaints.map(c => {
                  const st = STATUS_CFG[c.status]   || STATUS_CFG.open
                  const pr = PRIORITY_CFG[c.priority] || PRIORITY_CFG.medium
                  return (
                    <div className="c-card" key={c._id} style={{ '--pc': pr.color }}>
                      <div className="c-icon">{CAT_ICONS[c.category] || '📌'}</div>
                      <div className="c-body">
                        <div className="c-title">{c.title}</div>
                        <div className="c-row">
                          <span className="c-badge" style={{ color:st.color, background:st.bg, borderColor:st.border }}>
                            {st.label}
                          </span>
                          <span className="c-badge" style={{ color:pr.color, background:'rgba(255,255,255,0.04)', borderColor:pr.color+'30' }}>
                            {pr.label}
                          </span>
                          <span className="c-time">{timeAgo(c.createdAt)}</span>
                        </div>
                      </div>
                      <div className="c-score">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
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