import test from 'node:test'
import assert from 'node:assert/strict'

import {
  ORDER_STATUS,
  canTransition,
  isPaymentApprovedStatus,
  paymentStatusToOrderStatus,
} from '../netlify/functions/_shared/order-state.mjs'

test('un pedido pendiente puede pasar a pagado', () => {
  assert.equal(
    canTransition(ORDER_STATUS.PAYMENT_PENDING, ORDER_STATUS.PAID),
    true,
  )
})

test('un pedido pagado no puede volver a pendiente', () => {
  assert.equal(
    canTransition(ORDER_STATUS.PAID, ORDER_STATUS.PAYMENT_PENDING),
    false,
  )
})

test('repetir el mismo estado es idempotente', () => {
  assert.equal(canTransition(ORDER_STATUS.PAID, ORDER_STATUS.PAID), true)
})

test('los estados de Nave se traducen a estados internos', () => {
  assert.equal(paymentStatusToOrderStatus('approved'), ORDER_STATUS.PAID)
  assert.equal(
    paymentStatusToOrderStatus('rejected'),
    ORDER_STATUS.PAYMENT_REJECTED,
  )
  assert.equal(paymentStatusToOrderStatus('unknown'), null)
})

test('los estados operativos posteriores conservan el pago aprobado', () => {
  assert.equal(isPaymentApprovedStatus(ORDER_STATUS.PREPARING), true)
  assert.equal(isPaymentApprovedStatus(ORDER_STATUS.PAYMENT_PENDING), false)
})
