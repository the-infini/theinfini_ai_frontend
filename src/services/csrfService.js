import axios from 'axios';
import sessionManager from '../utils/sessionManager';

class CSRFService {
  // Get CSRF token from server with session ID consistency
  async getCSRFToken(sessionId = null) {
    try {
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5529/api';

      // Use provided session ID or get/create one
      const effectiveSessionId = sessionId || sessionManager.getOrCreateSessionId();

      // Include session ID in request headers for consistency
      const headers = {
        'X-Session-ID': effectiveSessionId
      };

      // Also include auth token if available
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      console.log('Requesting CSRF token with session ID:', effectiveSessionId);

      const response = await axios.get(`${baseURL}/auth/csrf-token`, {
        headers
      });

      if (response.data.success) {
        const { csrfToken, sessionId: returnedSessionId } = response.data.data;

        // Store the CSRF token
        localStorage.setItem('csrfToken', csrfToken);

        // Store the session ID that was used for CSRF token generation
        if (returnedSessionId) {
          sessionManager.setCSRFSessionId(returnedSessionId);
          // Update current session ID if backend provided a different one
          if (returnedSessionId !== effectiveSessionId) {
            console.log('Backend returned different session ID, updating:', returnedSessionId);
            sessionManager.setSessionId(returnedSessionId);
          }
        } else {
          // If backend didn't return session ID, store the one we sent
          sessionManager.setCSRFSessionId(effectiveSessionId);
        }

        console.log('CSRF token obtained successfully with session ID:', returnedSessionId || effectiveSessionId);
        return csrfToken;
      }

      throw new Error('Failed to get CSRF token');
    } catch (error) {
      console.error('Error getting CSRF token:', error);
      throw error;
    }
  }

  // Get stored CSRF token
  getStoredCSRFToken() {
    return localStorage.getItem('csrfToken');
  }

  // Clear CSRF token and related session data
  clearCSRFToken() {
    localStorage.removeItem('csrfToken');
    // Clear the CSRF session ID but keep the current session ID
    localStorage.removeItem('csrfSessionId');
  }

  // Ensure CSRF token is available with session consistency
  async ensureCSRFToken(forceRefresh = false) {
    let token = this.getStoredCSRFToken();

    // Check if we need to refresh the token
    if (!token || forceRefresh) {
      // Ensure session consistency before getting new token
      const sessionId = sessionManager.ensureConsistentSessionId();
      token = await this.getCSRFToken(sessionId);
    } else {
      // Validate session consistency with existing token
      if (!sessionManager.validateSessionConsistency()) {
        console.warn('Session inconsistency detected, refreshing CSRF token');
        const sessionId = sessionManager.ensureConsistentSessionId();
        token = await this.getCSRFToken(sessionId);
      }
    }

    return token;
  }

  // Get session ID that should be used with current CSRF token
  getCSRFSessionId() {
    return sessionManager.getCSRFSessionId();
  }

  // Validate that current session is consistent with CSRF token
  validateSessionConsistency() {
    return sessionManager.validateSessionConsistency();
  }

  // Get debug information about CSRF and session state
  getDebugInfo() {
    const csrfToken = this.getStoredCSRFToken();
    const sessionInfo = sessionManager.getDebugInfo();

    return {
      hasCsrfToken: !!csrfToken,
      csrfTokenPreview: csrfToken ? `${csrfToken.substring(0, 10)}...` : null,
      sessionInfo,
      timestamp: new Date().toISOString()
    };
  }
}

const csrfService = new CSRFService();
export default csrfService;
