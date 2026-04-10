import styles from './Sidebar.module.css'

const NAV = [
  { icon: '⊞', label: 'Pipeline', id: 'pipeline' },
  { icon: '◷', label: 'Actividad', id: 'actividad' },
  { icon: '↑↓', label: 'Leads', id: 'leads' },
]

export default function Sidebar({ vendedor, onLogout, active = 'pipeline' }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>PE</div>
      <nav className={styles.nav}>
        {NAV.map(n => (
          <button key={n.id} className={`${styles.navBtn} ${active === n.id ? styles.navActive : ''}`} title={n.label}>
            <span className={styles.navIcon}>{n.icon}</span>
          </button>
        ))}
      </nav>
      <div className={styles.bottom}>
        <div className={styles.divider} />
        <button className={styles.navBtn} title="Configuración">
          <span className={styles.navIcon}>⚙</span>
        </button>
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
