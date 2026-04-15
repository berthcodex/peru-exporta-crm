import { VENDEDORES } from '../config'
import styles from './Login.module.css'

export default function Login({ onLogin }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>PE</div>
          <h1 className={styles.title}>Perú Exporta CRM</h1>
          <p className={styles.sub}>Selecciona tu perfil para continuar</p>
        </div>
        <div className={styles.label}>Equipo de ventas</div>
        <div className={styles.vendedores}>
          {VENDEDORES.map(v => (
            <button key={v.id} className={styles.vendBtn} onClick={() => onLogin(v)}>
              <div className={styles.vendAvatar} style={{ background: v.color }}>{v.initials}</div>
              <div className={styles.vendInfo}>
                <div className={styles.vendNombre}>{v.nombre} {v.apellido}</div>
                <div className={styles.vendRole}>Asesor de ventas</div>
              </div>
              <span className={styles.vendArrow}>›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
