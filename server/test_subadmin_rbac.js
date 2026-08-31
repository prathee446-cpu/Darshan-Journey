import dns from 'dns';
import http from 'http';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const BASE_URL = 'http://localhost:5000';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('🕉️ ============================================================');
  console.log('🕉️ RUNNING SUB ADMIN & RBAC BACKEND SECURITY TEST SUITE');
  console.log('🕉️ ============================================================');

  // Test 1: Health check
  console.log('\n[TEST 1] Checking API Health and Database connectivity...');
  const health = await request('/api/health');
  if (health.status !== 200 || health.data.status !== 'ok') {
    throw new Error(`Health check failed: ${JSON.stringify(health)}`);
  }
  console.log('✅ Server & MongoDB connected: OK');

  // Test 2: Super Admin Login
  console.log('\n[TEST 2] Logging in as Super Admin (admin@darshanjourney.com)...');
  const superLogin = await request('/api/auth/admin-login', {
    method: 'POST',
    body: { email: 'admin@darshanjourney.com', password: 'admin123' }
  });
  if (superLogin.status !== 200 || !superLogin.data.token) {
    throw new Error(`Super admin login failed: ${JSON.stringify(superLogin)}`);
  }
  const superToken = superLogin.data.token;
  console.log(`✅ Super Admin logged in successfully! Role: ${superLogin.data.user.role}`);

  // Test 3: Get Branches Hierarchy
  console.log('\n[TEST 3] Fetching Branch -> Temple taxonomy (/api/branches)...');
  const branchesRes = await request('/api/branches', {
    headers: { Authorization: `Bearer ${superToken}` }
  });
  if (branchesRes.status !== 200 || !Array.isArray(branchesRes.data) || branchesRes.data.length === 0) {
    throw new Error(`Failed to fetch branches: ${JSON.stringify(branchesRes)}`);
  }
  console.log(`✅ Found ${branchesRes.data.length} branches: ${branchesRes.data.map(b => b.name).join(', ')}`);

  // Test 4: Create Sub Admin 'Arun' for Chennai Branch
  console.log('\n[TEST 4] Creating Sub Admin "Arun" for Chennai Branch / Kapaleeshwarar Temple...');
  // Clean up if existing Arun from previous run
  const existingAdmins = await request('/api/admins', {
    headers: { Authorization: `Bearer ${superToken}` }
  });
  const oldArun = existingAdmins.data.find(a => (a.email || '').toLowerCase() === 'arun@darshanjourney.com');
  if (oldArun) {
    await request(`/api/admins/${oldArun.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${superToken}` }
    });
    console.log('   (Cleaned up previous Arun test account)');
  }

  const createArun = await request('/api/admins', {
    method: 'POST',
    headers: { Authorization: `Bearer ${superToken}` },
    body: {
      name: 'Arun (Sub Admin)',
      email: 'arun@darshanjourney.com',
      phone: '+91 98400 11223',
      role: 'SUB_ADMIN',
      branch: 'Chennai',
      temple: 'Kapaleeshwarar Temple',
      templeId: 't-3',
      status: 'Active',
      password: 'ArunPassword@2026'
    }
  });

  if (createArun.status !== 201 || !createArun.data.success) {
    throw new Error(`Failed to create Sub Admin Arun: ${JSON.stringify(createArun)}`);
  }
  console.log('✅ Sub Admin Arun created successfully with hashed password!');

  // Test 5: Verify Arun password is NEVER returned or stored as plain text
  console.log('\n[TEST 5] Verifying Arun record does not expose plain text password...');
  const arunData = createArun.data.data;
  if (arunData.password || arunData.passwordHash) {
    throw new Error('Security violation: Password hash or plain password returned in client payload');
  }
  console.log('✅ Arun payload safely sanitized (no plain text password exposed)');

  // Test 6: Log in as Arun
  console.log('\n[TEST 6] Logging in as Arun (arun@darshanjourney.com)...');
  const arunLogin = await request('/api/auth/admin-login', {
    method: 'POST',
    body: { email: 'arun@darshanjourney.com', password: 'ArunPassword@2026' }
  });
  if (arunLogin.status !== 200 || !arunLogin.data.token) {
    throw new Error(`Arun login failed: ${JSON.stringify(arunLogin)}`);
  }
  const arunToken = arunLogin.data.token;
  console.log(`✅ Arun logged in! Assigned Branch: ${arunLogin.data.user.branch} | Temple: ${arunLogin.data.user.temple}`);

  // Test 7: Arun fetches temples -> only Chennai accessible
  console.log('\n[TEST 7] Verifying Arun can only list Chennai temples...');
  const arunTemples = await request('/api/temples', {
    headers: { Authorization: `Bearer ${arunToken}` }
  });
  if (arunTemples.status !== 200) {
    throw new Error(`Failed to fetch temples as Arun: ${JSON.stringify(arunTemples)}`);
  }
  const nonChennaiTemples = arunTemples.data.filter(t => !t.location.includes('Chennai') && !t.location.includes('Mylapore') && !t.name.includes('Kapaleeshwarar'));
  if (nonChennaiTemples.length > 0) {
    throw new Error(`Security Leak: Arun saw non-Chennai temples: ${JSON.stringify(nonChennaiTemples)}`);
  }
  console.log(`✅ Scoped filtering verified: Arun sees only Chennai temples (${arunTemples.data.map(t => t.name).join(', ')})`);

  // Test 8: Arun attempts to access Madurai temple (t-1) directly -> 403 Forbidden!
  console.log('\n[TEST 8] Arun attempts to access Madurai Temple (t-1) directly by ID...');
  const maduraiAccess = await request('/api/temples/t-1', {
    headers: { Authorization: `Bearer ${arunToken}` }
  });
  if (maduraiAccess.status !== 403) {
    throw new Error(`Security Failure! Expected 403 Forbidden for cross-branch access, got ${maduraiAccess.status}: ${JSON.stringify(maduraiAccess)}`);
  }
  console.log(`✅ Access Denied verified: Backend returned 403 Forbidden: "${maduraiAccess.data.message}"`);

  // Test 9: Arun attempts to access Admin Management (/api/admins) -> 403 Forbidden!
  console.log('\n[TEST 9] Arun attempts to access Admin Management list (/api/admins)...');
  const adminsAccess = await request('/api/admins', {
    headers: { Authorization: `Bearer ${arunToken}` }
  });
  if (adminsAccess.status !== 403) {
    throw new Error(`Security Failure! Expected 403 Forbidden for Sub Admin accessing /api/admins, got ${adminsAccess.status}`);
  }
  console.log(`✅ Access Denied verified: Backend returned 403 Forbidden: "${adminsAccess.data.message}"`);

  // Test 10: Arun attempts to update Madurai booking status -> 403 Forbidden!
  console.log('\n[TEST 10] Arun attempts to modify booking for non-Chennai temple...');
  const allBookingsRes = await request('/api/bookings', {
    headers: { Authorization: `Bearer ${superToken}` }
  });
  const maduraiBooking = allBookingsRes.data.find(b => !b.temple.includes('Kapaleeshwarar') && !b.temple.includes('Chennai'));
  if (!maduraiBooking) {
    throw new Error('No non-Chennai booking found to test cross-branch security');
  }

  const crossBookingUpdate = await request(`/api/bookings/${maduraiBooking.id || maduraiBooking.bookingId}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${arunToken}` },
    body: { status: 'CANCELLED' }
  });
  if (crossBookingUpdate.status !== 403) {
    throw new Error(`Security Failure! Expected 403 Forbidden for Sub Admin editing other temple booking, got ${crossBookingUpdate.status}`);
  }
  console.log(`✅ Access Denied verified: Backend returned 403 Forbidden: "${crossBookingUpdate.data.message}"`);

  // Test 11: Disable Arun -> Verify Login is blocked with 403 Forbidden
  console.log('\n[TEST 11] Super Admin disables Arun account...');
  const disableRes = await request(`/api/admins/${arunData.id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${superToken}` },
    body: { status: 'Disabled' }
  });
  if (disableRes.status !== 200) {
    throw new Error(`Failed to disable Arun: ${JSON.stringify(disableRes)}`);
  }
  console.log('   Arun status set to Disabled in MongoDB Atlas.');

  console.log('   Attempting login as disabled Arun...');
  const disabledLogin = await request('/api/auth/admin-login', {
    method: 'POST',
    body: { email: 'arun@darshanjourney.com', password: 'ArunPassword@2026' }
  });
  if (disabledLogin.status !== 403) {
    throw new Error(`Security Failure! Expected 403 Forbidden for disabled admin login, got ${disabledLogin.status}`);
  }
  console.log(`✅ Disabled account blocked successfully: "${disabledLogin.data.message}"`);

  // Test 12: Re-enable Arun
  console.log('\n[TEST 12] Re-enabling Arun account...');
  await request(`/api/admins/${arunData.id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${superToken}` },
    body: { status: 'Active' }
  });
  const reLogin = await request('/api/auth/admin-login', {
    method: 'POST',
    body: { email: 'arun@darshanjourney.com', password: 'ArunPassword@2026' }
  });
  if (reLogin.status !== 200) {
    throw new Error(`Re-login failed after re-enabling Arun: ${JSON.stringify(reLogin)}`);
  }
  console.log('✅ Active account login restored successfully!');

  // Test 13: Super Admin has full unrestricted access
  console.log('\n[TEST 13] Verifying Super Admin has full access to all temples and branches...');
  const allTemples = await request('/api/temples', {
    headers: { Authorization: `Bearer ${superToken}` }
  });
  if (allTemples.data.length < 6) {
    throw new Error(`Expected at least 6 temples for Super Admin, got ${allTemples.data.length}`);
  }
  console.log(`✅ Super Admin has full unrestricted access to all ${allTemples.data.length} temples across all branches!`);

  console.log('\n🕉️ ============================================================');
  console.log('🕉️ ALL 13 RBAC & SECURITY TESTS PASSED WITH 100% SUCCESS!');
  console.log('🕉️ ============================================================');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err.message);
  process.exit(1);
});
