// Lightweight in-memory data store. YuiAPI intentionally does not use Prisma.
const users = new Map();
const apiKeys = new Map();
const resetTokens = new Map();
const requestLogs = [];

const now = () => new Date();
const id = () => crypto.randomUUID();
const crypto = require('node:crypto');

function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

module.exports = {
  users,
  apiKeys,
  resetTokens,
  requestLogs,
  now,
  id,
  publicUser,
};
