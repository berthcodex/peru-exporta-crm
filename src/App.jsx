import { useState, useEffect, useCallback } from 'react'
import { getLeads, doAction, moverLead, processLeads } from './config'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import StatsBar from './components/StatsBar'
import Kanban from './components/Kanban'
import styles from './App.module.css'

export default function App() {
  const [vendedor, setVendedor] = useState(() => {
    try { const s = localStorage.getItem('pe_v'); return s ? JSON.parse(s) : null } catch { return null }
  })
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [acting, setActing] = useState(null)

  const load = useCallback(async () => {
    if (!vendedor) return
    setLoading(true)
    try {
      const data = await getLeads(vendedor.apiUrl)
      setLeads(processLeads(Array.isArray(data) ? data : []))
    } catch { showToast('Error al cargar leads', 'error') }
    finally { setLoading(false) }
  }, [vendedor])

  useEffect(() => { load() }, [load])

  function handleLogin(v) {
    localStorage.setItem('pe_v', JSON.stringify(v))
    setVendedor(v)
  }

  function handleLogout() {
    localStorage.removeItem('pe_v')
    setVendedor(null)
    setLeads([])
  }

  function showToast(msg, type = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleAction(action, phone, fila, extra) {
    setActing(`${action}-${phone}`)
    try {
      await doAction(vendedor.apiUrl, action, phone, fila, extra)
      showToast({ material: '🚀 Material enviado', agendar: '📅 Agendado', nocontesto: '📵 Registrado', cerrado: '✅ Cerrado' }[action] || 'Listo')
      await load()
    } catch { showToast('Error al ejecutar', 'error') }
    finally { setActing(null) }
  }

  async function handleMover(phone, fila, nuevoEstado) {
    try {
      // Optimistic update
      setLeads(prev => prev.map(l => l.phone === phone ? { ...l, estado: nuevoEstado } : l))
      await moverLead(vendedor.apiUrl, phone, fila, nuevoEstado)
      showToast('Lead movido ✓')
      await load()
    } catch { showToast('Error al mover', 'error'); await load() }
  }

  if (!vendedor) return <Login onLogin={handleLogin} />

  return (
    <div className={styles.app}>
      <Sidebar vendedor={vendedor} onLogout={handleLogout} />
      <div className={styles.main}>
        <Topbar
          vendedor={vendedor}
          total={leads.length}
          urgentes={leads.filter(l => l.urgente).length}
          onLogout={handleLogout}
          onRefresh={load}
          loading={loading}
        />
        <StatsBar leads={leads} />
        <Kanban leads={leads} onAction={handleAction} onMover={handleMover} acting={acting} />
      </div>
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : ''}`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
