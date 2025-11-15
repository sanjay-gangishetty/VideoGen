// Credit pricing configuration
const CREDITS_CONFIG = {
  // Conversion rate: 1 credit = $X
  PRICE_PER_CREDIT: 0.01, // $0.01 per credit (100 credits = $1)

  // Quick add amounts (in credits)
  QUICK_ADD_AMOUNTS: [100, 500, 1000],

  // Minimum and maximum purchase amounts
  MIN_CREDITS: 10,
  MAX_CREDITS: 100000,

  // Maximum payment amount in dollars
  MAX_PAYMENT_AMOUNT: 1000,

  // Currency
  CURRENCY: 'USD',
};

/**
 * Calculate price for a given number of credits
 * @param {number} credits - Number of credits to purchase
 * @returns {number} Price in dollars
 */
export const calculatePrice = (credits) => {
  return (credits * CREDITS_CONFIG.PRICE_PER_CREDIT).toFixed(2);
};

/**
 * Calculate credits for a given price
 * @param {number} price - Price in dollars
 * @returns {number} Number of credits
 */
export const calculateCredits = (price) => {
  return Math.floor(price / CREDITS_CONFIG.PRICE_PER_CREDIT);
};

export default CREDITS_CONFIG;
