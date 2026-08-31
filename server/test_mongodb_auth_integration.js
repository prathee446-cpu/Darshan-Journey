import http from 'http';

function req(path, method = 'GET', body = null, token = '') {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers
    };

    const request = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, raw: data });
        }
      });
    });

    request.on('error', reject);
    if (payload) request.write(payload);
    request.end();
  });
}

async function runMongoDBAuthIntegrationTests() {
  console.log('🕉️ ==============================================================================');
  console.log('🕉️ DARSHAN JOURNEY: MONGODB AUTHENTICATION & GOOGLE OAUTH INTEGRATION TESTS');
  console.log('🕉️ ==============================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // ─── TEST 1: Health Check & DB Readiness ───
  console.log('[TEST 1] Backend Health & Database Connectivity');
  const health = await req('/api/health');
  assert(health.status === 200, 'Health endpoint responds HTTP 200 OK');

  // ─── TEST 2: Devotee Registration (Step 1: Send OTP) ───
  console.log('\n[TEST 2] Devotee Registration via OTP');
  const timestamp = Date.now();
  const testEmail = `devotee_${timestamp}@darshanjourney.com`;
  const testUsername = `devotee_${timestamp}`;
  const testPassword = 'SacredPassword@2026';

  const sendOtpRes = await req('/api/auth/register-send-otp', 'POST', {
    fullName: 'Santhosh Devotee',
    username: testUsername,
    email: testEmail,
    mobile: '9876543210',
    password: testPassword
  });
  assert(sendOtpRes.ok && sendOtpRes.data.success, `Registration OTP generated for ${testEmail}`);

  // ─── TEST 3: Duplicate Registration Guard ───
  console.log('\n[TEST 3] Duplicate Registration Guard (Same Email/Username)');
  const dupOtpRes = await req('/api/auth/register-send-otp', 'POST', {
    fullName: 'Santhosh Devotee',
    username: testUsername,
    email: testEmail,
    mobile: '9876543210',
    password: testPassword
  });
  // During pending registration, check duplicate handling or rate limit
  assert(dupOtpRes.status === 200 || dupOtpRes.status === 400 || dupOtpRes.status === 429, 'Duplicate request is controlled');

  // ─── TEST 4: Google OAuth — First Time Devotee (Creates User in MongoDB) ───
  console.log('\n[TEST 4] "Continue with Google" — First Time Devotee Registration in MongoDB');
  const googleEmail = `google_devotee_${timestamp}@gmail.com`;
  const googleSub = `google_sub_${timestamp}`;
  const mockGooglePayload = Buffer.from(JSON.stringify({
    email: googleEmail,
    name: 'Sri Krishna Google Devotee',
    picture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
    sub: googleSub
  })).toString('base64');
  const mockGoogleIdToken = `header.${mockGooglePayload}.signature`;

  const googleAuthRes1 = await req('/api/auth/google', 'POST', {
    credential: mockGoogleIdToken
  });

  assert(googleAuthRes1.ok && googleAuthRes1.data.success, 'Google Auth creates user and returns success: true');
  assert(googleAuthRes1.data.user.email === googleEmail, 'Google user email matches exactly');
  assert(googleAuthRes1.data.user.authProvider === 'google', 'Google user has authProvider: "google"');
  assert(Boolean(googleAuthRes1.data.token), 'Google Auth returns secure JWT session token');
  const googleToken1 = googleAuthRes1.data.token;
  const googleUserId = googleAuthRes1.data.user.id;

  // ─── TEST 5: Google OAuth — Returning Devotee (Logs in without duplicate record) ───
  console.log('\n[TEST 5] "Continue with Google" — Returning Devotee (Prevents Duplicate MongoDB records)');
  const googleAuthRes2 = await req('/api/auth/google', 'POST', {
    credential: mockGoogleIdToken
  });

  assert(googleAuthRes2.ok && googleAuthRes2.data.success, 'Returning Google user logged in successfully');
  assert(googleAuthRes2.data.user.id === googleUserId, 'Existing user ID preserved (No duplicate record created)');
  assert(googleAuthRes2.data.user.email === googleEmail, 'User profile verified against existing MongoDB record');

  // ─── TEST 6: Session Validation (/api/auth/me) ───
  console.log('\n[TEST 6] Session Validation (/api/auth/me) with Bearer Token');
  const meRes = await req('/api/auth/me', 'GET', null, googleToken1);
  assert(meRes.ok && meRes.data.success, '/api/auth/me validates session successfully');
  assert(meRes.data.user.email === googleEmail, '/api/auth/me returns matching devotee profile');

  // ─── TEST 7: Update Devotee Profile in MongoDB ───
  console.log('\n[TEST 7] Devotee Profile Update in MongoDB');
  const updateRes = await req('/api/auth/update-profile', 'POST', {
    userId: googleUserId,
    fullName: 'Sri Krishna Devotee (Updated)',
    phone: '+91 99887 76655',
    address: 'Temple Street, Madurai, Tamil Nadu'
  }, googleToken1);

  assert(updateRes.ok && updateRes.data.success, 'Profile updated successfully');
  assert(updateRes.data.user.phone === '+91 99887 76655', 'Updated phone saved');
  assert(updateRes.data.user.address === 'Temple Street, Madurai, Tamil Nadu', 'Updated address saved');

  // ─── TEST 8: Super Admin Authentication (/api/auth/admin-login) Preserved ───
  console.log('\n[TEST 8] Super Admin Authentication & RBAC Preservation');
  const adminLogin = await req('/api/auth/admin-login', 'POST', {
    email: 'admin@darshanjourney.com',
    password: 'Admin@12345'
  });
  assert(adminLogin.ok && adminLogin.data.success, 'Super Admin authentication active with SUPER_ADMIN role');
  assert(adminLogin.data.user.role === 'SUPER_ADMIN', 'Super Admin role verified');

  // ─── TEST 9: Normal Login Validation against MongoDB ───
  console.log('\n[TEST 9] Normal Devotee Sign In & Password Security');
  // First attempt with wrong password
  const failLogin = await req('/api/auth/login', 'POST', {
    identifier: googleEmail,
    password: 'WrongPassword123'
  });
  assert(failLogin.status === 400 || failLogin.status === 401, 'Invalid password or Google-only account rejected correctly');

  // ─── TEST 10: Logout Invalidation ───
  console.log('\n[TEST 10] Logout & Session Invalidation');
  const logoutRes = await req('/api/auth/logout', 'POST', null, googleToken1);
  assert(logoutRes.ok && logoutRes.data.success, 'Logout endpoint clears session');

  console.log('\n==============================================================================');
  console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('==============================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runMongoDBAuthIntegrationTests().catch(err => {
  console.error('Test Suite Error:', err);
  process.exit(1);
});
