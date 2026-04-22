import { useState, useEffect, useCallback } from 'react'
import { getLeads, doAction, moverLead, processLeads } from './config'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import StatsBar from './components/StatsBar'
import Kanban from './components/Kanban'
import LeadsTable from './components/LeadsTable'
import Reportes from './components/Reportes'
import Actividad from './components/Actividad'
import ConfigBot from './components/ConfigBot'
import ConfigVendedores from './components/ConfigVendedores'
import FlowBuilder from './pages/FlowBuilder'
import styles from './App.module.css'

const VIEW_TITLES = {
  pipeline:            'Pipeline de ventas',
  leads:               'Todos los leads',
  reportes:            'Reportes',
  actividad:           'Actividad reciente',
  'config-bot':        'Configuración — Mensajes del Bot',
  'config-vendedores': 'Configuración — Vendedores',
  'flujos':            'Constructor de Flujos',
}

export default function App() {
  const [vendedor, setVendedor] = useState(() => {
    try { const s = localStorage.getItem('pe_v'); return s ? JSON.parse(s) : null } catch { return null }
  })
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [acting, setActing] = useState(null)
  const [view, setView] = useState('pipeline')

  const load = useCallback(async () => {
    if (!vendedor) return
    setLoading(true)
    try {
      const data = await getLeads(vendedor.id)
      setLeads(processLeads(Array.isArray(data) ? data : []))
    } catch { showToast('Error al cargar leads', 'error') }
    finally { setLoading(false) }
  }, [vendedor])

  useEffect(() => { load() }, [load])

  function handleLogin(v) { localStorage.setItem('pe_v', JSON.stringify(v)); setVendedor(v) }
  function handleLogout() { localStorage.removeItem('pe_v'); setVendedor(null); setLeads([]) }
  function showToast(msg, type = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleAction(action, phone, fila, extra) {
    setActing(`${action}-${phone}`)
    try {
      await doAction(vendedor.id, action, phone, fila, extra)
      showToast({ material:'🚀 Material enviado', agendar:'📅 Agendado', nocontesto:'📵 Registrado', cerrado:'✅ Cerrado' }[action] || 'Listo')
      await load()
    } catch { showToast('Error al ejecutar', 'error') }
    finally { setActing(null) }
  }

  async function handleMover(phone, fila, colId) {
    const colToEstado = {
      'nuevos': 'esperando', 'pendiente llamar': 'pendiente llamar',
      'no contestó': 'no contestó', 'agendado': 'agendado',
      'material enviado': 'material enviado', 'cerrado': 'cerrado',
    }
    const estadoVisual = colToEstado[colId] || colId
    setLeads(prev => prev.map(l => l.phone === phone ? { ...l, estado: estadoVisual } : l))
    try {
      await moverLead(vendedor.id, phone, fila, colId)
      showToast('Lead movido ✓')
      await load()
    } catch { showToast('Error al mover', 'error'); await load() }
  }

  if (!vendedor) return <Login onLogin={handleLogin} />

  const urgentes = leads.filter(l => l.urgente).length

  return (
    <div className={styles.app}>
      <Sidebar vendedor={vendedor} onLogout={handleLogout} view={view} onView={setView} />
      <div className={styles.main}>
        <Topbar
          vendedor={vendedor} total={leads.length} urgentes={urgentes}
          onLogout={handleLogout} onRefresh={load} loading={loading}
          title={VIEW_TITLES[view]}
        />
        {view !== 'reportes' && view !== 'actividad' && !view.startsWith('config') && view !== 'flujos' && <StatsBar leads={leads} />}
        <div className={styles.mainScroll}>
          {view === 'pipeline'           && <Kanban leads={leads} onAction={handleAction} onMover={handleMover} acting={acting} />}
          {view === 'leads'              && <LeadsTable leads={leads} onAction={handleAction} acting={acting} />}
          {view === 'reportes'           && <Reportes leads={leads} />}
          {view === 'actividad'          && <Actividad leads={leads} />}
          {view === 'config-bot'         && <ConfigBot onToast={showToast} />}
          {view === 'config-vendedores'  && <ConfigVendedores onToast={showToast} />}
          {view === 'flujos'             && <FlowBuilder />}
        </div>
      </div>
      {toast && (
        <div className={`${styles.toast} ${toast.type==='error'?styles.toastError:''}`}>{toast.msg}</div>
      )}
    </div>
  )
}
