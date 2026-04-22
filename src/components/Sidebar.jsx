// src/components/Sidebar.jsx — Sprint 3
// Fix B3: opción Vendedores solo visible para ADMIN

import styles from './Sidebar.module.css'

// Todos los items de navegación
const NAV_ITEMS = [
  { id: 'pipeline',          icon: '⊞', label: 'Pipeline',   adminOnly: false },
  { id: 'leads',             icon: '☰', label: 'Leads',      adminOnly: false },
  { id: 'reportes',          icon: '◈', label: 'Reportes',   adminOnly: false },
  { id: 'actividad',         icon: '◷', label: 'Actividad',  adminOnly: false },
  { id: 'flujos',            icon: '⚡', label: 'Flujos',    adminOnly: false },
  { id: 'config-vendedores', icon: '👥', label: 'Vendedores', adminOnly: true }, // Solo ADMIN
]

export default function Sidebar({ vendedor, onLogout, view, onView }) {
  // Sprint 3: leer el rol del vendedor logueado
  const isAdmin = vendedor?.role === 'ADMIN' || vendedor?.rol === 'ADMIN'

  // Filtrar items según rol
  const navVisible = NAV_ITEMS.filter(n => !n.adminOnly || isAdmin)

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>PE</div>
      <nav className={styles.nav}>
        {navVisible.map(n => (
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
          className={styles.avatar}
          style={{ background: vendedor?.color }}
          onClick={onLogout}
          title={`${vendedor?.nombre} · Cerrar sesión`}
        >
          {vendedor?.initials || vendedor?.nombre?.substring(0,2).toUpperCase()}
        </button>
      </div>
    </aside>
  )
}
