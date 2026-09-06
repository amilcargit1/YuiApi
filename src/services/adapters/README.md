# Patrón de adaptadores para integraciones externas

Cuando quieras conectar YuiAPI con un proveedor externo real, sigue este patrón para mantener el código desacoplado y fácil de probar.

1. Crea un archivo en `src/services/adapters/<proveedor>.js` que exponga funciones puras.
2. En el endpoint importa el adaptador y úsalo dentro del `handler`.
3. Nunca hardcodees credenciales del proveedor: usa variables de entorno.
4. Si el proveedor no está disponible o no se ha implementado todavía, el adaptador debe lanzar un `ApiError('Proveedor no configurado', 501)`.

Este proyecto no incluye integraciones con proveedores de terceros para descarga/búsqueda de contenido con derechos de autor. Añádelas siguiendo este patrón y cumpliendo los términos de servicio de cada proveedor.
