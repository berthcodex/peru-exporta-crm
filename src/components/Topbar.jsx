import styles from './Topbar.module.css'
export default function Topbar({ vendedor, total, urgentes, onRefresh, loading, title }) {
  const hora = new Date().toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'})
  return (
    <div className={styles.topbar}>
      <div className={styles.left}>
        <div className={styles.breadcrumb}>
          <span className={styles.bcMuted}>Perú Exporta</span>
          <span className={styles.bcSep}>›</span>
          <span className={styles.bcActive}>{title}</span>
        </div>
      </div>
      <div className={styles.right}>
        <span className={styles.hora}>{hora}</span>
        {urgentes > 0 && <span className={styles.urgBadge}>🔥 {urgentes} urgente{urgentes>1?'s':''}</span>}
        <button className={styles.refreshBtn} onClick={onRefresh}>{loading?'⟳':'↻'} Actualizar</button>
      </div>
    </div>
  )
}
