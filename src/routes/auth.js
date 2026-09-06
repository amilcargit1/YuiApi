const router = require('express').Router();
const { z } = require('zod');
const { error, success } = require('../utils/response');
const { createUser, verifyPassword, hashPassword } = require('../services/users');
const { signUser, requireAuth } = require('../middleware/auth');
const { randomToken, sha256 } = require('../utils/crypto');
const { users, resetTokens, now, id, publicUser } = require('../database/store');

const registerSchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_.-]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

router.post('/register', async (req, res, next) => {
  try {
    const p = registerSchema.safeParse(req.body);
    if (!p.success) return error(res, 400, 'Invalid registration data');
    const { username, email, password } = p.data;
    const normalizedEmail = email.toLowerCase();
    const exists = [...users.values()].some((u) => u.username === username || u.email === normalizedEmail);
    if (exists) return error(res, 409, 'Username or email already registered');
    const u = await createUser({ username, email: normalizedEmail, password });
    return success(res, publicUser(u), 'Account created', 201);
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const p = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(req.body);
    if (!p.success) return error(res, 400, 'Invalid credentials');
    const u = [...users.values()].find((item) => item.email === p.data.email.toLowerCase());
    if (!u || u.status !== 'active' || !(await verifyPassword(p.data.password, u.passwordHash))) return error(res, 401, 'Invalid email or password');
    u.lastLogin = now();
    u.updatedAt = now();
    res.cookie('yui_session', signUser(u), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 604800000 });
    return success(res, publicUser(u), 'Logged in');
  } catch (e) { next(e); }
});

router.post('/logout', requireAuth, (req, res) => { res.clearCookie('yui_session'); return success(res, {}, 'Logged out'); });

router.get('/me', requireAuth, (req, res) => {
  const u = users.get(req.user.sub);
  if (!u) return error(res, 404, 'User not found');
  return success(res, publicUser(u), 'Current user');
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const p = z.object({ email: z.string().email() }).safeParse(req.body);
    if (!p.success) return error(res, 400, 'Invalid email');
    const u = [...users.values()].find((item) => item.email === p.data.email.toLowerCase());
    if (u) {
      const raw = randomToken(32);
      resetTokens.set(sha256(raw), { id: id(), userId: u.id, expiresAt: new Date(Date.now() + 3600000), usedAt: null });
      if (process.env.NODE_ENV !== 'production') return success(res, { resetToken: raw }, 'Reset token generated');
    }
    return success(res, {}, 'If the account exists, reset instructions were generated.');
  } catch (e) { next(e); }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const p = z.object({ token: z.string().min(20), password: z.string().min(8).max(128) }).safeParse(req.body);
    if (!p.success) return error(res, 400, 'Invalid reset request');
    const t = resetTokens.get(sha256(p.data.token));
    if (!t || t.usedAt || t.expiresAt < new Date()) return error(res, 400, 'Invalid or expired reset token');
    const u = users.get(t.userId);
    if (!u) return error(res, 400, 'Invalid or expired reset token');
    u.passwordHash = await hashPassword(p.data.password);
    u.updatedAt = now();
    t.usedAt = now();
    return success(res, {}, 'Password reset successfully');
  } catch (e) { next(e); }
});

module.exports = router;
