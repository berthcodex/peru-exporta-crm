import styles from './Reportes.module.css'

function StatCard({ n, label, color, sub }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statN} style={{ color }}>{n}</div>
      <div className={styles.statL}>{label}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  )
}

export default function Reportes({ leads }) {
  const total    = leads.length
  const cerrados = leads.filter(l => l.estado === 'cerrado').length
  const enviados = leads.filter(l => l.estado === 'material enviado').length
  const urgentes = leads.filter(l => l.urgente).length
  const tipoB    = leads.filter(l => (l.perfil||'').includes('B')).length
  const tipoA    = total - tipoB
  const convRate = total > 0 ? Math.round((cerrados/total)*100) : 0

  const porEstado = [
    { l: 'Nuevos',  v: leads.filter(l => ['esperando','acumulando'].includes(l.estado)).length },
    { l: 'Llamar',  v: leads.filter(l => l.estado === 'pendiente llamar').length },
    { l: 'No cont', v: leads.filter(l => l.estado === 'no contestó').length },
    { l: 'Agend.',  v: leads.filter(l => l.estado === 'agendado').length },
    { l: 'Mater.',  v: enviados },
    { l: 'Cerrado', v: cerrados },
  ]
  const maxE = Math.max(...porEstado.map(d => d.v), 1)

  const COLORS = ['#9ca3af','#f97316','#eab308','#3b82f6','#7c3aed','#16a34a']

  return (
    <div className={styles.wrap}>
      <div className={styles.statsGrid}>
        <StatCard n={total}        label="Total leads"   color="var(--text)"    sub="En pipeline activo" />
        <StatCard n={urgentes}     label="Urgentes"      color="var(--orange)"  sub="+30 min sin respuesta" />
        <StatCard n={enviados}     label="Mat. enviado"  color="var(--purple)"  sub="Esperando pago" />
        <StatCard n={cerrados}     label="Cerrados"      color="var(--green)"   sub="Ventas confirmadas" />
        <StatCard n={`${convRate}%`} label="Conversión"  color="var(--blue)"    sub="Cerrados / Total" />
        <StatCard n={tipoB}        label="Tipo B"        color="var(--blue)"    sub={`${tipoA} Tipo A`} />
      </div>

      <div className={styles.grid}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Pipeline por estado</div>
          <div className={styles.barChart}>
            {porEstado.map((d, i) => (
              <div key={i} className={styles.barItem}>
                <div className={styles.barVal}>{d.v}</div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ height: `${(d.v/maxE)*100}%`, background: COLORS[i] }} />
                </div>
                <div className={styles.barLabel}>{d.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Distribución</div>
          <div className={styles.distGrid}>
            {[
              { l: 'Tipo B (broker/productor)', v: tipoB, c: 'var(--blue)' },
              { l: 'Tipo A (formación)', v: tipoA, c: 'var(--green)' },
              { l: 'Alta prioridad', v: leads.filter(l=>l.prioridad==='ALTA').length, c: 'var(--orange)' },
              { l: 'Urgentes', v: urgentes, c: 'var(--red)' },
            ].map((d, i) => (
              <div key={i} className={styles.distItem}>
                <div className={styles.distLabel}>
                  <span>{d.l}</span>
                  <span>{d.v}</span>
                </div>
                <div className={styles.distBar}>
                  <div className={styles.distFill} style={{ width: total ? `${(d.v/total)*100}%` : '0%', background: d.c }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
