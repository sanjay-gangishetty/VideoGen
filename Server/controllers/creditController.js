/**
 * Credit Controller
 *
 * Handles all credit-related operations including balance queries,
 * credit additions, and deductions using Prisma ORM.
 *
 * NOTE: req.user is populated by authentication middleware.
 * In TEST_MODE, a default user (id=1) is used for unauthenticated requests.
 */

const User = require('../models/User');
const Wallet = require('../models/Wallet');

class CreditController {
  /**
   * Get current user's credit balance
   * @route GET /api/credits
   * @access Private (Requires authentication, respects TEST_MODE)
   */
  async getUserCredits(req, res) {
    try {
      const userId = req.user.id;

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
   * @access Private (Requires authentication, respects TEST_MODE)
   */
  async deductCredits(req, res) {
    try {
      const userId = req.user.id;
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
   * @access Private (Requires authentication, respects TEST_MODE)
   */
  async addCredits(req, res) {
    try {
      const userId = req.user.id;
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
