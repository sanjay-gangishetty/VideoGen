const HeyGenService = require('./heygenService');
const Veo3Service = require('./veo3Service');

/**
 * Video Generation Factory
 * Factory class for creating video generation service instances
 * Supports multiple AI video generation providers
 */
class VideoGenerationFactory {
  /**
   * Service registry mapping service names to their implementations
   */
  static services = {
    heygen: HeyGenService,
    veo3: Veo3Service,
  };

  /**
   * Create a video generation service instance
   * @param {String} serviceName - Name of the service ('heygen', 'veo3')
   * @returns {BaseVideoService} - Service instance
   * @throws {Error} - If service is not supported
   */
  static createService(serviceName) {
    if (!serviceName || typeof serviceName !== 'string') {
      throw new Error('Service name is required and must be a string');
    }

    // Normalize service name to lowercase
    const normalizedName = serviceName.toLowerCase().trim();

    // Check if service exists in registry
    const ServiceClass = this.services[normalizedName];

    if (!ServiceClass) {
      const availableServices = Object.keys(this.services).join(', ');
      throw new Error(
        `Unsupported service: '${serviceName}'. Available services: ${availableServices}`
      );
    }

    // Create and return service instance
    console.log(`✅ Creating ${normalizedName} service instance`);
    return new ServiceClass();
  }

  /**
   * Get list of all available services
   * @returns {Array<String>} - Array of available service names
   */
  static getAvailableServices() {
    return Object.keys(this.services);
  }

  /**
   * Check if a service is supported
   * @param {String} serviceName - Name of the service
   * @returns {Boolean} - True if service is supported
   */
  static isServiceSupported(serviceName) {
    if (!serviceName) return false;
    const normalizedName = serviceName.toLowerCase().trim();
    return normalizedName in this.services;
  }

  /**
   * Register a new video generation service
   * Allows dynamic registration of new services
   * @param {String} serviceName - Name of the service
   * @param {Class} ServiceClass - Service class (must extend BaseVideoService)
   */
  static registerService(serviceName, ServiceClass) {
    if (!serviceName || typeof serviceName !== 'string') {
      throw new Error('Service name is required and must be a string');
    }

    if (!ServiceClass || typeof ServiceClass !== 'function') {
      throw new Error('Service class is required and must be a constructor function');
    }

    const normalizedName = serviceName.toLowerCase().trim();

    // Check if service already exists
    if (normalizedName in this.services) {
      console.warn(`⚠️  Service '${normalizedName}' is already registered. Overwriting...`);
    }

    this.services[normalizedName] = ServiceClass;
    console.log(`✅ Registered new service: ${normalizedName}`);
  }

  /**
   * Unregister a service
   * @param {String} serviceName - Name of the service to remove
   * @returns {Boolean} - True if service was removed
   */
  static unregisterService(serviceName) {
    if (!serviceName) return false;

    const normalizedName = serviceName.toLowerCase().trim();

    if (normalizedName in this.services) {
      delete this.services[normalizedName];
      console.log(`✅ Unregistered service: ${normalizedName}`);
      return true;
    }

    return false;
  }

  /**
   * Get service information
   * @param {String} serviceName - Name of the service
   * @returns {Object} - Service metadata
   */
  static getServiceInfo(serviceName) {
    if (!serviceName) {
      throw new Error('Service name is required');
    }

    const normalizedName = serviceName.toLowerCase().trim();

    if (!this.isServiceSupported(normalizedName)) {
      throw new Error(`Service '${serviceName}' is not supported`);
    }

    const ServiceClass = this.services[normalizedName];
    const instance = new ServiceClass();

    return {
      name: normalizedName,
      className: ServiceClass.name,
      serviceName: instance.serviceName,
      config: {
        endpoint: instance.serviceConfig.API_ENDPOINT,
        timeout: instance.serviceConfig.TIMEOUT,
      },
    };
  }

  /**
   * Create service with validation
   * Validates service exists and returns instance with additional context
   * @param {String} serviceName - Name of the service
   * @returns {Object} - Object containing service instance and metadata
   */
  static createServiceWithContext(serviceName) {
    const service = this.createService(serviceName);
    const info = this.getServiceInfo(serviceName);

    return {
      service,
      info,
      createdAt: new Date().toISOString(),
    };
  }
}

module.exports = VideoGenerationFactory;