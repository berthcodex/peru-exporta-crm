import styles from './StatsBar.module.css'

export default function StatsBar({ leads }) {
  const urgentes  = leads.filter(l => l.urgente).length
  const pendientes= leads.filter(l => l.estado === 'pendiente llamar').length
  const enviados  = leads.filter(l => l.estado === 'material enviado').length
  const cerrados  = leads.filter(l => l.estado === 'cerrado').length
  const tipoB     = leads.filter(l => (l.perfil||'').includes('B')).length

  const stats = [
    { n: leads.length, l: 'Total',    accent: false },
    { n: urgentes,     l: 'Urgentes', accent: 'orange' },
    { n: pendientes,   l: 'Llamar',   accent: 'yellow' },
    { n: enviados,     l: 'Enviados', accent: 'purple' },
    { n: cerrados,     l: 'Cerrados', accent: 'green'  },
    { n: tipoB,        l: 'Tipo B',   accent: 'blue'   },
  ]

  return (
    <div className={styles.bar}>
      {stats.map((s, i) => (
        <div key={i} className={styles.stat}>
          <div className={`${styles.n} ${s.accent ? styles['n_'+s.accent] : ''}`}>{s.n}</div>
          <div className={styles.l}>{s.l}</div>
        </div>
      ))}
    </div>
  )
}
