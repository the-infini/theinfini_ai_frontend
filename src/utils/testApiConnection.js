// Test utility to verify API connection
import apiClient from '../services/apiClient';

export const testApiConnection = async () => {
  try {
    console.log('Testing API connection...');
    
    // Test health endpoint
    const healthResponse = await apiClient.get('/health');
    console.log('Health check:', healthResponse.data);
    
    // Test CSRF token
    const csrfResponse = await apiClient.get('/auth/csrf-token');
    console.log('CSRF token:', csrfResponse.data);
    
    return {
      success: true,
      health: healthResponse.data,
      csrf: csrfResponse.data
    };
  } catch (error) {
    console.error('API connection test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const testChatAPI = async () => {
  try {
    console.log('Testing chat APIs...');
    
    // Test getting threads (should require auth)
    const threadsResponse = await apiClient.get('/threads');
    console.log('Threads:', threadsResponse.data);
    
    return {
      success: true,
      threads: threadsResponse.data
    };
  } catch (error) {
    console.error('Chat API test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
