import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchPaymentHistory } from '../utils/api';
import AddCreditsModal from '../components/AddCreditsModal';
import './Wallet.css';

const Wallet = () => {
  const { user, refetchUser } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [showAddCreditsModal, setShowAddCreditsModal] = useState(false);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchPaymentHistory(20, 0);
      setPayments(data.payments || []);
      setTotal(data.total || 0);
      setHasMore(data.hasMore || false);
    } catch (error) {
      console.error('Error loading payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCreditsSuccess = async () => {
    setShowAddCreditsModal(false);
    await refetchUser();
    await loadPaymentHistory();
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      COMPLETED: 'status-badge status-completed',
      PENDING: 'status-badge status-pending',
      FAILED: 'status-badge status-failed',
      REFUNDED: 'status-badge status-refunded',
    };
    return statusMap[status] || 'status-badge';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="wallet-page">
      <div className="container">
        {/* Header Section */}
        <div className="wallet-header">
          <h1>My Wallet</h1>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddCreditsModal(true)}
          >
            Add Credits
          </button>
        </div>

        {/* Balance Card */}
        <div className="balance-card card">
          <div className="balance-info">
            <div className="balance-label">Current Balance</div>
            <div className="balance-amount">
              {user?.wallet?.currentBalance || 0} credits
            </div>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="transaction-section">
          <h2>Transaction History</h2>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading transactions...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-icon">💳</div>
              <p className="empty-text">Initiate your first transaction today</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowAddCreditsModal(true)}
              >
                Add Credits Now
              </button>
            </div>
          ) : (
            <div className="transactions-table-wrapper">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Credits</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{formatDate(payment.createdAt)}</td>
                      <td>{formatAmount(payment.amount, payment.currency)}</td>
                      <td className="credits-cell">
                        +{payment.creditsAwarded} credits
                      </td>
                      <td className="payment-gateway">
                        {payment.paymentGateway?.toUpperCase() || 'N/A'}
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(payment.status)}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {hasMore && (
                <div className="load-more-section">
                  <p className="total-transactions">
                    Showing {payments.length} of {total} transactions
                  </p>
                  <button
                    className="btn btn-outline"
                    onClick={() => {
                      // TODO: Implement load more functionality
                      console.log('Load more clicked');
                    }}
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Credits Modal */}
      {showAddCreditsModal && (
        <AddCreditsModal
          onClose={() => setShowAddCreditsModal(false)}
          onSuccess={handleAddCreditsSuccess}
        />
      )}
    </div>
  );
};

export default Wallet;
