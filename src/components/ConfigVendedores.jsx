// src/components/ConfigVendedores.jsx
// Pantalla para agregar, editar y desactivar vendedores.
// Sin tocar código — todo desde botones.

import { useState, useEffect } from 'react'
import { getVendedores, createVendedor, updateVendedor, desactivarVendedor } from '../config'
import styles from './ConfigVendedores.module.css'

const ROL_LABEL = { ADMIN: 'Admin', VENDEDOR: 'Vendedor', SUPERVISOR: 'Supervisor' }
const COLORES = ['#ff6b35','#7c3aed','#16a34a','#0ea5e9','#f59e0b','#ef4444','#8b5cf6','#06b6d4']

function initials(nombre) {
  return nombre.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function colorPorNombre(nombre) {
  const i = nombre.charCodeAt(0) % COLORES.length
  return COLORES[i]
}

export default function ConfigVendedores({ onToast }) {
  const [vendedores, setVendedores] = useState([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(null)  // null | 'nuevo' | { vendedor }
  const [saving, setSaving]         = useState(false)

  // Form del modal
  const [form, setForm] = useState({ nombre: '', email: '', whatsappNumber: '', rol: 'VENDEDOR' })

  async function load() {
    try {
      const data = await getVendedores()
      setVendedores(data)
    } catch {
      onToast('Error al cargar vendedores', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function abrirNuevo() {
    setForm({ nombre: '', email: '', whatsappNumber: '', rol: 'VENDEDOR' })
    setModal('nuevo')
  }

  function abrirEditar(v) {
    setForm({
      nombre:         v.nombre,
      email:          v.email || '',
      whatsappNumber: v.whatsappNumber,
      rol:            v.rol,
    })
    setModal({ vendedor: v })
  }

  function cerrarModal() {
    setModal(null)
    setForm({ nombre: '', email: '', whatsappNumber: '', rol: 'VENDEDOR' })
  }

  async function handleGuardar() {
    if (!form.nombre.trim()) return onToast('El nombre es requerido', 'error')
    if (!form.whatsappNumber.trim()) return onToast('El número de WhatsApp es requerido', 'error')

    setSaving(true)
    try {
      if (modal === 'nuevo') {
        await createVendedor(form)
        onToast('✅ Vendedor agregado correctamente')
      } else {
        await updateVendedor(modal.vendedor.id, form)
        onToast('✅ Vendedor actualizado')
      }
      cerrarModal()
      await load()
    } catch (err) {
      onToast('Error: ' + err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDesactivar(v) {
    if (!confirm(`¿Desactivar a ${v.nombre}? Dejará de recibir leads nuevos. Su historial se conserva.`)) return
    try {
      await desactivarVendedor(v.id)
      onToast(`${v.nombre} desactivado`)
      await load()
    } catch (err) {
      onToast('Error: ' + err.message, 'error')
    }
  }

  const activos   = vendedores.filter(v => v.activo)
  const inactivos = vendedores.filter(v => !v.activo)

  if (loading) return <div className={styles.loading}>Cargando vendedores...</div>

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Equipo de Vendedores</h2>
          <p className={styles.sub}>
            Agrega, edita o desactiva vendedores. Los cambios son inmediatos.
          </p>
        </div>
        <button className={styles.btnPrimario} onClick={abrirNuevo}>
          + Agregar vendedor
        </button>
      </div>

      {/* Vendedores activos */}
      <div className={styles.seccion}>
        <div className={styles.seccionTitle}>Activos ({activos.length})</div>
        <div className={styles.grid}>
          {activos.map(v => (
            <div key={v.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div
                  className={styles.avatar}
                  style={{ background: colorPorNombre(v.nombre) }}
                >
                  {initials(v.nombre)}
                </div>
                <div className={styles.cardInfo}>
                  <div className={styles.cardNombre}>{v.nombre}</div>
                  <div className={styles.cardRol}>{ROL_LABEL[v.rol] || v.rol}</div>
                </div>
                <div className={styles.activoBadge}>Activo</div>
              </div>

              <div className={styles.cardDetalle}>
                <div className={styles.detalleItem}>
                  <span className={styles.detalleIcon}>📱</span>
                  <span>{v.whatsappNumber}</span>
                </div>
                {v.email && (
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleIcon}>✉️</span>
                    <span>{v.email}</span>
                  </div>
                )}
                <div className={styles.detalleItem}>
                  <span className={styles.detalleIcon}>🔗</span>
                  <span className={styles.instancia}>{v.instanciaEvolution}</span>
                </div>
                <div className={styles.detalleItem}>
                  <span className={styles.detalleIcon}>👥</span>
                  <span>{v.totalLeads} leads asignados</span>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button className={styles.btnEditar} onClick={() => abrirEditar(v)}>
                  ✏️ Editar
                </button>
                {v.rol !== 'ADMIN' && (
                  <button className={styles.btnDesactivar} onClick={() => handleDesactivar(v)}>
                    Desactivar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vendedores inactivos */}
      {inactivos.length > 0 && (
        <div className={styles.seccion}>
          <div className={styles.seccionTitle}>Inactivos ({inactivos.length})</div>
          <div className={styles.grid}>
            {inactivos.map(v => (
              <div key={v.id} className={`${styles.card} ${styles.cardInactivo}`}>
                <div className={styles.cardTop}>
                  <div className={styles.avatar} style={{ background: '#9ca3af' }}>
                    {initials(v.nombre)}
                  </div>
                  <div className={styles.cardInfo}>
                    <div className={styles.cardNombre}>{v.nombre}</div>
                    <div className={styles.cardRol}>{ROL_LABEL[v.rol] || v.rol}</div>
                  </div>
                  <div className={styles.inactivoBadge}>Inactivo</div>
                </div>
                <div className={styles.cardDetalle}>
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleIcon}>📱</span>
                    <span>{v.whatsappNumber}</span>
                  </div>
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleIcon}>👥</span>
                    <span>{v.totalLeads} leads históricos</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal — Agregar / Editar */}
      {modal && (
        <div className={styles.overlay} onClick={cerrarModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {modal === 'nuevo' ? 'Agregar vendedor' : `Editar — ${modal.vendedor.nombre}`}
              </h3>
              <button className={styles.modalClose} onClick={cerrarModal}>✕</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Nombre *</label>
                <input
                  className={styles.input}
                  value={form.nombre}
                  onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                  placeholder="Ej: María García"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Número WhatsApp *</label>
                <input
                  className={styles.input}
                  value={form.whatsappNumber}
                  onChange={e => setForm(p => ({ ...p, whatsappNumber: e.target.value }))}
                  placeholder="519XXXXXXXX (sin + ni espacios)"
                />
                <div className={styles.fieldHint}>
                  Formato: código de país + número. Ej: 51987654321
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Email</label>
                <input
                  className={styles.input}
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="correo@empresa.com (opcional)"
                  type="email"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Rol</label>
                <select
                  className={styles.input}
                  value={form.rol}
                  onChange={e => setForm(p => ({ ...p, rol: e.target.value }))}
                >
                  <option value="VENDEDOR">Vendedor</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnSecundario} onClick={cerrarModal}>
                Cancelar
              </button>
              <button
                className={styles.btnPrimario}
                onClick={handleGuardar}
                disabled={saving}
              >
                {saving ? 'Guardando...' : modal === 'nuevo' ? '+ Agregar' : '💾 Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
