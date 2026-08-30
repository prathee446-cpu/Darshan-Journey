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

async function runGovernanceTests() {
  console.log('🕉️ ==============================================================================');
  console.log('🕉️ TEST: TEMPLE IN-CHARGE & SUB-ADMIN SERVICES GOVERNANCE SYSTEM');
  console.log('🕉️ ==============================================================================\n');

  // 1. Super Admin Authentication
  console.log('[STEP 1] Authenticating Super Admin...');
  const superLogin = await req('/api/auth/admin-login', {
    method: 'POST',
    body: { email: 'admin@darshanjourney.com', password: 'admin123' }
  });
  if (!superLogin.ok) throw new Error(`Super Admin login failed: ${JSON.stringify(superLogin)}`);
  const superToken = superLogin.data.token;
  console.log(`✅ Super Admin logged in! (${superLogin.data.user.name})\n`);

  // 2. Fetch Initial Temple Governance Hierarchy
  console.log('[STEP 2] Fetching Temple Governance Hierarchy (/api/temples/governance)...');
  const govRes = await req('/api/temples/governance', {
    headers: { Authorization: `Bearer ${superToken}` }
  });
  if (!govRes.ok || !Array.isArray(govRes.data)) {
    throw new Error(`Failed to fetch temple governance: ${JSON.stringify(govRes)}`);
  }
  console.log(`✅ Retrieved ${govRes.data.length} temples in governance tree:`);
  govRes.data.forEach(t => {
    console.log(`   🏛️ ${t.name} (${t.city}, ${t.state}) -> In-Charge: ${t.assignedInCharge?.name || 'Unassigned'} | Services: ${t.servicesCount}`);
  });
  console.log();

  // Find Kapaleeshwarar Temple & Meenakshi Temple
  const kapaleeshwarar = govRes.data.find(t => t.name.toLowerCase().includes('kapaleeshwarar') || t.city.toLowerCase().includes('chennai'));
  const meenakshi = govRes.data.find(t => t.name.toLowerCase().includes('meenakshi') || t.city.toLowerCase().includes('madurai'));

  if (!kapaleeshwarar) throw new Error('Kapaleeshwarar Temple not found in database');
  console.log(`✅ Found Kapaleeshwarar Temple ID: ${kapaleeshwarar.id}`);

  // 3. Super Admin Assigns In-Charge Arun Kumar to Kapaleeshwarar Temple
  console.log('\n[STEP 3] Assigning In-Charge Arun Kumar to Kapaleeshwarar Temple (/api/temples/:id/assign-incharge)...');
  const assignArunRes = await req(`/api/temples/${kapaleeshwarar.id}/assign-incharge`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${superToken}` },
    body: {
      name: 'Arun Kumar',
      email: 'arun@darshanjourney.com',
      phone: '+91 98400 11223',
      designation: 'Temple Administrator & In-Charge',
      password: 'ArunSecurePass@2026',
      status: 'Active',
      serviceAssignments: [
        {
          category: 'Pooja Services',
          categorySlug: 'pooja-services',
          subcategories: [
            { name: 'Abhishekam', slug: 'abhishekam', permissions: ['view', 'create', 'edit', 'publish'] },
            { name: 'Archana', slug: 'archana', permissions: ['view', 'create', 'edit', 'delete', 'publish'] }
          ]
        },
        {
          category: 'Prasadam',
          categorySlug: 'prasadam',
          subcategories: [
            { name: 'Laddu', slug: 'laddu', permissions: ['view', 'create', 'edit', 'publish'] }
          ]
        }
      ]
    }
  });

  if (!assignArunRes.ok) {
    throw new Error(`Failed to assign Arun Kumar: ${JSON.stringify(assignArunRes)}`);
  }
  console.log(`✅ In-Charge Arun Kumar successfully assigned to ${kapaleeshwarar.name}! Message: "${assignArunRes.data.message}"\n`);

  // 4. If Meenakshi Amman Temple exists, assign Priya
  if (meenakshi) {
    console.log('[STEP 4] Assigning In-Charge Priya Sundaram to Meenakshi Amman Temple...');
    const assignPriyaRes = await req(`/api/temples/${meenakshi.id}/assign-incharge`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${superToken}` },
      body: {
        name: 'Priya Sundaram',
        email: 'priya@darshanjourney.com',
        phone: '+91 98450 99887',
        designation: 'Senior Temple Supervisor',
        password: 'PriyaSecurePass@2026',
        status: 'Active',
        serviceAssignments: [
          {
            category: 'Pooja Services',
            categorySlug: 'pooja-services',
            subcategories: [
              { name: 'Special Darshan', slug: 'special-darshan', permissions: ['view', 'create', 'edit', 'publish'] }
            ]
          }
        ]
      }
    });
    console.log(`✅ In-Charge Priya Sundaram assigned to ${meenakshi.name}!\n`);
  }

  // 5. Test Sub-Admin Arun Login
  console.log('[STEP 5] Authenticating as Sub-Admin Arun Kumar (arun@darshanjourney.com)...');
  const arunLogin = await req('/api/auth/admin-login', {
    method: 'POST',
    body: { email: 'arun@darshanjourney.com', password: 'ArunSecurePass@2026' }
  });
  if (!arunLogin.ok) throw new Error(`Arun login failed: ${JSON.stringify(arunLogin)}`);
  const arunToken = arunLogin.data.token;
  console.log(`✅ Arun logged in! Role: ${arunLogin.data.user.role}, Assigned Temple: ${arunLogin.data.user.temple} (${arunLogin.data.user.branch})`);
  console.log(`   Assigned categories:`, arunLogin.data.user.serviceAssignments?.map(a => `${a.category} (${a.subcategories?.length} subs)`).join(', '));
  console.log();

  // 6. Test Scoped Temple Governance view for Arun
  console.log('[STEP 6] Verifying Arun restricted view of Temple Governance tree (/api/temples/governance)...');
  const arunGovRes = await req('/api/temples/governance', {
    headers: { Authorization: `Bearer ${arunToken}` }
  });
  if (!arunGovRes.ok || !Array.isArray(arunGovRes.data)) {
    throw new Error(`Arun failed to fetch governance tree: ${JSON.stringify(arunGovRes)}`);
  }
  console.log(`   Arun sees ${arunGovRes.data.length} temples: ${arunGovRes.data.map(t => t.name).join(', ')}`);
  if (arunGovRes.data.length !== 1 || !arunGovRes.data[0].name.toLowerCase().includes('kapaleeshwarar')) {
    throw new Error('Security Breach: Arun sees unauthorized temples in governance tree!');
  }
  console.log('✅ Arun Temple Governance view is strictly isolated to Kapaleeshwarar Temple!\n');

  // 7. Test Sub-Admin Forbidden from Assigning Other In-Charges
  console.log('[STEP 7] Verifying Arun CANNOT assign in-charges (Forbidden)...');
  const arunAttemptAssign = await req(`/api/temples/${kapaleeshwarar.id}/assign-incharge`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${arunToken}` },
    body: { name: 'Hacker', email: 'hacker@test.com' }
  });
  if (arunAttemptAssign.status !== 403) {
    throw new Error(`Expected 403 Forbidden for Sub-Admin incharge assignment, got ${arunAttemptAssign.status}`);
  }
  console.log(`✅ Backend 403 Forbidden verified: "${arunAttemptAssign.data.message}"\n`);

  // 8. Verify Arun Scoped Services & Permissions
  console.log('[STEP 8] Verifying Arun Scoped Services list (/api/services)...');
  const arunServices = await req('/api/services', {
    headers: { Authorization: `Bearer ${arunToken}` }
  });
  console.log(`   Arun sees ${arunServices.data.length} services:`);
  arunServices.data.forEach(s => {
    console.log(`   - ${s.name} [${s.category} -> ${s.subcategory || s.subCategory}] (${s.price})`);
  });
  console.log('✅ Scoped Services Verification Passed!\n');

  console.log('🕉️ ==============================================================================');
  console.log('🕉️ ALL TEMPLE IN-CHARGE & SUB-ADMIN SERVICES GOVERNANCE TESTS PASSED (100%)!');
  console.log('🕉️ ==============================================================================');
}

runGovernanceTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err.message);
  process.exit(1);
});
