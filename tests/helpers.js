'use strict';
const env=require('../src/config/env');function skipIfNoDatabase(t){if(!env.DATABASE_URL){t.skip('DATABASE_URL no configurado: se omite este test de integración.');return true;}return false;}module.exports={skipIfNoDatabase};
