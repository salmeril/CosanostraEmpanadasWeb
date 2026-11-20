export const catalogLastSyncedAt = '2026-11-20'

export const branches = [
  { id: 'maritimo', name: 'B. Marítimo', shortAddress: 'Hudson · Calle 53 N.º 3104', deliveryFee: 1800, minOrder: 9000, image: '/assets/branches/maritimo.webp' },
  { id: 'ranelagh', name: 'Ranelagh', shortAddress: 'Ranelagh · Calle 137 N.º 2802', deliveryFee: 1500, minOrder: 9000, image: '/assets/branches/ranelagh.webp' },
  { id: 'berazategui', name: 'Berazategui', shortAddress: 'Berazategui · Calle 149 N.º 895', deliveryFee: 1600, minOrder: 8500, image: '/assets/branches/berazategui.webp' },
  { id: 'quilmes', name: 'Quilmes', shortAddress: 'Quilmes · Humberto Primo 162', deliveryFee: 1500, minOrder: 9500, image: '/assets/branches/quilmes.webp' },
]

const categoryRows = [
  ['todos', 'Todo el menú'], ['promos', 'Promos'], ['empanadas', 'Empanadas clásicas'],
  ['gourmet', 'Empanadas gourmet'], ['pizzas', 'Pizzas'], ['salsas', 'Salsas'],
  ['calzones', 'Calzones'], ['sugerencias', 'Sugerencias'], ['wraps', 'Wraps y tacos'],
  ['ensaladas', 'Ensaladas'], ['tapeos', 'Tapeos'], ['milanesas', 'Milanesas'],
  ['tablas', 'Tablas'], ['infantil', 'Menú infantil'], ['burgers', 'Burgers'],
  ['papas', 'Papas'], ['postres', 'Postres'], ['bebidas', 'Bebidas'],
]

export const categories = categoryRows.map(([id, label]) => ({ id, label }))
const categoryLabels = Object.fromEntries(categoryRows)

const categoryImages = {
  promos: '/assets/products/calabresa.webp', empanadas: '/assets/products/jamon-y-queso.webp',
  gourmet: '/assets/products/matambre-a-la-pizza.webp', pizzas: '/assets/products/pizza-cosa-nostra-real.jpg',
  salsas: '/assets/products/cuatro-quesos.webp', calzones: '/assets/products/pizza-cosa-nostra.png',
  sugerencias: '/assets/products/matambre-a-la-pizza.webp', wraps: '/assets/products/pollo-al-verdeo.webp',
  ensaladas: '/assets/products/verdura.webp', tapeos: '/assets/products/jamon-y-queso.webp',
  milanesas: '/assets/products/matambre-a-la-pizza.webp', tablas: '/assets/products/cuatro-quesos.webp',
  infantil: '/assets/products/jamon-y-queso.webp', burgers: '/assets/products/panceta-y-ciruela.webp',
  papas: '/assets/products/cuatro-quesos.webp', postres: '/assets/products/palmito.webp',
  bebidas: '/assets/products/calabaza-y-choclo.webp',
}

const namedImages = {
  'jamón y queso': '/assets/products/jamon-y-queso.webp', 'carne dulce': '/assets/products/carne-dulce.webp',
  verdura: '/assets/products/verdura.webp', 'pollo al champignone': '/assets/products/pollo-al-champinon.webp',
  'pollo al verdeo': '/assets/products/pollo-al-verdeo.webp', 'ciruela y panceta': '/assets/products/panceta-y-ciruela.webp',
  'matambre a la pizza': '/assets/products/matambre-a-la-pizza.webp', 'cuatro quesos': '/assets/products/cuatro-quesos.webp',
  'calabaza y choclo': '/assets/products/calabaza-y-choclo.webp', calabresa: '/assets/products/calabresa.webp',
  germana: '/assets/products/germana.webp', palmitos: '/assets/products/palmito.webp',
}

