/**
 * Server Configuration
 * Central configuration file for all app-wide settings
 */

const config = {
  // Server settings
  PORT: 3000,

  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',

  // API settings
  API_PREFIX: '/api',

  // CORS settings
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  // Server metadata
  APP_NAME: 'Video Generator API',
  VERSION: '1.0.0',

  // Video Generation Services
  VIDEO_SERVICES: {
    // HeyGen Configuration
    HEYGEN: {
      API_KEY: 'your-heygen-api-key-here',
      API_ENDPOINT: 'https://api.heygen.com/v1',
      TIMEOUT: 30000, // 30 seconds
    },

    // Google Veo 3 Configuration
    VEO3: {
      API_KEY: 'your-google-veo3-api-key-here',
      API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1',
      PROJECT_ID: 'your-project-id',
      TIMEOUT: 60000, // 60 seconds
    },

    // Kie.ai Configuration
    KIE: {
      API_KEY: 'your-kie-api-key-here',
      API_ENDPOINT: 'https://api.kie.ai/v1',
      TIMEOUT: 60000, // 60 seconds
    },

    // Retry Configuration
    RETRY: {
      MAX_ATTEMPTS: 3,
      INITIAL_DELAY: 1000, // 1 second
      BACKOFF_MULTIPLIER: 2, // Exponential backoff
      MAX_DELAY: 10000, // 10 seconds max
    },

    // Logging
    ENABLE_LOGGING: true,
  },

  // Credit System Configuration
  CREDITS: {
    // Default credits for new users
    DEFAULT_CREDITS: 100,

    // Video generation costs by service
    VIDEO_COSTS: {
      heygen: 10,
      veo3: 15,
      kie: 5,
    },

    // Credit operation limits
    MAX_CREDITS_PER_OPERATION: 1000000,
    MIN_CREDITS_FOR_VIDEO: 5, // Minimum required to generate any video
  },
};

module.exports = config;
