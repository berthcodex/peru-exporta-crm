import styles from './Topbar.module.css'

export default function Topbar({ vendedor, total, urgentes, onLogout, onRefresh, loading }) {
  const hora = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <div className={styles.logo}>PE</div>
        <div>
          <div className={styles.title}>Perú Exporta</div>
          <div className={styles.sub}>{total} leads · {hora}</div>
        </div>
      </div>
      <div className={styles.right}>
        {urgentes > 0 && (
          <div className={styles.urgBadge}>{urgentes} urgentes</div>
        )}
        <button
          className={styles.avatarBtn}
          onClick={onRefresh}
          title="Actualizar"
          style={{ background: vendedor.color }}
        >
          {loading ? '⟳' : vendedor.initials}
        </button>
        <button className={styles.logoutBtn} onClick={onLogout} title="Cambiar vendedor">
          ↩
        </button>
      </div>
    </header>
  )
}
