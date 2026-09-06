require('dotenv').config();
const { createUser } = require('../src/services/users');
const { users } = require('../src/database/store');

const [username, email, password] = process.argv.slice(2);
if (!username || !email || !password) {
  console.error('Usage: npm run admin:create -- <username> <email> <password>');
  process.exit(1);
}

(async () => {
  const normalized = email.toLowerCase();
  if ([...users.values()].some((u) => u.email === normalized || u.username === username)) {
    throw new Error('Username or email already registered');
  }
  const u = await createUser({ username, email: normalized, password, role: 'admin', plan: 'PRO' });
  console.log(`Admin created: ${u.email}`);
})().catch((e) => { console.error(e.message); process.exitCode = 1; });
