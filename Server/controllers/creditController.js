/**
 * Credit Controller
 *
 * Handles all credit-related operations including balance queries,
 * credit additions, and deductions using Prisma ORM.
 *
 * NOTE: This controller uses hardcoded user ID until authentication is implemented.
 * When auth is added, req.user will be populated by authentication middleware.
 */

const User = require('../models/User');
const Wallet = require('../models/Wallet');

class CreditController {
  /**
   * Get current user's credit balance
   * @route GET /api/credits
   * @access Public (TODO: Add authentication middleware in next phase)
   */
  async getUserCredits(req, res) {
    try {
      // TODO: Replace with req.user.id when authentication is implemented
      const userId = parseInt(req.userId) || 1;

      console.log(`💰 Getting credit balance for user: ${userId}`);

      const user = await User.findById(userId);

      if (!user || !user.wallet) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'Unable to find user account or wallet'
        });
      }

      console.log(`✅ Credit balance retrieved: ${user.wallet.currentBalance} credits`);

      res.status(200).json({
        success: true,
        data: {
          userId: user.id,
          credits: user.wallet.currentBalance,
          totalCreditsUsed: user.wallet.totalCreditsUsed,
          email: user.email,
          lastUpdated: user.wallet.updatedAt
        }
      });
    } catch (error) {
      console.error('❌ Error getting user credits:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to retrieve credit balance'
      });
    }
  }

  /**
   * Deduct credits from user account
   * @route POST /api/credits/deduct
   * @access Public (TODO: Add authentication middleware in next phase)
   */
  async deductCredits(req, res) {
    try {
      // TODO: Replace with req.user.id when authentication is implemented
      const userId = parseInt(req.userId) || 1;
      const { amount, reason } = req.body;

      console.log(`➖ Deducting ${amount} credits for user: ${userId} - Reason: ${reason}`);

      // Deduct credits using Wallet model (handles validation atomically)
      const result = await Wallet.deductCredits(userId, amount);

      console.log(`✅ Credits deducted successfully - New balance: ${result.currentBalance}`);

      res.status(200).json({
        success: true,
        message: 'Credits deducted successfully',
        data: {
          previousBalance: result.previousBalance,
          amountDeducted: amount,
          newBalance: result.currentBalance,
          totalCreditsUsed: result.totalCreditsUsed,
          reason: reason,
          timestamp: result.updatedAt
        }
      });
    } catch (error) {
      console.error('❌ Error deducting credits:', error);

      // Handle insufficient credits error
      if (error.message === 'Insufficient credits') {
        const wallet = await Wallet.findByUserId(userId);
        return res.status(402).json({
          success: false,
          error: 'Insufficient credits',
          message: `This operation requires ${amount} credits, but you only have ${wallet?.currentBalance || 0} credits`,
          data: {
            required: amount,
            available: wallet?.currentBalance || 0,
            shortage: amount - (wallet?.currentBalance || 0)
          }
        });
      }

      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to deduct credits'
      });
    }
  }

  /**
   * Add credits to user account
   * @route POST /api/credits/add
   * @access Public (TODO: Add authentication middleware in next phase)
   */
  async addCredits(req, res) {
    try {
      // TODO: Replace with req.user.id when authentication is implemented
      const userId = parseInt(req.userId) || 1;
      const { amount, reason } = req.body;

      console.log(`➕ Adding ${amount} credits for user: ${userId} - Reason: ${reason}`);

      // Add credits using Wallet model
      const result = await Wallet.addCredits(userId, amount);

      console.log(`✅ Credits added successfully - New balance: ${result.currentBalance}`);

      res.status(200).json({
        success: true,
        message: 'Credits added successfully',
        data: {
          previousBalance: result.previousBalance,
          amountAdded: amount,
          newBalance: result.currentBalance,
          totalCreditsUsed: result.totalCreditsUsed,
          reason: reason,
          timestamp: result.updatedAt
        }
      });
    } catch (error) {
      console.error('❌ Error adding credits:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to add credits'
      });
    }
  }
}

// Export singleton instance
module.exports = new CreditController();
