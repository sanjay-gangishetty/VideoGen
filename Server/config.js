/**
 * Server Configuration
 * Central configuration file for all app-wide settings
 */

// Load environment variables from .env file
require('dotenv').config();

const config = {
  // Server settings
  PORT: parseInt(process.env.PORT, 10) || 3000,

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
      API_KEY: process.env.HEYGEN_API_KEY || 'your-heygen-api-key-here',
      API_ENDPOINT: process.env.HEYGEN_API_ENDPOINT || 'https://api.heygen.com/v1',
      TIMEOUT: parseInt(process.env.HEYGEN_TIMEOUT, 10) || 30000, // 30 seconds
    },

    // Google Veo 3 Configuration
    VEO3: {
      API_KEY: process.env.VEO3_API_KEY || 'your-google-veo3-api-key-here',
      API_ENDPOINT: process.env.VEO3_API_ENDPOINT || 'https://generativelanguage.googleapis.com/v1',
      PROJECT_ID: process.env.VEO3_PROJECT_ID || 'your-project-id',
      TIMEOUT: parseInt(process.env.VEO3_TIMEOUT, 10) || 60000, // 60 seconds
    },

    // Kie.ai Configuration
    KIE: {
      API_KEY: process.env.KIE_API_KEY || 'your-kie-api-key-here',
      API_ENDPOINT: process.env.KIE_API_ENDPOINT || 'https://api.kie.ai/v1',
      TIMEOUT: parseInt(process.env.KIE_TIMEOUT, 10) || 60000, // 60 seconds
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

    // Initial credits for new users (via OAuth signup)
    INITIAL_CREDITS: parseInt(process.env.INITIAL_CREDITS, 10) || 10,

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

  // Authentication Configuration
  AUTH: {
    // Google OAuth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,

    // Session
    SESSION_SECRET: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    SESSION_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days

    // Frontend URL for redirects
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

    // Test mode - allows unauthenticated requests when true
    TEST_MODE: process.env.TEST_MODE === 'true',
  },

  // Payment Gateway Configuration
  PAYMENT: {
    // Default payment provider (stripe, razorpay, paypal, etc.)
    DEFAULT_PROVIDER: process.env.PAYMENT_PROVIDER || 'stripe',

    // Stripe Configuration
    STRIPE: {
      SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
      WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      API_VERSION: '2024-11-20.acacia',
    },

    // Future providers can be added here:
    // RAZORPAY: {
    //   KEY_ID: process.env.RAZORPAY_KEY_ID,
    //   KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    //   WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
    // },

    // Payment Settings
    CURRENCY: process.env.PAYMENT_CURRENCY || 'USD',

    // Test package for initial implementation
    TEST_PACKAGE: {
      amount: 1000, // $10.00 in cents
      currency: 'usd',
      creditsAwarded: 10,
      description: 'Test package - 10 credits for $10',
    },

    // Success/Cancel URLs
    SUCCESS_URL: process.env.PAYMENT_SUCCESS_URL || 'http://localhost:5173/payment/success',
    CANCEL_URL: process.env.PAYMENT_CANCEL_URL || 'http://localhost:5173/payment/cancel',
  },
};

module.exports = config;
