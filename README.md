# YuiAPI

Plataforma REST multipropósito profesional, modular y preparada para crecer a cientos de endpoints.

## Incluye
- Node.js + Express + PostgreSQL + Prisma.
- Registro/login, JWT HttpOnly, roles y planes.
- API Keys `YUI_...` almacenadas por hash.
- Rate limiting por plan.
- Catálogo automático de endpoints y OpenAPI.
- Dashboard, historial, estadísticas y panel admin.
- Health/status/version y Redis/Valkey opcional.
- Render Blueprint listo.

## Instalación
```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run admin:create -- admin admin@example.com 'cambia-esta-clave'
npm run dev
```

## Producción
```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm start
```

## API pública inicial
`GET /api/v1/info`, `/api/v1/tools/ping`, `/api/v1/tools/time`, `/api/v1/tools/base64?text=hola`, `/api/v1/search/example?q=yui`, `/health`, `/status`, `/version`, `/docs`.

## Crear endpoints
Añade un módulo como `src/endpoints/search/deezer.js` exportando `meta` y `handler`. El registro automático lo descubre al arrancar; no hay que editar `routes/index.js`.

## Render
El Blueprint crea el Web Service y PostgreSQL. `DATABASE_URL` se conecta automáticamente, `JWT_SECRET` se genera, y el servidor escucha en `0.0.0.0` usando `process.env.PORT`.
