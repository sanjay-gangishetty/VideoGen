/**
 * Credit Routes
 *
 * Defines all credit-related API endpoints.
 * Routes follow RESTful conventions and include validation middleware.
 *
 * @module routes/creditRoutes
 */

const express = require('express');
const router = express.Router();
const creditController = require('../controllers/creditController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateCreditOperation } = require('../middleware/validateCredit');

/**
 * @route   GET /api/credits
 * @desc    Get current user's credit balance
 * @access  Private (Requires authentication, respects TEST_MODE)
 */
router.get('/', requireAuth, creditController.getUserCredits);

/**
 * @route   POST /api/credits/deduct
 * @desc    Deduct credits from user account
 * @body    { amount: number, reason: string }
 * @access  Private (Requires authentication, respects TEST_MODE)
 */
router.post('/deduct', requireAuth, validateCreditOperation, creditController.deductCredits);

/**
 * @route   POST /api/credits/add
 * @desc    Add credits to user account
 * @body    { amount: number, reason: string }
 * @access  Private (Requires authentication, respects TEST_MODE)
 */
router.post('/add', requireAuth, validateCreditOperation, creditController.addCredits);

module.exports = router;
