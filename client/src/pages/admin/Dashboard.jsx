import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/shared/Layout'
import api from '../../api/axiosInstance'
import toast from 'react-hot-toast'

const STATUS_CFG = {
  open:        { label: 'Open',        color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)'  },
  assigned:    { label: 'Assigned',    color: '#00E5FF', bg: 'rgba(0,229,255,0.1)',   border: 'rgba(0,229,255,0.2)'   },
  in_progress: { label: 'In Progress', color: '#6366F1', bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.2)'  },
  resolved:    { label: 'Resolved',    color: '#0EA5E9', bg: 'rgba(14,165,233,0.1)',  border: 'rgba(14,165,233,0.2)'  },
  verified:    { label: 'Verified',    color: '#0EA5E9', bg: 'rgba(14,165,233,0.1)',  border: 'rgba(14,165,233,0.2)'  },
  rejected:    { label: 'Rejected',    color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)'   },
}

const PRIORITY_CFG = {
  low:      { label: 'Low',      color: '#475569' },
  medium:   { label: 'Medium',   color: '#0EA5E9' },
  high:     { label: 'High',     color: '#F59E0B' },
  critical: { label: 'Critical', color: '#EF4444' },
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

const FILTERS = ['all', 'open', 'assigned', 'in_progress', 'resolved', 'critical']

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [vis, setVis]               = useState(false)
  const [stats, setStats]           = useState(null)
  const [complaints, setComplaints] = useState([])
  const [staffList, setStaffList]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('all')
  const [selected, setSelected]     = useState(null)
  const [timeline, setTimeline]     = useState([])
  const [loadingTL, setLoadingTL]   = useState(false)
  const [assigning, setAssigning]   = useState(false)
  const [assignForm, setAssignForm] = useState({ assignedTo: '', priority: '', remark: '' })

  useEffect(() => {
    setTimeout(() => setVis(true), 60)
    fetchData()
  }, [])

  useEffect(() => { fetchComplaints() }, [filter])

  const fetchData = async () => {
    try {
      const [statsRes, staffRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/staff'),
      ])
      setStats(statsRes.data.data)
      setStaffList(staffRes.data.data)
    } catch { toast.error('Failed to load stats') }
  }

  const fetchComplaints = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filter === 'critical') params.priority = 'critical'
      else if (filter !== 'all') params.status = filter
      const { data } = await api.get('/admin/complaints', { params: { ...params, limit: 50 } })
      setComplaints(data.data.complaints)
    } catch { toast.error('Failed to load complaints') }
    finally { setLoading(false) }
  }

  const openDetail = async (c) => {
    setSelected(c)
    setAssignForm({ assignedTo: c.assignedTo?._id || '', priority: c.priority, remark: '' })
    setLoadingTL(true)
    try {
      const { data } = await api.get(`/complaints/${c._id}/timeline`)
      setTimeline(data.data)
    } catch { setTimeline([]) }
    finally { setLoadingTL(false) }
  }

  const handleAssign = async () => {
    if (!assignForm.assignedTo) return toast.error('Select a staff member')
    setAssigning(true)
    try {
      await api.patch(`/complaints/${selected._id}/assign`, assignForm)
      toast.success('Complaint assigned')
      fetchComplaints()
      fetchData()
      setSelected(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed')
    } finally { setAssigning(false) }
  }

  const handleStatusChange = async (status) => {
    try {
      await api.patch(`/complaints/${selected._id}/status`, { status })
      toast.success(`Status updated to ${status}`)
      fetchComplaints()
      fetchData()
      setSelected(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    }
  }

  const STAT_CARDS = stats ? [
    { label: 'Total',      num: stats.total,      color: '#00E5FF', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    { label: 'Open',       num: stats.open,       color: '#F59E0B', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
    { label: 'Active',     num: stats.inProgress, color: '#6366F1', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg> },
    { label: 'Resolved',   num: stats.resolved,   color: '#0EA5E9', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> },
    { label: 'Critical',   num: stats.critical,   color: '#EF4444', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
    { label: 'SLA Breach', num: stats.breached,   color: '#F87171', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  ] : []

  return (
    <Layout>
      <style>{`
        .ad { padding: 28px 32px; min-height: 100vh; background: #060B14; }

        .ad-head {
          margin-bottom: 24px;
          opacity: 0; transform: translateY(10px);
          transition: all 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        .ad-head.v { opacity:1; transform:translateY(0); }
        .ad-title { font-size: 20px; font-weight: 600; color: #F8FAFC; letter-spacing: -0.3px; margin-bottom: 3px; }
        .ad-sub   { font-size: 13px; color: #64748B; }

        /* Stats grid */
        .ad-stats {
          display: grid; grid-template-columns: repeat(6, 1fr);
          gap: 10px; margin-bottom: 24px;
          opacity: 0; transform: translateY(10px);
          transition: all 0.6s 0.06s cubic-bezier(0.16,1,0.3,1);
        }
        .ad-stats.v { opacity:1; transform:translateY(0); }

        .stat-card {
          background: #080E1A;
          border: 1px solid rgba(0,229,255,0.06);
          border-radius: 12px; padding: 14px 16px;
          position: relative; overflow: hidden;
          transition: border-color 0.2s, transform 0.2s;
          cursor: default;
        }
        .stat-card:hover { border-color: rgba(0,229,255,0.2); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        .stat-card::after {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: var(--sc); opacity: 0.5;
          border-radius: 12px 12px 0 0;
        }
        .stat-icon {
          width: 28px; height: 28px; border-radius: 7px;
          background: rgba(0,229,255,0.06);
          border: 1px solid rgba(0,229,255,0.1);
          display: flex; align-items: center; justify-content: center;
          color: var(--sc); margin-bottom: 10px;
        }
        .stat-num {
          font-size: 22px; font-weight: 700;
          color: var(--sc); letter-spacing: -0.8px;
          line-height: 1; margin-bottom: 4px;
        }
        .stat-lbl { font-size: 10.5px; color: #64748B; font-weight: 500; }

        /* Filters */
        .filters {
          display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 14px;
          opacity: 0; transform: translateY(8px);
          transition: all 0.6s 0.1s cubic-bezier(0.16,1,0.3,1);
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

        /* Complaint list */
        .c-list {
          display: flex; flex-direction: column; gap: 8px;
          opacity: 0; transform: translateY(10px);
          transition: all 0.6s 0.14s cubic-bezier(0.16,1,0.3,1);
        }
        .c-list.v { opacity:1; transform:translateY(0); }

        .c-card {
          background: #080E1A; border: 1px solid rgba(0,229,255,0.06);
          border-radius: 12px; padding: 13px 16px;
          display: grid;
          grid-template-columns: 36px 1fr auto auto auto;
          align-items: center; gap: 14px;
          cursor: pointer; transition: all 0.18s;
          position: relative; overflow: hidden;
        }
        .c-card:hover {
          border-color: rgba(0,229,255,0.2);
          background: #0C1525; transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .c-card::before {
          content: ''; position: absolute;
          top:0; left:0; bottom:0; width:3px;
          background: var(--pc); border-radius: 12px 0 0 12px;
        }

        .c-icon {
          width: 36px; height: 36px; border-radius: 9px;
          background: rgba(0,229,255,0.06); border: 1px solid rgba(0,229,255,0.1);
          display: flex; align-items: center; justify-content: center;
          color: #00E5FF; flex-shrink: 0;
        }
        .c-body { min-width: 0; }
        .c-title {
          font-size: 13px; font-weight: 500; color: #F1F5F9;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px;
        }
        .c-row { display: flex; align-items: center; gap: 6px; }
        .c-badge {
          font-size: 9.5px; font-weight: 500;
          padding: 2px 7px; border-radius: 20px; border: 1px solid;
        }
        .c-time { font-size: 10px; color: #475569; }

        .c-sla {
          font-size: 10.5px; font-weight: 500;
          display: flex; align-items: center; gap: 4px;
          padding: 3px 8px; border-radius: 6px; white-space: nowrap;
        }
        .c-sla.breach { color: #EF4444; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); }
        .c-sla.ok     { color: #475569; }

        .c-score {
          font-size: 11px; color: #475569;
          display: flex; align-items: center; gap: 3px; white-space: nowrap;
        }
        .c-assignee {
          font-size: 10.5px; color: #475569;
          max-width: 100px; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
        }

        /* Skeleton */
        .skel {
          height: 64px; border-radius: 12px;
          background: #080E1A; border: 1px solid rgba(0,229,255,0.04);
          animation: sk 1.4s ease-in-out infinite; margin-bottom: 8px;
        }
        @keyframes sk { 0%,100%{opacity:.5} 50%{opacity:1} }

        /* Detail panel */
        .overlay {
          position: fixed; inset: 0;
          background: rgba(6,11,20,0.75);
          backdrop-filter: blur(4px);
          z-index: 100; opacity: 0; pointer-events: none;
          transition: opacity 0.25s;
        }
        .overlay.open { opacity:1; pointer-events:all; }

        .detail {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: 460px; background: #080E1A;
          border-left: 1px solid rgba(0,229,255,0.1);
          z-index: 101;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
          display: flex; flex-direction: column; overflow: hidden;
          box-shadow: -20px 0 60px rgba(0,0,0,0.5);
        }
        .detail.open { transform: translateX(0); }

        .dp-head {
          padding: 18px 20px; border-bottom: 1px solid rgba(0,229,255,0.08);
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 12px; flex-shrink: 0;
          background: #060B14;
        }
        .dp-title { font-size: 14px; font-weight: 600; color: #F8FAFC; line-height: 1.4; flex:1; }
        .dp-close {
          width: 28px; height: 28px; border-radius: 7px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(0,229,255,0.1);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #64748B; flex-shrink: 0; transition: all 0.18s;
        }
        .dp-close:hover { color:#F8FAFC; background: rgba(0,229,255,0.08); border-color: rgba(0,229,255,0.25); }

        .dp-body { flex:1; overflow-y:auto; padding: 18px 20px; }
        .dp-body::-webkit-scrollbar { width: 3px; }
        .dp-body::-webkit-scrollbar-track { background: transparent; }
        .dp-body::-webkit-scrollbar-thumb { background: rgba(0,229,255,0.15); border-radius: 2px; }

        .dp-meta { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:14px; }

        .dp-desc {
          font-size: 13px; color: #94A3B8; line-height: 1.7; margin-bottom: 16px;
          background: rgba(0,229,255,0.03); border: 1px solid rgba(0,229,255,0.08);
          border-radius: 8px; padding: 12px 14px;
        }

        .dp-field { display:flex; gap:8px; align-items:flex-start; margin-bottom:9px; }
        .dp-fl {
          font-size: 10.5px; font-weight:500; color:#475569;
          text-transform:uppercase; letter-spacing:0.5px; min-width: 85px; margin-top:1px;
        }
        .dp-fv { font-size:13px; color:#E2E8F0; }

        /* AI box */
        .ai-box {
          background: rgba(0,229,255,0.04);
          border: 1px solid rgba(0,229,255,0.15);
          border-radius: 10px; padding: 12px 14px; margin-bottom: 16px;
        }
        .ai-label {
          font-size: 9.5px; font-weight:600; color:#00E5FF;
          letter-spacing:1.5px; text-transform:uppercase;
          margin-bottom: 6px; display:flex; align-items:center; gap:5px;
        }
        .ai-text { font-size:12.5px; color:#64748B; line-height:1.6; }

        /* Assign form */
        .assign-box {
          background: #0C1525; border: 1px solid rgba(0,229,255,0.08);
          border-radius: 12px; padding: 14px 16px; margin-bottom: 16px;
        }
        .assign-title {
          font-size: 11px; font-weight:600; color:#E2E8F0;
          text-transform:uppercase; letter-spacing:1px; margin-bottom: 12px;
        }
        .assign-field { margin-bottom: 10px; }
        .assign-label {
          font-size: 10.5px; color:#475569; font-weight:500;
          margin-bottom: 5px; display:block;
        }
        .assign-select, .assign-input {
          width: 100%; padding: 9px 12px;
          background: rgba(0,229,255,0.03);
          border: 1px solid rgba(0,229,255,0.1); border-radius: 8px;
          color: #E2E8F0; font-size: 12.5px;
          font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.2s;
        }
        .assign-select:focus, .assign-input:focus {
          border-color: rgba(0,229,255,0.35);
        }
        .assign-select option { background: #080E1A; }

        .assign-btn {
          width: 100%; padding: 10px;
          background: rgba(0,229,255,0.08);
          border: 1px solid rgba(0,229,255,0.25);
          border-radius: 8px; color: #00E5FF;
          font-size: 13px; font-weight:500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.18s;
        }
        .assign-btn:hover {
          background: rgba(0,229,255,0.15);
          border-color: rgba(0,229,255,0.45);
        }
        .assign-btn:disabled { opacity:0.45; cursor:not-allowed; }

        /* Status actions */
        .status-actions { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
        .status-btn {
          padding: 6px 12px; border-radius: 7px;
          font-size: 11px; font-weight:500;
          border: 1px solid; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.18s; background: transparent;
        }
        .status-btn:hover { opacity: 0.8; transform: translateY(-1px); }

        /* Timeline */
        .tl-sep {
          font-size: 10.5px; font-weight:600; color:#475569;
          text-transform:uppercase; letter-spacing:1.5px;
          margin-bottom: 12px; padding-top: 8px;
          border-top: 1px solid rgba(0,229,255,0.08);
        }
        .tl-item { display:flex; gap:12px; padding:7px 0; position:relative; }
        .tl-item::before {
          content:''; position:absolute;
          left:11px; top:27px; bottom:-7px;
          width:1px; background:rgba(0,229,255,0.08);
        }
        .tl-item:last-child::before { display:none; }
        .tl-dot {
          width:24px; height:24px; border-radius:50%;
          background:#0C1525; border:1.5px solid rgba(0,229,255,0.15);
          display:flex; align-items:center; justify-content:center;
          flex-shrink:0; margin-top:1px; color:#00E5FF;
        }
        .tl-con { flex:1; }
        .tl-act { font-size:12.5px; font-weight:500; color:#F1F5F9; text-transform:capitalize; margin-bottom:2px; }
        .tl-met { font-size:11px; color:#475569; }
        .tl-rem {
          font-size:11.5px; color:#64748B;
          background:rgba(0,229,255,0.03); border:1px solid rgba(0,229,255,0.08);
          border-radius:6px; padding:6px 10px; margin-top:6px; line-height:1.5;
        }
      `}</style>

      <div className="ad">

        {/* Header */}
        <div className={`ad-head ${vis ? 'v' : ''}`}>
          <div className="ad-title">Admin Dashboard</div>
          <div className="ad-sub">Manage and resolve campus complaints</div>
        </div>

        {/* Stats */}
        <div className={`ad-stats ${vis ? 'v' : ''}`}>
          {STAT_CARDS.map((s, i) => (
            <div className="stat-card" key={i} style={{ '--sc': s.color }}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-num">{s.num ?? '—'}</div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
          {!stats && Array.from({length:6}).map((_,i) => (
            <div key={i} className="skel" style={{height:90}}/>
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

        {/* Complaints list */}
        <div className={`c-list ${vis ? 'v' : ''}`}>
          {loading
            ? Array.from({length:6}).map((_,i) => <div key={i} className="skel"/>)
            : complaints.length === 0
              ? (
                <div style={{ textAlign:'center', padding:'48px 20px', border:'1px dashed rgba(0,229,255,0.1)', borderRadius:'14px', background:'rgba(0,229,255,0.02)' }}>
                  <div style={{ fontSize:'14px', color:'#F1F5F9', marginBottom:'5px' }}>No complaints found</div>
                  <div style={{ fontSize:'12px', color:'#475569' }}>Try a different filter</div>
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
                      <div className="c-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
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

                      <div className={`c-sla ${c.slaBreach ? 'breach' : 'ok'}`}>
                        {c.slaBreach && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                        )}
                        {c.slaBreach ? 'SLA Breach' : c.slaDeadline ? 'On track' : 'No SLA'}
                      </div>

                      <div className="c-score">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {c.severityScore}/10
                      </div>

                      <div className="c-assignee">
                        {c.assignedTo?.name || '— unassigned'}
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
        {selected && (
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
                {(() => {
                  const st = STATUS_CFG[selected.status]    || STATUS_CFG.open
                  const pr = PRIORITY_CFG[selected.priority] || PRIORITY_CFG.medium
                  return (
                    <>
                      <span className="c-badge" style={{ color:st.color, background:st.bg, borderColor:st.border }}>{st.label}</span>
                      <span className="c-badge" style={{ color:pr.color, background:'rgba(255,255,255,0.03)', borderColor:pr.color+'30' }}>{pr.label}</span>
                      {selected.slaBreach && <span className="c-badge" style={{ color:'#EF4444', background:'rgba(239,68,68,0.1)', borderColor:'rgba(239,68,68,0.25)' }}>SLA Breach</span>}
                    </>
                  )
                })()}
              </div>

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
                <div className="dp-fl">Votes</div>
                <div className="dp-fv">{selected.voteCount}</div>
              </div>
              {selected.slaDeadline && (
                <div className="dp-field">
                  <div className="dp-fl">SLA Deadline</div>
                  <div className="dp-fv" style={{ color: selected.slaBreach ? '#EF4444' : '#0EA5E9' }}>
                    {new Date(selected.slaDeadline).toLocaleString()}
                  </div>
                </div>
              )}

              {(selected.aiReason || selected.suggestedDepartment) && (
                <div className="ai-box">
                  <div className="ai-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    AI Analysis
                  </div>
                  {selected.suggestedDepartment && (
                    <div style={{fontSize:'12px',color:'#00E5FF',marginBottom:'4px'}}>
                      Suggested: {selected.suggestedDepartment}
                    </div>
                  )}
                  {selected.aiReason && <div className="ai-text">{selected.aiReason}</div>}
                </div>
              )}

              <div className="assign-box">
                <div className="assign-title">Assign & Escalate</div>

                <div className="assign-field">
                  <label className="assign-label">Assign to staff</label>
                  <select
                    className="assign-select"
                    value={assignForm.assignedTo}
                    onChange={e => setAssignForm({...assignForm, assignedTo: e.target.value})}
                  >
                    <option value="">Select staff member</option>
                    {staffList.map(s => (
                      <option key={s._id} value={s._id}>{s.name} — {s.department}</option>
                    ))}
                  </select>
                </div>

                <div className="assign-field">
                  <label className="assign-label">Priority override</label>
                  <select
                    className="assign-select"
                    value={assignForm.priority}
                    onChange={e => setAssignForm({...assignForm, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="assign-field">
                  <label className="assign-label">Remark (optional)</label>
                  <input
                    className="assign-input"
                    placeholder="Internal note for staff..."
                    value={assignForm.remark}
                    onChange={e => setAssignForm({...assignForm, remark: e.target.value})}
                  />
                </div>

                <button className="assign-btn" onClick={handleAssign} disabled={assigning}>
                  {assigning ? 'Assigning...' : 'Assign complaint'}
                </button>
              </div>

              <div style={{ marginBottom:'12px' }}>
                <div className="tl-sep" style={{ borderTop:'none', paddingTop:0, marginBottom:'8px' }}>
                  Quick actions
                </div>
                <div className="status-actions">
                  {['in_progress','resolved','rejected'].map(s => {
                    const cfg = STATUS_CFG[s]
                    return (
                      <button
                        key={s}
                        className="status-btn"
                        style={{ color: cfg.color, borderColor: cfg.border, background: cfg.bg }}
                        onClick={() => handleStatusChange(s)}
                      >
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="tl-sep">Timeline</div>
              {loadingTL
                ? Array.from({length:3}).map((_,i) => (
                    <div key={i} style={{ height:36, borderRadius:8, background:'#0C1525', marginBottom:8, border:'1px solid rgba(0,229,255,0.06)', animation:'sk 1.4s ease-in-out infinite' }}/>
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
        )}
      </div>
    </Layout>
  )
}