'use strict';

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
  'head',
]);

const ENDPOINTS_ROOT = path.resolve(__dirname, '..', 'endpoints');
const ENDPOINT_EXTENSION = '.js';

function normalizePath(value, category, file) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new TypeError(`Endpoint path is required: ${category}/${file}`);
  }

  const normalized = value.trim();
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

function normalizeMeta(meta, category, file) {
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) {
    throw new TypeError(`Invalid endpoint metadata: ${category}/${file}`);
  }

  const method = String(meta.method || 'GET').trim().toLowerCase();
  if (!SUPPORTED_METHODS.has(method)) {
    throw new TypeError(
      `Unsupported HTTP method "${meta.method}": ${category}/${file}`
    );
  }

  return {
    version: 'v1',
    tags: [],
    auth: false,
    ...meta,
    method: method.toUpperCase(),
    path: normalizePath(meta.path, category, file),
    category: String(meta.category || category).trim() || category,
    file: `${category}/${file}`,
  };
}

function getEndpointFiles() {
  if (!fs.existsSync(ENDPOINTS_ROOT)) {
    throw new Error(`Endpoints directory not found: ${ENDPOINTS_ROOT}`);
  }

  if (!fs.statSync(ENDPOINTS_ROOT).isDirectory()) {
    throw new Error(`Endpoints path is not a directory: ${ENDPOINTS_ROOT}`);
  }

  const categories = fs
    .readdirSync(ENDPOINTS_ROOT, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  return categories.flatMap(categoryEntry => {
    const categoryPath = path.join(ENDPOINTS_ROOT, categoryEntry.name);

    return fs
      .readdirSync(categoryPath, { withFileTypes: true })
      .filter(
        entry =>
          entry.isFile() &&
          path.extname(entry.name).toLowerCase() === ENDPOINT_EXTENSION
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(fileEntry => ({
        category: categoryEntry.name,
        file: fileEntry.name,
        absolutePath: path.join(categoryPath, fileEntry.name),
      }));
  });
}

function clearModuleCache(filePath) {
  try {
    delete require.cache[require.resolve(filePath)];
  } catch {
    // Module has not been cached yet.
  }
}

function loadModule(endpoint) {
  clearModuleCache(endpoint.absolutePath);

  try {
    return require(endpoint.absolutePath);
  } catch (error) {
    throw new Error(
      `Failed to load endpoint ${endpoint.category}/${endpoint.file}: ${error.message}`,
      { cause: error }
    );
  }
}

function registerEndpoint(mod, endpoint) {
  if (!mod || typeof mod !== 'object' || Array.isArray(mod)) {
    throw new TypeError(
      `Endpoint module must export an object: ${endpoint.category}/${endpoint.file}`
    );
  }

  if (typeof mod.handler !== 'function') {
    throw new TypeError(
      `Endpoint handler must be a function: ${endpoint.category}/${endpoint.file}`
    );
  }

  const meta = normalizeMeta(mod.meta, endpoint.category, endpoint.file);
  const routeKey = `${meta.method}:${meta.path}`;

  if (mountedRoutes.has(routeKey)) {
    throw new Error(`Duplicate endpoint route detected: ${routeKey}`);
  }

  const mount = router[meta.method.toLowerCase()];
  if (typeof mount !== 'function') {
    throw new Error(`Express does not support HTTP method: ${meta.method}`);
  }

  mount.call(router, meta.path, mod.handler);
  mountedRoutes.add(routeKey);
  registry.push(meta);
}

function loadEndpoints() {
  registry.length = 0;
  mountedRoutes.clear();

  const endpoints = getEndpointFiles();

  for (const endpoint of endpoints) {
    const mod = loadModule(endpoint);
    registerEndpoint(mod, endpoint);
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
    categories.set(
      endpoint.category,
      (categories.get(endpoint.category) || 0) + 1
    );
  }

  return [...categories.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, count]) => ({
      name,
      count,
      status: 'operational',
    }));
}

function getStats() {
  const methods = {};

  for (const endpoint of registry) {
    methods[endpoint.method] = (methods[endpoint.method] || 0) + 1;
  }

  return {
    endpoints: registry.length,
    categories: getCategories().length,
    methods,
  };
}

module.exports = {
  router,
  loadEndpoints,
  getRegistry,
  getCategories,
  getStats,
};
