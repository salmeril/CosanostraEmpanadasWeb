import { errorResponse, json, methodNotAllowed, readJson, RequestError } from './_shared/http.mjs'
import { applyPaymentEvent } from './_shared/orders.mjs'

export default async function handler(request) {
  if (request.method !== 'POST') return methodNotAllowed()

  try {
    if ((process.env.PAYMENT_PROVIDER || 'mock') !== 'mock') {
      throw new RequestError(
        'NAVE_WEBHOOK_CONTRACT_PENDING',
        'El webhook real se habilita al implementar la firma definida por la documentación oficial de Nave.',
        501,
      )
    }

    const event = await readJson(request)
    if (!event.orderId || !['approved', 'rejected', 'pending'].includes(event.status)) {
      throw new RequestError('INVALID_WEBHOOK', 'Evento de prueba inválido.')
    }

    const eventId = event.id || `mock:${event.orderId}:${event.status}`
    const result = await applyPaymentEvent(event.orderId, {
      eventId,
      provider: 'mock',
      paymentStatus: event.status,
      checkoutId: event.checkoutId || null,
    })
    if (!result) throw new RequestError('ORDER_NOT_FOUND', 'No encontramos el pedido.', 404)

    return json({
      received: true,
      duplicate: result.duplicate,
      ignored: result.ignored,
      orderId: result.order.id,
      status: result.order.status,
    })
  } catch (error) {
    return errorResponse(error)
  }
}

export const config = { path: '/api/webhooks/nave' }
