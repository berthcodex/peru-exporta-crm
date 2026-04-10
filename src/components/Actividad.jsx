import styles from './Actividad.module.css'

const ESTADO_INFO = {
  'pendiente llamar': { icon: '📞', label: 'Listo para llamar',  color: 'var(--orange)' },
  'no contestó':      { icon: '📵', label: 'No contestó',         color: 'var(--yellow)' },
  'agendado':         { icon: '📅', label: 'Llamada agendada',    color: 'var(--blue)'   },
  'material enviado': { icon: '🚀', label: 'Material enviado',    color: 'var(--purple)' },
  'cerrado':          { icon: '✅', label: 'Venta cerrada',        color: 'var(--green)'  },
  'esperando':        { icon: '⏳', label: 'Esperando respuesta', color: 'var(--text-hint)' },
}

export default function Actividad({ leads }) {
  const recientes = [...leads]
    .filter(l => l.fechaAcc || l.fecha)
    .sort((a, b) => {
      const fa = a.fechaAcc || a.fecha || ''
      const fb = b.fechaAcc || b.fecha || ''
      return fb.localeCompare(fa)
    })
    .slice(0, 30)

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.title}>Actividad reciente</div>
        <div className={styles.sub}>{recientes.length} eventos</div>
      </div>
      <div className={styles.feed}>
        {recientes.length === 0 ? (
          <div className={styles.empty}>Sin actividad reciente</div>
        ) : recientes.map((l, i) => {
          const info = ESTADO_INFO[l.estado] || { icon: '◷', label: l.estado, color: 'var(--text-hint)' }
          const esTipoB = (l.perfil||'').includes('B')
          return (
            <div key={l.phone + i} className={styles.item}>
              <div className={styles.iconWrap} style={{ background: `${info.color}15`, border: `1px solid ${info.color}30` }}>
                <span className={styles.icon}>{info.icon}</span>
              </div>
              <div className={styles.content}>
                <div className={styles.itemHeader}>
                  <span className={styles.nombre}>{l.nombre}</span>
                  <span className={styles.fecha}>{l.fechaAcc || l.fecha || '—'}</span>
                </div>
                <div className={styles.itemSub}>
                  <span className={styles.accion} style={{ color: info.color }}>{info.label}</span>
                  <span className={styles.dot}>·</span>
                  <span className={styles.producto}>{l.producto || '—'}</span>
                  <span className={styles.dot}>·</span>
                  <span className={`${styles.tipo} ${esTipoB ? styles.tipoB : styles.tipoA}`}>
                    {esTipoB ? 'Tipo B' : 'Tipo A'}
                  </span>
                </div>
              </div>
              {l.urgente && <div className={styles.urgDot} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
