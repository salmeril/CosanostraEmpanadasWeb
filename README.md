# Cosa Nostra — landing V13 · cierre de etapa 1

Landing de Cosa Nostra Empanadas desarrollada con React y Vite. Esta versión
incluye el diseño interactivo aprobado, carruseles de producto, selección de
sucursal y una base SEO técnica, on-page y local lista para publicar.

## Ejecutar el proyecto

```bash
npm install
npm run dev
```

Para generar la versión de producción:

```bash
npm run build
```

Vite crea la carpeta `dist`. Para DonWeb se sube **el contenido de `dist`** a
`public_html`, incluyendo los archivos ocultos como `.htaccess`.

## SEO incluido

- Title y meta description orientados a empanadas y búsquedas locales.
- Canonical, meta robots, Open Graph y Twitter Card.
- Un único H1 y estructura semántica de encabezados.
- `robots.txt` y `sitemap.xml` con imágenes principales.
- JSON-LD para WebSite, Organization y las cuatro sucursales como Restaurant.
- FAQ visible, direcciones, enlaces de Maps y perfiles sociales oficiales.
- Hero prioritario y resto de imágenes con dimensiones, carga diferida y alt.
- Redirección preparada a HTTPS y dominio sin `www` en `.htaccess`.
- Eventos preparados para selección de sucursal y clics de pedido.
- Firma discreta de OTB Creative Studio al final del footer.

## Activar Analytics

Copiar `.env.example` como `.env` y completar **una** de estas opciones:

```env
VITE_GTM_ID=GTM-XXXXXXXX
VITE_GA_MEASUREMENT_ID=
```

o, si no se usa Google Tag Manager:

```env
VITE_GTM_ID=
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

No se incluyeron IDs de otros proyectos. Después de cambiar las variables hay
que volver a ejecutar `npm run build`.

## Contenido editable

- Sucursales, direcciones, Maps, Instagram y pedidos:
  `src/data/branches.js`
- Tarjetas de categorías y fotografías de fondo:
  `src/data/productGroups.js`
- Galería de productos: `src/data/productGallery.js`
- Slides del hero y rellenos rotativos: componentes y datos dentro de `src/`
- Metadatos y datos estructurados: `index.html`

## Pendiente antes y después de publicar

1. Reemplazar todas las imágenes marcadas como referencia por fotos aprobadas.
2. Confirmar menú, gramajes, teléfonos, horarios y condiciones de entrega.
3. Incorporar privacidad, términos y datos legales definitivos.
4. Publicar y comprobar certificado HTTPS y redirecciones.
5. Conectar el ID correcto de GTM o GA4 de Cosa Nostra.
6. Dar de alta Search Console, enviar `/sitemap.xml` y solicitar indexación.
7. Validar la URL pública con Rich Results Test y PageSpeed Insights.
8. Actualizar los cuatro Perfiles de Empresa: categorías, horarios, fotos,
   productos, landing, NAP, UTMs y gestión de reseñas.

## Archivos técnicos relevantes

- `public/robots.txt`
- `public/sitemap.xml`
- `public/.htaccess`
- `public/_redirects`
- `src/lib/analytics.js`
- `.env.example`

La auditoría detallada se entrega en `SEO_Checklist_Cosa_Nostra_2026.xlsx`.
