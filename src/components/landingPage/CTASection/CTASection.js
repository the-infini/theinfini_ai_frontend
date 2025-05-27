import React from 'react';
import './CTASection.css';

const CTASection = () => {
  return (
    <section className="cta">
      <div className="cta__background">
        <div className="cta__gradient"></div>
        <div className="cta__particles"></div>
      </div>
      
      <div className="container">
        <div className="cta__content">
          <div className="cta__text">
            <h2 className="cta__title">
              Ready to Transform Your
              <span className="cta__title-highlight"> AI Experience?</span>
            </h2>
            
            <p className="cta__subtitle">
              Join thousands of users who are already experiencing the future of AI conversations. 
              Start your journey with TheInfini AI today and unlock unlimited possibilities.
            </p>
            
            <div className="cta__features">
              <div className="cta__feature">
                <span className="cta__feature-icon">✨</span>
                <span>Free to start, no credit card required</span>
              </div>
              <div className="cta__feature">
                <span className="cta__feature-icon">🚀</span>
                <span>Instant access to multiple AI models</span>
              </div>
              <div className="cta__feature">
                <span className="cta__feature-icon">🔒</span>
                <span>Enterprise-grade security and privacy</span>
              </div>
            </div>
            
            <div className="cta__actions">
              <button className="btn btn-primary btn-large cta__primary-btn">
                Get Started Free
              </button>
              <button className="btn btn-secondary btn-large">
                View Pricing
              </button>
            </div>
            
            <div className="cta__trust-indicators">
              <div className="cta__trust-item">
                <span className="cta__trust-number">10K+</span>
                <span className="cta__trust-label">Happy Users</span>
              </div>
              <div className="cta__trust-item">
                <span className="cta__trust-number">4.9/5</span>
                <span className="cta__trust-label">User Rating</span>
              </div>
              <div className="cta__trust-item">
                <span className="cta__trust-number">24/7</span>
                <span className="cta__trust-label">Support</span>
              </div>
            </div>
          </div>
          
          <div className="cta__visual">
            <div className="cta__demo-container">
              <div className="cta__demo-header">
                <h3>Try it now!</h3>
                <p>Experience AI conversation instantly</p>
              </div>
              
              <div className="cta__demo-chat">
                <div className="cta__demo-message cta__demo-message--user">
                  <div className="cta__demo-avatar cta__demo-avatar--user">👤</div>
                  <div className="cta__demo-content">
                    Hello! Can you help me write a creative story?
                  </div>
                </div>
                
                <div className="cta__demo-message cta__demo-message--ai">
                  <div className="cta__demo-avatar cta__demo-avatar--ai">🤖</div>
                  <div className="cta__demo-content">
                    Absolutely! I'd love to help you create a creative story. 
                    What genre or theme interests you? Fantasy, sci-fi, mystery, 
                    or something else entirely?
                  </div>
                </div>
                
                <div className="cta__demo-typing">
                  <div className="cta__demo-avatar cta__demo-avatar--ai">🤖</div>
                  <div className="cta__typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
              
              <div className="cta__demo-input">
                <input 
                  type="text" 
                  placeholder="Type your message here..."
                  className="cta__demo-field"
                  readOnly
                />
                <button className="cta__demo-send">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
