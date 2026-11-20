import { getStore } from '@netlify/blobs'
import { RequestError } from './http.mjs'
import {
  canTransition,
  paymentStatusToOrderStatus,
} from './order-state.mjs'

const STORE_NAME = 'cosa-nostra-orders'

function store() {
  return getStore(STORE_NAME)
}

export async function saveOrder(order) {
  await store().setJSON(order.id, order, {
    metadata: {
      status: order.status,
      branchId: order.branch.id,
      createdAt: order.createdAt,
    },
  })
  return order
}

export async function getOrder(orderId) {
  if (!orderId) return null
  return store().get(orderId, { type: 'json' })
}

export async function patchOrder(orderId, changes) {
  const current = await getOrder(orderId)
  if (!current) return null

  const next = {
    ...current,
    ...changes,
    updatedAt: new Date().toISOString(),
  }
  await saveOrder(next)
  return next
}

function statusEntry(status, source, reason = '') {
  return {
    status,
    source,
    reason,
    at: new Date().toISOString(),
  }
}

export async function transitionOrder(
  orderId,
  nextStatus,
  { source = 'system', reason = '', changes = {} } = {},
) {
  const current = await getOrder(orderId)
  if (!current) return null

  if (!canTransition(current.status, nextStatus)) {
    throw new RequestError(
      'INVALID_ORDER_TRANSITION',
      `El pedido no puede pasar de ${current.status} a ${nextStatus}.`,
      409,
    )
  }

  const changed = current.status !== nextStatus
  const timeline = Array.isArray(current.timeline) ? current.timeline : []
  const next = {
    ...current,
    ...changes,
    status: nextStatus,
    timeline: changed
      ? [...timeline, statusEntry(nextStatus, source, reason)]
      : timeline,
    updatedAt: new Date().toISOString(),
  }

  await saveOrder(next)
  return next
}

export async function applyPaymentEvent(
  orderId,
  {
    eventId,
    provider,
    paymentStatus,
    checkoutId = null,
    checkoutUrl = null,
  },
) {
  const current = await getOrder(orderId)
  if (!current) return null

  const processedEvents = Array.isArray(current.processedEvents)
    ? current.processedEvents
    : []

  if (eventId && processedEvents.includes(eventId)) {
    return { order: current, duplicate: true, ignored: false }
  }

  const nextStatus = paymentStatusToOrderStatus(paymentStatus)
  if (!nextStatus) {
    throw new RequestError(
      'UNKNOWN_PAYMENT_STATUS',
      'El estado de pago recibido no está reconocido.',
    )
  }

  const allowed = canTransition(current.status, nextStatus)
  const changed = allowed && current.status !== nextStatus
  const nextEvents = eventId
    ? [...processedEvents, eventId].slice(-50)
    : processedEvents
  const timeline = Array.isArray(current.timeline) ? current.timeline : []

  const next = {
    ...current,
    status: allowed ? nextStatus : current.status,
    payment: allowed
      ? {
          ...current.payment,
          provider,
          status: paymentStatus,
          checkoutId: checkoutId || current.payment?.checkoutId || null,
          checkoutUrl: checkoutUrl || current.payment?.checkoutUrl || null,
          confirmedAt:
            paymentStatus === 'approved'
              ? new Date().toISOString()
              : current.payment?.confirmedAt || null,
        }
      : current.payment,
    processedEvents: nextEvents,
    timeline: changed
      ? [
          ...timeline,
          statusEntry(nextStatus, `payment:${provider}`, `Pago ${paymentStatus}`),
        ]
      : timeline,
    updatedAt: new Date().toISOString(),
  }

  await saveOrder(next)
  return { order: next, duplicate: false, ignored: !allowed }
}
