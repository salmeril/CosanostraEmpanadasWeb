export const ORDER_STATUS = Object.freeze({
  AWAITING_PAYMENT: 'awaiting_payment',
  PAYMENT_PENDING: 'payment_pending',
  PAID: 'paid',
  PAYMENT_REJECTED: 'payment_rejected',
  PAYMENT_EXPIRED: 'payment_expired',
  SENT_TO_BRANCH: 'sent_to_branch',
  RECEIVED: 'received',
  PREPARING: 'preparing',
  READY: 'ready',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
})

const TRANSITIONS = Object.freeze({
  [ORDER_STATUS.AWAITING_PAYMENT]: new Set([
    ORDER_STATUS.PAYMENT_PENDING,
    ORDER_STATUS.PAID,
    ORDER_STATUS.PAYMENT_REJECTED,
    ORDER_STATUS.PAYMENT_EXPIRED,
    ORDER_STATUS.CANCELLED,
  ]),
  [ORDER_STATUS.PAYMENT_PENDING]: new Set([
    ORDER_STATUS.PAID,
    ORDER_STATUS.PAYMENT_REJECTED,
    ORDER_STATUS.PAYMENT_EXPIRED,
    ORDER_STATUS.CANCELLED,
  ]),
  [ORDER_STATUS.PAID]: new Set([ORDER_STATUS.SENT_TO_BRANCH]),
  [ORDER_STATUS.SENT_TO_BRANCH]: new Set([ORDER_STATUS.RECEIVED]),
  [ORDER_STATUS.RECEIVED]: new Set([ORDER_STATUS.PREPARING]),
  [ORDER_STATUS.PREPARING]: new Set([ORDER_STATUS.READY]),
  [ORDER_STATUS.READY]: new Set([
    ORDER_STATUS.OUT_FOR_DELIVERY,
    ORDER_STATUS.DELIVERED,
  ]),
  [ORDER_STATUS.OUT_FOR_DELIVERY]: new Set([ORDER_STATUS.DELIVERED]),
  [ORDER_STATUS.PAYMENT_REJECTED]: new Set(),
  [ORDER_STATUS.PAYMENT_EXPIRED]: new Set(),
  [ORDER_STATUS.DELIVERED]: new Set(),
  [ORDER_STATUS.CANCELLED]: new Set(),
})

export function canTransition(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) return true
  return TRANSITIONS[currentStatus]?.has(nextStatus) || false
}

export function paymentStatusToOrderStatus(paymentStatus) {
  const statuses = {
    approved: ORDER_STATUS.PAID,
    pending: ORDER_STATUS.PAYMENT_PENDING,
    rejected: ORDER_STATUS.PAYMENT_REJECTED,
    expired: ORDER_STATUS.PAYMENT_EXPIRED,
    canceled: ORDER_STATUS.CANCELLED,
    cancelled: ORDER_STATUS.CANCELLED,
  }
  return statuses[paymentStatus] || null
}

export function isPaymentApprovedStatus(status) {
  return [
    ORDER_STATUS.PAID,
    ORDER_STATUS.SENT_TO_BRANCH,
    ORDER_STATUS.RECEIVED,
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.READY,
    ORDER_STATUS.OUT_FOR_DELIVERY,
    ORDER_STATUS.DELIVERED,
  ].includes(status)
}

export function publicStatusLabel(status) {
  const labels = {
    [ORDER_STATUS.AWAITING_PAYMENT]: 'Esperando el pago',
    [ORDER_STATUS.PAYMENT_PENDING]: 'Validando el pago',
    [ORDER_STATUS.PAID]: 'Pago aprobado',
    [ORDER_STATUS.PAYMENT_REJECTED]: 'Pago rechazado',
    [ORDER_STATUS.PAYMENT_EXPIRED]: 'Pago vencido',
    [ORDER_STATUS.SENT_TO_BRANCH]: 'Enviado al local',
    [ORDER_STATUS.RECEIVED]: 'Recibido por el local',
    [ORDER_STATUS.PREPARING]: 'En preparación',
    [ORDER_STATUS.READY]: 'Listo',
    [ORDER_STATUS.OUT_FOR_DELIVERY]: 'En camino',
    [ORDER_STATUS.DELIVERED]: 'Entregado',
    [ORDER_STATUS.CANCELLED]: 'Cancelado',
  }
  return labels[status] || 'Estado no disponible'
}
