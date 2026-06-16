import { useState, useEffect, useRef } from 'react'
import Layout from '../../components/shared/Layout'
import api from '../../api/axiosInstance'
import toast from 'react-hot-toast'

const CATEGORY_COLORS = {
  electrical: '#EF4444',
  plumbing:   '#F59E0B',
  wifi:       '#00E5FF',
  hostel:     '#8B5CF6',
  academic:   '#10B981',
  food:       '#F97316',
  safety:     '#EF4444',
  event:      '#6366F1',
  other:      '#94A3B8',
}

const CAMPUS_ZONES = [
  { id: 'hostel-a',    label: 'Hostel A',       x: 8,  y: 12, w: 18, h: 22 },
  { id: 'hostel-b',    label: 'Hostel B',       x: 30, y: 12, w: 18, h: 22 },
  { id: 'hostel-c',    label: 'Hostel C',       x: 52, y: 12, w: 18, h: 22 },
  { id: 'main-block',  label: 'Main Block',     x: 8,  y: 42, w: 42, h: 28 },
  { id: 'lab-block',   label: 'Lab Block',      x: 55, y: 42, w: 22, h: 28 },
  { id: 'mess',        label: 'Mess & Canteen', x: 8,  y: 76, w: 25, h: 16 },
  { id: 'sports',      label: 'Sports Ground',  x: 38, y: 76, w: 22, h: 16 },
  { id: 'admin-block', label: 'Admin Block',    x: 65, y: 76, w: 20, h: 16 },
]

