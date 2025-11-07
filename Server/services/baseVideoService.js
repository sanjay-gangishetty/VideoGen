const axios = require('axios');
const config = require('../config');

/**
 * Base Video Service
 * Abstract base class for all video generation services
 * Provides common functionality: retry logic, validation, logging, response normalization
 */
class BaseVideoService {
  constructor(serviceName, serviceConfig) {
    if (this.constructor === BaseVideoService) {
      throw new Error('BaseVideoService is abstract and cannot be instantiated directly');
    }

    this.serviceName = serviceName;
    this.serviceConfig = serviceConfig;
    this.retryConfig = config.VIDEO_SERVICES.RETRY;
    this.enableLogging = config.VIDEO_SERVICES.ENABLE_LOGGING;
  }

  /**
   * Abstract method - must be implemented by child classes
   * @param {Object} params - Video generation parameters
   * @returns {Promise<Object>} - Normalized response
   */
  async generateVideo(params) {
    throw new Error('generateVideo() must be implemented by child class');
  }

  /**
   * Retry wrapper with exponential backoff
   * @param {Function} fn - Async function to retry
   * @param {String} operation - Operation name for logging
   * @returns {Promise<any>} - Result from function
   */
  async retry(fn, operation = 'operation') {
    let lastError;
    let delay = this.retryConfig.INITIAL_DELAY;

    for (let attempt = 1; attempt <= this.retryConfig.MAX_ATTEMPTS; attempt++) {
      try {
        this.log('info', `[${operation}] Attempt ${attempt}/${this.retryConfig.MAX_ATTEMPTS}`);
        const result = await fn();

        if (attempt > 1) {
          this.log('success', `[${operation}] Succeeded on attempt ${attempt}`);
        }

        return result;
      } catch (error) {
        lastError = error;
        this.log('error', `[${operation}] Attempt ${attempt} failed: ${error.message}`);

        if (attempt < this.retryConfig.MAX_ATTEMPTS) {
          // Check if error is retryable
          if (!this.isRetryableError(error)) {
            this.log('error', `[${operation}] Non-retryable error, aborting`);
            throw error;
          }

          this.log('info', `[${operation}] Retrying in ${delay}ms...`);
          await this.sleep(delay);

          // Exponential backoff with max delay cap
          delay = Math.min(
            delay * this.retryConfig.BACKOFF_MULTIPLIER,
            this.retryConfig.MAX_DELAY
          );
        }
      }
    }

    // All attempts failed
    this.log('error', `[${operation}] All ${this.retryConfig.MAX_ATTEMPTS} attempts failed`);
    throw new Error(
      `${operation} failed after ${this.retryConfig.MAX_ATTEMPTS} attempts: ${lastError.message}`
    );
  }

  /**
   * Determine if error is retryable
   * @param {Error} error - Error object
   * @returns {Boolean} - True if retryable
   */
  isRetryableError(error) {
    // Network errors are retryable
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return true;
    }

    // HTTP status codes that are retryable
    if (error.response) {
      const status = error.response.status;
      // Retry on 5xx server errors and 429 rate limit
      return status >= 500 || status === 429;
    }

    // Timeout errors are retryable
    if (error.message.includes('timeout')) {
      return true;
    }

    return false;
  }

  /**
   * Validate input parameters
   * @param {Object} params - Parameters to validate
   * @param {Array} requiredFields - Array of required field names
   * @throws {Error} - If validation fails
   */
  validateInput(params, requiredFields = []) {
    if (!params || typeof params !== 'object') {
      throw new Error('Invalid parameters: params must be an object');
    }

    const missingFields = requiredFields.filter(field => {
      return params[field] === undefined || params[field] === null || params[field] === '';
    });

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required fields: ${missingFields.join(', ')}`
      );
    }

    this.log('info', 'Input validation passed');
  }

  /**
   * Normalize response to standard format
   * @param {Object} rawResponse - Raw API response
   * @param {Object} mapping - Field mapping configuration
   * @returns {Object} - Normalized response
   */
  normalizeResponse(rawResponse, mapping = {}) {
    const normalized = {
      success: true,
      service: this.serviceName,
      timestamp: new Date().toISOString(),
      data: {},
    };

    // Apply field mappings
    if (mapping.videoUrl) {
      normalized.data.videoUrl = this.getNestedValue(rawResponse, mapping.videoUrl);
    }
    if (mapping.videoId) {
      normalized.data.videoId = this.getNestedValue(rawResponse, mapping.videoId);
    }
    if (mapping.status) {
      normalized.data.status = this.getNestedValue(rawResponse, mapping.status);
    }
    if (mapping.duration) {
      normalized.data.duration = this.getNestedValue(rawResponse, mapping.duration);
    }

    // Include raw response for debugging
    if (config.NODE_ENV === 'development') {
      normalized.rawResponse = rawResponse;
    }

    this.log('info', 'Response normalized successfully');
    return normalized;
  }

  /**
   * Get nested value from object using dot notation
   * @param {Object} obj - Object to search
   * @param {String} path - Dot notation path (e.g., 'data.video.url')
   * @returns {any} - Value or undefined
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Normalize error response
   * @param {Error} error - Error object
   * @returns {Object} - Normalized error response
   */
  normalizeError(error) {
    const normalized = {
      success: false,
      service: this.serviceName,
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
      },
    };

    // Add HTTP status if available
    if (error.response) {
      normalized.error.status = error.response.status;
      normalized.error.statusText = error.response.statusText;

      // Add API error details if available
      if (error.response.data) {
        normalized.error.details = error.response.data;
      }
    }

    this.log('error', `Error normalized: ${error.message}`);
    return normalized;
  }

  /**
   * Make HTTP request with axios
   * @param {Object} options - Axios request options
   * @returns {Promise<Object>} - Response data
   */
  async makeRequest(options) {
    const axiosConfig = {
      timeout: this.serviceConfig.TIMEOUT,
      ...options,
    };

    this.log('info', `Making ${options.method || 'GET'} request to ${options.url}`);

    try {
      const response = await axios(axiosConfig);
      this.log('success', `Request successful: ${response.status}`);
      return response.data;
    } catch (error) {
      this.log('error', `Request failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Logger utility
   * @param {String} level - Log level (info, success, error, warn)
   * @param {String} message - Log message
   */
  log(level, message) {
    if (!this.enableLogging) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.serviceName.toUpperCase()}]`;

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

module.exports = BaseVideoService;