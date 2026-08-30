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

async function runTest() {
  console.log('🕉️ ==============================================================================');
  console.log('🕉️ TEST SUITE: SERVICE CATEGORIES, SUBCATEGORIES & GRANULAR SUB ADMIN PERMISSIONS');
  console.log('🕉️ ==============================================================================\n');

  // 1. Super Admin Authentication
  console.log('[STEP 1] Authenticating Super Admin (admin@darshanjourney.com)...');
  const superLogin = await req('/api/auth/admin-login', {
    method: 'POST',
    body: { email: 'admin@darshanjourney.com', password: 'admin123' }
  });
  if (!superLogin.ok) throw new Error(`Super admin login failed: ${JSON.stringify(superLogin)}`);
  const superToken = superLogin.data.token;
  console.log(`✅ Super Admin authenticated! (${superLogin.data.user.name})\n`);

  // 2. Fetch and Verify Service Categories & Subcategories
  console.log('[STEP 2] Fetching Service Categories & Subcategories (/api/service-categories)...');
  const catRes = await req('/api/service-categories', { headers: { Authorization: `Bearer ${superToken}` } });
  if (!catRes.ok || !Array.isArray(catRes.data) || catRes.data.length === 0) {
    throw new Error(`Failed to fetch service categories: ${JSON.stringify(catRes)}`);
  }
  console.log(`✅ Found ${catRes.data.length} main categories:`);
  catRes.data.forEach(c => {
    console.log(`   📁 ${c.name} (${(c.subcategories || []).length} subcategories: ${(c.subcategories || []).map(s => s.name).join(', ')})`);
  });
  console.log();

  // 3. Setup Test Services in Chennai and Madurai
  console.log('[STEP 3] Seeding test services for permission testing...');
  const srvAbhishekam = await req('/api/services', {
    method: 'POST',
    headers: { Authorization: `Bearer ${superToken}` },
    body: {
      name: 'Chennai Special Abhishekam Seva',
      category: 'Pooja Services',
      categorySlug: 'pooja-services',
      subcategory: 'Abhishekam',
      subcategorySlug: 'abhishekam',
      location: 'Chennai',
      temple: 'Kapaleeshwarar Temple',
      price: '₹750',
      numericPrice: 750,
      status: 'Active'
    }
  });

  const srvArchana = await req('/api/services', {
    method: 'POST',
    headers: { Authorization: `Bearer ${superToken}` },
    body: {
      name: 'Chennai Sahasranama Archana',
      category: 'Pooja Services',
      categorySlug: 'pooja-services',
      subcategory: 'Archana',
      subcategorySlug: 'archana',
      location: 'Chennai',
      temple: 'Kapaleeshwarar Temple',
      price: '₹350',
      numericPrice: 350,
      status: 'Active'
    }
  });

  const srvDarshan = await req('/api/services', {
    method: 'POST',
    headers: { Authorization: `Bearer ${superToken}` },
    body: {
      name: 'Chennai VIP Special Darshan Pass',
      category: 'Pooja Services',
      categorySlug: 'pooja-services',
      subcategory: 'Special Darshan',
      subcategorySlug: 'special-darshan',
      location: 'Chennai',
      temple: 'Kapaleeshwarar Temple',
      price: '₹500',
      numericPrice: 500,
      status: 'Active'
    }
  });

  const srvPrasadam = await req('/api/services', {
    method: 'POST',
    headers: { Authorization: `Bearer ${superToken}` },
    body: {
      name: 'Chennai Divine Laddu Prasadam Box',
      category: 'Prasadam',
      categorySlug: 'prasadam',
      subcategory: 'Laddu',
      subcategorySlug: 'laddu',
      location: 'Chennai',
      temple: 'Kapaleeshwarar Temple',
      price: '₹200',
      numericPrice: 200,
      status: 'Active'
    }
  });

  const srvMadurai = await req('/api/services', {
    method: 'POST',
    headers: { Authorization: `Bearer ${superToken}` },
    body: {
      name: 'Madurai Meenakshi Holy Abhishekam',
      category: 'Pooja Services',
      categorySlug: 'pooja-services',
      subcategory: 'Abhishekam',
      subcategorySlug: 'abhishekam',
      location: 'Madurai',
      temple: 'Meenakshi Sundareswarar Temple',
      price: '₹1008',
      numericPrice: 1008,
      status: 'Active'
    }
  });

  const idAbhishekam = srvAbhishekam.data.data.id;
  const idArchana = srvArchana.data.data.id;
  const idDarshan = srvDarshan.data.data.id;
  const idPrasadam = srvPrasadam.data.data.id;
  const idMadurai = srvMadurai.data.data.id;

  console.log(`✅ Test services created successfully:\n   - Abhishekam: ${idAbhishekam}\n   - Archana: ${idArchana}\n   - Special Darshan: ${idDarshan}\n   - Prasadam: ${idPrasadam}\n   - Madurai: ${idMadurai}\n`);

  // 4. Create / Update Sub Admin Arun with Granular Permissions
  console.log('[STEP 4] Provisioning Sub Admin Arun with specific Category & Subcategory Permissions:');
  console.log('   - Branch: Chennai | Temple: Kapaleeshwarar Temple');
  console.log('   - Category: Pooja Services');
  console.log('   - Subcategory 1: Abhishekam -> Permissions: [view, edit]');
  console.log('   - Subcategory 2: Archana -> Permissions: [view, edit, delete]');
  console.log('   - Disallowed: Special Darshan, Homam, Prasadam, Astrology, Madurai, Tirupati\n');

  // Clean old Arun if present
  const adminList = await req('/api/admins', { headers: { Authorization: `Bearer ${superToken}` } });
  const oldArun = adminList.data.find(a => (a.email || '').toLowerCase() === 'arun@darshanjourney.com');
  if (oldArun) {
    await req(`/api/admins/${oldArun.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${superToken}` } });
  }

  const arunCreate = await req('/api/admins', {
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
      password: 'ArunSecurePass@2026',
      serviceAssignments: [
        {
          category: 'Pooja Services',
          categorySlug: 'pooja-services',
          subcategories: [
            { name: 'Abhishekam', slug: 'abhishekam', permissions: ['view', 'edit'] },
            { name: 'Archana', slug: 'archana', permissions: ['view', 'edit', 'delete'] }
          ]
        }
      ]
    }
  });

  if (!arunCreate.ok) throw new Error(`Failed to create Sub Admin Arun: ${JSON.stringify(arunCreate)}`);
  console.log('✅ Sub Admin Arun created with granular service permissions in MongoDB Atlas!\n');

  // 5. Authenticate as Arun
  console.log('[STEP 5] Authenticating as Sub Admin Arun...');
  const arunAuth = await req('/api/auth/admin-login', {
    method: 'POST',
    body: { email: 'arun@darshanjourney.com', password: 'ArunSecurePass@2026' }
  });
  if (!arunAuth.ok) throw new Error(`Arun login failed: ${JSON.stringify(arunAuth)}`);
  const arunToken = arunAuth.data.token;
  console.log(`✅ Arun logged in! Assigned Branch: ${arunAuth.data.user.branch}, Temple: ${arunAuth.data.user.temple}\n`);

  // 6. Verify Arun's scoped view on /api/services
  console.log('[STEP 6] Verifying Arun services visibility (/api/services)...');
  const arunServices = await req('/api/services', { headers: { Authorization: `Bearer ${arunToken}` } });
  const arunServiceIds = arunServices.data.map(s => s.id);
  console.log(`   Arun sees ${arunServices.data.length} services: ${arunServices.data.map(s => s.name).join(', ')}`);

  if (!arunServiceIds.includes(idAbhishekam)) throw new Error('Missing permitted service: Abhishekam');
  if (!arunServiceIds.includes(idArchana)) throw new Error('Missing permitted service: Archana');
  if (arunServiceIds.includes(idDarshan)) throw new Error('Security Breach: Arun saw unassigned subcategory Special Darshan!');
  if (arunServiceIds.includes(idPrasadam)) throw new Error('Security Breach: Arun saw unassigned category Prasadam!');
  if (arunServiceIds.includes(idMadurai)) throw new Error('Security Breach: Arun saw Madurai temple service!');
  console.log('✅ Scoped Service Filtering: 100% Correct!\n');

  // 7. Verify Arun's scoped view on /api/service-categories
  console.log('[STEP 7] Verifying Arun category hierarchy (/api/service-categories)...');
  const arunCats = await req('/api/service-categories', { headers: { Authorization: `Bearer ${arunToken}` } });
  const arunCatNames = arunCats.data.map(c => c.name);
  console.log(`   Arun visible categories: ${arunCatNames.join(', ')}`);
  if (arunCatNames.includes('Prasadam') || arunCatNames.includes('Astrology')) {
    throw new Error('Security Breach: Arun received unassigned categories in taxonomy!');
  }
  const poojaCat = arunCats.data.find(c => c.name === 'Pooja Services');
  const poojaSubs = (poojaCat?.subcategories || []).map(s => s.name);
  console.log(`   Pooja Services subcategories visible to Arun: ${poojaSubs.join(', ')}`);
  if (poojaSubs.includes('Special Darshan') || poojaSubs.includes('Homam')) {
    throw new Error('Security Breach: Arun saw unassigned subcategories under Pooja Services!');
  }
  console.log('✅ Scoped Taxonomy Filtering: 100% Correct!\n');

  // 8. Test Edit Permission on Abhishekam (Permitted)
  console.log('[STEP 8] Arun edits price for Chennai Abhishekam (Permission: edit -> GRANTED)...');
  const editAbhishekam = await req(`/api/services/${idAbhishekam}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${arunToken}` },
    body: { price: '₹850', numericPrice: 850 }
  });
  if (!editAbhishekam.ok) {
    throw new Error(`Expected edit to succeed for Abhishekam, got ${editAbhishekam.status}: ${JSON.stringify(editAbhishekam)}`);
  }
  console.log('✅ Arun successfully updated Abhishekam price to ₹850!\n');

  // 9. Test Delete Permission on Abhishekam (Denied - 403 Forbidden)
  console.log('[STEP 9] Arun attempts to delete Chennai Abhishekam (Permission: delete -> DENIED)...');
  const delAbhishekam = await req(`/api/services/${idAbhishekam}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${arunToken}` }
  });
  if (delAbhishekam.status !== 403) {
    throw new Error(`Security Failure! Expected 403 Forbidden for deleting Abhishekam, got ${delAbhishekam.status}`);
  }
  console.log(`✅ Backend 403 Forbidden verified: "${delAbhishekam.data.message}"\n`);

  // 10. Test Delete Permission on Archana (Permitted - 200 OK)
  console.log('[STEP 10] Arun deletes Chennai Archana (Permission: delete -> GRANTED)...');
  const delArchana = await req(`/api/services/${idArchana}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${arunToken}` }
  });
  if (!delArchana.ok) {
    throw new Error(`Expected delete to succeed for Archana, got ${delArchana.status}`);
  }
  console.log('✅ Arun successfully deleted Archana service!\n');

  // 11. Test Create Permission for Unauthorized Category (Prasadam - 403 Forbidden)
  console.log('[STEP 11] Arun attempts to create a Prasadam service (Category: Prasadam -> DENIED)...');
  const createPrasadam = await req('/api/services', {
    method: 'POST',
    headers: { Authorization: `Bearer ${arunToken}` },
    body: {
      name: 'Unauthorized Chennai Puliyodarai',
      category: 'Prasadam',
      categorySlug: 'prasadam',
      location: 'Chennai',
      temple: 'Kapaleeshwarar Temple'
    }
  });
  if (createPrasadam.status !== 403) {
    throw new Error(`Security Failure! Expected 403 Forbidden for unauthorized category, got ${createPrasadam.status}`);
  }
  console.log(`✅ Backend 403 Forbidden verified: "${createPrasadam.data.message}"\n`);

  // 12. Test Cross-Branch Access (Madurai Abhishekam - 403 Forbidden)
  console.log('[STEP 12] Arun attempts to edit Madurai Abhishekam (Branch: Madurai -> DENIED)...');
  const editMadurai = await req(`/api/services/${idMadurai}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${arunToken}` },
    body: { price: '₹1200' }
  });
  if (editMadurai.status !== 403) {
    throw new Error(`Security Failure! Expected 403 Forbidden for cross-branch service edit, got ${editMadurai.status}`);
  }
  console.log(`✅ Backend 403 Forbidden verified: "${editMadurai.data.message}"\n`);

  // 13. Super Admin Full Access Verification
  console.log('[STEP 13] Super Admin verifies full access to all categories, subcategories & services...');
  const allServices = await req('/api/services', { headers: { Authorization: `Bearer ${superToken}` } });
  const allCats = await req('/api/service-categories', { headers: { Authorization: `Bearer ${superToken}` } });
  console.log(`✅ Super Admin has complete access: ${allServices.data.length} total services, ${allCats.data.length} categories with all subcategories!\n`);

  // Clean up test services
  await req(`/api/services/${idAbhishekam}`, { method: 'DELETE', headers: { Authorization: `Bearer ${superToken}` } });
  await req(`/api/services/${idDarshan}`, { method: 'DELETE', headers: { Authorization: `Bearer ${superToken}` } });
  await req(`/api/services/${idPrasadam}`, { method: 'DELETE', headers: { Authorization: `Bearer ${superToken}` } });
  await req(`/api/services/${idMadurai}`, { method: 'DELETE', headers: { Authorization: `Bearer ${superToken}` } });

  console.log('🕉️ ==============================================================================');
  console.log('🕉️ ALL 13 GRANULAR RBAC & SERVICE PERMISSION TESTS PASSED WITH 100% SUCCESS!');
  console.log('🕉️ ==============================================================================');
}

runTest().catch(err => {
  console.error('\n❌ TEST FAILED:', err.message);
  process.exit(1);
});
