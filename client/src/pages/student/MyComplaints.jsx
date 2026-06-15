import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/shared/Layout'
import { useMyComplaints } from '../../hooks/useComplaints'
import { useVoteComplaint } from '../../hooks/useComplaints'
import api from '../../api/axiosInstance'

const STATUS_CFG = {
  open:        { label: 'Open',        color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)'  },
  assigned:    { label: 'Assigned',    color: '#00E5FF', bg: 'rgba(0,229,255,0.1)',   border: 'rgba(0,229,255,0.2)'   },
  in_progress: { label: 'In Progress', color: '#6366F1', bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.2)'  },
  resolved:    { label: 'Resolved',    color: '#0EA5E9', bg: 'rgba(14,165,233,0.1)',  border: 'rgba(14,165,233,0.2)'  },
  verified:    { label: 'Verified',    color: '#0EA5E9', bg: 'rgba(14,165,233,0.1)',  border: 'rgba(14,165,233,0.2)'  },
  rejected:    { label: 'Rejected',    color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)'   },
}

const PRIORITY_CFG = {
  low:      { label: 'Low',      color: '#64748B' },
  medium:   { label: 'Medium',   color: '#0EA5E9' },
  high:     { label: 'High',     color: '#F59E0B' },
  critical: { label: 'Critical', color: '#EF4444' },
}

