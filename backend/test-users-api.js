#!/usr/bin/env node

/**
 * Test script for Users CRUD API with RBAC
 * Usage: node test-users-api.js
 */

const BASE_URL = 'http://localhost:5000/api';

// Test credentials
const TEST_USERS = {
    superadmin: { username: 'superadmin', password: '123456' },
    admin: { username: 'admin', password: '123456' },
    manager: { username: 'manager', password: '123456' },
    consultant: { username: 'consultant', password: '123456' },
    editor: { username: 'editor', password: '123456' }
};

// Helper function to make API requests
async function apiRequest(method, endpoint, data = null, token = null) {
    const url = `${BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        return {
            status: response.status,
            data: result
        };
    } catch (error) {
        return {
            status: 0,
            error: error.message
        };
    }
}

// Login helper
async function login(username, password) {
    const response = await apiRequest('POST', '/auth/login', { username, password });
    if (response.status === 200 && response.data.token) {
        return response.data.token;
    }
    throw new Error(`Login failed for ${username}: ${JSON.stringify(response)}`);
}

// Test scenarios
async function runTests() {
    console.log('🧪 Starting Users CRUD RBAC Tests...\n');

    try {
        // 1. Test login for all users
        console.log('1️⃣ Testing login for all users...');
        const tokens = {};
        
        for (const [role, credentials] of Object.entries(TEST_USERS)) {
            try {
                tokens[role] = await login(credentials.username, credentials.password);
                console.log(`   ✅ ${role}: Login successful`);
            } catch (error) {
                console.log(`   ❌ ${role}: ${error.message}`);
            }
        }

        // 2. Test GET /api/users (different permissions)
        console.log('\n2️⃣ Testing GET /api/users with different roles...');
        
        for (const [role, token] of Object.entries(tokens)) {
            if (!token) continue;
            
            const response = await apiRequest('GET', '/users', null, token);
            console.log(`   ${role}: Status ${response.status} - ${response.data?.data?.length || 0} users visible`);
        }

        // 3. Test GET /api/users/roles (available roles for assignment)
        console.log('\n3️⃣ Testing GET /api/users/roles (assignable roles)...');
        
        for (const [role, token] of Object.entries(tokens)) {
            if (!token) continue;
            
            const response = await apiRequest('GET', '/users/roles', null, token);
            const rolesCount = response.data?.data?.length || 0;
            console.log(`   ${role}: Status ${response.status} - Can assign ${rolesCount} roles`);
            
            if (response.status === 200 && response.data.data) {
                const roleNames = response.data.data.map(r => r.name).join(', ');
                console.log(`        Available: ${roleNames}`);
            }
        }

        // 4. Test POST /api/users (create user with different permissions)
        console.log('\n4️⃣ Testing POST /api/users (create new user)...');
        
        const testUserData = {
            name: 'Test User',
            username: 'testuser123',
            email: 'testuser123@example.com',
            password: 'password123',
            role_id: 5 // Consultant role
        };

        // Test with Admin token (should be allowed to create Consultant)
        if (tokens.admin) {
            console.log('   Testing Admin creating Consultant...');
            const response = await apiRequest('POST', '/users', testUserData, tokens.admin);
            console.log(`   Admin create: Status ${response.status} - ${response.data.message || response.data.error || 'No message'}`);
        }

        // Test with Consultant token (should be denied)
        if (tokens.consultant) {
            const testUserData2 = {
                ...testUserData,
                username: 'testuser456',
                email: 'testuser456@example.com'
            };
            
            console.log('   Testing Consultant creating user (should fail)...');
            const response = await apiRequest('POST', '/users', testUserData2, tokens.consultant);
            console.log(`   Consultant create: Status ${response.status} - ${response.data.message || 'No message'}`);
        }

        // 5. Test role hierarchy restrictions
        console.log('\n5️⃣ Testing role hierarchy restrictions...');
        
        // Admin trying to create Superadmin (should fail)
        if (tokens.admin) {
            const superAdminData = {
                name: 'Fake Superadmin',
                username: 'fakesuperadmin',
                email: 'fake@example.com',
                password: 'password123',
                role_id: 1 // Superadmin role
            };
            
            console.log('   Testing Admin creating Superadmin (should fail)...');
            const response = await apiRequest('POST', '/users', superAdminData, tokens.admin);
            console.log(`   Admin → Superadmin: Status ${response.status} - ${response.data.message || 'No message'}`);
        }

        // Manager trying to create Admin (should fail)
        if (tokens.manager) {
            const adminData = {
                name: 'Fake Admin',
                username: 'fakeadmin',
                email: 'fakeadmin@example.com',
                password: 'password123',
                role_id: 2 // Admin role
            };
            
            console.log('   Testing Manager creating Admin (should fail)...');
            const response = await apiRequest('POST', '/users', adminData, tokens.manager);
            console.log(`   Manager → Admin: Status ${response.status} - ${response.data.message || 'No message'}`);
        }

        console.log('\n✅ Tests completed!');

    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

// Check if we have fetch (Node 18+)
if (typeof fetch === 'undefined') {
    console.error('❌ This script requires Node.js 18+ with fetch support');
    console.log('💡 Alternative: Use curl or Postman to test the APIs manually');
    process.exit(1);
}

// Run tests
runTests();