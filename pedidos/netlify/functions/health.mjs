import { json, methodNotAllowed } from './_shared/http.mjs'
import { naveReadiness } from './_shared/nave.mjs'

export default async function handler(request) {
  if (request.method !== 'GET') return methodNotAllowed(['GET'])

  return json({
    ok: true,
    app: 'cosa-nostra-pedidos-fase-2',
    stage: 'test',
    payments: naveReadiness(),
    time: new Date().toISOString(),
  })
}

export const config = { path: '/api/health' }
