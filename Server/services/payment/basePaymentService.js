const config = require('../../config');

/**
 * Base Payment Service
 * Abstract base class for all payment gateway integrations
 * Provides common functionality: validation, logging, error handling, response normalization
 *
 * This abstraction allows easy switching between payment providers (Stripe, Razorpay, PayPal, etc.)
 */
class BasePaymentService {
  constructor(providerName, providerConfig) {
    if (this.constructor === BasePaymentService) {
      throw new Error('BasePaymentService is abstract and cannot be instantiated directly');
    }

    this.providerName = providerName;
    this.providerConfig = providerConfig;
    this.enableLogging = config.NODE_ENV === 'development';
  }

  /**
   * Abstract method - Create a checkout session
   * Must be implemented by child classes
   * @param {Object} params - Checkout session parameters
   * @param {Number} params.amount - Amount in cents
   * @param {String} params.currency - Currency code (e.g., 'usd')
   * @param {Number} params.userId - User ID
   * @param {Number} params.creditsAwarded - Credits to award on success
   * @param {String} params.successUrl - Redirect URL on success
   * @param {String} params.cancelUrl - Redirect URL on cancel
   * @returns {Promise<Object>} - Normalized checkout session response
   */
  async createCheckoutSession(params) {
    throw new Error('createCheckoutSession() must be implemented by child class');
  }

  /**
   * Abstract method - Verify webhook signature
   * Must be implemented by child classes
   * @param {String} payload - Raw request body
   * @param {String} signature - Webhook signature header
   * @param {String} secret - Webhook secret
   * @returns {Object} - Verified event object
   */
  verifyWebhookSignature(payload, signature, secret) {
    throw new Error('verifyWebhookSignature() must be implemented by child class');
  }

  /**
   * Abstract method - Handle webhook event
   * Must be implemented by child classes
   * @param {Object} event - Webhook event object
   * @returns {Promise<Object>} - Processing result
   */
  async handleWebhookEvent(event) {
    throw new Error('handleWebhookEvent() must be implemented by child class');
  }

  /**
   * Abstract method - Retrieve payment details
   * Must be implemented by child classes
   * @param {String} paymentId - Payment ID from provider
   * @returns {Promise<Object>} - Payment details
   */
  async getPaymentDetails(paymentId) {
    throw new Error('getPaymentDetails() must be implemented by child class');
  }

  /**
   * Validate checkout session parameters
   * @param {Object} params - Parameters to validate
   * @throws {Error} - If validation fails
   */
  validateCheckoutParams(params) {
    const requiredFields = ['amount', 'currency', 'userId', 'creditsAwarded', 'successUrl', 'cancelUrl'];

    if (!params || typeof params !== 'object') {
      throw new Error('Invalid parameters: params must be an object');
    }

    const missingFields = requiredFields.filter(field => {
      return params[field] === undefined || params[field] === null || params[field] === '';
    });

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate amount is positive
    if (typeof params.amount !== 'number' || params.amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    // Validate credits is positive integer
    if (typeof params.creditsAwarded !== 'number' || params.creditsAwarded <= 0 || !Number.isInteger(params.creditsAwarded)) {
      throw new Error('creditsAwarded must be a positive integer');
    }

    // Validate URLs
    if (!this.isValidUrl(params.successUrl) || !this.isValidUrl(params.cancelUrl)) {
      throw new Error('successUrl and cancelUrl must be valid URLs');
    }

    this.log('info', 'Checkout parameters validation passed');
  }

  /**
   * Validate URL format
   * @param {String} url - URL to validate
   * @returns {Boolean} - True if valid
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Normalize checkout session response
   * @param {Object} rawResponse - Raw provider response
   * @returns {Object} - Normalized response
   */
  normalizeCheckoutResponse(rawResponse) {
    const normalized = {
      success: true,
      provider: this.providerName,
      timestamp: new Date().toISOString(),
      data: rawResponse,
    };

    this.log('info', 'Checkout response normalized');
    return normalized;
  }

  /**
   * Normalize error response
   * @param {Error} error - Error object
   * @returns {Object} - Normalized error response
   */
  normalizeError(error) {
    const normalized = {
      success: false,
      provider: this.providerName,
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
        type: error.type || 'general_error',
      },
    };

    // Add provider-specific error details if available
    if (error.raw) {
      normalized.error.raw = error.raw;
    }

    this.log('error', `Error normalized: ${error.message}`);
    return normalized;
  }

  /**
   * Logger utility
   * @param {String} level - Log level (info, success, error, warn)
   * @param {String} message - Log message
   */
  log(level, message) {
    if (!this.enableLogging) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.providerName.toUpperCase()} PAYMENT]`;

    switch (level) {
      case 'error':
        console.error(`${prefix} ❌ ${message}`);
        break;
      case 'success':
        console.log(`${prefix} ✅ ${message}`);
        break;
      case 'warn':
        console.warn(`${prefix} ⚠️  ${message}`);
        break;
      case 'info':
      default:
        console.log(`${prefix} ℹ️  ${message}`);
    }
  }

  /**
   * Sleep utility for delays
   * @param {Number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = BasePaymentService;
