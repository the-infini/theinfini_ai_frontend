import React, { useState, useEffect } from 'react';
import apiCallTracker from '../../utils/apiCallTracker';
import csrfDebugger from '../../utils/csrfDebugger';
import apiPayloadDebugger from '../../utils/apiPayloadDebugger';
import './ApiCallDebugger.css';

const ApiCallDebugger = () => {
  const [stats, setStats] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(apiCallTracker.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const clearStats = () => {
    apiCallTracker.clear();
    setStats({});
  };

  const logStats = () => {
    apiCallTracker.logStats();
  };

  const testCSRF = async () => {
    await csrfDebugger.refreshAndTest();
  };

  const testProjects = async () => {
    await csrfDebugger.testEndpoint('GET', '/projects');
  };

  const showCSRFInfo = () => {
    csrfDebugger.logDebugInfo();
  };

  const testSessionConsistency = () => {
    csrfDebugger.testSessionConsistency();
  };

  const testPayload = () => {
    apiPayloadDebugger.testMessagePayload(
      'Test message',
      null, // threadId
      null, // projectId
      'gpt-4'
    );
  };

  const showPayloadSummary = () => {
    apiPayloadDebugger.logSummary();
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className={`api-debugger ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="api-debugger__toggle">
        <button onClick={() => setIsVisible(!isVisible)}>
          {isVisible ? '🔽' : '🔼'} API Debug
        </button>
      </div>

      {isVisible && (
        <div className="api-debugger__content">
          <div className="api-debugger__header">
            <h3>API Call Tracker</h3>
            <div className="api-debugger__actions">
              <button onClick={logStats} className="btn-log">
                Log Stats
              </button>
              <button onClick={clearStats} className="btn-clear">
                Clear
              </button>
              <button onClick={testCSRF} className="btn-test">
                Test CSRF
              </button>
              <button onClick={testProjects} className="btn-test">
                Test /projects
              </button>
              <button onClick={showCSRFInfo} className="btn-info">
                CSRF Info
              </button>
              <button onClick={testSessionConsistency} className="btn-test">
                Test Session
              </button>
              <button onClick={testPayload} className="btn-test">
                Test Payload
              </button>
              <button onClick={showPayloadSummary} className="btn-info">
                Payload Summary
              </button>
            </div>
          </div>

          <div className="api-debugger__stats">
            {Object.keys(stats).length === 0 ? (
              <p>No API calls tracked yet</p>
            ) : (
              Object.entries(stats).map(([endpoint, data]) => (
                <div key={endpoint} className="api-call-stat">
                  <div className="endpoint-name">{endpoint}</div>
                  <div className="call-info">
                    <span className="call-count">
                      Calls: {data.totalCalls}
                    </span>
                    {data.duplicates.length > 0 && (
                      <span className="duplicate-warning">
                        ⚠️ {data.duplicates.length} potential duplicates
                      </span>
                    )}
                  </div>
                  <div className="call-times">
                    <small>
                      First: {new Date(data.firstCall).toLocaleTimeString()}
                      {data.lastCall !== data.firstCall && (
                        <> | Last: {new Date(data.lastCall).toLocaleTimeString()}</>
                      )}
                    </small>
                  </div>
                  {data.duplicates.length > 0 && (
                    <div className="duplicates-list">
                      {data.duplicates.map((dup, index) => (
                        <div key={index} className="duplicate-item">
                          Duplicate calls {dup.timeDiff}ms apart
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiCallDebugger;
