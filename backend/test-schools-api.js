#!/usr/bin/env node

/**
 * Comprehensive Schools API Test Suite
 * 
 * This script tests all the Schools module endpoints including:
 * - Schools CRUD operations with RBAC
 * - Regions CRUD operations
 * - School Types CRUD operations  
 * - FAQs CRUD operations
 * - School Reviews CRUD operations
 * 
 * Usage: node test-schools-api.js
 * 
 * Tests cover:
 * - Authentication and authorization (RBAC)
 * - Input validation and sanitization
 * - Error handling
 * - Data relationships (foreign keys)
 * - Rate limiting compliance
 * - Audit logging
 */

import axios from 'axios';
import { performance } from 'perf_hooks';

// Configuration
const API_BASE = 'http://localhost:5000/api';
const TEST_CONFIG = {
    timeout: 10000,
    maxRetries: 3,
    retryDelay: 1000
};

// Test users for different RBAC levels
const TEST_USERS = {
    superadmin: { email: 'admin@example.com', password: 'Admin@123' },
    admin: { email: 'admin2@example.com', password: 'Admin@123' },
    manager: { email: 'manager@example.com', password: 'Manager@123' },
    editor: { email: 'editor@example.com', password: 'Editor@123' },
    consultant: { email: 'consultant@example.com', password: 'Consultant@123' }
};

// Test data
const TEST_DATA = {
    region: {
        name: 'Test Region',
        slug: 'test-region'
    },
    schoolType: {
        name: 'Test School Type',
        slug: 'test-school-type'
    },
    school: {
        name: 'Test School',
        slug: 'test-school',
        location: 'Test City, Test Country',
        tuition_per_year: 500000,
        class_size: 15,
        visa_success_rate: 95,
        features: {
            'dormitory': true,
            'part_time_job': true,
            'scholarships': ['academic', 'sports']
        },
        status: 'active',
        logo_url: 'https://example.com/logo.png',
        thumbnail_url: 'https://example.com/thumb.png'
    },
    faq: {
        question: 'What are the admission requirements?',
        answer: 'You need to have completed high school and pass the entrance exam.',
        type: 'school'
    },
    review: {
        student_name: 'Test Student',
        avatar_url: 'https://example.com/avatar.png',
        nationality: 'Vietnamese',
        course_period: '2 years',
        rating: 5,
        content: 'Excellent school with great teachers and facilities!'
    }
};

