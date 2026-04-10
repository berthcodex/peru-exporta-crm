import { useState } from 'react'
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core'
import { COLS } from '../config'
import LeadCard from './LeadCard'
import styles from './Kanban.module.css'

function DroppableCol({ col, leads, onAction, acting, isOver }) {
  const { setNodeRef } = useDroppable({ id: col.id })
  return (
    <div className={styles.col}>
      <div className={styles.colHead} style={{ '--cc': col.color }}>
        <div className={styles.colDot} style={{ background: col.color }} />
        <span className={styles.colLabel}>{col.label}</span>
        <span className={styles.colCount}>{leads.length}</span>
      </div>
      <div ref={setNodeRef} className={`${styles.colBody} ${isOver ? styles.colBodyOver : ''}`}>
        {leads.length === 0
          ? <div className={`${styles.colEmpty} ${isOver ? styles.colEmptyOver : ''}`}>
              {isOver ? '↓ Soltar aquí' : 'Sin leads'}
            </div>
          : leads.map(lead => <LeadCard key={lead.phone} lead={lead} onAction={onAction} acting={acting} />)
        }
      </div>
    </div>
  )
}

export default function Kanban({ leads, onAction, onMover, acting }) {
  const [filtro, setFiltro] = useState('todos')
  const [activeId, setActiveId] = useState(null)
  const [overId, setOverId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } })
  )

  const urgentes = leads.filter(l => l.urgente).length
  const alta = leads.filter(l => l.prioridad === 'ALTA').length
  const tipoB = leads.filter(l => (l.perfil || '').includes('B')).length

  const filtrados = filtro === 'todos' ? leads
    : filtro === 'urgente' ? leads.filter(l => l.urgente)
    : filtro === 'alta' ? leads.filter(l => l.prioridad === 'ALTA')
    : leads.filter(l => (l.perfil || '').includes('B'))

  const activeLead = activeId ? leads.find(l => l.phone === activeId) : null

  function handleDragStart({ active }) { setActiveId(active.id) }
  function handleDragOver({ over }) { setOverId(over ? over.id : null) }

  function handleDragEnd({ active, over }) {
    setActiveId(null)
    setOverId(null)
    if (!over) return
    const lead = leads.find(l => l.phone === active.id)
    if (!lead) return
    const col = COLS.find(c => c.id === over.id)
    if (col && !col.estados.includes(lead.estado)) {
      onMover(lead.phone, lead.fila, col.estados[0])
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.filterbar}>
        <span className={styles.fbLabel}>Ver</span>
        {[
          { id: 'todos', label: `Todos (${leads.length})` },
          { id: 'urgente', label: `🔥 Urgentes (${urgentes})` },
          { id: 'alta', label: `⚡ Alta (${alta})` },
          { id: 'tipoB', label: `Tipo B (${tipoB})` },
        ].map(f => (
          <button key={f.id} className={`${styles.fil} ${filtro===f.id?styles.filActive:''}`} onClick={() => setFiltro(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className={styles.board}>
          {COLS.map(col => (
            <DroppableCol
              key={col.id}
              col={col}
              leads={filtrados.filter(l => col.estados.includes(l.estado))}
              onAction={onAction}
              acting={acting}
              isOver={overId === col.id}
            />
          ))}
        </div>

        <DragOverlay>
          {activeLead && (
            <div className={styles.overlay}>
              <div className={styles.overlayCard}>
                <div className={styles.overlayName}>{activeLead.nombre}</div>
                <div className={styles.overlaySub}>{activeLead.producto} · {activeLead.minFmt}</div>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
