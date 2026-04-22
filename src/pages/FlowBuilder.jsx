import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'

// ─── Utilidades ────────────────────────────────────────────────
const STEP_TYPES = {
  MSG:      { label: 'Mensaje al lead',      color: '#EAF3DE', border: '#C0DD97', text: '#3B6D11', icon: '💬' },
  FOLLOWUP: { label: 'Seguimiento (silencio)', color: '#FAEEDA', border: '#FAC775', text: '#854F0B', icon: '⏰' },
  NOTIFY:   { label: 'Notificar vendedor',   color: '#E6F1FB', border: '#B5D4F4', text: '#185FA5', icon: '🔔' },
}

const VARS = ['{{telefono}}', '{{nombre}}', '{{vendedor}}', '{{curso}}']

function normalize(s) {
  return s.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').trim()
}

// ─── StepCard ──────────────────────────────────────────────────
function StepCard({ step, index, total, onChange, onDelete, onInsertVar }) {
  const [showPreview, setShowPreview] = useState(false)
  const t = STEP_TYPES[step.tipo]

  const previewMsg = step.mensaje
    .replace('{{telefono}}', '+51 924 104 066')
    .replace('{{nombre}}', 'Carlos')
    .replace('{{vendedor}}', 'Cristina')
    .replace('{{curso}}', 'Mi Primera Exportación')

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {index > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', height: 16 }}>
          <div style={{ width: 1, background: 'var(--border)', height: '100%' }} />
        </div>
      )}
      <div style={{
        background: 'var(--color-background-primary)',
        border: `0.5px solid ${t.border}`,
        borderRadius: 12,
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '8px 12px',
          background: t.color,
          borderBottom: `0.5px solid ${t.border}`,
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: t.text, color: '#fff',
            fontSize: 11, fontWeight: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>{index + 1}</div>

          <span style={{ fontSize: 13, marginRight: 2 }}>{t.icon}</span>

          <select
            value={step.tipo}
            onChange={e => onChange({ ...step, tipo: e.target.value })}
            style={{
              fontSize: 12, padding: '3px 8px',
              border: `0.5px solid ${t.border}`,
              borderRadius: 8, background: 'var(--color-background-primary)',
              color: 'var(--color-text-primary)', cursor: 'pointer'
            }}
          >
            {Object.entries(STEP_TYPES).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>

          {step.tipo === 'FOLLOWUP' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
              <span style={{ fontSize: 11, color: t.text }}>Si no responde en</span>
              <select
                value={step.followupHrs || 2}
                onChange={e => onChange({ ...step, followupHrs: Number(e.target.value) })}
                style={{
                  fontSize: 11, padding: '2px 6px',
                  border: `0.5px solid ${t.border}`,
                  borderRadius: 6, background: 'var(--color-background-primary)',
                  color: t.text
                }}
              >
                {[1,2,3,6,12,24].map(h => (
                  <option key={h} value={h}>{h}h</option>
                ))}
              </select>
            </div>
          )}

          <span
            onClick={() => setShowPreview(p => !p)}
            style={{ marginLeft: 'auto', fontSize: 11, color: '#185FA5', cursor: 'pointer', textDecoration: 'underline' }}
          >{showPreview ? 'Ocultar preview' : 'Ver preview'}</span>

          <button
            onClick={onDelete}
            disabled={total <= 1}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 14, color: 'var(--color-text-secondary)',
              padding: '2px 4px', opacity: total <= 1 ? 0.3 : 1
            }}
          >✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
            {step.tipo === 'NOTIFY' ? 'MENSAJE INTERNO AL VENDEDOR' : 'MENSAJE AL LEAD'}
          </div>

          <textarea
            value={step.mensaje}
            onChange={e => onChange({ ...step, mensaje: e.target.value })}
            rows={4}
            placeholder={step.tipo === 'NOTIFY'
              ? 'Ej: 🔔 Nuevo lead en MPX\n📱 Teléfono: {{telefono}}\nContactar hoy 👆'
              : 'Escribe el mensaje que enviará el bot...'
            }
            style={{
              width: '100%', padding: '8px 10px',
              border: '0.5px solid var(--color-border-secondary)',
              borderRadius: 8, fontSize: 12,
              color: 'var(--color-text-primary)',
              background: 'var(--color-background-primary)',
              resize: 'none', fontFamily: 'var(--font-sans)',
              lineHeight: 1.6
            }}
          />

          {/* Variables */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
            {VARS.map(v => (
              <span
                key={v}
                onClick={() => onInsertVar(step, v, onChange)}
                style={{
                  padding: '2px 7px', background: '#E6F1FB',
                  border: '0.5px solid #B5D4F4', borderRadius: 99,
                  fontSize: 10, color: '#185FA5', cursor: 'pointer', fontWeight: 500
                }}
              >{v}</span>
            ))}
          </div>

          {/* Preview WhatsApp */}
          {showPreview && (
            <div style={{
              marginTop: 10, background: 'var(--color-background-secondary)',
              borderRadius: 8, padding: 10
            }}>
              <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginBottom: 6, fontWeight: 500 }}>
                PREVIEW — DATOS DE EJEMPLO
              </div>
              <div style={{
                background: step.tipo === 'NOTIFY' ? '#FFF9C4' : '#DCF8C6',
                borderRadius: '12px 12px 0 12px',
                padding: '8px 12px', fontSize: 12,
                color: '#111', lineHeight: 1.6,
                maxWidth: '85%', marginLeft: 'auto',
                whiteSpace: 'pre-wrap'
              }}>{previewMsg}</div>
              <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', textAlign: 'right', marginTop: 4 }}>
                {step.tipo === 'NOTIFY' ? 'Vendedor ve esto' : 'Lead ve esto'} · ahora
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── TriggerSection ────────────────────────────────────────────
function TriggerSection({ campaign, onAddTrigger, onDeleteTrigger }) {
  const [input, setInput] = useState('')
  const [testInput, setTestInput] = useState('')
  const [testResult, setTestResult] = useState(null)

  const handleAdd = () => {
    const val = input.trim().toLowerCase()
    if (!val) return
    onAddTrigger(val)
    setInput('')
  }

  const handleTest = () => {
    if (!testInput.trim()) return
    const n = normalize(testInput)
    const matched = campaign.triggers?.find(t => n.includes(normalize(t.texto)))
    setTestResult({ ok: !!matched, trigger: matched?.texto })
  }

  return (
    <div style={{
      background: 'var(--color-background-primary)',
      border: '0.5px solid #FAC775',
      borderRadius: 12, overflow: 'hidden', marginBottom: 10
    }}>
      <div style={{
        padding: '10px 14px', background: '#FAEEDA',
        borderBottom: '0.5px solid #FAC775',
        display: 'flex', alignItems: 'center', gap: 8
      }}>
        <span style={{ fontSize: 14 }}>⚡</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#854F0B' }}>
            Mensaje del anuncio — activa este flujo
          </div>
          <div style={{ fontSize: 11, color: '#BA7517', marginTop: 1 }}>
            El bot detecta estas palabras cuando llega el lead desde tu ad
          </div>
        </div>
      </div>

      <div style={{ padding: 14 }}>
        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {campaign.triggers?.map(t => (
            <span key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 10px', background: '#FAEEDA',
              border: '0.5px solid #FAC775', borderRadius: 99,
              fontSize: 12, color: '#854F0B', fontWeight: 500
            }}>
              {t.texto}
              <span
                onClick={() => onDeleteTrigger(t.id)}
                style={{ cursor: 'pointer', fontSize: 14, color: '#BA7517', lineHeight: 1 }}
              >×</span>
            </span>
          ))}
        </div>

        {/* Agregar trigger */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Agregar palabra o frase del anuncio..."
            style={{
              flex: 1, padding: '6px 10px',
              border: '0.5px solid var(--color-border-secondary)',
              borderRadius: 8, fontSize: 12,
              color: 'var(--color-text-primary)',
              background: 'var(--color-background-primary)'
            }}
          />
          <button onClick={handleAdd} style={{
            padding: '6px 14px', background: 'var(--color-background-secondary)',
            border: '0.5px solid var(--color-border-secondary)',
            borderRadius: 8, fontSize: 12, cursor: 'pointer',
            color: 'var(--color-text-primary)'
          }}>+ Agregar</button>
        </div>

        {/* Simulador */}
        <div style={{
          background: 'var(--color-background-secondary)',
          borderRadius: 8, padding: 10
        }}>
          <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
            PROBAR DETECCIÓN — simula el mensaje del lead
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={testInput}
              onChange={e => { setTestInput(e.target.value); setTestResult(null) }}
              onKeyDown={e => e.key === 'Enter' && handleTest()}
              placeholder="Escribe como si fueras el lead..."
              style={{
                flex: 1, padding: '6px 10px',
                border: '0.5px solid var(--color-border-secondary)',
                borderRadius: 8, fontSize: 12,
                color: 'var(--color-text-primary)',
                background: 'var(--color-background-primary)'
              }}
            />
            <button onClick={handleTest} style={{
              padding: '6px 14px', background: '#185FA5',
              border: 'none', borderRadius: 8,
              fontSize: 12, color: '#E6F1FB', cursor: 'pointer', fontWeight: 500
            }}>Probar</button>
          </div>

          {testResult && (
            <div style={{
              marginTop: 8, padding: '7px 10px', borderRadius: 8, fontSize: 12,
              background: testResult.ok ? '#EAF3DE' : '#FCEBEB',
              color: testResult.ok ? '#3B6D11' : '#A32D2D'
            }}>
              {testResult.ok
                ? `✓ El bot detecta este mensaje y activa el flujo (trigger: "${testResult.trigger}")`
                : `✗ El bot no reconoce este mensaje. Agrega una palabra clave si quieres cubrirlo.`
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── FlowBuilder (página principal) ───────────────────────────
export default function FlowBuilder() {
  const [campaigns, setCampaigns] = useState([])
  const [selected, setSelected] = useState(null)
  const [steps, setSteps] = useState([])
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [newForm, setNewForm] = useState({ slug: '', nombre: '', vendorId: '' })

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 2500)
  }

  useEffect(() => {
    Promise.all([api.getCampaigns(), api.getVendors()])
      .then(([camps, vends]) => { setCampaigns(camps); setVendors(vends) })
      .finally(() => setLoading(false))
  }, [])

  const selectCampaign = (c) => {
    setSelected(c)
    setSteps(c.steps.map(s => ({ ...s })))
  }

  const handleSaveSteps = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const saved = await api.saveSteps(selected.id, steps)
      setSteps(saved)
      setCampaigns(cs => cs.map(c => c.id === selected.id ? { ...c, steps: saved } : c))
      showToast('Flujo guardado ✓')
    } catch { showToast('Error al guardar', false) }
    finally { setSaving(false) }
  }

  const handleToggleActive = async () => {
    if (!selected) return
    const updated = await api.updateCampaign(selected.id, { activa: !selected.activa })
    setCampaigns(cs => cs.map(c => c.id === selected.id ? { ...c, activa: updated.activa } : c))
    setSelected(s => ({ ...s, activa: updated.activa }))
    showToast(`Campaña ${updated.activa ? 'activada' : 'pausada'} ✓`)
  }

  const handleAddTrigger = async (texto) => {
    const t = await api.addTrigger(selected.id, texto)
    const updTriggers = [...(selected.triggers || []), t]
    setCampaigns(cs => cs.map(c => c.id === selected.id ? { ...c, triggers: updTriggers } : c))
    setSelected(s => ({ ...s, triggers: updTriggers }))
  }

  const handleDeleteTrigger = async (tid) => {
    await api.deleteTrigger(selected.id, tid)
    const updTriggers = selected.triggers.filter(t => t.id !== tid)
    setCampaigns(cs => cs.map(c => c.id === selected.id ? { ...c, triggers: updTriggers } : c))
    setSelected(s => ({ ...s, triggers: updTriggers }))
  }

  const addStep = () => {
    setSteps(ss => [...ss, {
      id: Date.now(), tipo: 'MSG', mensaje: '', followupHrs: 2, orden: ss.length + 1
    }])
  }

  const updateStep = (index, newStep) => {
    setSteps(ss => ss.map((s, i) => i === index ? newStep : s))
  }

  const deleteStep = (index) => {
    if (steps.length <= 1) return
    setSteps(ss => ss.filter((_, i) => i !== index))
  }

  const insertVar = (step, varStr, onChange) => {
    onChange({ ...step, mensaje: step.mensaje + varStr })
  }

  const handleCreateCampaign = async () => {
    const { slug, nombre, vendorId } = newForm
    if (!slug || !nombre || !vendorId) { showToast('Completa todos los campos', false); return }
    const c = await api.createCampaign({
      slug, nombre, vendorId: Number(vendorId),
      triggers: [slug.toLowerCase()],
      steps: [{ tipo: 'MSG', mensaje: '', orden: 1 }]
    })
    setCampaigns(cs => [...cs, c])
    setShowNewModal(false)
    setNewForm({ slug: '', nombre: '', vendorId: '' })
    selectCampaign(c)
    showToast(`Campaña ${c.slug} creada ✓`)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: 'var(--color-text-secondary)', fontSize: 13 }}>
      Cargando campañas...
    </div>
  )

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', position: 'relative' }}>

      {/* Sidebar */}
      <div style={{
        width: 220, flexShrink: 0,
        background: 'var(--color-background-primary)',
        borderRight: '0.5px solid var(--color-border-tertiary)',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: 12, borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
          <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
            Campañas
          </div>
          <button onClick={() => setShowNewModal(true)} style={{
            width: '100%', padding: '7px 10px',
            background: 'var(--color-background-secondary)',
            border: '0.5px solid var(--color-border-secondary)',
            borderRadius: 8, fontSize: 12,
            color: 'var(--color-text-primary)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <span style={{ fontSize: 15 }}>+</span> Nueva campaña
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 6 }}>
          {campaigns.map(c => (
            <div
              key={c.id}
              onClick={() => selectCampaign(c)}
              style={{
                padding: '8px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 2,
                background: selected?.id === c.id ? '#E6F1FB' : 'transparent'
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 500, color: selected?.id === c.id ? '#185FA5' : 'var(--color-text-primary)' }}>
                {c.slug}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 1 }}>{c.nombre}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{
                  fontSize: 10, padding: '1px 6px', borderRadius: 99, fontWeight: 500,
                  background: c.activa ? '#EAF3DE' : 'var(--color-background-secondary)',
                  color: c.activa ? '#3B6D11' : 'var(--color-text-secondary)'
                }}>{c.activa ? 'Activa' : 'Pausada'}</span>
                <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>{c.steps?.length || 0} pasos</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Header */}
        <div style={{
          padding: '12px 20px',
          background: 'var(--color-background-primary)',
          borderBottom: '0.5px solid var(--color-border-tertiary)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {selected ? `${selected.slug} — ${selected.nombre}` : 'Constructor de flujos'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 1 }}>
              {selected
                ? `Vendedor: ${selected.vendor?.nombre} · ${steps.length} pasos · ${selected.triggers?.length || 0} triggers`
                : 'Selecciona una campaña para editar su flujo'
              }
            </div>
          </div>
          {selected && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleToggleActive} style={{
                padding: '5px 12px', background: 'transparent',
                border: '0.5px solid var(--color-border-secondary)',
                borderRadius: 8, fontSize: 12, cursor: 'pointer',
                color: 'var(--color-text-secondary)'
              }}>
                {selected.activa ? 'Pausar' : 'Activar'}
              </button>
              <button onClick={handleSaveSteps} disabled={saving} style={{
                padding: '5px 14px', background: saving ? '#378ADD' : '#185FA5',
                border: 'none', borderRadius: 8, fontSize: 12,
                color: '#E6F1FB', cursor: 'pointer', fontWeight: 500
              }}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {!selected ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '100%', color: 'var(--color-text-secondary)', gap: 8
            }}>
              <div style={{ fontSize: 28, opacity: .3 }}>◈</div>
              <div style={{ fontSize: 12 }}>Selecciona una campaña para editar su flujo</div>
            </div>
          ) : (
            <>
              <TriggerSection
                campaign={selected}
                onAddTrigger={handleAddTrigger}
                onDeleteTrigger={handleDeleteTrigger}
              />

              {steps.map((step, i) => (
                <StepCard
                  key={step.id}
                  step={step}
                  index={i}
                  total={steps.length}
                  onChange={(updated) => updateStep(i, updated)}
                  onDelete={() => deleteStep(i)}
                  onInsertVar={insertVar}
                />
              ))}

              <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
                <button onClick={addStep} style={{
                  padding: '8px 20px',
                  border: '0.5px dashed var(--color-border-secondary)',
                  borderRadius: 8, fontSize: 12,
                  color: 'var(--color-text-secondary)',
                  background: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5
                }}>
                  <span>+</span> Agregar paso
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal nueva campaña */}
      {showNewModal && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20
        }}>
          <div style={{
            background: 'var(--color-background-primary)',
            borderRadius: 12, padding: 20, width: 300,
            border: '0.5px solid var(--color-border-tertiary)'
          }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 14, color: 'var(--color-text-primary)' }}>
              Nueva campaña
            </div>
            {[
              { label: 'Slug (código corto, máx 6 letras)', key: 'slug', placeholder: 'Ej: EXPO24', upper: true },
              { label: 'Nombre completo', key: 'nombre', placeholder: 'Ej: Exporta en 24 días' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 4 }}>{f.label}</div>
                <input
                  value={newForm[f.key]}
                  onChange={e => setNewForm(p => ({ ...p, [f.key]: f.upper ? e.target.value.toUpperCase() : e.target.value }))}
                  placeholder={f.placeholder}
                  maxLength={f.key === 'slug' ? 6 : undefined}
                  style={{
                    width: '100%', padding: '7px 9px',
                    border: '0.5px solid var(--color-border-secondary)',
                    borderRadius: 8, fontSize: 12,
                    color: 'var(--color-text-primary)',
                    background: 'var(--color-background-primary)'
                  }}
                />
              </div>
            ))}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Vendedor asignado</div>
              <select
                value={newForm.vendorId}
                onChange={e => setNewForm(p => ({ ...p, vendorId: e.target.value }))}
                style={{
                  width: '100%', padding: '7px 9px',
                  border: '0.5px solid var(--color-border-secondary)',
                  borderRadius: 8, fontSize: 12,
                  color: 'var(--color-text-primary)',
                  background: 'var(--color-background-primary)'
                }}
              >
                <option value="">Seleccionar...</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.nombre} ({v.role})</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
              <button onClick={() => setShowNewModal(false)} style={{
                padding: '5px 12px', background: 'transparent',
                border: '0.5px solid var(--color-border-secondary)',
                borderRadius: 8, fontSize: 12, cursor: 'pointer',
                color: 'var(--color-text-secondary)'
              }}>Cancelar</button>
              <button onClick={handleCreateCampaign} style={{
                padding: '5px 14px', background: '#185FA5',
                border: 'none', borderRadius: 8,
                fontSize: 12, color: '#E6F1FB', cursor: 'pointer', fontWeight: 500
              }}>Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute', bottom: 16, right: 16,
          background: toast.ok ? '#185FA5' : '#A32D2D',
          color: '#E6F1FB', padding: '8px 16px',
          borderRadius: 8, fontSize: 12, zIndex: 99, fontWeight: 500
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
