# Cosa Nostra Pedidos · Fase 2

Prototipo funcional del canal de pedidos directos de Cosa Nostra. Es un proyecto separado de la landing pública y está configurado como entorno de prueba: no indexa en buscadores y, por defecto, no procesa cobros reales.

## Qué incluye

- selección de sucursal;
- menú con categorías y búsqueda;
- carrito persistente en el navegador;
- delivery o retiro en local;
- checkout con validación de datos;
- API de pedidos en Netlify Functions;
- persistencia de pedidos de prueba en Netlify Blobs;
- pago simulado;
- adaptador preparado para integrar Nave cuando el comercio tenga las credenciales y el contrato oficial de API;
- diseño responsive, animaciones y modo de movimiento reducido.

Los productos, precios, costos de envío, mínimos y direcciones de esta versión son datos de demostración. Deben validarse antes de producción.

## Desarrollo local

Requisitos: Node.js 20 o superior.

```bash
npm install
npm run dev
```

`npm run dev` usa el pago simulado del frontend si la API no está disponible. Para probar Functions y Blobs como en Netlify:

```bash
npm run dev:netlify
```

La aplicación quedará disponible en `http://localhost:8888`.

## Variables de entorno

Copiar `.env.example` a `.env` solamente para desarrollo local. Nunca subir secretos a Git ni usar variables que comiencen con `VITE_` para las credenciales de Nave.

El modo seguro por defecto es:

```env
PAYMENT_PROVIDER=mock
```

La preparación de Nave está documentada en [docs/NAVE-INTEGRATION.md](docs/NAVE-INTEGRATION.md).

## Publicar una prueba con Git y Netlify

1. Crear un repositorio nuevo para Fase 2.
2. Subir este proyecto a la rama `main`.
3. En Netlify, elegir **Add new site → Import an existing project**.
4. Seleccionar el repositorio. Netlify detectará `netlify.toml`:
   - build: `npm run build`;
   - publicación: `dist`;
   - Functions: `netlify/functions`.
5. En **Environment variables**, dejar `PAYMENT_PROVIDER=mock`.
6. Usar una URL de Deploy Preview o un subdominio de prueba. No conectar todavía el dominio público.

El archivo `robots.txt` y la etiqueta `noindex` bloquean la indexación, pero el sitio de prueba sigue siendo accesible a quien tenga la URL. Si se cargan datos sensibles, sumar protección por contraseña en Netlify.

## Comandos de Git

```bash
git init -b main
git add .
git commit -m "feat: iniciar sistema de pedidos fase 2"
git remote add origin URL_DEL_REPOSITORIO
git push -u origin main
```

## Verificaciones

```bash
npm run build
```

Antes de publicar en producción se debe completar la lista de [docs/ROADMAP.md](docs/ROADMAP.md).
