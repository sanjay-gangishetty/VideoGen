const BaseVideoService = require('./baseVideoService');
const config = require('../config');

/**
 * Google Veo 3 Video Generation Service
 * Implements video generation using Google Veo 3 API
 */
class Veo3Service extends BaseVideoService {
  constructor() {
    super('veo3', config.VIDEO_SERVICES.VEO3);
  }

  /**
   * Generate video using Google Veo 3 API
   * @param {Object} params - Video generation parameters
   * @param {String} params.prompt - Text prompt describing the video to generate
   * @param {Number} [params.duration] - Video duration in seconds (default: 5)
   * @param {String} [params.aspectRatio] - Aspect ratio (16:9, 9:16, 1:1)
   * @param {String} [params.style] - Visual style preference
   * @param {String} [params.model] - Model version (default: veo-3)
   * @returns {Promise<Object>} - Normalized response
   */
  async generateVideo(params) {
    try {
      this.log('info', 'Starting Google Veo 3 video generation');

      // Validate required fields
      this.validateInput(params, ['prompt']);

      // Additional validation for Veo 3-specific fields
      if (params.prompt.length > 2000) {
        throw new Error('Prompt exceeds maximum length of 2000 characters');
      }

      if (params.duration && (params.duration < 1 || params.duration > 60)) {
        throw new Error('Duration must be between 1 and 60 seconds');
      }

      // Prepare request payload
      const payload = this.preparePayload(params);

      // Make API request with retry logic
      const response = await this.retry(
        async () => {
          return await this.makeRequest({
            method: 'POST',
            url: `${this.serviceConfig.API_ENDPOINT}/models/veo-3:generate`,
            headers: {
              'Authorization': `Bearer ${this.serviceConfig.API_KEY}`,
              'Content-Type': 'application/json',
              'x-goog-user-project': this.serviceConfig.PROJECT_ID,
            },
            data: payload,
          });
        },
        'Veo 3 Video Generation'
      );

      // Normalize and return response
      return this.normalizeResponse(response, {
        videoId: 'name',
        videoUrl: 'video.uri',
        status: 'state',
        duration: 'video.duration',
      });

    } catch (error) {
      this.log('error', `Video generation failed: ${error.message}`);
      return this.normalizeError(error);
    }
  }

  /**
   * Prepare Google Veo 3 API payload
   * @param {Object} params - Input parameters
   * @returns {Object} - Veo 3 API payload
   */
  preparePayload(params) {
    const payload = {
      prompt: {
        text: params.prompt,
      },
      generationConfig: {
        duration: params.duration || 5,
        aspectRatio: params.aspectRatio || '16:9',
        model: params.model || 'veo-3',
      },
    };

    // Add optional style
    if (params.style) {
      payload.generationConfig.style = params.style;
    }

    // Add optional seed for reproducibility
    if (params.seed) {
      payload.generationConfig.seed = params.seed;
    }

    // Add optional negative prompt
    if (params.negativePrompt) {
      payload.prompt.negativeText = params.negativePrompt;
    }

    // Add optional reference image
    if (params.referenceImage) {
      payload.prompt.referenceImage = {
        imageUri: params.referenceImage,
      };
    }

    this.log('info', 'Payload prepared successfully');
    return payload;
  }

  /**
   * Get video generation status by operation name
   * @param {String} operationName - Google operation name/ID
   * @returns {Promise<Object>} - Video status
   */
  async getVideoStatus(operationName) {
    try {
      this.log('info', `Checking status for operation: ${operationName}`);

      if (!operationName) {
        throw new Error('operationName is required');
      }

      const response = await this.retry(
        async () => {
          return await this.makeRequest({
            method: 'GET',
            url: `${this.serviceConfig.API_ENDPOINT}/${operationName}`,
            headers: {
              'Authorization': `Bearer ${this.serviceConfig.API_KEY}`,
              'x-goog-user-project': this.serviceConfig.PROJECT_ID,
            },
          });
        },
        'Get Video Status'
      );

      return this.normalizeResponse(response, {
        videoId: 'name',
        videoUrl: 'response.video.uri',
        status: 'done',
        duration: 'response.video.duration',
      });

    } catch (error) {
      this.log('error', `Failed to get video status: ${error.message}`);
      return this.normalizeError(error);
    }
  }

  /**
   * Cancel ongoing video generation
   * @param {String} operationName - Google operation name/ID
   * @returns {Promise<Object>} - Cancellation result
   */
  async cancelGeneration(operationName) {
    try {
      this.log('info', `Cancelling operation: ${operationName}`);

      if (!operationName) {
        throw new Error('operationName is required');
      }

      const response = await this.retry(
        async () => {
          return await this.makeRequest({
            method: 'POST',
            url: `${this.serviceConfig.API_ENDPOINT}/${operationName}:cancel`,
            headers: {
              'Authorization': `Bearer ${this.serviceConfig.API_KEY}`,
              'x-goog-user-project': this.serviceConfig.PROJECT_ID,
            },
          });
        },
        'Cancel Generation'
      );

      return {
        success: true,
        service: this.serviceName,
        data: {
          cancelled: true,
          operationName: operationName,
        },
      };

    } catch (error) {
      this.log('error', `Failed to cancel generation: ${error.message}`);
      return this.normalizeError(error);
    }
  }

  /**
   * Get model information
   * @returns {Promise<Object>} - Model capabilities and limits
   */
  async getModelInfo() {
    try {
      this.log('info', 'Fetching Veo 3 model information');

      const response = await this.retry(
        async () => {
          return await this.makeRequest({
            method: 'GET',
            url: `${this.serviceConfig.API_ENDPOINT}/models/veo-3`,
            headers: {
              'Authorization': `Bearer ${this.serviceConfig.API_KEY}`,
              'x-goog-user-project': this.serviceConfig.PROJECT_ID,
            },
          });
        },
        'Get Model Info'
      );

      return {
        success: true,
        service: this.serviceName,
        data: response,
      };

    } catch (error) {
      this.log('error', `Failed to fetch model info: ${error.message}`);
      return this.normalizeError(error);
    }
  }

  /**
   * Generate video with image reference
   * @param {Object} params - Video generation parameters
   * @param {String} params.prompt - Text prompt
   * @param {String} params.imageUrl - Reference image URL
   * @param {String} [params.imageInfluence] - How much image influences output (low, medium, high)
   * @returns {Promise<Object>} - Normalized response
   */
  async generateVideoFromImage(params) {
    try {
      this.log('info', 'Starting Veo 3 image-to-video generation');

      // Validate required fields
      this.validateInput(params, ['prompt', 'imageUrl']);

      // Set reference image
      params.referenceImage = params.imageUrl;

      // Set image influence
      if (params.imageInfluence) {
        params.imageInfluenceStrength = params.imageInfluence;
      }

      // Use main generateVideo method
      return await this.generateVideo(params);

    } catch (error) {
      this.log('error', `Image-to-video generation failed: ${error.message}`);
      return this.normalizeError(error);
    }
  }
}

module.exports = Veo3Service;