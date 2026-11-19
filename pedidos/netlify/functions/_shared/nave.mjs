import { RequestError } from './http.mjs'

const REQUIRED_NAVE_KEYS = [
  'NAVE_CLIENT_ID',
  'NAVE_CLIENT_SECRET',
  'NAVE_POS_ID',
  'NAVE_API_BASE_URL',
  'NAVE_TOKEN_URL',
]

export function naveReadiness() {
  const missing = REQUIRED_NAVE_KEYS.filter((key) => !process.env[key])
  return {
    provider: process.env.PAYMENT_PROVIDER || 'mock',
    environment: process.env.NAVE_ENVIRONMENT || 'sandbox',
    configured: missing.length === 0,
    missing,
  }
}

export async function createPaymentSession(order, request) {
  const provider = process.env.PAYMENT_PROVIDER || 'mock'

  if (provider !== 'nave') {
    const origin = new URL(request.url).origin
    return {
      provider: 'mock',
      status: 'approved',
      checkoutId: `MOCK-${order.id}`,
      checkoutUrl: `${origin}/?payment=approved&order=${encodeURIComponent(order.id)}&demo=1`,
      message: 'Pago simulado. No se realizó ningún cobro.',
    }
  }

  const readiness = naveReadiness()
  if (!readiness.configured) {
    throw new RequestError(
      'NAVE_NOT_CONFIGURED',
      'Faltan credenciales del entorno sandbox de Nave.',
      503,
      { missing: readiness.missing },
    )
  }

  // Punto único de integración.
  // Se implementa cuando Nave entregue al comercio el contrato oficial de API:
  // autenticación, endpoint de checkout, firma de webhook y estados.
  // No se inventan URLs ni campos de pago para evitar un conector inseguro.
  throw new RequestError(
    'NAVE_CONTRACT_PENDING',
    'Las credenciales están cargadas, pero falta mapear el contrato oficial de la API de Nave.',
    503,
  )
}
