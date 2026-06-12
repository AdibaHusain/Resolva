import { useState, useEffect } from 'react'
import Layout from '../../components/shared/Layout'
import api from '../../api/axiosInstance'
import toast from 'react-hot-toast'
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'

const CATEGORY_LABELS = {
  electrical:'Electrical', plumbing:'Plumbing', wifi:'WiFi / Network',
  hostel:'Hostel', academic:'Academic', food:'Food & Mess',
  safety:'Safety', event:'Event', other:'Other',
}

const STATUS_COLORS = {
  open: '#F59E0B', assigned: '#60A5FA',
  in_progress: '#8B5CF6', resolved: '#10B981',
  verified: '#10B981', rejected: '#EF4444',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1C212B',
      border: '1px solid #2A3140',
      borderRadius: '10px',
      padding: '10px 14px',
      fontSize: '12px',
    }}>
      {label && <div style={{ color: '#94A3B8', marginBottom: '6px', fontSize: '11px' }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, flexShrink: 0 }}/>
          <span style={{ color: '#94A3B8' }}>{p.name}:</span>
          <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function Analytics() {
  const [vis, setVis]         = useState(false)
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod]   = useState(14)

  useEffect(() => {
    setTimeout(() => setVis(true), 60)
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const [statsRes, complaintsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/complaints', { params: { limit: 200 } }),
      ])
      const stats      = statsRes.data.data
      const complaints = complaintsRes.data.data.complaints

      // Category data
      const catMap = {}
      complaints.forEach(c => { catMap[c.category] = (catMap[c.category] || 0) + 1 })
      const categoryData = Object.entries(catMap)
        .map(([k, v]) => ({ name: CATEGORY_LABELS[k] || k, value: v, short: k }))
        .sort((a, b) => b.value - a.value)

      // Status data
      const statusMap = {}
      complaints.forEach(c => { statusMap[c.status] = (statusMap[c.status] || 0) + 1 })
      const statusData = Object.entries(statusMap).map(([k, v]) => ({
        name: k.replace('_', ' '),
        value: v,
        color: STATUS_COLORS[k] || '#94A3B8',
      }))

      // Priority data
      const priorityData = [
        { name: 'Critical', value: complaints.filter(c => c.priority === 'critical').length, color: '#EF4444' },
        { name: 'High',     value: complaints.filter(c => c.priority === 'high').length,     color: '#F59E0B' },
        { name: 'Medium',   value: complaints.filter(c => c.priority === 'medium').length,   color: '#60A5FA' },
        { name: 'Low',      value: complaints.filter(c => c.priority === 'low').length,      color: '#94A3B8' },
      ]

      // Daily data
      const dailyMap = {}
      const now = Date.now()
      for (let i = 13; i >= 0; i--) {
        const d   = new Date(now - i * 86400000)
        const key = `${d.getMonth() + 1}/${d.getDate()}`
        dailyMap[key] = { date: key, submitted: 0, resolved: 0 }
      }
      complaints.forEach(c => {
        const d   = new Date(c.createdAt)
        const key = `${d.getMonth() + 1}/${d.getDate()}`
        if (dailyMap[key]) dailyMap[key].submitted++
        if (c.resolvedAt) {
          const rd   = new Date(c.resolvedAt)
          const rkey = `${rd.getMonth() + 1}/${rd.getDate()}`
          if (dailyMap[rkey]) dailyMap[rkey].resolved++
        }
      })
      const dailyData = Object.values(dailyMap)

      // Severity per category
      const sevMap = {}
      complaints.forEach(c => {
        if (!sevMap[c.category]) sevMap[c.category] = []
        sevMap[c.category].push(c.severityScore)
      })
      const severityData = Object.entries(sevMap)
        .map(([k, v]) => ({
          name: CATEGORY_LABELS[k] || k,
          avg:  Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10,
        }))
        .sort((a, b) => b.avg - a.avg)

      const total   = complaints.length
      const resolved = complaints.filter(c => ['resolved', 'verified'].includes(c.status)).length
      const resRate  = total ? Math.round((resolved / total) * 100) : 0
      const breached = complaints.filter(c => c.slaBreach).length

      // Recent complaints for table
      const recent = complaints.slice(0, 8)

      setData({ stats, categoryData, statusData, priorityData, dailyData, severityData, total, resolved, resRate, breached, recent })
    } catch (err) {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <Layout>
      <div style={{ padding: '28px 32px' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ height: 28, width: 160, borderRadius: 8, background: '#18201C', marginBottom: 8, animation: 'sk 1.4s ease-in-out infinite' }}/>
          <div style={{ height: 16, width: 240, borderRadius: 6, background: '#18201C', animation: 'sk 1.4s ease-in-out infinite' }}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          {Array.from({length:4}).map((_,i) => <div key={i} style={{height:100,borderRadius:12,background:'#18201C',animation:'sk 1.4s ease-in-out infinite'}}/>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {Array.from({length:4}).map((_,i) => <div key={i} style={{height:280,borderRadius:14,background:'#18201C',animation:'sk 1.4s ease-in-out infinite'}}/>)}
        </div>
        <style>{`@keyframes sk{0%,100%{opacity:.5}50%{opacity:1}}`}</style>
      </div>
    </Layout>
  )

  if (!data) return null

  return (
    <Layout>
      <style>{`
        @keyframes sk { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .an { padding: 28px 32px; min-height: 100vh; }

        /* Header */
        .an-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 24px;
          animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        .an-title { font-size: 20px; font-weight: 600; color: #FFFFFF; letter-spacing: -0.3px; }
        .an-sub   { font-size: 13px; color: #94A3B8; margin-top: 2px; }
        .an-badge {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 8px;
          background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.15);
          font-size: 11.5px; font-weight: 500; color: #10B981;
        }
        .an-live-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #10B981; animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        /* KPI row */
        .kpi-row {
          display: grid; grid-template-columns: repeat(4,1fr);
          gap: 12px; margin-bottom: 20px;
          animation: fadeUp 0.6s 0.06s cubic-bezier(0.16,1,0.3,1) both;
        }
        .kpi {
          background: #18201C; border: 1px solid #263238;
          border-radius: 14px; padding: 18px 20px;
          position: relative; overflow: hidden;
          transition: border-color 0.2s, transform 0.2s;
          cursor: default;
        }
        .kpi:hover { border-color: rgba(16,185,129,0.2); transform: translateY(-2px); }
        .kpi-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
        .kpi-icon {
          width: 34px; height: 34px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.04); border: 1px solid #263238;
        }
        .kpi-trend {
          font-size: 10.5px; font-weight: 500;
          padding: 2px 7px; border-radius: 20px;
        }
        .kpi-num {
          font-size: 30px; font-weight: 700;
          letter-spacing: -1.5px; line-height: 1;
          margin-bottom: 4px;
        }
        .kpi-label { font-size: 12px; color: #94A3B8; font-weight: 400; }
        .kpi-bar {
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 2px;
        }

        /* Charts 2-col */
        .grid-2 {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 14px; margin-bottom: 14px;
          animation: fadeUp 0.6s 0.12s cubic-bezier(0.16,1,0.3,1) both;
        }
        .grid-3 {
          display: grid; grid-template-columns: 2fr 1fr;
          gap: 14px; margin-bottom: 14px;
          animation: fadeUp 0.6s 0.18s cubic-bezier(0.16,1,0.3,1) both;
        }

        .chart-card {
          background: #18201C; border: 1px solid #263238;
          border-radius: 14px; padding: 18px 20px;
          transition: border-color 0.2s;
        }
        .chart-card:hover { border-color: rgba(255,255,255,0.08); }

        .cc-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
        .cc-title { font-size: 13px; font-weight: 600; color: #FFFFFF; margin-bottom: 2px; }
        .cc-sub   { font-size: 11px; color: #94A3B8; }
        .cc-badge {
          font-size: 10px; padding: 2px 8px; border-radius: 20px;
          background: rgba(255,255,255,0.04); border: 1px solid #263238;
          color: #94A3B8; white-space: nowrap;
        }

        /* Category list */
        .cat-list { display: flex; flex-direction: column; gap: 10px; }
        .cat-row { display: flex; align-items: center; gap: 10px; }
        .cat-name { font-size: 12px; color: #FFFFFF; min-width: 110px; font-weight: 400; }
        .cat-bar-track {
          flex: 1; height: 5px; border-radius: 3px;
          background: rgba(255,255,255,0.06); overflow: hidden;
        }
        .cat-bar-fill { height: 100%; border-radius: 3px; transition: width 0.8s ease; }
        .cat-val { font-size: 11px; color: #94A3B8; min-width: 24px; text-align: right; font-weight: 500; }

        /* Recent table */
        .rec-table { width: 100%; border-collapse: collapse; }
        .rec-table th {
          text-align: left; font-size: 10.5px; font-weight: 500;
          color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px;
          padding: 0 0 10px; border-bottom: 1px solid #263238;
        }
        .rec-table td {
          padding: 10px 0; border-bottom: 1px solid rgba(38,50,56,0.6);
          font-size: 12px; vertical-align: middle;
        }
        .rec-table tr:last-child td { border-bottom: none; }
        .rec-title {
          color: #FFFFFF; font-weight: 500; max-width: 180px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .rec-badge {
          font-size: 9.5px; font-weight: 500;
          padding: 2px 7px; border-radius: 20px; border: 1px solid;
          white-space: nowrap;
        }

        /* Priority donut legend */
        .donut-legend { display: flex; flex-direction: column; gap: 8px; }
        .dl-row { display: flex; align-items: center; justify-content: space-between; }
        .dl-left { display: flex; align-items: center; gap: 8px; }
        .dl-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .dl-name { font-size: 12px; color: #94A3B8; }
        .dl-val  { font-size: 12px; font-weight: 600; color: #FFFFFF; }

        .full-row {
          animation: fadeUp 0.6s 0.22s cubic-bezier(0.16,1,0.3,1) both;
          margin-bottom: 14px;
        }
      `}</style>

      <div className="an">

        {/* Header */}
        <div className="an-header">
          <div>
            <div className="an-title">Analytics</div>
            <div className="an-sub">Complaint performance and resolution insights</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="an-badge">
              <div className="an-live-dot"/>
              Live data
            </div>
            <button
              onClick={fetchAnalytics}
              style={{
                padding: '6px 12px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid #263238', color: '#94A3B8',
                fontSize: '12px', cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                display: 'flex', alignItems: 'center', gap: '5px',
                transition: 'all 0.18s',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* KPI row */}
        <div className="kpi-row">
          {[
            {
              label: 'Total Complaints', num: data.total, color: '#10B981',
              trend: '+12%', trendUp: true,
              icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.6" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            },
            {
              label: 'Resolved', num: data.resolved, color: '#22C55E',
              trend: `${data.resRate}% rate`, trendUp: true,
              icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.6" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            },
            {
              label: 'Critical Open', num: data.stats.critical, color: '#EF4444',
              trend: 'needs attention', trendUp: false,
              icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.6" strokeLinecap="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            },
            {
              label: 'SLA Breached', num: data.breached, color: '#F59E0B',
              trend: data.breached > 0 ? 'action needed' : 'all clear',
              trendUp: data.breached === 0,
              icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            },
          ].map((k, i) => (
            <div className="kpi" key={i}>
              <div className="kpi-top">
                <div className="kpi-icon">{k.icon}</div>
                <div className="kpi-trend" style={{
                  color: k.trendUp ? '#10B981' : '#F59E0B',
                  background: k.trendUp ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                  border: `1px solid ${k.trendUp ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                }}>
                  {k.trend}
                </div>
              </div>
              <div className="kpi-num" style={{ color: k.color }}>{k.num}</div>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-bar" style={{
                background: `linear-gradient(90deg, ${k.color}30, transparent)`,
              }}/>
            </div>
          ))}
        </div>

        {/* Row 1 — Area chart + Category list */}
        <div className="grid-3">
          <div className="chart-card">
            <div className="cc-head">
              <div>
                <div className="cc-title">Activity Trend</div>
                <div className="cc-sub">Submitted vs resolved — last 14 days</div>
              </div>
              <div className="cc-badge">14 days</div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.dailyData}>
                <defs>
                  <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10B981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#60A5FA" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(38,50,56,0.8)" vertical={false}/>
                <XAxis dataKey="date" tick={{ fill:'#94A3B8', fontSize:10 }} axisLine={false} tickLine={false} interval={2}/>
                <YAxis tick={{ fill:'#94A3B8', fontSize:10 }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="submitted" name="Submitted" stroke="#10B981" strokeWidth={2} fill="url(#gS)" dot={false}/>
                <Area type="monotone" dataKey="resolved"  name="Resolved"  stroke="#60A5FA" strokeWidth={2} fill="url(#gR)" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <div className="cc-head">
              <div>
                <div className="cc-title">By Category</div>
                <div className="cc-sub">Volume per type</div>
              </div>
            </div>
            <div className="cat-list">
              {data.categoryData.slice(0, 7).map((cat, i) => {
                const max = data.categoryData[0]?.value || 1
                const pct = Math.round((cat.value / max) * 100)
                const colors = ['#10B981','#60A5FA','#8B5CF6','#F59E0B','#EF4444','#34D399','#A78BFA']
                return (
                  <div className="cat-row" key={i}>
                    <div className="cat-name">{cat.name}</div>
                    <div className="cat-bar-track">
                      <div className="cat-bar-fill" style={{ width: `${pct}%`, background: colors[i % colors.length] }}/>
                    </div>
                    <div className="cat-val">{cat.value}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Row 2 — Priority donut + Severity bar + Status */}
        <div className="grid-2">

          <div className="chart-card">
            <div className="cc-head">
              <div>
                <div className="cc-title">Avg Severity by Category</div>
                <div className="cc-sub">AI-assigned scores (1–10)</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.severityData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(38,50,56,0.8)" vertical={false}/>
                <XAxis dataKey="name" tick={{ fill:'#94A3B8', fontSize:9 }} axisLine={false} tickLine={false}/>
                <YAxis domain={[0,10]} tick={{ fill:'#94A3B8', fontSize:10 }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="avg" name="Avg Score" radius={[4,4,0,0]}>
                  {data.severityData.map((entry, i) => {
                    const color = entry.avg >= 8 ? '#EF4444' : entry.avg >= 6 ? '#F59E0B' : entry.avg >= 4 ? '#60A5FA' : '#10B981'
                    return <Cell key={i} fill={color}/>
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <div className="cc-head">
              <div>
                <div className="cc-title">Priority Split</div>
                <div className="cc-sub">Distribution by urgency</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <ResponsiveContainer width={130} height={130}>
                <PieChart>
                  <Pie
                    data={data.priorityData}
                    cx="50%" cy="50%"
                    innerRadius={38} outerRadius={58}
                    paddingAngle={3} dataKey="value"
                    strokeWidth={0}
                  >
                    {data.priorityData.map((entry, i) => (
                      <Cell key={i} fill={entry.color}/>
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip/>}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-legend" style={{ flex: 1 }}>
                {data.priorityData.map((p, i) => (
                  <div className="dl-row" key={i}>
                    <div className="dl-left">
                      <div className="dl-dot" style={{ background: p.color }}/>
                      <div className="dl-name">{p.name}</div>
                    </div>
                    <div className="dl-val">{p.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent complaints table */}
        <div className="full-row">
          <div className="chart-card">
            <div className="cc-head">
              <div>
                <div className="cc-title">Recent Complaints</div>
                <div className="cc-sub">Latest submissions across campus</div>
              </div>
              <div className="cc-badge">{data.recent.length} shown</div>
            </div>
            <table className="rec-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th style={{ textAlign: 'right' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map(c => {
                  const prColor = { critical:'#EF4444', high:'#F59E0B', medium:'#60A5FA', low:'#94A3B8' }[c.priority] || '#94A3B8'
                  const stColor = STATUS_COLORS[c.status] || '#94A3B8'
                  return (
                    <tr key={c._id}>
                      <td>
                        <div className="rec-title">{c.title}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'capitalize' }}>
                          {CATEGORY_LABELS[c.category] || c.category}
                        </span>
                      </td>
                      <td>
                        <span className="rec-badge" style={{
                          color: stColor,
                          background: `${stColor}14`,
                          borderColor: `${stColor}35`,
                        }}>
                          {c.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span className="rec-badge" style={{
                          color: prColor,
                          background: `${prColor}14`,
                          borderColor: `${prColor}35`,
                        }}>
                          {c.priority}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{
                          fontSize: '12px', fontWeight: 600,
                          color: c.severityScore >= 8 ? '#EF4444' : c.severityScore >= 6 ? '#F59E0B' : '#10B981',
                        }}>
                          {c.severityScore}/10
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Layout>
  )
}