import { errorResponse, json, methodNotAllowed, readJson, RequestError } from './_shared/http.mjs'
import { patchOrder } from './_shared/orders.mjs'

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

    const statusByPayment = {
      approved: 'paid',
      rejected: 'payment_rejected',
      pending: 'payment_pending',
    }
    const order = await patchOrder(event.orderId, {
      status: statusByPayment[event.status],
      payment: { provider: 'mock', status: event.status },
    })
    if (!order) throw new RequestError('ORDER_NOT_FOUND', 'No encontramos el pedido.', 404)

    return json({ received: true, orderId: order.id, status: order.status })
  } catch (error) {
    return errorResponse(error)
  }
}

export const config = { path: '/api/webhooks/nave' }