export default function Heatmap() {
  const [vis, setVis]               = useState(false)
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading]       = useState(true)
  const [activeZone, setActiveZone] = useState(null)
  const [filterCat, setFilterCat]   = useState('all')
  const [hoveredZone, setHoveredZone] = useState(null)

  useEffect(() => {
    setTimeout(() => setVis(true), 60)
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/complaints', { params: { limit: 200 } })
      setComplaints(data.data.complaints)
    } catch { toast.error('Failed to load data') }
    finally  { setLoading(false) }
  }

  // Map complaints to zones by location keywords
  const getZoneComplaints = (zone) => {
    const keywords = {
      'hostel-a':    ['hostel a', 'block a', 'a block', 'a-block'],
      'hostel-b':    ['hostel b', 'block b', 'b block', 'b-block'],
      'hostel-c':    ['hostel c', 'block c', 'c block', 'c-block'],
      'main-block':  ['main block', 'classroom', 'lecture', 'room', 'corridor'],
      'lab-block':   ['lab', 'laboratory', 'computer', 'workshop'],
      'mess':        ['mess', 'canteen', 'food', 'dining'],
      'sports':      ['sports', 'ground', 'field', 'gym'],
      'admin-block': ['admin', 'office', 'administration'],
    }
    const kws = keywords[zone.id] || []
    return complaints.filter(c => {
      const text = `${c.title} ${c.description} ${c.location || ''}`.toLowerCase()
      const matchesZone = kws.some(k => text.includes(k))
      const matchesCat  = filterCat === 'all' || c.category === filterCat
      return matchesZone && matchesCat
    })
  }

  const getHeatColor = (count, max) => {
    if (count === 0) return 'rgba(0,229,255,0.03)'
    const intensity = Math.min(count / Math.max(max, 1), 1)
    if (intensity < 0.33) return `rgba(0,229,255,${0.08 + intensity * 0.15})`
    if (intensity < 0.66) return `rgba(245,158,11,${0.12 + intensity * 0.2})`
    return `rgba(239,68,68,${0.15 + intensity * 0.25})`
  }

  const getHeatBorder = (count, max) => {
    if (count === 0) return 'rgba(0,229,255,0.08)'
    const intensity = Math.min(count / Math.max(max, 1), 1)
    if (intensity < 0.33) return 'rgba(0,229,255,0.25)'
    if (intensity < 0.66) return 'rgba(245,158,11,0.4)'
    return 'rgba(239,68,68,0.5)'
  }

  const zoneData   = CAMPUS_ZONES.map(z => ({ ...z, complaints: getZoneComplaints(z) }))
  const maxCount   = Math.max(...zoneData.map(z => z.complaints.length), 1)
  const totalShown = zoneData.reduce((a, z) => a + z.complaints.length, 0)

  const CATEGORIES = ['all','electrical','plumbing','wifi','hostel','academic','food','safety','event','other']

  const selectedZoneData = activeZone ? zoneData.find(z => z.id === activeZone) : null

  return (
    <Layout>
      <style>{`
        .hm { padding: 28px 32px; min-height: 100vh; }

        .hm-head {
          display: flex; align-items: flex-end;
          justify-content: space-between; margin-bottom: 20px;
          opacity: 0; transform: translateY(10px);
          transition: all 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        .hm-head.v { opacity:1; transform:translateY(0); }
        .hm-title { font-size: 20px; font-weight: 600; color: #FFFFFF; letter-spacing: -0.3px; }
        .hm-sub   { font-size: 13px; color: #94A3B8; margin-top: 3px; }

        .hm-filters {
          display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 16px;
          opacity: 0; transform: translateY(8px);
          transition: all 0.6s 0.06s cubic-bezier(0.16,1,0.3,1);
        }
        .hm-filters.v { opacity:1; transform:translateY(0); }
        .hm-filter {
          padding: 5px 12px; border-radius: 20px;
          font-size: 11px; font-weight: 500;
          border: 1px solid rgba(0,229,255,0.1);
          background: transparent; color: #94A3B8;
          cursor: pointer; transition: all 0.18s;
          text-transform: capitalize;
          font-family: 'DM Sans', sans-serif;
        }
        .hm-filter:hover { color: #FFFFFF; border-color: rgba(0,229,255,0.25); }
        .hm-filter.active {
          background: rgba(0,229,255,0.1);
          border-color: rgba(0,229,255,0.3); color: #00E5FF;
        }

        .hm-body {
          display: grid; grid-template-columns: 1fr 300px;
          gap: 16px;
          opacity: 0; transform: translateY(12px);
          transition: all 0.6s 0.1s cubic-bezier(0.16,1,0.3,1);
        }
        .hm-body.v { opacity:1; transform:translateY(0); }

        /* Campus map */
        .campus-map {
          background: #111827;
          border: 1px solid rgba(0,229,255,0.08);
          border-radius: 16px; padding: 20px;
          position: relative;
        }
        .map-title {
          font-size: 11px; font-weight: 500;
          color: rgba(0,229,255,0.45); text-transform: uppercase;
          letter-spacing: 0.8px; margin-bottom: 14px;
        }
        .map-area {
          position: relative; width: 100%;
          padding-top: 60%; /* aspect ratio */
          background: rgba(0,229,255,0.02);
          border: 1px solid rgba(0,229,255,0.06);
          border-radius: 12px; overflow: hidden;
        }
        .map-inner {
          position: absolute; inset: 8px;
        }
        .zone-block {
          position: absolute;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex; align-items: center; justify-content: center;
          flex-direction: column;
          border: 1px solid;
        }
        .zone-block:hover { transform: scale(1.02); z-index: 10; }
        .zone-label {
          font-size: 9px; font-weight: 600;
          color: rgba(255,255,255,0.7);
          text-align: center; letter-spacing: 0.3px;
          line-height: 1.3;
        }
        .zone-count {
          font-size: 11px; font-weight: 700;
          color: #FFFFFF; margin-top: 2px;
        }

        /* Legend */
        .map-legend {
          display: flex; align-items: center; gap: 16px;
          margin-top: 14px; flex-wrap: wrap;
        }
        .legend-item { display: flex; align-items: center; gap: 6px; }
        .legend-dot {
          width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0;
        }
        .legend-lbl { font-size: 10.5px; color: #94A3B8; }

        /* Right panel */
        .hm-panel { display: flex; flex-direction: column; gap: 12px; }

        .hm-card {
          background: #111827;
          border: 1px solid rgba(0,229,255,0.08);
          border-radius: 14px; padding: 16px 18px;
        }
        .hm-card-title {
          font-size: 11px; font-weight: 500;
          color: rgba(0,229,255,0.45); text-transform: uppercase;
          letter-spacing: 0.8px; margin-bottom: 12px;
        }

        /* Stats */
        .stat-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .stat-row:last-child { margin-bottom: 0; }
        .stat-row-lbl { font-size: 12px; color: #94A3B8; }
        .stat-row-val { font-size: 12px; font-weight: 600; color: #FFFFFF; }

        /* Zone detail */
        .zone-detail-name {
          font-size: 15px; font-weight: 600;
          color: #FFFFFF; margin-bottom: 12px;
        }
        .complaint-mini {
          display: flex; align-items: flex-start; gap: 8px;
          padding: 8px 0; border-bottom: 1px solid rgba(0,229,255,0.05);
        }
        .complaint-mini:last-child { border-bottom: none; }
        .cmi-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
        .cmi-title { font-size: 11.5px; color: #FFFFFF; font-weight: 500; margin-bottom: 2px; line-height: 1.3; }
        .cmi-meta  { font-size: 10px; color: #94A3B8; }

        /* Empty zone */
        .zone-empty {
          text-align: center; padding: 20px;
          font-size: 12px; color: #94A3B8;
        }
      `}</style>

      <div className="hm">

        <div className={`hm-head ${vis ? 'v' : ''}`}>
          <div>
            <div className="hm-title">Campus Heatmap</div>
            <div className="hm-sub">Complaint density across campus zones</div>
          </div>
          <div style={{ fontSize:12, color:'#94A3B8' }}>
            {totalShown} complaint{totalShown !== 1 ? 's' : ''} mapped
          </div>
        </div>

        {/* Category filters */}
        <div className={`hm-filters ${vis ? 'v' : ''}`}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`hm-filter ${filterCat === c ? 'active' : ''}`}
              onClick={() => setFilterCat(c)}
            >
              {c === 'all' ? 'All categories' : c}
            </button>
          ))}
        </div>

        <div className={`hm-body ${vis ? 'v' : ''}`}>

          {/* Campus map */}
          <div className="campus-map">
            <div className="map-title">Campus Layout — Click a zone to inspect</div>
            <div className="map-area">
              <div className="map-inner">
                {zoneData.map(zone => {
                  const count    = zone.complaints.length
                  const bg       = getHeatColor(count, maxCount)
                  const border   = getHeatBorder(count, maxCount)
                  const isActive = activeZone === zone.id
                  const isHover  = hoveredZone === zone.id
                  return (
                    <div
                      key={zone.id}
                      className="zone-block"
                      style={{
                        left:   `${zone.x}%`,
                        top:    `${zone.y}%`,
                        width:  `${zone.w}%`,
                        height: `${zone.h}%`,
                        background: bg,
                        borderColor: isActive ? '#00E5FF' : border,
                        boxShadow: isActive
                          ? '0 0 0 2px rgba(0,229,255,0.3), 0 8px 24px rgba(0,0,0,0.3)'
                          : count > 0
                            ? `0 0 ${count * 4}px ${border}`
                            : 'none',
                      }}
                      onClick={() => setActiveZone(activeZone === zone.id ? null : zone.id)}
                      onMouseEnter={() => setHoveredZone(zone.id)}
                      onMouseLeave={() => setHoveredZone(null)}
                    >
                      <div className="zone-label">{zone.label}</div>
                      {count > 0 && <div className="zone-count">{count}</div>}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="map-legend">
              {[
                { color: 'rgba(0,229,255,0.2)',   label: 'Low (1–2)'   },
                { color: 'rgba(245,158,11,0.3)',  label: 'Medium (3–5)'},
                { color: 'rgba(239,68,68,0.4)',   label: 'High (6+)'   },
              ].map((l, i) => (
                <div className="legend-item" key={i}>
                  <div className="legend-dot" style={{ background: l.color, border: '1px solid rgba(255,255,255,0.1)' }}/>
                  <div className="legend-lbl">{l.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div className="hm-panel">

            {/* Overview stats */}
            <div className="hm-card">
              <div className="hm-card-title">Overview</div>
              {[
                { lbl: 'Total mapped',  val: totalShown },
                { lbl: 'Active zones',  val: zoneData.filter(z => z.complaints.length > 0).length },
                { lbl: 'Hottest zone',  val: zoneData.sort((a,b) => b.complaints.length - a.complaints.length)[0]?.label || '—' },
                { lbl: 'Filter active', val: filterCat === 'all' ? 'None' : filterCat },
              ].map((s, i) => (
                <div className="stat-row" key={i}>
                  <div className="stat-row-lbl">{s.lbl}</div>
                  <div className="stat-row-val" style={{ textTransform:'capitalize' }}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* Zone breakdown */}
            <div className="hm-card">
              <div className="hm-card-title">Zone Breakdown</div>
              {[...zoneData].sort((a,b) => b.complaints.length - a.complaints.length).map(zone => {
                const pct = Math.round((zone.complaints.length / Math.max(totalShown, 1)) * 100)
                return (
                  <div
                    key={zone.id}
                    style={{
                      marginBottom: 10, cursor:'pointer',
                      padding: '6px 8px', borderRadius: 7,
                      background: activeZone === zone.id ? 'rgba(0,229,255,0.06)' : 'transparent',
                      transition: 'background 0.18s',
                    }}
                    onClick={() => setActiveZone(activeZone === zone.id ? null : zone.id)}
                  >
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ fontSize:12, color: activeZone === zone.id ? '#00E5FF' : '#FFFFFF', fontWeight:500 }}>{zone.label}</span>
                      <span style={{ fontSize:11, color:'#94A3B8' }}>{zone.complaints.length}</span>
                    </div>
                    <div style={{ height:3, borderRadius:2, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                      <div style={{
                        height:'100%', borderRadius:2,
                        width: `${pct}%`,
                        background: zone.complaints.length === 0 ? 'transparent'
                          : pct > 60 ? '#EF4444' : pct > 30 ? '#F59E0B' : '#00E5FF',
                        transition: 'width 0.8s ease',
                      }}/>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Selected zone detail */}
            {selectedZoneData && (
              <div className="hm-card">
                <div className="hm-card-title">
                  {selectedZoneData.label}
                  <span style={{
                    marginLeft:'auto', fontSize:10,
                    color:'#94A3B8', fontWeight:400,
                  }}>
                    {selectedZoneData.complaints.length} complaint{selectedZoneData.complaints.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {selectedZoneData.complaints.length === 0
                  ? <div className="zone-empty">No complaints in this zone</div>
                  : selectedZoneData.complaints.slice(0,6).map(c => (
                      <div className="complaint-mini" key={c._id}>
                        <div className="cmi-dot" style={{ background: CATEGORY_COLORS[c.category] || '#94A3B8' }}/>
                        <div>
                          <div className="cmi-title">{c.title}</div>
                          <div className="cmi-meta">
                            {c.category} · {c.status.replace('_',' ')} · {c.priority}
                          </div>
                        </div>
                      </div>
                    ))
                }
                {selectedZoneData.complaints.length > 6 && (
                  <div style={{ fontSize:11, color:'#94A3B8', marginTop:8, textAlign:'center' }}>
                    +{selectedZoneData.complaints.length - 6} more
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}