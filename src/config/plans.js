'use strict';
const env = require('./env');
const DEFAULT_PLANS = [
  { name:'free', dailyRequests:env.RATE_LIMITS.free, monthlyRequests:env.RATE_LIMITS.free*30, rateLimitPerMin:10, priority:0, features:{support:'community',endpointsAllowed:'public'} },
  { name:'developer', dailyRequests:env.RATE_LIMITS.developer, monthlyRequests:env.RATE_LIMITS.developer*30, rateLimitPerMin:60, priority:1, features:{support:'email',endpointsAllowed:'all'} },
  { name:'pro', dailyRequests:env.RATE_LIMITS.pro, monthlyRequests:env.RATE_LIMITS.pro*30, rateLimitPerMin:300, priority:2, features:{support:'priority',endpointsAllowed:'all',sla:'99.9%'} },
  { name:'enterprise', dailyRequests:env.RATE_LIMITS.enterprise, monthlyRequests:env.RATE_LIMITS.enterprise*30, rateLimitPerMin:2000, priority:3, features:{support:'dedicated',endpointsAllowed:'all',sla:'99.99%',customIntegrations:true} },
];
module.exports = { DEFAULT_PLANS };
