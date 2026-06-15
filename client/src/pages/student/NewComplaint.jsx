import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { useCreateComplaint } from '../../hooks/useComplaints'
import Layout from '../../components/shared/Layout'

const CATEGORIES = [
  { value: 'electrical', label: 'Electrical', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
  { value: 'plumbing', label: 'Plumbing', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg> },
  { value: 'wifi', label: 'WiFi / Network', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg> },
  { value: 'hostel', label: 'Hostel', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { value: 'academic', label: 'Academic', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
  { value: 'food', label: 'Food / Mess', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> },
  { value: 'safety', label: 'Safety', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { value: 'event', label: 'Event', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { value: 'other', label: 'Other', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
]

export default function NewComplaint() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useCreateComplaint()
  const [form, setForm] = useState({ category: '', title: '', description: '', location: '', isAnonymous: false })
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])

  const onDrop = useCallback((accepted) => {
    const next = [...files, ...accepted].slice(0, 5)
    setFiles(next)
    setPreviews(next.map(f => ({ name: f.name, url: f.type.startsWith('image') ? URL.createObjectURL(f) : null, type: f.type })))
  }, [files])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [], 'video/*': [] }, maxSize: 20 * 1024 * 1024, maxFiles: 5,
  })

  const removeFile = (i) => {
    setFiles(f => f.filter((_, idx) => idx !== i))
    setPreviews(p => p.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.category) return
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))
    files.forEach(f => fd.append('media', f))
    await mutateAsync(fd)
    navigate('/student/complaints')
  }

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');

        .nc {
          max-width: 720px; margin: 0 auto;
          padding: 32px 32px;
          font-family: 'DM Sans', sans-serif;
        }

        .nc-head { margin-bottom: 28px; }
        .nc-title {
          font-size: 21px; font-weight: 700;
          color: #F8FAFC; letter-spacing: -0.5px; margin-bottom: 5px;
        }
        .nc-sub { font-size: 13px; color: #475569; line-height: 1.6; }

        .fg { margin-bottom: 20px; }
        .fl {
          display: flex; align-items: center; gap: 6px;
          font-size: 10.5px; font-weight: 600;
          color: #475569; margin-bottom: 8px;
          letter-spacing: 1px; text-transform: uppercase;
        }
        .fl-req { color: #00E5FF; font-size: 13px; line-height: 1; font-weight: 400; }
        .fl-opt { font-size: 10px; color: #334155; font-weight: 400; text-transform: none; letter-spacing: 0; }

        .cat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }
        .cat-btn {
          display: flex; align-items: center; gap: 9px;
          padding: 11px 14px;
          background: #0C1525;
          border: 1px solid rgba(0,229,255,0.07);
          border-radius: 10px; cursor: pointer;
          font-size: 13px; font-weight: 400; color: #64748B;
          transition: all 0.18s; text-align: left;
          font-family: 'DM Sans', sans-serif;
        }
        .cat-btn:hover { border-color: rgba(0,229,255,0.18); color: #CBD5E1; background: #0E1A2E; }
        .cat-btn.sel {
          border-color: rgba(0,229,255,0.3); background: rgba(0,229,255,0.06);
          color: #00E5FF; box-shadow: 0 0 0 1px rgba(0,229,255,0.08) inset;
        }
        .cat-btn svg { opacity: 0.4; flex-shrink: 0; transition: opacity 0.18s; }
        .cat-btn:hover svg { opacity: 0.7; }
        .cat-btn.sel svg { opacity: 1; color: #00E5FF; }

        .fi {
          width: 100%; padding: 11px 14px;
          background: #0C1525;
          border: 1px solid rgba(0,229,255,0.07);
          border-radius: 10px; color: #E2E8F0;
          font-size: 13.5px; font-family: 'DM Sans', sans-serif;
          outline: none; transition: all 0.2s; caret-color: #00E5FF;
        }
        .fi::placeholder { color: rgba(71,85,105,0.6); }
        .fi:focus {
          border-color: rgba(0,229,255,0.22);
          background: rgba(0,229,255,0.03);
          box-shadow: 0 0 0 3px rgba(0,180,216,0.05);
        }
        textarea.fi { resize: none; line-height: 1.6; }

        .char-count { text-align: right; font-size: 11px; color: #334155; margin-top: 5px; }

        .dropzone {
          border: 1.5px dashed rgba(0,229,255,0.1);
          border-radius: 10px; padding: 28px 20px;
          text-align: center; cursor: pointer;
          transition: all 0.2s; background: #0C1525;
        }
        .dropzone:hover, .dropzone.active {
          border-color: rgba(0,229,255,0.25); background: rgba(0,229,255,0.03);
        }
        .dz-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: rgba(0,229,255,0.06); border: 1px solid rgba(0,229,255,0.1);
          display: flex; align-items: center; justify-content: center; margin: 0 auto 10px;
        }
        .dz-text { font-size: 13px; color: #64748B; margin-bottom: 3px; }
        .dz-sub  { font-size: 11px; color: #334155; }

        .previews { display: grid; grid-template-columns: repeat(5,1fr); gap: 8px; margin-top: 10px; }
        .prev-item {
          position: relative; border-radius: 8px; overflow: hidden;
          border: 1px solid rgba(0,229,255,0.08); aspect-ratio: 1;
        }
        .prev-item img { width: 100%; height: 100%; object-fit: cover; }
        .prev-placeholder {
          width: 100%; height: 100%; background: #0C1525;
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 4px; font-size: 10px; color: #475569; padding: 8px;
        }
        .prev-remove {
          position: absolute; top: 4px; right: 4px;
          width: 18px; height: 18px; border-radius: 50%;
          background: rgba(239,68,68,0.9); border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 11px; opacity: 0; transition: opacity 0.2s;
        }
        .prev-item:hover .prev-remove { opacity: 1; }

        .toggle-row {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 14px 16px; background: #0C1525;
          border: 1px solid rgba(0,229,255,0.07);
          border-radius: 10px; cursor: pointer; transition: border-color 0.2s;
        }
        .toggle-row:hover { border-color: rgba(0,229,255,0.15); }
        .toggle-switch { position: relative; flex-shrink: 0; margin-top: 1px; }
        .toggle-switch input { display: none; }
        .toggle-track {
          width: 36px; height: 20px; border-radius: 10px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.2s; display: block; cursor: pointer; position: relative;
        }
        .toggle-switch input:checked + .toggle-track {
          background: rgba(0,180,216,0.35); border-color: rgba(0,229,255,0.4);
        }
        .toggle-knob {
          position: absolute; top: 2px; left: 2px;
          width: 16px; height: 16px; border-radius: 50%;
          background: #fff; transition: transform 0.2s; pointer-events: none;
        }
        .toggle-switch input:checked ~ .toggle-knob { transform: translateX(16px); }
        .toggle-info { flex: 1; }
        .toggle-title { font-size: 13px; font-weight: 500; color: #E2E8F0; margin-bottom: 2px; }
        .toggle-desc  { font-size: 11.5px; color: #475569; line-height: 1.5; }

        .form-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,229,255,0.08), transparent);
          margin: 24px 0;
        }

        .submit-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .submit-hint { font-size: 12px; color: #475569; }
        .submit-hint span {
          color: #00E5FF; font-weight: 500;
          background: rgba(0,229,255,0.08); padding: 2px 8px;
          border-radius: 6px; border: 1px solid rgba(0,229,255,0.15);
        }

        .btn-submit {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 24px;
          background: rgba(0,180,216,0.1);
          border: 1px solid rgba(0,229,255,0.25);
          border-radius: 100px; color: #00E5FF;
          font-size: 13.5px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          position: relative; overflow: hidden;
          transition: all 0.22s cubic-bezier(0.16,1,0.3,1);
        }
        .btn-submit::before {
          content: ''; position: absolute; top:0; left:-100%; width:100%; height:100%;
          background: linear-gradient(90deg, transparent, rgba(0,229,255,0.08), transparent);
          animation: sh 3s ease-in-out infinite;
        }
        @keyframes sh { 0%{left:-100%} 50%,100%{left:100%} }
        .btn-submit:hover:not(:disabled) {
          background: rgba(0,180,216,0.18); border-color: rgba(0,229,255,0.5);
          color: #fff; transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(0,180,216,0.18);
        }
        .btn-submit:disabled { opacity:0.4; cursor:not-allowed; }

        .spin {
          width:14px; height:14px;
          border:1.5px solid rgba(0,229,255,0.3); border-top-color:#00E5FF;
          border-radius:50%; animation:sp 0.7s linear infinite;
        }
        @keyframes sp { to{transform:rotate(360deg)} }
      `}</style>

      <div className="nc">
        <div className="nc-head">
          <div className="nc-title">Raise a complaint</div>
          <div className="nc-sub">Describe your issue clearly. Our AI will auto-prioritize and notify the right team.</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="fg">
            <div className="fl">Category <span className="fl-req">*</span></div>
            <div className="cat-grid">
              {CATEGORIES.map(cat => (
                <button key={cat.value} type="button"
                  className={`cat-btn ${form.category === cat.value ? 'sel' : ''}`}
                  onClick={() => setForm({...form, category: cat.value})}>
                  {cat.icon}{cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-divider"/>

          <div className="fg">
            <label className="fl">Title <span className="fl-req">*</span></label>
            <input type="text" className="fi"
              placeholder="e.g. Water leakage near electrical panel in C-Block"
              value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              maxLength={120} required />
            <div className="char-count">{form.title.length}/120</div>
          </div>

          <div className="fg">
            <label className="fl">Description <span className="fl-req">*</span></label>
            <textarea className="fi" rows={5}
              placeholder="Describe the issue in detail. Include when it started, how severe it is, and any safety concerns..."
              value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              maxLength={2000} required />
            <div className="char-count">{form.description.length}/2000</div>
          </div>

          <div className="fg">
            <label className="fl">Location <span className="fl-opt">(optional but recommended)</span></label>
            <input type="text" className="fi"
              placeholder="e.g. A-Block, Room 214 / Hostel C Ground Floor"
              value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
          </div>

          <div className="fg">
            <label className="fl">Attach evidence <span className="fl-opt">(images / video, max 5 files, 20 MB each)</span></label>
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} />
              <div className="dz-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div className="dz-text">{isDragActive ? 'Drop files here...' : 'Drag and drop files here, or click to browse'}</div>
              <div className="dz-sub">PNG, JPG, MP4 — max 20 MB per file</div>
            </div>
            {previews.length > 0 && (
              <div className="previews">
                {previews.map((p, i) => (
                  <div className="prev-item" key={i}>
                    {p.url ? <img src={p.url} alt={p.name}/> : (
                      <div className="prev-placeholder">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round">
                          <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                        </svg>
                        <span>video</span>
                      </div>
                    )}
                    <button type="button" className="prev-remove" onClick={() => removeFile(i)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="fg">
            <label className="toggle-row">
              <div className="toggle-switch">
                <input type="checkbox" checked={form.isAnonymous}
                  onChange={e => setForm({...form, isAnonymous: e.target.checked})} />
                <span className="toggle-track"/>
                <span className="toggle-knob"/>
              </div>
              <div className="toggle-info">
                <div className="toggle-title">Submit anonymously</div>
                <div className="toggle-desc">Your identity won't be visible to other students. Admins can still see it for accountability.</div>
              </div>
            </label>
          </div>

          <div className="form-divider"/>

          <div className="submit-row">
            <div className="submit-hint">
              {form.category ? <>Category: <span>{form.category}</span></> : 'Select a category to continue'}
            </div>
            <button type="submit" className="btn-submit" disabled={isPending || !form.category}>
              {isPending ? <><div className="spin"/> Submitting...</> : <>
                Submit complaint
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </>}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}