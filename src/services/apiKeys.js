const { apiKeys, now, id } = require('../database/store');
const { createApiKey, sha256 } = require('../utils/crypto');

async function createKey(userId, name) {
  const raw = createApiKey();
  const row = { id: id(), name: name || 'Default key', prefix: raw.slice(0, 12), keyHash: sha256(raw), userId, active: true, createdAt: now(), lastUsedAt: null, requestCount: 0 };
  apiKeys.set(row.id, row);
  return { ...row, key: raw };
}

async function listKeys(userId) {
  return [...apiKeys.values()]
    .filter((key) => key.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(({ id, name, prefix, active, createdAt, lastUsedAt, requestCount }) => ({ id, name, prefix, active, createdAt, lastUsedAt, requestCount }));
}

module.exports = { createKey, listKeys };
