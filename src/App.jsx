import { useState, useEffect, useCallback } from 'react'
import { getLeads, doAction, fmtMin, calcMin } from './api'
import styles from './App.module.css'

const FILTERS = ['todos', 'urgente', 'alta', 'pendiente', 'enviado']

const FILTER_LABELS = {
  todos: 'Todos',
  urgente: '🔥 Urgentes',
  alta: '⚡ Alta prior.',
  pendiente: 'Pendientes',
  enviado: '📤 Enviados',
}

function processLeads(raw) {
  return raw
    .map(l => {
      const min = calcMin(l.fecha)
      return {
        ...l,
        min,
        minFmt: fmtMin(min),
        urgente: (l.estado === 'pendiente llamar' || l.estado === 'esperando') && min >= 30,
      }
    })
    .sort((a, b) => {
      if (a.urgente && !b.urgente) return -1
      if (!a.urgente && b.urgente) return 1
      if (a.prioridad === 'ALTA' && b.prioridad !== 'ALTA') return -1
      if (a.prioridad !== 'ALTA' && b.prioridad === 'ALTA') return 1
      return a.min - b.min
    })
}

function filterLeads(leads, filter) {
  if (filter === 'todos') return leads
  if (filter === 'urgente') return leads.filter(l => l.urgente)
  if (filter === 'alta') return leads.filter(l => l.prioridad === 'ALTA' && !l.urgente)
  if (filter === 'pendiente') return leads.filter(l => l.estado === 'pendiente llamar')
  if (filter === 'enviado') return leads.filter(l => l.estado === 'material enviado')
  return leads
}

