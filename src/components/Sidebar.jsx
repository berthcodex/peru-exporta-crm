import styles from './Sidebar.module.css'

const NAV = [
  { id: 'pipeline',  icon: '⊞', label: 'Pipeline' },
  { id: 'leads',     icon: '☰', label: 'Leads' },
  { id: 'reportes',  icon: '◈', label: 'Reportes' },
  { id: 'actividad', icon: '◷', label: 'Actividad' },
  { id: 'flujos',    icon: '⚡', label: 'Flujos' },
]

const NAV_CONFIG = [
  { id: 'config-bot',        icon: '🤖', label: 'Mensajes Bot' },
  { id: 'config-vendedores', icon: '👥', label: 'Vendedores' },
]

export default function Sidebar({ vendedor, onLogout, view, onView }) {
  const enConfig = view.startsWith('config')
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>PE</div>
      <nav className={styles.nav}>
        {NAV.map(n => (
          <button
            key={n.id}
            className={`${styles.navBtn} ${view === n.id ? styles.navActive : ''}`}
            onClick={() => onView(n.id)}
            title={n.label}
          >
            <span className={styles.navIcon}>{n.icon}</span>
            <span className={styles.navLabel}>{n.label}</span>
          </button>
        ))}
      </nav>
      <div className={styles.bottom}>
        <div className={styles.divider} />
        <button
          className={`${styles.navBtn} ${enConfig ? styles.navActive : ''}`}
          title="Configuración"
          onClick={() => onView('config-bot')}
        >
          <span className={styles.navIcon}>⚙</span>
          <span className={styles.navLabel}>Config</span>
        </button>
        {enConfig && (
          <div className={styles.subNav}>
            {NAV_CONFIG.map(n => (
              <button
                key={n.id}
                className={`${styles.subNavBtn} ${view === n.id ? styles.subNavActive : ''}`}
                onClick={() => onView(n.id)}
              >
                <span>{n.icon}</span>
                <span>{n.label}</span>
              </button>
            ))}
          </div>
        )}
        <button
          className={styles.avatar}
          style={{ background: vendedor.color }}
          onClick={onLogout}
          title={`${vendedor.nombre} · Cambiar perfil`}
        >
          {vendedor.initials}
        </button>
      </div>
    </aside>
  )
}
