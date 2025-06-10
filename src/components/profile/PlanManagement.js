import React, { useState } from 'react';
import userService from '../../services/userService';

const PlanManagement = ({ profile, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const plans = {
    FREE: {
      name: 'Free',
      price: '$0/month',
      credits: '50 credits on signup',
      features: [
        'Basic AI chat',
        '50 initial credits',
        'Standard response time',
        'Community support'
      ],
      color: '#6b7280'
    },
    PREMIUM: {
      name: 'Premium',
      price: '$9.99/month',
      credits: '1000 credits/month',
      features: [
        'Advanced AI models',
        '1000 monthly credits',
        'Priority response time',
        'Email support',
        'Chat history export'
      ],
      color: '#fcd469'
    },
    ENTERPRISE: {
      name: 'Enterprise',
      price: '$29.99/month',
      credits: 'Unlimited credits',
      features: [
        'All AI models',
        'Unlimited credits',
        'Fastest response time',
        'Priority support',
        'Advanced analytics',
        'Custom integrations',
        'Team collaboration'
      ],
      color: '#8b5cf6'
    }
  };

  const currentPlan = profile?.plan || 'FREE';

  const handlePlanChange = async (newPlan) => {
    if (newPlan === currentPlan) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await userService.updatePlan(newPlan);
      if (response.success) {
        onUpdate(response.data.profile);
        setSuccess(`Successfully upgraded to ${plans[newPlan].name} plan!`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPlanBadge = (planKey) => {
    const plan = plans[planKey];
    return (
      <span 
        className={`plan-badge ${planKey.toLowerCase()}`}
        style={{ backgroundColor: plan.color }}
      >
        {plan.name}
      </span>
    );
  };

  return (
    <div className="plan-management-section">
      <div className="section-header">
        <h2>Subscription Plan</h2>
        <div className="current-plan">
          Current: {getPlanBadge(currentPlan)}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="plans-grid">
        {Object.entries(plans).map(([planKey, plan]) => (
          <div 
            key={planKey}
            className={`plan-card ${planKey.toLowerCase()} ${currentPlan === planKey ? 'current' : ''}`}
          >
            <div className="plan-header">
              <h3>{plan.name}</h3>
              <div className="plan-price">{plan.price}</div>
              <div className="plan-credits">{plan.credits}</div>
            </div>

            <div className="plan-features">
              <ul>
                {plan.features.map((feature, index) => (
                  <li key={index}>
                    <span className="feature-check">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="plan-action">
              {currentPlan === planKey ? (
                <button className="current-plan-btn" disabled>
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => handlePlanChange(planKey)}
                  className={`upgrade-btn ${planKey.toLowerCase()}`}
                  disabled={loading}
                  style={{ backgroundColor: plan.color }}
                >
                  {loading ? 'Processing...' : 
                   planKey === 'FREE' ? 'Downgrade' : 'Upgrade'}
                </button>
              )}
            </div>

            {currentPlan === planKey && (
              <div className="current-plan-indicator">
                <span>✓ Active</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="plan-info">
        <h4>Plan Benefits</h4>
        <div className="benefits-comparison">
          <div className="benefit-item">
            <strong>Credits:</strong> Use credits to send messages to AI. Each message costs 1 credit.
          </div>
          <div className="benefit-item">
            <strong>Response Time:</strong> Higher plans get priority processing for faster responses.
          </div>
          <div className="benefit-item">
            <strong>AI Models:</strong> Premium and Enterprise plans have access to more advanced AI models.
          </div>
          <div className="benefit-item">
            <strong>Support:</strong> Get better support with higher-tier plans.
          </div>
        </div>

        <div className="billing-info">
          <p><strong>Billing:</strong> Plans are billed monthly. You can upgrade or downgrade at any time.</p>
          <p><strong>Credits:</strong> Unused credits roll over to the next month (except for Free plan).</p>
        </div>
      </div>
    </div>
  );
};

export default PlanManagement;
