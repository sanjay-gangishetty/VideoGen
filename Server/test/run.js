/**
 * Simple Test Runner
 * Runs all test files sequentially
 */

const userTests = require('./models/user.test');
const walletTests = require('./models/wallet.test');
const creditTests = require('./controllers/credit.test');

async function runAllTests() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   Video Generator - Database Tests    ║');
  console.log('╚════════════════════════════════════════╝');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  const tests = [
    { name: 'User Model', run: userTests.runTests },
    { name: 'Wallet Model', run: walletTests.runTests },
    { name: 'Credit Controller', run: creditTests.runTests }
  ];

  for (const test of tests) {
    totalTests++;
    console.log(`\n▶ Running ${test.name} tests...`);

    try {
      const result = await test.run();
      if (result) {
        passedTests++;
        console.log(`✓ ${test.name} tests PASSED`);
      } else {
        failedTests++;
        console.log(`✗ ${test.name} tests FAILED`);
      }
    } catch (error) {
      failedTests++;
      console.log(`✗ ${test.name} tests FAILED with error:`);
      console.error(error);
    }
  }

  // Summary
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║           Test Summary                 ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`Total Test Suites: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);

  if (failedTests === 0) {
    console.log('\n✓ All tests passed! 🎉\n');
    process.exit(0);
  } else {
    console.log(`\n✗ ${failedTests} test suite(s) failed\n`);
    process.exit(1);
  }
}

// Run all tests
runAllTests().catch(error => {
  console.error('\n✗ Test runner failed:', error);
  process.exit(1);
});
