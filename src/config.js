export const VENDEDORES = [
  {
    id: 'joan',
    nombre: 'Joan',
    apellido: 'Hidalgo',
    initials: 'JH',
    color: '#ff6b35',
    apiUrl: 'https://script.google.com/macros/s/AKfycbx3-wLw2utcbVnyw9wMXMjVHapoisMpP_yOg-5jYRV-hN38-KLMh_kV9gqcihpnS8V_JA/exec',
  },
  // { id: 'cristina', nombre: 'Cristina', apellido: 'López', initials: 'CL', color: '#3b82f6', apiUrl: '...' },
  // { id: 'francisco', nombre: 'Francisco', apellido: 'Ruiz', initials: 'FR', color: '#16a34a', apiUrl: '...' },
]

export const COLS = [
  { id: 'nuevos',           label: 'Nuevos',        color: '#9ca3af', estados: ['esperando','acumulando','reactivado','reactivado2','revisar manual'] },
  { id: 'pendiente llamar', label: 'Por llamar',     color: '#f97316', estados: ['pendiente llamar'] },
  { id: 'no contestó',      label: 'No contestó',    color: '#eab308', estados: ['no contestó','no contesto'] },
  { id: 'agendado',         label: 'Agendado',       color: '#3b82f6', estados: ['agendado'] },
  { id: 'material enviado', label: 'Mat. enviado',   color: '#7c3aed', estados: ['material enviado'] },
  { id: 'cerrado',          label: 'Cerrado',        color: '#16a34a', estados: ['cerrado'] },
]

export async function getLeads(apiUrl) {
  const res = await fetch(`${apiUrl}?action=leads`)
  if (!res.ok) throw new Error('Error')
  return res.json()
}

export async function doAction(apiUrl, action, phone, fila, extra = '') {
  let url = `${apiUrl}?action=${action}&phone=${phone}&fila=${fila}`
  if (extra) url += `&hora=${encodeURIComponent(extra)}`
  const res = await fetch(url)
  return res.json()
}

export async function moverLead(apiUrl, phone, fila, nuevoEstado) {
  const url = `${apiUrl}?action=mover&phone=${phone}&fila=${fila}&estado=${encodeURIComponent(nuevoEstado)}`
  const res = await fetch(url)
  return res.json()
}

export function calcMin(fecha) {
  if (!fecha) return 999
  try {
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
    const min = calcMin(l.fecha)
    return { ...l, min, minFmt: fmtMin(min), urgente: ['esperando','pendiente llamar'].includes(l.estado) && min >= 30 }
  }).sort((a, b) => {
    if (a.urgente && !b.urgente) return -1
    if (!a.urgente && b.urgente) return 1
    return a.min - b.min
  })
}
