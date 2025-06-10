// Session Management Utility
// Handles session ID generation for simplified streaming API

class SessionManager {
  constructor() {
    this.sessionIdKey = 'sessionId';
  }

  /**
   * Generate a new session ID using crypto.randomUUID or fallback
   */
  generateSessionId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback for older browsers
    return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get or create a session ID for the current session
   */
  getOrCreateSessionId() {
    let sessionId = localStorage.getItem(this.sessionIdKey);
    
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem(this.sessionIdKey, sessionId);
      console.log('Generated new session ID:', sessionId);
    }
    
    return sessionId;
  }

  /**
   * Get the current session ID (without creating a new one)
   */
  getCurrentSessionId() {
    return localStorage.getItem(this.sessionIdKey);
  }

  /**
   * Set a specific session ID (useful when backend provides one)
   */
  setSessionId(sessionId) {
    if (sessionId) {
      localStorage.setItem(this.sessionIdKey, sessionId);
      console.log('Set session ID:', sessionId);
    }
  }

  /**
   * Clear the current session ID
   */
  clearSessionId() {
    localStorage.removeItem(this.sessionIdKey);
    console.log('Cleared session ID');
  }

  /**
   * Reset session for new conversation
   */
  resetSession() {
    this.clearSessionId();
    return this.getOrCreateSessionId();
  }

  /**
   * Get debug information about current session state
   */
  getDebugInfo() {
    return {
      currentSessionId: this.getCurrentSessionId(),
      timestamp: new Date().toISOString()
    };
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

// Expose to window for debugging in development
if (process.env.NODE_ENV === 'development') {
  window.sessionManager = sessionManager;
}

export default sessionManager;
