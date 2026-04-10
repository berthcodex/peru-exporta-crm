import { useState } from 'react'
import styles from './LeadCard.module.css'

export default function LeadCard({ lead, onAction, acting }) {
  const [expanded, setExpanded] = useState(false)
  const [showAgenda, setShowAgenda] = useState(false)
  const [agendaHora, setAgendaHora] = useState('')

  const ym = lead.estado === 'material enviado'
  const isActing = (a) => acting === `${a}-${lead.phone}`

  return (
    <div className={`${styles.card} ${lead.urgente ? styles.urgente : lead.prioridad === 'ALTA' ? styles.alta : ''}`}>
      {/* CABECERA — siempre visible */}
      <div className={styles.header} onClick={() => setExpanded(!expanded)}>
        <div className={styles.headerTop}>
          <div className={styles.nombre}>{lead.nombre}</div>
          {lead.urgente && <span className={styles.urgTag}>LLAMA</span>}
        </div>

        <div className={styles.pills}>
          {lead.producto && lead.producto !== '—' && (
            <span className={styles.pillProd}>{lead.producto}</span>
          )}
          {lead.prioridad === 'ALTA' && (
            <span className={styles.pillAlta}>⚡</span>
          )}
          {lead.perfil && (
            <span className={styles.pillTipo}>
              {lead.perfil.includes('B') ? 'Tipo B' : 'Tipo A'}
            </span>
          )}
        </div>

        <div className={`${styles.tiempo} ${lead.urgente ? styles.tiempoUrgente : ''}`}>
          🕐 {lead.minFmt} · {lead.estado}
        </div>
      </div>

      {/* DETALLE EXPANDIBLE */}
      {expanded && (
        <div className={styles.detail}>
          <div className={styles.detailRow}>
            <a className={styles.phoneLink} href={`tel:+${lead.phone}`}>
              📞 +{lead.phone}
            </a>
            <a className={styles.waLink} href={`https://wa.me/${lead.phone}`} target="_blank" rel="noreferrer">
              💬 WA
            </a>
          </div>

          {lead.perfil && (
            <div className={styles.detailInfo}>
              <span className={styles.infoLabel}>Perfil</span>
              <span className={styles.infoVal}>{lead.perfil}</span>
            </div>
          )}

          <div className={styles.acciones}>
            <button
              className={`${styles.btn} ${styles.btnMat} ${ym ? styles.btnDis : ''}`}
              disabled={ym || isActing('material')}
              onClick={() => onAction('material', lead.phone, lead.fila)}
            >
              {isActing('material') ? '⟳' : ym ? '✓ Enviado' : '🚀 Enviar material'}
            </button>

            <div className={styles.btnRow}>
              {!showAgenda ? (
                <button
                  className={`${styles.btn} ${styles.btnAge}`}
                  onClick={() => setShowAgenda(true)}
                >
                  📅 Agendar
                </button>
              ) : (
                <div className={styles.agendaRow}>
                  <input
                    type="datetime-local"
                    className={styles.agendaInput}
                    value={agendaHora}
                    onChange={e => setAgendaHora(e.target.value)}
                  />
                  <button
                    className={`${styles.btn} ${styles.btnAge}`}
                    disabled={!agendaHora}
                    onClick={() => {
                      onAction('agendar', lead.phone, lead.fila, agendaHora)
                      setShowAgenda(false)
                    }}
                  >
                    ✓
                  </button>
                </div>
              )}

              <button
                className={`${styles.btn} ${styles.btnNc}`}
                disabled={isActing('nocontesto')}
                onClick={() => onAction('nocontesto', lead.phone, lead.fila)}
              >
                📵
              </button>
            </div>

            <button
              className={`${styles.btn} ${styles.btnCl}`}
              disabled={isActing('cerrado')}
              onClick={() => onAction('cerrado', lead.phone, lead.fila)}
            >
              {isActing('cerrado') ? '⟳' : '✅ Marcar cerrado'}
            </button>
          </div>

          {lead.fechaAcc && (
            <div className={styles.ts}>Última acción: {lead.fechaAcc}</div>
          )}
        </div>
      )}
    </div>
  )
}
