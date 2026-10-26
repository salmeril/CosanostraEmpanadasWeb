# Cosa Nostra — V25 · cierre de la primera fase

Landing de Cosa Nostra Empanadas desarrollada con React y Vite. Esta versión
incluye el diseño interactivo aprobado, carruseles de producto, selección de
sucursal y una base SEO técnica, on-page y local lista para publicar. Esta V25
cierra la primera fase con el contenido solicitado: 16 años de historia, una
referencia secundaria de aproximadamente 180 g, “Empanadas gourmet”, feed
público de Instagram, mapa y acceso a reseñas de Google por sucursal, además de
la página interna `/trabaja-con-nosotros` con su formulario completo. El Pedido Directo es el único canal
de compra destacado y no quedan accesos a plataformas externas. El Club de Cosa
Nostra se mantiene únicamente como “Próximamente”, sin desarrollar todavía la
etapa de fidelización. Instagram y Maps aparecen inmediatamente después de la
sucursal seleccionada y se cargan sin el ocultamiento inicial
de las animaciones para que nunca parezcan secciones vacías.
Los textos visibles ya están redactados exclusivamente para el público: no
quedan notas de validación, instrucciones internas ni aclaraciones del proyecto.
La portada de “Trabajá con nosotros” utiliza una imagen actual del equipo en la
sucursal de Quilmes, en reemplazo de la antigua fachada de Ranelagh.

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
- Responsive móvil corregido para evitar desplazamiento horizontal, cortes y
  franjas vacías en pantallas de 320 a 430 px.

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

- Sucursales, direcciones, Maps, Instagram y Pedido Directo:
  `src/data/branches.js`
- Feed público de Instagram por sucursal: `src/components/BranchSocial.jsx`
- Mapa y reseñas por sucursal: `src/components/BranchMapReview.jsx`
- Tarjetas de categorías y fotografías de fondo:
  `src/data/productGroups.js`
- Galería de productos: `src/data/productGallery.js`
- Slides del hero y rellenos rotativos: componentes y datos dentro de `src/`
- Metadatos y datos estructurados: `index.html`
- Formulario laboral: `src/pages/CareersPage.jsx`
- Procesamiento, envío del CV y correo receptor: `public/enviar-cv.php`

## Cambiar el correo que recibe los CV

Abrir `public/enviar-cv.php` y buscar esta línea al comienzo del archivo:

```php
$recipientEmail = 'rrhh@cosanostraempanadas.com.ar'; // <-- CAMBIAR ESTE CORREO
```

Reemplazar solamente la dirección entre comillas por el correo creado en el
hosting. Después ejecutar `npm run build` y volver a subir el contenido de
`dist` a `public_html`. El hosting debe tener PHP y la función de correo
habilitados; en DonWeb esto se comprueba con una postulación de prueba.

## Pendiente antes y después de publicar

1. Reemplazar las fotografías provisorias cuando el cliente entregue el material definitivo.
2. Confirmar menú, teléfonos, horarios y condiciones de entrega.
3. Confirmar si Marítimo conservará su cuenta separada o si todo el contenido
   se centralizará definitivamente en `@cosanostraempanadas`.
4. Crear el correo de RR. HH. en el hosting y reemplazarlo en `public/enviar-cv.php`.
5. Incorporar privacidad, términos y datos legales definitivos.
6. Publicar y comprobar certificado HTTPS y redirecciones.
7. Conectar el ID correcto de GTM o GA4 de Cosa Nostra.
8. Dar de alta Search Console, enviar `/sitemap.xml` y solicitar indexación.
9. Validar la URL pública con Rich Results Test y PageSpeed Insights.
10. Actualizar los cuatro Perfiles de Empresa: categorías, horarios, fotos,
   productos, landing, NAP, UTMs y gestión de reseñas.

## Archivos técnicos relevantes

- `public/robots.txt`
- `public/sitemap.xml`
- `public/.htaccess`
- `public/_redirects`
- `src/lib/analytics.js`
- `.env.example`

La auditoría detallada se entrega en `SEO_Checklist_Cosa_Nostra_2026.xlsx`.
