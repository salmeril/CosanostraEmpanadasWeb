import { createPaymentSession } from './_shared/nave.mjs'
import { errorResponse, json, methodNotAllowed, readJson, RequestError } from './_shared/http.mjs'
import { ORDER_STATUS } from './_shared/order-state.mjs'
import { applyPaymentEvent, getOrder } from './_shared/orders.mjs'

export default async function handler(request) {
  if (request.method !== 'POST') return methodNotAllowed()

  try {
    const { orderId } = await readJson(request)
    const order = await getOrder(orderId)
    if (!order) throw new RequestError('ORDER_NOT_FOUND', 'No encontramos el pedido.', 404)

    if (order.payment?.checkoutId) {
      return json({
        ...order.payment,
        orderStatus: order.status,
        idempotent: true,
      })
    }

    if (![ORDER_STATUS.AWAITING_PAYMENT, ORDER_STATUS.PAYMENT_PENDING].includes(order.status)) {
      throw new RequestError('INVALID_ORDER_STATUS', 'El pedido no está esperando un pago.', 409)
    }

    const payment = await createPaymentSession(order, request)
    const update = await applyPaymentEvent(order.id, {
      eventId: `create-payment:${payment.checkoutId}:${payment.status}`,
      provider: payment.provider,
      paymentStatus: payment.status,
      checkoutId: payment.checkoutId,
      checkoutUrl: payment.checkoutUrl,
    })

    return json({
      ...payment,
      orderStatus: update.order.status,
      idempotent: false,
    })
  } catch (error) {
    return errorResponse(error)
  }
}

export const config = { path: '/api/create-payment' }
