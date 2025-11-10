/**
 * Database Test Helper
 * Provides Prisma client and cleanup utilities for tests
 */

const { PrismaClient } = require('../../generated/prisma');

// Singleton Prisma client for tests
const prisma = new PrismaClient();

/**
 * Clean up test data (delete specific user and related data)
 * @param {number} userId - User ID to clean up
 */
async function cleanupUser(userId) {
  try {
    await prisma.user.delete({
      where: { id: userId }
    });
    console.log(`✓ Cleaned up user ${userId}`);
  } catch (error) {
    // User might not exist, that's okay
    if (!error.message.includes('Record to delete does not exist')) {
      console.error(`Error cleaning up user ${userId}:`, error.message);
    }
  }
}

/**
 * Clean up test data by email
 * @param {string} email - User email to clean up
 */
async function cleanupUserByEmail(email) {
  try {
    await prisma.user.delete({
      where: { email }
    });
    console.log(`✓ Cleaned up user with email ${email}`);
  } catch (error) {
    // User might not exist, that's okay
    if (!error.message.includes('Record to delete does not exist')) {
      console.error(`Error cleaning up user ${email}:`, error.message);
    }
  }
}

/**
 * Disconnect Prisma client
 */
async function disconnect() {
  await prisma.$disconnect();
}

module.exports = {
  prisma,
  cleanupUser,
  cleanupUserByEmail,
  disconnect
};
