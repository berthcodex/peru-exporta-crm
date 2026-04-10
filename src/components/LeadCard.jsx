import { useState } from 'react'
import styles from './LeadCard.module.css'

export default function LeadCard({ lead, onAction, acting }) {
  const [expanded, setExpanded] = useState(false)
  const [showAgenda, setShowAgenda] = useState(false)
  const [agendaHora, setAgendaHora] = useState('')

  const ym = lead.estado === 'material enviado'
  const isActing = a => acting === `${a}-${lead.phone}`

  const perfil = lead.perfil || ''
  const esTipoB = perfil.includes('B')

  return (
    <div className={`${styles.card} ${lead.urgente ? styles.urgente : lead.prioridad === 'ALTA' ? styles.alta : ''}`}>
      <div className={styles.header} onClick={() => setExpanded(!expanded)}>
        <div className={styles.nombre}>{lead.nombre}</div>
        {lead.urgente && <div className={styles.urgDot} />}
      </div>

      <div className={styles.pills}>
        {lead.producto && lead.producto !== '—' && <span className={`${styles.pill} ${styles.pProd}`}>{lead.producto}</span>}
        {lead.prioridad === 'ALTA' && <span className={`${styles.pill} ${styles.pAlta}`}>⚡ Alta</span>}
        {esTipoB ? <span className={`${styles.pill} ${styles.pB}`}>Tipo B</span> : <span className={`${styles.pill} ${styles.pA}`}>Tipo A</span>}
      </div>

      <div className={styles.meta}>
        <span className={lead.urgente ? styles.tiempoHot : styles.tiempo}>
          {lead.urgente ? `🔥 ${lead.minFmt} esperando` : `${lead.minFmt} · ${lead.estado}`}
        </span>
      </div>

      {expanded && (
        <div className={styles.detail}>
          <div className={styles.phoneRow}>
            <a className={styles.phoneLink} href={`tel:+${lead.phone}`}>📞 Llamar +{lead.phone}</a>
            <a className={styles.waLink} href={`https://wa.me/${lead.phone}`} target="_blank" rel="noreferrer">💬</a>
          </div>

          <div className={styles.actions}>
            <button
              className={`${styles.btnMat} ${ym ? styles.btnMatSent : ''}`}
              disabled={ym || isActing('material')}
              onClick={() => onAction('material', lead.phone, lead.fila)}
            >
              {isActing('material') ? '⟳ Enviando...' : ym ? '✓ Material enviado' : '🚀 Enviar material'}
            </button>

            <div className={styles.btnRow}>
              {!showAgenda ? (
                <button className={`${styles.btnSm} ${styles.btnAge}`} onClick={() => setShowAgenda(true)}>
                  📅 Agendar
                </button>
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
              {isActing('cerrado') ? '⟳' : '✅ Marcar como cerrado'}
            </button>
          </div>

          {lead.fechaAcc && <div className={styles.ts}>Última acción: {lead.fechaAcc}</div>}
        </div>
      )}
    </div>
  )
}
