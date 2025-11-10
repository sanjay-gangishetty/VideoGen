/**
 * Credit Controller
 *
 * Handles all credit-related operations including balance queries,
 * credit additions, deductions, and transaction history.
 *
 * NOTE: This controller uses mock user data until authentication is implemented.
 * When auth is added, req.user will be populated by authentication middleware.
 */

const User = require('../models/User');
const Transaction = require('../models/Transaction');

class CreditController {
  /**
   * Get current user's credit balance
   * @route GET /api/credits
   * @access Public (TODO: Add authentication middleware in next phase)
   */
  async getUserCredits(req, res) {
    try {
      // TODO: Replace with req.user.id when authentication is implemented
      const userId = req.userId || 'user123';

      console.log(`💰 Getting credit balance for user: ${userId}`);

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'Unable to find user account'
        });
      }

      console.log(`✅ Credit balance retrieved: ${user.credits} credits`);

      res.status(200).json({
        success: true,
        data: {
          userId: user.id,
          credits: user.credits,
          email: user.email,
          lastUpdated: user.updatedAt
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
      const userId = req.userId || 'user123';
      const { amount, reason } = req.body;

      console.log(`➖ Deducting ${amount} credits for user: ${userId} - Reason: ${reason}`);

      // Get current user
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'Unable to find user account'
        });
      }

      // Check if user has sufficient credits
      if (user.credits < amount) {
        console.log(`⚠️  Insufficient credits - Required: ${amount}, Available: ${user.credits}`);
        return res.status(402).json({
          success: false,
          error: 'Insufficient credits',
          message: `This operation requires ${amount} credits, but you only have ${user.credits} credits`,
          data: {
            required: amount,
            available: user.credits,
            shortage: amount - user.credits
          }
        });
      }

      // Calculate new balance
      const newBalance = user.credits - amount;

      // Update user credits
      await User.updateCredits(userId, newBalance);

      // Create transaction record
      const transaction = await Transaction.create({
        userId,
        type: 'debit',
        amount,
        reason,
        balanceAfter: newBalance
      });

      console.log(`✅ Credits deducted successfully - New balance: ${newBalance}`);

      res.status(200).json({
        success: true,
        message: 'Credits deducted successfully',
        data: {
          transactionId: transaction.id,
          previousBalance: user.credits,
          amountDeducted: amount,
          newBalance: newBalance,
          reason: reason,
          timestamp: transaction.timestamp
        }
      });
    } catch (error) {
      console.error('❌ Error deducting credits:', error);
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
      const userId = req.userId || 'user123';
      const { amount, reason } = req.body;

      console.log(`➕ Adding ${amount} credits for user: ${userId} - Reason: ${reason}`);

      // Get current user
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'Unable to find user account'
        });
      }

      // Calculate new balance
      const newBalance = user.credits + amount;

      // Update user credits
      await User.updateCredits(userId, newBalance);

      // Create transaction record
      const transaction = await Transaction.create({
        userId,
        type: 'credit',
        amount,
        reason,
        balanceAfter: newBalance
      });

      console.log(`✅ Credits added successfully - New balance: ${newBalance}`);

      res.status(200).json({
        success: true,
        message: 'Credits added successfully',
        data: {
          transactionId: transaction.id,
          previousBalance: user.credits,
          amountAdded: amount,
          newBalance: newBalance,
          reason: reason,
          timestamp: transaction.timestamp
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

  /**
   * Get credit transaction history
   * @route GET /api/credits/history
   * @access Public (TODO: Add authentication middleware in next phase)
   */
  async getCreditHistory(req, res) {
    try {
      // TODO: Replace with req.user.id when authentication is implemented
      const userId = req.userId || 'user123';
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      console.log(`📊 Getting credit history for user: ${userId} (limit: ${limit}, offset: ${offset})`);

      // Get transactions
      const transactions = await Transaction.findByUserId(userId, { limit, offset });
      const totalCount = await Transaction.countByUserId(userId);

      console.log(`✅ Retrieved ${transactions.length} transactions (total: ${totalCount})`);

      res.status(200).json({
        success: true,
        data: {
          transactions,
          pagination: {
            total: totalCount,
            limit,
            offset,
            hasMore: offset + transactions.length < totalCount
          }
        }
      });
    } catch (error) {
      console.error('❌ Error getting credit history:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to retrieve credit history'
      });
    }
  }
}

// Export singleton instance
module.exports = new CreditController();
