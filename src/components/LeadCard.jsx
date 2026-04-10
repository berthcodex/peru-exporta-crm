import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import styles from './LeadCard.module.css'

export default function LeadCard({ lead, onAction, acting }) {
  const [open, setOpen] = useState(false)
  const [showAgenda, setShowAgenda] = useState(false)
  const [agendaHora, setAgendaHora] = useState('')

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.phone, data: { lead } })

  const ym = lead.estado === 'material enviado'
  const isActing = a => acting === `${a}-${lead.phone}`
  const esTipoB = (lead.perfil||'').includes('B')

  // Producto principal del lead
  const producto = lead.producto && lead.producto !== '—' ? lead.producto : null

  return (
    <div className={`${styles.card} ${lead.urgente?styles.urgente:lead.prioridad==='ALTA'?styles.alta:''} ${isDragging?styles.dragging:''}`}>

      {/* FRANJA SUPERIOR urgente */}
      {lead.urgente && <div className={styles.stripe}/>}

      {/* TODA LA TARJETA ES ARRASTRABLE — click abre detalle */}
      <div
        ref={setNodeRef}
        className={styles.body}
        {...listeners}
        {...attributes}
        onClick={() => setOpen(!open)}
      >
        {/* CABECERA */}
        <div className={styles.header}>
          <div className={styles.nombre}>{lead.nombre}</div>
          {lead.urgente && <span className={styles.urgTag}>LLAMA</span>}
        </div>

        {/* DETALLES CLAVE — siempre visibles */}
        <div className={styles.details}>
          {producto && (
            <div className={styles.detailRow}>
              <span className={styles.detailIcon}>🌿</span>
              <span className={styles.detailVal}>{producto}</span>
            </div>
          )}
          <div className={styles.detailRow}>
            <span className={styles.detailIcon}>👤</span>
            <span className={styles.detailVal}>{esTipoB ? 'Broker / Productor' : 'Formación'}</span>
          </div>
          {lead.prioridad === 'ALTA' && (
            <div className={styles.detailRow}>
              <span className={styles.detailIcon}>⚡</span>
              <span className={`${styles.detailVal} ${styles.alta}`}>Alta prioridad</span>
            </div>
          )}
          <div className={styles.detailRow}>
            <span className={styles.detailIcon}>🕐</span>
            <span className={`${styles.detailVal} ${lead.urgente?styles.hot:''}`}>
              {lead.minFmt} {lead.urgente ? '— URGENTE' : '· ' + lead.estado}
            </span>
          </div>
        </div>

        {/* CHEVRON */}
        <div className={styles.chevron}>{open ? '▲' : '▼'}</div>
      </div>

      {/* PANEL EXPANDIDO — click en tarjeta */}
      {open && (
        <div className={styles.panel} onClick={e => e.stopPropagation()}>
          {/* LLAMAR */}
          <a className={styles.callBtn} href={`tel:+${lead.phone}`}>
            <span>📞</span>
            <span>Llamar  +{lead.phone}</span>
          </a>

          {/* WHATSAPP */}
          <a className={styles.waBtn} href={`https://wa.me/${lead.phone}`} target="_blank" rel="noreferrer">
            <span>💬</span>
            <span>Abrir WhatsApp</span>
          </a>

          {/* ENVIAR MATERIAL */}
          <button
            className={`${styles.btn} ${styles.btnMat} ${ym?styles.sent:''}`}
            disabled={ym || isActing('material')}
            onClick={() => onAction('material', lead.phone, lead.fila)}
          >
            {isActing('material') ? '⟳ Enviando...' : ym ? '✓ Material enviado' : '🚀 Enviar material'}
          </button>

          {/* FILA ACCIONES */}
          <div className={styles.row}>
            {!showAgenda ? (
              <button className={`${styles.btn} ${styles.btnAge}`} onClick={() => setShowAgenda(true)}>
                📅 Agendar
              </button>
            ) : (
              <>
                <input type="datetime-local" className={styles.input} value={agendaHora} onChange={e => setAgendaHora(e.target.value)} />
                <button className={`${styles.btn} ${styles.btnConf}`} disabled={!agendaHora}
                  onClick={() => { onAction('agendar', lead.phone, lead.fila, agendaHora); setShowAgenda(false) }}>✓</button>
              </>
            )}
            <button className={`${styles.btn} ${styles.btnNc}`}
              disabled={isActing('nocontesto')}
              onClick={() => onAction('nocontesto', lead.phone, lead.fila)}>
              {isActing('nocontesto') ? '⟳' : '📵'}
            </button>
          </div>

          {/* CERRAR */}
          <button className={`${styles.btn} ${styles.btnCl}`}
            disabled={isActing('cerrado')}
            onClick={() => onAction('cerrado', lead.phone, lead.fila)}>
            {isActing('cerrado') ? '⟳' : '✅ Marcar cerrado'}
          </button>

          {lead.fechaAcc && <div className={styles.ts}>Última acción: {lead.fechaAcc}</div>}
        </div>
      )}
    </div>
  )
}
