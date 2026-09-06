const jwt=require('jsonwebtoken');const config=require('../config');const {error}=require('../utils/response');
function signUser(user){return jwt.sign({sub:user.id,role:user.role},config.jwtSecret,{expiresIn:config.jwtExpiresIn})}
function requireAuth(req,res,next){const token=req.cookies?.yui_session||(req.headers.authorization||'').replace(/^Bearer\s+/i,'');if(!token)return error(res,401,'Authentication required');try{req.user=jwt.verify(token,config.jwtSecret);next()}catch{return error(res,401,'Invalid or expired session')}}
function requireRole(...roles){return(req,res,next)=>roles.includes(req.user?.role)?next():error(res,403,'Insufficient permissions')}
module.exports={signUser,requireAuth,requireRole};
