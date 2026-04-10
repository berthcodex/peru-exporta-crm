import { useState } from 'react'
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ESTADOS } from '../config'
import LeadCard from './LeadCard'
import styles from './Kanban.module.css'

const COLS = [
  { id: 'nuevos',           label: 'Nuevos',          color: '#9ca3af', estados: ['esperando','acumulando','reactivado','reactivado2','revisar manual'] },
  { id: 'pendiente llamar', label: 'Por llamar',       color: '#f97316', estados: ['pendiente llamar'] },
  { id: 'no contestó',      label: 'No contestó',      color: '#eab308', estados: ['no contestó','no contesto'] },
  { id: 'agendado',         label: 'Agendado',         color: '#3b82f6', estados: ['agendado'] },
  { id: 'material enviado', label: 'Mat. enviado',     color: '#7c3aed', estados: ['material enviado'] },
]

function SortableCard({ lead, onAction, acting }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.phone })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <LeadCard lead={lead} onAction={onAction} acting={acting} />
    </div>
  )
}

export default function Kanban({ leads, onAction, acting }) {
  const [filtro, setFiltro] = useState('todos')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  const urgentes = leads.filter(l => l.urgente).length
  const alta = leads.filter(l => l.prioridad === 'ALTA').length

  const filtrados = filtro === 'todos' ? leads
    : filtro === 'urgente' ? leads.filter(l => l.urgente)
    : filtro === 'alta' ? leads.filter(l => l.prioridad === 'ALTA')
    : filtro === 'tipoB' ? leads.filter(l => l.perfil && l.perfil.includes('B'))
    : leads

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    // En una versión futura: mover entre columnas
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.filterbar}>
        <span className={styles.fbLabel}>Filtrar</span>
        {[
          { id: 'todos', label: `Todos (${leads.length})` },
          { id: 'urgente', label: `🔥 Urgentes (${urgentes})` },
          { id: 'alta', label: `⚡ Alta prior. (${alta})` },
          { id: 'tipoB', label: `Tipo B (${leads.filter(l=>l.perfil&&l.perfil.includes('B')).length})` },
        ].map(f => (
          <button key={f.id} className={`${styles.fil} ${filtro === f.id ? styles.filActive : ''}`} onClick={() => setFiltro(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className={styles.board}>
          {COLS.map(col => {
            const colLeads = filtrados.filter(l => col.estados.includes(l.estado))
            return (
              <div key={col.id} className={styles.col}>
                <div className={styles.colHead} style={{ '--col-color': col.color }}>
                  <div className={styles.colDot} style={{ background: col.color }} />
                  <span className={styles.colLabel}>{col.label}</span>
                  <span className={styles.colCount}>{colLeads.length}</span>
                </div>
                <div className={styles.colBody}>
                  <SortableContext items={colLeads.map(l => l.phone)} strategy={verticalListSortingStrategy}>
                    {colLeads.length === 0
                      ? <div className={styles.colEmpty}>Sin leads</div>
                      : colLeads.map((lead, i) => (
                          <SortableCard
                            key={lead.phone}
                            lead={lead}
                            onAction={onAction}
                            acting={acting}
                          />
                        ))
                    }
                  </SortableContext>
                </div>
              </div>
            )
          })}
        </div>
      </DndContext>
    </div>
  )
}
