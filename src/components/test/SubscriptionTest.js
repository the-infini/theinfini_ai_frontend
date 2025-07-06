import React, { useState, useEffect } from 'react';
import subscriptionService from '../../services/subscriptionService';

const SubscriptionTest = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rawResponse, setRawResponse] = useState(null);

  useEffect(() => {
    testSubscriptionAPI();
  }, []);

  const testSubscriptionAPI = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🧪 Testing subscription API...');
      console.log('🔗 API Base URL:', process.env.REACT_APP_API_URL || 'http://localhost:5529/api');
      
      const response = await subscriptionService.getPlans();
      console.log('✅ API Response:', response);
      
      setRawResponse(response);
      
      if (response.success) {
        setPlans(response.data.plans || []);
        console.log('✅ Plans loaded:', response.data.plans);
      } else {
        setError('API returned success: false');
      }
    } catch (err) {
      console.error('❌ API Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🧪 Subscription API Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Status:</h3>
        {loading && <p style={{ color: 'orange' }}>⏳ Loading...</p>}
        {error && <p style={{ color: 'red' }}>❌ Error: {error}</p>}
        {!loading && !error && <p style={{ color: 'green' }}>✅ Success!</p>}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Configuration:</h3>
        <p><strong>API Base URL:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:5529/api'}</p>
        <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
      </div>

      {rawResponse && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Raw API Response:</h3>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '200px'
          }}>
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
        </div>
      )}

      <div>
        <h3>Parsed Plans ({plans.length}):</h3>
        {plans.map((plan, index) => (
          <div key={plan.id || index} style={{ 
            border: '1px solid #ddd', 
            padding: '10px', 
            margin: '10px 0',
            borderRadius: '4px'
          }}>
            <h4>{plan.name || plan.type}</h4>
            <p><strong>Type:</strong> {plan.type}</p>
            <p><strong>Price:</strong> ₹{plan.price}/{plan.billingCycle}</p>
            <p><strong>Credits:</strong> {plan.isUnlimitedCredits ? 'Unlimited' : plan.credits}</p>
            <p><strong>Projects:</strong> {plan.limits?.projects}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={testSubscriptionAPI} style={{
          padding: '10px 20px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          🔄 Retry API Call
        </button>
      </div>
    </div>
  );
};

export default SubscriptionTest;
