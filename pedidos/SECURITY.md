# Seguridad

- No subir `.env` ni credenciales a Git.
- Las variables `VITE_*` forman parte del JavaScript público: nunca colocar secretos allí.
- Mantener `PAYMENT_PROVIDER=mock` en previews hasta validar Nave sandbox.
- No guardar datos de tarjeta. El pago debe realizarse en el flujo seguro provisto por Nave.
- No confiar en precios ni totales enviados por el navegador; la Function ya los recalcula desde el catálogo.
- No confiar en una URL de retorno como confirmación de pago; la fuente de verdad debe ser el webhook validado y/o una consulta servidor a servidor.
