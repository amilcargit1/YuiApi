// Request statistics middleware without Prisma or a database.
const crypto = require('node:crypto');

const stats = {
  total: 0,
  byMethod: Object.create(null),
  byStatus: Object.create(null),
};

function hashIp(ip) {
  if (!ip) return null;
  return crypto
    .createHash('sha256')
    .update(`${ip}:${process.env.JWT_SECRET || 'yui'}`)
    .digest('hex');
}

function requestStats(req, res, next) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    if (!req.path.startsWith('/api/')) return;

    const durationMs = Math.round(
      Number(process.hrtime.bigint() - start) / 1e6
    );

    stats.total += 1;
    stats.byMethod[req.method] = (stats.byMethod[req.method] || 0) + 1;
    stats.byStatus[res.statusCode] = (stats.byStatus[res.statusCode] || 0) + 1;

    req.requestMetrics = {
      durationMs,
      statusCode: res.statusCode,
      ipHash: hashIp(req.ip),
      userAgent: (req.get('user-agent') || '').slice(0, 500),
    };
  });

  next();
}

requestStats.getStats = () => ({
  total: stats.total,
  byMethod: { ...stats.byMethod },
  byStatus: { ...stats.byStatus },
});

module.exports = { requestStats };
