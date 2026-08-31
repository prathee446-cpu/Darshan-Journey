import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const BASE_URL = 'http://localhost:5000';

async function req(endpoint, opts = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    method: opts.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {})
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runSuite() {
  console.log('🕉️ ==============================================================================');
  console.log('🕉️ COMPREHENSIVE END-TO-END VERIFICATION: BRANCH → TEMPLE → SUB ADMIN HIERARCHY');
  console.log('🕉️ ==============================================================================\n');

  // Step 1: Login Super Admin
  console.log('Step 1: Authenticating Super Admin (admin@darshanjourney.com)...');
  const superLogin = await req('/api/auth/admin-login', {
    method: 'POST',
    body: { email: 'admin@darshanjourney.com', password: 'admin123' }
  });
  if (!superLogin.ok || !superLogin.data.token) {
    throw new Error(`Super Admin login failed: ${JSON.stringify(superLogin)}`);
  }
  const superToken = superLogin.data.token;
  console.log(`✅ Super Admin logged in! User: ${superLogin.data.user.name} (${superLogin.data.user.role})\n`);

  // Step 2: Fetch Branches Hierarchy
  console.log('Step 2: Fetching Branches Taxonomy (/api/branches)...');
  const branchList = await req('/api/branches', { headers: { Authorization: `Bearer ${superToken}` } });
  console.log(`✅ Retrieved ${branchList.data.length} branches:`);
  branchList.data.forEach(b => {
    console.log(`   - Branch: ${b.name} (${b.templeCount} temples: ${b.temples.map(t => t.name).join(', ')})`);
  });
  console.log();

  // Step 3: Setup Sub Admin Arun (Chennai)
  console.log('Step 3: Setting up Sub Admin Arun (Chennai Branch)...');
  const allAdmins = await req('/api/admins', { headers: { Authorization: `Bearer ${superToken}` } });
  const existingArun = allAdmins.data.find(a => (a.email || '').toLowerCase() === 'arun@darshanjourney.com');
  if (existingArun) {
    await req(`/api/admins/${existingArun.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${superToken}` } });
  }

  const arunRes = await req('/api/admins', {
    method: 'POST',
    headers: { Authorization: `Bearer ${superToken}` },
    body: {
      name: 'Arun Kumar',
      email: 'arun@darshanjourney.com',
      phone: '+91 98400 11223',
      role: 'SUB_ADMIN',
      branch: 'Chennai',
      temple: 'Kapaleeshwarar Temple',
      templeId: 't-3',
      status: 'Active',
      password: 'ArunSecurePass@2026'
    }
  });
  if (!arunRes.ok) throw new Error(`Failed to create Arun: ${JSON.stringify(arunRes)}`);
  const arunId = arunRes.data.data.id;
  console.log(`✅ Arun Kumar created (ID: ${arunId}, Branch: Chennai, Temple: Kapaleeshwarar Temple)\n`);

  // Step 4: Setup Sub Admin Priya (Madurai)
  console.log('Step 4: Setting up Sub Admin Priya (Madurai Branch)...');
  const existingPriya = allAdmins.data.find(a => (a.email || '').toLowerCase() === 'priya@darshanjourney.com');
  if (existingPriya) {
    await req(`/api/admins/${existingPriya.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${superToken}` } });
  }

  const priyaRes = await req('/api/admins', {
    method: 'POST',
    headers: { Authorization: `Bearer ${superToken}` },
    body: {
      name: 'Priya Sundaram',
      email: 'priya@darshanjourney.com',
      phone: '+91 98450 99887',
      role: 'SUB_ADMIN',
      branch: 'Madurai',
      temple: 'Meenakshi Sundareswarar Temple',
      templeId: 't-1',
      status: 'Active',
      password: 'PriyaSecurePass@2026'
    }
  });
  if (!priyaRes.ok) throw new Error(`Failed to create Priya: ${JSON.stringify(priyaRes)}`);
  const priyaId = priyaRes.data.data.id;
  console.log(`✅ Priya Sundaram created (ID: ${priyaId}, Branch: Madurai, Temple: Meenakshi Sundareswarar Temple)\n`);

  // Step 5: Test Arun Login & Scoped Access
  console.log('Step 5: Logging in as Arun Kumar (Chennai)...');
  const arunLogin = await req('/api/auth/admin-login', {
    method: 'POST',
    body: { email: 'arun@darshanjourney.com', password: 'ArunSecurePass@2026' }
  });
  if (!arunLogin.ok) throw new Error(`Arun login failed: ${JSON.stringify(arunLogin)}`);
  const arunToken = arunLogin.data.token;
  console.log(`✅ Arun authenticated! Assigned: Branch=${arunLogin.data.user.branch}, Temple=${arunLogin.data.user.temple}`);

  const arunTemples = await req('/api/temples', { headers: { Authorization: `Bearer ${arunToken}` } });
  console.log(`   Arun temples view: ${arunTemples.data.map(t => t.name).join(', ')} (Total: ${arunTemples.data.length})`);
  if (arunTemples.data.some(t => t.location.includes('Madurai') || t.name.includes('Meenakshi'))) {
    throw new Error('Security Breach: Arun accessed Madurai temples!');
  }
  console.log('✅ Arun access is strictly scoped to Chennai\n');

  // Step 6: Test Priya Login & Scoped Access
  console.log('Step 6: Logging in as Priya Sundaram (Madurai)...');
  const priyaLogin = await req('/api/auth/admin-login', {
    method: 'POST',
    body: { email: 'priya@darshanjourney.com', password: 'PriyaSecurePass@2026' }
  });
  if (!priyaLogin.ok) throw new Error(`Priya login failed: ${JSON.stringify(priyaLogin)}`);
  const priyaToken = priyaLogin.data.token;
  console.log(`✅ Priya authenticated! Assigned: Branch=${priyaLogin.data.user.branch}, Temple=${priyaLogin.data.user.temple}`);

  const priyaTemples = await req('/api/temples', { headers: { Authorization: `Bearer ${priyaToken}` } });
  console.log(`   Priya temples view: ${priyaTemples.data.map(t => t.name).join(', ')} (Total: ${priyaTemples.data.length})`);
  if (priyaTemples.data.some(t => t.location.includes('Chennai') || t.name.includes('Kapaleeshwarar'))) {
    throw new Error('Security Breach: Priya accessed Chennai temples!');
  }
  console.log('✅ Priya access is strictly scoped to Madurai\n');

  // Step 7: Cross-Branch Access Denied (Arun -> Madurai Temple t-1)
  console.log('Step 7: Verifying Cross-Branch Protection: Arun attempting to access Madurai Temple (t-1)...');
  const cross1 = await req('/api/temples/t-1', { headers: { Authorization: `Bearer ${arunToken}` } });
  if (cross1.status !== 403) throw new Error(`Expected 403, got ${cross1.status}`);
  console.log(`✅ Backend 403 Forbidden verified: "${cross1.data.message}"\n`);

  // Step 8: Cross-Branch Access Denied (Priya -> Chennai Temple t-3)
  console.log('Step 8: Verifying Cross-Branch Protection: Priya attempting to access Chennai Temple (t-3)...');
  const cross2 = await req('/api/temples/t-3', { headers: { Authorization: `Bearer ${priyaToken}` } });
  if (cross2.status !== 403) throw new Error(`Expected 403, got ${cross2.status}`);
  console.log(`✅ Backend 403 Forbidden verified: "${cross2.data.message}"\n`);

  // Step 9: Administrative Governance Access Denied for Sub Admins
  console.log('Step 9: Verifying Sub Admins cannot access Admin Management API (/api/admins)...');
  const adminAccess1 = await req('/api/admins', { headers: { Authorization: `Bearer ${arunToken}` } });
  const adminAccess2 = await req('/api/admins', { headers: { Authorization: `Bearer ${priyaToken}` } });
  if (adminAccess1.status !== 403 || adminAccess2.status !== 403) {
    throw new Error('Security failure: Sub Admin accessed /api/admins');
  }
  console.log('✅ Backend 403 Forbidden verified for both Sub Admins on /api/admins\n');

  // Step 10: Enable / Disable Lifecycle
  console.log('Step 10: Testing Sub Admin Deactivation & Reactivation Lifecycle...');
  await req(`/api/admins/${arunId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${superToken}` },
    body: { status: 'Disabled' }
  });
  console.log('   Arun set to Disabled. Attempting login...');
  const blockedLogin = await req('/api/auth/admin-login', {
    method: 'POST',
    body: { email: 'arun@darshanjourney.com', password: 'ArunSecurePass@2026' }
  });
  if (blockedLogin.status !== 403) throw new Error(`Expected 403 for disabled user, got ${blockedLogin.status}`);
  console.log(`✅ Deactivated login rejected with 403: "${blockedLogin.data.message}"`);

  // Reactivate
  await req(`/api/admins/${arunId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${superToken}` },
    body: { status: 'Active' }
  });
  const unblockedLogin = await req('/api/auth/admin-login', {
    method: 'POST',
    body: { email: 'arun@darshanjourney.com', password: 'ArunSecurePass@2026' }
  });
  if (!unblockedLogin.ok) throw new Error('Reactivated login failed');
  console.log('✅ Reactivated login restored successfully\n');

  // Step 11: Super Admin Complete Visibility
  console.log('Step 11: Verifying Super Admin Global Visibility...');
  const allTemples = await req('/api/temples', { headers: { Authorization: `Bearer ${superToken}` } });
  const allBookings = await req('/api/bookings', { headers: { Authorization: `Bearer ${superToken}` } });
  const statsRes = await req('/api/dashboard/stats', { headers: { Authorization: `Bearer ${superToken}` } });
  console.log(`✅ Super Admin has complete access: ${allTemples.data.length} Temples, ${allBookings.data.length} Bookings, Total Bookings Stat: ${statsRes.data.stats.totalBookings}\n`);

  console.log('🕉️ ==============================================================================');
  console.log('🕉️ ALL 11 VERIFICATION SCENARIOS COMPLETED WITH 100% SUCCESS!');
  console.log('🕉️ ==============================================================================');
}

runSuite().catch(err => {
  console.error('\n❌ VERIFICATION SUITE FAILED:', err.message);
  process.exit(1);
});
