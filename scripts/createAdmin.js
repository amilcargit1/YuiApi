'use strict';
const { prisma, connectDatabase, disconnectDatabase } = require('../src/database/prisma');
const { hashPassword } = require('../src/utils/password');
const env = require('../src/config/env');
const logger = require('../src/config/logger');
async function main() {
  await connectDatabase();
  const existing = await prisma.user.findFirst({ where: { OR: [{ email: env.ADMIN_EMAIL }, { username: env.ADMIN_USERNAME }] } });
  if (existing) {
    if (existing.role !== 'admin') { await prisma.user.update({ where: { id: existing.id }, data: { role: 'admin', status: 'active' } }); logger.info(`Usuario existente "${existing.username}" promovido a administrador.`); }
    else logger.info(`El usuario administrador "${existing.username}" ya existe.`);
    return;
  }
  const passwordHash = await hashPassword(env.ADMIN_PASSWORD);
  const admin = await prisma.user.create({ data: { username: env.ADMIN_USERNAME, email: env.ADMIN_EMAIL, passwordHash, role: 'admin', status: 'active' } });
  logger.info(`Administrador creado: ${admin.username} <${admin.email}>`);
  logger.info('Recuerda cambiar la contraseña por defecto después de iniciar sesión.');
}
main().catch((err) => { logger.error({ err }, 'Error creando el usuario administrador.'); process.exitCode = 1; }).finally(async () => { await disconnectDatabase(); });
