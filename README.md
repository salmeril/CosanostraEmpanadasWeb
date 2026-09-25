# Cosa Nostra — landing React

Primera versión de la landing de Cosa Nostra Empanadas, preparada con React y Vite.

## Librerías visuales

- Anime.js 4: secuencias de entrada y animaciones con scope/limpieza para React.
- React Bits: patrón `SpotlightCard` adaptado al lenguaje visual de Cosa Nostra.

Se respeta `prefers-reduced-motion` para evitar animaciones cuando el usuario lo solicita.

## Abrir el proyecto

1. Abrí la carpeta `cosa-nostra-web` en Visual Studio Code.
2. En la terminal ejecutá `npm install`.
3. Ejecutá `npm run dev` para verla localmente.

## Generar la versión para DonWeb

Ejecutá:

```bash
npm run build
```

Vite genera la carpeta `dist`. El contenido de esa carpeta es lo que se sube a `public_html` en DonWeb.

## Datos editables

Las sucursales y sus enlaces de Pedido Directo están al comienzo de `src/App.jsx`, dentro de `branches`.

## Recursos pendientes de reemplazo

- Logo original en SVG.
- Fotografías originales de producto y locales.
- Archivos web/licencias de las tipografías oficiales Palmore, Helvetica Neue LT Pro y Theodore Handwritten.
- Confirmación final de direcciones, horarios, teléfonos y estado de la sucursal Quilmes.

Hasta recibir esos recursos, la versión usa una imagen tomada del manual de marca y tipografías equivalentes de Google Fonts.
