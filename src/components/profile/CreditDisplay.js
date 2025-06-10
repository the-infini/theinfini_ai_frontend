import React, { useState, useEffect, useCallback } from 'react';
import userService from '../../services/userService';

const CreditDisplay = ({ credits, onUpdate }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);

  const loadTransactions = useCallback(async () => {
    if (showTransactions && transactions.length === 0) {
      setLoading(true);
      try {
        const response = await userService.getCreditTransactions({ limit: 10 });
        if (response.success) {
          setTransactions(response.data.transactions || []);
        }
      } catch (err) {
        console.error('Error loading transactions:', err);
      } finally {
        setLoading(false);
      }
    }
  }, [showTransactions, transactions.length]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const refreshCredits = async () => {
    try {
      const response = await userService.getCreditSummary();
      if (response.success) {
        onUpdate(response.data);
      }
    } catch (err) {
      console.error('Error refreshing credits:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'EARNED':
        return '💰';
      case 'SPENT':
        return '💸';
      case 'BONUS':
        return '🎁';
      case 'REFUND':
        return '↩️';
      default:
        return '💳';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'EARNED':
      case 'BONUS':
      case 'REFUND':
        return 'positive';
      case 'SPENT':
        return 'negative';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="credit-display-section">
      <div className="section-header">
        <h2>Credits & Usage</h2>
        <button
          onClick={refreshCredits}
          className="refresh-btn"
          title="Refresh credits"
        >
          🔄
        </button>
      </div>

      <div className="credit-summary">
        <div className="credit-card">
          <div className="credit-main">
            <div className="credit-amount">
              <span className="credit-number">{credits?.current || 0}</span>
              <span className="credit-label">Available Credits</span>
            </div>
            <div className="credit-icon">💎</div>
          </div>

          <div className="credit-stats">
            <div className="stat-item">
              <span className="stat-value">{credits?.totalEarned || 0}</span>
              <span className="stat-label">Total Earned</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{credits?.totalSpent || 0}</span>
              <span className="stat-label">Total Spent</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{credits?.thisMonth || 0}</span>
              <span className="stat-label">This Month</span>
            </div>
          </div>
        </div>

        <div className="credit-info">
          <h4>How Credits Work</h4>
          <ul>
            <li>Each chat message costs 1 credit</li>
            <li>New users get 50 free credits</li>
            <li>Credits never expire</li>
            <li>Upgrade your plan for more credits</li>
          </ul>
        </div>
      </div>

      <div className="credit-transactions">
        <button
          onClick={() => setShowTransactions(!showTransactions)}
          className="toggle-transactions-btn"
        >
          {showTransactions ? 'Hide' : 'Show'} Transaction History
          <span className={`arrow ${showTransactions ? 'up' : 'down'}`}>▼</span>
        </button>

        {showTransactions && (
          <div className="transactions-list">
            {loading ? (
              <div className="loading-transactions">
                <div className="spinner"></div>
                <p>Loading transactions...</p>
              </div>
            ) : transactions.length > 0 ? (
              <div className="transactions">
                {transactions.map((transaction, index) => (
                  <div key={index} className="transaction-item">
                    <div className="transaction-icon">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="transaction-details">
                      <div className="transaction-description">
                        {transaction.description || `${transaction.type.toLowerCase()} credits`}
                      </div>
                      <div className="transaction-date">
                        {formatDate(transaction.createdAt)}
                      </div>
                    </div>
                    <div className={`transaction-amount ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'SPENT' ? '-' : '+'}
                      {Math.abs(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-transactions">
                <p>No transactions found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditDisplay;
