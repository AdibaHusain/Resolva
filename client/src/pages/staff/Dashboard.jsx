import { useState, useEffect } from 'react'
import Layout from '../../components/shared/Layout'
import api from '../../api/axiosInstance'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'


const PRIORITY_CFG = {
  low:      { label: 'Low',      color: '#475569' },
  medium:   { label: 'Medium',   color: '#0EA5E9' },
  high:     { label: 'High',     color: '#F59E0B' },
  critical: { label: 'Critical', color: '#EF4444' },
}

const STATUS_CFG = {
  open:        { label: 'Open',        color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)'  },
  assigned:    { label: 'Assigned',    color: '#00E5FF', bg: 'rgba(0,229,255,0.1)',   border: 'rgba(0,229,255,0.2)'   },
  in_progress: { label: 'In Progress', color: '#6366F1', bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.2)'  },
  resolved:    { label: 'Resolved',    color: '#0EA5E9', bg: 'rgba(14,165,233,0.1)',  border: 'rgba(14,165,233,0.2)'  },
  verified:    { label: 'Verified',    color: '#0EA5E9', bg: 'rgba(14,165,233,0.1)',  border: 'rgba(14,165,233,0.2)'  },
  rejected:    { label: 'Rejected',    color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)'   },
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

function getSLAStatus(task) {
  if (!task.slaDeadline) return null
  const now      = Date.now()
  const deadline = new Date(task.slaDeadline).getTime()
  const diff     = deadline - now
  if (task.slaBreach || diff < 0) return { label: 'Breached', color: '#EF4444', urgent: true }
  const hrs = Math.floor(diff / 3600000)
  if (hrs < 2) return { label: `${Math.floor(diff / 60000)}m left`, color: '#F59E0B', urgent: true }
  return { label: `${hrs}h left`, color: '#0EA5E9', urgent: false }
}

export default function StaffDashboard() {
  const navigate = useNavigate()
  const { user }                  = useAuthStore()
  const [vis, setVis]             = useState(false)
  const [tasks, setTasks]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('all')
  const [selected, setSelected]   = useState(null)
  const [timeline, setTimeline]   = useState([])
  const [loadingTL, setLoadingTL] = useState(false)
  const [remark, setRemark]       = useState('')
  const [completing, setCompleting] = useState(false)
  const [proofFiles, setProofFiles] = useState([])

  useEffect(() => {
    setTimeout(() => setVis(true), 60)
    fetchTasks()
  }, [])

  useEffect(() => { fetchTasks() }, [filter])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const params = filter !== 'all' ? { status: filter } : {}
      const { data } = await api.get('/staff/tasks', { params })
      setTasks(data.data)
    } catch { toast.error('Failed to load tasks') }
    finally   { setLoading(false) }
  }

  const openDetail = async (task) => {
    setSelected(task)
    setRemark('')
    setProofFiles([])
    setLoadingTL(true)
    try {
      const { data } = await api.get(`/complaints/${task._id}/timeline`)
      setTimeline(data.data)
    } catch { setTimeline([]) }
    finally { setLoadingTL(false) }
  }

  const handleStatusChange = async (status) => {
    try {
      await api.patch(`/complaints/${selected._id}/status`, { status, remark })
      toast.success(`Marked as ${status}`)
      fetchTasks()
      setSelected(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    }
  }

  const handleComplete = async () => {
    setCompleting(true)
    try {
      if (proofFiles.length > 0) {
        const fd = new FormData()
        proofFiles.forEach(f => fd.append('proof', f))
        await api.post(`/complaints/${selected._id}/proof`, fd)
      } else {
        await api.patch(`/staff/tasks/${selected._id}/complete`, { remark })
      }
      toast.success('Task marked as complete')
      fetchTasks()
      setSelected(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete')
    } finally { setCompleting(false) }
  }

  const stats = {
    total:      tasks.length,
    pending:    tasks.filter(t => ['assigned'].includes(t.status)).length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    resolved:   tasks.filter(t => ['resolved','verified'].includes(t.status)).length,
    critical:   tasks.filter(t => t.priority === 'critical').length,
    breached:   tasks.filter(t => t.slaBreach).length,
  }

  const STAT_CARDS = [
    { label: 'Total Tasks', num: stats.total,      color: '#00E5FF' },
    { label: 'Pending',     num: stats.pending,    color: '#F59E0B' },
    { label: 'In Progress', num: stats.inProgress, color: '#6366F1' },
    { label: 'Resolved',    num: stats.resolved,   color: '#0EA5E9' },
    { label: 'Critical',    num: stats.critical,   color: '#EF4444' },
    { label: 'SLA Breach',  num: stats.breached,   color: '#F87171' },
  ]

  const FILTERS = ['all', 'assigned', 'in_progress', 'resolved']

  return (
    <Layout>
      <style>{`
        .sf { padding: 28px 32px; min-height: 100vh; background: #060B14; }

        .sf-head {
          margin-bottom: 24px;
          opacity: 0; transform: translateY(10px);
          transition: all 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        .sf-head.v { opacity:1; transform:translateY(0); }
        .sf-title { font-size: 20px; font-weight: 600; color: #F8FAFC; letter-spacing: -0.3px; margin-bottom: 3px; }
        .sf-sub   { font-size: 13px; color: #64748B; }

        /* Stats */
        .sf-stats {
          display: grid; grid-template-columns: repeat(6,1fr);
          gap: 10px; margin-bottom: 24px;
          opacity: 0; transform: translateY(10px);
          transition: all 0.6s 0.06s cubic-bezier(0.16,1,0.3,1);
        }
        .sf-stats.v { opacity:1; transform:translateY(0); }
        .stat-card {
          background: #080E1A; border: 1px solid rgba(0,229,255,0.06);
          border-radius: 12px; padding: 14px 16px;
          position: relative; overflow: hidden;
          transition: border-color 0.2s, transform 0.2s;
        }
        .stat-card:hover { border-color: rgba(0,229,255,0.2); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        .stat-card::after {
          content:''; position:absolute;
          top:0; left:0; right:0; height:2px;
          background:var(--sc); opacity:0.5;
          border-radius:12px 12px 0 0;
        }
        .stat-num { font-size:22px; font-weight:700; color:var(--sc); letter-spacing:-0.8px; line-height:1; margin-bottom:4px; }
        .stat-lbl { font-size:10.5px; color:#64748B; font-weight:500; }

        /* Filters */
        .filters {
          display:flex; gap:4px; flex-wrap:wrap; margin-bottom:14px;
          opacity:0; transform:translateY(8px);
          transition: all 0.6s 0.1s cubic-bezier(0.16,1,0.3,1);
        }
        .filters.v { opacity:1; transform:translateY(0); }
        .f-tab {
          padding:6px 12px; border-radius:8px;
          font-size:11.5px; font-weight:500;
          border:1px solid rgba(0,229,255,0.06); background:transparent;
          color:#64748B; cursor:pointer; transition:all 0.18s;
          text-transform:capitalize;
        }
        .f-tab:hover { color:#E2E8F0; border-color:rgba(0,229,255,0.2); background:rgba(0,229,255,0.03); }
        .f-tab.active { background:rgba(0,229,255,0.08); border-color:rgba(0,229,255,0.3); color:#00E5FF; }

        /* Task list */
        .t-list {
          display:flex; flex-direction:column; gap:8px;
          opacity:0; transform:translateY(10px);
          transition: all 0.6s 0.14s cubic-bezier(0.16,1,0.3,1);
        }
        .t-list.v { opacity:1; transform:translateY(0); }

        .t-card {
          background:#080E1A; border:1px solid rgba(0,229,255,0.06);
          border-radius:12px; padding:14px 16px;
          display:grid;
          grid-template-columns:36px 1fr auto auto;
          align-items:center; gap:14px;
          cursor:pointer; transition:all 0.18s;
          position:relative; overflow:hidden;
        }
        .t-card:hover { border-color:rgba(0,229,255,0.2); background:#0C1525; transform:translateY(-1px); box-shadow:0 8px 24px rgba(0,0,0,0.3); }
        .t-card::before {
          content:''; position:absolute;
          top:0; left:0; bottom:0; width:3px;
          background:var(--pc); border-radius:12px 0 0 12px;
        }
        .t-card.urgent::before { animation: urgentPulse 2s ease-in-out infinite; }
        @keyframes urgentPulse { 0%,100%{opacity:1} 50%{opacity:0.35} }

        .t-icon {
          width:36px; height:36px; border-radius:9px;
          background:rgba(0,229,255,0.06); border:1px solid rgba(0,229,255,0.1);
          display:flex; align-items:center; justify-content:center;
          color:#00E5FF; flex-shrink:0;
        }
        .t-body { min-width:0; }
        .t-title {
          font-size:13px; font-weight:500; color:#F1F5F9;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:5px;
        }
        .t-row { display:flex; align-items:center; gap:6px; }
        .t-badge {
          font-size:9.5px; font-weight:500;
          padding:2px 7px; border-radius:20px; border:1px solid;
        }
        .t-time { font-size:10px; color:#475569; }
        .t-loc  { font-size:10.5px; color:#475569; margin-top:3px; display:flex; align-items:center; gap:4px; }

        .t-sla {
          font-size:10.5px; font-weight:500;
          padding:3px 9px; border-radius:7px;
          white-space:nowrap; display:flex; align-items:center; gap:4px;
        }

        .t-score { font-size:11px; color:#475569; display:flex; align-items:center; gap:3px; white-space:nowrap; }

        /* Skeleton */
        .skel { height:64px; border-radius:12px; background:#080E1A; border:1px solid rgba(0,229,255,0.04); animation:sk 1.4s ease-in-out infinite; margin-bottom:8px; }
        @keyframes sk { 0%,100%{opacity:.5} 50%{opacity:1} }

        /* Empty */
        .empty { text-align:center; padding:56px 20px; border:1px dashed rgba(0,229,255,0.1); border-radius:14px; background:rgba(0,229,255,0.02); }
        .empty-t { font-size:14px; color:#F1F5F9; font-weight:500; margin-bottom:5px; }
        .empty-s { font-size:12px; color:#475569; }

        /* Detail panel */
        .overlay {
          position:fixed; inset:0;
          background:rgba(6,11,20,0.75); backdrop-filter:blur(4px);
          z-index:100; opacity:0; pointer-events:none; transition:opacity 0.25s;
        }
        .overlay.open { opacity:1; pointer-events:all; }

        .detail {
          position:fixed; top:0; right:0; bottom:0; width:440px;
          background:#080E1A; border-left:1px solid rgba(0,229,255,0.1);
          z-index:101; transform:translateX(100%);
          transition:transform 0.3s cubic-bezier(0.16,1,0.3,1);
          display:flex; flex-direction:column; overflow:hidden;
          box-shadow:-20px 0 60px rgba(0,0,0,0.5);
        }
        .detail.open { transform:translateX(0); }

        .dp-head {
          padding:18px 20px; border-bottom:1px solid rgba(0,229,255,0.08);
          display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-shrink:0;
          background:#060B14;
        }
        .dp-title { font-size:14px; font-weight:600; color:#F8FAFC; line-height:1.4; flex:1; }
        .dp-close {
          width:28px; height:28px; border-radius:7px;
          background:rgba(255,255,255,0.04); border:1px solid rgba(0,229,255,0.1);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; color:#64748B; flex-shrink:0; transition:all 0.18s;
        }
        .dp-close:hover { color:#F8FAFC; background:rgba(0,229,255,0.08); border-color:rgba(0,229,255,0.25); }

        .dp-body { flex:1; overflow-y:auto; padding:18px 20px; }
        .dp-body::-webkit-scrollbar { width:3px; }
        .dp-body::-webkit-scrollbar-track { background:transparent; }
        .dp-body::-webkit-scrollbar-thumb { background:rgba(0,229,255,0.15); border-radius:2px; }

        .dp-meta { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:14px; }

        .dp-desc {
          font-size:13px; color:#94A3B8; line-height:1.7;
          margin-bottom:16px;
          background:rgba(0,229,255,0.03); border:1px solid rgba(0,229,255,0.08);
          border-radius:8px; padding:12px 14px;
        }

        .dp-field { display:flex; gap:8px; align-items:flex-start; margin-bottom:9px; }
        .dp-fl { font-size:10.5px; font-weight:500; color:#475569; text-transform:uppercase; letter-spacing:0.5px; min-width:85px; margin-top:1px; }
        .dp-fv { font-size:13px; color:#E2E8F0; }

        /* SLA countdown */
        .sla-banner {
          border-radius:10px; padding:12px 14px; margin-bottom:16px;
          display:flex; align-items:center; gap:10px;
        }
        .sla-banner.breach  { background:rgba(239,68,68,0.08);  border:1px solid rgba(239,68,68,0.2);  }
        .sla-banner.warning { background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.2); }
        .sla-banner.ok      { background:rgba(0,229,255,0.04);  border:1px solid rgba(0,229,255,0.15); }
        .sla-label { font-size:12px; font-weight:500; }
        .sla-banner.breach  .sla-label { color:#EF4444; }
        .sla-banner.warning .sla-label { color:#F59E0B; }
        .sla-banner.ok      .sla-label { color:#00E5FF; }
        .sla-sub { font-size:11px; color:#475569; margin-top:2px; }

        /* Action box */
        .action-box {
          background:#0C1525; border:1px solid rgba(0,229,255,0.08);
          border-radius:12px; padding:14px 16px; margin-bottom:16px;
        }
        .action-title { font-size:11px; font-weight:600; color:#E2E8F0; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px; }

        .remark-input {
          width:100%; padding:9px 12px;
          background:rgba(0,229,255,0.03); border:1px solid rgba(0,229,255,0.1);
          border-radius:8px; color:#E2E8F0; font-size:12.5px;
          font-family:'DM Sans',sans-serif; outline:none; resize:none;
          transition:border-color 0.2s; margin-bottom:10px;
        }
        .remark-input:focus { border-color:rgba(0,229,255,0.35); }

        .action-btns { display:flex; gap:8px; }
        .action-btn {
          flex:1; padding:9px 12px; border-radius:8px;
          font-size:12px; font-weight:500;
          font-family:'DM Sans',sans-serif;
          cursor:pointer; transition:all 0.18s;
          border:1px solid; background:transparent;
          display:flex; align-items:center; justify-content:center; gap:6px;
        }
        .action-btn.primary {
          background:rgba(0,229,255,0.08);
          border-color:rgba(0,229,255,0.25); color:#00E5FF;
        }
        .action-btn.primary:hover { background:rgba(0,229,255,0.15); border-color:rgba(0,229,255,0.45); }
        .action-btn.secondary {
          border-color:rgba(0,229,255,0.1); color:#64748B;
        }
        .action-btn.secondary:hover { border-color:rgba(99,102,241,0.35); color:#6366F1; }
        .action-btn:disabled { opacity:0.45; cursor:not-allowed; }

        .spin { width:13px; height:13px; border:1.5px solid rgba(0,229,255,0.25); border-top-color:#00E5FF; border-radius:50%; animation:sp 0.7s linear infinite; }
        @keyframes sp { to{transform:rotate(360deg)} }

        /* Proof upload */
        .proof-zone {
          border:1.5px dashed rgba(0,229,255,0.1); border-radius:8px;
          padding:16px; text-align:center; cursor:pointer;
          transition:all 0.2s; margin-bottom:10px;
          background:rgba(0,229,255,0.02);
        }
        .proof-zone:hover { border-color:rgba(0,229,255,0.3); background:rgba(0,229,255,0.04); }
        .proof-text { font-size:12px; color:#475569; }
        .proof-files { display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
        .proof-chip {
          font-size:10.5px; color:#00E5FF;
          background:rgba(0,229,255,0.08); border:1px solid rgba(0,229,255,0.2);
          border-radius:5px; padding:2px 8px;
        }

        /* Timeline */
        .tl-sep { font-size:10.5px; font-weight:600; color:#475569; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:12px; padding-top:8px; border-top:1px solid rgba(0,229,255,0.08); }
        .tl-item { display:flex; gap:12px; padding:7px 0; position:relative; }
        .tl-item::before { content:''; position:absolute; left:11px; top:27px; bottom:-7px; width:1px; background:rgba(0,229,255,0.08); }
        .tl-item:last-child::before { display:none; }
        .tl-dot { width:24px; height:24px; border-radius:50%; background:#0C1525; border:1.5px solid rgba(0,229,255,0.15); display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; color:#00E5FF; }
        .tl-con { flex:1; }
        .tl-act { font-size:12.5px; font-weight:500; color:#F1F5F9; text-transform:capitalize; margin-bottom:2px; }
        .tl-met { font-size:11px; color:#475569; }
        .tl-rem { font-size:11.5px; color:#64748B; background:rgba(0,229,255,0.03); border:1px solid rgba(0,229,255,0.08); border-radius:6px; padding:6px 10px; margin-top:6px; line-height:1.5; }
      `}</style>

      <div className="sf">

        {/* Header */}
        <div className={`sf-head ${vis ? 'v' : ''}`}>
          <div className="sf-title">My Tasks</div>
          <div className="sf-sub">
            {user?.name} — {user?.department || 'Maintenance Team'}
          </div>
        </div>

        {/* Stats */}
        <div className={`sf-stats ${vis ? 'v' : ''}`}>
          {STAT_CARDS.map((s, i) => (
            <div className="stat-card" key={i} style={{ '--sc': s.color }}>
              <div className="stat-num">{loading ? '—' : s.num}</div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
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

        {/* Task list */}
        <div className={`t-list ${vis ? 'v' : ''}`}>
          {loading
            ? Array.from({length: 5}).map((_,i) => <div key={i} className="skel"/>)
            : tasks.length === 0
              ? (
                <div className="empty">
                  <div className="empty-t">No tasks assigned</div>
                  <div className="empty-s">New tasks will appear here when admin assigns them</div>
                </div>
              )
              : tasks.map(t => {
                  const pr  = PRIORITY_CFG[t.priority] || PRIORITY_CFG.medium
                  const st  = STATUS_CFG[t.status]     || STATUS_CFG.assigned
                  const sla = getSLAStatus(t)
                  const isUrgent = sla?.urgent || t.priority === 'critical'
                  return (
                    <div
                      key={t._id}
                      className={`t-card ${isUrgent ? 'urgent' : ''}`}
                      style={{ '--pc': pr.color }}
                      onClick={() => openDetail(t)}
                    >
                      <div className="t-icon">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                      </div>

                      <div className="t-body">
                        <div className="t-title">{t.title}</div>
                        <div className="t-row">
                          <span className="t-badge" style={{ color:st.color, background:st.bg, borderColor:st.border }}>
                            {st.label}
                          </span>
                          <span className="t-badge" style={{ color:pr.color, background:'rgba(255,255,255,0.03)', borderColor:pr.color+'30' }}>
                            {pr.label}
                          </span>
                          <span className="t-time">{timeAgo(t.createdAt)}</span>
                        </div>
                        {t.location && (
                          <div className="t-loc">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            {t.location}
                          </div>
                        )}
                      </div>

                      {sla && (
                        <div className="t-sla" style={{
                          color: sla.color,
                          background: `${sla.color}14`,
                          border: `1px solid ${sla.color}30`,
                          borderRadius: '7px',
                          padding: '3px 9px',
                        }}>
                          {sla.urgent && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12 6 12 12 16 14"/>
                            </svg>
                          )}
                          {sla.label}
                        </div>
                      )}

                      <div className="t-score">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {t.severityScore}/10
                      </div>
                    </div>
                  )
                })
          }
        </div>
      </div>

      {/* Detail panel */}
      <div className={`overlay ${selected ? 'open' : ''}`} onClick={() => setSelected(null)}/>
      <div className={`detail ${selected ? 'open' : ''}`}>
        {selected && (() => {
          const sla = getSLAStatus(selected)
          const st  = STATUS_CFG[selected.status]    || STATUS_CFG.assigned
          const pr  = PRIORITY_CFG[selected.priority] || PRIORITY_CFG.medium
          return (
            <>
              <div className="dp-head">
                <div className="dp-title">{selected.title}</div>
                <button className="dp-close" onClick={() => setSelected(null)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <div className="dp-body">

                <div className="dp-meta">
                  <span className="t-badge" style={{ color:st.color, background:st.bg, borderColor:st.border }}>{st.label}</span>
                  <span className="t-badge" style={{ color:pr.color, background:'rgba(255,255,255,0.03)', borderColor:pr.color+'30' }}>{pr.label}</span>
                </div>

                {sla && (
                  <div className={`sla-banner ${selected.slaBreach ? 'breach' : sla.urgent ? 'warning' : 'ok'}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <div>
                      <div className="sla-label">
                        {selected.slaBreach ? 'SLA Deadline Breached' : `SLA: ${sla.label}`}
                      </div>
                      {selected.slaDeadline && (
                        <div className="sla-sub">
                          Deadline: {new Date(selected.slaDeadline).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="dp-desc">{selected.description}</div>

                {selected.location && (
                  <div className="dp-field">
                    <div className="dp-fl">Location</div>
                    <div className="dp-fv">{selected.location}</div>
                  </div>
                )}
                <div className="dp-field">
                  <div className="dp-fl">Category</div>
                  <div className="dp-fv" style={{textTransform:'capitalize'}}>{selected.category}</div>
                </div>
                <div className="dp-field">
                  <div className="dp-fl">Submitted</div>
                  <div className="dp-fv">{new Date(selected.createdAt).toLocaleString()}</div>
                </div>
                <div className="dp-field">
                  <div className="dp-fl">Severity</div>
                  <div className="dp-fv">{selected.severityScore}/10</div>
                </div>

                {['assigned', 'in_progress'].includes(selected.status) && (
                  <div className="action-box">
                    <div className="action-title">Update Task</div>

                    <textarea
                      className="remark-input"
                      rows={2}
                      placeholder="Add a note or remark..."
                      value={remark}
                      onChange={e => setRemark(e.target.value)}
                    />

                    <label className="proof-zone">
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        style={{display:'none'}}
                        onChange={e => setProofFiles(Array.from(e.target.files))}
                      />
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.6" strokeLinecap="round" style={{marginBottom:'4px'}}>
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <div className="proof-text">
                        {proofFiles.length > 0
                          ? `${proofFiles.length} file(s) selected`
                          : 'Upload proof of resolution (optional)'
                        }
                      </div>
                    </label>

                    {proofFiles.length > 0 && (
                      <div className="proof-files">
                        {proofFiles.map((f, i) => (
                          <span key={i} className="proof-chip">{f.name}</span>
                        ))}
                      </div>
                    )}

                    <div className="action-btns" style={{marginTop:'10px'}}>
                      {selected.status === 'assigned' && (
                        <button
                          className="action-btn secondary"
                          onClick={() => handleStatusChange('in_progress')}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                          </svg>
                          Start working
                        </button>
                      )}
                      <button
                        className="action-btn primary"
                        onClick={handleComplete}
                        disabled={completing}
                      >
                        {completing
                          ? <><div className="spin"/> Completing...</>
                          : <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              Mark complete
                            </>
                        }
                      </button>
                    </div>
                  </div>
                )}

                <div className="tl-sep">Timeline</div>
                {loadingTL
                  ? Array.from({length:3}).map((_,i) => (
                      <div key={i} style={{height:36,borderRadius:8,background:'#0C1525',marginBottom:8,border:'1px solid rgba(0,229,255,0.06)',animation:'sk 1.4s ease-in-out infinite'}}/>
                    ))
                  : timeline.map(entry => (
                      <div className="tl-item" key={entry._id}>
                        <div className="tl-dot">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            {entry.action === 'created'
                              ? <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></>
                              : <polyline points="20 6 9 17 4 12"/>
                            }
                          </svg>
                        </div>
                        <div className="tl-con">
                          <div className="tl-act">
                            {entry.action.replace(/_/g,' ')}
                            {entry.fromStatus && entry.toStatus && ` — ${entry.fromStatus} → ${entry.toStatus}`}
                          </div>
                          <div className="tl-met">{entry.performedBy?.name} · {timeAgo(entry.createdAt)}</div>
                          {entry.remark && <div className="tl-rem">{entry.remark}</div>}
                        </div>
                      </div>
                    ))
                }

              </div>
            </>
          )
        })()}
      </div>
    </Layout>
  )
}