'use strict';
const {getUserById}=require('../services/users');
function attachUser(){return async(req,res,next)=>{if(req.session&&req.session.userId){try{const user=await getUserById(req.session.userId);if(user&&user.status==='active')req.user=user;else req.session.destroy(()=>{});}catch(err){return next(err);}}res.locals.user=req.user||null;next();};}
function requireAuth(req,res,next){if(!req.user){if(req.accepts('html'))return res.redirect('/login');return res.status(401).json({status:false,code:401,message:'No autenticado.',data:null});}next();}
function requireGuest(req,res,next){if(req.user)return res.redirect('/dashboard');next();}
function requireRole(...roles){return(req,res,next)=>{if(!req.user){if(req.accepts('html'))return res.redirect('/login');return res.status(401).json({status:false,code:401,message:'No autenticado.',data:null});}if(!roles.includes(req.user.role)){if(req.accepts('html'))return res.status(403).send('<h1>403 - Acceso denegado</h1><p>No tienes permisos para ver esta página.</p><a href="/dashboard">Volver</a>');return res.status(403).json({status:false,code:403,message:'Acceso denegado.',data:null});}next();};}
module.exports={attachUser,requireAuth,requireGuest,requireRole};