function slug(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function product(branchId, category, name, price, description = '', options = {}) {
  return {
    id: `${branchId}-${category}-${options.idSuffix || slug(name)}`,
    branchId, category, name, price,
    description: description || categoryLabels[category],
    image: options.image || namedImages[name.toLocaleLowerCase('es')] || categoryImages[category],
    badge: options.badge || categoryLabels[category],
    ...(options.selectionCount ? {
      configurationType: 'empanada-flavors',
      selectionCount: options.selectionCount,
      allowedFlavorCategories: ['empanadas', 'gourmet'],
    } : {}),
  }
}

const makeRows = (branchId, category, entries) => entries.map(
  ([name, price, description = '', options = {}]) => product(branchId, category, name, price, description, options),
)

const classics = [
  ['Carne', 3700, 'Carne vacuna, cebolla, morrón, verdeo, huevo y especias.'],
  ['Pollo', 3700, 'Pollo, cebolla, morrón, tomate y especias.'],
  ['Jamón y queso', 3700, 'Jamón cocido y abundante muzzarella.'],
  ['Verdura', 3700, 'Acelga salteada y salsa bechamel.'],
  ['Humita', 3700, 'Choclo entero y cremoso con salsa bechamel.'],
  ['Roquefort con jamón', 3700, 'Queso azul, jamón y muzzarella.'],
  ['Capresse', 3700, 'Tomates, albahaca, ajo y muzzarella.'],
  ['Calabresa', 3700, 'Longaniza calabresa y muzzarella.'],
  ['Palmitos', 3700, 'Palmitos, muzzarella y salsa golf.'],
  ['Cebolla y queso', 3700, 'Cebolla salteada, muzzarella y condimentos.'],
  ['Atún', 3700, 'Atún, cebolla, pimientos y salsa golf.'],
  ['Provoleta', 3700, 'Provolone, muzzarella y condimentos.'],
  ['Carne dulce', 3700, 'Carne, cebolla, pimientos y pasas de uva.'],
]

const gourmet = [
  ['Calabaza y choclo', 4200, 'Calabaza asada, choclo, muzzarella y bechamel.'],
  ['Bondiola BBQ', 4200, 'Bondiola braseada, cebolla caramelizada y BBQ.'],
  ['Ciruela y panceta', 4200, 'Muzzarella, ciruela y panceta ahumada.'],
  ['Cuatro quesos', 4200, 'Muzzarella, provolone, reggianito y roquefort.'],
  ['Germana', 4200, 'Muzzarella, salchicha ahumada y mostaza.'],
  ['Carne cortada a cuchillo', 4200, 'Carne, papa, cebolla, verdeo, ajo y un toque picante.'],
  ['Vacío y provoleta', 4200, 'Vacío desmenuzado, vegetales, papa y provoleta.'],
  ['Matambre a la pizza', 4200, 'Matambre, cebolla, pimientos, tomate y muzzarella.'],
  ['Cheese Burger', 4200, 'Carne, cebolla caramelizada, panceta, cheddar y BBQ.'],
  ['Pollo al verdeo', 4200, 'Pollo, verdeo, vino blanco y crema.'],
  ['Pollo al champignone', 4200, 'Pollo, cebolla, champiñones, vino blanco y crema.'],
  ['Verdura con provolone', 4200, 'Acelga, bechamel y provolone.'],
  ['Chicken Cheese', 4200, 'Pollo, cebolla, panceta, BBQ y cheddar.'],
  ['Osobuco al vino tinto', 4200, 'Osobuco braseado con vegetales y papa.'],
]

const empanadaPromos = [
  ['Promo individual', 9500, 'Dos empanadas a elección y una gaseosa en lata.', 2],
  ['Pack box x3', 11500, 'Tres empanadas a elección y una salsa.', 3],
  ['Pack box x6', 22500, 'Seis empanadas a elección y dos salsas.', 6],
  ['Pack box x8', 30000, 'Ocho empanadas a elección y tres salsas.', 8],
  ['Pack box x12', 45000, 'Doce empanadas a elección y tres salsas.', 12],
  ['Pack familiar', 50000, 'Doce empanadas, tres salsas y una gaseosa de 1,5 l.', 12],
]

const dips = price => ['Ketchup', 'Barbacoa', 'Alioli', 'Cheddar', 'Picante'].map(name => [name, price])
const drinks = [
  ['Gaseosa 1,5 l', 5000, 'Coca-Cola, Coca-Cola Zero, Fanta o Sprite.'],
  ['Gaseosa 500 ml', 3500, 'Coca-Cola, Fanta o Sprite.'],
  ['Gaseosa en lata', 2500, 'Coca-Cola o Sprite.'],
  ['Aquarius 1,5 l', 4000, 'Pera, pomelo, uva, manzana o naranja.'],
  ['Aquarius 500 ml', 3500, 'Pomelo, pera, manzana o naranja.'],
  ['Agua mineral 1,5 l', 4000],
]

function standardMenu(branchId, dipPrice = 1100) {
  const promos = empanadaPromos.map(([name, price, description, count]) =>
    product(branchId, 'promos', name, price, description, { selectionCount: count }),
  )
  return [
    ...promos, ...makeRows(branchId, 'empanadas', classics), ...makeRows(branchId, 'gourmet', gourmet),
    ...makeRows(branchId, 'salsas', dips(dipPrice)), ...makeRows(branchId, 'bebidas', drinks),
  ]
}

const pizzaRows = [
  ['Muzzarella', 'Salsa y muzzarella.', [['Mediana', 16000], ['Grande', 20000]]],
  ['Especial', 'Muzzarella, jamón y morrones.', [['Mediana', 24000], ['Grande', 30000]]],
  ['Napolitana', 'Muzzarella, tomate, ajo y parmesano.', [['Mediana', 23800], ['Grande', 29700]]],
  ['Romana', 'Muzzarella, jamón, tomate, ajo y parmesano.', [['Mediana', 25000], ['Grande', 31200]]],
  ['Calabresa', 'Muzzarella y longaniza calabresa.', [['Mediana', 21450], ['Grande', 26800]]],
  ['Calabresa al roquefort', 'Calabresa, muzzarella y queso azul.', [['Mediana', 23650], ['Grande', 29550]]],
  ['Roquefort', 'Muzzarella y queso azul.', [['Mediana', 21600], ['Grande', 27000]]],
  ['Anchoas', 'Salsa y anchoas.', [['Mediana', 16500], ['Grande', 20650]]],
  ['Anchoas con muzza', 'Muzzarella y anchoas.', [['Mediana', 20800], ['Grande', 26000]]],
  ['Venezolana', 'Muzzarella, jamón, huevo y parmesano.', [['Mediana', 25000], ['Grande', 31200]]],
  ['Vizcaína', 'Muzzarella, cebolla, tomate y anchoas.', [['Mediana', 20800], ['Grande', 26000]]],
  ['Cosa Nostra', 'Jamón, palmitos, huevo, pimientos y salsa golf.', [['Mediana', 28500], ['Grande', 35500]]],
  ['Palmitos', 'Jamón, palmitos y salsa golf.', [['Mediana', 27000], ['Grande', 33700]]],
  ['Americana', 'Muzzarella, jamón y huevo.', [['Mediana', 22700], ['Grande', 28350]]],
  ['Carioca', 'Jamón, ananá, azúcar negra y cerezas.', [['Mediana', 25000], ['Grande', 31200]]],
  ['Humita', 'Choclo, salsa blanca y parmesano.', [['Grande', 28350]]],
  ['Marinera', 'Muzzarella, huevo y parmesano.', [['Mediana', 21600], ['Grande', 27000]]],
  ['Fugazza', 'Cebolla y condimentos.', [['Mediana', 17600], ['Grande', 22000]]],
  ['Fugazza con muzza', 'Cebolla y muzzarella.', [['Mediana', 19500], ['Grande', 24000]]],
  ['Fugazza al roque', 'Muzzarella, queso azul y cebolla.', [['Mediana', 19600], ['Grande', 24500]]],
  ['Huevos fritos', 'Muzzarella, jamón y huevos fritos.', [['Mediana', 23600], ['Grande', 29500]]],
  ['Capresse', 'Muzzarella, tomate y albahaca.', [['Mediana', 22500], ['Grande', 28000]]],
  ['Provolone', 'Muzzarella y provolone.', [['Mediana', 24000], ['Grande', 30000]]],
  ['Champignones', 'Jamón, salsa blanca y champiñones.', [['Grande', 32600]]],
  ['Cuatro quesos', 'Muzzarella, parmesano, azul y provolone.', [['Mediana', 23600], ['Grande', 29500]]],
  ['Burger', 'Carne, cheddar, panceta y cebolla caramelizada.', [['Grande', 32600]]],
  ['Criolla', 'Cebolla, panceta y huevo.', [['Mediana', 21450], ['Grande', 26800]]],
  ['Huevos fritos y bacon', 'Muzzarella, panceta y huevos fritos.', [['Mediana', 25500], ['Grande', 31500]]],
  ['Jamón', 'Muzzarella y jamón.', [['Mediana', 22400], ['Grande', 28000]]],
  ['Panceta y cheddar', 'Muzzarella, cheddar y panceta.', [['Mediana', 25000], ['Grande', 31200]]],
  ['Germana', 'Muzzarella, salchicha y mostaza.', [['Mediana', 22000], ['Grande', 27500]]],
  ['Rúcula con parmesano', 'Rúcula y parmesano.', [['Mediana', 23600], ['Grande', 29600]]],
  ['Rúcula con jamón crudo', 'Rúcula y jamón crudo.', [['Mediana', 25000], ['Grande', 31200]]],
  ['Fugazzetta rellena', 'Muzzarella, jamón y cebolla.', [['Mediana', 31600], ['Grande', 35750]]],
  ['Fugazzetone relleno', 'Muzzarella, jamón, tomate y cebolla.', [['Mediana', 34350], ['Grande', 38500]]],
  ['Fainá', 'Porción de fainá.', [['Unidad', 2800]]],
]

function pizzas(branchId) {
  return pizzaRows.flatMap(([name, description, variants]) => variants.map(([size, price]) =>
    product(branchId, 'pizzas', `${name} · ${size}`, price, description, {
      idSuffix: `${slug(name)}-${slug(size)}`, image: '/assets/products/pizza-cosa-nostra-real.jpg', badge: `Pizza ${size}`,
    }),
  ))
}

const pizzaPromos = [
  ['Promo pizza 1', 11500, 'Fugazzetta, fainá y gaseosa.'],
  ['Promo pizza 2', 26500, 'Una muzzarella y cuatro fainá.'],
  ['Promo pizza 3', 37500, 'Una muzzarella y seis empanadas clásicas.'],
  ['Promo pizza 4', 52600, 'Dos muzzarellas y una fugazza.'],
  ['Promo pizza 5', 67600, 'Una muzzarella, una especial y una napolitana.'],
]

const calzones = [
  ['Calzone de palmitos', 34350, 'Muzzarella, jamón, palmitos y salsa golf.'],
  ['Calzone calabrés', 31600, 'Muzzarella, longaniza, tomate y condimentos.'],
  ['Calzone Cosa Nostra', 38500, 'Muzzarella, jamón, palmitos, pimiento y salsa golf.'],
  ['Calzone napolitano', 30250, 'Muzzarella, jamón, tomate, ajo y queso rallado.'],
]

const maritimoExtras = {
  sugerencias: [
    ['Bife de chorizo', 28000, 'A caballo, con morrones y papas fritas.'], ['Ñoquis de papa', 10000, 'Con salsa blanca o fileto.'],
    ['Tortilla española', 8500, 'Papa, cebolla y chorizo colorado.'], ['Sándwich de bondiola', 10000, 'Bondiola, cheddar y cebolla caramelizada.'],
  ],
  wraps: [
    ['Wrap César', 17000], ['Mexican wrap', 18500], ['Wrap clásico', 16000], ['Tacos', 20000],
  ],
  ensaladas: [
    ['Rúcula y parmesano', 14000], ['Capresse', 12000], ['Caesar', 13000], ['Mediterránea', 14000],
  ],
  tapeos: [
    ['Empanaditas tucumanas', 16000], ['Tequeños', 16000], ['Nachos con cheddar', 13500], ['Rabas', 22000],
    ['Bastones de muzzarella', 12000], ['Aros de cebolla', 11000], ['Fingers de pollo', 13000],
  ],
  milanesas: [
    ['Porteña · individual', 22000], ['Porteña · para 2', 34500], ['Porteña · para 4', 48500],
    ['Fugazzetta · individual', 19000], ['Fugazzetta · para 2', 32500], ['Fugazzetta · para 4', 46500],
    ['Clásica · individual', 15000], ['Clásica · para 2', 27600], ['Clásica · para 4', 39000],
    ['Napolitana · individual', 19000], ['Napolitana · para 2', 32500], ['Napolitana · para 4', 46500],
    ['Americana · individual', 22000], ['Cuatro quesos · individual', 22000], ['Romana · individual', 22000],
    ['Sándwich tucumano', 10000],
  ],
  tablas: [
    ['Tabla fría · chica', 43000], ['Tabla fría · grande', 50000], ['Tabla caliente · chica', 55000], ['Tabla caliente · grande', 70000],
  ],
  infantil: [
    ['Milanesita', 14500, 'Incluye bebida y papas.'], ['Hamburguesa con queso', 14500, 'Incluye bebida y papas.'],
    ['Supremitas', 14500, 'Incluye bebida y papas.'],
  ],
  burgers: [
    ['French Burger · simple', 16350], ['French Burger · doble', 21500], ['La clásica · simple', 13500], ['La clásica · doble', 16500],
    ['Americana · simple', 16350], ['Americana · doble', 21500], ['Homenaje al Big · simple', 14000], ['Homenaje al Big · doble', 17000],
    ['Porteña · simple', 15000], ['Cheese Burger · simple', 13000], ['Cheese Burger · doble', 15000], ['Pinche Cabrona · simple', 15000],
  ],
  papas: [
    ['Papas a la provenzal', 12500], ['Papas patagónicas', 14500], ['Papas clásicas', 12500], ['Papas bacon', 15000],
    ['Papas con cheddar', 14000], ['Papas cuatro quesos', 16000],
  ],
  postres: [
    ['Matilda', 8500], ['Choco Oreo', 7800], ['Tiramisú', 7000], ['Cheesecake', 8000], ['Chocotorta', 7000], ['Flan mixto', 4500],
  ],
}

const extrasFor = (branchId, groups) => Object.entries(groups).flatMap(([category, entries]) => makeRows(branchId, category, entries))

const productsByBranch = {
  ranelagh: [
    ...makeRows('ranelagh', 'promos', pizzaPromos), ...standardMenu('ranelagh'), ...pizzas('ranelagh'), ...makeRows('ranelagh', 'calzones', calzones),
  ],
  berazategui: [
    ...standardMenu('berazategui', 1000), ...makeRows('berazategui', 'postres', [['Franui', 12000, 'Chocolate con leche o amargo.']]),
  ],
  quilmes: standardMenu('quilmes'),
  maritimo: [
    ...makeRows('maritimo', 'promos', pizzaPromos.filter(([name]) => name !== 'Promo pizza 3')),
    ...standardMenu('maritimo'), ...pizzas('maritimo'), ...makeRows('maritimo', 'calzones', calzones), ...extrasFor('maritimo', maritimoExtras),
  ],
}

export const products = Object.values(productsByBranch).flat()
const productById = new Map(products.map(item => [item.id, item]))

export const getBranch = branchId => branches.find(branch => branch.id === branchId)
export const getProduct = productId => productById.get(productId)
export const getProductsForBranch = branchId => productsByBranch[branchId] || []
export const getCategoryLabel = categoryId => categoryLabels[categoryId] || categoryId
export const getCategoriesForBranch = branchId => {
  const available = new Set(getProductsForBranch(branchId).map(item => item.category))
  return categories.filter(item => item.id === 'todos' || available.has(item.id))
}
export const getEmpanadaFlavors = branchId => getProductsForBranch(branchId)
  .filter(item => ['empanadas', 'gourmet'].includes(item.category))
