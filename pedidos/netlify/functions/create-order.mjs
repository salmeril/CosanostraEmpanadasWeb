import { branches, getBranch, getProduct } from '../../shared/catalog.mjs'
import { errorResponse, json, methodNotAllowed, readJson, RequestError } from './_shared/http.mjs'
import { saveOrder } from './_shared/orders.mjs'

const MAX_ITEM_QUANTITY = 50

function cleanText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function normalizeConfiguration(product, rawConfiguration) {
  if (!product.configurationType) return null

  if (
    rawConfiguration?.type !== product.configurationType ||
    !Array.isArray(rawConfiguration?.selections)
  ) {
    throw new RequestError(
      'INVALID_CONFIGURATION',
      `Falta elegir los sabores de ${product.name}.`,
    )
  }

  const selections = rawConfiguration.selections.map((rawSelection) => {
    const flavor = getProduct(rawSelection?.productId)
    const quantity = Number(rawSelection?.quantity)

    if (!flavor || !['empanadas', 'gourmet'].includes(flavor.category)) {
      throw new RequestError('INVALID_FLAVOR', 'Uno de los sabores elegidos no está disponible.')
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > product.selectionCount) {
      throw new RequestError('INVALID_FLAVOR_QUANTITY', `Cantidad inválida para ${flavor.name}.`)
    }

    return { productId: flavor.id, name: flavor.name, quantity }
  })

  const selectedCount = selections.reduce((sum, selection) => sum + selection.quantity, 0)
  if (selectedCount !== product.selectionCount) {
    throw new RequestError(
      'INCOMPLETE_CONFIGURATION',
      `${product.name} debe tener exactamente ${product.selectionCount} empanadas.`,
    )
  }

  return { type: product.configurationType, selections }
}

function normalizeItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new RequestError('EMPTY_CART', 'El carrito está vacío.')
  }

  const grouped = new Map()
  const configured = []
  for (const rawItem of rawItems) {
    const product = getProduct(rawItem?.productId)
    const quantity = Number(rawItem?.quantity)

    if (!product) {
      throw new RequestError('INVALID_PRODUCT', 'Uno de los productos ya no está disponible.')
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_ITEM_QUANTITY) {
      throw new RequestError('INVALID_QUANTITY', `Cantidad inválida para ${product.name}.`)
    }

    if (product.configurationType) {
      if (quantity !== 1) {
        throw new RequestError(
          'INVALID_CONFIGURED_QUANTITY',
          `Agregá cada ${product.name} por separado para elegir sus sabores.`,
        )
      }

      configured.push({
        productId: product.id,
        name: product.name,
        quantity: 1,
        unitPrice: product.price,
        lineTotal: product.price,
        configuration: normalizeConfiguration(product, rawItem.configuration),
      })
      continue
    }

    grouped.set(product.id, (grouped.get(product.id) || 0) + quantity)
  }

  const simpleItems = [...grouped.entries()].map(([productId, quantity]) => {
    if (quantity > MAX_ITEM_QUANTITY) {
      throw new RequestError('INVALID_QUANTITY', 'La cantidad máxima por producto es 50.')
    }

    const product = getProduct(productId)
    return {
      productId,
      name: product.name,
      quantity,
      unitPrice: product.price,
      lineTotal: product.price * quantity,
      configuration: null,
    }
  })

  return [...simpleItems, ...configured]
}

function makeOrderId() {
  const time = Date.now().toString(36).toUpperCase()
  const random = crypto.randomUUID().split('-')[0].toUpperCase()
  return `CN-${time}-${random}`
}

export default async function handler(request) {
  if (request.method !== 'POST') return methodNotAllowed()

  try {
    const payload = await readJson(request)
    const branch = getBranch(payload.branchId)
    if (!branch) {
      throw new RequestError(
        'INVALID_BRANCH',
        'La sucursal seleccionada no existe.',
        400,
        { available: branches.map(({ id }) => id) },
      )
    }

    const fulfillment = payload.fulfillment === 'pickup' ? 'pickup' : 'delivery'
    const customer = {
      name: cleanText(payload.customer?.name, 100),
      phone: cleanText(payload.customer?.phone, 40),
      email: cleanText(payload.customer?.email, 150).toLowerCase(),
    }
    if (!customer.name || !customer.phone || !customer.email.includes('@')) {
      throw new RequestError('INVALID_CUSTOMER', 'Completá nombre, teléfono y un email válido.')
    }

    const address = fulfillment === 'delivery'
      ? {
          street: cleanText(payload.address?.street, 160),
          city: cleanText(payload.address?.city, 100),
        }
      : null
    if (fulfillment === 'delivery' && (!address.street || !address.city)) {
      throw new RequestError('INVALID_ADDRESS', 'Completá la dirección de entrega.')
    }

    const items = normalizeItems(payload.items)
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
    if (subtotal < branch.minOrder) {
      throw new RequestError(
        'MINIMUM_ORDER',
        `El mínimo de compra de esta sucursal es $${branch.minOrder.toLocaleString('es-AR')}.`,
        400,
        { minimum: branch.minOrder, subtotal },
      )
    }

    const deliveryFee = fulfillment === 'delivery' ? branch.deliveryFee : 0
    const order = {
      id: makeOrderId(),
      status: 'awaiting_payment',
      mode: 'test',
      currency: 'ARS',
      branch: { id: branch.id, name: branch.name },
      customer,
      fulfillment,
      address,
      notes: cleanText(payload.notes, 500),
      items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      createdAt: new Date().toISOString(),
    }

    await saveOrder(order)
    return json(order, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}

export const config = { path: '/api/create-order' }
