// config.js — Hidata WhatsApp Sales ERP
// Conectado al backend Node.js en Render
// $0 infraestructura · multitenant · open source

const API_URL = import.meta.env.VITE_API_URL || 'https://whatsapp-sales-backend.onrender.com'

// ============================================
// VENDEDORES — configuración del tenant
// ============================================
export const VENDEDORES = [
  {
    id: 'joan',
    nombre: 'Joan',
    apellido: 'Hidalgo',
    initials: 'JH',
    color: '#ff6b35',
    instancia: 'peru-exporta-joan',
  },
  {
    id: 'cristina',
    nombre: 'Cristina',
    apellido: '',
    initials: 'CR',
    color: '#7c3aed',
    instancia: 'peru-exporta-cristina',
  },
  {
    id: 'francisco',
    nombre: 'Francisco',
    apellido: '',
    initials: 'FR',
    color: '#16a34a',
    instancia: 'peru-exporta-francisco',
  },
]

// ============================================
// COLUMNAS DEL KANBAN
// Normalización correcta — resuelve bug tilde
// ============================================
export const COLS = [
  {
    id: 'nuevo',
    label: 'Nuevos',
    color: '#9ca3af',
    estados: ['nuevo', 'esperando', 'acumulando', 'reactivado', 'reactivado2', 'revisar manual']
  },
  {
    id: 'por_llamar',
    label: 'Por llamar',
    color: '#f97316',
    estados: ['por_llamar', 'pendiente llamar']
  },
  {
    id: 'no_contesto',
    label: 'No contestó',
    color: '#eab308',
    estados: ['no_contesto', 'no contestó', 'no contesto']
  },
  {
    id: 'agendado',
    label: 'Agendado',
    color: '#3b82f6',
    estados: ['agendado']
  },
  {
    id: 'mat_enviado',
    label: 'Mat. enviado',
    color: '#7c3aed',
    estados: ['mat_enviado', 'material enviado']
  },
  {
    id: 'cerrado',
    label: 'Cerrado',
    color: '#16a34a',
    estados: ['cerrado']
  },
]

// ============================================
// NORMALIZACIÓN — resuelve bug tilde y variantes
// Esta función es la clave del fix del Kanban
// ============================================
export function normalizarEstado(estado) {
  if (!estado) return 'nuevo'
  const e = estado.trim().toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes
    .replace(/\s+/g, '_')            // espacios a guiones bajos

  // Mapeo de estados legacy de Apps Script a estados nuevos
  const mapa = {
    'esperando':        'nuevo',
    'acumulando':       'nuevo',
    'reactivado':       'nuevo',
    'reactivado2':      'nuevo',
    'revisar_manual':   'nuevo',
    'pendiente_llamar': 'por_llamar',
    'no_contesto':      'no_contesto',
    'no_contesto':      'no_contesto',
    'material_enviado': 'mat_enviado',
  }
  return mapa[e] || e
}

// ============================================
// API — LEADS
// GET /leads — lista de leads del vendedor
// ============================================
export async function getLeads(vendedorId = null) {
  const params = new URLSearchParams()
  if (vendedorId) params.append('vendedor', vendedorId)

  const res = await fetch(`${API_URL}/leads?${params}`, {
    headers: { 'Content-Type': 'application/json' }
  })
  if (!res.ok) throw new Error(`Error ${res.status} al obtener leads`)
  return res.json()
}

// ============================================
// API — MOVER LEAD (Kanban)
// PUT /leads/:id — actualiza estado
// ============================================
export async function moverLead(leadId, colId) {
  const res = await fetch(`${API_URL}/leads/${leadId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado: colId })
  })
  if (!res.ok) throw new Error(`Error ${res.status} al mover lead`)
  return res.json()
}

// ============================================
// API — ENVIAR MENSAJE MANUAL
// POST /leads/:id/mensaje
// ============================================
export async function enviarMensaje(leadId, mensaje) {
  const res = await fetch(`${API_URL}/leads/${leadId}/mensaje`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contenido: mensaje })
  })
  if (!res.ok) throw new Error(`Error ${res.status} al enviar mensaje`)
  return res.json()
}

// ============================================
// API — ACCIONES DEL CRM
// Enviar material, marcar no contestó, etc.
// ============================================
export async function doAction(leadId, accion, extra = {}) {
  const res = await fetch(`${API_URL}/leads/${leadId}/accion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accion, ...extra })
  })
  if (!res.ok) throw new Error(`Error ${res.status} en acción ${accion}`)
  return res.json()
}

// ============================================
// API — REPORTES
// GET /reportes — métricas del tenant
// ============================================
export async function getReportes(vendedorId = null) {
  const params = new URLSearchParams()
  if (vendedorId) params.append('vendedor', vendedorId)

  const res = await fetch(`${API_URL}/reportes?${params}`)
  if (!res.ok) throw new Error(`Error ${res.status} al obtener reportes`)
  return res.json()
}

// ============================================
// UTILIDADES — tiempo y formato
// ============================================
export function calcMin(fecha) {
  if (!fecha) return 999
  try {
    // Soporta formato ISO (nuevo backend) y formato legacy (Apps Script)
    const date = new Date(fecha)
    if (!isNaN(date.getTime())) {
      return Math.floor((Date.now() - date.getTime()) / 60000)
    }
    // Formato legacy: dd/mm/yyyy hh:mm
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

// ============================================
// PROCESAMIENTO DE LEADS
// Normaliza estados, calcula tiempos, ordena
// ============================================
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
