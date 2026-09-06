'use strict';
const {prisma}=require('../database/prisma');const {generateApiKey,hashApiKey}=require('../utils/apiKeyGenerator');const {ApiError}=require('../utils/response');
async function createApiKey(userId,name='Default Key'){const activeCount=await prisma.apiKey.count({where:{userId,revoked:false}});if(activeCount>=10)throw new ApiError('Has alcanzado el límite de 10 API keys activas.',400);const {rawKey,keyHash,keyPrefix}=generateApiKey();const apiKey=await prisma.apiKey.create({data:{userId,name,keyHash,keyPrefix}});return {...serializeApiKey(apiKey),key:rawKey};}
async function listApiKeys(userId){const keys=await prisma.apiKey.findMany({where:{userId},orderBy:{createdAt:'desc'}});return keys.map(serializeApiKey);}
async function revokeApiKey(userId,apiKeyId){const key=await prisma.apiKey.findFirst({where:{id:apiKeyId,userId}});if(!key)throw new ApiError('API key no encontrada.',404);return prisma.apiKey.update({where:{id:apiKeyId},data:{revoked:true}});}
async function deleteApiKey(userId,apiKeyId){const key=await prisma.apiKey.findFirst({where:{id:apiKeyId,userId}});if(!key)throw new ApiError('API key no encontrada.',404);return prisma.apiKey.delete({where:{id:apiKeyId}});}
async function findByRawKey(rawKey){const keyHash=hashApiKey(rawKey);return prisma.apiKey.findUnique({where:{keyHash},include:{user:true}});}
async function touchUsage(apiKeyId){return prisma.apiKey.update({where:{id:apiKeyId},data:{lastUsedAt:new Date(),requestCount:{increment:1}}});}
function serializeApiKey(apiKey){return{id:apiKey.id,name:apiKey.name,keyPrefix:apiKey.keyPrefix,revoked:apiKey.revoked,lastUsedAt:apiKey.lastUsedAt,requestCount:apiKey.requestCount,createdAt:apiKey.createdAt};}
module.exports={createApiKey,listApiKeys,revokeApiKey,deleteApiKey,findByRawKey,touchUsage};
