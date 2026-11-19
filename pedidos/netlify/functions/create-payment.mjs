import { createPaymentSession } from './_shared/nave.mjs'
import { errorResponse, json, methodNotAllowed, readJson, RequestError } from './_shared/http.mjs'
import { getOrder, patchOrder } from './_shared/orders.mjs'

export default async function handler(request) {
  if (request.method !== 'POST') return methodNotAllowed()

  try {
    const { orderId } = await readJson(request)
    const order = await getOrder(orderId)
    if (!order) throw new RequestError('ORDER_NOT_FOUND', 'No encontramos el pedido.', 404)
    if (order.status !== 'awaiting_payment') {
      throw new RequestError('INVALID_ORDER_STATUS', 'El pedido no está esperando un pago.', 409)
    }

    const payment = await createPaymentSession(order, request)
    await patchOrder(order.id, {
      status: payment.status === 'approved' ? 'paid' : 'payment_pending',
      payment: {
        provider: payment.provider,
        status: payment.status,
        checkoutId: payment.checkoutId,
      },
    })

    return json(payment)
  } catch (error) {
    return errorResponse(error)
  }
}

export const config = { path: '/api/create-payment' }
