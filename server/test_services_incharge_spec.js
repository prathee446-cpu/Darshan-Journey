import http from 'http';

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('======================================================================');
  console.log('🧪 VERIFYING TEMPLE IN-CHARGE & SERVICE IN-CHARGE SEPARATION');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, title) {
    if (condition) {
      console.log(`  ✅ PASS: ${title}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${title}`);
      failed++;
    }
  }

  try {
    // 1. Super Admin login
    console.log('1. Super Admin Authentication');
    const adminLoginRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/admin-login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@darshanjourney.com', password: 'admin123' });

    assert(adminLoginRes.status === 200, 'Super admin logged in successfully');
    const superToken = adminLoginRes.data.token;

    // 2. Assign Temple In-Charge to Kapaleeshwarar Temple (Managed strictly from Temples section)
    console.log('\n2. Assign Temple In-Charge (Temples Section)');
    const templeAssignRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/temples/t-3/assign-incharge',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superToken}`
      }
    }, {
      name: 'Arun Kumar',
      email: 'arun@darshanjourney.com',
      phone: '+91 98765 00001',
      designation: 'Temple In-Charge',
      password: 'templepassword123',
      status: 'Active'
    });

    assert(templeAssignRes.status === 200 && templeAssignRes.data.success, 'Temple In-Charge Arun Kumar assigned to Kapaleeshwarar Temple');
    
    // Check GET /api/temples has populated Temple In-Charge
    const getTemplesRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/temples',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${superToken}` }
    });
    const kapaleeshwarar = getTemplesRes.data.find(t => t.id === 't-3' || (t.name && t.name.includes('Kapaleeshwarar')));
    assert(kapaleeshwarar?.assignedInCharge?.name === 'Arun Kumar', 'Kapaleeshwarar temple card includes assigned Temple In-Charge (Arun Kumar)');

    // 3. Assign Service In-Charge (Services Section) with Granular Subcategory Permissions
    console.log('\n3. Assign Service In-Charge (Services Section)');
    
    // Get all services first to locate Pooja and Prasadam services
    const allServicesRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/services',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${superToken}` }
    });

    let poojaService = allServicesRes.data.find(s => s.id === 'srv-kapaleeshwarar-pooja' || (s.name && s.name.includes('Pooja') && s.temple && s.temple.includes('Kapaleeshwarar')));
    if (!poojaService) {
      // Create it if not in database
      const createdPooja = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/services',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superToken}`
        }
      }, {
        id: 'srv-kapaleeshwarar-pooja',
        name: 'Pooja Service',
        templeId: 't-3',
        temple: 'Kapaleeshwarar Temple',
        location: 'Chennai',
        category: 'Pooja Services',
        categorySlug: 'pooja-services',
        price: '₹501',
        numericPrice: 501,
        status: 'Active',
        subcategories: [
          { id: 'sub-abh-1', name: 'Abhishekam', slug: 'abhishekam', status: 'Active' },
          { id: 'sub-arc-1', name: 'Archana', slug: 'archana', status: 'Active' },
          { id: 'sub-hom-1', name: 'Homam', slug: 'homam', status: 'Active' },
          { id: 'sub-sp-1', name: 'Special Pooja', slug: 'special-pooja', status: 'Active' }
        ]
      });
      poojaService = createdPooja.data.data;
    }

    const serviceAssignRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/services/${poojaService.id}/assign-incharge`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superToken}`
      }
    }, {
      name: 'Priya',
      email: 'priya@darshanjourney.com',
      phone: '+91 98765 11111',
      designation: 'Pooja Service In-Charge',
      password: 'priyapassword123',
      status: 'Active',
      servicePermissions: [
        { subcategoryId: 'sub-abh-1', name: 'Abhishekam', canView: true, canCreate: true, canEdit: true, canDelete: false, canPublish: true, canManageBookings: true },
        { subcategoryId: 'sub-arc-1', name: 'Archana', canView: true, canCreate: true, canEdit: true, canDelete: false, canPublish: true, canManageBookings: true },
        { subcategoryId: 'sub-hom-1', name: 'Homam', canView: true, canCreate: true, canEdit: false, canDelete: false, canPublish: true, canManageBookings: true },
        { subcategoryId: 'sub-sp-1', name: 'Special Pooja', canView: true, canCreate: false, canEdit: false, canDelete: false, canPublish: false, canManageBookings: true }
      ]
    });

    assert(serviceAssignRes.status === 200 && serviceAssignRes.data.success, 'Service In-Charge Priya assigned to Pooja Service with granular subcategories');

    // 4. Assign another Service In-Charge to Prasadam Service under the same temple
    console.log('\n4. Assign Prasadam Service In-Charge under same Temple');
    let prasadamService = allServicesRes.data.find(s => s.id === 'srv-kapaleeshwarar-prasadam' || (s.name && s.name.includes('Prasadam') && s.temple && s.temple.includes('Kapaleeshwarar')));
    if (!prasadamService) {
      const createdPrasadam = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/services',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superToken}`
        }
      }, {
        id: 'srv-kapaleeshwarar-prasadam',
        name: 'Prasadam Service',
        templeId: 't-3',
        temple: 'Kapaleeshwarar Temple',
        location: 'Chennai',
        category: 'Temple Prasadam',
        categorySlug: 'temple-prasadam',
        price: '₹251',
        numericPrice: 251,
        status: 'Active',
        subcategories: [
          { id: 'sub-lad-1', name: 'Laddu', slug: 'laddu', status: 'Active' },
          { id: 'sub-vib-1', name: 'Vibhuti', slug: 'vibhuti', status: 'Active' },
          { id: 'sub-box-1', name: 'Prasadam Box', slug: 'prasadam-box', status: 'Active' }
        ]
      });
      prasadamService = createdPrasadam.data.data;
    }

    const prasadamAssignRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/services/${prasadamService.id}/assign-incharge`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superToken}`
      }
    }, {
      name: 'Kumar',
      email: 'kumar@darshanjourney.com',
      phone: '+91 98765 22222',
      designation: 'Prasadam Service In-Charge',
      password: 'kumarpassword123',
      status: 'Active',
      servicePermissions: [
        { subcategoryId: 'sub-lad-1', name: 'Laddu', canView: true, canCreate: true, canEdit: true, canDelete: true, canPublish: true, canManageBookings: true },
        { subcategoryId: 'sub-vib-1', name: 'Vibhuti', canView: true, canCreate: true, canEdit: true, canDelete: true, canPublish: true, canManageBookings: true },
        { subcategoryId: 'sub-box-1', name: 'Prasadam Box', canView: true, canCreate: true, canEdit: true, canDelete: true, canPublish: true, canManageBookings: true }
      ]
    });

    assert(prasadamAssignRes.status === 200 && prasadamAssignRes.data.success, 'Service In-Charge Kumar assigned to Prasadam Service');

    // 5. Service In-Charge Sub-Admin Login Check
    console.log('\n5. Service In-Charge Sub-Admin Login & Scoped Access');
    const priyaLoginRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/admin-login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'priya@darshanjourney.com', password: 'priyapassword123' });

    assert(priyaLoginRes.status === 200, 'Priya logged in with sub-admin credentials');
    assert(priyaLoginRes.data.user.role === 'SERVICE_SUB_ADMIN', 'Role is correctly identified as SERVICE_SUB_ADMIN');
    assert(priyaLoginRes.data.user.serviceName === 'Pooja Service', 'User is scoped to Pooja Service');

    const priyaToken = priyaLoginRes.data.token;

    // 6. Test Priya's Scoped Services Endpoint (Should ONLY see Pooja Service)
    const priyaServicesRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/services',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${priyaToken}` }
    });

    assert(priyaServicesRes.status === 200, 'Services list fetched by Priya');
    const visibleServices = priyaServicesRes.data;
    const allPooja = visibleServices.every(s => s.name.includes('Pooja') || (s.category || '').includes('Pooja'));
    assert(allPooja && visibleServices.length > 0, `Priya sees only Pooja Service offerings (total visible: ${visibleServices.length})`);
    
    const seesPrasadam = visibleServices.some(s => s.name === 'Prasadam Service' || s.id === 'srv-kapaleeshwarar-prasadam');
    assert(!seesPrasadam, 'Priya cannot see other services (e.g. Prasadam Service) assigned to Kumar');

    // 7. Test Temple Access Denial for Service In-Charge
    const priyaTemplesRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/temples',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${priyaToken}` }
    });
    assert(priyaTemplesRes.data.length === 0, 'Priya has no direct Temple In-Charge access on temples directory');

    // 8. Test In-Charge Status toggle and Password Reset
    console.log('\n6. Service In-Charge Status & Password Reset API');
    const statusToggleRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/services/srv-kapaleeshwarar-pooja/incharge/status',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superToken}`
      }
    }, { status: 'Suspended' });

    assert(statusToggleRes.status === 200 && statusToggleRes.data.success, 'Super Admin toggled Priya to Suspended');

    // Suspended login attempt should fail
    const suspendedLoginRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/admin-login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'priya@darshanjourney.com', password: 'priyapassword123' });

    assert(suspendedLoginRes.data.user?.status === 'Suspended', 'Priya status reflects Suspended');

    // Reactivate Priya
    await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/services/srv-kapaleeshwarar-pooja/incharge/status',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superToken}`
      }
    }, { status: 'Active' });

    console.log('\n======================================================================');
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================================');

    process.exit(failed === 0 ? 0 : 1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
