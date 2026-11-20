# Cosa Nostra Pedidos · Fase 2

Prototipo funcional del canal de pedidos directos de Cosa Nostra. Es un proyecto separado de la landing pública y está configurado como entorno de prueba: no indexa en buscadores y, por defecto, no procesa cobros reales.

## Qué incluye

- selección de sucursal;
- menú con categorías y búsqueda;
- carrito persistente en el navegador;
- selector de sabores para media docena y docena, con control de cantidad exacta;
- delivery o retiro en local;
- checkout con validación de datos;
- API de pedidos en Netlify Functions;
- persistencia de pedidos de prueba en Netlify Blobs;
- pago simulado;
- confirmación animada del pago aprobado;
- mensaje de WhatsApp con detalle de sabores y estado del pago;
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

Para dirigir las pruebas de WhatsApp a un celular propio, crear `pedidos/.env.local`:

```env
VITE_WHATSAPP_TEST_NUMBER=549XXXXXXXXXX
```

Usar solamente números, con código de país y área. Reiniciar `npm run dev` después de cambiarlo. `.env.local` no se sube a Git.

La preparación de Nave está documentada en [docs/NAVE-INTEGRATION.md](docs/NAVE-INTEGRATION.md).

## Trabajar dentro del repositorio de la landing

La carpeta `pedidos/` puede convivir en el mismo repositorio sin enlazarse todavía con la web pública. Se recomienda trabajar en la rama `fase-2-pedidos`. El workflow de la landing sigue limitado a `main`.

Cuando la prueba esté más avanzada, en Netlify se podrá crear un sitio independiente cuya **Base directory** sea `pedidos`:

1. Elegir **Add new site → Import an existing project**.
2. Seleccionar el mismo repositorio y la rama de prueba.
3. Configurar **Base directory: `pedidos`**. Netlify detectará `netlify.toml`:
   - build: `npm run build`;
   - publicación: `dist`;
   - Functions: `netlify/functions`.
4. En **Environment variables**, dejar `PAYMENT_PROVIDER=mock`.
5. Usar una URL de prueba. No conectar todavía el dominio público.

El archivo `robots.txt` y la etiqueta `noindex` bloquean la indexación, pero el sitio de prueba sigue siendo accesible a quien tenga la URL. Si se cargan datos sensibles, sumar protección por contraseña en Netlify.

## Comandos de Git

```bash
git switch fase-2-pedidos
git add pedidos
git commit -m "feat(pedidos): selector de sabores y pago animado"
git push
```

## Verificaciones

```bash
npm run build
```

Antes de publicar en producción se debe completar la lista de [docs/ROADMAP.md](docs/ROADMAP.md).
