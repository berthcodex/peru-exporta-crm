const BASE = import.meta.env.VITE_API_URL || 'https://whatsapp-sales-backend.onrender.com'

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  })
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`)
  return res.json()
}

export const api = {
  // Campañas
  getCampaigns:      ()           => req('GET',    '/campaigns'),
  getCampaign:       (id)         => req('GET',    `/campaigns/${id}`),
  createCampaign:    (data)       => req('POST',   '/campaigns', data),
  updateCampaign:    (id, data)   => req('PUT',    `/campaigns/${id}`, data),
  deleteCampaign:    (id)         => req('DELETE', `/campaigns/${id}`),

  // Pasos (save completo)
  saveSteps:         (id, steps)  => req('PUT',    `/campaigns/${id}/steps`, { steps }),

  // Triggers
  addTrigger:        (id, texto)  => req('POST',   `/campaigns/${id}/triggers`, { texto }),
  deleteTrigger:     (id, tid)    => req('DELETE', `/campaigns/${id}/triggers/${tid}`),

  // Test trigger
  testTrigger:       (campaignId, mensaje) =>
    req('POST', '/campaigns/test-trigger', { campaignId, mensaje }),

  // Vendors
  getVendors:        ()           => req('GET',    '/vendors'),

  // Sprint 3 Bug 4: activar campaña exclusiva
  activarCampaign:   (id)         => req('PATCH',  `/campaigns/${id}/activar`),
}
