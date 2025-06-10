// CSRF Token Debugging Utility
import { refreshCSRFToken } from '../services/apiClient';
import apiClient from '../services/apiClient';
import sessionManager from './sessionManager';
import csrfService from '../services/csrfService';

class CSRFDebugger {
  constructor() {
    this.enabled = process.env.NODE_ENV === 'development';
  }

  log(message, data = null) {
    if (!this.enabled) return;
    console.log(`🔐 CSRF Debug: ${message}`, data || '');
  }

  warn(message, data = null) {
    if (!this.enabled) return;
    console.warn(`🚨 CSRF Warning: ${message}`, data || '');
  }

  error(message, error = null) {
    if (!this.enabled) return;
    console.error(`❌ CSRF Error: ${message}`, error || '');
  }

  // Check current CSRF token status
  checkTokenStatus() {
    const token = localStorage.getItem('csrfToken');
    const authToken = localStorage.getItem('authToken');
    
    this.log('Token Status Check', {
      hasCSRFToken: !!token,
      hasAuthToken: !!authToken,
      csrfToken: token ? `${token.substring(0, 10)}...` : 'None',
      authToken: authToken ? `${authToken.substring(0, 10)}...` : 'None'
    });

    return {
      hasCSRFToken: !!token,
      hasAuthToken: !!authToken,
      csrfToken: token,
      authToken: authToken
    };
  }

  // Test CSRF token by making a simple authenticated request
  async testCSRFToken() {
    if (!this.enabled) return;

    this.log('Testing CSRF token...');
    
    try {
      const response = await apiClient.get('/auth/csrf-token');
      this.log('CSRF token test successful', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      this.error('CSRF token test failed', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  // Manually refresh CSRF token and test it
  async refreshAndTest() {
    if (!this.enabled) return;

    this.log('Refreshing CSRF token...');
    
    try {
      const newToken = await refreshCSRFToken();
      this.log('CSRF token refreshed successfully', `${newToken.substring(0, 10)}...`);
      
      // Test the new token
      const testResult = await this.testCSRFToken();
      return { success: true, token: newToken, testResult };
    } catch (error) {
      this.error('Failed to refresh CSRF token', error);
      return { success: false, error: error.message };
    }
  }

  // Test a specific API endpoint
  async testEndpoint(method = 'GET', endpoint = '/projects') {
    if (!this.enabled) return;

    this.log(`Testing endpoint: ${method} ${endpoint}`);
    
    try {
      let response;
      switch (method.toUpperCase()) {
        case 'GET':
          response = await apiClient.get(endpoint);
          break;
        case 'POST':
          response = await apiClient.post(endpoint, {});
          break;
        case 'PUT':
          response = await apiClient.put(endpoint, {});
          break;
        case 'DELETE':
          response = await apiClient.delete(endpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      
      this.log(`Endpoint test successful: ${method} ${endpoint}`, response.data);
      return { success: true, data: response.data };
    } catch (error) {
      this.error(`Endpoint test failed: ${method} ${endpoint}`, error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  // Clear all tokens (for testing)
  clearTokens() {
    if (!this.enabled) return;

    this.log('Clearing all tokens...');
    localStorage.removeItem('csrfToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    this.log('All tokens cleared');
  }

  // Get comprehensive debug info
  getDebugInfo() {
    if (!this.enabled) return {};

    const tokenStatus = this.checkTokenStatus();
    const sessionInfo = sessionManager.getDebugInfo();
    const csrfInfo = csrfService.getDebugInfo();
    const localStorage_keys = Object.keys(localStorage);
    const relevantKeys = localStorage_keys.filter(key =>
      key.includes('token') || key.includes('csrf') || key.includes('auth') || key.includes('user') || key.includes('session')
    );

    const debugInfo = {
      tokenStatus,
      sessionInfo,
      csrfInfo,
      localStorage: {},
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    relevantKeys.forEach(key => {
      const value = localStorage.getItem(key);
      debugInfo.localStorage[key] = value ? `${value.substring(0, 20)}...` : value;
    });

    return debugInfo;
  }

  // Log comprehensive debug info
  logDebugInfo() {
    if (!this.enabled) return;

    const debugInfo = this.getDebugInfo();
    console.group('🔐 CSRF Debug Info');
    console.table(debugInfo.tokenStatus);
    console.log('Session Info:', debugInfo.sessionInfo);
    console.log('CSRF Service Info:', debugInfo.csrfInfo);
    console.log('LocalStorage:', debugInfo.localStorage);
    console.log('Full Debug Info:', debugInfo);
    console.groupEnd();
  }

  // Test session consistency
  testSessionConsistency() {
    if (!this.enabled) return;

    this.log('Testing session consistency...');
    const isConsistent = sessionManager.validateSessionConsistency();
    const sessionInfo = sessionManager.getDebugInfo();

    if (isConsistent) {
      this.log('✅ Session consistency check passed', sessionInfo);
    } else {
      this.warn('❌ Session consistency check failed', sessionInfo);
    }

    return { isConsistent, sessionInfo };
  }
}

// Create singleton instance
const csrfDebugger = new CSRFDebugger();

// Expose to window for manual testing in dev tools
if (process.env.NODE_ENV === 'development') {
  window.csrfDebugger = csrfDebugger;
}

export default csrfDebugger;
