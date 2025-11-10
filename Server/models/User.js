/**
 * User Model
 * Prisma-based user operations
 */

const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

class User {
  /**
   * Find user by ID with wallet relation
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} User object with wallet or null
   */
  async findById(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { wallet: true }
      });
      return user;
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  async findByEmail(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { wallet: true }
      });
      return user;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Find user by Google ID
   * @param {string} googleId - Google OAuth ID
   * @returns {Promise<Object|null>} User object or null
   */
  async findByGoogleId(googleId) {
    try {
      const user = await prisma.user.findUnique({
        where: { googleId },
        include: { wallet: true }
      });
      return user;
    } catch (error) {
      console.error('Error finding user by Google ID:', error);
      throw error;
    }
  }

  /**
   * Create a new user with wallet (atomic transaction)
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user object with wallet
   */
  async create(userData) {
    try {
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name || null,
          phone: userData.phone || null,
          image: userData.image || null,
          googleId: userData.googleId || null,
          accessToken: userData.accessToken || null,
          refreshToken: userData.refreshToken || null,
          wallet: {
            create: {
              currentBalance: userData.initialCredits || 100,
              totalCreditsUsed: 0
            }
          }
        },
        include: { wallet: true }
      });
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {number} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user object
   */
  async update(userId, updateData) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        include: { wallet: true }
      });
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete user (cascades to wallet and video logs)
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Deleted user object
   */
  async delete(userId) {
    try {
      const user = await prisma.user.delete({
        where: { id: userId }
      });
      return user;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new User();
