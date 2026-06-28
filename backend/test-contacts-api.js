/**
 * Comprehensive test script for Contacts API
 * Tests all CRUD operations with different user roles
 * Usage: node test-contacts-api.js
 */

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUsers = {
    superadmin: { username: 'superadmin', password: '123456', expectedRole: 1 },
    admin: { username: 'admin', password: '123456', expectedRole: 2 },
    consultant: { username: 'consultant', password: '123456', expectedRole: 5 },
    // Add manager if exists
    manager: { username: 'manager', password: '123456', expectedRole: 3 }
};

const testContact = {
    name: "Nguyễn Văn Test",
    email: "test@example.com", 
    phone: "+81-90-1234-5678",
    message: "Tôi muốn tư vấn du học Nhật Bản",
    status: "new",
    contact_method: "email",
    social_contact: "facebook.com/test"
};

let tokens = {};
let contactId = null;

// Helper function for API requests
async function apiRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        return {
            status: response.status,
            ok: response.ok,
            data: data
        };
    } catch (error) {
        console.error(`❌ API Request failed for ${endpoint}:`, error.message);
        return {
            status: 0,
            ok: false,
            error: error.message
        };
    }
}

// Login and get tokens
async function loginUsers() {
    console.log('🔐 Logging in test users...\n');
    
    for (const [role, credentials] of Object.entries(testUsers)) {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: credentials
        });

        if (response.ok) {
            // Extract token from response
            const token = response.data?.token;
            if (token) {
                console.log(`✅ ${role} login successful`);
                tokens[role] = token;
            } else {
                console.log(`❌ ${role} login failed: No token in response`);
            }
        } else {
            console.log(`❌ ${role} login failed:`, response.data?.message || 'Unknown error');
        }
    }
    console.log('');
}

// Test contact creation with different roles
async function testCreateContact() {
    console.log('📝 Testing Contact Creation...\n');

    // Test with each role
    for (const [role, token] of Object.entries(tokens)) {
        console.log(`Testing contact creation as ${role}:`);
        
        const response = await apiRequest('/contacts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: {
                ...testContact,
                name: `${testContact.name} - ${role}`
            }
        });

        const allowedRoles = ['superadmin', 'admin', 'manager', 'consultant'];
        const shouldSucceed = allowedRoles.includes(role);

        if (shouldSucceed && response.ok) {
            console.log(`  ✅ Success: Contact created (ID: ${response.data?.data?.id})`);
            if (role === 'admin' && !contactId) {
                contactId = response.data.data.id; // Save for update/delete tests
            }
        } else if (!shouldSucceed && response.status === 403) {
            console.log(`  ✅ Correctly denied: ${response.data.message}`);
        } else {
            console.log(`  ❌ Unexpected result: Status ${response.status} - ${response.data?.message}`);
        }
    }
    console.log('');
}

