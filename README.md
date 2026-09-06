# YuiAPI

Plataforma REST multipropósito profesional, modular y preparada para crecer a cientos de endpoints.

## Stack
Node.js, Express, PostgreSQL, JWT, bcryptjs, Helmet, CORS, rate limiting, Zod, Pino, EJS, Swagger/OpenAPI y Redis/Valkey opcional.

> **Nota:** YuiAPI no utiliza Prisma. La aplicación no depende de `@prisma/client`, `prisma generate` ni migraciones de Prisma.

## Funciones
- Usuarios, registro, login, logout y recuperación de contraseña.
- Roles `user`, `moderator`, `admin` y planes `FREE`, `DEVELOPER`, `PRO`, `ENTERPRISE`.
- API Keys `YUI_...` guardadas mediante SHA-256; la clave completa solo se muestra al crearla.
- Catálogo automático: cada módulo en `src/endpoints/<categoria>/` exporta `meta` y `handler`.
- Dashboard, logs, estadísticas, health, status y administración.
- OpenAPI automático en `/openapi.json` y UI en `/docs/openapi`.
- Respuestas estándar `{status,code,message,data}`.

## Instalación
```bash
cp .env.example .env
npm install
npm run admin:create -- admin admin@example.com 'cambia-esta-clave'
npm run dev
```

## Producción
```bash
npm ci
npm start
```

## Rutas iniciales
Públicas: `GET /api/v1/info`, `/api/v1/tools/ping`, `/api/v1/tools/time`, `/api/v1/tools/base64?text=hola`, `/health`, `/status`, `/version`, `/docs`.
Protegida: `GET /api/v1/search/example?q=yui` con `X-API-Key: YUI_...`.
Gestión: `/login`, `/register`, `/dashboard`, `/docs`, `/admin`.

## Añadir endpoints
Crea, por ejemplo, `src/endpoints/search/deezer.js` con `{meta,handler}`. El cargador lo descubre al iniciar; no edites `routes/index.js`.

## Render
`render.yaml` crea el Web Service y PostgreSQL. `DATABASE_URL` se conecta automáticamente y `JWT_SECRET` se genera. El proceso escucha `0.0.0.0` y usa `process.env.PORT`. El build solo ejecuta `npm ci`; no se ejecuta ningún comando de Prisma.
