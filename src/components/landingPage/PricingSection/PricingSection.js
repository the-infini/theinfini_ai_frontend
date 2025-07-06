import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import subscriptionService from '../../../services/subscriptionService';
import './PricingSection.css';

const PricingSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Loading plans for landing page pricing section');
      const response = await subscriptionService.getPlans();
      console.log('✅ Plans loaded for pricing section:', response);
      
      if (response.success) {
        const plansWithPopular = (response.data.plans || []).map(plan => ({
          ...plan,
          popular: plan.type === 'CREATOR' // Mark Creator as popular
        }));
        setPlans(plansWithPopular);
      }
    } catch (err) {
      console.log('❌ Failed to load plans, using fallback data:', err);
      setError('Unable to load current pricing. Please visit our pricing page for the latest information.');
      
      // Fallback plans based on documentation
      setPlans([
        {
          type: 'EXPLORER',
          name: 'Explorer Plan',
          price: 0,
          billingCycle: 'WEEKLY',
          credits: 30,
          isUnlimitedCredits: false,
          limits: { projects: 3 },
          features: { models: ['gpt-3.5-turbo'], support: 'standard' },
          isFree: true
        },
        {
          type: 'CREATOR',
          name: 'Creator Plan',
          price: 1299,
          billingCycle: 'MONTHLY',
          credits: 1500,
          isUnlimitedCredits: false,
          limits: { projects: 20 },
          features: { models: ['gpt-4o', 'claude-3-sonnet'], support: 'standard' },
          isFree: false,
          popular: true
        },
        {
          type: 'PRO',
          name: 'Pro Plan',
          price: 1899,
          billingCycle: 'MONTHLY',
          credits: 0,
          isUnlimitedCredits: true,
          limits: { projects: 100 },
          features: { models: ['all'], support: 'priority' },
          isFree: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = (plan) => {
    if (plan.type === 'EXPLORER') {
      // Free plan - direct to signup or chat
      if (user) {
        navigate('/chat');
      } else {
        navigate('/signup');
      }
    } else {
      // Paid plans - go to pricing page
      navigate('/pricing-billing');
    }
  };

  const formatPrice = (price, billingCycle) => {
    if (price === 0) return 'Free';
    const cycle = billingCycle === 'WEEKLY' ? 'week' :
                  billingCycle === 'MONTHLY' ? 'month' :
                  billingCycle === 'ONE_TIME' ? 'one-time' : billingCycle.toLowerCase();
    return `₹${price.toLocaleString()}/${cycle}`;
  };

  const getFeaturesList = (plan) => {
    const features = [];

    // Credits
    if (plan.isUnlimitedCredits) {
      features.push('Unlimited credits');
    } else {
      const cycle = plan.billingCycle === 'WEEKLY' ? 'week' :
                    plan.billingCycle === 'MONTHLY' ? 'month' : 'purchase';
      features.push(`${plan.credits} credits per ${cycle}`);
    }

    // Projects
    if (plan.limits?.projects) {
      features.push(`${plan.limits.projects} projects`);
    }

    // Models
    if (plan.features?.models) {
      if (plan.features.models.includes('all')) {
        features.push('All AI models');
      } else if (plan.features.models.length > 0) {
        features.push(`${plan.features.models.length} AI models`);
      }
    }

    // Support
    if (plan.features?.support) {
      const supportText = plan.features.support === 'priority' ? 'Priority support' : 'Standard support';
      features.push(supportText);
    }

    return features;
  };

  if (loading) {
    return (
      <section id="pricing" className="pricing-section">
        <div className="container">
          <div className="pricing-header">
            <h2>Choose Your Plan</h2>
            <p>Loading pricing information...</p>
          </div>
          <div className="pricing-loading">
            <div className="spinner"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="pricing-section">
      <div className="container">
        <div className="pricing-header">
          <h2>Choose Your Plan</h2>
          <p>Start free and scale as you grow. All plans include access to our powerful AI assistant.</p>
          {error && (
            <div className="pricing-error">
              <p>{error}</p>
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/pricing-billing')}
              >
                View Full Pricing
              </button>
            </div>
          )}
        </div>

        <div className="pricing-grid">
          {plans.filter(plan => plan.type !== 'ADDON').map((plan) => (
            <div
              key={plan.type}
              className={`pricing-card ${plan.popular ? 'pricing-card--popular' : ''}`}
            >
              {plan.popular && (
                <div className="pricing-badge">Most Popular</div>
              )}

              <div className="pricing-card-header">
                <h3>{plan.name}</h3>
                <div className="pricing-price">
                  <span className="price-amount">{formatPrice(plan.price, plan.billingCycle)}</span>
                </div>
                <p className="pricing-description">
                  {plan.isUnlimitedCredits ? 'Unlimited' : plan.credits} credits • {plan.limits?.projects} projects
                </p>
              </div>

              <div className="pricing-features">
                <ul>
                  {getFeaturesList(plan).map((feature, index) => (
                    <li key={index}>
                      <span className="feature-icon">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pricing-card-footer">
                <button
                  className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} btn-full`}
                  onClick={() => handleGetStarted(plan)}
                >
                  {plan.type === 'EXPLORER'
                    ? (user ? 'Start Chatting' : 'Get Started Free')
                    : 'Choose Plan'
                  }
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pricing-footer">
          <p>
            Need more? Check out our{' '}
            <button 
              className="link-button"
              onClick={() => navigate('/pricing-billing')}
            >
              add-on packs
            </button>
            {' '}for extra credits and features.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
