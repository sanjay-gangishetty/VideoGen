const Stripe = require('stripe');
const BasePaymentService = require('./basePaymentService');
const config = require('../../config');

/**
 * Stripe Payment Service
 * Concrete implementation of BasePaymentService for Stripe
 * Handles Stripe Checkout Sessions and webhook events
 */
class StripePaymentService extends BasePaymentService {
  constructor() {
    super('stripe', config.PAYMENT.STRIPE);

    // Initialize Stripe client
    if (!this.providerConfig.SECRET_KEY) {
      throw new Error('Stripe secret key is not configured');
    }

    this.stripe = new Stripe(this.providerConfig.SECRET_KEY, {
      apiVersion: '2024-11-20.acacia', // Use latest API version
    });

    this.log('info', 'Stripe payment service initialized');
  }

  /**
   * Create a Stripe Checkout Session
   * @param {Object} params - Checkout session parameters
   * @returns {Promise<Object>} - Normalized checkout session response
   */
  async createCheckoutSession(params) {
    try {
      // Validate input parameters
      this.validateCheckoutParams(params);

      this.log('info', `Creating checkout session for user ${params.userId}`);

      // Create Stripe checkout session
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: params.currency,
              product_data: {
                name: `${params.creditsAwarded} Credits`,
                description: `Purchase ${params.creditsAwarded} video generation credits`,
              },
              unit_amount: params.amount, // Amount in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        // Store metadata for webhook processing
        metadata: {
          userId: params.userId.toString(),
          creditsAwarded: params.creditsAwarded.toString(),
          paymentGateway: 'stripe',
        },
        // Optional: Enable customer creation for future saved payment methods
        // customer_creation: 'always',
      });

      this.log('success', `Checkout session created: ${session.id}`);

      return this.normalizeCheckoutResponse({
        sessionId: session.id,
        url: session.url,
        amount: params.amount,
        currency: params.currency,
        creditsAwarded: params.creditsAwarded,
      });
    } catch (error) {
      this.log('error', `Failed to create checkout session: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify Stripe webhook signature
   * @param {String|Buffer} payload - Raw request body
   * @param {String} signature - Stripe-Signature header value
   * @param {String} secret - Webhook signing secret
   * @returns {Object} - Verified Stripe event object
   * @throws {Error} - If signature verification fails
   */
  verifyWebhookSignature(payload, signature, secret) {
    try {
      this.log('info', 'Verifying webhook signature');

      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        secret
      );

      this.log('success', `Webhook signature verified: ${event.type}`);
      return event;
    } catch (error) {
      this.log('error', `Webhook signature verification failed: ${error.message}`);
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
  }

  /**
   * Handle Stripe webhook event
   * @param {Object} event - Verified Stripe event object
   * @returns {Promise<Object>} - Processing result
   */
  async handleWebhookEvent(event) {
    this.log('info', `Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        return await this.handleCheckoutSessionCompleted(event.data.object);

      case 'payment_intent.succeeded':
        return await this.handlePaymentIntentSucceeded(event.data.object);

      case 'payment_intent.payment_failed':
        return await this.handlePaymentIntentFailed(event.data.object);

      case 'charge.refunded':
        return await this.handleChargeRefunded(event.data.object);

      default:
        this.log('warn', `Unhandled event type: ${event.type}`);
        return {
          success: true,
          message: `Event type ${event.type} received but not processed`,
        };
    }
  }

  /**
   * Handle successful checkout session completion
   * @param {Object} session - Checkout session object
   * @returns {Promise<Object>} - Processing result
   */
  async handleCheckoutSessionCompleted(session) {
    this.log('info', `Checkout session completed: ${session.id}`);

    const metadata = session.metadata;
    const paymentIntentId = session.payment_intent;

    return {
      success: true,
      eventType: 'checkout.session.completed',
      data: {
        sessionId: session.id,
        paymentIntentId: paymentIntentId,
        userId: parseInt(metadata.userId),
        creditsAwarded: parseInt(metadata.creditsAwarded),
        amountTotal: session.amount_total,
        currency: session.currency,
        paymentStatus: session.payment_status,
        metadata: metadata,
      },
    };
  }

  /**
   * Handle successful payment intent
   * @param {Object} paymentIntent - Payment intent object
   * @returns {Promise<Object>} - Processing result
   */
  async handlePaymentIntentSucceeded(paymentIntent) {
    this.log('success', `Payment intent succeeded: ${paymentIntent.id}`);

    return {
      success: true,
      eventType: 'payment_intent.succeeded',
      data: {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
    };
  }

  /**
   * Handle failed payment intent
   * @param {Object} paymentIntent - Payment intent object
   * @returns {Promise<Object>} - Processing result
   */
  async handlePaymentIntentFailed(paymentIntent) {
    this.log('error', `Payment intent failed: ${paymentIntent.id}`);

    return {
      success: true,
      eventType: 'payment_intent.payment_failed',
      data: {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        lastPaymentError: paymentIntent.last_payment_error,
      },
    };
  }

  /**
   * Handle charge refund
   * @param {Object} charge - Charge object
   * @returns {Promise<Object>} - Processing result
   */
  async handleChargeRefunded(charge) {
    this.log('info', `Charge refunded: ${charge.id}`);

    return {
      success: true,
      eventType: 'charge.refunded',
      data: {
        chargeId: charge.id,
        paymentIntentId: charge.payment_intent,
        amount: charge.amount,
        amountRefunded: charge.amount_refunded,
        currency: charge.currency,
        refunded: charge.refunded,
      },
    };
  }

  /**
   * Retrieve payment details from Stripe
   * @param {String} paymentId - Payment Intent ID or Checkout Session ID
   * @returns {Promise<Object>} - Payment details
   */
  async getPaymentDetails(paymentId) {
    try {
      this.log('info', `Retrieving payment details for: ${paymentId}`);

      // Determine if it's a session ID or payment intent ID
      let details;
      if (paymentId.startsWith('cs_')) {
        // Checkout Session ID
        details = await this.stripe.checkout.sessions.retrieve(paymentId);
        this.log('success', `Retrieved checkout session: ${paymentId}`);
      } else if (paymentId.startsWith('pi_')) {
        // Payment Intent ID
        details = await this.stripe.paymentIntents.retrieve(paymentId);
        this.log('success', `Retrieved payment intent: ${paymentId}`);
      } else {
        throw new Error(`Unknown payment ID format: ${paymentId}`);
      }

      return details;
    } catch (error) {
      this.log('error', `Failed to retrieve payment details: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a refund for a payment
   * @param {String} paymentIntentId - Payment Intent ID
   * @param {Number} amount - Amount to refund in cents (optional, defaults to full refund)
   * @returns {Promise<Object>} - Refund details
   */
  async createRefund(paymentIntentId, amount = null) {
    try {
      this.log('info', `Creating refund for payment: ${paymentIntentId}`);

      const refundParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundParams.amount = amount;
      }

      const refund = await this.stripe.refunds.create(refundParams);

      this.log('success', `Refund created: ${refund.id}`);
      return refund;
    } catch (error) {
      this.log('error', `Failed to create refund: ${error.message}`);
      throw error;
    }
  }
}

module.exports = StripePaymentService;
