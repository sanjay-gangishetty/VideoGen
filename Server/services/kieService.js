const BaseVideoService = require('./baseVideoService');
const config = require('../config');

/**
 * Kie.ai Video Generation Service
 * Implements video generation using Kie.ai API with veo3.1-fast model
 */
class KieService extends BaseVideoService {
  constructor() {
    super('kie', config.VIDEO_SERVICES.KIE);
  }

  /**
   * Generate video using Kie.ai API
   * @param {Object} params - Video generation parameters
   * @param {String} params.prompt - Text prompt describing the video to generate
   * @param {Number} [params.duration] - Video duration in seconds (default: 5)
   * @param {String} [params.aspectRatio] - Aspect ratio (16:9, 9:16, 1:1)
   * @param {String} [params.model] - Model version (default: veo3.1-fast)
   * @param {Number} [params.seed] - Seed for reproducibility
   * @returns {Promise<Object>} - Normalized response
   */
  async generateVideo(params) {
    try {
      this.log('info', 'Starting Kie.ai video generation');

      // Validate required fields
      this.validateInput(params, ['prompt']);

      // Additional validation for Kie.ai-specific fields
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
            url: `${this.serviceConfig.API_ENDPOINT}/generate`,
            headers: {
              'Authorization': `Bearer ${this.serviceConfig.API_KEY}`,
              'Content-Type': 'application/json',
            },
            data: payload,
          });
        },
        'Kie.ai Video Generation'
      );

      // Normalize and return response
      // Adjust mapping based on actual Kie.ai API response structure
      return this.normalizeResponse(response, {
        videoId: 'id',
        videoUrl: 'url',
        status: 'status',
        duration: 'duration',
      });

    } catch (error) {
      this.log('error', `Video generation failed: ${error.message}`);
      return this.normalizeError(error);
    }
  }

  /**
   * Prepare Kie.ai API payload
   * @param {Object} params - Input parameters
   * @returns {Object} - Kie.ai API payload
   */
  preparePayload(params) {
    const payload = {
      prompt: params.prompt,
      model: params.model || 'veo3.1-fast',
      duration: params.duration || 5,
      aspectRatio: params.aspectRatio || '16:9',
    };

    // Add optional seed for reproducibility
    if (params.seed !== undefined) {
      payload.seed = params.seed;
    }

    // Add optional style
    if (params.style) {
      payload.style = params.style;
    }

    // Add optional negative prompt
    if (params.negativePrompt) {
      payload.negativePrompt = params.negativePrompt;
    }

    this.log('info', 'Payload prepared successfully');
    return payload;
  }

  /**
   * Get video generation status by video ID
   * @param {String} videoId - Video/Job ID from Kie.ai
   * @returns {Promise<Object>} - Video status
   */
  async getVideoStatus(videoId) {
    try {
      this.log('info', `Checking status for video: ${videoId}`);

      if (!videoId) {
        throw new Error('videoId is required');
      }

      const response = await this.retry(
        async () => {
          return await this.makeRequest({
            method: 'GET',
            url: `${this.serviceConfig.API_ENDPOINT}/status/${videoId}`,
            headers: {
              'Authorization': `Bearer ${this.serviceConfig.API_KEY}`,
            },
          });
        },
        'Get Video Status'
      );

      return this.normalizeResponse(response, {
        videoId: 'id',
        videoUrl: 'url',
        status: 'status',
        duration: 'duration',
      });

    } catch (error) {
      this.log('error', `Failed to get video status: ${error.message}`);
      return this.normalizeError(error);
    }
  }

  /**
   * Cancel ongoing video generation
   * @param {String} videoId - Video/Job ID from Kie.ai
   * @returns {Promise<Object>} - Cancellation result
   */
  async cancelGeneration(videoId) {
    try {
      this.log('info', `Cancelling video generation: ${videoId}`);

      if (!videoId) {
        throw new Error('videoId is required');
      }

      const response = await this.retry(
        async () => {
          return await this.makeRequest({
            method: 'POST',
            url: `${this.serviceConfig.API_ENDPOINT}/cancel/${videoId}`,
            headers: {
              'Authorization': `Bearer ${this.serviceConfig.API_KEY}`,
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
          videoId: videoId,
        },
      };

    } catch (error) {
      this.log('error', `Failed to cancel generation: ${error.message}`);
      return this.normalizeError(error);
    }
  }
}

module.exports = KieService;
