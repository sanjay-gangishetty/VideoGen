/**
 * User Model
 *
 * This is a placeholder model structure until database integration.
 * Replace the mock implementation with actual database queries when ready.
 */

class User {
  constructor() {
    // Mock in-memory user storage
    this.users = new Map([
      ['user123', {
        id: 'user123',
        email: 'test@example.com',
        credits: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      }]
    ]);
  }

  /**
   * Find user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  async findById(userId) {
    console.log('⚠️  DATABASE NOT IMPLEMENTED - Using mock user data');

    const user = this.users.get(userId);
    if (!user) {
      return null;
    }

    return { ...user }; // Return copy to prevent direct modification
  }

  /**
   * Update user credits
   * @param {string} userId - User ID
   * @param {number} newBalance - New credit balance
   * @returns {Promise<Object>} Updated user object
   */
  async updateCredits(userId, newBalance) {
    console.log('⚠️  DATABASE NOT IMPLEMENTED - Using mock user data');

    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.credits = newBalance;
    user.updatedAt = new Date();

    return { ...user };
  }

  /**
   * Create a new user (for future use)
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user object
   */
  async create(userData) {
    console.log('⚠️  DATABASE NOT IMPLEMENTED - Using mock user data');

    const newUser = {
      id: userData.id || `user${Date.now()}`,
      email: userData.email,
      credits: userData.credits || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.set(newUser.id, newUser);
    return { ...newUser };
  }
}

// Export singleton instance
module.exports = new User();
