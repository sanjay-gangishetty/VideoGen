import { useState } from 'react';
import Modal from './Modal';
import CREDITS_CONFIG, { calculatePrice } from '../config/credits';
import { createCheckoutSession } from '../utils/api';
import './AddCreditsModal.css';

const AddCreditsModal = ({ onClose, onSuccess }) => {
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const quickAddAmounts = CREDITS_CONFIG.QUICK_ADD_AMOUNTS;

  const handleQuickAddClick = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount(amount.toString());
    setError('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers
    if (value === '' || /^\d+$/.test(value)) {
      setCustomAmount(value);
      setSelectedAmount(null);
      setError('');
    }
  };

  const handlePurchase = async () => {
    const amount = parseInt(customAmount);

    // Validation
    if (!amount || isNaN(amount)) {
      setError('Please enter a valid amount');
      return;
    }

    if (amount < CREDITS_CONFIG.MIN_CREDITS) {
      setError(`Minimum purchase is ${CREDITS_CONFIG.MIN_CREDITS} credits`);
      return;
    }

    if (amount > CREDITS_CONFIG.MAX_CREDITS) {
      setError(`Maximum purchase is ${CREDITS_CONFIG.MAX_CREDITS} credits`);
      return;
    }

    // Validate payment amount doesn't exceed $1000 limit
    const paymentAmount = amount * CREDITS_CONFIG.PRICE_PER_CREDIT;
    if (paymentAmount > CREDITS_CONFIG.MAX_PAYMENT_AMOUNT) {
      setError(`Maximum payment amount is $${CREDITS_CONFIG.MAX_PAYMENT_AMOUNT}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await createCheckoutSession(amount);

      if (response.success && response.data?.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
      setError(err.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const currentAmount = parseInt(customAmount) || 0;
  const calculatedPrice = currentAmount > 0 ? calculatePrice(currentAmount) : '0.00';

  return (
    <Modal isOpen={true} onClose={onClose} showCloseButton={true}>
      <div className="add-credits-modal">
        <h2 className="modal-title">Add Credits</h2>
        <p className="modal-subtitle">
          Purchase credits to generate amazing videos
        </p>

        {/* Custom Amount Input */}
        <div className="input-section">
          <label htmlFor="credit-amount" className="input-label">
            Enter Credit Amount
          </label>
          <input
            id="credit-amount"
            type="text"
            className="input credit-input"
            placeholder="Enter number of credits"
            value={customAmount}
            onChange={handleCustomAmountChange}
            disabled={loading}
          />
          {currentAmount > 0 && (
            <div className="price-display">
              Total: ${calculatedPrice} {CREDITS_CONFIG.CURRENCY}
            </div>
          )}
        </div>

        {/* Quick Add Buttons */}
        <div className="quick-add-section">
          <p className="quick-add-label">Quick Add</p>
          <div className="quick-add-buttons">
            {quickAddAmounts.map((amount) => (
              <button
                key={amount}
                className={`quick-add-btn ${
                  selectedAmount === amount ? 'active' : ''
                }`}
                onClick={() => handleQuickAddClick(amount)}
                disabled={loading}
              >
                <span className="quick-add-amount">{amount}</span>
                <span className="quick-add-credits">credits</span>
                <span className="quick-add-price">
                  ${calculatePrice(amount)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Action Buttons */}
        <div className="modal-actions">
          <button
            className="btn btn-outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handlePurchase}
            disabled={loading || !customAmount}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              'Purchase Credits'
            )}
          </button>
        </div>

        {/* Info Text */}
        <p className="info-text">
          You will be redirected to Stripe for secure payment processing
        </p>
      </div>
    </Modal>
  );
};

export default AddCreditsModal;
