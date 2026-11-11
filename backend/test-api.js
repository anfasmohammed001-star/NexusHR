import assert from 'node:assert/strict';
import app from './src/server.js';
import http from 'http';

async function testEndpoints() {
  console.log('🧪 Starting API Integration Tests...');

  function makeRequest(path, method = 'GET', body = null, rawBody = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, text: data });
          }
        });
      });

      req.on('error', reject);
      if (rawBody !== null) {
        req.write(rawBody);
      } else if (body !== null) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  // Wait 500ms for server to bind
  await new Promise((r) => setTimeout(r, 500));

  try {
    // 1. Health check
    const health = await makeRequest('/health');
    assert.equal(health.status, 200);
    assert.equal(health.data.status, 'healthy');
    console.log('✅ Health check:', health.status, health.data.database);

    // 2. GET all employees
    const getRes = await makeRequest('/api/employees');
    assert.equal(getRes.status, 200);
    assert.equal(getRes.data.success, true);
    assert.ok(Array.isArray(getRes.data.data));
    console.log('✅ GET /api/employees:', getRes.status, `count: ${getRes.data.data.length}`);

    // 3. Search employees
    const searchRes = await makeRequest('/api/employees?search=Engineering');
    assert.equal(searchRes.status, 200);
    assert.ok(searchRes.data.data.length >= 3);
    console.log('✅ GET /api/employees?search=Engineering:', searchRes.status, `matches: ${searchRes.data.data.length}`);

    // 3b. Search wildcard escaping (%)
    const wildcardRes = await makeRequest('/api/employees?search=%25');
    assert.equal(wildcardRes.status, 200);
    assert.equal(wildcardRes.data.data.length, 0);
    console.log('✅ GET /api/employees?search=% (wildcard escaped):', wildcardRes.status, 'matches: 0');

    // 4. Sort employees by salary desc
    const sortRes = await makeRequest('/api/employees?sortBy=salary&order=desc');
    assert.equal(sortRes.status, 200);
    assert.ok(sortRes.data.data[0].salary >= sortRes.data.data[1].salary);
    console.log('✅ GET /api/employees?sortBy=salary&order=desc highest salary:', sortRes.data.data[0].name, sortRes.data.data[0].salary);

    // 5. POST create valid employee
    const newEmp = {
      name: 'Samantha Ray',
      department: 'Engineering',
      role: 'Staff DevOps Engineer',
      salary: 138000.00,
      join_date: '2024-03-01',
    };
    const createRes = await makeRequest('/api/employees', 'POST', newEmp);
    assert.equal(createRes.status, 201);
    assert.equal(createRes.data.success, true);
    assert.equal(createRes.data.data.name, 'Samantha Ray');
    console.log('✅ POST /api/employees:', createRes.status, createRes.data.message, 'ID:', createRes.data.data.id);
    const createdId = createRes.data.data.id;

    // 6. POST invalid employee (validation failure test)
    const invalidEmp = {
      name: '',
      department: 'HR',
      role: '',
      salary: -500,
      join_date: '2023-02-31', // invalid calendar date
    };
    const invalidRes = await makeRequest('/api/employees', 'POST', invalidEmp);
    assert.equal(invalidRes.status, 400);
    assert.equal(invalidRes.data.success, false);
    assert.equal(invalidRes.data.errors.length, 4);
    console.log('✅ POST /api/employees (invalid payload):', invalidRes.status, 'Errors:', invalidRes.data.errors.length);

    // 6b. POST boolean salary & missing body & malformed JSON
    const boolSalaryRes = await makeRequest('/api/employees', 'POST', {
      name: 'Test',
      department: 'HR',
      role: 'Tester',
      salary: true,
      join_date: '2024-01-01',
    });
    assert.equal(boolSalaryRes.status, 400);
    console.log('✅ POST /api/employees (boolean salary rejected):', boolSalaryRes.status);

    const malformedRes = await makeRequest('/api/employees', 'POST', null, '{"name": "broken"');
    assert.equal(malformedRes.status, 400);
    console.log('✅ POST /api/employees (malformed JSON rejected):', malformedRes.status);

    // 7. GET employee by ID & invalid ID
    const getByIdRes = await makeRequest(`/api/employees/${createdId}`);
    assert.equal(getByIdRes.status, 200);
    assert.equal(getByIdRes.data.data.name, 'Samantha Ray');
    console.log('✅ GET /api/employees/:id:', getByIdRes.status, getByIdRes.data.data.name);

    const invalidIdRes = await makeRequest('/api/employees/12abc');
    assert.equal(invalidIdRes.status, 400);
    console.log('✅ GET /api/employees/12abc (strict ID check):', invalidIdRes.status);

    // 8. PUT update employee
    const updateRes = await makeRequest(`/api/employees/${createdId}`, 'PUT', {
      name: 'Samantha Ray',
      department: 'Engineering',
      role: 'Principal DevOps Architect',
      salary: 152000.00,
      join_date: '2024-03-01',
    });
    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.data.data.role, 'Principal DevOps Architect');
    console.log('✅ PUT /api/employees/:id:', updateRes.status, updateRes.data.message);

    // 9. DELETE employee
    const deleteRes = await makeRequest(`/api/employees/${createdId}`, 'DELETE');
    assert.equal(deleteRes.status, 200);
    assert.equal(deleteRes.data.success, true);
    console.log('✅ DELETE /api/employees/:id:', deleteRes.status, deleteRes.data.message);

    // 10. GET non-existent employee (404 test)
    const notFoundRes = await makeRequest(`/api/employees/${createdId}`);
    assert.equal(notFoundRes.status, 404);
    console.log('✅ GET /api/employees/:id (after delete):', notFoundRes.status, notFoundRes.data.message);

    // 11. Dashboard stats summary
    const statsRes = await makeRequest('/api/employees/stats/summary');
    assert.equal(statsRes.status, 200);
    assert.ok(statsRes.data.data.totalEmployees >= 10);
    console.log('✅ GET /api/employees/stats/summary:', statsRes.status, statsRes.data.data);

    console.log('🎉 ALL BACKEND API ENDPOINTS & EDGE CASES PASSED FLAWLESSLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

testEndpoints();
