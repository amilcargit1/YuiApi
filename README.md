# YuiAPI — Base mínima (smoke test para Render)

Esta es una versión **reducida** de YuiAPI, sin PostgreSQL, sin Prisma, sin dashboard ni autenticación. Su único propósito es confirmar que Render puede instalar y correr el proyecto correctamente antes de desplegar la versión completa.

Incluye 3 rutas:

- `GET /` → info básica
- `GET /health` → health check (usado por Render para verificar que el servicio está vivo)
- `GET /version` → versión de la app

## Probar en local

```bash
npm install
npm start
curl http://localhost:3000/health
```

## Desplegar en Render

1. Sube esta carpeta a un repositorio Git (puede ser el mismo repo de YuiAPI en una rama `base-test`, o uno nuevo).
2. En Render: **New + → Blueprint** → selecciona el repositorio (detecta `render.yaml` automáticamente).
3. No necesitas configurar ninguna variable de entorno adicional — todo viene fijo en `render.yaml`.
4. Deploy. Cuando termine, prueba:
   ```bash
   curl https://tu-app.onrender.com/health
   ```

Si esto responde `"status": true`, confirma que:
- Render detecta y ejecuta Node.js correctamente
- El build (`npm install`) funciona sin errores
- El servidor escucha en `0.0.0.0` y en el `PORT` que Render asigna
- El health check pasa (Render no reiniciará el servicio en bucle)

## Siguiente paso

Una vez confirmado que esta base funciona, despliega el proyecto completo (con PostgreSQL, Prisma, dashboard, autenticación y el resto de endpoints) siguiendo el `README.md` del proyecto completo.
