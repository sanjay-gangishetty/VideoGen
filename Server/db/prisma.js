const { PrismaClient } = require('../generated/prisma');

let prisma;

/**
 * Get the singleton PrismaClient instance
 * This ensures we only have one Prisma client instance across the entire application
 * which is important for connection pooling and resource management
 */
function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prisma;
}

/**
 * Disconnect the Prisma client
 * Should be called during graceful shutdown
 */
async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
    console.log('Prisma client disconnected');
  }
}

module.exports = {
  getPrismaClient,
  disconnectPrisma,
};
