// src/components/ConfigBot.jsx
// Pantalla para editar los 7 mensajes del bot conversacional.
// Los cambios se guardan en Supabase vía el backend — el bot
// los usa automáticamente en la siguiente conversación.

import { useState, useEffect } from 'react'
import { getBotConfig, saveBotConfig } from '../config'
import styles from './ConfigBot.module.css'

// Los 7 estados del motor — con etiqueta y descripción para el usuario
const CAMPOS = [
  {
    key: 'msgBienvenida',
    label: 'Bienvenida',
    emoji: '👋',
    desc: 'Primer mensaje que recibe el lead al escribir por primera vez.',
  },
  {
    key: 'msgProducto',
    label: 'Presentación de producto',
    emoji: '📦',
    desc: 'Presenta el curso según el tipo de lead (A o B).',
  },
  {
    key: 'msgExperiencia',
    label: 'Pregunta de experiencia',
    emoji: '❓',
    desc: 'Pregunta si el lead ya exportó antes o va desde cero.',
  },
  {
    key: 'msgPresentacion',
    label: 'Presentación completa',
    emoji: '📋',
    desc: 'Detalle completo del programa cuando el lead pide más info.',
  },
  {
    key: 'msgObjecion',
    label: 'Manejo de objeción',
    emoji: '🙏',
    desc: 'Responde cuando el lead objeta por precio o pide tiempo.',
  },
  {
    key: 'msgUrgencia',
    label: 'Urgencia',
    emoji: '⏰',
    desc: 'Último intento antes de pasar al vendedor — oferta limitada.',
  },
  {
    key: 'msgHandoff',
    label: 'Handoff al vendedor',
    emoji: '📲',
    desc: 'Mensaje final confirmando que un asesor se contactará.',
  },
]

export default function ConfigBot({ onToast }) {
  const [config, setConfig]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [editado, setEditado]   = useState(false)
  const [form, setForm]         = useState({})

  // Cargar config al montar
  useEffect(() => {
    async function load() {
      try {
        const data = await getBotConfig()
        setConfig(data)
        setForm({
          msgBienvenida:   data.msgBienvenida   || '',
          msgProducto:     data.msgProducto     || '',
          msgExperiencia:  data.msgExperiencia  || '',
          msgPresentacion: data.msgPresentacion || '',
          msgObjecion:     data.msgObjecion     || '',
          msgUrgencia:     data.msgUrgencia     || '',
          msgHandoff:      data.msgHandoff      || '',
          nombreEmpresa:   data.nombreEmpresa   || '',
          nombreProducto:  data.nombreProducto  || '',
        })
      } catch (err) {
        onToast('Error al cargar configuración del bot', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function handleChange(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
    setEditado(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await saveBotConfig(form)
      setEditado(false)
      onToast('✅ Configuración guardada — el bot ya usa los nuevos mensajes')
    } catch (err) {
      onToast('Error al guardar: ' + err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    if (!config) return
    setForm({
      msgBienvenida:   config.msgBienvenida   || '',
      msgProducto:     config.msgProducto     || '',
      msgExperiencia:  config.msgExperiencia  || '',
      msgPresentacion: config.msgPresentacion || '',
      msgObjecion:     config.msgObjecion     || '',
      msgUrgencia:     config.msgUrgencia     || '',
      msgHandoff:      config.msgHandoff      || '',
      nombreEmpresa:   config.nombreEmpresa   || '',
      nombreProducto:  config.nombreProducto  || '',
    })
    setEditado(false)
  }

  if (loading) return <div className={styles.loading}>Cargando configuración...</div>

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Mensajes del Bot</h2>
          <p className={styles.sub}>
            Edita los mensajes que el bot envía en cada etapa de la conversación.
            Los cambios se aplican inmediatamente — sin reiniciar nada.
          </p>
        </div>
        <div className={styles.actions}>
          {editado && (
            <button className={styles.btnSecundario} onClick={handleReset}>
              Descartar
            </button>
          )}
          <button
            className={styles.btnPrimario}
            onClick={handleSave}
            disabled={!editado || saving}
          >
            {saving ? 'Guardando...' : '💾 Guardar cambios'}
          </button>
        </div>
      </div>

      {editado && (
        <div className={styles.editadoBanner}>
          ⚠️ Tienes cambios sin guardar
        </div>
      )}

      <div className={styles.empresa}>
        <div className={styles.empresaField}>
          <label className={styles.label}>Nombre de la empresa</label>
          <input
            className={styles.input}
            value={form.nombreEmpresa || ''}
            onChange={e => handleChange('nombreEmpresa', e.target.value)}
          />
        </div>
        <div className={styles.empresaField}>
          <label className={styles.label}>Nombre del producto/curso principal</label>
          <input
            className={styles.input}
            value={form.nombreProducto || ''}
            onChange={e => handleChange('nombreProducto', e.target.value)}
          />
        </div>
      </div>

      <div className={styles.campos}>
        {CAMPOS.map(campo => (
          <div key={campo.key} className={styles.campo}>
            <div className={styles.campoHeader}>
              <span className={styles.campoEmoji}>{campo.emoji}</span>
              <div>
                <div className={styles.campoLabel}>{campo.label}</div>
                <div className={styles.campoDesc}>{campo.desc}</div>
              </div>
            </div>
            <textarea
              className={styles.textarea}
              value={form[campo.key] || ''}
              onChange={e => handleChange(campo.key, e.target.value)}
              rows={5}
              placeholder={`Mensaje de ${campo.label.toLowerCase()}...`}
            />
            <div className={styles.chars}>
              {(form[campo.key] || '').length} caracteres
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <button
          className={styles.btnPrimario}
          onClick={handleSave}
          disabled={!editado || saving}
        >
          {saving ? 'Guardando...' : '💾 Guardar todos los cambios'}
        </button>
      </div>
    </div>
  )
}
