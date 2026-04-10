const BASE = 'https://script.google.com/macros/s/AKfycbx3-wLw2utcbVnyw9wMXMjVHapoisMpP_yOg-5jYRV-hN38-KLMh_kV9gqcihpnS8V_JA/exec'

export async function getLeads() {
  const res = await fetch(`${BASE}?action=leads`)
  return res.json()
}

export async function doAction(action, phone, fila, extra = '') {
  let url = `${BASE}?action=${action}&phone=${phone}&fila=${fila}`
  if (extra) url += `&hora=${encodeURIComponent(extra)}`
  const res = await fetch(url)
  return res.json()
}

export function fmtMin(min) {
  if (!min || min >= 999) return '—'
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function calcMin(fecha) {
  if (!fecha) return 999
  try {
    const p = fecha.match(/(\d+)\/(\d+)\/(\d+) (\d+):(\d+)/)
    if (!p) return 999
    const d = new Date(p[3], p[2] - 1, p[1], p[4], p[5])
    return Math.floor((Date.now() - d) / 60000)
  } catch { return 999 }
}
