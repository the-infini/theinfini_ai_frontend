import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import subscriptionService from '../../../services/subscriptionService';
import './CreditMonitor.css';

const CreditMonitor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadSubscription();
      // Refresh subscription data every 30 seconds
      const interval = setInterval(loadSubscription, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      setError('');
      const response = await subscriptionService.getCurrentSubscription();
      if (response.success) {
        setSubscription(response.data);
      }
    } catch (err) {
      console.error('Failed to load subscription:', err);
      setError('Unable to load credit information');
    } finally {
      setLoading(false);
    }
  };

  const getCreditsDisplay = () => {
    if (!subscription) return 'N/A';
    
    if (subscription.planType === 'PRO') {
      return 'Unlimited';
    }
    
    return subscription.creditsRemaining || 0;
  };

  const getCreditsPercentage = () => {
    if (!subscription || subscription.planType === 'PRO') return 100;
    
    const total = subscription.creditsTotal || 1;
    const remaining = subscription.creditsRemaining || 0;
    return Math.max(0, Math.min(100, (remaining / total) * 100));
  };

  const getStatusColor = () => {
    const percentage = getCreditsPercentage();
    if (percentage > 50) return '#10b981'; // Green
    if (percentage > 20) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const isLowCredits = () => {
    if (subscription?.planType === 'PRO') return false;
    return getCreditsPercentage() < 20;
  };

  const formatResetDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const handleUpgrade = () => {
    navigate('/pricing-billing');
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="credit-monitor">
        <div className="credit-monitor__loading">
          <div className="spinner-small"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="credit-monitor">
        <div className="credit-monitor__error">
          <span className="error-icon">⚠️</span>
          <span className="error-text">Credits unavailable</span>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="credit-monitor">
        <div className="credit-monitor__no-subscription">
          <div className="no-sub-content">
            <span className="no-sub-icon">💳</span>
            <span className="no-sub-text">No active plan</span>
            <button 
              className="upgrade-btn-small"
              onClick={handleUpgrade}
            >
              Choose Plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="credit-monitor">
      <div className="credit-monitor__header">
        <span className="plan-name">{subscriptionService.formatPlanType(subscription.planType)}</span>
        <span 
          className="plan-status"
          style={{ color: subscriptionService.getStatusColor(subscription.status) }}
        >
          {subscription.status}
        </span>
      </div>

      <div className="credit-monitor__credits">
        <div className="credits-info">
          <span className="credits-amount">{getCreditsDisplay()}</span>
          <span className="credits-label">
            {subscription.planType === 'PRO' ? 'Credits' : 'Credits left'}
          </span>
        </div>

        {subscription.planType !== 'PRO' && (
          <div className="credits-bar">
            <div 
              className="credits-fill"
              style={{ 
                width: `${getCreditsPercentage()}%`,
                backgroundColor: getStatusColor()
              }}
            ></div>
          </div>
        )}
      </div>

      {subscription.resetDate && subscription.planType !== 'PRO' && (
        <div className="credit-monitor__reset">
          <span className="reset-text">
            Resets {formatResetDate(subscription.resetDate)}
          </span>
        </div>
      )}

      {isLowCredits() && (
        <div className="credit-monitor__warning">
          <span className="warning-icon">⚠️</span>
          <span className="warning-text">Low credits!</span>
          <button 
            className="upgrade-btn-small"
            onClick={handleUpgrade}
          >
            Upgrade
          </button>
        </div>
      )}
    </div>
  );
};

export default CreditMonitor;
