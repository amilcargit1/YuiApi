const { apiKeys, users } = require('../database/store');
const { sha256 } = require('../utils/crypto');
const { error } = require('../utils/response');

async function requireApiKey(req, res, next) {
  try {
    const raw = req.get('x-api-key') || (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!raw || !raw.startsWith('YUI_')) return error(res, 401, 'API key required');
    const key = [...apiKeys.values()].find((item) => item.keyHash === sha256(raw));
    const user = key ? users.get(key.userId) : null;
    if (!key || !key.active || !user || user.status !== 'active') return error(res, 401, 'Invalid API key');
    key.lastUsedAt = new Date();
    key.requestCount += 1;
    req.apiKey = key;
    req.user = user;
    next();
  } catch (e) { next(e); }
}

module.exports = { requireApiKey };
