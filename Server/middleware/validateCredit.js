/**
 * Credit Validation Middleware
 *
 * Validates credit-related operations following the pattern used in validateVideo.js
 */

/**
 * Validate credit deduction/addition requests
 * Checks for required fields: amount and reason
 */
const validateCreditOperation = (req, res, next) => {
  const { amount, reason } = req.body;

  // Check if request body exists
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Request body is required',
      message: 'Please provide amount and reason for the credit operation'
    });
  }

  // Validate amount field
  if (amount === undefined || amount === null) {
    return res.status(400).json({
      success: false,
      error: 'Amount is required',
      message: 'Please provide the amount of credits to add or deduct'
    });
  }

  // Validate amount is a positive number
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid amount',
      message: 'Amount must be a positive number'
    });
  }

  // Validate amount is not too large (prevent overflow)
  if (amount > 1000000) {
    return res.status(400).json({
      success: false,
      error: 'Amount too large',
      message: 'Amount cannot exceed 1,000,000 credits per operation'
    });
  }

  // Validate reason field
  if (!reason || typeof reason !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Reason is required',
      message: 'Please provide a reason for the credit operation'
    });
  }

  // Validate reason is not empty
  if (reason.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Reason cannot be empty',
      message: 'Please provide a valid reason for the credit operation'
    });
  }

  // Validate reason length
  if (reason.length > 500) {
    return res.status(400).json({
      success: false,
      error: 'Reason too long',
      message: 'Reason must be 500 characters or less'
    });
  }

  console.log(`✅ Credit operation validation passed - Amount: ${amount}, Reason: ${reason}`);
  next();
};

/**
 * Validate pagination parameters for credit history
 */
const validateCreditHistory = (req, res, next) => {
  const { limit, offset } = req.query;

  // Validate limit if provided
  if (limit !== undefined) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum <= 0 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid limit',
        message: 'Limit must be a number between 1 and 100'
      });
    }
  }

  // Validate offset if provided
  if (offset !== undefined) {
    const offsetNum = parseInt(offset);
    if (isNaN(offsetNum) || offsetNum < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid offset',
        message: 'Offset must be a non-negative number'
      });
    }
  }

  console.log(`✅ Credit history validation passed`);
  next();
};

module.exports = {
  validateCreditOperation,
  validateCreditHistory
};
