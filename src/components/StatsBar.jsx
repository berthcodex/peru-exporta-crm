import styles from './StatsBar.module.css'

export default function StatsBar({ leads }) {
  const urgentes = leads.filter(l => l.urgente).length
  const pendientes = leads.filter(l => l.estado === 'pendiente llamar').length
  const enviados = leads.filter(l => l.estado === 'material enviado').length
  const cerrados = leads.filter(l => l.estado === 'cerrado').length
  const tipoB = leads.filter(l => l.perfil && l.perfil.includes('B')).length

  return (
    <div className={styles.bar}>
      <div className={styles.stat}>
        <div className={`${styles.n} ${styles.orange}`}>{urgentes}</div>
        <div className={styles.l}>Urgentes</div>
      </div>
      <div className={styles.stat}>
        <div className={styles.n}>{leads.length}</div>
        <div className={styles.l}>Total leads</div>
      </div>
      <div className={styles.stat}>
        <div className={`${styles.n} ${styles.orange2}`}>{pendientes}</div>
        <div className={styles.l}>Por llamar</div>
      </div>
      <div className={styles.stat}>
        <div className={`${styles.n} ${styles.purple}`}>{enviados}</div>
        <div className={styles.l}>Mat. enviado</div>
      </div>
      <div className={styles.stat}>
        <div className={`${styles.n} ${styles.green}`}>{cerrados}</div>
        <div className={styles.l}>Cerrados hoy</div>
      </div>
      <div className={styles.stat}>
        <div className={`${styles.n} ${styles.blue}`}>{tipoB}</div>
        <div className={styles.l}>Tipo B</div>
      </div>
    </div>
  )
}
