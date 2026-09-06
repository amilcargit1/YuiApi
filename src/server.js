'use strict';

const express = require('express');

const app = express();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const APP_NAME = process.env.APP_NAME || 'YuiAPI';
const APP_VERSION = process.env.APP_VERSION || '1.0.0';

app.disable('x-powered-by');
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: true,
    code: 200,
    message: 'Success',
    data: {
      name: APP_NAME,
      version: APP_VERSION,
      description: 'Base mínima de YuiAPI funcionando correctamente en Render.',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: true,
    code: 200,
    message: 'Success',
    data: {
      status: true,
      service: APP_NAME,
      version: APP_VERSION,
      uptime: process.uptime(),
    },
  });
});

app.get('/version', (req, res) => {
  res.json({
    status: true,
    code: 200,
    message: 'Success',
    data: { name: APP_NAME, version: APP_VERSION, nodeEnv: process.env.NODE_ENV || 'development' },
  });
});

app.use((req, res) => {
  res.status(404).json({ status: false, code: 404, message: 'Endpoint no encontrado.', data: null });
});

app.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`${APP_NAME} (base) escuchando en http://${HOST}:${PORT}`);
});
