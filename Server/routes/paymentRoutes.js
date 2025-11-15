/**
 * Payment Routes
 *
 * Defines all payment-related API endpoints.
 * Handles checkout sessions, webhooks, and payment callbacks.
 *
 * @module routes/paymentRoutes
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { requireAuth } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/payment/checkout
 * @desc    Create a checkout session for purchasing credits
 * @access  Private (Requires authentication)
 */
router.post('/checkout', requireAuth, paymentController.createCheckoutSession);

/**
 * @route   GET /api/payment/success
 * @desc    Handle successful payment callback
 * @query   session_id - Checkout session ID
 * @access  Private (Requires authentication)
 */
router.get('/success', requireAuth, paymentController.handleSuccess);

/**
 * @route   GET /api/payment/cancel
 * @desc    Handle cancelled payment callback
 * @access  Private (Requires authentication)
 */
router.get('/cancel', requireAuth, paymentController.handleCancel);

/**
 * @route   POST /api/payment/webhook
 * @desc    Handle webhook events from payment provider
 * @access  Public (Verified by signature)
 * @note    This endpoint requires raw body for signature verification
 */
router.post('/webhook', paymentController.handleWebhook);

/**
 * @route   GET /api/payment/history
 * @desc    Get payment history for current user
 * @query   limit - Number of records (default: 10)
 * @query   offset - Number of records to skip (default: 0)
 * @query   status - Filter by status (optional)
 * @access  Private (Requires authentication)
 */
router.get('/history', requireAuth, paymentController.getPaymentHistory);

module.exports = router;
