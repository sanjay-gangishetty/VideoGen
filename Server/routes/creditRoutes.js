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
const { validateCreditOperation, validateCreditHistory } = require('../middleware/validateCredit');

/**
 * @route   GET /api/credits
 * @desc    Get current user's credit balance
 * @access  Public (TODO: Add authentication middleware in next phase)
 */
router.get('/', creditController.getUserCredits);

/**
 * @route   POST /api/credits/deduct
 * @desc    Deduct credits from user account
 * @body    { amount: number, reason: string }
 * @access  Public (TODO: Add authentication middleware in next phase)
 */
router.post('/deduct', validateCreditOperation, creditController.deductCredits);

/**
 * @route   POST /api/credits/add
 * @desc    Add credits to user account
 * @body    { amount: number, reason: string }
 * @access  Public (TODO: Add authentication middleware in next phase)
 */
router.post('/add', validateCreditOperation, creditController.addCredits);

/**
 * @route   GET /api/credits/history
 * @desc    Get credit transaction history
 * @query   { limit: number, offset: number }
 * @access  Public (TODO: Add authentication middleware in next phase)
 */
router.get('/history', validateCreditHistory, creditController.getCreditHistory);

module.exports = router;
