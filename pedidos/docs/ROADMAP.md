# Camino de Fase 2 a producción

## 2.0 · Prototipo funcional (incluido)

- experiencia de menú, carrito y checkout;
- selección de sucursal;
- delivery y retiro;
- pedidos guardados en Netlify;
- pagos simulados;
- base responsive y accesible;
- despliegues de prueba sin indexación.

## 2.0.3 · Estados e idempotencia base (incluido)

- historial cronológico por pedido;
- máquina de estados con transiciones válidas;
- consulta pública limitada del estado, sin datos personales;
- protección contra eventos de pago duplicados;
- rechazo de retrocesos causados por eventos fuera de orden;
- animación de creación, conexión y confirmación del pago.

## 2.0.4 · Catálogo real por sucursal (incluido)

- carta copiada de los menús públicos actuales de Pedido Directo;
- productos, categorías y precios separados por local;
- promos con selección exacta de sabores;
- bloqueo de productos cruzados entre sucursales en frontend y servidor;
- fecha de última sincronización visible y guardada en el catálogo.

## 2.1 · Datos comerciales reales

- volver a confirmar catálogo, fotos, descripciones, stock y precios antes de publicar;
- crear un panel propio para administrar disponibilidad por sucursal;
- definir zonas, costos y mínimos de delivery;
- definir horarios, feriados y pausas de cada local;
- agregar opciones de producto: gustos, cantidad, adicionales y aclaraciones;
- definir impuestos, descuentos y cupones.

## 2.2 · Nave sandbox

- recibir documentación y credenciales oficiales;
- implementar autenticación y creación de checkout;
- implementar firma del webhook;
- probar estados e idempotencia;
- reemplazar el mapeo simulado por la tabla oficial de estados de Nave;
- validar conciliación con el panel del comercio.

## 2.3 · Operación del pedido

- panel interno por sucursal;
- aviso sonoro y estados recibido, en preparación, enviado y entregado;
- notificaciones al cliente por email o WhatsApp;
- impresión o integración con cocina/POS;
- tiempos estimados y capacidad por local.

## 2.4 · Lanzamiento

- cuentas de administración y permisos;
- protección contra abuso y límites de solicitudes;
- monitoreo, alertas y copias de seguridad;
- analítica con consentimiento;
- políticas, términos y tratamiento de datos;
- pruebas reales controladas;
- dominio, SEO y retiro del cartel de entorno de prueba.
