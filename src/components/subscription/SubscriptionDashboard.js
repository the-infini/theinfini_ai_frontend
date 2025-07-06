import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import subscriptionService from '../../services/subscriptionService';
import './SubscriptionDashboard.css';

const SubscriptionDashboard = ({ currentSubscription, onUpdate }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const handleCancelSubscription = async () => {
    try {
      setCancelling(true);
      const response = await subscriptionService.cancelSubscription(cancelReason);
      if (response.success) {
        setShowCancelModal(false);
        setCancelReason('');
        onUpdate();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    return subscriptionService.getStatusColor(status);
  };

  const getPlanColor = (planType) => {
    return subscriptionService.getPlanColor(planType);
  };

  const formatPlanType = (planType) => {
    return subscriptionService.formatPlanType(planType);
  };

  const getCreditsDisplay = () => {
    if (!currentSubscription) return 'N/A';

    // Check if it's a PRO plan or unlimited credits
    if (currentSubscription.plan?.isUnlimitedCredits || currentSubscription.planType === 'PRO') {
      return 'Unlimited';
    }

    // Use the new API structure: totalCredits and remainingCredits
    const remaining = currentSubscription.remainingCredits || 0;
    const total = currentSubscription.totalCredits || 0;

    return `${remaining.toLocaleString()} / ${total.toLocaleString()}`;
  };

  const getCreditsPercentage = () => {
    if (!currentSubscription) return 100;

    // Check if it's a PRO plan or unlimited credits
    if (currentSubscription.plan?.isUnlimitedCredits || currentSubscription.planType === 'PRO') {
      return 100;
    }

    // Use the new API structure: totalCredits and remainingCredits
    const remaining = currentSubscription.remainingCredits || 0;
    const total = currentSubscription.totalCredits || 1;

    return (remaining / total) * 100;
  };

  const getProjectsDisplay = () => {
    if (!currentSubscription) return 'N/A';

    const remaining = currentSubscription.remainingProjects || 0;
    const total = currentSubscription.totalProjects || 0;

    return `${remaining} / ${total}`;
  };

  const getProjectsPercentage = () => {
    if (!currentSubscription) return 100;

    const remaining = currentSubscription.remainingProjects || 0;
    const total = currentSubscription.totalProjects || 1;

    return (remaining / total) * 100;
  };

  const getFilesDisplay = () => {
    if (!currentSubscription) return 'N/A';

    const remaining = currentSubscription.remainingFilesPerDay || 0;
    const total = currentSubscription.totalFilesPerDay || 0;

    return `${remaining} / ${total}`;
  };

  const getFilesPercentage = () => {
    if (!currentSubscription) return 100;

    const remaining = currentSubscription.remainingFilesPerDay || 0;
    const total = currentSubscription.totalFilesPerDay || 1;

    return (remaining / total) * 100;
  };

  if (!user) {
    return (
      <div className="subscription-dashboard">
        <div className="auth-required">
          <h3>Authentication Required</h3>
          <p>Please sign in to view your subscription details.</p>
          <button 
            className="signin-btn"
            onClick={() => navigate('/signin')}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!currentSubscription) {
    return (
      <div className="subscription-dashboard">
        <div className="no-subscription">
          <h3>No Active Subscription</h3>
          <p>You don't have an active subscription. Choose a plan to get started.</p>
          <button 
            className="view-plans-btn"
            onClick={() => navigate('/pricing-billing')}
          >
            View Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-dashboard">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Current Plan Overview */}
      <div className="dashboard-section">
        <h3>Current Plan</h3>
        <div className="plan-overview">
          <div className="plan-info">
            <div className="plan-name-status">
              <h4
                className="plan-name"
                style={{ color: getPlanColor(currentSubscription.plan?.type || currentSubscription.planType) }}
              >
                {currentSubscription.plan?.name || formatPlanType(currentSubscription.planType)}
              </h4>
              <span
                className="plan-status"
                style={{ color: getStatusColor(currentSubscription.subscription?.status || currentSubscription.status) }}
              >
                {currentSubscription.subscription?.status || currentSubscription.status}
              </span>
            </div>
            <div className="plan-details">
              <div className="detail-item">
                <span className="label">Started:</span>
                <span className="value">{formatDate(currentSubscription.subscription?.startDate || currentSubscription.startDate)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Status:</span>
                <span className="value" style={{ color: getStatusColor(currentSubscription.subscription?.status || currentSubscription.status) }}>
                  {currentSubscription.subscription?.status || currentSubscription.status}
                </span>
              </div>
              {(currentSubscription.subscription?.nextBillingDate || currentSubscription.nextBillingDate) && (
                <div className="detail-item">
                  <span className="label">Next Billing:</span>
                  <span className="value">{formatDate(currentSubscription.subscription?.nextBillingDate || currentSubscription.nextBillingDate)}</span>
                </div>
              )}
              {currentSubscription.plan && (
                <div className="detail-item">
                  <span className="label">Plan:</span>
                  <span className="value">{currentSubscription.plan.name}</span>
                </div>
              )}
              {currentSubscription.plan?.price && (
                <div className="detail-item">
                  <span className="label">Price:</span>
                  <span className="value">₹{currentSubscription.plan.price.toLocaleString()} / {currentSubscription.plan.billingCycle?.toLowerCase()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Credits Usage */}
      <div className="dashboard-section">
        <h3>Credits Usage</h3>
        <div className="credits-overview">
          <div className="usage-stats-grid">
            {/* Credits */}
            <div className="usage-stat-item">
              <div className="usage-stat-header">
                <span className="usage-stat-value">{getCreditsDisplay()}</span>
                <span className="usage-stat-label">Credits</span>
              </div>
              {currentSubscription.planType !== 'PRO' && !currentSubscription.plan?.isUnlimitedCredits && (
                <div className="usage-stat-bar">
                  <div
                    className="usage-stat-fill"
                    style={{ width: `${getCreditsPercentage()}%` }}
                  ></div>
                </div>
              )}
            </div>

            {/* Projects */}
            <div className="usage-stat-item">
              <div className="usage-stat-header">
                <span className="usage-stat-value">{getProjectsDisplay()}</span>
                <span className="usage-stat-label">Projects</span>
              </div>
              <div className="usage-stat-bar">
                <div
                  className="usage-stat-fill"
                  style={{ width: `${getProjectsPercentage()}%` }}
                ></div>
              </div>
            </div>

            {/* Files per Day */}
            <div className="usage-stat-item">
              <div className="usage-stat-header">
                <span className="usage-stat-value">{getFilesDisplay()}</span>
                <span className="usage-stat-label">Files per Day</span>
              </div>
              <div className="usage-stat-bar">
                <div
                  className="usage-stat-fill"
                  style={{ width: `${getFilesPercentage()}%` }}
                ></div>
              </div>
            </div>
          </div>

          {(currentSubscription.subscription?.nextBillingDate || currentSubscription.resetDate) && (
            <div className="credits-reset">
              <span>Credits reset on: {formatDate(currentSubscription.subscription?.nextBillingDate || currentSubscription.resetDate)}</span>
            </div>
          )}
        </div>
      </div>





      {/* Plan Actions */}
      {(currentSubscription.subscription?.status === 'ACTIVE' || currentSubscription.status === 'ACTIVE') &&
       (currentSubscription.plan?.type !== 'EXPLORER' && currentSubscription.planType !== 'EXPLORER') && (
        <div className="dashboard-section">
          <h3>Plan Management</h3>
          <div className="plan-actions">
            <button 
              className="cancel-btn"
              onClick={() => setShowCancelModal(true)}
            >
              Cancel Subscription
            </button>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Cancel Subscription</h3>
            <p>Are you sure you want to cancel your subscription? This action cannot be undone.</p>
            
            <div className="form-group">
              <label>Reason for cancellation (optional):</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Help us improve by sharing why you're cancelling..."
                rows={3}
              />
            </div>

            <div className="modal-actions">
              <button 
                className="cancel-modal-btn"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
              >
                Keep Subscription
              </button>
              <button 
                className="confirm-cancel-btn"
                onClick={handleCancelSubscription}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionDashboard;
