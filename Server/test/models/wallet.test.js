/**
 * Wallet Model Tests
 * Minimal tests for Wallet operations (credits, deductions)
 */

const User = require('../../models/User');
const Wallet = require('../../models/Wallet');
const { cleanupUserByEmail, disconnect } = require('../helpers/db');

// Test data
const testUser = {
  email: 'test-wallet@example.com',
  name: 'Wallet Test User',
  initialCredits: 100
};

let testUserId = null;

async function runTests() {
  console.log('\n=== Wallet Model Tests ===\n');

  try {
    // Setup: Create test user
    console.log('Setup: Creating test user...');
    const user = await User.create(testUser);
    testUserId = user.id;
    console.log(`✓ Test user created (ID: ${testUserId})\n`);

    // Test 1: Get wallet balance
    console.log('Test 1: Get wallet balance');
    const balance = await Wallet.getBalance(testUserId);

    if (balance === 100) {
      console.log('✓ Wallet balance retrieved correctly');
      console.log(`  Balance: ${balance} credits`);
    } else {
      console.log(`✗ Expected balance 100, got ${balance}`);
      return false;
    }

    // Test 2: Add credits
    console.log('\nTest 2: Add credits');
    const addResult = await Wallet.addCredits(testUserId, 50);

    if (addResult.currentBalance === 150 && addResult.previousBalance === 100) {
      console.log('✓ Credits added successfully');
      console.log(`  Previous: ${addResult.previousBalance}`);
      console.log(`  New: ${addResult.currentBalance}`);
    } else {
      console.log('✗ Add credits failed');
      return false;
    }

    // Test 3: Deduct credits (sufficient balance)
    console.log('\nTest 3: Deduct credits (sufficient balance)');
    const deductResult = await Wallet.deductCredits(testUserId, 30);

    if (deductResult.currentBalance === 120 &&
        deductResult.totalCreditsUsed === 30) {
      console.log('✓ Credits deducted successfully');
      console.log(`  Previous: ${deductResult.previousBalance}`);
      console.log(`  New: ${deductResult.currentBalance}`);
      console.log(`  Total Used: ${deductResult.totalCreditsUsed}`);
    } else {
      console.log('✗ Deduct credits failed');
      return false;
    }

    // Test 4: Deduct credits (insufficient balance)
    console.log('\nTest 4: Deduct credits (insufficient balance)');
    try {
      await Wallet.deductCredits(testUserId, 200);
      console.log('✗ Should have thrown insufficient credits error');
      return false;
    } catch (error) {
      if (error.message === 'Insufficient credits') {
        console.log('✓ Insufficient credits error thrown correctly');
      } else {
        console.log(`✗ Wrong error: ${error.message}`);
        return false;
      }
    }

    // Test 5: Multiple deductions (track total used)
    console.log('\nTest 5: Multiple deductions (track total used)');
    await Wallet.deductCredits(testUserId, 20);
    await Wallet.deductCredits(testUserId, 10);
    const wallet = await Wallet.findByUserId(testUserId);

    if (wallet.currentBalance === 90 && wallet.totalCreditsUsed === 60) {
      console.log('✓ Total credits used tracked correctly');
      console.log(`  Current Balance: ${wallet.currentBalance}`);
      console.log(`  Total Used: ${wallet.totalCreditsUsed}`);
    } else {
      console.log('✗ Total credits tracking failed');
      return false;
    }

    // Test 6: Reset wallet
    console.log('\nTest 6: Reset wallet');
    const resetWallet = await Wallet.reset(testUserId);

    if (resetWallet.currentBalance === 100 && resetWallet.totalCreditsUsed === 0) {
      console.log('✓ Wallet reset successfully');
    } else {
      console.log('✗ Wallet reset failed');
      return false;
    }

    console.log('\n✓ All Wallet model tests passed!\n');
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
