# Integración de pagos con Nave

## Estado actual

El proyecto usa `PAYMENT_PROVIDER=mock`. Crea y guarda pedidos de prueba, simula una aprobación y no realiza cobros.

La integración real está aislada en `netlify/functions/_shared/nave.mjs`. Las credenciales nunca pasan al navegador: React llama a una Function, y esa Function será la única responsable de autenticarse con Nave y crear el checkout.

## Información que se debe pedir a Nave

- credenciales de sandbox: Client ID y Client Secret;
- identificador del comercio o POS;
- URL base y endpoint de autenticación de sandbox;
- contrato del endpoint para crear el checkout;
- URLs de retorno permitidas;
- contrato del webhook y método exacto de validación de firma;
- tabla oficial de estados de pago;
- credenciales y procedimiento de habilitación para producción.

No se deben adivinar endpoints, encabezados ni firmas. Cuando Nave entregue la documentación oficial, se mapea en el adaptador existente.

## Variables en Netlify

En **Site configuration → Environment variables**:

```env
PAYMENT_PROVIDER=nave
NAVE_ENVIRONMENT=sandbox
NAVE_CLIENT_ID=...
NAVE_CLIENT_SECRET=...
NAVE_POS_ID=...
NAVE_API_BASE_URL=...
NAVE_TOKEN_URL=...
NAVE_WEBHOOK_SECRET=...
```

Configurar estos valores primero para Deploy Previews o una rama de sandbox. No habilitar el contexto de producción hasta terminar una prueba de punta a punta.

## Flujo previsto

1. React envía el carrito a `/api/create-order`.
2. El servidor recalcula productos, cantidades, precios, envío y total desde el catálogo confiable.
3. La orden se guarda con estado `awaiting_payment`.
4. React llama a `/api/create-payment` con el ID de la orden.
5. El adaptador de Nave obtiene un token y crea la sesión de checkout.
6. El cliente continúa al checkout seguro informado por Nave.
7. Nave notifica el resultado a `/api/webhooks/nave`.
8. El webhook valida su firma y actualiza la orden.
9. La pantalla de confirmación consulta el estado real del servidor.

La estructura de estados, el endpoint de consulta y la idempotencia base ya están implementados. Falta conectar la firma y los identificadores reales que defina Nave.

## Requisitos antes de cobrar

- validar la firma del webhook con el algoritmo oficial;
- usar idempotencia al crear el pago y procesar eventos;
- confirmar el importe y la moneda recibidos;
- no marcar un pedido como pagado por parámetros de URL;
- registrar eventos sin guardar datos completos de tarjeta ni secretos;
- probar aprobado, rechazado, pendiente, expirado y reembolso;
- definir reintentos, alertas y conciliación;
- pasar revisión legal y de privacidad.
