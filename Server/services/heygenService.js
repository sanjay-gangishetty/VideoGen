const BaseVideoService = require('./baseVideoService');
const config = require('../config');

/**
 * HeyGen Video Generation Service
 * Implements video generation using HeyGen API
 */
class HeyGenService extends BaseVideoService {
  constructor() {
    super('heygen', config.VIDEO_SERVICES.HEYGEN);
  }

  /**
   * Generate video using HeyGen API
   * @param {Object} params - Video generation parameters
   * @param {String} params.avatarId - HeyGen avatar ID
   * @param {String} params.voiceId - HeyGen voice ID
   * @param {String} params.script - Script text for the video
   * @param {String} [params.title] - Video title
   * @param {Object} [params.background] - Background settings
   * @returns {Promise<Object>} - Normalized response
   */
  async generateVideo(params) {
    try {
      this.log('info', 'Starting HeyGen video generation');

      // Validate required fields
      this.validateInput(params, ['avatarId', 'voiceId', 'script']);

      // Additional validation for HeyGen-specific fields
      if (params.script.length > 10000) {
        throw new Error('Script exceeds maximum length of 10000 characters');
      }

      // Prepare request payload
      const payload = this.preparePayload(params);

      // Make API request with retry logic
      const response = await this.retry(
        async () => {
          return await this.makeRequest({
            method: 'POST',
            url: `${this.serviceConfig.API_ENDPOINT}/video/generate`,
            headers: {
              'X-Api-Key': this.serviceConfig.API_KEY,
              'Content-Type': 'application/json',
            },
            data: payload,
          });
        },
        'HeyGen Video Generation'
      );

      // Normalize and return response
      return this.normalizeResponse(response, {
        videoId: 'video_id',
        videoUrl: 'data.video_url',
        status: 'status',
        duration: 'data.duration',
      });

    } catch (error) {
      this.log('error', `Video generation failed: ${error.message}`);
      return this.normalizeError(error);
    }
  }

  /**
   * Prepare HeyGen API payload
   * @param {Object} params - Input parameters
   * @returns {Object} - HeyGen API payload
   */
  preparePayload(params) {
    const payload = {
      video_inputs: [
        {
          character: {
            type: 'avatar',
            avatar_id: params.avatarId,
          },
          voice: {
            type: 'voice',
            voice_id: params.voiceId,
          },
          input_text: params.script,
        },
      ],
      dimension: params.dimension || {
        width: 1920,
        height: 1080,
      },
    };

    // Add optional title
    if (params.title) {
      payload.title = params.title;
    }

    // Add optional background
    if (params.background) {
      payload.video_inputs[0].background = params.background;
    }

    // Add optional test mode
    if (params.test) {
      payload.test = true;
    }

    this.log('info', 'Payload prepared successfully');
    return payload;
  }

  /**
   * Get video status by ID
   * @param {String} videoId - HeyGen video ID
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
            url: `${this.serviceConfig.API_ENDPOINT}/video/status/${videoId}`,
            headers: {
              'X-Api-Key': this.serviceConfig.API_KEY,
            },
          });
        },
        'Get Video Status'
      );

      return this.normalizeResponse(response, {
        videoId: 'video_id',
        videoUrl: 'data.video_url',
        status: 'status',
        duration: 'data.duration',
      });

    } catch (error) {
      this.log('error', `Failed to get video status: ${error.message}`);
      return this.normalizeError(error);
    }
  }

  /**
   * List available avatars
   * @returns {Promise<Object>} - List of avatars
   */
  async listAvatars() {
    try {
      this.log('info', 'Fetching available avatars');

      const response = await this.retry(
        async () => {
          return await this.makeRequest({
            method: 'GET',
            url: `${this.serviceConfig.API_ENDPOINT}/avatars`,
            headers: {
              'X-Api-Key': this.serviceConfig.API_KEY,
            },
          });
        },
        'List Avatars'
      );

      return {
        success: true,
        service: this.serviceName,
        data: {
          avatars: response.data || response.avatars || [],
        },
      };

    } catch (error) {
      this.log('error', `Failed to fetch avatars: ${error.message}`);
      return this.normalizeError(error);
    }
  }

  /**
   * List available voices
   * @returns {Promise<Object>} - List of voices
   */
  async listVoices() {
    try {
      this.log('info', 'Fetching available voices');

      const response = await this.retry(
        async () => {
          return await this.makeRequest({
            method: 'GET',
            url: `${this.serviceConfig.API_ENDPOINT}/voices`,
            headers: {
              'X-Api-Key': this.serviceConfig.API_KEY,
            },
          });
        },
        'List Voices'
      );

      return {
        success: true,
        service: this.serviceName,
        data: {
          voices: response.data || response.voices || [],
        },
      };

    } catch (error) {
      this.log('error', `Failed to fetch voices: ${error.message}`);
      return this.normalizeError(error);
    }
  }
}

module.exports = HeyGenService;