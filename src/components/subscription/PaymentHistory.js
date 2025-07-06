import React, { useState, useEffect } from 'react';
import subscriptionService from '../../services/subscriptionService';
import './PaymentHistory.css';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [pagination, setPagination] = useState({
    limit: 10,
    offset: 0,
    total: 0,
    hasMore: false
  });

  useEffect(() => {
    loadPaymentHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.offset]);

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      setError('');

      console.log(`🔄 Attempting to fetch payment history: GET /api/payment/history?limit=${pagination.limit}&offset=${pagination.offset}`);
      const response = await subscriptionService.getPaymentHistory(
        pagination.limit,
        pagination.offset
      );
      console.log('✅ Payment history API response:', response);

      if (response.success) {
        const newPayments = pagination.offset === 0
          ? (response.data.transactions || [])
          : [...(payments || []), ...(response.data.transactions || [])];

        setPayments(newPayments);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.total || 0,
          hasMore: response.data.pagination?.hasMore || false
        }));
      }
    } catch (err) {
      console.log('❌ Failed to load payment history:', err);
      setError(err.message);
      // Set empty array if this is the first load
      if (pagination.offset === 0) {
        setPayments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && pagination.hasMore) {
      setPagination(prev => ({
        ...prev,
        offset: prev.offset + prev.limit
      }));
    }
  };

  const handleViewDetails = async (transactionId) => {
    try {
      setLoading(true);
      const response = await subscriptionService.getTransactionDetails(transactionId);
      if (response.success) {
        // Handle the new API response structure where transaction data is nested under data.transaction
        const transactionData = response.data.transaction || response.data;
        setSelectedTransaction(transactionData);
        setShowDetails(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceUrl, invoiceNumber) => {
    try {
      setError('');
      console.log(`🔄 Attempting to download invoice: ${invoiceUrl}`);
      await subscriptionService.downloadInvoice(invoiceUrl);
      console.log('✅ Invoice download initiated successfully');
    } catch (err) {
      console.log('❌ Failed to download invoice:', err);
      setError(`Failed to download invoice ${invoiceNumber}: ${err.message}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return subscriptionService.formatCurrency(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      'SUCCESS': '#10b981',
      'FAILED': '#ef4444',
      'PENDING': '#f59e0b',
      'REFUNDED': '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      'CARD': '💳',
      'UPI': '📱',
      'NETBANKING': '🏦',
      'WALLET': '👛'
    };
    return icons[method] || '💳';
  };

  if (loading && (!payments || payments.length === 0)) {
    return (
      <div className="payment-history">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading payment history...</p>
        </div>
      </div>
    );
  }

  if (error && (!payments || payments.length === 0)) {
    return (
      <div className="payment-history">
        <div className="error-state">
          <h3>Failed to Load Payment History</h3>
          <p>{error}</p>
          <button
            className="retry-btn"
            onClick={() => loadPaymentHistory()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="payment-history">
        <div className="empty-state">
          <h3>No Payment History</h3>
          <p>You haven't made any payments yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-history">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="payments-list">
        {(payments || []).filter(payment => payment && payment.id).map((payment) => (
          <div key={payment.id} className="payment-item">
            <div className="payment-main">
              <div className="payment-info">
                <div className="payment-header">
                  <span className="payment-method">
                    {getPaymentMethodIcon(payment.paymentMethod || 'CARD')}
                    {payment.paymentMethod || 'Unknown'}
                  </span>
                  <span
                    className="payment-status"
                    style={{ color: getStatusColor(payment.status || 'PENDING') }}
                  >
                    {payment.status || 'PENDING'}
                  </span>
                </div>
                <div className="payment-details">
                  <div className="payment-amount">
                    {formatCurrency(payment.amount || 0)}
                  </div>
                  <div className="payment-description">
                    {payment.type || 'Subscription Payment'}
                  </div>
                  <div className="payment-date">
                    {formatDate(payment.createdAt)}
                  </div>
                </div>
              </div>

              <div className="payment-actions">
                <button
                  className="details-btn"
                  onClick={() => handleViewDetails(payment.transactionId || payment.id)}
                >
                  View Details
                </button>
                {payment.hasInvoice && payment.invoiceUrl && (
                  <button
                    className="download-invoice-btn"
                    onClick={() => handleDownloadInvoice(payment.invoiceUrl, payment.invoiceNumber)}
                    title={`Download invoice ${payment.invoiceNumber || ''}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7,10 12,15 17,10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download Invoice
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {pagination.hasMore && (
        <div className="load-more-section">
          <button
            className="load-more-btn"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Transaction Details Modal */}
      {showDetails && selectedTransaction && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Transaction Details</h3>
              <button
                className="close-btn"
                onClick={() => setShowDetails(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="detail-row">
                <span className="label">Transaction ID:</span>
                <span className="value">{selectedTransaction.id || selectedTransaction.transactionId}</span>
              </div>
              <div className="detail-row">
                <span className="label">Amount:</span>
                <span className="value">{formatCurrency(selectedTransaction.amount || 0)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Currency:</span>
                <span className="value">{selectedTransaction.currency || 'INR'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span
                  className="value status"
                  style={{ color: getStatusColor(selectedTransaction.status) }}
                >
                  {selectedTransaction.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Payment Method:</span>
                <span className="value">
                  {getPaymentMethodIcon(selectedTransaction.paymentMethod)} {selectedTransaction.paymentMethod || 'Unknown'}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Date Created:</span>
                <span className="value">{formatDate(selectedTransaction.createdAt)}</span>
              </div>
              {selectedTransaction.paidAt && (
                <div className="detail-row">
                  <span className="label">Paid At:</span>
                  <span className="value">{formatDate(selectedTransaction.paidAt)}</span>
                </div>
              )}
              {selectedTransaction.razorpayOrderId && (
                <div className="detail-row">
                  <span className="label">Razorpay Order ID:</span>
                  <span className="value">{selectedTransaction.razorpayOrderId}</span>
                </div>
              )}
              {selectedTransaction.razorpayPaymentId && (
                <div className="detail-row">
                  <span className="label">Razorpay Payment ID:</span>
                  <span className="value">{selectedTransaction.razorpayPaymentId}</span>
                </div>
              )}
              {selectedTransaction.type && (
                <div className="detail-row">
                  <span className="label">Type:</span>
                  <span className="value">{selectedTransaction.type}</span>
                </div>
              )}
              {selectedTransaction.plan && (
                <div className="detail-row">
                  <span className="label">Plan:</span>
                  <span className="value">{selectedTransaction.plan.name} ({selectedTransaction.plan.type})</span>
                </div>
              )}
              {selectedTransaction.failureReason && (
                <div className="detail-row">
                  <span className="label">Failure Reason:</span>
                  <span className="value" style={{ color: '#ef4444' }}>{selectedTransaction.failureReason}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