// Test getting contacts with different roles
async function testGetContacts() {
    console.log('📋 Testing Get Contacts...\n');

    for (const [role, token] of Object.entries(tokens)) {
        console.log(`Testing get contacts as ${role}:`);
        
        const response = await apiRequest('/contacts', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const allowedRoles = ['superadmin', 'admin', 'manager', 'consultant'];
        const shouldSucceed = allowedRoles.includes(role);

        if (shouldSucceed && response.ok) {
            const contactCount = response.data?.data?.length || 0;
            console.log(`  ✅ Success: Retrieved ${contactCount} contacts`);
            
            if (role === 'consultant') {
                console.log(`  📌 Note: Consultant should only see assigned contacts`);
            }
        } else if (!shouldSucceed && response.status === 403) {
            console.log(`  ✅ Correctly denied: ${response.data.message}`);
        } else {
            console.log(`  ❌ Unexpected result: Status ${response.status} - ${response.data?.message}`);
        }
    }
    console.log('');
}

// Test updating contacts
async function testUpdateContact() {
    console.log('✏️ Testing Contact Updates...\n');

    if (!contactId) {
        console.log('❌ No contact ID available for testing updates\n');
        return;
    }

    const updateData = {
        status: 'pending',
        message: 'Updated message - test update functionality'
    };

    for (const [role, token] of Object.entries(tokens)) {
        console.log(`Testing contact update as ${role}:`);
        
        const response = await apiRequest(`/contacts/${contactId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: updateData
        });

        const allowedRoles = ['superadmin', 'admin', 'manager', 'consultant'];
        const shouldSucceed = allowedRoles.includes(role);

        if (shouldSucceed && response.ok) {
            console.log(`  ✅ Success: Contact updated`);
        } else if (!shouldSucceed && response.status === 403) {
            console.log(`  ✅ Correctly denied: ${response.data.message}`);
        } else if (role === 'consultant' && response.status === 403) {
            console.log(`  ✅ Consultant access control working: ${response.data.message}`);
        } else {
            console.log(`  ❌ Unexpected result: Status ${response.status} - ${response.data?.message}`);
        }
    }
    console.log('');
}

// Test contact deletion
async function testDeleteContact() {
    console.log('🗑️ Testing Contact Deletion...\n');

    if (!contactId) {
        console.log('❌ No contact ID available for testing deletion\n');
        return;
    }

    for (const [role, token] of Object.entries(tokens)) {
        console.log(`Testing contact deletion as ${role}:`);
        
        const response = await apiRequest(`/contacts/${contactId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        // Only superadmin, admin, manager can delete
        const canDelete = ['superadmin', 'admin', 'manager'].includes(role);

        if (canDelete && response.ok) {
            console.log(`  ✅ Success: Contact deleted`);
            contactId = null; // Mark as deleted
            break; // Stop testing after successful deletion
        } else if (!canDelete && response.status === 403) {
            console.log(`  ✅ Correctly denied: ${response.data.message}`);
        } else if (response.status === 404) {
            console.log(`  ℹ️ Contact already deleted`);
            break;
        } else {
            console.log(`  ❌ Unexpected result: Status ${response.status} - ${response.data?.message}`);
        }
    }
    console.log('');
}

// Test getting assignable users
async function testGetAssignableUsers() {
    console.log('👥 Testing Get Assignable Users...\n');

    for (const [role, token] of Object.entries(tokens)) {
        console.log(`Testing get assignable users as ${role}:`);
        
        const response = await apiRequest('/contacts/assignable-users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const allowedRoles = ['superadmin', 'admin', 'manager', 'consultant'];
        const shouldSucceed = allowedRoles.includes(role);

        if (shouldSucceed && response.ok) {
            const userCount = response.data?.data?.length || 0;
            console.log(`  ✅ Success: Retrieved ${userCount} assignable users`);
        } else if (!shouldSucceed && response.status === 403) {
            console.log(`  ✅ Correctly denied: ${response.data.message}`);
        } else {
            console.log(`  ❌ Unexpected result: Status ${response.status} - ${response.data?.message}`);
        }
    }
    console.log('');
}

// Test getting contact stats
async function testGetContactStats() {
    console.log('📊 Testing Get Contact Statistics...\n');

    for (const [role, token] of Object.entries(tokens)) {
        console.log(`Testing get contact stats as ${role}:`);
        
        const response = await apiRequest('/contacts/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const allowedRoles = ['superadmin', 'admin', 'manager', 'consultant'];
        const shouldSucceed = allowedRoles.includes(role);

        if (shouldSucceed && response.ok) {
            const total = response.data?.data?.total || 0;
            console.log(`  ✅ Success: Total contacts ${total}`);
            if (role === 'consultant') {
                console.log(`  📌 Note: Consultant should only see stats for assigned contacts`);
            }
        } else if (!shouldSucceed && response.status === 403) {
            console.log(`  ✅ Correctly denied: ${response.data.message}`);
        } else {
            console.log(`  ❌ Unexpected result: Status ${response.status} - ${response.data?.message}`);
        }
    }
    console.log('');
}

// Test adding contact notes
async function testAddContactNote() {
    console.log('📝 Testing Add Contact Notes...\n');

    if (!contactId) {
        console.log('❌ No contact ID available for note testing');
        return;
    }

    for (const [role, token] of Object.entries(tokens)) {
        console.log(`Testing add note as ${role}:`);
        
        const response = await apiRequest(`/contacts/${contactId}/notes`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: {
                note: `Test note from ${role} at ${new Date().toISOString()}`
            }
        });

        const allowedRoles = ['superadmin', 'admin', 'manager', 'consultant'];
        const shouldSucceed = allowedRoles.includes(role);

        if (shouldSucceed && response.ok) {
            console.log(`  ✅ Success: Note added (ID: ${response.data?.data?.id})`);
        } else if (!shouldSucceed && response.status === 403) {
            console.log(`  ✅ Correctly denied: ${response.data.message}`);
        } else {
            console.log(`  ❌ Unexpected result: Status ${response.status} - ${response.data?.message}`);
        }
    }
    console.log('');
}

// Test getting contact notes
async function testGetContactNotes() {
    console.log('📖 Testing Get Contact Notes...\n');

    if (!contactId) {
        console.log('❌ No contact ID available for notes testing');
        return;
    }

    for (const [role, token] of Object.entries(tokens)) {
        console.log(`Testing get notes as ${role}:`);
        
        const response = await apiRequest(`/contacts/${contactId}/notes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const allowedRoles = ['superadmin', 'admin', 'manager', 'consultant'];
        const shouldSucceed = allowedRoles.includes(role);

        if (shouldSucceed && response.ok) {
            const noteCount = response.data?.data?.length || 0;
            console.log(`  ✅ Success: Retrieved ${noteCount} notes`);
        } else if (!shouldSucceed && response.status === 403) {
            console.log(`  ✅ Correctly denied: ${response.data.message}`);
        } else {
            console.log(`  ❌ Unexpected result: Status ${response.status} - ${response.data?.message}`);
        }
    }
    console.log('');
}

// Test updating contact status with business logic
async function testUpdateContactStatus() {
    console.log('🔄 Testing Update Contact Status...\n');

    if (!contactId) {
        console.log('❌ No contact ID available for status testing');
        return;
    }

    const statusTests = [
        { status: 'pending', note: 'Đã liên lạc với khách hàng' },
        { status: 'responded', note: 'Khách hàng đã phản hồi' },
        { status: 'closed', note: 'Khách hàng đã hoàn thành thủ tục' }
    ];

    for (const [role, token] of Object.entries(tokens)) {
        console.log(`Testing status updates as ${role}:`);
        
        for (const testCase of statusTests) {
            const response = await apiRequest(`/contacts/${contactId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: testCase
            });

            const allowedRoles = ['superadmin', 'admin', 'manager', 'consultant'];
            const shouldSucceed = allowedRoles.includes(role);

            // Special case: consultant cannot update closed status
            const isConsultantTryingClosed = role === 'consultant' && testCase.status === 'closed';

            if (shouldSucceed && response.ok && !isConsultantTryingClosed) {
                console.log(`  ✅ Success: Status updated to ${testCase.status}`);
            } else if (isConsultantTryingClosed && response.status === 403) {
                console.log(`  ✅ Correctly denied consultant closing: ${response.data.message}`);
            } else if (!shouldSucceed && response.status === 403) {
                console.log(`  ✅ Correctly denied: ${response.data.message}`);
            } else {
                console.log(`  ❌ Unexpected result: Status ${response.status} - ${response.data?.message}`);
            }
            
            // Break after first successful status change to avoid conflicts
            if (response.ok) break;
        }
        console.log('');
    }
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting Contacts API Tests...\n');
    console.log('='.repeat(50));
    console.log('📋 CONTACT RBAC TEST REQUIREMENTS:');
    console.log('- Only roles 1,2,3,5 (superadmin,admin,manager,consultant) can access');
    console.log('- Consultant can see all contacts now (updated logic)');
    console.log('- Consultant cannot update closed contacts');
    console.log('- Consultant cannot delete any contacts');
    console.log('- Auto-assign contacts when updated');
    console.log('- All operations should have audit logging');
    console.log('='.repeat(50));
    console.log('');

    try {
        await loginUsers();
        await testCreateContact();
        await testGetContacts();
        await testUpdateContact();
        await testAddContactNote();
        await testGetContactNotes();
        await testUpdateContactStatus();
        await testGetAssignableUsers();
        await testGetContactStats();
        await testDeleteContact(); // Test deletion last
        
        console.log('🎉 All Contact API tests completed!\n');
        console.log('📝 Check server logs for:');
        console.log('  - Winston logs (info/error)');
        console.log('  - Audit logs (CREATE_CONTACT, UPDATE_CONTACT, DELETE_CONTACT)');
        console.log('  - Security logs (permission violations)');
        console.log('  - Input sanitization logs');
        
    } catch (error) {
        console.error('💥 Test execution failed:', error);
    }
}

// Check if Node.js has fetch (Node 18+) or use alternative
if (typeof fetch === 'undefined') {
    console.log('❌ This script requires Node.js 18+ with fetch API');
    console.log('💡 Alternative: Use curl commands or install node-fetch');
    console.log('');
    console.log('Example curl test:');
    console.log('curl -X POST http://localhost:5000/api/auth/login \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"username":"admin","password":"123456"}\'');
    process.exit(1);
}

// Run tests
runTests().catch(console.error);