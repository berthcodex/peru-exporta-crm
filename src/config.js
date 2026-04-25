// config.js — Hidata WhatsApp Sales ERP v4.0
// Fix Bug 2: role definido en getReportes
// Fix Bug 3: moverLead firma correcta (leadId, colId)
// Fix Bug 4: VENDEDORES viene de DB, no hardcodeado
// Fix Bug 5: doAction firma correcta

const API_URL = import.meta.env.VITE_API_URL || 'https://whatsapp-sales-backend.onrender.com'

// ============================================
// COLUMNAS DEL KANBAN
// ============================================
export const COLS = [
  { id: 'nuevo',       label: 'Nuevos',      color: '#9ca3af', estados: ['nuevo', 'esperando', 'acumulando', 'reactivado', 'revisar manual'] },
  { id: 'por_llamar',  label: 'Por llamar',  color: '#f97316', estados: ['por_llamar', 'pendiente llamar'] },
  { id: 'no_contesto', label: 'No contestó', color: '#eab308', estados: ['no_contesto', 'no contestó', 'no contesto'] },
  { id: 'agendado',    label: 'Agendado',    color: '#3b82f6', estados: ['agendado'] },
  { id: 'mat_enviado', label: 'Mat. enviado',color: '#7c3aed', estados: ['mat_enviado', 'material enviado'] },
  { id: 'cerrado',     label: 'Cerrado',     color: '#16a34a', estados: ['cerrado'] },
]

// ============================================
// NORMALIZACIÓN
// ============================================
export function normalizarEstado(estado) {
  if (!estado) return 'nuevo'
  const e = estado.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
  const mapa = {
    'esperando':        'nuevo',
    'acumulando':       'nuevo',
    'reactivado':       'nuevo',
    'reactivado2':      'nuevo',
    'revisar_manual':   'nuevo',
    'pendiente_llamar': 'por_llamar',
    'material_enviado': 'mat_enviado',
  }
  return mapa[e] || e
}

// ============================================
// API — LEADS
// ============================================
export async function getLeads(vendedorId = null, role = null) {
  const params = new URLSearchParams()
  if (vendedorId) params.append('vendorId', vendedorId)
  if (role) params.append('role', role)
  const res = await fetch(`${API_URL}/leads?${params}`)
  if (!res.ok) throw new Error(`Error ${res.status} al obtener leads`)
  return res.json()
}

// Fix Bug 3: firma correcta — recibe (leadId, colId)
export async function moverLead(leadId, colId) {
  const res = await fetch(`${API_URL}/leads/${leadId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado: colId })
  })
  if (!res.ok) throw new Error(`Error ${res.status} al mover lead`)
  return res.json()
}

// Fix Bug 5: firma correcta — recibe (leadId, accion)
export async function doAction(leadId, accion) {
  const res = await fetch(`${API_URL}/leads/${leadId}/accion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accion })
  })
  if (!res.ok) throw new Error(`Error ${res.status} en acción ${accion}`)
  return res.json()
}

export async function enviarMensaje(leadId, mensaje) {
  const res = await fetch(`${API_URL}/leads/${leadId}/mensaje`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contenido: mensaje })
  })
  if (!res.ok) throw new Error(`Error ${res.status} al enviar mensaje`)
  return res.json()
}

// Nuevo: historial de mensajes para el Inbox
export async function getMensajes(leadId) {
  const res = await fetch(`${API_URL}/leads/${leadId}/mensajes`)
  if (!res.ok) throw new Error(`Error ${res.status} al obtener mensajes`)
  return res.json()
}

// Fix Bug 2: role como parámetro explícito
export async function getReportes(vendedorId = null, role = null) {
  const params = new URLSearchParams()
  if (vendedorId) params.append('vendorId', vendedorId)
  if (role) params.append('role', role)
  const res = await fetch(`${API_URL}/reportes?${params}`)
  if (!res.ok) throw new Error(`Error ${res.status} al obtener reportes`)
  return res.json()
}

export async function getBotConfig() {
  const res = await fetch(`${API_URL}/config/bot`)
  if (!res.ok) throw new Error(`Error ${res.status} al obtener bot config`)
  return res.json()
}

export async function saveBotConfig(data) {
  const res = await fetch(`${API_URL}/config/bot`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error(`Error ${res.status} al guardar bot config`)
  return res.json()
}

export async function getVendedores() {
  const res = await fetch(`${API_URL}/config/vendedores`)
  if (!res.ok) throw new Error(`Error ${res.status} al obtener vendedores`)
  return res.json()
}

export async function createVendedor(data) {
  const res = await fetch(`${API_URL}/config/vendedores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Error ${res.status}`)
  }
  return res.json()
}

export async function updateVendedor(id, data) {
  const res = await fetch(`${API_URL}/config/vendedores/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error(`Error ${res.status} al actualizar vendedor`)
  return res.json()
}

export async function desactivarVendedor(id) {
  const res = await fetch(`${API_URL}/config/vendedores/${id}/desactivar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  })
  if (!res.ok) throw new Error(`Error ${res.status} al desactivar vendedor`)
  return res.json()
}

// ============================================
// PROCESAMIENTO DE LEADS
// ============================================
export function calcMin(fecha) {
  if (!fecha) return 999
  try {
    const date = new Date(fecha)
    if (!isNaN(date.getTime())) return Math.floor((Date.now() - date.getTime()) / 60000)
    const p = fecha.match(/(\d+)\/(\d+)\/(\d+) (\d+):(\d+)/)
    if (!p) return 999
    return Math.floor((Date.now() - new Date(p[3], p[2]-1, p[1], p[4], p[5])) / 60000)
  } catch { return 999 }
}

export function fmtMin(min) {
  if (!min || min >= 999) return '—'
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60), m = min % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function processLeads(raw) {
  return raw.map(l => {
    const min = calcMin(l.creadoEn || l.fecha || l.ultimoTimestamp)
    const estado = normalizarEstado(l.estado)
    return {
      ...l,
      estado,
      min,
      minFmt: fmtMin(min),
      urgente: ['nuevo', 'por_llamar'].includes(estado) && min >= 30
    }
  }).sort((a, b) => {
    if (a.urgente && !b.urgente) return -1
    if (!a.urgente && b.urgente) return 1
    return a.min - b.min
  })
}
