'use strict';
const pino = require('pino');
const env = require('./env');
const redactPaths = ['req.headers.authorization','req.headers.cookie','req.body.password','req.body.token','req.body.apiKey','*.password','*.passwordHash','*.token','*.apiKey','*.keyHash'];
const logger = pino({ level: env.LOG_LEVEL, redact: { paths: redactPaths, censor: '[REDACTED]' }, transport: env.IS_PRODUCTION ? undefined : { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' } } });
module.exports = logger;
