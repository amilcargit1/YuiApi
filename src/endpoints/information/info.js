'use strict';
const env=require('../../config/env');const {getCategorySummary,getAllEndpoints}=require('../../services/endpointRegistry');const {ok}=require('../../utils/response');
const meta={name:'API Info',category:'information',method:'GET',path:'/api/v1/info',description:'Devuelve información general de la plataforma YuiAPI: versión, categorías disponibles y número total de endpoints.',auth:false,params:[],example_request:'GET /api/v1/info',example_response:{status:true,code:200,message:'Success',data:{name:'YuiAPI',version:'1.0.0',totalEndpoints:5,categories:[]}},version:'v1',tags:['info','meta']};
async function handler(req,res){const categories=getCategorySummary();const totalEndpoints=getAllEndpoints().length;return ok(res,{data:{name:env.APP_NAME,version:env.APP_VERSION,description:'Una plataforma multipropósito de APIs para desarrolladores.',totalEndpoints,categories}});}
module.exports={meta,handler};
