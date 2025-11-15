const StripePaymentService = require('./stripePaymentService');

/**
 * Payment Factory
 * Factory class for creating payment gateway service instances
 * Supports multiple payment providers (Stripe, Razorpay, PayPal, etc.)
 *
 * This factory pattern allows easy switching between payment providers
 * without changing the controller or business logic code.
 */
class PaymentFactory {
  /**
   * Service registry mapping provider names to their implementations
   */
  static providers = {
    stripe: StripePaymentService,
    // Future providers can be easily added here:
    // razorpay: RazorpayPaymentService,
    // paypal: PayPalPaymentService,
    // square: SquarePaymentService,
  };

  /**
   * Create a payment service instance
   * @param {String} providerName - Name of the provider ('stripe', 'razorpay', etc.)
   * @returns {BasePaymentService} - Payment service instance
   * @throws {Error} - If provider is not supported
   */
  static createService(providerName) {
    if (!providerName || typeof providerName !== 'string') {
      throw new Error('Provider name is required and must be a string');
    }

    // Normalize provider name to lowercase
    const normalizedName = providerName.toLowerCase().trim();

    // Check if provider exists in registry
    const ServiceClass = this.providers[normalizedName];

    if (!ServiceClass) {
      const availableProviders = Object.keys(this.providers).join(', ');
      throw new Error(
        `Unsupported payment provider: '${providerName}'. Available providers: ${availableProviders}`
      );
    }

    // Create and return service instance
    console.log(`✅ Creating ${normalizedName} payment service instance`);
    return new ServiceClass();
  }

  /**
   * Get list of all available payment providers
   * @returns {Array<String>} - Array of available provider names
   */
  static getAvailableProviders() {
    return Object.keys(this.providers);
  }

  /**
   * Check if a payment provider is supported
   * @param {String} providerName - Name of the provider
   * @returns {Boolean} - True if provider is supported
   */
  static isProviderSupported(providerName) {
    if (!providerName) return false;
    const normalizedName = providerName.toLowerCase().trim();
    return normalizedName in this.providers;
  }

  /**
   * Register a new payment provider
   * Allows dynamic registration of new payment providers
   * @param {String} providerName - Name of the provider
   * @param {Class} ServiceClass - Service class (must extend BasePaymentService)
   */
  static registerProvider(providerName, ServiceClass) {
    if (!providerName || typeof providerName !== 'string') {
      throw new Error('Provider name is required and must be a string');
    }

    if (!ServiceClass || typeof ServiceClass !== 'function') {
      throw new Error('Service class is required and must be a constructor function');
    }

    const normalizedName = providerName.toLowerCase().trim();

    // Check if provider already exists
    if (normalizedName in this.providers) {
      console.warn(`⚠️  Provider '${normalizedName}' is already registered. Overwriting...`);
    }

    this.providers[normalizedName] = ServiceClass;
    console.log(`✅ Registered new payment provider: ${normalizedName}`);
  }

  /**
   * Unregister a payment provider
   * @param {String} providerName - Name of the provider to remove
   * @returns {Boolean} - True if provider was removed
   */
  static unregisterProvider(providerName) {
    if (!providerName) return false;

    const normalizedName = providerName.toLowerCase().trim();

    if (normalizedName in this.providers) {
      delete this.providers[normalizedName];
      console.log(`✅ Unregistered payment provider: ${normalizedName}`);
      return true;
    }

    return false;
  }

  /**
   * Get provider information
   * @param {String} providerName - Name of the provider
   * @returns {Object} - Provider metadata
   */
  static getProviderInfo(providerName) {
    if (!providerName) {
      throw new Error('Provider name is required');
    }

    const normalizedName = providerName.toLowerCase().trim();

    if (!this.isProviderSupported(normalizedName)) {
      throw new Error(`Provider '${providerName}' is not supported`);
    }

    const ServiceClass = this.providers[normalizedName];
    const instance = new ServiceClass();

    return {
      name: normalizedName,
      className: ServiceClass.name,
      providerName: instance.providerName,
    };
  }

  /**
   * Create service with validation
   * Validates provider exists and returns instance with additional context
   * @param {String} providerName - Name of the provider
   * @returns {Object} - Object containing service instance and metadata
   */
  static createServiceWithContext(providerName) {
    const service = this.createService(providerName);
    const info = this.getProviderInfo(providerName);

    return {
      service,
      info,
      createdAt: new Date().toISOString(),
    };
  }
}

module.exports = PaymentFactory;
