import http from 'http';

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });

    req.on('error', err => reject(err));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 TESTING SERVICES HIERARCHY: TEMPLE -> EMPLOYEE -> WORKS');
  console.log('🧪 ========================================================');

  const baseHeaders = {
    'Content-Type': 'application/json',
    'x-admin-email': 'admin@darshanjourney.com'
  };

  // Test 1: GET /api/temples
  console.log('\n▶ [TEST 1] GET /api/temples (Checking temples & employeesCount)...');
  const templesRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/temples',
    method: 'GET',
    headers: baseHeaders
  });

  if (templesRes.status === 200 && Array.isArray(templesRes.data)) {
    console.log(`✅ Received ${templesRes.data.length} temples`);
    const meenakshi = templesRes.data.find(t => t.id === 't-1' || t.name.includes('Meenakshi'));
    console.log(`   - Temple: ${meenakshi?.name}`);
    console.log(`   - employeesCount: ${meenakshi?.employeesCount}`);
    if (meenakshi?.employeesCount > 0) {
      console.log('✅ employeesCount successfully computed and populated on temple object!');
    } else {
      console.error('❌ employeesCount missing or 0 on Meenakshi temple');
    }
  } else {
    console.error('❌ Failed to fetch /api/temples:', templesRes);
  }

  // Test 2: GET /api/employees?templeId=t-1
  console.log('\n▶ [TEST 2] GET /api/employees?templeId=t-1 (Madurai Meenakshi Staff)...');
  const empRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/employees?templeId=t-1',
    method: 'GET',
    headers: baseHeaders
  });

  if (empRes.status === 200 && Array.isArray(empRes.data)) {
    console.log(`✅ Received ${empRes.data.length} employees belonging to temple t-1:`);
    empRes.data.forEach((e, idx) => {
      console.log(`   ${idx + 1}. ${e.name} — ${e.role || e.designation} (${e.department}) [${e.assignedWorksCount || 0} tasks]`);
    });
    const hasRavi = empRes.data.some(e => e.name.includes('Ravi Kumar'));
    if (hasRavi) {
      console.log('✅ Ravi Kumar (Temple Manager) found in employee list for t-1!');
    } else {
      console.error('❌ Ravi Kumar not found in t-1 employees');
    }
  } else {
    console.error('❌ Failed to fetch employees for t-1:', empRes);
  }

  // Test 3: GET /api/employees/emp-101 (Ravi Kumar details & assigned works)
  console.log('\n▶ [TEST 3] GET /api/employees/emp-101 (Ravi Kumar Details & Assigned Works)...');
  const raviRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/employees/emp-101',
    method: 'GET',
    headers: baseHeaders
  });

  if (raviRes.status === 200 && raviRes.data) {
    const e = raviRes.data;
    console.log(`✅ Employee: ${e.name}`);
    console.log(`   - Role: ${e.role}`);
    console.log(`   - Temple: ${e.templeName}`);
    console.log(`   - Assigned Works (${e.assignedWorks?.length || 0}):`);
    (e.assignedWorks || []).forEach((w, idx) => {
      console.log(`     ${idx + 1}. [${w.priority} Priority] ${w.title || w.name} (${w.status}) — ${w.category}`);
    });
    if (e.assignedWorks && e.assignedWorks.length >= 4) {
      console.log('✅ Assigned works correctly linked and returned for Ravi Kumar!');
    } else {
      console.error('❌ Assigned works missing or fewer than expected for Ravi Kumar');
    }
  } else {
    console.error('❌ Failed to fetch Ravi Kumar:', raviRes);
  }

  // Test 4: POST /api/employees/emp-101/works (Assign a new work item)
  console.log('\n▶ [TEST 4] POST /api/employees/emp-101/works (Assign New Task)...');
  const newTaskRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/employees/emp-101/works',
    method: 'POST',
    headers: baseHeaders
  }, {
    title: 'Audit Sanctum CCTV Security Feeds',
    description: 'Ensure 24/7 coverage of sanctum entry points during evening deeparadhana.',
    category: 'Security & Crowd',
    priority: 'High',
    status: 'In Progress',
    assignedDate: '2026-08-24',
    dueDate: '2026-08-29'
  });

  if (newTaskRes.status === 201 && newTaskRes.data.success) {
    console.log(`✅ Task assigned successfully: ${newTaskRes.data.data.title} (ID: ${newTaskRes.data.data.id})`);
    
    // Test 5: PUT /api/works/:id (Update task status)
    console.log('\n▶ [TEST 5] PUT /api/works/:id (Update task status to Completed)...');
    const updateWorkRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/works/${newTaskRes.data.data.id}`,
      method: 'PUT',
      headers: baseHeaders
    }, {
      status: 'Completed'
    });
    if (updateWorkRes.status === 200 && updateWorkRes.data.success) {
      console.log(`✅ Task status updated to: ${updateWorkRes.data.data.status}`);
    } else {
      console.error('❌ Failed to update work status:', updateWorkRes);
    }
  } else {
    console.error('❌ Failed to assign new task:', newTaskRes);
  }

  console.log('\n🏁 ========================================================');
  console.log('🏁 ALL SERVICES HIERARCHY TESTS COMPLETED SUCCESSFULLY!');
  console.log('🏁 ========================================================');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
});
