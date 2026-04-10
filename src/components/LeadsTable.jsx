import { useState } from 'react'
import styles from './LeadsTable.module.css'

export default function LeadsTable({ leads, onAction, acting }) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('min')

  const filtered = leads
    .filter(l => {
      const q = search.toLowerCase()
      return !q || l.nombre.toLowerCase().includes(q) || (l.producto||'').toLowerCase().includes(q) || l.phone.includes(q)
    })
    .sort((a, b) => sortBy === 'min' ? a.min - b.min : sortBy === 'nombre' ? a.nombre.localeCompare(b.nombre) : 0)

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="🔍  Buscar por nombre, producto o teléfono..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className={styles.sort} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="min">Ordenar: Tiempo espera</option>
          <option value="nombre">Ordenar: Nombre</option>
        </select>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Lead</th>
              <th>Producto</th>
              <th>Perfil</th>
              <th>Estado</th>
              <th>Tiempo</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className={styles.empty}>Sin resultados</td></tr>
            ) : filtered.map(l => {
              const ym = l.estado === 'material enviado'
              return (
                <tr key={l.phone} className={l.urgente ? styles.rowUrgente : ''}>
                  <td>
                    <div className={styles.leadName}>{l.nombre}</div>
                    {l.urgente && <span className={styles.urgTag}>URGENTE</span>}
                  </td>
                  <td><span className={styles.prodPill}>{l.producto || '—'}</span></td>
                  <td>
                    <span className={`${styles.perfilPill} ${(l.perfil||'').includes('B') ? styles.perfilB : styles.perfilA}`}>
                      {(l.perfil||'').includes('B') ? 'Tipo B' : 'Tipo A'}
                    </span>
                  </td>
                  <td><span className={styles.estadoPill}>{l.estado}</span></td>
                  <td className={l.urgente ? styles.timeHot : styles.time}>{l.minFmt}</td>
                  <td>
                    <a className={styles.phoneLink} href={`tel:+${l.phone}`}>+{l.phone}</a>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        className={`${styles.actBtn} ${styles.actMat}`}
                        disabled={ym || acting === `material-${l.phone}`}
                        onClick={() => onAction('material', l.phone, l.fila)}
                      >{ym ? '✓' : '🚀'}</button>
                      <button
                        className={`${styles.actBtn} ${styles.actNc}`}
                        onClick={() => onAction('nocontesto', l.phone, l.fila)}
                      >📵</button>
                      <button
                        className={`${styles.actBtn} ${styles.actCl}`}
                        onClick={() => onAction('cerrado', l.phone, l.fila)}
                      >✅</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className={styles.footer}>{filtered.length} de {leads.length} leads</div>
    </div>
  )
}
