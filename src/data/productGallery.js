/**
 * Selección provisoria tomada del material compartido por el cliente en Canva.
 * Los nombres quedan centralizados acá para poder validarlos o reemplazarlos
 * sin tocar el componente visual.
 */
export const productGallery = [
  { name: 'Jamón y queso', image: '/assets/products/jamon-y-queso.webp', width: 1076, height: 1440 },
  { name: 'Palmito', image: '/assets/products/palmito.webp', width: 1076, height: 1440 },
  { name: 'Calabresa', image: '/assets/products/calabresa.webp', width: 1076, height: 1440 },
  { name: 'Pollo al champiñón', image: '/assets/products/pollo-al-champinon.webp', width: 1114, height: 1383 },
  { name: 'Calabaza y choclo', image: '/assets/products/calabaza-y-choclo.webp', width: 928, height: 1152 },
  { name: 'Verdura', image: '/assets/products/verdura.webp', width: 1350, height: 1013 },
  { name: 'Cuatro quesos', image: '/assets/products/cuatro-quesos.webp', width: 1114, height: 1383 },
  { name: 'Matambre a la pizza', image: '/assets/products/matambre-a-la-pizza.webp', width: 1114, height: 1383 },
  { name: 'Panceta y ciruela', image: '/assets/products/panceta-y-ciruela.webp', width: 928, height: 1152 },
  { name: 'Pollo al verdeo', image: '/assets/products/pollo-al-verdeo.webp', width: 928, height: 1152 },
  { name: 'Germana', image: '/assets/products/germana.webp', width: 1114, height: 1383 },
  { name: 'Carne dulce', image: '/assets/products/carne-dulce.webp', width: 928, height: 1152 },
]

// El hero usa una selección corta para no cargar imágenes innecesarias al entrar.
export const heroProducts = [
  productGallery[0],
  productGallery[3],
  productGallery[7],
  productGallery[10],
]
