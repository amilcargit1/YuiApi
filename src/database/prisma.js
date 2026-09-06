'use strict';
const { PrismaClient } = require('@prisma/client');
const env = require('../config/env');
const logger = require('../config/logger');
const globalForPrisma = globalThis;
const prisma = globalForPrisma.__yuiapi_prisma || new PrismaClient({ log: env.IS_PRODUCTION ? ['error','warn'] : ['error','warn'] });
if (!env.IS_PRODUCTION) globalForPrisma.__yuiapi_prisma = prisma;
async function connectDatabase(){try{await prisma.$connect();logger.info('Conexión a PostgreSQL establecida correctamente.');return true;}catch(err){logger.error({err},'No se pudo conectar a PostgreSQL.');return false;}}
async function disconnectDatabase(){await prisma.$disconnect();}
module.exports={prisma,connectDatabase,disconnectDatabase};
