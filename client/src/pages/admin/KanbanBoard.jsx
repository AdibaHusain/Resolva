import { useState, useEffect } from 'react'
import {
  DndContext, DragOverlay, PointerSensor,
  useSensor, useSensors, closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Layout from '../../components/shared/Layout'
import api from '../../api/axiosInstance'
import toast from 'react-hot-toast'

const COLUMNS = [
  { id: 'open',        label: 'Open',        color: '#F59E0B', bg: 'rgba(245,158,11,0.06)'  },
  { id: 'assigned',    label: 'Assigned',    color: '#00E5FF', bg: 'rgba(0,229,255,0.06)'   },
  { id: 'in_progress', label: 'In Progress', color: '#6366F1', bg: 'rgba(99,102,241,0.06)'  },
  { id: 'resolved',    label: 'Resolved',    color: '#0EA5E9', bg: 'rgba(14,165,233,0.06)'  },
]

const PRIORITY_CFG = {
  low:      { label: 'Low',      color: '#475569' },
  medium:   { label: 'Medium',   color: '#0EA5E9' },
  high:     { label: 'High',     color: '#F59E0B' },
  critical: { label: 'Critical', color: '#EF4444' },
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date)
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ── Single draggable card ─────────────────────────────────────────────────────
function KanbanCard({ complaint, isDragging }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: complaint._id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const pr = PRIORITY_CFG[complaint.priority] || PRIORITY_CFG.medium

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="k-card"
    >
      <style>{`
        .k-card {
          background: #0C1525;
          border: 1px solid rgba(0,229,255,0.08);
          border-radius: 10px;
          padding: 12px 14px;
          cursor: grab;
          transition: border-color 0.18s, box-shadow 0.18s;
          position: relative;
          overflow: hidden;
          user-select: none;
        }
        .k-card:hover {
          border-color: rgba(0,229,255,0.2);
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        }
        .k-card:active { cursor: grabbing; }
        .k-card::before {
          content: '';
          position: absolute; top:0; left:0; right:0; height:2px;
          background: var(--kc-color);
          opacity: 0.7;
        }
        .kc-title {
          font-size: 12.5px; font-weight: 500;
          color: #F1F5F9; line-height: 1.4;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .kc-row {
          display: flex; align-items: center;
          justify-content: space-between; gap: 6px;
        }
        .kc-badge {
          font-size: 9.5px; font-weight: 500;
          padding: 2px 7px; border-radius: 20px; border: 1px solid;
        }
        .kc-meta {
          display: flex; align-items: center; gap: 6px;
        }
        .kc-time  { font-size: 10px; color: #475569; }
        .kc-score { font-size: 10px; color: #475569; }
        .kc-loc {
          font-size: 10px; color: #475569;
          margin-top: 5px;
          display: flex; align-items: center; gap: 4px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .kc-sla {
          font-size: 9.5px; padding: 1px 6px; border-radius: 4px;
          font-weight: 500;
        }
        .kc-votes {
          display: flex; align-items: center; gap: 3px;
          font-size: 10px; color: #475569;
        }
      `}</style>

      <div style={{ '--kc-color': pr.color }}>
        <div className="kc-title">{complaint.title}</div>
        <div className="kc-row">
          <span className="kc-badge" style={{
            color: pr.color,
            background: `${pr.color}15`,
            borderColor: `${pr.color}30`,
          }}>
            {pr.label}
          </span>
          <div className="kc-meta">
            <span className="kc-time">{timeAgo(complaint.createdAt)}</span>
            <span className="kc-score">{complaint.severityScore}/10</span>
            {complaint.voteCount > 0 && (
              <div className="kc-votes">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/>
                </svg>
                {complaint.voteCount}
              </div>
            )}
          </div>
        </div>
        {complaint.location && (
          <div className="kc-loc">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {complaint.location}
          </div>
        )}
        {complaint.slaBreach && (
          <div style={{ marginTop:'6px' }}>
            <span className="kc-sla" style={{ color:'#EF4444', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)' }}>
              SLA Breach
            </span>
          </div>
        )}
        {complaint.aiReason && (
          <div style={{ marginTop:'6px', fontSize:'10px', color:'#00E5FF', display:'flex', alignItems:'center', gap:'3px' }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            AI analyzed
          </div>
        )}
      </div>
    </div>
  )
}

// ── Droppable column ──────────────────────────────────────────────────────────
function KanbanColumn({ column, cards, activeId }) {
  return (
    <div className="k-col">
      <style>{`
        .k-col {
          background: #080E1A;
          border: 1px solid rgba(0,229,255,0.06);
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          min-height: 500px;
          flex: 1;
          min-width: 220px;
          overflow: hidden;
        }
        .kc-head {
          padding: 14px 16px 12px;
          border-bottom: 1px solid rgba(0,229,255,0.06);
          display: flex; align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .kc-head-left {
          display: flex; align-items: center; gap: 8px;
        }
        .kc-dot {
          width: 8px; height: 8px; border-radius: 50%;
        }
        .kc-label {
          font-size: 12px; font-weight: 600;
          color: #F1F5F9; letter-spacing: 0.1px;
        }
        .kc-count {
          font-size: 10.5px; font-weight: 500;
          padding: 2px 7px; border-radius: 20px;
          background: rgba(0,229,255,0.06);
          color: #64748B; border: 1px solid rgba(0,229,255,0.1);
        }
        .kc-body {
          padding: 10px;
          display: flex; flex-direction: column; gap: 8px;
          flex: 1; overflow-y: auto;
        }
        .kc-body::-webkit-scrollbar { width: 3px; }
        .kc-body::-webkit-scrollbar-track { background: transparent; }
        .kc-body::-webkit-scrollbar-thumb { background: rgba(0,229,255,0.15); border-radius: 2px; }
        .kc-empty {
          flex: 1; display: flex; align-items: center;
          justify-content: center; padding: 24px 16px;
          font-size: 12px; color: #475569;
          border: 1.5px dashed rgba(0,229,255,0.08); border-radius: 10px;
          margin: 4px;
        }
      `}</style>

      <div className="kc-head">
        <div className="kc-head-left">
          <div className="kc-dot" style={{ background: column.color }}/>
          <span className="kc-label">{column.label}</span>
        </div>
        <span className="kc-count">{cards.length}</span>
      </div>

      <SortableContext
        items={cards.map(c => c._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="kc-body">
          {cards.length === 0
            ? <div className="kc-empty">No complaints</div>
            : cards.map(c => (
                <KanbanCard
                  key={c._id}
                  complaint={c}
                  isDragging={activeId === c._id}
                />
              ))
          }
        </div>
      </SortableContext>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function KanbanBoard() {
  const [vis, setVis]               = useState(false)
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading]       = useState(true)
  const [activeId, setActiveId]     = useState(null)
  const [activeCard, setActiveCard] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  useEffect(() => {
    setTimeout(() => setVis(true), 60)
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/complaints', { params: { limit: 100 } })
      setComplaints(data.data.complaints)
    } catch { toast.error('Failed to load complaints') }
    finally   { setLoading(false) }
  }

  const handleDragStart = ({ active }) => {
    setActiveId(active.id)
    setActiveCard(complaints.find(c => c._id === active.id))
  }

  const handleDragEnd = async ({ active, over }) => {
    setActiveId(null)
    setActiveCard(null)
    if (!over) return

    const draggedId = active.id
    const overId    = over.id
    const colIds    = COLUMNS.map(c => c.id)

    let targetStatus = colIds.includes(overId)
      ? overId
      : complaints.find(c => c._id === overId)?.status

    if (!targetStatus) return

    const card = complaints.find(c => c._id === draggedId)
    if (!card || card.status === targetStatus) return

    setComplaints(prev =>
      prev.map(c => c._id === draggedId ? { ...c, status: targetStatus } : c)
    )

    try {
      await api.patch(`/complaints/${draggedId}/status`, { status: targetStatus })
      toast.success(`Moved to ${targetStatus.replace('_', ' ')}`)
    } catch (err) {
      toast.error('Failed to update status')
      setComplaints(prev =>
        prev.map(c => c._id === draggedId ? { ...c, status: card.status } : c)
      )
    }
  }

  const columns = COLUMNS.map(col => ({
    ...col,
    cards: complaints.filter(c => c.status === col.id),
  }))

  return (
    <Layout>
      <style>{`
        .kb { padding: 28px 32px; min-height: 100vh; display: flex; flex-direction: column; background: #060B14; }

        .kb-head {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          opacity: 0; transform: translateY(10px);
          transition: all 0.6s cubic-bezier(0.16,1,0.3,1);
          flex-shrink: 0;
        }
        .kb-head.v { opacity:1; transform:translateY(0); }
        .kb-title { font-size: 20px; font-weight: 600; color: #F8FAFC; letter-spacing: -0.3px; }
        .kb-sub   { font-size: 13px; color: #64748B; margin-top: 2px; }

        .kb-refresh {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 16px;
          background: rgba(0,229,255,0.06);
          border: 1px solid rgba(0,229,255,0.2);
          border-radius: 8px; color: #00E5FF;
          font-size: 12px; font-weight: 500;
          cursor: pointer; transition: all 0.18s;
          font-family: 'DM Sans', sans-serif;
        }
        .kb-refresh:hover {
          background: rgba(0,229,255,0.12);
          border-color: rgba(0,229,255,0.4);
          box-shadow: 0 4px 16px rgba(0,229,255,0.1);
        }

        .kb-board {
          display: flex; gap: 12px;
          flex: 1; overflow-x: auto;
          padding-bottom: 16px;
          opacity: 0; transform: translateY(12px);
          transition: all 0.7s 0.1s cubic-bezier(0.16,1,0.3,1);
        }
        .kb-board.v { opacity:1; transform:translateY(0); }
        .kb-board::-webkit-scrollbar { height: 3px; }
        .kb-board::-webkit-scrollbar-track { background: transparent; }
        .kb-board::-webkit-scrollbar-thumb { background: rgba(0,229,255,0.15); border-radius: 2px; }

        .kb-loading {
          display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; flex: 1;
        }
        .kb-skel {
          background: #080E1A; border: 1px solid rgba(0,229,255,0.05);
          border-radius: 14px; height: 500px;
          animation: sk 1.4s ease-in-out infinite;
        }
        @keyframes sk { 0%,100%{opacity:.5} 50%{opacity:1} }

        .drag-overlay {
          opacity: 0.92;
          transform: rotate(2deg) scale(1.02);
          box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,229,255,0.1);
          cursor: grabbing;
        }
      `}</style>

      <div className="kb">

        <div className={`kb-head ${vis ? 'v' : ''}`}>
          <div>
            <div className="kb-title">Kanban Board</div>
            <div className="kb-sub">Drag complaints across columns to update status</div>
          </div>
          <button className="kb-refresh" onClick={fetchAll}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
            </svg>
            Refresh
          </button>
        </div>

        {loading
          ? (
            <div className="kb-loading">
              {Array.from({length:4}).map((_,i) => <div key={i} className="kb-skel"/>)}
            </div>
          )
          : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className={`kb-board ${vis ? 'v' : ''}`}>
                {columns.map(col => (
                  <KanbanColumn
                    key={col.id}
                    column={col}
                    cards={col.cards}
                    activeId={activeId}
                  />
                ))}
              </div>

              <DragOverlay>
                {activeCard && (
                  <div className="drag-overlay">
                    <KanbanCard complaint={activeCard} isDragging={false}/>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )
        }
      </div>
    </Layout>
  )
}