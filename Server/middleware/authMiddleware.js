/**
 * Authentication Middleware
 * Protects routes with authentication checks
 */

const config = require('../config');

/**
 * Require authentication middleware
 * Checks if user is authenticated via session
 * Respects TEST_MODE configuration for testing
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const requireAuth = (req, res, next) => {
  // Check if TEST_MODE is enabled
  if (config.AUTH.TEST_MODE) {
    // In test mode, allow requests without authentication
    // Set a default test user (userId = 1)
    if (!req.user) {
      req.user = { id: 1 };
    }
    return next();
  }

  // Check if user is authenticated
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  // User is not authenticated
  return res.status(401).json({
    success: false,
    error: 'Authentication required',
    message: 'Please log in with Google to access this resource',
  });
};

/**
 * Optional authentication middleware
 * Passes through if user is not authenticated
 * Useful for routes that work differently for authenticated vs unauthenticated users
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const optionalAuth = (req, res, next) => {
  // Always pass through, but user might be in req.user if authenticated
  next();
};

module.exports = {
  requireAuth,
  optionalAuth,
};