const CAT_ICONS = {
  electrical: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  plumbing:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
  wifi:       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
  hostel:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  academic:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  food:       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/></svg>,
  safety:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  event:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  other:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
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

const FILTERS = ['all','open','assigned','in_progress','resolved','rejected']

export default function MyComplaints() {
  const navigate = useNavigate()
  const [vis, setVis]             = useState(false)
  const [filter, setFilter]       = useState('all')
  const [selected, setSelected]   = useState(null)
  const [timeline, setTimeline]   = useState([])
  const [loadingTL, setLoadingTL] = useState(false)
  const { mutate: vote }          = useVoteComplaint()

  const { data, isLoading } = useMyComplaints({
    status: filter === 'all' ? undefined : filter,
    limit: 50
  })
  const complaints = data?.complaints || []

  useEffect(() => { setTimeout(() => setVis(true), 60) }, [])

  const openDetail = async (c) => {
    setSelected(c)
    setLoadingTL(true)
    try {
      const { data } = await api.get(`/complaints/${c._id}/timeline`)
      setTimeline(data.data)
    } catch { setTimeline([]) }
    finally { setLoadingTL(false) }
  }

  const closeDetail = () => { setSelected(null); setTimeline([]) }

  return (
    <Layout>
      <style>{`
        .mc { padding: 28px 32px; min-height: 100vh; background: #060B14; }

        /* Header */
        .mc-head {
          display: flex; align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 20px;
          opacity: 0; transform: translateY(10px);
          transition: all 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        .mc-head.v { opacity:1; transform:translateY(0); }
        .mc-title { font-size: 20px; font-weight: 600; color: #F8FAFC; letter-spacing: -0.3px; }
        .mc-count { font-size: 12px; color: #64748B; }

        .new-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 20px;
          background: rgba(0,229,255,0.08);
          border: 1px solid rgba(0,229,255,0.25);
          border-radius: 100px; color: #00E5FF;
          font-size: 12px; font-weight: 600;
          text-decoration: none; transition: all 0.22s;
          cursor: pointer;
        }
        .new-btn:hover {
          background: rgba(0,229,255,0.15);
          border-color: rgba(0,229,255,0.5);
          color: #fff;
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(0,229,255,0.15);
        }

        /* Filter tabs */
        .filters {
          display: flex; gap: 4px;
          margin-bottom: 16px; flex-wrap: wrap;
          opacity: 0; transform: translateY(8px);
          transition: all 0.6s 0.08s cubic-bezier(0.16,1,0.3,1);
        }
        .filters.v { opacity:1; transform:translateY(0); }
        .f-tab {
          padding: 6px 12px; border-radius: 8px;
          font-size: 11.5px; font-weight: 500;
          border: 1px solid rgba(0,229,255,0.06);
          background: transparent; color: #64748B;
          cursor: pointer; transition: all 0.18s;
          text-transform: capitalize;
        }
        .f-tab:hover { color: #E2E8F0; border-color: rgba(0,229,255,0.2); background: rgba(0,229,255,0.03); }
        .f-tab.active {
          background: rgba(0,229,255,0.08);
          border-color: rgba(0,229,255,0.3);
          color: #00E5FF;
        }

        /* List */
        .c-list {
          display: flex; flex-direction: column; gap: 8px;
          opacity: 0; transform: translateY(10px);
          transition: all 0.6s 0.14s cubic-bezier(0.16,1,0.3,1);
        }
        .c-list.v { opacity:1; transform:translateY(0); }

        .c-card {
          background: #080E1A;
          border: 1px solid rgba(0,229,255,0.06);
          border-radius: 12px;
          padding: 14px 16px;
          display: flex; align-items: center; gap: 14px;
          cursor: pointer; transition: all 0.18s;
          position: relative; overflow: hidden;
        }
        .c-card:hover {
          border-color: rgba(0,229,255,0.2);
          background: #0C1525;
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        }
        .c-card::before {
          content: ''; position: absolute;
          top: 0; left: 0; bottom: 0; width: 3px;
          background: var(--pc); border-radius: 12px 0 0 12px;
        }
        .c-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: rgba(0,229,255,0.06);
          border: 1px solid rgba(0,229,255,0.1);
          display: flex; align-items: center; justify-content: center;
          color: #00E5FF; flex-shrink: 0;
        }
        .c-body { flex: 1; min-width: 0; }
        .c-title {
          font-size: 13.5px; font-weight: 500; color: #F1F5F9;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 6px;
        }
        .c-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .c-badge {
          font-size: 10px; font-weight: 500;
          padding: 2px 8px; border-radius: 20px; border: 1px solid;
        }
        .c-time { font-size: 10.5px; color: #475569; }
        .c-right {
          display: flex; flex-direction: column;
          align-items: flex-end; gap: 6px; flex-shrink: 0;
        }
        .c-score {
          font-size: 11px; color: #475569;
          display: flex; align-items: center; gap: 3px;
        }
        .vote-btn {
          display: flex; align-items: center; gap: 4px;
          padding: 3px 8px; border-radius: 6px;
          font-size: 10.5px; font-weight: 500; color: #64748B;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(0,229,255,0.08);
          cursor: pointer; transition: all 0.18s;
        }
        .vote-btn:hover { color: #00E5FF; border-color: rgba(0,229,255,0.3); background: rgba(0,229,255,0.05); }

        /* Skeleton */
        .skel {
          height: 68px; border-radius: 12px;
          background: #080E1A;
          animation: sk 1.4s ease-in-out infinite;
          margin-bottom: 8px;
          border: 1px solid rgba(0,229,255,0.05);
        }
        @keyframes sk { 0%,100%{opacity:.5} 50%{opacity:1} }

        /* Empty */
        .empty {
          text-align: center; padding: 56px 20px;
          border: 1px dashed rgba(0,229,255,0.1); border-radius: 14px;
          background: rgba(0,229,255,0.02);
        }
        .empty-ico {
          width: 48px; height: 48px; border-radius: 12px;
          background: rgba(0,229,255,0.06); border: 1px solid rgba(0,229,255,0.1);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px;
        }
        .empty-t { font-size:14px; color:#F1F5F9; font-weight:500; margin-bottom:5px; }
        .empty-s { font-size:12px; color:#475569; }

        /* Detail panel */
        .detail-overlay {
          position: fixed; inset: 0;
          background: rgba(6,11,20,0.75);
          backdrop-filter: blur(4px);
          z-index: 100;
          opacity: 0; pointer-events: none;
          transition: opacity 0.25s;
        }
        .detail-overlay.open { opacity:1; pointer-events:all; }

        .detail-panel {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: 420px;
          background: #080E1A;
          border-left: 1px solid rgba(0,229,255,0.1);
          z-index: 101;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
          display: flex; flex-direction: column;
          overflow: hidden;
          box-shadow: -20px 0 60px rgba(0,0,0,0.5);
        }
        .detail-panel.open { transform: translateX(0); }

        .dp-head {
          padding: 18px 20px;
          border-bottom: 1px solid rgba(0,229,255,0.08);
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 12px;
          flex-shrink: 0;
          background: #060B14;
        }
        .dp-title { font-size: 14px; font-weight: 600; color: #F8FAFC; line-height: 1.4; flex: 1; }
        .dp-close {
          width: 28px; height: 28px; border-radius: 7px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(0,229,255,0.1);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #64748B;
          flex-shrink: 0; transition: all 0.18s;
        }
        .dp-close:hover { color: #F8FAFC; background: rgba(0,229,255,0.08); border-color: rgba(0,229,255,0.25); }

        .dp-body { flex: 1; overflow-y: auto; padding: 18px 20px; }
        .dp-body::-webkit-scrollbar { width: 3px; }
        .dp-body::-webkit-scrollbar-track { background: transparent; }
        .dp-body::-webkit-scrollbar-thumb { background: rgba(0,229,255,0.15); border-radius: 2px; }

        .dp-meta { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }

        .dp-desc {
          font-size: 13px; color: #94A3B8;
          line-height: 1.7; margin-bottom: 16px;
          background: rgba(0,229,255,0.03);
          border: 1px solid rgba(0,229,255,0.08); border-radius: 8px;
          padding: 12px 14px;
        }

        .dp-field { display: flex; gap: 8px; align-items: flex-start; margin-bottom: 10px; }
        .dp-field-label {
          font-size: 10.5px; font-weight: 500;
          color: #475569; text-transform: uppercase;
          letter-spacing: 0.5px; min-width: 80px; margin-top: 1px;
        }
        .dp-field-val { font-size: 13px; color: #E2E8F0; }

        /* AI badge */
        .ai-box {
          background: rgba(0,229,255,0.04);
          border: 1px solid rgba(0,229,255,0.15);
          border-radius: 10px; padding: 12px 14px; margin-bottom: 16px;
        }
        .ai-label {
          font-size: 9.5px; font-weight: 600;
          color: #00E5FF; letter-spacing: 1.5px;
          text-transform: uppercase; margin-bottom: 6px;
          display: flex; align-items: center; gap: 5px;
        }
        .ai-reason { font-size: 12.5px; color: #64748B; line-height: 1.6; }

        /* Timeline */
        .tl-label {
          font-size: 10.5px; font-weight: 600;
          color: #475569; text-transform: uppercase;
          letter-spacing: 1.5px; margin-bottom: 12px;
          padding-top: 8px;
          border-top: 1px solid rgba(0,229,255,0.08);
        }
        .tl-item { display: flex; gap: 12px; padding: 8px 0; position: relative; }
        .tl-item::before {
          content: ''; position: absolute;
          left: 11px; top: 28px; bottom: -8px;
          width: 1px; background: rgba(0,229,255,0.08);
        }
        .tl-item:last-child::before { display: none; }
        .tl-dot {
          width: 24px; height: 24px; border-radius: 50%;
          background: #0C1525; border: 1.5px solid rgba(0,229,255,0.15);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 1px; color: #00E5FF;
        }
        .tl-content { flex: 1; }
        .tl-action { font-size: 12.5px; font-weight: 500; color: #F1F5F9; text-transform: capitalize; margin-bottom: 2px; }
        .tl-meta { font-size: 11px; color: #475569; }
        .tl-remark {
          font-size: 11.5px; color: #64748B;
          background: rgba(0,229,255,0.03); border: 1px solid rgba(0,229,255,0.08);
          border-radius: 6px; padding: 6px 10px; margin-top: 6px; line-height: 1.5;
        }
      `}</style>

      <div className="mc">

        {/* Header */}
        <div className={`mc-head ${vis ? 'v' : ''}`}>
          <div>
            <div className="mc-title">My Complaints</div>
            {!isLoading && (
              <div className="mc-count">{complaints.length} complaint{complaints.length !== 1 ? 's' : ''}</div>
            )}
          </div>
          <button className="new-btn" onClick={() => navigate('/student/new')}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New complaint
          </button>
        </div>

        {/* Filter tabs */}
        <div className={`filters ${vis ? 'v' : ''}`}>
          {FILTERS.map(f => (
            <button
              key={f}
              className={`f-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* List */}
        <div className={`c-list ${vis ? 'v' : ''}`}>
          {isLoading
            ? Array.from({length: 5}).map((_,i) => <div key={i} className="skel"/>)
            : complaints.length === 0
              ? (
                <div className="empty">
                  <div className="empty-ico">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <div className="empty-t">
                    {filter === 'all' ? 'No complaints yet' : `No ${filter} complaints`}
                  </div>
                  <div className="empty-s">
                    {filter === 'all' ? 'Submit your first complaint to get started' : 'Try a different filter'}
                  </div>
                </div>
              )
              : complaints.map(c => {
                  const st = STATUS_CFG[c.status]    || STATUS_CFG.open
                  const pr = PRIORITY_CFG[c.priority] || PRIORITY_CFG.medium
                  return (
                    <div
                      key={c._id}
                      className="c-card"
                      style={{ '--pc': pr.color }}
                      onClick={() => openDetail(c)}
                    >
                      <div className="c-icon" style={{ color: pr.color, background: `${pr.color}10`, borderColor: `${pr.color}20` }}>
                        {CAT_ICONS[c.category] || CAT_ICONS.other}
                      </div>
                      <div className="c-body">
                        <div className="c-title">{c.title}</div>
                        <div className="c-row">
                          <span className="c-badge" style={{ color:st.color, background:st.bg, borderColor:st.border }}>
                            {st.label}
                          </span>
                          <span className="c-badge" style={{ color:pr.color, background:'rgba(255,255,255,0.03)', borderColor:pr.color+'30' }}>
                            {pr.label}
                          </span>
                          <span className="c-time">{timeAgo(c.createdAt)}</span>
                        </div>
                      </div>
                      <div className="c-right">
                        <div className="c-score">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          {c.severityScore}/10
                        </div>
                        <button
                          className="vote-btn"
                          onClick={e => { e.stopPropagation(); vote(c._id) }}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/>
                            <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
                          </svg>
                          {c.voteCount}
                        </button>
                      </div>
                    </div>
                  )
                })
          }
        </div>
      </div>

      {/* Detail panel overlay */}
      <div className={`detail-overlay ${selected ? 'open' : ''}`} onClick={closeDetail}/>
      <div className={`detail-panel ${selected ? 'open' : ''}`}>
        {selected && (
          <>
            <div className="dp-head">
              <div className="dp-title">{selected.title}</div>
              <button className="dp-close" onClick={closeDetail}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="dp-body">
              {/* Badges */}
              <div className="dp-meta">
                {(() => {
                  const st = STATUS_CFG[selected.status] || STATUS_CFG.open
                  const pr = PRIORITY_CFG[selected.priority] || PRIORITY_CFG.medium
                  return (
                    <>
                      <span className="c-badge" style={{ color:st.color, background:st.bg, borderColor:st.border }}>{st.label}</span>
                      <span className="c-badge" style={{ color:pr.color, background:'rgba(255,255,255,0.03)', borderColor:pr.color+'30' }}>{pr.label}</span>
                      {selected.isAnonymous && (
                        <span className="c-badge" style={{ color:'#64748B', background:'rgba(100,116,139,0.08)', borderColor:'rgba(100,116,139,0.2)' }}>Anonymous</span>
                      )}
                    </>
                  )
                })()}
              </div>

              {/* Description */}
              <div className="dp-desc">{selected.description}</div>

              {/* Fields */}
              {selected.location && (
                <div className="dp-field">
                  <div className="dp-field-label">Location</div>
                  <div className="dp-field-val">{selected.location}</div>
                </div>
              )}
              <div className="dp-field">
                <div className="dp-field-label">Category</div>
                <div className="dp-field-val" style={{ textTransform:'capitalize' }}>{selected.category}</div>
              </div>
              <div className="dp-field">
                <div className="dp-field-label">Submitted</div>
                <div className="dp-field-val">{new Date(selected.createdAt).toLocaleString()}</div>
              </div>
              {selected.slaDeadline && (
                <div className="dp-field">
                  <div className="dp-field-label">SLA Deadline</div>
                  <div className="dp-field-val" style={{ color: selected.slaBreach ? '#EF4444' : '#0EA5E9' }}>
                    {new Date(selected.slaDeadline).toLocaleString()}
                    {selected.slaBreach && ' — Breached'}
                  </div>
                </div>
              )}

              {/* AI analysis */}
              {selected.aiReason && (
                <div className="ai-box">
                  <div className="ai-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                      <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/>
                      <path d="M12 8v4l3 3"/>
                    </svg>
                    AI Analysis
                  </div>
                  <div className="ai-reason">{selected.aiReason}</div>
                </div>
              )}

              {/* Timeline */}
              <div className="tl-label">Timeline</div>
              {loadingTL
                ? Array.from({length:3}).map((_,i) => (
                    <div key={i} style={{ height:40, borderRadius:8, background:'#0C1525', marginBottom:8, border:'1px solid rgba(0,229,255,0.06)', animation:'sk 1.4s ease-in-out infinite' }}/>
                  ))
                : timeline.map((entry, i) => (
                    <div className="tl-item" key={entry._id}>
                      <div className="tl-dot">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          {entry.action === 'created'
                            ? <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></>
                            : entry.action === 'resolved'
                              ? <polyline points="20 6 9 17 4 12"/>
                              : <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>
                          }
                        </svg>
                      </div>
                      <div className="tl-content">
                        <div className="tl-action">
                          {entry.action.replace('_', ' ')}
                          {entry.fromStatus && entry.toStatus && ` — ${entry.fromStatus} → ${entry.toStatus}`}
                        </div>
                        <div className="tl-meta">
                          {entry.performedBy?.name} · {timeAgo(entry.createdAt)}
                        </div>
                        {entry.remark && <div className="tl-remark">{entry.remark}</div>}
                      </div>
                    </div>
                  ))
              }
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}