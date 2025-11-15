/**
 * Payment Model
 * Prisma-based payment operations
 * Handles payment record creation, updates, and queries
 */

const { getPrismaClient } = require('../db/prisma');
const prisma = getPrismaClient();

class Payment {
  /**
   * Create a new payment record
   * @param {Object} data - Payment data
   * @param {number} data.userId - User ID
   * @param {number} data.amount - Amount in cents
   * @param {string} data.currency - Currency code (e.g., 'USD')
   * @param {number} data.creditsAwarded - Credits to be awarded
   * @param {string} data.paymentGateway - Payment gateway name (e.g., 'stripe')
   * @param {string} data.gatewaySessionId - Checkout session ID from gateway
   * @param {Object} data.metadata - Additional metadata
   * @returns {Promise<Object>} Created payment object
   */
  async create(data) {
    try {
      const payment = await prisma.payment.create({
        data: {
          userId: data.userId,
          amount: data.amount,
          currency: data.currency.toUpperCase(),
          creditsAwarded: data.creditsAwarded,
          paymentGateway: data.paymentGateway.toLowerCase(),
          gatewaySessionId: data.gatewaySessionId,
          gatewayPaymentId: data.gatewayPaymentId || null,
          status: 'PENDING',
          metadata: data.metadata || {},
        },
      });
      console.log(`✅ Payment record created: ${payment.id}`);
      return payment;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  /**
   * Update payment status and details
   * @param {number} id - Payment ID
   * @param {Object} data - Update data
   * @param {string} data.status - Payment status ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')
   * @param {string} data.gatewayPaymentId - Payment intent ID from gateway
   * @param {Object} data.metadata - Additional metadata
   * @returns {Promise<Object>} Updated payment object
   */
  async updateStatus(id, data) {
    try {
      const updateData = {
        status: data.status,
      };

      if (data.gatewayPaymentId) {
        updateData.gatewayPaymentId = data.gatewayPaymentId;
      }

      if (data.metadata) {
        updateData.metadata = data.metadata;
      }

      const payment = await prisma.payment.update({
        where: { id },
        data: updateData,
      });

      console.log(`✅ Payment ${id} status updated to: ${data.status}`);
      return payment;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  /**
   * Find payment by ID
   * @param {number} id - Payment ID
   * @returns {Promise<Object|null>} Payment object or null
   */
  async findById(id) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
      return payment;
    } catch (error) {
      console.error('Error finding payment:', error);
      throw error;
    }
  }

  /**
   * Find payment by gateway session ID
   * @param {string} gatewaySessionId - Checkout session ID
   * @returns {Promise<Object|null>} Payment object or null
   */
  async findBySessionId(gatewaySessionId) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { gatewaySessionId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
      return payment;
    } catch (error) {
      console.error('Error finding payment by session ID:', error);
      throw error;
    }
  }

  /**
   * Find payment by gateway payment ID
   * @param {string} gatewayPaymentId - Payment intent ID
   * @returns {Promise<Object|null>} Payment object or null
   */
  async findByPaymentId(gatewayPaymentId) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { gatewayPaymentId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
      return payment;
    } catch (error) {
      console.error('Error finding payment by payment ID:', error);
      throw error;
    }
  }

  /**
   * Get all payments for a user
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of records to return
   * @param {number} options.offset - Number of records to skip
   * @param {string} options.status - Filter by status
   * @returns {Promise<Array>} Array of payment objects
   */
  async findByUserId(userId, options = {}) {
    try {
      const { limit = 50, offset = 0, status } = options;

      const where = { userId };
      if (status) {
        where.status = status;
      }

      const payments = await prisma.payment.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      });

      return payments;
    } catch (error) {
      console.error('Error finding payments by user:', error);
      throw error;
    }
  }

  /**
   * Complete payment and add credits atomically
   * This is a critical operation that must be atomic to prevent duplicate credits
   * @param {string} gatewaySessionId - Checkout session ID
   * @param {string} gatewayPaymentId - Payment intent ID
   * @returns {Promise<Object>} Result with payment and wallet data
   */
  async completePayment(gatewaySessionId, gatewayPaymentId) {
    try {
      console.log(`Processing payment completion for session: ${gatewaySessionId}`);

      // Use Prisma transaction to ensure atomicity
      const result = await prisma.$transaction(async (tx) => {
        // 1. Find and update payment record
        const payment = await tx.payment.findUnique({
          where: { gatewaySessionId },
        });

        if (!payment) {
          throw new Error(`Payment not found for session: ${gatewaySessionId}`);
        }

        // Check if payment was already completed (prevent duplicate credit awards)
        if (payment.status === 'COMPLETED') {
          console.warn(`⚠️  Payment ${payment.id} was already completed. Skipping.`);
          return {
            payment,
            wallet: null,
            alreadyCompleted: true,
          };
        }

        // 2. Update payment status to COMPLETED
        const updatedPayment = await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            gatewayPaymentId: gatewayPaymentId,
          },
        });

        // 3. Add credits to wallet
        const updatedWallet = await tx.wallet.update({
          where: { userId: payment.userId },
          data: {
            currentBalance: { increment: payment.creditsAwarded },
          },
        });

        console.log(`✅ Payment ${payment.id} completed. Added ${payment.creditsAwarded} credits to user ${payment.userId}`);

        return {
          payment: updatedPayment,
          wallet: updatedWallet,
          alreadyCompleted: false,
        };
      });

      return result;
    } catch (error) {
      console.error('Error completing payment:', error);
      throw error;
    }
  }

  /**
   * Mark payment as failed
   * @param {string} gatewaySessionId - Checkout session ID
   * @param {Object} errorDetails - Error details from payment gateway
   * @returns {Promise<Object>} Updated payment object
   */
  async markAsFailed(gatewaySessionId, errorDetails = {}) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { gatewaySessionId },
      });

      if (!payment) {
        throw new Error(`Payment not found for session: ${gatewaySessionId}`);
      }

      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          metadata: {
            ...payment.metadata,
            errorDetails,
            failedAt: new Date().toISOString(),
          },
        },
      });

      console.log(`❌ Payment ${payment.id} marked as failed`);
      return updatedPayment;
    } catch (error) {
      console.error('Error marking payment as failed:', error);
      throw error;
    }
  }

  /**
   * Get payment statistics for a user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Payment statistics
   */
  async getUserStats(userId) {
    try {
      const stats = await prisma.payment.aggregate({
        where: {
          userId,
          status: 'COMPLETED',
        },
        _sum: {
          amount: true,
          creditsAwarded: true,
        },
        _count: {
          id: true,
        },
      });

      return {
        totalPayments: stats._count.id || 0,
        totalAmountSpent: stats._sum.amount || 0,
        totalCreditsPurchased: stats._sum.creditsAwarded || 0,
      };
    } catch (error) {
      console.error('Error getting user payment stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new Payment();
