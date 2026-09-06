const router = require('express').Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { success, error } = require('../utils/response');
const { users, now, publicUser } = require('../database/store');
const { z } = require('zod');
const { hashPassword } = require('../services/users');

router.use(requireAuth, requireRole('admin', 'moderator'));
router.get('/', (req, res) => success(res, [...users.values()].sort((a, b) => b.createdAt - a.createdAt).map(publicUser), 'Users'));
router.patch('/:id', async (req, res, next) => {
  try {
    const p = z.object({ role: z.enum(['user', 'moderator', 'admin']).optional(), status: z.enum(['active', 'suspended', 'pending']).optional(), plan: z.enum(['FREE', 'DEVELOPER', 'PRO', 'ENTERPRISE']).optional(), password: z.string().min(8).max(128).optional() }).safeParse(req.body);
    if (!p.success) return error(res, 400, 'Invalid user data');
    const u = users.get(req.params.id);
    if (!u) return error(res, 404, 'User not found');
    if (p.data.role) u.role = p.data.role;
    if (p.data.status) u.status = p.data.status;
    if (p.data.plan) u.plan = p.data.plan;
    if (p.data.password) u.passwordHash = await hashPassword(p.data.password);
    u.updatedAt = now();
    return success(res, publicUser(u), 'User updated');
  } catch (e) { next(e); }
});
module.exports = router;
