import { errorResponse, json, methodNotAllowed, RequestError } from './_shared/http.mjs'
import {
  isPaymentApprovedStatus,
  publicStatusLabel,
} from './_shared/order-state.mjs'
import { getOrder } from './_shared/orders.mjs'

export default async function handler(request) {
  if (request.method !== 'GET') return methodNotAllowed(['GET'])

  try {
    const orderId = new URL(request.url).searchParams.get('orderId')?.trim()
    if (!orderId || orderId.length > 120) {
      throw new RequestError('INVALID_ORDER_ID', 'El código de pedido no es válido.')
    }

    const order = await getOrder(orderId)
    if (!order) {
      throw new RequestError('ORDER_NOT_FOUND', 'No encontramos el pedido.', 404)
    }

    return json({
      orderId: order.id,
      status: order.status,
      statusLabel: publicStatusLabel(order.status),
      paymentApproved: isPaymentApprovedStatus(order.status),
      paymentStatus: order.payment?.status || 'pending',
      branch: order.branch,
      updatedAt: order.updatedAt || order.createdAt,
      timeline: (order.timeline || []).slice(-8).map((entry) => ({
        status: entry.status,
        label: publicStatusLabel(entry.status),
        at: entry.at,
      })),
    })
  } catch (error) {
    return errorResponse(error)
  }
}

export const config = { path: '/api/order-status' }
