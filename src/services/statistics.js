const { requestLogs } = require('../database/store');

async function dashboard(userId) {
  const rows = requestLogs.filter((row) => row.userId === userId);
  const since = Date.now() - 86400000;
  const todayRows = rows.filter((row) => row.createdAt.getTime() >= since);
  const successful = rows.filter((row) => row.statusCode < 400).length;
  const failed = rows.filter((row) => row.statusCode >= 400).length;
  const average = rows.length ? rows.reduce((sum, row) => sum + row.durationMs, 0) / rows.length : 0;
  return {
    totalRequests: rows.length,
    todayRequests: todayRows.length,
    successfulRequests: successful,
    failedRequests: failed,
    averageLatencyMs: Math.round(average),
    recent: rows.slice(-10).reverse(),
  };
}

module.exports = { dashboard, requestLogs };
