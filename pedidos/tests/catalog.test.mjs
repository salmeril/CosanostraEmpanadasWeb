import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getCategoriesForBranch,
  getEmpanadaFlavors,
  getProduct,
  getProductsForBranch,
} from '../shared/catalog.mjs'

test('cada sucursal obtiene únicamente sus productos', () => {
  for (const branchId of ['maritimo', 'ranelagh', 'berazategui', 'quilmes']) {
    const products = getProductsForBranch(branchId)
    assert.ok(products.length > 0)
    assert.equal(products.every(product => product.branchId === branchId), true)
  }
})

test('los precios reales quedan asociados al producto y local', () => {
  assert.equal(getProduct('quilmes-empanadas-carne').price, 3700)
  assert.equal(getProduct('ranelagh-pizzas-muzzarella-grande').price, 20000)
})

test('las categorías cambian según la carta del local', () => {
  const berazategui = getCategoriesForBranch('berazategui').map(item => item.id)
  const maritimo = getCategoriesForBranch('maritimo').map(item => item.id)
  assert.equal(berazategui.includes('pizzas'), false)
  assert.equal(maritimo.includes('milanesas'), true)
})

test('los sabores configurables pertenecen a la sucursal elegida', () => {
  const flavors = getEmpanadaFlavors('berazategui')
  assert.equal(flavors.length, 27)
  assert.equal(flavors.every(product => product.branchId === 'berazategui'), true)
})
