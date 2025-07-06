import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import subscriptionService from '../../services/subscriptionService';
import './RazorpayCheckout.css';

const RazorpayCheckout = ({ orderData, planName, onSuccess, onError, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      // Script loaded, ready to show checkout
    };
    script.onerror = () => {
      setError('Failed to load payment gateway. Please try again.');
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = () => {
    if (!window.Razorpay) {
      setError('Payment gateway not loaded. Please refresh and try again.');
      return;
    }

    setLoading(true);
    setError('');

    const options = {
      key: orderData.razorpayKeyId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'the infini ai',
      description: `${planName} Subscription`,
      order_id: orderData.orderId,
      prefill: {
        name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
        email: user?.email || '',
        contact: user?.mobile || ''
      },
      theme: {
        color: '#fcd469'
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
          onClose();
        }
      },
      handler: async (response) => {
        try {
          setLoading(true);
          
          // Verify payment with backend
          const verificationData = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          };

          const verifyResponse = await subscriptionService.verifyPayment(verificationData);
          
          if (verifyResponse.success) {
            onSuccess();
          } else {
            onError('Payment verification failed. Please contact support.');
          }
        } catch (err) {
          onError(err.message || 'Payment verification failed');
        } finally {
          setLoading(false);
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    
    razorpay.on('payment.failed', (response) => {
      setLoading(false);
      onError(response.error.description || 'Payment failed');
    });

    razorpay.open();
  };

  const formatAmount = (amount) => {
    return (amount / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR'
    });
  };

  return (
    <div className="razorpay-checkout-overlay">
      <div className="razorpay-checkout-modal">
        <div className="checkout-header">
          <h3>Complete Payment</h3>
          <button 
            className="close-btn"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div className="checkout-content">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="payment-summary">
            <div className="summary-item">
              <span className="label">Plan:</span>
              <span className="value">{planName}</span>
            </div>
            <div className="summary-item">
              <span className="label">Amount:</span>
              <span className="value amount">{formatAmount(orderData.amount)}</span>
            </div>
            <div className="summary-item">
              <span className="label">Order ID:</span>
              <span className="value order-id">{orderData.orderId}</span>
            </div>
          </div>

          <div className="payment-info">
            <h4>Payment Information</h4>
            <ul>
              <li>Secure payment powered by Razorpay</li>
              <li>Supports all major cards, UPI, and net banking</li>
              <li>Your subscription will be activated immediately after payment</li>
              <li>You will receive a confirmation email</li>
            </ul>
          </div>

          <div className="checkout-actions">
            <button
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="pay-btn"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? 'Processing...' : `Pay ${formatAmount(orderData.amount)}`}
            </button>
          </div>
        </div>

        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Processing payment...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RazorpayCheckout;
