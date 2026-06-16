import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../components/shared/Layout'
import api from '../../api/axiosInstance'
import toast from 'react-hot-toast'

const STATUS_CFG = {
  open:        { label: 'Open',        color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)'  },
  assigned:    { label: 'Assigned',    color: '#00E5FF', bg: 'rgba(0,229,255,0.08)',  border: 'rgba(0,229,255,0.15)'  },
  in_progress: { label: 'In Progress', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.2)'  },
  resolved:    { label: 'Resolved',    color: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)'  },
  verified:    { label: 'Verified',    color: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)'  },
  rejected:    { label: 'Rejected',    color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)'   },
}

const PRIORITY_CFG = {
  low:      { label: 'Low',      color: '#94A3B8' },
  medium:   { label: 'Medium',   color: '#00E5FF' },
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

export default function TaskDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const [task, setTask]         = useState(null)
  const [timeline, setTimeline] = useState([])
  const [loading, setLoading]   = useState(true)
  const [remark, setRemark]     = useState('')
  const [proofFiles, setProofFiles] = useState([])
  const [completing, setCompleting] = useState(false)
  const [vis, setVis] = useState(false)

  useEffect(() => {
    setTimeout(() => setVis(true), 60)
    fetchTask()
  }, [id])

  const fetchTask = async () => {
    setLoading(true)
    try {
      const [taskRes, tlRes] = await Promise.all([
        api.get(`/complaints/${id}`),
        api.get(`/complaints/${id}/timeline`),
      ])
      setTask(taskRes.data.data)
      setTimeline(tlRes.data.data)
    } catch { toast.error('Failed to load task') }
    finally  { setLoading(false) }
  }

  const handleStatusChange = async (status) => {
    try {
      await api.patch(`/complaints/${id}/status`, { status, remark })
      toast.success(`Marked as ${status}`)
      fetchTask()
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
        await api.post(`/complaints/${id}/proof`, fd)
      } else {
        await api.patch(`/staff/tasks/${id}/complete`, { remark })
      }
      toast.success('Task marked complete!')
      navigate('/staff/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setCompleting(false) }
  }

  if (loading) return (
    <Layout>
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Array.from({length:4}).map((_,i) => (
          <div key={i} style={{ height: 60, borderRadius: 12, background: '#18201C', animation: 'sk 1.4s ease-in-out infinite' }}/>
        ))}
        <style>{`@keyframes sk{0%,100%{opacity:.5}50%{opacity:1}}`}</style>
      </div>
    </Layout>
  )

  if (!task) return null

  const st = STATUS_CFG[task.status]    || STATUS_CFG.open
  const pr = PRIORITY_CFG[task.priority] || PRIORITY_CFG.medium

  const slaDeadline = task.slaDeadline ? new Date(task.slaDeadline) : null
  const slaLeft     = slaDeadline ? slaDeadline - Date.now() : null
  const slaHrs      = slaLeft ? Math.floor(slaLeft / 3600000) : null
  const slaMins     = slaLeft ? Math.floor((slaLeft % 3600000) / 60000) : null
  const slaBreached = task.slaBreach || (slaLeft !== null && slaLeft < 0)
  const slaUrgent   = !slaBreached && slaHrs !== null && slaHrs < 2

  return (
    <Layout>
      <style>{`
        .td { padding: 28px 32px; min-height: 100vh; max-width: 900px; }

        .td-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12.5px; color: #94A3B8; cursor: pointer;
          background: none; border: none;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.18s; margin-bottom: 20px;
          padding: 0;
        }
        .td-back:hover { color: #00E5FF; }

        .td-header {
          margin-bottom: 24px;
          opacity: 0; transform: translateY(10px);
          transition: all 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        .td-header.v { opacity:1; transform:translateY(0); }

        .td-title {
          font-size: 22px; font-weight: 600;
          color: #FFFFFF; letter-spacing: -0.4px;
          margin-bottom: 10px; line-height: 1.3;
        }
        .td-meta { display: flex; gap: 8px; flex-wrap: wrap; }
        .td-badge {
          font-size: 10.5px; font-weight: 500;
          padding: 3px 10px; border-radius: 20px; border: 1px solid;
        }

        .td-grid {
          display: grid; grid-template-columns: 1fr 340px;
          gap: 16px;
          opacity: 0; transform: translateY(12px);
          transition: all 0.6s 0.08s cubic-bezier(0.16,1,0.3,1);
        }
        .td-grid.v { opacity:1; transform:translateY(0); }

        .td-card {
          background: #111827;
          border: 1px solid rgba(0,229,255,0.08);
          border-radius: 14px; padding: 20px 22px;
          margin-bottom: 14px;
        }
        .td-card:last-child { margin-bottom: 0; }

        .td-card-title {
          font-size: 11px; font-weight: 500;
          color: rgba(0,229,255,0.5); text-transform: uppercase;
          letter-spacing: 0.8px; margin-bottom: 14px;
          display: flex; align-items: center; gap: 6px;
        }

        .td-desc {
          font-size: 13.5px; color: #94A3B8;
          line-height: 1.75;
        }

        .td-field { display: flex; gap: 10px; margin-bottom: 10px; align-items: flex-start; }
        .td-fl {
          font-size: 10.5px; font-weight: 500;
          color: #94A3B8; text-transform: uppercase;
          letter-spacing: 0.5px; min-width: 85px; margin-top: 1px;
        }
        .td-fv { font-size: 13px; color: #FFFFFF; }

        /* SLA banner */
        .sla-banner {
          border-radius: 12px; padding: 14px 16px;
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 14px;
        }
        .sla-icon { flex-shrink: 0; }
        .sla-main { font-size: 13px; font-weight: 600; margin-bottom: 2px; }
        .sla-sub  { font-size: 11px; color: #94A3B8; }

        /* Media grid */
        .media-grid {
          display: grid; grid-template-columns: repeat(3,1fr);
          gap: 8px;
        }
        .media-item {
          border-radius: 8px; overflow: hidden;
          border: 1px solid rgba(0,229,255,0.08);
          aspect-ratio: 1;
        }
        .media-item img { width:100%; height:100%; object-fit:cover; }

        /* AI box */
        .ai-box {
          background: rgba(0,229,255,0.04);
          border: 1px solid rgba(0,229,255,0.12);
          border-radius: 10px; padding: 12px 14px;
        }
        .ai-label {
          font-size: 9.5px; font-weight: 500;
          color: #00E5FF; letter-spacing: 0.8px;
          text-transform: uppercase; margin-bottom: 6px;
          display: flex; align-items: center; gap: 5px;
        }
        .ai-text { font-size: 12.5px; color: #94A3B8; line-height: 1.6; }

        /* Actions */
        .remark-input {
          width: 100%; padding: 10px 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(0,229,255,0.1);
          border-radius: 9px; color: #FFFFFF;
          font-size: 13px; font-family: 'DM Sans', sans-serif;
          outline: none; resize: none;
          transition: border-color 0.2s; margin-bottom: 10px;
        }
        .remark-input:focus { border-color: rgba(0,229,255,0.3); }

        .proof-zone {
          border: 1.5px dashed rgba(0,229,255,0.15);
          border-radius: 9px; padding: 16px;
          text-align: center; cursor: pointer;
          transition: all 0.2s; margin-bottom: 10px;
          background: rgba(0,229,255,0.02);
        }
        .proof-zone:hover { border-color: rgba(0,229,255,0.3); background: rgba(0,229,255,0.04); }
        .proof-text { font-size: 12px; color: #94A3B8; margin-top: 6px; }

        .proof-chip {
          font-size: 10.5px; color: #00E5FF;
          background: rgba(0,229,255,0.08);
          border: 1px solid rgba(0,229,255,0.2);
          border-radius: 5px; padding: 2px 8px;
          display: inline-block; margin: 3px;
        }

        .action-btns { display: flex; flex-direction: column; gap: 8px; }
        .action-btn {
          width: 100%; padding: 11px;
          border-radius: 9px; font-size: 13px;
          font-weight: 500; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.18s;
          border: 1px solid; display: flex;
          align-items: center; justify-content: center; gap: 7px;
        }
        .btn-complete {
          background: rgba(0,229,255,0.1);
          border-color: rgba(0,229,255,0.3); color: #00E5FF;
        }
        .btn-complete:hover { background: rgba(0,229,255,0.18); border-color: rgba(0,229,255,0.5); }
        .btn-progress {
          background: rgba(139,92,246,0.08);
          border-color: rgba(139,92,246,0.25); color: #8B5CF6;
        }
        .btn-progress:hover { background: rgba(139,92,246,0.15); }
        .btn-complete:disabled { opacity:0.45; cursor:not-allowed; }

        .spin {
          width:13px; height:13px;
          border:1.5px solid rgba(0,229,255,0.3);
          border-top-color:#00E5FF;
          border-radius:50%; animation:sp 0.7s linear infinite;
        }
        @keyframes sp { to{transform:rotate(360deg)} }

        /* Timeline */
        .tl-item { display:flex; gap:12px; padding:8px 0; position:relative; }
        .tl-item::before { content:''; position:absolute; left:11px; top:28px; bottom:-8px; width:1px; background:rgba(0,229,255,0.08); }
        .tl-item:last-child::before { display:none; }
        .tl-dot {
          width:24px; height:24px; border-radius:50%;
          background:#111827; border:1.5px solid rgba(0,229,255,0.15);
          display:flex; align-items:center; justify-content:center;
          flex-shrink:0; margin-top:1px; color:#00E5FF;
        }
        .tl-act { font-size:12.5px; font-weight:500; color:#FFFFFF; text-transform:capitalize; margin-bottom:2px; }
        .tl-met { font-size:11px; color:#94A3B8; }
        .tl-rem {
          font-size:11.5px; color:#94A3B8;
          background:rgba(255,255,255,0.03);
          border:1px solid rgba(0,229,255,0.06);
          border-radius:6px; padding:6px 10px; margin-top:6px; line-height:1.5;
        }
      `}</style>

      <div className="td">
        <button className="td-back" onClick={() => navigate('/staff/dashboard')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to tasks
        </button>

        <div className={`td-header ${vis ? 'v' : ''}`}>
          <div className="td-title">{task.title}</div>
          <div className="td-meta">
            <span className="td-badge" style={{ color:st.color, background:st.bg, borderColor:st.border }}>{st.label}</span>
            <span className="td-badge" style={{ color:pr.color, background:`${pr.color}12`, borderColor:`${pr.color}30` }}>{pr.label}</span>
            {task.slaBreach && <span className="td-badge" style={{ color:'#EF4444', background:'rgba(239,68,68,0.1)', borderColor:'rgba(239,68,68,0.2)' }}>SLA Breached</span>}
            {task.isAnonymous && <span className="td-badge" style={{ color:'#94A3B8', background:'rgba(148,163,184,0.08)', borderColor:'rgba(148,163,184,0.15)' }}>Anonymous</span>}
          </div>
        </div>

        <div className={`td-grid ${vis ? 'v' : ''}`}>

          {/* Left column */}
          <div>
            {/* SLA Banner */}
            {slaDeadline && (
              <div className="sla-banner" style={{
                background: slaBreached ? 'rgba(239,68,68,0.08)' : slaUrgent ? 'rgba(245,158,11,0.08)' : 'rgba(0,229,255,0.05)',
                border: `1px solid ${slaBreached ? 'rgba(239,68,68,0.2)' : slaUrgent ? 'rgba(245,158,11,0.2)' : 'rgba(0,229,255,0.12)'}`,
              }}>
                <div className="sla-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke={slaBreached ? '#EF4444' : slaUrgent ? '#F59E0B' : '#00E5FF'}
                    strokeWidth="1.6" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div>
                  <div className="sla-main" style={{ color: slaBreached ? '#EF4444' : slaUrgent ? '#F59E0B' : '#00E5FF' }}>
                    {slaBreached
                      ? 'SLA Deadline Breached'
                      : slaLeft !== null
                        ? `${slaHrs}h ${slaMins}m remaining`
                        : 'SLA Active'
                    }
                  </div>
                  <div className="sla-sub">Deadline: {slaDeadline.toLocaleString()}</div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="td-card">
              <div className="td-card-title">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                Description
              </div>
              <div className="td-desc">{task.description}</div>
            </div>

            {/* Details */}
            <div className="td-card">
              <div className="td-card-title">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Details
              </div>
              <div className="td-field">
                <div className="td-fl">Category</div>
                <div className="td-fv" style={{textTransform:'capitalize'}}>{task.category}</div>
              </div>
              {task.location && (
                <div className="td-field">
                  <div className="td-fl">Location</div>
                  <div className="td-fv">{task.location}</div>
                </div>
              )}
              <div className="td-field">
                <div className="td-fl">Severity</div>
                <div className="td-fv" style={{ color: task.severityScore >= 8 ? '#EF4444' : task.severityScore >= 6 ? '#F59E0B' : '#00E5FF' }}>
                  {task.severityScore}/10
                </div>
              </div>
              <div className="td-field">
                <div className="td-fl">Submitted</div>
                <div className="td-fv">{new Date(task.createdAt).toLocaleString()}</div>
              </div>
              <div className="td-field">
                <div className="td-fl">Votes</div>
                <div className="td-fv">{task.voteCount}</div>
              </div>
            </div>

            {/* AI Analysis */}
            {task.aiReason && (
              <div className="td-card">
                <div className="td-card-title">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="1.8" strokeLinecap="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  AI Analysis
                </div>
                <div className="ai-box">
                  {task.suggestedDepartment && (
                    <div style={{ fontSize:12, color:'#00E5FF', marginBottom:6 }}>
                      Dept: {task.suggestedDepartment}
                    </div>
                  )}
                  <div className="ai-text">{task.aiReason}</div>
                </div>
              </div>
            )}

            {/* Media */}
            {task.mediaUrls?.length > 0 && (
              <div className="td-card">
                <div className="td-card-title">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                  </svg>
                  Evidence ({task.mediaUrls.length})
                </div>
                <div className="media-grid">
                  {task.mediaUrls.map((url, i) => (
                    <div className="media-item" key={i}>
                      {url.match(/\.(mp4|mov|avi)/i)
                        ? <video src={url} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        : <img src={url} alt={`evidence-${i}`} onClick={() => window.open(url,'_blank')} style={{cursor:'pointer'}}/>
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="td-card">
              <div className="td-card-title">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                Timeline
              </div>
              {timeline.map(entry => (
                <div className="tl-item" key={entry._id}>
                  <div className="tl-dot">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      {entry.action === 'created'
                        ? <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></>
                        : <polyline points="20 6 9 17 4 12"/>
                      }
                    </svg>
                  </div>
                  <div style={{flex:1}}>
                    <div className="tl-act">
                      {entry.action.replace(/_/g,' ')}
                      {entry.fromStatus && entry.toStatus && ` — ${entry.fromStatus} → ${entry.toStatus}`}
                    </div>
                    <div className="tl-met">{entry.performedBy?.name} · {timeAgo(entry.createdAt)}</div>
                    {entry.remark && <div className="tl-rem">{entry.remark}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — actions */}
          {['assigned','in_progress'].includes(task.status) && (
            <div>
              <div className="td-card" style={{ position: 'sticky', top: 28 }}>
                <div className="td-card-title">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Update Task
                </div>

                <textarea
                  className="remark-input"
                  rows={3}
                  placeholder="Add a note or remark..."
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                />

                <label className="proof-zone">
                  <input
                    type="file" multiple accept="image/*,video/*"
                    style={{display:'none'}}
                    onChange={e => setProofFiles(Array.from(e.target.files))}
                  />
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(0,229,255,0.5)" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <div className="proof-text">
                    {proofFiles.length > 0 ? `${proofFiles.length} file(s) selected` : 'Upload proof of resolution'}
                  </div>
                </label>

                {proofFiles.length > 0 && (
                  <div style={{marginBottom:10}}>
                    {proofFiles.map((f,i) => <span key={i} className="proof-chip">{f.name}</span>)}
                  </div>
                )}

                <div className="action-btns">
                  {task.status === 'assigned' && (
                    <button className="action-btn btn-progress" onClick={() => handleStatusChange('in_progress')}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                      Start working
                    </button>
                  )}
                  <button
                    className="action-btn btn-complete"
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
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}