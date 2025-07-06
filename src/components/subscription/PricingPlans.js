import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import subscriptionService from '../../services/subscriptionService';
import RazorpayCheckout from './RazorpayCheckout';
import './PricingPlans.css';

const PricingPlans = ({ plans, currentSubscription, onUpdate }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [orderData, setOrderData] = useState(null);

  const handleSubscribe = async (plan) => {
    if (!user) {
      navigate('/signin');
      return;
    }

    if (plan.type === 'EXPLORER') {
      // Explorer is free, no payment needed
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await subscriptionService.createSubscriptionOrder(plan.type);
      if (response.success) {
        setSelectedPlan(plan);
        setOrderData(response.data);
        setShowCheckout(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddonPurchase = async () => {
    if (!user) {
      navigate('/signin');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await subscriptionService.createAddonOrder();
      if (response.success) {
        setSelectedPlan({ planType: 'ADDON', name: 'Add-on Pack' });
        setOrderData(response.data);
        setShowCheckout(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
    setOrderData(null);
    onUpdate();
  };

  const handlePaymentError = (error) => {
    setError(error);
    setShowCheckout(false);
  };

  const isCurrentPlan = (planType) => {
    return currentSubscription?.planType === planType;
  };

  const canUpgrade = (planType) => {
    if (!currentSubscription) return true;

    const planHierarchy = { 'EXPLORER': 0, 'CREATOR': 1, 'PRO': 2 };
    const currentLevel = planHierarchy[currentSubscription.planType] || 0;
    const targetLevel = planHierarchy[planType] || 0;

    return targetLevel > currentLevel;
  };

  const getButtonText = (plan) => {
    if (!user) return 'Sign In to Subscribe';
    if (isCurrentPlan(plan.type)) return 'Current Plan';
    if (plan.type === 'EXPLORER') return 'Free Plan';
    if (canUpgrade(plan.type)) return 'Upgrade';
    return 'Subscribe';
  };

  const getButtonDisabled = (plan) => {
    return loading || isCurrentPlan(plan.type) ||
           (plan.type === 'EXPLORER' && currentSubscription?.planType !== 'EXPLORER');
  };

  const formatBillingCycle = (cycle) => {
    switch(cycle) {
      case 'WEEKLY': return 'week';
      case 'MONTHLY': return 'month';
      case 'ONE_TIME': return 'one-time';
      default: return cycle?.toLowerCase() || 'month';
    }
  };

  const getFeaturesList = (plan) => {
    const features = [];

    // Add models info
    if (plan.features?.models) {
      if (plan.features.models.includes('all')) {
        features.push('All AI models');
      } else {
        features.push(`${plan.features.models.length} AI models`);
      }
    }

    // Add support info
    if (plan.features?.support) {
      const supportText = plan.features.support === 'priority' ? 'Priority support' : 'Standard support';
      features.push(supportText);
    }

    // Add file limits
    if (plan.limits?.filesPerDay) {
      features.push(`${plan.limits.filesPerDay} files per day`);
    }

    return features;
  };

  if (!plans || plans.length === 0) {
    return (
      <div className="pricing-plans-container">
        <div className="no-plans">
          <h3>No Plans Available</h3>
          <p>Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pricing-plans-container">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="plans-grid">
        {plans.filter(plan => plan && plan.type && plan.type !== 'ADDON').map((plan) => (
          <div
            key={plan.type}
            className={`plan-card ${isCurrentPlan(plan.type) ? 'current-plan' : ''} ${plan.popular ? 'popular' : ''}`}
          >
            {plan.popular && (
              <div className="popular-badge">Most Popular</div>
            )}

            <div className="plan-header">
              <h3 className="plan-name">{plan.name || 'Unknown Plan'}</h3>
              <div className="plan-price">
                <span className="currency">₹</span>
                <span className="amount">{plan.price || 0}</span>
                <span className="period">/{formatBillingCycle(plan.billingCycle)}</span>
              </div>
              {plan.originalPrice && plan.originalPrice > (plan.price || 0) && (
                <div className="original-price">₹{plan.originalPrice}</div>
              )}
            </div>

            <div className="plan-features">
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span>{plan.isUnlimitedCredits ? 'Unlimited' : (plan.credits || 0)} credits</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📁</span>
                <span>{plan.limits?.projects || 0} projects</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🤖</span>
                <span>{plan.features?.models?.includes('all') ? 'All models' : `${plan.features?.models?.length || 0} models`}</span>
              </div>
              {getFeaturesList(plan).map((feature, index) => (
                <div key={index} className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <button
              className={`plan-button ${isCurrentPlan(plan.type) ? 'current' : ''}`}
              onClick={() => handleSubscribe(plan)}
              disabled={getButtonDisabled(plan)}
            >
              {getButtonText(plan)}
            </button>
          </div>
        ))}
      </div>

      {/* Add-on Pack Section */}
      <div className="addon-section">
        <h3>Need More Credits?</h3>
        <div className="addon-card">
          <div className="addon-header">
            <h4>Add-on Pack</h4>
            <div className="addon-price">₹120 one-time</div>
          </div>
          <div className="addon-features">
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>100 credits (no expiry)</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📁</span>
              <span>+2 additional projects</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📎</span>
              <span>+10 file uploads</span>
            </div>
          </div>
          <button
            className="addon-button"
            onClick={handleAddonPurchase}
            disabled={loading || !user}
          >
            {!user ? 'Sign In to Purchase' : 'Purchase Add-on'}
          </button>
        </div>
      </div>

      {/* Razorpay Checkout Modal */}
      {showCheckout && orderData && (
        <RazorpayCheckout
          orderData={orderData}
          planName={selectedPlan?.name}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
};

export default PricingPlans;
