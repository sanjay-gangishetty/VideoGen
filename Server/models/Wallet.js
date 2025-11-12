/**
 * Wallet Model
 * Prisma-based wallet/credit operations
 */

const { getPrismaClient } = require('../db/prisma');
const prisma = getPrismaClient();

class Wallet {
  /**
   * Find wallet by user ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} Wallet object or null
   */
  async findByUserId(userId) {
    try {
      const wallet = await prisma.wallet.findUnique({
        where: { userId }
      });
      return wallet;
    } catch (error) {
      console.error('Error finding wallet:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance
   * @param {number} userId - User ID
   * @returns {Promise<number>} Current balance
   */
  async getBalance(userId) {
    try {
      const wallet = await this.findByUserId(userId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      return wallet.currentBalance;
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  /**
   * Deduct credits from wallet (atomic operation)
   * @param {number} userId - User ID
   * @param {number} amount - Amount to deduct
   * @returns {Promise<Object>} Updated wallet with previous balance
   */
  async deductCredits(userId, amount) {
    try {
      // Get current balance first
      const currentWallet = await this.findByUserId(userId);
      if (!currentWallet) {
        throw new Error('Wallet not found');
      }

      // Check sufficient balance
      if (currentWallet.currentBalance < amount) {
        throw new Error('Insufficient credits');
      }

      const previousBalance = currentWallet.currentBalance;

      // Update wallet atomically
      const wallet = await prisma.wallet.update({
        where: { userId },
        data: {
          currentBalance: { decrement: amount },
          totalCreditsUsed: { increment: amount }
        }
      });

      return {
        ...wallet,
        previousBalance
      };
    } catch (error) {
      console.error('Error deducting credits:', error);
      throw error;
    }
  }

  /**
   * Add credits to wallet
   * @param {number} userId - User ID
   * @param {number} amount - Amount to add
   * @returns {Promise<Object>} Updated wallet with previous balance
   */
  async addCredits(userId, amount) {
    try {
      // Get current balance first
      const currentWallet = await this.findByUserId(userId);
      if (!currentWallet) {
        throw new Error('Wallet not found');
      }

      const previousBalance = currentWallet.currentBalance;

      // Update wallet atomically
      const wallet = await prisma.wallet.update({
        where: { userId },
        data: {
          currentBalance: { increment: amount }
        }
      });

      return {
        ...wallet,
        previousBalance
      };
    } catch (error) {
      console.error('Error adding credits:', error);
      throw error;
    }
  }

  /**
   * Update wallet balance directly (use with caution)
   * @param {number} userId - User ID
   * @param {number} newBalance - New balance
   * @returns {Promise<Object>} Updated wallet
   */
  async updateBalance(userId, newBalance) {
    try {
      const wallet = await prisma.wallet.update({
        where: { userId },
        data: { currentBalance: newBalance }
      });
      return wallet;
    } catch (error) {
      console.error('Error updating balance:', error);
      throw error;
    }
  }

  /**
   * Reset wallet (for testing purposes)
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Reset wallet
   */
  async reset(userId) {
    try {
      const wallet = await prisma.wallet.update({
        where: { userId },
        data: {
          currentBalance: 100,
          totalCreditsUsed: 0
        }
      });
      return wallet;
    } catch (error) {
      console.error('Error resetting wallet:', error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new Wallet();
