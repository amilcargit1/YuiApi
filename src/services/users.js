const bcrypt = require('bcryptjs');
const { users, now, id } = require('../database/store');

async function hashPassword(password) { return bcrypt.hash(password, 12); }
async function verifyPassword(password, hash) { return bcrypt.compare(password, hash); }

async function createUser({ username, email, password, role = 'user', plan = 'FREE' }) {
  const user = { id: id(), username, email: email.toLowerCase(), passwordHash: await hashPassword(password), role, status: 'active', plan, createdAt: now(), updatedAt: now(), lastLogin: null };
  users.set(user.id, user);
  return user;
}

module.exports = { hashPassword, verifyPassword, createUser };
