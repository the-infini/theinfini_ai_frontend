import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import subscriptionService from '../services/subscriptionService';
import PricingPlans from '../components/subscription/PricingPlans';
import SubscriptionDashboard from '../components/subscription/SubscriptionDashboard';
import PaymentHistory from '../components/subscription/PaymentHistory';
import './PricingBillingPage.css';

const PricingBillingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load plans (public endpoint)
      try {
        console.log('🔄 Attempting to fetch plans from: GET /api/subscription/plans');
        const plansResponse = await subscriptionService.getPlans();
        console.log('✅ Plans API response:', plansResponse);
        if (plansResponse.success) {
          const plansWithPopular = (plansResponse.data.plans || []).map(plan => ({
            ...plan,
            popular: plan.type === 'CREATOR' // Mark Creator as popular
          }));
          setPlans(plansWithPopular);
        }
      } catch (planError) {
        console.log('❌ Failed to load plans from API, using mock data:', planError);
        // Use mock data if API is not available
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
      }

      // Load current subscription if user is authenticated
      if (user) {
        try {
          console.log('🔄 Attempting to fetch current subscription: GET /api/subscription/current');
          const subscriptionResponse = await subscriptionService.getCurrentSubscription();
          console.log('✅ Subscription API response:', subscriptionResponse);
          if (subscriptionResponse.success) {
            setCurrentSubscription(subscriptionResponse.data);
          }
        } catch (subscriptionError) {
          // User might not have a subscription yet, which is fine
          console.log('❌ No current subscription found:', subscriptionError);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionUpdate = () => {
    // Reload subscription data after changes
    loadData();
  };

  const handleTabChange = async (tabId) => {
    setActiveTab(tabId);

    // If switching to overview tab, refresh subscription data
    if (tabId === 'overview' && user) {
      try {
        console.log('🔄 Refreshing subscription data for Overview tab: GET /api/subscription/current');
        const subscriptionResponse = await subscriptionService.getCurrentSubscription();
        console.log('✅ Overview tab subscription refresh response:', subscriptionResponse);
        if (subscriptionResponse.success) {
          setCurrentSubscription(subscriptionResponse.data);
        }
      } catch (subscriptionError) {
        console.log('❌ Failed to refresh subscription data:', subscriptionError);
        // Don't show error to user as this is just a refresh
      }
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'plans', label: 'Plans & Pricing', icon: '💳' },
    { id: 'history', label: 'Payment History', icon: '📋' }
  ];

  if (loading) {
    return (
      <div className="pricing-billing-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading subscription data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pricing-billing-container">
      <div className="pricing-billing-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/profile')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Profile
        </button>
        <h1>Pricing & Billing</h1>
        <p>Manage your subscription, view plans, and track payments</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="pricing-billing-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="pricing-billing-content">
        {activeTab === 'overview' && (
          <SubscriptionDashboard
            currentSubscription={currentSubscription}
            onUpdate={handleSubscriptionUpdate}
          />
        )}

        {activeTab === 'plans' && (
          <PricingPlans
            plans={plans}
            currentSubscription={currentSubscription}
            onUpdate={handleSubscriptionUpdate}
          />
        )}

        {activeTab === 'history' && user && (
          <PaymentHistory />
        )}

        {activeTab === 'history' && !user && (
          <div className="auth-required">
            <h3>Authentication Required</h3>
            <p>Please sign in to view your payment history.</p>
            <button 
              className="signin-btn"
              onClick={() => navigate('/signin')}
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingBillingPage;
