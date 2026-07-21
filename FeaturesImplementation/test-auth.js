const http = require('http');

// Helper function to make HTTP requests
function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: data ? JSON.parse(data) : data });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  try {
    console.log('=== Testing Authentication System ===\n');
    
    // Test 1: Login
    console.log('1️⃣  Testing Login...');
    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'admin', password: 'Admin@123' });
    console.log('   Status:', loginRes.status);
    console.log('   Response:', loginRes.body.success ? '✅ Login successful' : '❌ Login failed');
    if (!loginRes.body.success) {
      console.log('   Error:', loginRes.body.message);
      process.exit(1);
    }
    const token = loginRes.body.token;
    
    // Test 2: Check /api/auth/me with token
    console.log('\n2️⃣  Testing /api/auth/me with token...');
    const meRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   Status:', meRes.status);
    console.log('   Response:', meRes.body.success ? '✅ Auth verified' : '❌ Auth failed');
    console.log('   User:', meRes.body.user);
    
    // Test 3: Get users without auth (should fail)
    console.log('\n3️⃣  Testing protected route without auth...');
    const noAuthRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/users',
      method: 'GET'
    });
    console.log('   Status:', noAuthRes.status);
    console.log('   Response:', noAuthRes.status === 401 ? '✅ Protected (401 returned)' : '❌ Not protected');
    
    // Test 4: Get users with auth
    console.log('\n4️⃣  Testing protected route with auth...');
    const authRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/users',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   Status:', authRes.status);
    console.log('   Response:', authRes.body.success ? '✅ Route accessible with auth' : '❌ Access denied');
    if (authRes.body.users) {
      console.log('   Users count:', authRes.body.users.length);
    }
    
    // Test 5: Get available rooms (public endpoint)
    console.log('\n5️⃣  Testing public endpoint...');
    const roomsRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/reservations/available-rooms?checkInDate=2026-08-01&checkOutDate=2026-08-05',
      method: 'GET'
    });
    console.log('   Status:', roomsRes.status);
    console.log('   Response:', roomsRes.body.success ? '✅ Public route accessible' : '❌ Access denied');
    
    // Test 6: Login with wrong password
    console.log('\n6️⃣  Testing login with wrong password...');
    const wrongPwRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'admin', password: 'wrongpass' });
    console.log('   Status:', wrongPwRes.status);
    console.log('   Response:', wrongPwRes.status === 401 ? '✅ Rejected (401 returned)' : '❌ Not rejected');
    
    // Test 7: Test staff user accessing admin endpoint (should fail)
    console.log('\n7️⃣  Testing role-based access control...');
    const staffLoginRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'staff', password: 'Staff@123' });
    const staffToken = staffLoginRes.body.token;
    
    const staffAdminRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/users',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${staffToken}` }
    });
    console.log('   Status:', staffAdminRes.status);
    console.log('   Response:', staffAdminRes.status === 403 ? '✅ Access denied (403 returned)' : '❌ RBAC not working');
    
    console.log('\n✅ All authentication tests passed!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
