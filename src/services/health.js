'use strict';
const {prisma}=require('../database/prisma');const {getRedisClient,isRedisEnabled}=require('../database/redis');const env=require('../config/env');
async function checkDatabase(){const started=Date.now();try{await prisma.$queryRaw`SELECT 1`;return{status:'operational',latencyMs:Date.now()-started};}catch(err){return{status:'down',error:err.message};}}
async function checkRedis(){if(!env.REDIS_URL)return{status:'not_configured'};if(!isRedisEnabled())return{status:'down'};const started=Date.now();try{await getRedisClient().ping();return{status:'operational',latencyMs:Date.now()-started};}catch(err){return{status:'down',error:err.message};}}
async function checkExternalServices(){return{status:'operational',services:[]};}
async function getFullStatus(){const [database,redis,external]=await Promise.all([checkDatabase(),checkRedis(),checkExternalServices()]);return{status:database.status==='operational',api:{status:'operational'},database,redis,external,timestamp:new Date().toISOString()};}
module.exports={checkDatabase,checkRedis,checkExternalServices,getFullStatus};
