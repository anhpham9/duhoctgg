// Test script for public contact endpoint
// Using built-in fetch (Node.js 18+) or manual testing

const API_BASE = 'http://localhost:5000';

// Test data
const validContactData = {
    name: 'Nguyễn Văn Test',
    email: 'test.contact@gmail.com', 
    phone: '0901234567',
    message: 'Tôi muốn tìm hiểu về chương trình du học Nhật Bản. Xin tư vấn chi tiết về học phí và quy trình apply.'
};

const testPublicContact = async () => {
    console.log('🧪 Testing Public Contact Endpoint\n');
    console.log('📋 Test Data:');
    console.log(JSON.stringify(validContactData, null, 2));
    console.log('\n🌐 API Endpoint:', `${API_BASE}/api/public/contact`);
    
    console.log('\n📝 Manual Testing Instructions:');
    console.log('1. Make sure backend server is running on port 5000');
    console.log('2. Use Postman, curl, or browser to test:');
    console.log('\n🔧 CURL Command:');
    console.log(`curl -X POST ${API_BASE}/api/public/contact \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(validContactData)}'`);
    
    console.log('\n✅ Expected Response (Success):');
    console.log(`{
  "success": true,
  "message": "Cảm ơn bạn! Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.",
  "data": {
    "id": 123,
    "submitted_at": "2026-04-21T09:27:39.123Z"
  }
}`);

    console.log('\n🧪 Test Cases to Validate:');
    console.log('1. ✅ Valid submission → 201 status, success: true');
    console.log('2. ❌ Missing name → 400 status, validation error');
    console.log('3. ❌ Invalid email → 400 status, validation error'); 
    console.log('4. ❌ Invalid phone → 400 status, validation error');
    console.log('5. 🛡️ XSS attempt → 400 status, suspicious content blocked');
    console.log('6. 🛡️ SQL injection → 400 status, suspicious content blocked');
    console.log('7. ⏱️ Rate limiting → 429 status after 5 requests/hour');
    console.log('8. 🔄 Duplicate email → 429 status if same email within 1 hour');

    console.log('\n🛡️ Security Features Implemented:');
    console.log('✅ Input sanitization (XSS protection)');
    console.log('✅ SQL injection prevention');
    console.log('✅ Rate limiting (5 requests/hour per IP)');
    console.log('✅ Duplicate submission check (1 hour window)');
    console.log('✅ Comprehensive validation');
    console.log('✅ Audit logging');
    console.log('✅ Error handling');

    console.log('\n📊 Database Integration:');
    console.log('- Contact saved with status: "new"');
    console.log('- contact_method: "email" (default)');
    console.log('- assigned_to: null (will be assigned by admin later)');
    console.log('- Auto timestamps (created_at, updated_at)');

    // Try to use built-in fetch if available (Node 18+)
    if (typeof fetch !== 'undefined') {
        console.log('\n🚀 Running automated test...');
        
        try {
            const response = await fetch(`${API_BASE}/api/public/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(validContactData)
            });
            
            const result = await response.json();
            console.log('\n📡 API Response:');
            console.log('Status:', response.status);
            console.log('Body:', JSON.stringify(result, null, 2));
            
            if (response.status === 201 && result.success) {
                console.log('\n✅ AUTOMATED TEST PASSED!');
            } else {
                console.log('\n❌ AUTOMATED TEST FAILED!');
            }
        } catch (error) {
            console.log('\n❌ AUTOMATED TEST ERROR:', error.message);
            console.log('💡 Use manual testing with curl or Postman');
        }
    } else {
        console.log('\n💡 Fetch not available in this Node version. Use manual testing.');
    }
};

// Run test
testPublicContact().catch(console.error);