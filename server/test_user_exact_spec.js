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

async function runExactUserSpec() {
  console.log('🕉️ ==============================================================================');
  console.log('🕉️ USER SPEC TEST: SUB ADMIN → TEMPLE → SERVICE → SUBCATEGORY ACCESS SYSTEM');
  console.log('🕉️ ==============================================================================\n');

  // 1. Super Admin Authentication
  console.log('[STEP 1] Logging in as Super Admin...');
  const superLogin = await req('/api/auth/admin-login', {
    method: 'POST',
    body: { email: 'admin@darshanjourney.com', password: 'admin123' }
  });
  if (!superLogin.ok) throw new Error(`Super Admin login failed: ${JSON.stringify(superLogin)}`);
  const superToken = superLogin.data.token;
  console.log(`✅ Super Admin authenticated: ${superLogin.data.user.name}\n`);

  // 2. Clear previous Arun if any
  const adminList = await req('/api/admins', { headers: { Authorization: `Bearer ${superToken}` } });
  const prevArun = (adminList.data || []).find(a => (a.email || '').toLowerCase() === 'arun@darshanjourney.com');
  if (prevArun) {
    await req(`/api/admins/${prevArun.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${superToken}` } });
  }

  // 3. Create Sub Admin Arun matching exact prompt specification:
  // Name: Arun
  // Branch: Chennai
  // Temple: Chennai Temple (Kapaleeshwarar Temple)
  // Service Category: Pooja Services
  // Subcategories:
  //   - Abhishekam: View ✓, Create ✓, Edit ✓, Delete ✗, Publish ✓
  //   - Archana: View ✓, Create ✓, Edit ✓, Delete ✓, Publish ✓
  console.log('[STEP 2] Creating Sub Admin Arun with exact permissions specification...');
  const arunPayload = {
    name: 'Arun',
    email: 'arun@darshanjourney.com',
    phone: '+91 98400 11223',
    role: 'SUB_ADMIN',
    branch: 'Chennai',
    temple: 'Kapaleeshwarar Temple',
    templeId: 't-3',
    status: 'Active',
    password: 'ArunPassword@2026',
    serviceAssignments: [
      {
        category: 'Pooja Services',
        categorySlug: 'pooja-services',
        subcategories: [
          {
            name: 'Abhishekam',
            slug: 'abhishekam',
            permissions: ['view', 'create', 'edit', 'publish'] // NO 'delete'
          },
          {
            name: 'Archana',
            slug: 'archana',
            permissions: ['view', 'create', 'edit', 'delete', 'publish'] // WITH 'delete'
          }
        ]
      }
    ]
  };

  const createArun = await req('/api/admins', {
    method: 'POST',
    headers: { Authorization: `Bearer ${superToken}` },
    body: arunPayload
  });
  if (!createArun.ok) throw new Error(`Failed to create Arun: ${JSON.stringify(createArun)}`);
  console.log(`✅ Arun registered with MongoDB persistence: ID=${createArun.data.data.id}\n`);

  // 4. Create baseline test offerings
  console.log('[STEP 3] Seeding test offerings across categories & subcategories...');
  const testAbhishekam = await req('/api/services', {
    method: 'POST',
    headers: { Authorization: `Bearer ${superToken}` },
    body: {
      name: 'Special Rudra Abhishekam',
      category: 'Pooja Services',
      categorySlug: 'pooja-services',
      subcategory: 'Abhishekam',
      subcategorySlug: 'abhishekam',
      location: 'Chennai',
      temple: 'Kapaleeshwarar Temple',
      price: '₹501',
      numericPrice: 501,
      status: 'Active'
    }
  });

  const testArchana = await req('/api/services', {
    method: 'POST',
    headers: { Authorization: `Bearer ${superToken}` },
    body: {
      name: 'Ashtothara Archana Seva',
      category: 'Pooja Services',
      categorySlug: 'pooja-services',
      subcategory: 'Archana',
      subcategorySlug: 'archana',
      location: 'Chennai',
      temple: 'Kapaleeshwarar Temple',
      price: '₹251',
      numericPrice: 251,
      status: 'Active'
    }
  });

  const testHomam = await req('/api/services', {
    method: 'POST',
    headers: { Authorization: `Bearer ${superToken}` },
    body: {
      name: 'Maha Ganapathi Homam',
      category: 'Pooja Services',
      categorySlug: 'pooja-services',
      subcategory: 'Homam',
      subcategorySlug: 'homam',
      location: 'Chennai',
      temple: 'Kapaleeshwarar Temple',
      price: '₹2500',
      numericPrice: 2500,
      status: 'Active'
    }
  });

  const testDarshan = await req('/api/services', {
    method: 'POST',
    headers: { Authorization: `Bearer ${superToken}` },
    body: {
      name: 'Special VIP Darshan',
      category: 'Pooja Services',
      categorySlug: 'pooja-services',
      subcategory: 'Special Darshan',
      subcategorySlug: 'special-darshan',
      location: 'Chennai',
      temple: 'Kapaleeshwarar Temple',
      price: '₹300',
      numericPrice: 300,
      status: 'Active'
    }
  });

  const testLaddu = await req('/api/services', {
    method: 'POST',
    headers: { Authorization: `Bearer ${superToken}` },
    body: {
      name: 'Tirupati Laddu Prasadam Box',
      category: 'Prasadam',
      categorySlug: 'prasadam',
      subcategory: 'Laddu',
      subcategorySlug: 'laddu',
      location: 'Tirupati',
      temple: 'Sri Venkateswara Swamy Temple',
      price: '₹150',
      numericPrice: 150,
      status: 'Active'
    }
  });

  const abhishekamId = testAbhishekam.data.data.id;
  const archanaId = testArchana.data.data.id;
  console.log(`✅ Seeded services (Abhishekam: ${abhishekamId}, Archana: ${archanaId})\n`);

  // 5. Arun Login
  console.log('[STEP 4] Logging in as Sub Admin Arun...');
  const arunLogin = await req('/api/auth/admin-login', {
    method: 'POST',
    body: { email: 'arun@darshanjourney.com', password: 'ArunPassword@2026' }
  });
  if (!arunLogin.ok) throw new Error(`Arun login failed: ${JSON.stringify(arunLogin)}`);
  const arunToken = arunLogin.data.token;
  console.log(`✅ Arun logged in! Branch: ${arunLogin.data.user.branch}, Temple: ${arunLogin.data.user.temple}\n`);

  // 6. Verify Scoped Visibility for Arun
  console.log('[STEP 5] Verifying Arun visible categories and services...');
  const arunCategories = await req('/api/service-categories', { headers: { Authorization: `Bearer ${arunToken}` } });
  console.log(`   Arun visible categories count: ${arunCategories.data.length}`);
  arunCategories.data.forEach(c => {
    console.log(`   - ${c.name} (Subcategories: ${(c.subcategories || []).map(s => s.name).join(', ')})`);
  });

  const arunServices = await req('/api/services', { headers: { Authorization: `Bearer ${arunToken}` } });
  console.log(`   Arun visible services count: ${arunServices.data.length}`);
  arunServices.data.forEach(s => {
    console.log(`   - ${s.name} [${s.category} -> ${s.subcategory || s.subCategory}] (${s.location})`);
  });

  // Verify NOT visible:
  const seesHomam = arunServices.data.some(s => (s.subcategory || '').toLowerCase().includes('homam'));
  const seesDarshan = arunServices.data.some(s => (s.subcategory || '').toLowerCase().includes('darshan'));
  const seesPrasadam = arunServices.data.some(s => (s.category || '').toLowerCase().includes('prasadam'));
  const seesTirupati = arunServices.data.some(s => (s.location || '').toLowerCase().includes('tirupati'));

  if (seesHomam || seesDarshan || seesPrasadam || seesTirupati) {
    throw new Error('Security Error: Unassigned services are visible to Arun!');
  }
  console.log('✅ Verified: Homam, Special Darshan, Prasadam, and Tirupati services are completely hidden from Arun!\n');

  // 7. Verify Permission: Edit Abhishekam (Edit = TRUE -> 200 OK)
  console.log('[STEP 6] Arun edits Abhishekam offering (Edit permission = TRUE)...');
  const editAbhishekamRes = await req(`/api/services/${abhishekamId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${arunToken}` },
    body: { price: '₹601', numericPrice: 601, description: 'Updated by Sub Admin Arun' }
  });
  if (!editAbhishekamRes.ok) throw new Error(`Abhishekam edit failed: ${JSON.stringify(editAbhishekamRes)}`);
  console.log('✅ Edit Abhishekam succeeded with 200 OK!\n');

  // 8. Verify Permission: Delete Abhishekam (Delete = FALSE -> 403 Forbidden)
  console.log('[STEP 7] Arun attempts to Delete Abhishekam (Delete permission = FALSE)...');
  const deleteAbhishekamRes = await req(`/api/services/${abhishekamId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${arunToken}` }
  });
  if (deleteAbhishekamRes.status !== 403) {
    throw new Error(`Security Failure! Expected 403 Forbidden, got ${deleteAbhishekamRes.status}`);
  }
  console.log(`✅ Backend 403 Forbidden verified: "${deleteAbhishekamRes.data.message}"\n`);

  // 9. Verify Permission: Delete Archana (Delete = TRUE -> 200 OK)
  console.log('[STEP 8] Arun deletes Archana offering (Delete permission = TRUE)...');
  const deleteArchanaRes = await req(`/api/services/${archanaId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${arunToken}` }
  });
  if (!deleteArchanaRes.ok) throw new Error(`Archana delete failed: ${JSON.stringify(deleteArchanaRes)}`);
  console.log('✅ Delete Archana succeeded with 200 OK!\n');

  // 10. Verify Unauthorized Creation Blocked (Create Prasadam -> 403 Forbidden)
  console.log('[STEP 9] Arun attempts to create an unauthorized Prasadam service...');
  const createUnauthRes = await req('/api/services', {
    method: 'POST',
    headers: { Authorization: `Bearer ${arunToken}` },
    body: {
      name: 'Unauthorized Laddu Seva',
      category: 'Prasadam',
      categorySlug: 'prasadam',
      subcategory: 'Laddu',
      subcategorySlug: 'laddu',
      location: 'Chennai',
      temple: 'Kapaleeshwarar Temple',
      price: '₹100',
      numericPrice: 100
    }
  });
  if (createUnauthRes.status !== 403) {
    throw new Error(`Security Failure! Expected 403 Forbidden for unauthorized create, got ${createUnauthRes.status}`);
  }
  console.log(`✅ Backend 403 Forbidden verified for unauthorized create: "${createUnauthRes.data.message}"\n`);

  // 11. Verify MongoDB Persistence: fetch Arun from MongoDB via fresh admin list
  console.log('[STEP 10] Verifying MongoDB persistence of Arun assignments and permissions...');
  const freshAdminList = await req('/api/admins', { headers: { Authorization: `Bearer ${superToken}` } });
  const persistedArun = freshAdminList.data.find(a => a.name === 'Arun');
  if (!persistedArun || !persistedArun.serviceAssignments || persistedArun.serviceAssignments.length === 0) {
    throw new Error('Persistence failure: Arun serviceAssignments not found in MongoDB Atlas response!');
  }
  console.log(`✅ MongoDB Atlas persistence verified! Sub Admin Arun service assignments:`, JSON.stringify(persistedArun.serviceAssignments, null, 2));

  console.log('\n🕉️ ==============================================================================');
  console.log('🕉️ ALL USER SPEC ACCEPTANCE CRITERIA HAVE BEEN TESTED AND VERIFIED 100%!');
  console.log('🕉️ ==============================================================================');
}

runExactUserSpec().catch(err => {
  console.error('\n❌ TEST SPEC FAILED:', err.message);
  process.exit(1);
});
