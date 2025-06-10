import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleChatNow = () => {
    window.open('/chat', '_blank');
  };

  return (
    <section id="home" className="hero">
      <div className="hero__background">
        <div className="hero__gradient"></div>
        <div className="hero__particles"></div>
      </div>

      <div className="container">
        <div className="hero__content">
          <div className="hero__text">
            <h1 className="hero__title">
              Experience the Future of
              <span className="hero__title-highlight"> AI Conversations</span>
            </h1>

            <p className="hero__subtitle">
              Unlock the power of advanced AI with the infini ai. Chat with multiple AI models,
              get intelligent responses, and explore limitless possibilities in one seamless platform.
            </p>

            <div className="hero__features-list">
              <div className="hero__feature-item">
                <span className="hero__feature-icon">🤖</span>
                <span>Multiple AI Models</span>
              </div>
              <div className="hero__feature-item">
                <span className="hero__feature-icon">⚡</span>
                <span>Lightning Fast</span>
              </div>
              <div className="hero__feature-item">
                <span className="hero__feature-icon">🔒</span>
                <span>Secure & Private</span>
              </div>
            </div>

            <div className="hero__actions">
              <button className="btn btn-primary btn-large hero__cta" onClick={handleChatNow}>
                Chat Now
              </button>
              <button
                className="btn btn-secondary btn-large"
                onClick={scrollToFeatures}
              >
                Learn More
              </button>
            </div>

            <div className="hero__stats">
              <div className="hero__stat">
                <span className="hero__stat-number">10K+</span>
                <span className="hero__stat-label">Active Users</span>
              </div>
              <div className="hero__stat">
                <span className="hero__stat-number">1M+</span>
                <span className="hero__stat-label">Messages Processed</span>
              </div>
              <div className="hero__stat">
                <span className="hero__stat-number">99.9%</span>
                <span className="hero__stat-label">Uptime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
