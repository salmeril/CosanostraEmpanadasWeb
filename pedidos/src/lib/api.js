import { getBranch, getProduct } from '../../shared/catalog.mjs'

const delay = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

function buildMockOrder(payload) {
  const branch = getBranch(payload.branchId)
  const items = payload.items.map(({ productId, quantity, configuration }) => {
    const product = getProduct(productId)
    return {
      productId,
      name: product.name,
      quantity,
      unitPrice: product.price,
      lineTotal: product.price * quantity,
      configuration: configuration || null,
    }
  })
  const subtotal = items.reduce((total, item) => total + item.lineTotal, 0)
  const deliveryFee = payload.fulfillment === 'delivery' ? branch.deliveryFee : 0

  return {
    id: `CN-DEMO-${Date.now().toString(36).toUpperCase()}`,
    status: 'awaiting_payment',
    mode: 'mock',
    branch: { id: branch.id, name: branch.name },
    customer: payload.customer,
    fulfillment: payload.fulfillment,
    address: payload.address,
    notes: payload.notes,
    items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    createdAt: new Date().toISOString(),
  }
}

async function request(path, options) {
  const response = await fetch(path, {
    headers: { 'content-type': 'application/json' },
    ...options,
  })

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) throw new Error('API_NOT_AVAILABLE')

  const data = await response.json()
  if (!response.ok) throw new Error(data.message || 'No se pudo completar la operación.')
  return data
}

export async function createOrder(payload) {
  const apiMode = import.meta.env.VITE_API_MODE || 'auto'

  if (apiMode === 'mock') {
    await delay(700)
    return buildMockOrder(payload)
  }

  try {
    return await request('/api/create-order', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  } catch (error) {
    if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_LOCAL_MOCK !== 'false') {
      await delay(500)
      return buildMockOrder(payload)
    }
    throw error
  }
}

export async function createPayment(order) {
  if (order.mode === 'mock' || import.meta.env.VITE_API_MODE === 'mock') {
    await delay(650)
    return {
      provider: 'mock',
      status: 'approved',
      checkoutUrl: `/?payment=approved&order=${encodeURIComponent(order.id)}&demo=1`,
    }
  }

  return request('/api/create-payment', {
    method: 'POST',
    body: JSON.stringify({ orderId: order.id }),
  })
}
