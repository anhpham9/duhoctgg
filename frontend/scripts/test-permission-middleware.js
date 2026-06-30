#!/usr/bin/env node

/**
 * Frontend permission middleware matrix smoke test.
 * Verifies route access decisions based on live /api/permissions/config.
 * Usage: node scripts/test-permission-middleware.js
 */

const API_BASE = process.env.API_BASE_URL || "http://localhost:5000/api";

const SUPERADMIN = {
  username: process.env.TEST_SUPERADMIN_USERNAME || "superadmin",
  password: process.env.TEST_SUPERADMIN_PASSWORD || "123456"
};

const ROLE_IDS = [1, 2, 3, 4, 5];

const apiRequest = async (method, endpoint, body = null, token = null) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  return {
    ok: response.ok,
    status: response.status,
    data
  };
};

const login = async (username, password) => {
  const result = await apiRequest("POST", "/auth/login", { username, password });
  if (!result.ok || !result.data?.token) {
    throw new Error(`Login failed for ${username} (status ${result.status})`);
  }
  return result.data.token;
};

const pickBestMatchedModuleByPath = (path, moduleList) => {
  const normalizedPath = String(path || "").trim();
  if (!normalizedPath.startsWith("/admin")) return null;

  const matched = moduleList
    .filter((module) => normalizedPath === module.routePrefix || normalizedPath.startsWith(`${module.routePrefix}/`))
    .sort((a, b) => b.routePrefix.length - a.routePrefix.length);

  return matched[0] || moduleList.find((module) => module.key === "dashboard") || null;
};

const canAccessPath = (path, roleId, moduleList) => {
  const normalizedRoleId = Number(roleId);
  if (normalizedRoleId === 1) return true;

  const matchedModule = pickBestMatchedModuleByPath(path, moduleList);
  if (!matchedModule) return true;

  return (matchedModule.allowedRoles || []).includes(normalizedRoleId);
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const run = async () => {
  console.log("=== Frontend Middleware Permission Matrix Test ===");
  console.log(`API: ${API_BASE}`);

  const superadminToken = await login(SUPERADMIN.username, SUPERADMIN.password);
  console.log("[OK] Superadmin login");

  const configRes = await apiRequest("GET", "/permissions/config", null, superadminToken);
  assert(configRes.ok, `Cannot load permissions config (status ${configRes.status})`);
  assert(Array.isArray(configRes.data?.data?.modules), "Permissions modules payload is invalid");

  const modules = configRes.data.data.modules;
  console.log(`[OK] Loaded ${modules.length} modules`);

  let checked = 0;

  for (const module of modules) {
    for (const roleId of ROLE_IDS) {
      const expected = roleId === 1 || (module.allowedRoles || []).includes(roleId);
      const directPath = module.routePrefix;
      const nestedPath = `${module.routePrefix}/_probe`;

      const actualDirect = canAccessPath(directPath, roleId, modules);
      const actualNested = canAccessPath(nestedPath, roleId, modules);

      assert(
        actualDirect === expected,
        `Mismatch direct path: module=${module.key}, role=${roleId}, expected=${expected}, actual=${actualDirect}`
      );

      assert(
        actualNested === expected,
        `Mismatch nested path: module=${module.key}, role=${roleId}, expected=${expected}, actual=${actualNested}`
      );

      checked += 2;
    }
  }

  // Specific precedence check: /admin/settings/permissions must match module permissions, not settings.
  const permissionsModule = modules.find((module) => module.key === "permissions");
  assert(permissionsModule, "permissions module missing in config");

  for (const roleId of ROLE_IDS) {
    const expected = roleId === 1 || (permissionsModule.allowedRoles || []).includes(roleId);
    const actual = canAccessPath("/admin/settings/permissions", roleId, modules);
    assert(
      actual === expected,
      `Path precedence mismatch for /admin/settings/permissions with role=${roleId}`
    );
    checked += 1;
  }

  // Non-admin routes should always pass middleware permission check.
  for (const roleId of ROLE_IDS) {
    const actual = canAccessPath("/about", roleId, modules);
    assert(actual === true, `Non-admin route should be accessible for role=${roleId}`);
    checked += 1;
  }

  console.log(`[OK] Assertions passed: ${checked}`);
  console.log("=== Test completed ===");
};

if (typeof fetch === "undefined") {
  console.error("This script requires Node.js 18+ (fetch API)");
  process.exit(1);
}

run().catch((error) => {
  console.error(`[ERROR] ${error.message}`);
  process.exit(1);
});
