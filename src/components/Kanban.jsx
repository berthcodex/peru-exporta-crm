import { useState } from 'react'
import { ESTADOS } from '../config'
import LeadCard from './LeadCard'
import styles from './Kanban.module.css'

export default function Kanban({ leads, onAction, acting }) {
  const [filtro, setFiltro] = useState('todos')

  const urgentes = leads.filter(l => l.urgente).length
  const filtrados = filtro === 'todos' ? leads :
                    filtro === 'urgente' ? leads.filter(l => l.urgente) :
                    leads.filter(l => l.prioridad === 'ALTA')

  // Agrupar por estado para kanban
  const columnas = ESTADOS.filter(e => e.id !== 'cerrado').map(estado => ({
    ...estado,
    leads: filtrados.filter(l => {
      if (estado.id === 'esperando') return ['esperando','acumulando','reactivado','reactivado2','revisar manual'].includes(l.estado)
      return l.estado === estado.id
    })
  }))

  return (
    <div className={styles.wrap}>
      {/* Stats rápidas */}
      <div className={styles.stats}>
        <div className={`${styles.stat} ${styles.statO}`}>
          <span className={styles.statN}>{urgentes}</span>
          <span className={styles.statL}>Urgentes</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statN}>{leads.length}</span>
          <span className={styles.statL}>Total</span>
        </div>
        <div className={`${styles.stat} ${styles.statG}`}>
          <span className={styles.statN}>{leads.filter(l => l.estado === 'material enviado').length}</span>
          <span className={styles.statL}>Enviados</span>
        </div>
        <div className={`${styles.stat} ${styles.statV}`}>
          <span className={styles.statN}>{leads.filter(l => l.estado === 'cerrado').length}</span>
          <span className={styles.statL}>Cerrados</span>
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.filtros}>
        {['todos','urgente','alta'].map(f => (
          <button
            key={f}
            className={`${styles.fil} ${filtro === f ? styles.filActive : ''}`}
            onClick={() => setFiltro(f)}
          >
            {f === 'todos' ? `Todos (${leads.length})` :
             f === 'urgente' ? `🔥 Urgentes (${urgentes})` :
             `⚡ Alta prior. (${leads.filter(l=>l.prioridad==='ALTA').length})`}
          </button>
        ))}
      </div>

      {/* Kanban horizontal scroll */}
      <div className={styles.board}>
        {columnas.map(col => (
          <div key={col.id} className={styles.col}>
            <div className={styles.colHeader} style={{ '--col-color': col.color }}>
              <span className={styles.colDot} style={{ background: col.color }} />
              <span className={styles.colLabel}>{col.label}</span>
              <span className={styles.colCount}>{col.leads.length}</span>
            </div>
            <div className={styles.colCards}>
              {col.leads.length === 0 ? (
                <div className={styles.colEmpty}>Sin leads</div>
              ) : (
                col.leads.map(lead => (
                  <LeadCard
                    key={lead.phone}
                    lead={lead}
                    onAction={onAction}
                    acting={acting}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
