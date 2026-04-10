import { VENDEDORES } from '../config'
import styles from './Login.module.css'

export default function Login({ onLogin }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.logo}>PE</div>
        <h1 className={styles.title}>Perú Exporta</h1>
        <p className={styles.sub}>¿Quién eres?</p>
        <div className={styles.vendedores}>
          {VENDEDORES.map(v => (
            <button
              key={v.id}
              className={styles.vendBtn}
              onClick={() => onLogin(v)}
              style={{ '--vcolor': v.color }}
            >
              <div className={styles.vendAvatar} style={{ background: v.color }}>
                {v.initials}
              </div>
              <span className={styles.vendNombre}>{v.nombre}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
