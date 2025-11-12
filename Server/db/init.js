const { execSync } = require('child_process');
const { getPrismaClient } = require('./prisma');

/**
 * Initialize database connection and ensure schema is up to date
 * This function will:
 * 1. Test the database connection
 * 2. Run pending migrations to ensure tables exist
 * 3. Exit the process if initialization fails
 */
async function initializeDatabase() {
  const prisma = getPrismaClient();

  try {
    console.log('Checking database connection...');

    // Test database connection
    await prisma.$connect();
    console.log('Database connection successful');

    // Run migrations to ensure tables exist
    console.log('Running database migrations...');
    try {
      execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        cwd: __dirname + '/..',
      });
      console.log('Database migrations completed successfully');
    } catch (migrationError) {
      console.error('Migration failed:', migrationError.message);
      throw new Error('Failed to run database migrations');
    }

    // Verify connection works by running a simple query
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database initialization completed successfully');

    return true;
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    console.error('Server cannot start without a database connection');

    // Attempt to disconnect before exiting
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting Prisma:', disconnectError.message);
    }

    // Exit the process with error code
    process.exit(1);
  }
}

module.exports = { initializeDatabase };
