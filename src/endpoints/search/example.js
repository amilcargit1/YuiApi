'use strict';
const {ok,ApiError}=require('../../utils/response');
const meta={name:'Search Example',category:'search',method:'GET',path:'/api/v1/search/example',description:'Endpoint de demostración de la categoría de búsqueda. Devuelve resultados de ejemplo con el término buscado.',auth:true,params:[{name:'q',type:'string',in:'query',required:true,description:'Término de búsqueda'}],example_request:'GET /api/v1/search/example?q=yuiapi',example_response:{status:true,code:200,message:'Success',data:{query:'yuiapi',results:[{title:'Resultado de ejemplo',relevance:1}]}},version:'v1',tags:['search','demo']};
async function handler(req,res){const {q}=req.query;if(!q||typeof q!=='string'||!q.trim())throw new ApiError('El parámetro "q" es requerido.',422);const results=[{title:`Resultado de ejemplo para "${q}"`,relevance:1},{title:`Segundo resultado relacionado con "${q}"`,relevance:.8}];return ok(res,{data:{query:q,count:results.length,results}});}
module.exports={meta,handler};