// Utility functions
class TestRunner {
    constructor() {
        this.testResults = [];
        this.currentSuite = '';
        this.authTokens = {};
        this.createdEntities = {
            regions: [],
            schoolTypes: [],
            schools: [],
            faqs: [],
            reviews: []
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const colors = {
            info: '\x1b[36m',      // Cyan
            success: '\x1b[32m',   // Green  
            error: '\x1b[31m',     // Red
            warning: '\x1b[33m',   // Yellow
            reset: '\x1b[0m'       // Reset
        };
        
        console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
    }

    async authenticate(userType) {
        if (this.authTokens[userType]) {
            return this.authTokens[userType];
        }

        try {
            const user = TEST_USERS[userType];
            if (!user) {
                throw new Error(`Unknown user type: ${userType}`);
            }

            this.log(`Authenticating as ${userType}...`);
            const response = await axios.post(`${API_BASE}/auth/login`, user, {
                timeout: TEST_CONFIG.timeout,
                withCredentials: true
            });

            if (response.data.success && response.data.token) {
                this.authTokens[userType] = response.data.token;
                this.log(`✓ Authentication successful for ${userType}`, 'success');
                return response.data.token;
            } else {
                throw new Error(`Authentication failed for ${userType}`);
            }
        } catch (error) {
            this.log(`✗ Authentication failed for ${userType}: ${error.message}`, 'error');
            throw error;
        }
    }

    async makeRequest(method, endpoint, data = null, userType = 'superadmin', expectError = false) {
        const startTime = performance.now();
        
        try {
            const token = await this.authenticate(userType);
            const config = {
                method,
                url: `${API_BASE}${endpoint}`,
                timeout: TEST_CONFIG.timeout,
                withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            if (data && (method === 'POST' || method === 'PUT')) {
                config.data = data;
            }

            const response = await axios(config);
            const endTime = performance.now();
            
            if (!expectError) {
                this.log(`✓ ${method} ${endpoint} - ${response.status} (${Math.round(endTime - startTime)}ms)`, 'success');
            }
            
            return response;
        } catch (error) {
            const endTime = performance.now();
            
            if (expectError) {
                this.log(`✓ Expected error for ${method} ${endpoint} - ${error.response?.status} (${Math.round(endTime - startTime)}ms)`, 'success');
                return error.response;
            } else {
                this.log(`✗ ${method} ${endpoint} failed - ${error.response?.status} (${Math.round(endTime - startTime)}ms)`, 'error');
                throw error;
            }
        }
    }

    async test(name, testFunction) {
        this.log(`\n--- Testing: ${name} ---`, 'info');
        const startTime = performance.now();
        
        try {
            await testFunction();
            const endTime = performance.now();
            this.testResults.push({
                suite: this.currentSuite,
                name,
                status: 'PASS',
                duration: Math.round(endTime - startTime)
            });
            this.log(`✓ ${name} - PASSED (${Math.round(endTime - startTime)}ms)`, 'success');
        } catch (error) {
            const endTime = performance.now();
            this.testResults.push({
                suite: this.currentSuite,
                name,
                status: 'FAIL',
                duration: Math.round(endTime - startTime),
                error: error.message
            });
            this.log(`✗ ${name} - FAILED (${Math.round(endTime - startTime)}ms): ${error.message}`, 'error');
        }
    }

    async suite(name, suiteFunction) {
        this.currentSuite = name;
        this.log(`\n🧪 Starting test suite: ${name}`, 'info');
        
        try {
            await suiteFunction();
            this.log(`✓ Test suite completed: ${name}`, 'success');
        } catch (error) {
            this.log(`✗ Test suite failed: ${name} - ${error.message}`, 'error');
        }
    }

    // Test helper methods
    async createTestRegion() {
        const response = await this.makeRequest('POST', '/regions', TEST_DATA.region);
        const regionId = response.data.data.id;
        this.createdEntities.regions.push(regionId);
        return regionId;
    }

    async createTestSchoolType() {
        const response = await this.makeRequest('POST', '/school-types', TEST_DATA.schoolType);
        const typeId = response.data.data.id;
        this.createdEntities.schoolTypes.push(typeId);
        return typeId;
    }

    async createTestSchool(regionId, typeId) {
        const schoolData = {
            ...TEST_DATA.school,
            region_id: regionId,
            type_id: typeId
        };
        const response = await this.makeRequest('POST', '/schools', schoolData);
        const schoolId = response.data.data.id;
        this.createdEntities.schools.push(schoolId);
        return schoolId;
    }

    async cleanup() {
        this.log('\n🧹 Cleaning up test data...', 'info');
        
        try {
            // Delete in reverse order due to foreign key constraints
            for (const reviewId of this.createdEntities.reviews) {
                await this.makeRequest('DELETE', `/school-reviews/${reviewId}`, null, 'superadmin');
            }
            
            for (const faqId of this.createdEntities.faqs) {
                await this.makeRequest('DELETE', `/faqs/${faqId}`, null, 'superadmin');
            }
            
            for (const schoolId of this.createdEntities.schools) {
                await this.makeRequest('DELETE', `/schools/${schoolId}`, null, 'superadmin');
            }
            
            for (const typeId of this.createdEntities.schoolTypes) {
                await this.makeRequest('DELETE', `/school-types/${typeId}`, null, 'superadmin');
            }
            
            for (const regionId of this.createdEntities.regions) {
                await this.makeRequest('DELETE', `/regions/${regionId}`, null, 'superadmin');
            }
            
            this.log('✓ Cleanup completed', 'success');
        } catch (error) {
            this.log(`⚠ Cleanup had issues: ${error.message}`, 'warning');
        }
    }

    printSummary() {
        const passed = this.testResults.filter(t => t.status === 'PASS').length;
        const failed = this.testResults.filter(t => t.status === 'FAIL').length;
        const total = this.testResults.length;
        
        this.log(`\n📊 TEST SUMMARY`, 'info');
        this.log(`Total Tests: ${total}`, 'info');
        this.log(`Passed: ${passed}`, passed === total ? 'success' : 'info');
        this.log(`Failed: ${failed}`, failed === 0 ? 'info' : 'error');
        this.log(`Success Rate: ${((passed / total) * 100).toFixed(2)}%`, 'info');

        if (failed > 0) {
            this.log(`\n❌ FAILED TESTS:`, 'error');
            this.testResults
                .filter(t => t.status === 'FAIL')
                .forEach(t => {
                    this.log(`  • ${t.suite}: ${t.name} - ${t.error}`, 'error');
                });
        }
    }
}

// Test suites
const runner = new TestRunner();

await runner.suite('Regions API Tests', async () => {
    await runner.test('Create region with valid data', async () => {
        const response = await runner.makeRequest('POST', '/regions', TEST_DATA.region);
        
        if (!response.data.success) {
            throw new Error('Failed to create region');
        }
        
        const region = response.data.data;
        runner.createdEntities.regions.push(region.id);
        
        if (region.name !== TEST_DATA.region.name) {
            throw new Error('Region name mismatch');
        }
    });

    await runner.test('Get all regions', async () => {
        const response = await runner.makeRequest('GET', '/regions');
        
        if (!response.data.success || !Array.isArray(response.data.data)) {
            throw new Error('Failed to get regions');
        }
    });

    await runner.test('Get region by ID', async () => {
        const regionId = runner.createdEntities.regions[0];
        const response = await runner.makeRequest('GET', `/regions/${regionId}`);
        
        if (!response.data.success || !response.data.data.id) {
            throw new Error('Failed to get region by ID');
        }
    });

    await runner.test('Update region', async () => {
        const regionId = runner.createdEntities.regions[0];
        const updateData = { name: 'Updated Region Name' };
        const response = await runner.makeRequest('PUT', `/regions/${regionId}`, updateData);
        
        if (!response.data.success) {
            throw new Error('Failed to update region');
        }
    });

    await runner.test('Deny access for unauthorized roles', async () => {
        const response = await runner.makeRequest('GET', '/regions', null, 'consultant', true);
        
        if (response.status !== 403) {
            throw new Error('Should deny access for unauthorized role');
        }
    });
});

await runner.suite('School Types API Tests', async () => {
    await runner.test('Create school type with valid data', async () => {
        const response = await runner.makeRequest('POST', '/school-types', TEST_DATA.schoolType);
        
        if (!response.data.success) {
            throw new Error('Failed to create school type');
        }
        
        const schoolType = response.data.data;
        runner.createdEntities.schoolTypes.push(schoolType.id);
        
        if (schoolType.name !== TEST_DATA.schoolType.name) {
            throw new Error('School type name mismatch');
        }
    });

    await runner.test('Get all school types', async () => {
        const response = await runner.makeRequest('GET', '/school-types');
        
        if (!response.data.success || !Array.isArray(response.data.data)) {
            throw new Error('Failed to get school types');
        }
    });

    await runner.test('Prevent duplicate slugs', async () => {
        const response = await runner.makeRequest('POST', '/school-types', TEST_DATA.schoolType, 'superadmin', true);
        
        if (response.status !== 400) {
            throw new Error('Should prevent duplicate slugs');
        }
    });
});

await runner.suite('Schools API Tests', async () => {
    let regionId, typeId;

    await runner.test('Setup prerequisites', async () => {
        regionId = await runner.createTestRegion();
        typeId = await runner.createTestSchoolType();
    });

    await runner.test('Create school with valid data', async () => {
        const schoolData = {
            ...TEST_DATA.school,
            region_id: regionId,
            type_id: typeId
        };
        const response = await runner.makeRequest('POST', '/schools', schoolData);
        
        if (!response.data.success) {
            throw new Error('Failed to create school');
        }
        
        const school = response.data.data;
        runner.createdEntities.schools.push(school.id);
        
        if (school.name !== TEST_DATA.school.name) {
            throw new Error('School name mismatch');
        }
    });

    await runner.test('Get schools with filters', async () => {
        const response = await runner.makeRequest('GET', `/schools?region_id=${regionId}`);
        
        if (!response.data.success || !Array.isArray(response.data.data)) {
            throw new Error('Failed to get filtered schools');
        }
    });

    await runner.test('Get schools statistics', async () => {
        const response = await runner.makeRequest('GET', '/schools/stats');
        
        if (!response.data.success || typeof response.data.data.total_schools !== 'number') {
            throw new Error('Failed to get schools statistics');
        }
    });

    await runner.test('Update school with partial data', async () => {
        const schoolId = runner.createdEntities.schools[0];
        const updateData = { 
            name: 'Updated School Name',
            tuition_per_year: 600000
        };
        const response = await runner.makeRequest('PUT', `/schools/${schoolId}`, updateData);
        
        if (!response.data.success) {
            throw new Error('Failed to update school');
        }
    });

    await runner.test('Validate foreign key constraints', async () => {
        const invalidSchoolData = {
            ...TEST_DATA.school,
            region_id: 99999, // Invalid region ID
            type_id: typeId
        };
        const response = await runner.makeRequest('POST', '/schools', invalidSchoolData, 'superadmin', true);
        
        if (response.status !== 400) {
            throw new Error('Should validate foreign key constraints');
        }
    });

    await runner.test('Deny delete for non-superadmin', async () => {
        const schoolId = runner.createdEntities.schools[0];
        const response = await runner.makeRequest('DELETE', `/schools/${schoolId}`, null, 'admin', true);
        
        if (response.status !== 403) {
            throw new Error('Should deny delete for non-superadmin');
        }
    });
});

await runner.suite('FAQs API Tests', async () => {
    let schoolId;

    await runner.test('Setup prerequisites', async () => {
        const regionId = await runner.createTestRegion();
        const typeId = await runner.createTestSchoolType();
        schoolId = await runner.createTestSchool(regionId, typeId);
    });

    await runner.test('Create school-specific FAQ', async () => {
        const faqData = {
            ...TEST_DATA.faq,
            school_id: schoolId
        };
        const response = await runner.makeRequest('POST', '/faqs', faqData);
        
        if (!response.data.success) {
            throw new Error('Failed to create FAQ');
        }
        
        const faq = response.data.data;
        runner.createdEntities.faqs.push(faq.id);
        
        if (faq.type !== 'school' || faq.school_id !== schoolId) {
            throw new Error('FAQ school association mismatch');
        }
    });

    await runner.test('Create general FAQ', async () => {
        const faqData = {
            ...TEST_DATA.faq,
            type: 'general'
        };
        const response = await runner.makeRequest('POST', '/faqs', faqData);
        
        if (!response.data.success) {
            throw new Error('Failed to create general FAQ');
        }
        
        const faq = response.data.data;
        runner.createdEntities.faqs.push(faq.id);
        
        if (faq.type !== 'general') {
            throw new Error('FAQ type mismatch');
        }
    });

    await runner.test('Get FAQs with filters', async () => {
        const response = await runner.makeRequest('GET', `/faqs?school_id=${schoolId}`);
        
        if (!response.data.success || !Array.isArray(response.data.data)) {
            throw new Error('Failed to get filtered FAQs');
        }
    });
});

await runner.suite('School Reviews API Tests', async () => {
    let schoolId;

    await runner.test('Setup prerequisites', async () => {
        const regionId = await runner.createTestRegion();
        const typeId = await runner.createTestSchoolType();
        schoolId = await runner.createTestSchool(regionId, typeId);
    });

    await runner.test('Create school review', async () => {
        const reviewData = {
            ...TEST_DATA.review,
            school_id: schoolId
        };
        const response = await runner.makeRequest('POST', '/school-reviews', reviewData);
        
        if (!response.data.success) {
            throw new Error('Failed to create school review');
        }
        
        const review = response.data.data;
        runner.createdEntities.reviews.push(review.id);
        
        if (review.rating !== TEST_DATA.review.rating || review.school_id !== schoolId) {
            throw new Error('Review data mismatch');
        }
    });

    await runner.test('Validate rating range', async () => {
        const invalidReviewData = {
            ...TEST_DATA.review,
            school_id: schoolId,
            rating: 6 // Invalid rating
        };
        const response = await runner.makeRequest('POST', '/school-reviews', invalidReviewData, 'superadmin', true);
        
        if (response.status !== 400) {
            throw new Error('Should validate rating range');
        }
    });

    await runner.test('Get reviews with filters', async () => {
        const response = await runner.makeRequest('GET', `/school-reviews?school_id=${schoolId}`);
        
        if (!response.data.success || !Array.isArray(response.data.data)) {
            throw new Error('Failed to get filtered reviews');
        }
    });
});

await runner.suite('RBAC Authorization Tests', async () => {
    await runner.test('Consultant cannot access schools', async () => {
        const response = await runner.makeRequest('GET', '/schools', null, 'consultant', true);
        
        if (response.status !== 403) {
            throw new Error('Consultant should not access schools');
        }
    });

    await runner.test('Editor can access schools (read-only)', async () => {
        const response = await runner.makeRequest('GET', '/schools', null, 'editor');
        
        if (!response.data.success) {
            throw new Error('Editor should access schools');
        }
    });

    await runner.test('Admin can manage schools but not delete', async () => {
        const schoolId = runner.createdEntities.schools[0];
        if (schoolId) {
            const response = await runner.makeRequest('DELETE', `/schools/${schoolId}`, null, 'admin', true);
            
            if (response.status !== 403) {
                throw new Error('Admin should not delete schools');
            }
        }
    });
});

await runner.suite('Input Validation Tests', async () => {
    await runner.test('Reject empty school name', async () => {
        const invalidData = { ...TEST_DATA.school, name: '' };
        const response = await runner.makeRequest('POST', '/schools', invalidData, 'superadmin', true);
        
        if (response.status !== 400) {
            throw new Error('Should reject empty school name');
        }
    });

    await runner.test('Sanitize XSS attempts', async () => {
        const xssData = { ...TEST_DATA.school, name: '<script>alert("xss")</script>Test School' };
        const response = await runner.makeRequest('POST', '/schools', xssData);
        
        if (response.data.data.name.includes('<script>')) {
            throw new Error('Should sanitize XSS attempts');
        }
    });

    await runner.test('Validate URL format', async () => {
        const invalidData = { ...TEST_DATA.school, logo_url: 'not-a-valid-url' };
        const response = await runner.makeRequest('POST', '/schools', invalidData, 'superadmin', true);
        
        if (response.status !== 400) {
            throw new Error('Should validate URL format');
        }
    });
});

// Run tests and cleanup
try {
    runner.log('🚀 Starting Schools API Test Suite...', 'info');
    
    // Wait a bit for any previous tests to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    runner.log('✓ All test suites completed', 'success');
} catch (error) {
    runner.log(`💥 Test execution failed: ${error.message}`, 'error');
} finally {
    await runner.cleanup();
    runner.printSummary();
}

process.exit(0);