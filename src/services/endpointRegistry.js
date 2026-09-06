const fs = require('node:fs');
const path = require('node:path');
const express = require('express');

const router = express.Router();
const registry = [];
const mountedRoutes = new Set();

const SUPPORTED_METHODS = new Set([
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'options',
  'head'
]);

const ENDPOINTS_ROOT = path.join(__dirname, '..', 'endpoints');

function normalizeMeta(meta, category, file) {
  if (!meta || typeof meta !== 'object') {
    throw new TypeError(`Invalid endpoint metadata: ${category}/${file}`);
  }

  if (typeof meta.path !== 'string' || !meta.path.trim()) {
    throw new TypeError(`Endpoint path is required: ${category}/${file}`);
  }

  const method = String(meta.method || 'GET').toLowerCase();
  if (!SUPPORTED_METHODS.has(method)) {
    throw new TypeError(`Unsupported HTTP method "${meta.method}": ${category}/${file}`);
  }

  return {
    version: 'v1',
    tags: [],
    auth: false,
    ...meta,
    method: method.toUpperCase(),
    path: meta.path.trim(),
    category: meta.category || category,
    file: `${category}/${file}`
  };
}

function getEndpointFiles() {
  if (!fs.existsSync(ENDPOINTS_ROOT)) {
    throw new Error(`Endpoints directory not found: ${ENDPOINTS_ROOT}`);
  }

  return fs
    .readdirSync(ENDPOINTS_ROOT, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap(categoryEntry => {
      const categoryPath = path.join(ENDPOINTS_ROOT, categoryEntry.name);

      return fs
        .readdirSync(categoryPath, { withFileTypes: true })
        .filter(entry => entry.isFile() && entry.name.endsWith('.js'))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(fileEntry => ({
          category: categoryEntry.name,
          file: fileEntry.name,
          absolutePath: path.join(categoryPath, fileEntry.name)
        }));
    });
}

function loadEndpoints() {
  registry.length = 0;
  mountedRoutes.clear();

  const endpoints = getEndpointFiles();

  for (const endpoint of endpoints) {
    let mod;

    try {
      delete require.cache[require.resolve(endpoint.absolutePath)];
      mod = require(endpoint.absolutePath);
    } catch (error) {
      throw new Error(
        `Failed to load endpoint ${endpoint.category}/${endpoint.file}: ${error.message}`,
        { cause: error }
      );
    }

    if (!mod || typeof mod.handler !== 'function') {
      throw new TypeError(
        `Endpoint handler must be a function: ${endpoint.category}/${endpoint.file}`
      );
    }

    const meta = normalizeMeta(mod.meta, endpoint.category, endpoint.file);
    const routeKey = `${meta.method}:${meta.path}`;

    if (mountedRoutes.has(routeKey)) {
      throw new Error(`Duplicate endpoint route detected: ${routeKey}`);
    }

    mountedRoutes.add(routeKey);
    registry.push(meta);
    router[meta.method.toLowerCase()](meta.path, mod.handler);
  }

  return getRegistry();
}

function getRegistry() {
  return [...registry].sort((a, b) => {
    const pathCompare = a.path.localeCompare(b.path);
    return pathCompare || a.method.localeCompare(b.method);
  });
}

function getCategories() {
  const categories = new Map();

  for (const endpoint of registry) {
    const current = categories.get(endpoint.category) || 0;
    categories.set(endpoint.category, current + 1);
  }

  return [...categories.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, count]) => ({
      name,
      count,
      status: 'operational'
    }));
}

module.exports = {
  router,
  loadEndpoints,
  getRegistry,
  getCategories
};
