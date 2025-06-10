// API Payload Debugging Utility
class ApiPayloadDebugger {
  constructor() {
    this.enabled = process.env.NODE_ENV === 'development';
    this.interceptedRequests = [];
  }

  // Intercept and log API requests
  interceptRequest(url, method, data) {
    if (!this.enabled) return;

    const timestamp = new Date().toISOString();
    const requestInfo = {
      timestamp,
      url,
      method: method.toUpperCase(),
      data: JSON.parse(JSON.stringify(data)), // Deep clone
      issues: this.analyzePayload(data)
    };

    this.interceptedRequests.push(requestInfo);
    
    if (requestInfo.issues.length > 0) {
      console.warn('🚨 API Payload Issues Detected:', {
        url,
        method,
        issues: requestInfo.issues,
        payload: data
      });
    } else {
      console.log('✅ API Payload Clean:', {
        url,
        method,
        payload: data
      });
    }

    return requestInfo;
  }

  // Analyze payload for common issues
  analyzePayload(data) {
    const issues = [];

    if (!data || typeof data !== 'object') {
      return issues;
    }

    // Check for empty string values that should be null/undefined
    Object.entries(data).forEach(([key, value]) => {
      if (value === '') {
        issues.push({
          type: 'empty_string',
          field: key,
          message: `Field '${key}' is empty string, should be null or omitted`,
          suggestion: `Remove field or set to null`
        });
      }

      if (value === null && ['threadId', 'projectId'].includes(key)) {
        issues.push({
          type: 'null_id',
          field: key,
          message: `Field '${key}' is null, should be omitted from payload`,
          suggestion: `Only include ${key} when it has a valid value`
        });
      }
    });

    // Check for missing required fields
    if (data.message === undefined || data.message === '') {
      issues.push({
        type: 'missing_required',
        field: 'message',
        message: 'Required field "message" is missing or empty',
        suggestion: 'Ensure message content is provided'
      });
    }

    return issues;
  }

  // Get request history
  getRequestHistory(limit = 10) {
    return this.interceptedRequests.slice(-limit);
  }

  // Get requests with issues
  getProblematicRequests() {
    return this.interceptedRequests.filter(req => req.issues.length > 0);
  }

  // Clear history
  clearHistory() {
    this.interceptedRequests = [];
  }

  // Log summary
  logSummary() {
    if (!this.enabled) return;

    const total = this.interceptedRequests.length;
    const withIssues = this.getProblematicRequests().length;
    const clean = total - withIssues;

    console.group('📊 API Payload Summary');
    console.log(`Total Requests: ${total}`);
    console.log(`Clean Requests: ${clean}`);
    console.log(`Requests with Issues: ${withIssues}`);
    
    if (withIssues > 0) {
      console.log('\n🚨 Recent Issues:');
      this.getProblematicRequests().slice(-5).forEach(req => {
        console.log(`${req.method} ${req.url}:`, req.issues);
      });
    }
    console.groupEnd();
  }

  // Test message payload creation
  testMessagePayload(message, threadId = null, projectId = null, llmModel = 'gpt-3.5-turbo') {
    if (!this.enabled) return;

    console.group('🧪 Testing Message Payload Creation');
    
    // Test the old way (with issues)
    const oldPayload = {
      message,
      threadId,
      projectId,
      llmModel
    };
    console.log('❌ Old Payload (with issues):', oldPayload);
    console.log('Issues:', this.analyzePayload(oldPayload));

    // Test the new way (fixed)
    const newPayload = {
      message,
      llmModel
    };
    if (threadId) newPayload.threadId = threadId;
    if (projectId) newPayload.projectId = projectId;
    
    console.log('✅ New Payload (fixed):', newPayload);
    console.log('Issues:', this.analyzePayload(newPayload));
    
    console.groupEnd();
  }
}

// Create singleton instance
const apiPayloadDebugger = new ApiPayloadDebugger();

// Expose to window for manual testing in dev tools
if (process.env.NODE_ENV === 'development') {
  window.apiPayloadDebugger = apiPayloadDebugger;
}

export default apiPayloadDebugger;
