/**
 * Authentication Routes
 * Google OAuth login, logout, and user info endpoints
 */

const express = require('express');
const passport = require('../config/passport');
const config = require('../config');

const router = express.Router();

/**
 * @route   GET /auth/google
 * @desc    Initiate Google OAuth flow
 * @access  Public
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

/**
 * @route   GET /auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${config.AUTH.FRONTEND_URL}/login?error=auth_failed`,
  }),
  (req, res) => {
    // Successful authentication, redirect to frontend
    res.redirect(config.AUTH.FRONTEND_URL);
  }
);

/**
 * @route   GET /auth/me
 * @desc    Get current authenticated user info
 * @access  Private
 */
router.get('/me', (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated',
      message: 'Please log in to access this resource',
    });
  }

  // Return user info (excluding sensitive tokens)
  const { accessToken, refreshToken, ...userInfo } = req.user;

  res.json({
    success: true,
    user: userInfo,
  });
});

/**
 * @route   GET /auth/status
 * @desc    Check authentication status
 * @access  Public
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    authenticated: req.isAuthenticated ? req.isAuthenticated() : false,
    testMode: config.AUTH.TEST_MODE,
  });
});

/**
 * @route   GET /auth/logout
 * @desc    Logout and destroy session
 * @access  Private
 */
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Logout failed',
        message: err.message,
      });
    }

    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Session destruction failed',
          message: err.message,
        });
      }

      // Clear session cookie
      res.clearCookie('connect.sid');

      // Redirect to frontend
      res.redirect(config.AUTH.FRONTEND_URL);
    });
  });
});

module.exports = router;
