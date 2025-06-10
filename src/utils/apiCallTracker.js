// Utility to track and debug API calls to identify duplicates
class ApiCallTracker {
  constructor() {
    this.calls = new Map();
    this.enabled = process.env.NODE_ENV === 'development';
  }

  track(url, method = 'GET', data = null) {
    if (!this.enabled) return;

    const key = `${method.toUpperCase()} ${url}`;
    const timestamp = Date.now();
    
    if (!this.calls.has(key)) {
      this.calls.set(key, []);
    }
    
    const callHistory = this.calls.get(key);
    callHistory.push({
      timestamp,
      data,
      stack: new Error().stack
    });

    // Check for potential duplicates (calls within 100ms)
    const recentCalls = callHistory.filter(call => 
      timestamp - call.timestamp < 100
    );

    if (recentCalls.length > 1) {
      console.warn(`🚨 Potential duplicate API call detected:`, {
        endpoint: key,
        count: recentCalls.length,
        timestamps: recentCalls.map(call => call.timestamp),
        data: recentCalls.map(call => call.data)
      });
      
      // Log stack traces for debugging
      recentCalls.forEach((call, index) => {
        console.log(`Call ${index + 1} stack:`, call.stack);
      });
    }
  }

  getStats() {
    if (!this.enabled) return {};

    const stats = {};
    for (const [endpoint, calls] of this.calls.entries()) {
      stats[endpoint] = {
        totalCalls: calls.length,
        firstCall: new Date(calls[0].timestamp).toISOString(),
        lastCall: new Date(calls[calls.length - 1].timestamp).toISOString(),
        duplicates: this.findDuplicates(calls)
      };
    }
    return stats;
  }

  findDuplicates(calls) {
    const duplicates = [];
    for (let i = 0; i < calls.length - 1; i++) {
      const current = calls[i];
      const next = calls[i + 1];
      if (next.timestamp - current.timestamp < 100) {
        duplicates.push({
          call1: current.timestamp,
          call2: next.timestamp,
          timeDiff: next.timestamp - current.timestamp
        });
      }
    }
    return duplicates;
  }

  clear() {
    this.calls.clear();
  }

  logStats() {
    if (!this.enabled) return;
    
    console.table(this.getStats());
  }
}

// Create singleton instance
const apiCallTracker = new ApiCallTracker();

export default apiCallTracker;
