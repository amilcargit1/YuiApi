# YuiAPI

Una plataforma multipropósito de APIs para desarrolladores: sistema de usuarios, API Keys, dashboard, documentación automática, rate limiting por plan, panel de administración y una arquitectura modular pensada para crecer a cientos de endpoints sin tocar el enrutador central.

## Características

- 🔑 Sistema completo de API Keys (`YUI_xxxx`), hasheadas con SHA-256, nunca almacenadas en texto plano
- 👤 Autenticación por sesión (registro, login, recuperación de contraseña) con roles `user` / `moderator` / `admin`
- 📊 Dashboard con estadísticas en tiempo real (requests, éxito/error, latencia, actividad reciente)
- 📘 Documentación automática (`/docs`) y especificación OpenAPI generada dinámicamente (`/openapi.json`, `/docs/swagger`)
- 🧩 **Cargador automático de endpoints**: agrega un archivo en `src/endpoints/<categoria>/` y aparece solo en rutas, dashboard y documentación
- 🚦 Rate limiting configurable por plan (Free / Developer / Pro / Enterprise) + límite anónimo por IP
- 🛠️ Panel de administración: usuarios, roles, estado de cuentas, endpoints, logs del sistema
- 🩺 Health system (`/health`, `/status`, `/version`) con verificación de PostgreSQL y Redis/Valkey
- 🔒 Seguridad: Helmet, CORS configurable, Argon2, validación con Zod, sesiones respaldadas en PostgreSQL, manejo de errores sin fugas de stack trace en producción
- ☁️ Listo para desplegar en Render con `render.yaml`

## Stack

Node.js · Express · PostgreSQL · Prisma ORM · Argon2 · JWT/Sesiones · Helmet · Zod · Pino · Swagger/OpenAPI · EJS

## Estructura del proyecto

```
YuiAPI/
├── src/
│   ├── app.js              # Configuración de Express (middleware, seguridad, vistas)
│   ├── server.js            # Punto de entrada: conecta BD/Redis y arranca el servidor
│   ├── config/               # env, logger, planes por defecto
│   ├── routes/                # auth, dashboard, admin (users), apiKeys, system, index
│   ├── endpoints/              # Endpoints modulares por categoría (auto-descubiertos)
│   │   ├── downloads/
│   │   ├── search/
│   │   ├── tools/
│   │   ├── ai/
│   │   └── information/
│   ├── middleware/              # auth, apiKey, rateLimit, errorHandler, logger
│   ├── services/                 # users, apiKeys, statistics, endpointRegistry, health, plans
│   ├── utils/                     # response, validators, apiKeyGenerator, password, ip, openapi
│   └── database/                   # prisma.js, redis.js
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── views/                            # EJS: landing, login, register, dashboard, docs, admin
├── public/css/style.css
├── scripts/createAdmin.js
├── tests/
├── .env.example
├── render.yaml
└── package.json
```

## Instalación

```bash
git clone <tu-repositorio>
cd YuiAPI
npm install
cp .env.example .env
# Edita .env con tus credenciales reales
```

## Variables de entorno

Ver `.env.example` para la lista completa. Las más importantes:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión de PostgreSQL |
| `REDIS_URL` | Opcional. Si se omite, la app funciona sin caché distribuido |
| `JWT_SECRET` / `SESSION_SECRET` | Claves para tokens y cookies de sesión (usa valores aleatorios largos) |
| `CORS_ORIGINS` | Orígenes permitidos separados por coma, o `*` |
| `RATE_LIMIT_*_DAILY` | Límites diarios por defecto de cada plan |
| `ADMIN_EMAIL` / `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Usados por `npm run create:admin` |

## Base de datos y migraciones

```bash
# Generar el cliente de Prisma
npm run prisma:generate

# Crear y aplicar migraciones en desarrollo
npm run prisma:migrate

# Sincronizar planes por defecto (free/developer/pro/enterprise)
npm run seed

