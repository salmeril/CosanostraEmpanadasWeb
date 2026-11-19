import { getStore } from '@netlify/blobs'

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
