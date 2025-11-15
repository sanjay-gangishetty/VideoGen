/**
 * Payment Controller
 *
 * Handles all payment-related operations including:
 * - Creating checkout sessions
 * - Processing webhook events
 * - Handling success/cancel callbacks
 *
 * Uses provider-agnostic payment services via PaymentFactory
 */

const PaymentFactory = require('../services/payment/paymentFactory');
const Payment = require('../models/Payment');
const config = require('../config');

class PaymentController {
  /**
   * Create a checkout session
   * @route POST /api/payment/checkout
   * @access Private (Requires authentication)
   */
  async createCheckoutSession(req, res) {
    try {
      const userId = req.user.id;
      const { credits } = req.body;

      console.log(`💳 Creating checkout session for user: ${userId}`);

      // Validate credits input
      if (!credits || typeof credits !== 'number' || credits <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid credits amount',
          message: 'Credits must be a positive number',
        });
      }

      // Calculate amount based on credits (1 credit = $0.01, so 100 credits = $1)
      const PRICE_PER_CREDIT = 0.01;
      const amountInDollars = credits * PRICE_PER_CREDIT;
      const amountInCents = Math.round(amountInDollars * 100);

      // Validate amount doesn't exceed $1000 limit
      const MAX_PAYMENT_AMOUNT = 1000;
      if (amountInDollars > MAX_PAYMENT_AMOUNT) {
        return res.status(400).json({
          success: false,
          error: 'Payment amount exceeds limit',
          message: `Maximum payment amount is $${MAX_PAYMENT_AMOUNT}`,
        });
      }

      console.log(`💰 Credits: ${credits}, Amount: $${amountInDollars} (${amountInCents} cents)`);

      // Create payment service instance (default provider from config)
      const paymentService = PaymentFactory.createService(config.PAYMENT.DEFAULT_PROVIDER);

