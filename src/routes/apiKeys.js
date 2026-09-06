const router = require('express').Router();
const { z } = require('zod');
const { requireAuth } = require('../middleware/auth');
const { success, error } = require('../utils/response');
const { createKey, listKeys } = require('../services/apiKeys');
const { apiKeys } = require('../database/store');

router.use(requireAuth);
router.get('/', async (req, res, next) => { try { return success(res, await listKeys(req.user.sub), 'API keys'); } catch (e) { next(e); } });
router.post('/', async (req, res, next) => {
  try {
    const p = z.object({ name: z.string().min(1).max(80) }).safeParse(req.body);
    if (!p.success) return error(res, 400, 'Invalid key name');
    const k = await createKey(req.user.sub, p.data.name);
    return success(res, { id: k.id, name: k.name, key: k.key, createdAt: k.createdAt }, 'API key created', 201);
  } catch (e) { next(e); }
});
router.post('/:id/revoke', (req, res) => {
  const key = apiKeys.get(req.params.id);
  if (!key || key.userId !== req.user.sub) return error(res, 404, 'API key not found');
  key.active = false;
  return success(res, {}, 'API key revoked');
});
router.delete('/:id', (req, res) => {
  const key = apiKeys.get(req.params.id);
  if (!key || key.userId !== req.user.sub) return error(res, 404, 'API key not found');
  apiKeys.delete(req.params.id);
  return success(res, {}, 'API key deleted');
});
module.exports = router;
