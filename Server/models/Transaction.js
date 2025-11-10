/**
 * Transaction Model
 *
 * This is a placeholder model for credit transaction history.
 * Replace the mock implementation with actual database queries when ready.
 */

class Transaction {
  constructor() {
    // Mock in-memory transaction storage
    this.transactions = [];
    this.nextId = 1;
  }

  /**
   * Create a new transaction record
   * @param {Object} transactionData - Transaction data
   * @param {string} transactionData.userId - User ID
   * @param {string} transactionData.type - Transaction type ('credit' or 'debit')
   * @param {number} transactionData.amount - Transaction amount
   * @param {string} transactionData.reason - Reason for transaction
   * @param {number} transactionData.balanceAfter - Balance after transaction
   * @returns {Promise<Object>} Created transaction object
   */
  async create(transactionData) {
    console.log('⚠️  DATABASE NOT IMPLEMENTED - Using mock transaction data');

    const transaction = {
      id: `txn${this.nextId++}`,
      userId: transactionData.userId,
      type: transactionData.type,
      amount: transactionData.amount,
      reason: transactionData.reason,
      balanceAfter: transactionData.balanceAfter,
      timestamp: new Date(),
      createdAt: new Date()
    };

    this.transactions.push(transaction);
    return { ...transaction };
  }

  /**
   * Find all transactions for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @param {number} options.limit - Maximum number of records to return
   * @param {number} options.offset - Number of records to skip
   * @returns {Promise<Array>} Array of transaction objects
   */
  async findByUserId(userId, options = {}) {
    console.log('⚠️  DATABASE NOT IMPLEMENTED - Using mock transaction data');

    const { limit = 50, offset = 0 } = options;

    // Filter by userId and sort by timestamp descending
    const userTransactions = this.transactions
      .filter(txn => txn.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(offset, offset + limit);

    return userTransactions.map(txn => ({ ...txn }));
  }

  /**
   * Get transaction count for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Transaction count
   */
  async countByUserId(userId) {
    console.log('⚠️  DATABASE NOT IMPLEMENTED - Using mock transaction data');

    return this.transactions.filter(txn => txn.userId === userId).length;
  }

  /**
   * Find transaction by ID
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<Object|null>} Transaction object or null
   */
  async findById(transactionId) {
    console.log('⚠️  DATABASE NOT IMPLEMENTED - Using mock transaction data');

    const transaction = this.transactions.find(txn => txn.id === transactionId);
    return transaction ? { ...transaction } : null;
  }

  /**
   * Clear all transactions (for testing)
   * @returns {void}
   */
  clearAll() {
    console.log('⚠️  Clearing all mock transactions');
    this.transactions = [];
    this.nextId = 1;
  }
}

// Export singleton instance
module.exports = new Transaction();