# Crear el usuario administrador inicial (usa las variables ADMIN_* del .env)
npm run create:admin
```

## Desarrollo

```bash
npm run dev
# Servidor disponible en http://localhost:3000
```

## Producción

```bash
npm run prisma:migrate:deploy
npm start
```

La aplicación escucha en `process.env.PORT` sobre `0.0.0.0`, tal como requiere Render.

## Despliegue en Render

1. Sube el proyecto a un repositorio Git.
2. En Render, crea un nuevo **Blueprint** apuntando a este repositorio (detectará `render.yaml` automáticamente), o crea manualmente:
   - Un **Web Service** Node.js con:
     - Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
     - Start command: `npm start`
     - Health check path: `/health`
   - Una base de datos **PostgreSQL** gestionada por Render.
3. Configura las variables de entorno en el panel de Render (`DATABASE_URL` se puede enlazar automáticamente desde la base de datos creada; genera valores aleatorios para `JWT_SECRET` y `SESSION_SECRET`).
4. Tras el primer deploy, ejecuta una vez desde la shell de Render:
   ```bash
   npm run create:admin
   ```
5. Redis/Valkey es opcional: si no agregas `REDIS_URL`, la plataforma sigue funcionando con rate limiting en memoria y sesiones en PostgreSQL.

## Creación de nuevos endpoints

No necesitas modificar `routes/index.js`. Crea un archivo en la categoría correspondiente:

```js
// src/endpoints/search/deezer.js
'use strict';
const { ok, ApiError } = require('../../utils/response');

const meta = {
  name: 'Deezer Search',
  category: 'search',
  method: 'GET',
  path: '/api/v1/search/deezer',
  description: 'Busca canciones en Deezer.',
  auth: true,
  params: [{ name: 'q', type: 'string', in: 'query', required: true, description: 'Término de búsqueda' }],
  example_request: 'GET /api/v1/search/deezer?q=daft+punk',
  example_response: { status: true, code: 200, message: 'Success', data: { results: [] } },
  version: 'v1',
  tags: ['search', 'music'],
};

async function handler(req, res) {
  const { q } = req.query;
  if (!q) throw new ApiError('El parámetro "q" es requerido.', 422);

  // Integra aquí un proveedor real usando el patrón de adaptadores:
  // ver src/services/adapters/README.md
  return ok(res, { data: { query: q, results: [] } });
}

module.exports = { meta, handler };
```

Al reiniciar el servidor (o en el próximo despliegue), el endpoint aparece automáticamente en:
- `/api/v1/search/deezer`
- El dashboard (`/dashboard/endpoints`)
- La documentación (`/docs`, `/openapi.json`, `/docs/swagger`)

> **Nota sobre integraciones de terceros:** este proyecto no incluye scrapers ni descargadores de contenido de plataformas como YouTube o TikTok, ya que ese tipo de integraciones puede infringir los términos de servicio del proveedor o derechos de autor de terceros. La arquitectura de adaptadores (`src/services/adapters/`) está lista para que conectes proveedores con los que tengas acuerdos o licencias legítimas.

## Formato de respuesta estándar

```json
// Éxito
{ "status": true, "code": 200, "message": "Success", "data": {} }

// Error
{ "status": false, "code": 400, "message": "Bad request", "data": null }
```

## Autenticación por API Key

```bash
curl -H "X-API-Key: YUI_tu_api_key" https://tu-dominio.onrender.com/api/v1/tools/ping
```

También puedes enviarla como `Authorization: Bearer YUI_...` o `?apiKey=YUI_...` (no recomendado en producción, ya que queda en logs de acceso).

## Ejemplos de uso

```bash
# Información general de la plataforma (público)
curl https://tu-dominio.onrender.com/api/v1/info

# Ping autenticado
curl -H "X-API-Key: YUI_xxx" https://tu-dominio.onrender.com/api/v1/tools/ping

# Hora del servidor
curl -H "X-API-Key: YUI_xxx" "https://tu-dominio.onrender.com/api/v1/tools/time?timezone=America/Bogota"

# Codificar en Base64
curl -H "X-API-Key: YUI_xxx" "https://tu-dominio.onrender.com/api/v1/tools/base64?text=Hola&action=encode"

# Búsqueda de ejemplo
curl -H "X-API-Key: YUI_xxx" "https://tu-dominio.onrender.com/api/v1/search/example?q=yuiapi"
```

## Tests

```bash
npm test
```

Los tests de utilidades puras (`tests/utils.test.js`, `tests/endpointRegistry.test.js`) no requieren base de datos. Los tests de integración (`tests/api.integration.test.js`) requieren `DATABASE_URL` apuntando a una base de datos de pruebas con las migraciones aplicadas; si no está configurada, se omiten automáticamente.

## Licencia

Uso privado / a definir por el propietario del proyecto.