      // Prepare checkout parameters with custom amount
      const checkoutParams = {
        amount: amountInCents,
        currency: 'usd',
        userId: userId,
        creditsAwarded: credits,
        successUrl: `${config.PAYMENT.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: config.PAYMENT.CANCEL_URL,
      };

      // Create checkout session with payment provider
      const sessionResponse = await paymentService.createCheckoutSession(checkoutParams);

      // Create payment record in database
      const payment = await Payment.create({
        userId: userId,
        amount: amountInDollars, // Store in dollars for DB
        currency: 'usd',
        creditsAwarded: credits,
        paymentGateway: config.PAYMENT.DEFAULT_PROVIDER,
        gatewaySessionId: sessionResponse.data.sessionId,
        metadata: {
          packageType: 'custom',
          description: `${credits} credits for $${amountInDollars.toFixed(2)}`,
        },
      });

      console.log(`✅ Checkout session created: ${sessionResponse.data.sessionId}`);

      res.status(200).json({
        success: true,
        message: 'Checkout session created successfully',
        data: {
          sessionId: sessionResponse.data.sessionId,
          url: sessionResponse.data.url,
          paymentId: payment.id,
          amount: amountInCents,
          currency: 'usd',
          creditsAwarded: credits,
        },
      });
    } catch (error) {
      console.error('❌ Error creating checkout session:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to create checkout session',
      });
    }
  }

  /**
   * Handle successful payment callback
   * @route GET /api/payment/success
   * @access Private (Requires authentication)
   */
  async handleSuccess(req, res) {
    try {
      const userId = req.user.id;
      const sessionId = req.query.session_id;

      console.log(`✅ Payment success callback - User: ${userId}, Session: ${sessionId}`);

      // Find payment record
      const payment = await Payment.findBySessionId(sessionId);

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found',
          message: 'Unable to find payment record',
        });
      }

      // Verify payment belongs to current user
      if (payment.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized',
          message: 'This payment does not belong to you',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Payment completed successfully',
        data: {
          paymentId: payment.id,
          status: payment.status,
          creditsAwarded: payment.creditsAwarded,
          amount: payment.amount,
          currency: payment.currency,
        },
      });
    } catch (error) {
      console.error('❌ Error handling payment success:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to process payment success',
      });
    }
  }

  /**
   * Handle cancelled payment callback
   * @route GET /api/payment/cancel
   * @access Private (Requires authentication)
   */
  async handleCancel(req, res) {
    try {
      const userId = req.user.id;

      console.log(`❌ Payment cancelled by user: ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Payment was cancelled',
        data: {
          cancelled: true,
        },
      });
    } catch (error) {
      console.error('❌ Error handling payment cancel:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to process payment cancellation',
      });
    }
  }

  /**
   * Handle webhook events from payment provider
   * @route POST /api/payment/webhook
   * @access Public (Verified by signature)
   */
  async handleWebhook(req, res) {
    try {
      console.log(`🔔 Webhook received from payment provider`);

      // Get raw body and signature
      const signature = req.headers['stripe-signature'];
      const payload = req.rawBody; // Raw body is required for signature verification

      if (!signature) {
        console.error('❌ Missing webhook signature');
        return res.status(400).json({
          success: false,
          error: 'Missing signature',
        });
      }

      // Create payment service instance
      const paymentService = PaymentFactory.createService(config.PAYMENT.DEFAULT_PROVIDER);

      // Verify webhook signature and get event
      const event = paymentService.verifyWebhookSignature(
        payload,
        signature,
        config.PAYMENT.STRIPE.WEBHOOK_SECRET
      );

      console.log(`✅ Webhook verified: ${event.type}`);

      // Handle the webhook event
      const result = await paymentService.handleWebhookEvent(event);

      // Process checkout session completion
      if (event.type === 'checkout.session.completed') {
        await this.processCheckoutCompletion(result.data);
      }

      // Process payment failure
      if (event.type === 'payment_intent.payment_failed') {
        await this.processPaymentFailure(result.data);
      }

      res.status(200).json({
        success: true,
        message: 'Webhook processed successfully',
      });
    } catch (error) {
      console.error('❌ Error handling webhook:', error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Process checkout session completion (internal method)
   * Atomically updates payment status and adds credits
   * @param {Object} data - Checkout completion data
   */
  async processCheckoutCompletion(data) {
    try {
      console.log(`🎉 Processing checkout completion for session: ${data.sessionId}`);

      // Complete payment and add credits atomically
      const result = await Payment.completePayment(
        data.sessionId,
        data.paymentIntentId
      );

      if (result.alreadyCompleted) {
        console.warn(`⚠️  Payment was already completed, skipped credit addition`);
        return;
      }

      console.log(`✅ Payment completed successfully!`);
      console.log(`   User ${data.userId} received ${data.creditsAwarded} credits`);
      console.log(`   New balance: ${result.wallet.currentBalance} credits`);
    } catch (error) {
      console.error('❌ Error processing checkout completion:', error);
      throw error;
    }
  }

  /**
   * Process payment failure (internal method)
   * Updates payment record to mark as failed
   * @param {Object} data - Payment failure data
   */
  async processPaymentFailure(data) {
    try {
      console.log(`❌ Processing payment failure for: ${data.paymentIntentId}`);

      // Find payment by payment intent ID
      const payment = await Payment.findByPaymentId(data.paymentIntentId);

      if (payment) {
        await Payment.markAsFailed(payment.gatewaySessionId, {
          error: data.lastPaymentError,
          failedAt: new Date().toISOString(),
        });

        console.log(`❌ Payment ${payment.id} marked as failed`);
      }
    } catch (error) {
      console.error('❌ Error processing payment failure:', error);
      throw error;
    }
  }

  /**
   * Get payment history for current user
   * @route GET /api/payment/history
   * @access Private (Requires authentication)
   */
  async getPaymentHistory(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 10, offset = 0, status } = req.query;

      console.log(`📋 Getting payment history for user: ${userId}`);

      const payments = await Payment.findByUserId(userId, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        status: status,
      });

      const stats = await Payment.getUserStats(userId);

      res.status(200).json({
        success: true,
        data: {
          payments: payments,
          stats: stats,
          pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset),
            total: payments.length,
          },
        },
      });
    } catch (error) {
      console.error('❌ Error getting payment history:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to retrieve payment history',
      });
    }
  }
}

// Export singleton instance
module.exports = new PaymentController();