export default function App() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('todos')
  const [expanded, setExpanded] = useState(null)
  const [toast, setToast] = useState(null)
  const [acting, setActing] = useState(null)

  const load = useCallback(async () => {
    try {
      const data = await getLeads()
      setLeads(processLeads(data))
    } catch {
      showToast('Error al cargar leads', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function showToast(msg, type = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleAction(action, phone, fila, extra) {
    setActing(`${action}-${phone}`)
    try {
      await doAction(action, phone, fila, extra)
      const labels = {
        material: 'Material enviado 🚀',
        agendar: 'Agendado 📅',
        nocontesto: 'Marcado: no contestó',
        cerrado: 'Venta cerrada ✅',
      }
      showToast(labels[action] || 'Listo')
      await load()
      setExpanded(null)
    } catch {
      showToast('Error al ejecutar', 'error')
    } finally {
      setActing(null)
    }
  }

  const processed = filterLeads(leads, filter)
  const urgentes = leads.filter(l => l.urgente).length
  const alta = leads.filter(l => l.prioridad === 'ALTA').length
  const enviados = leads.filter(l => l.estado === 'material enviado').length

  return (
    <div className={styles.app}>
      {/* TOPBAR */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <div className={styles.logo}>PE</div>
          <div>
            <div className={styles.topbarTitle}>Perú Exporta</div>
            <div className={styles.topbarSub}>{leads.length} leads activos</div>
          </div>
        </div>
        <div className={styles.topbarRight}>
          <div className={styles.hora}>{new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</div>
          <button className={styles.refreshBtn} onClick={load} title="Actualizar">
            {loading ? '⟳' : '↻'}
          </button>
        </div>
      </header>

      {/* STATS */}
      <div className={styles.stats}>
        <div className={`${styles.stat} ${styles.statOrange}`}>
          <div className={styles.statN}>{urgentes}</div>
          <div className={styles.statL}>Urgentes</div>
        </div>
        <div className={`${styles.stat} ${styles.statBlue}`}>
          <div className={styles.statN}>{leads.length}</div>
          <div className={styles.statL}>Total</div>
        </div>
        <div className={`${styles.stat} ${styles.statGreen}`}>
          <div className={styles.statN}>{enviados}</div>
          <div className={styles.statL}>Enviados</div>
        </div>
      </div>

      {/* FILTROS */}
      <div className={styles.filters}>
        {FILTERS.map(f => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
            onClick={() => setFilter(f)}
          >
            {FILTER_LABELS[f]}
            {f === 'urgente' && urgentes > 0 && <span className={styles.filterBadge}>{urgentes}</span>}
          </button>
        ))}
      </div>

      {/* LISTA */}
      <div className={styles.list}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <span>Cargando leads...</span>
          </div>
        ) : processed.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>✓</div>
            <div className={styles.emptyText}>Sin leads en esta categoría</div>
          </div>
        ) : (
          processed.map((lead, i) => (
            <LeadCard
              key={lead.phone}
              lead={lead}
              index={i}
              expanded={expanded === lead.phone}
              onToggle={() => setExpanded(expanded === lead.phone ? null : lead.phone)}
              onAction={handleAction}
              acting={acting}
            />
          ))
        )}
      </div>

      {/* TOAST */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : ''}`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

function LeadCard({ lead, index, expanded, onToggle, onAction, acting }) {
  const [agendaHora, setAgendaHora] = useState('')
  const [showAgenda, setShowAgenda] = useState(false)

  const ym = lead.estado === 'material enviado'
  const isActing = (action) => acting === `${action}-${lead.phone}`

  const statusColor = lead.urgente ? 'dot-red' :
    ym ? 'dot-green' :
    lead.estado === 'agendado' ? 'dot-yellow' : 'dot-gray'

  return (
    <div
      className={`${styles.card} ${lead.urgente ? styles.cardUrgente : lead.prioridad === 'ALTA' ? styles.cardAlta : ''}`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* FILA PRINCIPAL — siempre visible */}
      <div className={styles.cardMain} onClick={onToggle}>
        <div className={styles.cardLeft}>
          <div className={`${styles.dot} ${styles[statusColor]}`} />
          <div className={styles.cardInfo}>
            <div className={styles.cardNombre}>{lead.nombre}</div>
            <div className={styles.cardPills}>
              {lead.producto && <span className={styles.pillProd}>{lead.producto}</span>}
              {lead.prioridad === 'ALTA' && <span className={styles.pillAlta}>⚡ ALTA</span>}
              <span className={styles.pillTipo}>{lead.perfil}</span>
            </div>
            <div className={`${styles.cardTime} ${lead.urgente ? styles.cardTimeUrgente : ''}`}>
              🕐 {lead.minFmt} sin respuesta
            </div>
          </div>
        </div>
        <div className={styles.cardRight}>
          {lead.urgente && <span className={styles.urgTag}>LLAMA</span>}
          <span className={`${styles.chevron} ${expanded ? styles.chevronOpen : ''}`}>›</span>
        </div>
      </div>

      {/* PANEL DE ACCIONES — expandible */}
      {expanded && (
        <div className={styles.cardActions}>
          <div className={styles.cardPhoneRow}>
            <div className={styles.cardPhone}>📱 +{lead.phone}</div>
            <a className={styles.callBtn} href={`tel:+${lead.phone}`}>📞 Llamar</a>
          </div>
          <div className={styles.actionGrid}>
            <button
              className={`${styles.actionBtn} ${styles.actionMat} ${ym ? styles.actionDis : ''}`}
              disabled={ym || isActing('material')}
              onClick={() => onAction('material', lead.phone, lead.fila)}
            >
              {isActing('material') ? '⟳ Enviando...' : ym ? '✓ Enviado' : '🚀 Enviar material'}
            </button>

            {!showAgenda ? (
              <button className={`${styles.actionBtn} ${styles.actionAge}`} onClick={() => setShowAgenda(true)}>
                📅 Agendar
              </button>
            ) : (
              <div className={styles.agendaWrap}>
                <input
                  type="datetime-local"
                  className={styles.agendaInput}
                  value={agendaHora}
                  onChange={e => setAgendaHora(e.target.value)}
                />
                <button
                  className={`${styles.actionBtn} ${styles.actionAge}`}
                  disabled={!agendaHora || isActing('agendar')}
                  onClick={() => { onAction('agendar', lead.phone, lead.fila, agendaHora); setShowAgenda(false) }}
                >
                  {isActing('agendar') ? '⟳' : 'Confirmar'}
                </button>
              </div>
            )}

            <button
              className={`${styles.actionBtn} ${styles.actionNc}`}
              disabled={isActing('nocontesto')}
              onClick={() => onAction('nocontesto', lead.phone, lead.fila)}
            >
              {isActing('nocontesto') ? '⟳' : '📵 No contestó'}
            </button>

            <button
              className={`${styles.actionBtn} ${styles.actionCl}`}
              disabled={isActing('cerrado')}
              onClick={() => onAction('cerrado', lead.phone, lead.fila)}
            >
              {isActing('cerrado') ? '⟳' : '✅ Cerrado'}
            </button>
          </div>

          {lead.fechaAcc && (
            <div className={styles.cardTs}>Última acción: {lead.fechaAcc}</div>
          )}
        </div>
      )}
    </div>
  )
}
