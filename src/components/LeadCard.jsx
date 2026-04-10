import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import styles from './LeadCard.module.css'

export default function LeadCard({ lead, onAction, acting }) {
  const [expanded, setExpanded] = useState(false)
  const [showAgenda, setShowAgenda] = useState(false)
  const [agendaHora, setAgendaHora] = useState('')

  // Drag desde TODA la tarjeta — sin handle separado
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.phone,
    data: { lead },
  })

  const ym = lead.estado === 'material enviado'
  const isActing = a => acting === `${a}-${lead.phone}`
  const esTipoB = (lead.perfil || '').includes('B')

  // Separamos los listeners del drag de los del click
  // Solo activamos drag en el área superior (header)
  return (
    <div
      className={`${styles.card} ${lead.urgente?styles.urgente:lead.prioridad==='ALTA'?styles.alta:''} ${isDragging?styles.dragging:''}`}
    >
      {/* ZONA DE DRAG — toda la parte superior */}
      <div
        ref={setNodeRef}
        className={styles.dragZone}
        {...listeners}
        {...attributes}
      >
        {/* Indicador urgente */}
        {lead.urgente && <div className={styles.urgStripe} />}

        <div className={styles.header}>
          <div className={styles.nombre}>{lead.nombre}</div>
          {lead.urgente
            ? <span className={styles.urgTag}>🔥 LLAMA</span>
            : lead.prioridad === 'ALTA' && <span className={styles.altaTag}>⚡</span>
          }
        </div>

        <div className={styles.pills}>
          {lead.producto && lead.producto !== '—' && (
            <span className={`${styles.pill} ${styles.pProd}`}>{lead.producto}</span>
          )}
          <span className={`${styles.pill} ${esTipoB?styles.pB:styles.pA}`}>
            {esTipoB ? 'Tipo B' : 'Tipo A'}
          </span>
        </div>

        <div className={styles.tiempo}>
          <span className={lead.urgente ? styles.tiempoHot : styles.tiempoNorm}>
            {lead.urgente ? `${lead.minFmt} esperando` : `${lead.minFmt} · ${lead.estado}`}
          </span>
        </div>
      </div>

      {/* BOTÓN LLAMAR — siempre visible, NO arrastra */}
      <a
        className={styles.callBtn}
        href={`tel:+${lead.phone}`}
        onClick={e => e.stopPropagation()}
      >
        <span className={styles.callIcon}>📞</span>
        <span>+{lead.phone}</span>
      </a>

      {/* EXPANDIR */}
      <button
        className={styles.expandBtn}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? '▲ Menos' : '▾ Más acciones'}
      </button>

      {expanded && (
        <div className={styles.actions}>
          <a
            className={styles.waBtn}
            href={`https://wa.me/${lead.phone}`}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
          >
            💬 Abrir WhatsApp
          </a>

          <button
            className={`${styles.btnMat} ${ym ? styles.btnMatSent : ''}`}
            disabled={ym || isActing('material')}
            onClick={() => onAction('material', lead.phone, lead.fila)}
          >
            {isActing('material') ? '⟳ Enviando...' : ym ? '✓ Material enviado' : '🚀 Enviar material'}
          </button>

          <div className={styles.btnRow}>
            {!showAgenda ? (
              <button
                className={`${styles.btnSm} ${styles.btnAge}`}
                onClick={() => setShowAgenda(true)}
              >📅 Agendar</button>
            ) : (
              <div className={styles.agendaWrap}>
                <input
                  type="datetime-local"
                  className={styles.agendaInput}
                  value={agendaHora}
                  onChange={e => setAgendaHora(e.target.value)}
                />
                <button
                  className={styles.btnConfirm}
                  disabled={!agendaHora}
                  onClick={() => {
                    onAction('agendar', lead.phone, lead.fila, agendaHora)
                    setShowAgenda(false)
                  }}
                >✓</button>
              </div>
            )}
            <button
              className={styles.btnSm}
              disabled={isActing('nocontesto')}
              onClick={() => onAction('nocontesto', lead.phone, lead.fila)}
            >
              {isActing('nocontesto') ? '⟳' : '📵 No contestó'}
            </button>
          </div>

          <button
            className={styles.btnCl}
            disabled={isActing('cerrado')}
            onClick={() => onAction('cerrado', lead.phone, lead.fila)}
          >
            {isActing('cerrado') ? '⟳' : '✅ Marcar cerrado'}
          </button>

          {lead.fechaAcc && (
            <div className={styles.ts}>Última acción: {lead.fechaAcc}</div>
          )}
        </div>
      )}
    </div>
  )
}
