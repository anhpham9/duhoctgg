#!/usr/bin/env node

/**
 * Smoke test for permissions configuration + dynamic module guard.
 * Usage: node test-permissions-api.js
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

const TEST_USERS = {
    superadmin: { username: process.env.TEST_SUPERADMIN_USERNAME || 'superadmin', password: process.env.TEST_SUPERADMIN_PASSWORD || '123456' },
    admin: { username: process.env.TEST_ADMIN_USERNAME || 'admin', password: process.env.TEST_ADMIN_PASSWORD || '123456' },
    manager: { username: process.env.TEST_MANAGER_USERNAME || 'manager', password: process.env.TEST_MANAGER_PASSWORD || '123456' },
    editor: { username: process.env.TEST_EDITOR_USERNAME || 'editor', password: process.env.TEST_EDITOR_PASSWORD || '123456' }
};

const tokens = {};
let originalModules = [];
const tempUserIds = [];

async function apiRequest(method, endpoint, data = null, token = null) {
    const url = `${BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (token) {
        options.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    let payload = {};

    try {
        payload = await response.json();
    } catch {
        payload = {};
    }

    return {
        status: response.status,
        ok: response.ok,
        data: payload
    };
}

async function login(username, password) {
    const response = await apiRequest('POST', '/auth/login', { username, password });
    if (!response.ok || !response.data?.token) {
        throw new Error(`Login failed for ${username} (status ${response.status})`);
    }
    return response.data.token;
}

function makeTempIdentity(prefix) {
    const stamp = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    return {
        username: `${prefix}_${stamp}`,
        email: `${prefix}.${stamp}@example.com`,
        password: 'TempPass123!'
    };
}

async function createTempUser(roleId, prefix, superadminToken) {
    const identity = makeTempIdentity(prefix);
    const payload = {
        name: `Temp ${prefix}`,
        username: identity.username,
        email: identity.email,
        password: identity.password,
        role_id: roleId,
        is_active: true
    };

    const response = await apiRequest('POST', '/users', payload, superadminToken);
    if (!response.ok || !response.data?.data?.id) {
        throw new Error(`Cannot create temp ${prefix} user (status ${response.status})`);
    }

    tempUserIds.push(response.data.data.id);
    const token = await login(identity.username, identity.password);

    return {
        id: response.data.data.id,
        token
    };
}

async function cleanupTempUsers(superadminToken) {
    for (const userId of tempUserIds) {
        try {
            await apiRequest('DELETE', `/users/${userId}`, null, superadminToken);
        } catch {
            // Best-effort cleanup only.
        }
    }
}

function findModule(modules, key) {
    return (modules || []).find((item) => item.key === key);
}

async function run() {
    console.log('=== Permissions API + Module Guard Smoke Test ===');
    console.log(`Base URL: ${BASE_URL}`);

    try {
        console.log('\n1) Login test users');
        for (const [role, credentials] of Object.entries(TEST_USERS)) {
            try {
                tokens[role] = await login(credentials.username, credentials.password);
                console.log(`  [OK] ${role} login`);
            } catch (error) {
                console.log(`  [FAIL] ${role} login: ${error.message}`);
            }
        }

        if (!tokens.superadmin) {
            throw new Error('Need superadmin token to continue.');
        }

        // Keep smoke test deterministic across environments.
        if (!tokens.admin) {
            const tempAdmin = await createTempUser(2, 'temp_admin', tokens.superadmin);
            tokens.admin = tempAdmin.token;
            console.log('  [OK] created temp admin for testing');
        }

        if (!tokens.editor) {
            const tempEditor = await createTempUser(4, 'temp_editor', tokens.superadmin);
            tokens.editor = tempEditor.token;
            console.log('  [OK] created temp editor for testing');
        }

        console.log('\n2) Permissions config access control');
        const adminGet = await apiRequest('GET', '/permissions/config', null, tokens.admin);
        console.log(`  admin GET /permissions/config -> ${adminGet.status}`);

        let managerToken = tokens.manager;
        if (!managerToken) {
            const tempManager = await createTempUser(3, 'temp_manager', tokens.superadmin);
            managerToken = tempManager.token;
            tokens.manager = managerToken;
            console.log('  [OK] created temp manager for access-denied check');
        }

        const managerGet = await apiRequest('GET', '/permissions/config', null, managerToken);
        if (managerGet) {
            console.log(`  manager GET /permissions/config -> ${managerGet.status} (expected 403)`);
        }

        if (!adminGet.ok || !Array.isArray(adminGet.data?.data?.modules)) {
            throw new Error('Cannot read permissions config as admin.');
        }

        originalModules = adminGet.data.data.modules;

        console.log('\n3) Update config (temporarily remove editor from news module)');
        const modifiedModules = originalModules.map((module) => {
            if (module.key !== 'news') return module;

            return {
                ...module,
                allowedRoles: (module.allowedRoles || []).filter((roleId) => Number(roleId) !== 4)
            };
        });

        const adminPut = await apiRequest('PUT', '/permissions/config', { modules: modifiedModules }, tokens.admin);
        console.log(`  admin PUT /permissions/config -> ${adminPut.status}`);

        if (!adminPut.ok) {
            throw new Error(`Update permissions config failed (${adminPut.status}).`);
        }

        console.log('\n4) Validate dynamic backend guard on /api/news');
        if (tokens.editor) {
            const editorNews = await apiRequest('GET', '/news', null, tokens.editor);
            console.log(`  editor GET /news -> ${editorNews.status} (expected 403 after update)`);
        } else {
            console.log('  [SKIP] editor token unavailable');
        }

        console.log('\n5) Restore original config');
        const restoreResult = await apiRequest('PUT', '/permissions/config', { modules: originalModules }, tokens.superadmin);
        console.log(`  superadmin restore PUT /permissions/config -> ${restoreResult.status}`);

        if (!restoreResult.ok) {
            throw new Error(`Failed to restore original permissions config (${restoreResult.status}).`);
        }

        const verifyAfterRestore = await apiRequest('GET', '/permissions/config', null, tokens.superadmin);
        const restoredNews = findModule(verifyAfterRestore.data?.data?.modules || [], 'news');
        const hasEditor = (restoredNews?.allowedRoles || []).includes(4);
        console.log(`  verify restore news includes editor role -> ${hasEditor ? 'YES' : 'NO'}`);

        await cleanupTempUsers(tokens.superadmin);
        console.log('  temp users cleanup -> done');

        console.log('\n=== Smoke test completed ===');
    } catch (error) {
        console.error(`\n[ERROR] ${error.message}`);

        // Best-effort restore if we have backup config.
        if (originalModules.length > 0 && tokens.superadmin) {
            try {
                await apiRequest('PUT', '/permissions/config', { modules: originalModules }, tokens.superadmin);
                console.log('[RECOVERY] Restored original permissions config.');
            } catch {
                console.log('[RECOVERY] Failed to restore automatically.');
            }
        }

        if (tokens.superadmin) {
            await cleanupTempUsers(tokens.superadmin);
        }

        process.exitCode = 1;
    }
}

if (typeof fetch === 'undefined') {
    console.error('This script requires Node.js 18+ (fetch API).');
    process.exit(1);
}

run();