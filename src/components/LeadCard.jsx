import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import styles from './LeadCard.module.css'

export default function LeadCard({ lead, onAction, acting }) {
  const [expanded, setExpanded] = useState(false)
  const [showAgenda, setShowAgenda] = useState(false)
  const [agendaHora, setAgendaHora] = useState('')

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.phone, data: { lead } })

  const ym = lead.estado === 'material enviado'
  const isActing = a => acting === `${a}-${lead.phone}`
  const esTipoB = (lead.perfil || '').includes('B')

  return (
    <div
      ref={setNodeRef}
      className={`${styles.card} ${lead.urgente?styles.urgente:lead.prioridad==='ALTA'?styles.alta:''} ${isDragging?styles.dragging:''}`}
    >
      {/* Drag handle */}
      <div className={styles.dragHandle} {...listeners} {...attributes} onClick={e => e.stopPropagation()}>⠿</div>

      <div className={styles.header} onClick={() => setExpanded(!expanded)}>
        <div className={styles.nombre}>{lead.nombre}</div>
        {lead.urgente && <div className={styles.urgDot} />}
      </div>

      <div className={styles.pills} onClick={() => setExpanded(!expanded)}>
        {lead.producto && lead.producto !== '—' && <span className={`${styles.pill} ${styles.pProd}`}>{lead.producto}</span>}
        {lead.prioridad === 'ALTA' && <span className={`${styles.pill} ${styles.pAlta}`}>⚡ Alta</span>}
        <span className={`${styles.pill} ${esTipoB?styles.pB:styles.pA}`}>{esTipoB?'Tipo B':'Tipo A'}</span>
      </div>

      <div className={styles.meta} onClick={() => setExpanded(!expanded)}>
        <span className={lead.urgente?styles.tiempoHot:styles.tiempo}>
          {lead.urgente ? `🔥 ${lead.minFmt} esperando` : `${lead.minFmt} · ${lead.estado}`}
        </span>
      </div>

      {expanded && (
        <div className={styles.detail}>
          <div className={styles.phoneRow}>
            <a className={styles.phoneBtn} href={`tel:+${lead.phone}`}>📞 Llamar +{lead.phone}</a>
            <a className={styles.waBtn} href={`https://wa.me/${lead.phone}`} target="_blank" rel="noreferrer">💬 WA</a>
          </div>
          <div className={styles.actions}>
            <button
              className={`${styles.btnMat} ${ym?styles.btnMatSent:''}`}
              disabled={ym || isActing('material')}
              onClick={() => onAction('material', lead.phone, lead.fila)}
            >
              {isActing('material') ? '⟳' : ym ? '✓ Material enviado' : '🚀 Enviar material'}
            </button>
            <div className={styles.btnRow}>
              {!showAgenda ? (
                <button className={`${styles.btnSm} ${styles.btnAge}`} onClick={() => setShowAgenda(true)}>📅 Agendar</button>
              ) : (
                <div className={styles.agendaWrap}>
                  <input type="datetime-local" className={styles.agendaInput} value={agendaHora} onChange={e => setAgendaHora(e.target.value)} />
                  <button className={styles.btnConfirm} disabled={!agendaHora} onClick={() => { onAction('agendar', lead.phone, lead.fila, agendaHora); setShowAgenda(false) }}>✓</button>
                </div>
              )}
              <button className={styles.btnSm} disabled={isActing('nocontesto')} onClick={() => onAction('nocontesto', lead.phone, lead.fila)}>
                {isActing('nocontesto') ? '⟳' : '📵 No contestó'}
              </button>
            </div>
            <button className={styles.btnCl} disabled={isActing('cerrado')} onClick={() => onAction('cerrado', lead.phone, lead.fila)}>
              {isActing('cerrado') ? '⟳' : '✅ Marcar cerrado'}
            </button>
          </div>
          {lead.fechaAcc && <div className={styles.ts}>Última acción: {lead.fechaAcc}</div>}
        </div>
      )}
    </div>
  )
}
