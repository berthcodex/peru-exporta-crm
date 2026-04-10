import { useState } from 'react'
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { COLS } from '../config'
import LeadCard from './LeadCard'
import styles from './Kanban.module.css'

function SortableCard({ lead, onAction, acting }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.phone })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0 : 1 }}
      {...attributes}
      {...listeners}
    >
      <LeadCard lead={lead} onAction={onAction} acting={acting} />
    </div>
  )
}

export default function Kanban({ leads, onAction, onMover, acting }) {
  const [filtro, setFiltro] = useState('todos')
  const [dragging, setDragging] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  )

  const urgentes = leads.filter(l => l.urgente).length
  const alta = leads.filter(l => l.prioridad === 'ALTA').length
  const tipoB = leads.filter(l => l.perfil && l.perfil.includes('B')).length

  const filtrados = filtro === 'todos' ? leads
    : filtro === 'urgente' ? leads.filter(l => l.urgente)
    : filtro === 'alta' ? leads.filter(l => l.prioridad === 'ALTA')
    : leads.filter(l => l.perfil && l.perfil.includes('B'))

  function handleDragStart(event) {
    const lead = leads.find(l => l.phone === event.active.id)
    setDragging(lead || null)
  }

  function handleDragEnd(event) {
    const { active, over } = event
    setDragging(null)
    if (!over) return

    const lead = leads.find(l => l.phone === active.id)
    if (!lead) return

    // Detectar sobre qué columna cayó
    const colTarget = COLS.find(c => c.id === over.id)
    if (colTarget && !colTarget.estados.includes(lead.estado)) {
      onMover(lead.phone, lead.fila, colTarget.estados[0])
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
          <button key={f.id} className={`${styles.fil} ${filtro === f.id ? styles.filActive : ''}`} onClick={() => setFiltro(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className={styles.board}>
          {COLS.map(col => {
            const colLeads = filtrados.filter(l => col.estados.includes(l.estado))
            return (
              <div key={col.id} id={col.id} className={styles.col}>
                <div className={styles.colHead} style={{ '--col-color': col.color }}>
                  <div className={styles.colDot} style={{ background: col.color }} />
                  <span className={styles.colLabel}>{col.label}</span>
                  <span className={styles.colCount}>{colLeads.length}</span>
                </div>
                <SortableContext items={colLeads.map(l => l.phone)} strategy={verticalListSortingStrategy}>
                  <div className={`${styles.colBody} ${dragging ? styles.colBodyDragging : ''}`}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => dragging && onMover(dragging.phone, dragging.fila, col.estados[0])}
                  >
                    {colLeads.length === 0
                      ? <div className={`${styles.colEmpty} ${dragging ? styles.colEmptyActive : ''}`}>
                          {dragging ? 'Soltar aquí' : 'Sin leads'}
                        </div>
                      : colLeads.map(lead => (
                          <SortableCard key={lead.phone} lead={lead} onAction={onAction} acting={acting} />
                        ))
                    }
                  </div>
                </SortableContext>
              </div>
            )
          })}
        </div>

        <DragOverlay>
          {dragging && (
            <div className={styles.dragOverlay}>
              <div className={styles.dragCard}>
                <div className={styles.dragName}>{dragging.nombre}</div>
                <div className={styles.dragSub}>{dragging.producto} · {dragging.minFmt}</div>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
