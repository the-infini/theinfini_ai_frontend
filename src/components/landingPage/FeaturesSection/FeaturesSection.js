import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FeaturesSection.css';

const FeaturesSection = () => {
  const navigate = useNavigate();

  const handleStartTrial = () => {
    window.open('/chat', '_blank');
  };

  const features = [
    {
      icon: '🤖',
      title: 'Multiple AI Models',
      description: 'Access OpenAI GPT and Anthropic Claude models in one platform. Switch between different AI personalities and capabilities seamlessly.',
      highlights: ['GPT-4 & GPT-3.5', 'Claude AI', 'Model Switching', 'Optimized Performance']
    },
    {
      icon: '⚡',
      title: 'Lightning Fast Responses',
      description: 'Experience near-instantaneous AI responses with our optimized infrastructure and intelligent caching system.',
      highlights: ['Sub-second Response', 'Smart Caching', 'Global CDN', '99.9% Uptime']
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your conversations are protected with enterprise-grade security. We prioritize your privacy and data protection.',
      highlights: ['End-to-End Encryption', 'GDPR Compliant', 'No Data Mining', 'Secure Storage']
    },
    {
      icon: '💬',
      title: 'Smart Conversations',
      description: 'Maintain context across long conversations with intelligent memory management and conversation threading.',
      highlights: ['Context Awareness', 'Conversation History', 'Smart Threading', 'Memory Management']
    },
    {
      icon: '🎯',
      title: 'Personalized Experience',
      description: 'Customize your AI interactions with personalized settings, preferences, and conversation styles.',
      highlights: ['Custom Preferences', 'Adaptive Learning', 'Personal Dashboard', 'Usage Analytics']
    },
    {
      icon: '🌐',
      title: 'Multi-Platform Access',
      description: 'Access your AI assistant from anywhere with our responsive web app and upcoming mobile applications.',
      highlights: ['Web Application', 'Mobile Ready', 'Cross-Platform', 'Offline Support']
    }
  ];

  return (
    <section id="features" className="features">
      <div className="container">
        <div className="features__header">
          <h2 className="features__title">
            Powerful Features for
            <span className="features__title-highlight"> Modern AI Interaction</span>
          </h2>
          <p className="features__subtitle">
            Discover the advanced capabilities that make TheInfini AI the ultimate platform
            for intelligent conversations and AI-powered assistance.
          </p>
        </div>

        <div className="features__grid">
          {features.map((feature, index) => (
            <div key={index} className="features__card">
              <div className="features__card-header">
                <div className="features__icon">
                  <span>{feature.icon}</span>
                </div>
                <h3 className="features__card-title">{feature.title}</h3>
              </div>

              <p className="features__card-description">
                {feature.description}
              </p>

              <ul className="features__highlights">
                {feature.highlights.map((highlight, highlightIndex) => (
                  <li key={highlightIndex} className="features__highlight-item">
                    <span className="features__highlight-icon">✓</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="features__cta">
          <div className="features__cta-content">
            <h3 className="features__cta-title">Ready to Experience the Future?</h3>
            <p className="features__cta-description">
              Join thousands of users who are already leveraging the power of advanced AI conversations.
            </p>
            <button className="btn btn-primary btn-large" onClick={handleStartTrial}>
              Start Your Free Trial
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
