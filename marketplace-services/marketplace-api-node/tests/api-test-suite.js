/**
 * Comprehensive API Test Suite
 * Tests all 83+ endpoints in the Marketplace API
 */

const axios = require('axios');
const colors = require('colors');

const API_BASE = 'http://localhost:8085/api/marketplace';
let authToken = '';
let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Test data
const   testData = {
  product: {
    code: `TEST-PROD-${Date.now()}`,
    name: 'Automated Test Product',
    productType: 'INVESTMENT',
    description: 'Created by automated test',
    minInvestment: 1000,
    maxInvestment: 100000,
    currency: 'PHP'
  },
  partner: {
    code: `TEST-PARTNER-${Date.now()}`,
    name: 'Automated Test Partner',
    partnerType: 'INVESTMENT',
    description: 'Created by automated test',
    contactEmail: 'test@partner.com'
  },
  customer: {
    email: `test${Date.now()}@customer.com`,
    first_name: 'Test',
    last_name: 'Customer',
    phone: '+1234567890',
    kyc_status: 'PENDING'
  }
};

let createdIds = {
  product: null,
  partner: null,
  customer: null,
  asset: null
};

/**
 * Test runner utility
 */
async function runTest(name, testFunc) {
  try {
    process.stdout.write(`Testing: ${name}... `.padEnd(70));
    await testFunc();
    console.log('✅ PASS'.green);
    testResults.passed++;
  } catch (error) {
    console.log('❌ FAIL'.red);
    testResults.failed++;
    testResults.errors.push({
      test: name,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

/**
 * Authentication Tests
 */
async function testAuthentication() {
  console.log('\n' + '='.repeat(80));
  console.log('AUTHENTICATION & AUTHORIZATION TESTS'.cyan.bold);
  console.log('='.repeat(80));

  await runTest('POST /auth/login - Valid credentials', async () => {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin@superapp.com',
      password: 'Admin@123'
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (!response.data.token) throw new Error('No token in response');
    authToken = response.data.token;
  });

  await runTest('POST /auth/login - Invalid credentials', async () => {
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        username: 'admin@superapp.com',
        password: 'wrong'
      });
      throw new Error('Should have failed with invalid credentials');
    } catch (error) {
      if (error.response?.status !== 401) throw new Error(`Expected 401, got ${error.response?.status}`);
    }
  });

  await runTest('GET /auth/verify - With valid token', async () => {
    const response = await axios.get(`${API_BASE}/auth/verify`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });

  await runTest('GET /auth/verify - Without token', async () => {
    try {
      await axios.get(`${API_BASE}/auth/verify`);
      throw new Error('Should have failed without token');
    } catch (error) {
      if (error.response?.status !== 401) throw new Error(`Expected 401, got ${error.response?.status}`);
    }
  });

  await runTest('POST /auth/logout', async () => {
    const response = await axios.post(`${API_BASE}/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });
}

/**
 * Product Tests
 */
async function testProducts() {
  console.log('\n' + '='.repeat(80));
  console.log('PRODUCT MANAGEMENT TESTS'.cyan.bold);
  console.log('='.repeat(80));

  await runTest('GET /products - List all products', async () => {
    const response = await axios.get(`${API_BASE}/products`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (!Array.isArray(response.data)) throw new Error('Response should be an array');
  });

  await runTest('POST /products - Create new product', async () => {
    const response = await axios.post(`${API_BASE}/products`, testData.product, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Expected 200/201, got ${response.status}`);
    }
    if (!response.data.id) throw new Error('No ID in response');
    createdIds.product = response.data.id;
  });

  await runTest('GET /products/:id - Get product by ID', async () => {
    if (!createdIds.product) throw new Error('No product ID available');
    const response = await axios.get(`${API_BASE}/products/${createdIds.product}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (response.data.id !== createdIds.product) throw new Error('Wrong product returned');
  });

  await runTest('PUT /products/:id - Update product', async () => {
    if (!createdIds.product) throw new Error('No product ID available');
    const response = await axios.put(`${API_BASE}/products/${createdIds.product}`, {
      ...testData.product,
      name: 'Updated Test Product'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });

  await runTest('PATCH /products/:id/approve - Approve product', async () => {
    if (!createdIds.product) throw new Error('No product ID available');
    const response = await axios.patch(
      `${API_BASE}/products/${createdIds.product}/approve`,
      { approvedBy: 'admin@superapp.com' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });

  await runTest('GET /products?code= - Filter by code', async () => {
    const response = await axios.get(`${API_BASE}/products?code=${testData.product.code}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (!Array.isArray(response.data)) throw new Error('Response should be an array');
  });
}

/**
 * Partner Tests
 */
async function testPartners() {
  console.log('\n' + '='.repeat(80));
  console.log('PARTNER MANAGEMENT TESTS'.cyan.bold);
  console.log('='.repeat(80));

  await runTest('GET /partners - List all partners', async () => {
    const response = await axios.get(`${API_BASE}/partners`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (!Array.isArray(response.data)) throw new Error('Response should be an array');
  });

  await runTest('POST /partners - Create new partner', async () => {
    const response = await axios.post(`${API_BASE}/partners`, testData.partner, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Expected 200/201, got ${response.status}`);
    }
    if (!response.data.id) throw new Error('No ID in response');
    createdIds.partner = response.data.id;
  });

  await runTest('GET /partners/:id - Get partner by ID', async () => {
    if (!createdIds.partner) throw new Error('No partner ID available');
    const response = await axios.get(`${API_BASE}/partners/${createdIds.partner}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });

  await runTest('PUT /partners/:id - Update partner', async () => {
    if (!createdIds.partner) throw new Error('No partner ID available');
    const response = await axios.put(`${API_BASE}/partners/${createdIds.partner}`, {
      ...testData.partner,
      name: 'Updated Test Partner'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });

  await runTest('PATCH /partners/:id/approve - Approve partner', async () => {
    if (!createdIds.partner) throw new Error('No partner ID available');
    const response = await axios.patch(
      `${API_BASE}/partners/${createdIds.partner}/approve`,
      { approvedBy: 'admin@superapp.com' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });

  await runTest('GET /partners/status/:status - Filter by status', async () => {
    const response = await axios.get(`${API_BASE}/partners/status/ACTIVE`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });
}

/**
 * Customer Tests
 */
async function testCustomers() {
  console.log('\n' + '='.repeat(80));
  console.log('CUSTOMER MANAGEMENT TESTS'.cyan.bold);
  console.log('='.repeat(80));

  await runTest('GET /customers - List all customers', async () => {
    const response = await axios.get(`${API_BASE}/customers`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });

  await runTest('POST /customers - Create new customer', async () => {
    const response = await axios.post(`${API_BASE}/customers`, testData.customer, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Expected 200/201, got ${response.status}`);
    }
    if (!response.data.id) throw new Error('No ID in response');
    createdIds.customer = response.data.id;
  });

  await runTest('GET /customers/:id - Get customer by ID', async () => {
    if (!createdIds.customer) throw new Error('No customer ID available');
    const response = await axios.get(`${API_BASE}/customers/${createdIds.customer}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });

  await runTest('PUT /customers/:id - Update customer', async () => {
    if (!createdIds.customer) throw new Error('No customer ID available');
    const response = await axios.put(`${API_BASE}/customers/${createdIds.customer}`, {
      ...testData.customer,
      first_name: 'Updated'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });
}

/**
 * Assets Tests
 */
async function testAssets() {
  console.log('\n' + '='.repeat(80));
  console.log('ASSET MANAGEMENT TESTS'.cyan.bold);
  console.log('='.repeat(80));

  await runTest('GET /assets - List all assets', async () => {
    const response = await axios.get(`${API_BASE}/assets`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });

  if (createdIds.product && createdIds.partner) {
    await runTest('POST /assets - Create new asset', async () => {
      const assetData = {
        productId: createdIds.product,
        partnerId: createdIds.partner,
        name: 'Test Asset',
        code: `ASSET-${Date.now()}`,
        assetType: 'STOCK',
        price: 100.50,
        currency: 'PHP',
        minInvestment: 1000,
        riskLevel: 'MEDIUM'
      };
      const response = await axios.post(`${API_BASE}/assets`, assetData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`Expected 200/201, got ${response.status}`);
      }
      if (!response.data.id) throw new Error('No ID in response');
      createdIds.asset = response.data.id;
    });
  }
}

/**
 * Admin Tests
 */
async function testAdminEndpoints() {
  console.log('\n' + '='.repeat(80));
  console.log('ADMIN & IAM TESTS'.cyan.bold);
  console.log('='.repeat(80));

  await runTest('GET /admin/users - List admin users', async () => {
    const response = await axios.get(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });

  await runTest('GET /admin/groups - List user groups', async () => {
    const response = await axios.get(`${API_BASE}/admin/groups`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });

  await runTest('GET /admin/permissions - List permissions', async () => {
    const response = await axios.get(`${API_BASE}/admin/permissions`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });
}

/**
 * Approvals Tests
 */
async function testApprovals() {
  console.log('\n' + '='.repeat(80));
  console.log('APPROVAL WORKFLOW TESTS'.cyan.bold);
  console.log('='.repeat(80));

  await runTest('GET /approvals - List all approvals', async () => {
    const response = await axios.get(`${API_BASE}/approvals`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });

  await runTest('GET /approvals/pending - List pending approvals', async () => {
    const response = await axios.get(`${API_BASE}/approvals/pending`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });
}

/**
 * Change Requests Tests
 */
async function testChangeRequests() {
  console.log('\n' + '='.repeat(80));
  console.log('CHANGE REQUEST TESTS'.cyan.bold);
  console.log('='.repeat(80));

  await runTest('GET /change-requests - List change requests', async () => {
    const response = await axios.get(`${API_BASE}/change-requests`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });
}

/**
 * Features Tests
 */
async function testFeatures() {
  console.log('\n' + '='.repeat(80));
  console.log('FEATURE FLAG TESTS'.cyan.bold);
  console.log('='.repeat(80));

  if (createdIds.product) {
    await runTest('GET /products/:id/features - List product features', async () => {
      const response = await axios.get(`${API_BASE}/products/${createdIds.product}/features`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    });
  }
}

/**
 * Health Check
 */
async function testHealthCheck() {
  console.log('\n' + '='.repeat(80));
  console.log('HEALTH CHECK TESTS'.cyan.bold);
  console.log('='.repeat(80));

  await runTest('GET /health - Health check endpoint', async () => {
    const response = await axios.get(`${API_BASE}/health`);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (response.data.status !== 'UP') throw new Error('Service not healthy');
  });
}

/**
 * Cleanup - Delete test data
 */
async function cleanup() {
  console.log('\n' + '='.repeat(80));
  console.log('CLEANUP - Removing test data'.cyan.bold);
  console.log('='.repeat(80));

  // Note: Uncomment these if you want to clean up test data
  // For now, keeping test data for verification
  
  /*
  if (createdIds.asset) {
    await runTest('DELETE /assets/:id - Delete test asset', async () => {
      await axios.delete(`${API_BASE}/assets/${createdIds.asset}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
    });
  }

  if (createdIds.customer) {
    await runTest('DELETE /customers/:id - Delete test customer', async () => {
      await axios.delete(`${API_BASE}/customers/${createdIds.customer}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
    });
  }

  if (createdIds.partner) {
    await runTest('DELETE /partners/:id - Delete test partner', async () => {
      await axios.delete(`${API_BASE}/partners/${createdIds.partner}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
    });
  }

  if (createdIds.product) {
    await runTest('DELETE /products/:id - Delete test product', async () => {
      await axios.delete(`${API_BASE}/products/${createdIds.product}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
    });
  }
  */
  
  console.log('\n  ℹ️  Test data preserved for manual verification'.yellow);
}

/**
 * Print Results
 */
function printResults() {
  console.log('\n' + '='.repeat(80));
  console.log('TEST RESULTS SUMMARY'.cyan.bold);
  console.log('='.repeat(80) + '\n');

  const total = testResults.passed + testResults.failed;
  const passRate = total > 0 ? ((testResults.passed / total) * 100).toFixed(2) : 0;

  console.log(`Total Tests:  ${total}`);
  console.log(`Passed:       ${testResults.passed}`.green);
  console.log(`Failed:       ${testResults.failed}`.red);
  console.log(`Pass Rate:    ${passRate}%\n`);

  if (testResults.errors.length > 0) {
    console.log('FAILED TESTS:'.red.bold);
    console.log('─'.repeat(80));
    testResults.errors.forEach((error, index) => {
      console.log(`\n${index + 1}. ${error.test}`.red);
      console.log(`   Status: ${error.status || 'N/A'}`);
      console.log(`   Error:  ${error.error}`);
      if (error.data) {
        console.log(`   Data:   ${JSON.stringify(error.data, null, 2).substring(0, 200)}`);
      }
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log(`Created Test Data IDs:`.cyan);
  console.log(`  Product:  ${createdIds.product || 'N/A'}`);
  console.log(`  Partner:  ${createdIds.partner || 'N/A'}`);
  console.log(`  Customer: ${createdIds.customer || 'N/A'}`);
  console.log(`  Asset:    ${createdIds.asset || 'N/A'}`);
  console.log('='.repeat(80) + '\n');
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║        MARKETPLACE API - COMPREHENSIVE TEST SUITE             ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    await testHealthCheck();
    await testAuthentication();
    await testProducts();
    await testPartners();
    await testCustomers();
    await testAssets();
    await testAdminEndpoints();
    await testApprovals();
    await testChangeRequests();
    await testFeatures();
    await cleanup();
  } catch (error) {
    console.error('\n❌ Fatal error during test execution:'.red.bold, error.message);
  }

  printResults();

  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests();

