import http from 'http';

function req(path, body = null, token = '', customEmail = '') {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-admin-token'] = token;
    }
    if (customEmail) {
      headers['x-admin-email'] = customEmail;
    }

    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method: body ? 'POST' : 'GET',
      headers
    };

    const request = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    request.on('error', reject);
    if (payload) request.write(payload);
    request.end();
  });
}

async function runTests() {
  console.log('=== TEST 1: Super Admin Authentication (/api/auth/admin-login) ===');
  const superLogin = await req('/api/auth/admin-login', {
    email: 'admin@darshanjourney.com',
    password: 'Admin@12345'
  });

  console.log('Status:', superLogin.status);
  console.log('User Role:', superLogin.data?.user?.role);
  console.log('Redirect URL:', superLogin.data?.user?.redirectUrl);
  
  if (superLogin.data?.user?.role === 'SUPER_ADMIN' && superLogin.data?.user?.redirectUrl === '/admin') {
    console.log('✅ TEST 1 PASSED: Super Admin receives SUPER_ADMIN role and /admin redirect.');
  } else {
    console.error('❌ TEST 1 FAILED:', superLogin.data);
    process.exit(1);
  }

  const superToken = superLogin.data.token;

  console.log('\n=== TEST 2: Super Admin Accesses All Modules ===');
  const endpoints = [
    '/api/services',
    '/api/temples',
    '/api/bookings',
    '/api/users',
    '/api/content/homepage',
    '/api/content/about',
    '/api/settings',
    '/api/admins'
  ];

  for (const ep of endpoints) {
    const res = await req(ep, null, superToken, 'admin@darshanjourney.com');
    if (res.status === 200) {
      console.log(`✅ ${ep} -> HTTP 200 OK`);
    } else {
      console.error(`❌ ${ep} -> HTTP ${res.status}`);
      process.exit(1);
    }
  }

  console.log('\n==================================================');
  console.log('🎉 ALL SUPER ADMIN RESTORATION TESTS PASSED!');
  console.log('==================================================');
}

runTests().catch(err => {
  console.error('Test execution error:', err.message);
  process.exit(1);
});
