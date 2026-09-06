'use strict';
const {prisma}=require('../database/prisma');const {DEFAULT_PLANS}=require('../config/plans');const logger=require('../config/logger');
async function syncDefaultPlans(){for(const plan of DEFAULT_PLANS)await prisma.plan.upsert({where:{name:plan.name},update:{},create:plan});logger.info('Planes por defecto sincronizados (free, developer, pro, enterprise).');}
async function getPlanByName(name){return prisma.plan.findUnique({where:{name}});}async function listPlans(){return prisma.plan.findMany({orderBy:{priority:'asc'}});}async function updatePlan(name,updates){return prisma.plan.update({where:{name},data:updates});}
module.exports={syncDefaultPlans,getPlanByName,listPlans,updatePlan};
