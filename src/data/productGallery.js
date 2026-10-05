/**
 * Selección provisoria tomada del material compartido por el cliente en Canva.
 * Los nombres quedan centralizados acá para poder validarlos o reemplazarlos
 * sin tocar el componente visual.
 */
export const productGallery = [
  { name: 'Jamón y queso', image: '/assets/products/jamon-y-queso.webp' },
  { name: 'Palmito', image: '/assets/products/palmito.webp' },
  { name: 'Calabresa', image: '/assets/products/calabresa.webp' },
  { name: 'Pollo al champiñón', image: '/assets/products/pollo-al-champinon.webp' },
  { name: 'Calabaza y choclo', image: '/assets/products/calabaza-y-choclo.webp' },
  { name: 'Verdura', image: '/assets/products/verdura.webp' },
  { name: 'Cuatro quesos', image: '/assets/products/cuatro-quesos.webp' },
  { name: 'Matambre a la pizza', image: '/assets/products/matambre-a-la-pizza.webp' },
  { name: 'Panceta y ciruela', image: '/assets/products/panceta-y-ciruela.webp' },
  { name: 'Pollo al verdeo', image: '/assets/products/pollo-al-verdeo.webp' },
  { name: 'Germana', image: '/assets/products/germana.webp' },
  { name: 'Carne dulce', image: '/assets/products/carne-dulce.webp' },
]

// El hero usa una selección corta para no cargar imágenes innecesarias al entrar.
export const heroProducts = [
  productGallery[0],
  productGallery[3],
  productGallery[7],
  productGallery[10],
]
