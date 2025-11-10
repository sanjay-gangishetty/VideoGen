/**
 * User Model Tests
 * Minimal tests for User CRUD operations
 */

const User = require('../../models/User');
const { cleanupUserByEmail, disconnect } = require('../helpers/db');

// Test data
const testUser = {
  email: 'test-user@example.com',
  name: 'Test User',
  phone: '+1234567890',
  image: 'https://example.com/avatar.jpg',
  googleId: 'google-test-123',
  initialCredits: 150
};

let createdUserId = null;

async function runTests() {
  console.log('\n=== User Model Tests ===\n');

  try {
    // Test 1: Create user with wallet
    console.log('Test 1: Create user with wallet');
    const newUser = await User.create(testUser);
    createdUserId = newUser.id;

    if (newUser.email === testUser.email && newUser.wallet) {
      console.log('✓ User created successfully with wallet');
      console.log(`  User ID: ${newUser.id}`);
      console.log(`  Email: ${newUser.email}`);
      console.log(`  Wallet Balance: ${newUser.wallet.currentBalance}`);
    } else {
      console.log('✗ User creation failed');
      return false;
    }

    // Test 2: Find user by ID
    console.log('\nTest 2: Find user by ID');
    const foundUser = await User.findById(createdUserId);

    if (foundUser && foundUser.id === createdUserId) {
      console.log('✓ User found by ID');
      console.log(`  Found: ${foundUser.email}`);
    } else {
      console.log('✗ User not found by ID');
      return false;
    }

    // Test 3: Find user by email
    console.log('\nTest 3: Find user by email');
    const foundByEmail = await User.findByEmail(testUser.email);

    if (foundByEmail && foundByEmail.email === testUser.email) {
      console.log('✓ User found by email');
    } else {
      console.log('✗ User not found by email');
      return false;
    }

    // Test 4: Find user by Google ID
    console.log('\nTest 4: Find user by Google ID');
    const foundByGoogleId = await User.findByGoogleId(testUser.googleId);

    if (foundByGoogleId && foundByGoogleId.googleId === testUser.googleId) {
      console.log('✓ User found by Google ID');
    } else {
      console.log('✗ User not found by Google ID');
      return false;
    }

    // Test 5: Update user profile
    console.log('\nTest 5: Update user profile');
    const updatedUser = await User.update(createdUserId, {
      name: 'Updated Test User',
      phone: '+9876543210'
    });

    if (updatedUser.name === 'Updated Test User' && updatedUser.phone === '+9876543210') {
      console.log('✓ User profile updated successfully');
    } else {
      console.log('✗ User profile update failed');
      return false;
    }

    // Test 6: Wallet relation
    console.log('\nTest 6: Verify wallet relation');
    const userWithWallet = await User.findById(createdUserId);

    if (userWithWallet.wallet && userWithWallet.wallet.currentBalance === 150) {
      console.log('✓ Wallet relation working correctly');
      console.log(`  Balance: ${userWithWallet.wallet.currentBalance}`);
      console.log(`  Total Used: ${userWithWallet.wallet.totalCreditsUsed}`);
    } else {
      console.log('✗ Wallet relation failed');
      return false;
    }

    console.log('\n✓ All User model tests passed!\n');
    return true;

  } catch (error) {
    console.log(`\n✗ Test failed with error: ${error.message}\n`);
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
