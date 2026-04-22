// src/components/Login.jsx — Sprint 3
// Login con PIN de 4 dígitos. Carga vendedores desde DB (no hardcodeados).
// Flujo: seleccionar nombre → ingresar PIN → validar contra backend → entrar

import { useState, useEffect, useRef } from 'react'
import styles from './Login.module.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://whatsapp-sales-backend.onrender.com'

export default function Login({ onLogin }) {
  const [vendors, setVendors]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState(null)  // vendor seleccionado
  const [pin, setPin]               = useState('')
  const [error, setError]           = useState('')
  const [checking, setChecking]     = useState(false)
  const pinRef = useRef(null)

  // Cargar lista de vendedores desde DB
  useEffect(() => {
    fetch(`${API_URL}/auth/vendors`)
      .then(r => r.json())
      .then(data => setVendors(Array.isArray(data) ? data : []))
      .catch(() => setError('No se pudo conectar al servidor'))
      .finally(() => setLoading(false))
  }, [])

  // Cuando se selecciona un vendedor, enfocar el input PIN
  useEffect(() => {
    if (selected) setTimeout(() => pinRef.current?.focus(), 100)
  }, [selected])

  function handleSelectVendor(v) {
    setSelected(v)
    setPin('')
    setError('')
  }

  function handlePinChange(e) {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4)
    setPin(val)
    setError('')
    // Auto-submit cuando llega a 4 dígitos
    if (val.length === 4) handleLogin(val)
  }

  async function handleLogin(pinVal = pin) {
    if (!selected || pinVal.length !== 4) return
    setChecking(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: selected.nombre, pin: pinVal })
      })
      const data = await res.json()
      if (!res.ok) {
        setError('PIN incorrecto. Inténtalo de nuevo.')
        setPin('')
        pinRef.current?.focus()
        return
      }
      // Login exitoso — pasar el vendor completo al App
      onLogin(data.vendor)
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setChecking(false)
    }
  }

  if (loading) return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.loading}>Conectando...</div>
      </div>
    </div>
  )

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>PE</div>
          <h1 className={styles.title}>Perú Exporta CRM</h1>
          <p className={styles.sub}>
            {selected ? `Ingresa tu PIN, ${selected.nombre}` : 'Selecciona tu perfil'}
          </p>
        </div>

        {/* Paso 1: seleccionar vendedor */}
        {!selected && (
          <>
            <div className={styles.label}>Equipo de ventas</div>
            <div className={styles.vendedores}>
              {vendors.map(v => (
                <button key={v.id} className={styles.vendBtn} onClick={() => handleSelectVendor(v)}>
                  <div className={styles.vendAvatar} style={{ background: v.color }}>
                    {v.initials}
                  </div>
                  <div className={styles.vendInfo}>
                    <div className={styles.vendNombre}>{v.nombre}</div>
                    <div className={styles.vendRole}>
                      {v.role === 'ADMIN' ? 'Administrador' : 'Asesor de ventas'}
                    </div>
                  </div>
                  <span className={styles.vendArrow}>›</span>
                </button>
              ))}
            </div>
            {error && <div className={styles.errorMsg}>{error}</div>}
          </>
        )}

        {/* Paso 2: ingresar PIN */}
        {selected && (
          <div className={styles.pinWrap}>
            <div
              className={styles.vendBtn}
              style={{ cursor: 'default', marginBottom: 20, borderColor: 'var(--color-border-info)' }}
            >
              <div className={styles.vendAvatar} style={{ background: selected.color }}>
                {selected.initials}
              </div>
              <div className={styles.vendInfo}>
                <div className={styles.vendNombre}>{selected.nombre}</div>
                <div className={styles.vendRole}>
                  {selected.role === 'ADMIN' ? 'Administrador' : 'Asesor de ventas'}
                </div>
              </div>
              <button
                className={styles.cambiarBtn}
                onClick={() => { setSelected(null); setPin(''); setError('') }}
              >Cambiar</button>
            </div>

            {/* Dots PIN visuales */}
            <div className={styles.pinDots}>
              {[0,1,2,3].map(i => (
                <div
                  key={i}
                  className={`${styles.pinDot} ${i < pin.length ? styles.pinDotFilled : ''}`}
                />
              ))}
            </div>

            {/* Input oculto que captura el PIN */}
            <input
              ref={pinRef}
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={handlePinChange}
              maxLength={4}
              className={styles.pinInput}
              placeholder="••••"
              disabled={checking}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />

            {error && <div className={styles.errorMsg}>{error}</div>}

            <button
              className={styles.btnEntrar}
              onClick={() => handleLogin()}
              disabled={pin.length !== 4 || checking}
            >
              {checking ? 'Verificando...' : 'Entrar'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
