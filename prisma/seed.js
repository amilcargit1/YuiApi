'use strict';
const { prisma, connectDatabase, disconnectDatabase } = require('../src/database/prisma');
const { syncDefaultPlans } = require('../src/services/plans');
const logger = require('../src/config/logger');
async function main() {
  await connectDatabase();
  await syncDefaultPlans();
  logger.info('Seed completado: planes por defecto sincronizados.');
  logger.info('Ejecuta "npm run create:admin" para crear el usuario administrador inicial.');
}
main().catch((err) => { logger.error({ err }, 'Error ejecutando el seed.'); process.exitCode = 1; }).finally(async () => { await disconnectDatabase(); });
