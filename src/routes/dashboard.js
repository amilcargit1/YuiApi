const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { success } = require('../utils/response');
const { dashboard } = require('../services/statistics');
const { getRegistry, getCategories } = require('../services/endpointRegistry');
const { requestLogs } = require('../services/statistics');

router.use(requireAuth);
router.get('/stats', async (req, res, next) => { try { return success(res, await dashboard(req.user.sub), 'Dashboard statistics'); } catch (e) { next(e); } });
router.get('/logs', (req, res) => {
  let rows = requestLogs.filter((row) => row.userId === req.user.sub);
  if (req.query.status) rows = rows.filter((row) => row.statusCode === Number(req.query.status));
  if (req.query.endpoint) rows = rows.filter((row) => row.endpoint.includes(String(req.query.endpoint)));
  return success(res, rows.slice(-100).reverse(), 'Request history');
});
router.get('/endpoints', (req, res) => success(res, { endpoints: getRegistry(), categories: getCategories() }, 'Endpoint catalog'));
module.exports = router;
