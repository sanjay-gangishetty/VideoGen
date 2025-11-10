/**
 * Credit Controller Integration Tests
 * Tests credit operations through controller layer
 */

const User = require('../../models/User');
const creditController = require('../../controllers/creditController');
const { cleanupUserByEmail, disconnect } = require('../helpers/db');

// Test data
const testUser = {
  email: 'test-credit-controller@example.com',
  name: 'Credit Controller Test',
  initialCredits: 100
};

let testUserId = null;

// Mock request/response objects
function createMockReq(userId, body = {}, query = {}) {
  return {
    userId: userId,
    body,
    query
  };
}

function createMockRes() {
  const res = {
    statusCode: null,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    }
  };
  return res;
}

async function runTests() {
  console.log('\n=== Credit Controller Integration Tests ===\n');

  try {
    // Setup: Create test user
    console.log('Setup: Creating test user...');
    const user = await User.create(testUser);
    testUserId = user.id;
    console.log(`✓ Test user created (ID: ${testUserId})\n`);

    // Test 1: Get user credits
    console.log('Test 1: Get user credits');
    const req1 = createMockReq(testUserId);
    const res1 = createMockRes();
    await creditController.getUserCredits(req1, res1);

    if (res1.statusCode === 200 &&
        res1.jsonData.success &&
        res1.jsonData.data.credits === 100) {
      console.log('✓ Get credits successful');
      console.log(`  Credits: ${res1.jsonData.data.credits}`);
      console.log(`  Total Used: ${res1.jsonData.data.totalCreditsUsed}`);
    } else {
      console.log('✗ Get credits failed');
      console.log(res1);
      return false;
    }

    // Test 2: Add credits
    console.log('\nTest 2: Add credits');
    const req2 = createMockReq(testUserId, { amount: 50, reason: 'Test credit addition' });
    const res2 = createMockRes();
    await creditController.addCredits(req2, res2);

    if (res2.statusCode === 200 &&
        res2.jsonData.success &&
        res2.jsonData.data.newBalance === 150) {
      console.log('✓ Add credits successful');
      console.log(`  Previous: ${res2.jsonData.data.previousBalance}`);
      console.log(`  Added: ${res2.jsonData.data.amountAdded}`);
      console.log(`  New: ${res2.jsonData.data.newBalance}`);
    } else {
      console.log('✗ Add credits failed');
      console.log(res2);
      return false;
    }

    // Test 3: Deduct credits (sufficient balance)
    console.log('\nTest 3: Deduct credits (sufficient balance)');
    const req3 = createMockReq(testUserId, { amount: 30, reason: 'Test video generation' });
    const res3 = createMockRes();
    await creditController.deductCredits(req3, res3);

    if (res3.statusCode === 200 &&
        res3.jsonData.success &&
        res3.jsonData.data.newBalance === 120) {
      console.log('✓ Deduct credits successful');
      console.log(`  Previous: ${res3.jsonData.data.previousBalance}`);
      console.log(`  Deducted: ${res3.jsonData.data.amountDeducted}`);
      console.log(`  New: ${res3.jsonData.data.newBalance}`);
      console.log(`  Total Used: ${res3.jsonData.data.totalCreditsUsed}`);
    } else {
      console.log('✗ Deduct credits failed');
      console.log(res3);
      return false;
    }

    // Test 4: Deduct credits (insufficient balance)
    console.log('\nTest 4: Deduct credits (insufficient balance)');
    const req4 = createMockReq(testUserId, { amount: 200, reason: 'Should fail' });
    const res4 = createMockRes();
    await creditController.deductCredits(req4, res4);

    if (res4.statusCode === 402 &&
        !res4.jsonData.success &&
        res4.jsonData.error === 'Insufficient credits') {
      console.log('✓ Insufficient credits error returned correctly');
      console.log(`  Required: ${res4.jsonData.data.required}`);
      console.log(`  Available: ${res4.jsonData.data.available}`);
      console.log(`  Shortage: ${res4.jsonData.data.shortage}`);
    } else {
      console.log('✗ Insufficient credits error not handled correctly');
      console.log(res4);
      return false;
    }

    // Test 5: Get credits after operations
    console.log('\nTest 5: Get credits after operations');
    const req5 = createMockReq(testUserId);
    const res5 = createMockRes();
    await creditController.getUserCredits(req5, res5);

    if (res5.statusCode === 200 &&
        res5.jsonData.data.credits === 120 &&
        res5.jsonData.data.totalCreditsUsed === 30) {
      console.log('✓ Final balance and total used correct');
      console.log(`  Current Balance: ${res5.jsonData.data.credits}`);
      console.log(`  Total Used: ${res5.jsonData.data.totalCreditsUsed}`);
    } else {
      console.log('✗ Final balance verification failed');
      console.log(res5);
      return false;
    }

    console.log('\n✓ All Credit Controller tests passed!\n');
    return true;

  } catch (error) {
    console.log(`\n✗ Test failed with error: ${error.message}\n`);
    console.error(error);
    return false;
  } finally {
    // Cleanup
    console.log('Cleaning up test data...');
    await cleanupUserByEmail(testUser.email);
    await disconnect();
  }
}

// Run tests if executed directly
if (require.main === module) {
  runTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runTests };
