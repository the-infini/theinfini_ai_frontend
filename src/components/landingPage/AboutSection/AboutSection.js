import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutSection.css';

const AboutSection = () => {
  const navigate = useNavigate();

  const handleStartTrial = () => {
    window.open('/chat', '_blank');
  };

  const stats = [
    { number: '10K+', label: 'Active Users', description: 'Growing community of AI enthusiasts' },
    { number: '1M+', label: 'Messages Processed', description: 'Conversations powered by AI' },
    { number: '99.9%', label: 'Uptime', description: 'Reliable service you can count on' },
    { number: '24/7', label: 'Support', description: 'Always here when you need us' }
  ];

  const technologies = [
    { name: 'OpenAI GPT', description: 'Advanced language models for natural conversations' },
    { name: 'Anthropic Claude', description: 'Ethical AI with enhanced reasoning capabilities' },
    { name: 'Node.js Backend', description: 'Robust and scalable server infrastructure' },
    { name: 'React Frontend', description: 'Modern, responsive user interface' },
    { name: 'MySQL Database', description: 'Secure and reliable data storage' },
    { name: 'JWT Security', description: 'Enterprise-grade authentication system' }
  ];

  return (
    <section id="about" className="about">
      <div className="container">
        <div className="about__content">
          <div className="about__text">
            <h2 className="about__title">
              About
              <span className="about__title-highlight"> the infini ai</span>
            </h2>

            <p className="about__description">
              the infini ai represents the next generation of AI-powered conversation platforms.
              Built with cutting-edge technology and designed for both casual users and professionals,
              our platform provides seamless access to multiple AI models in one unified interface.
            </p>

            <p className="about__description">
              We believe in democratizing access to advanced AI capabilities while maintaining
              the highest standards of security, privacy, and user experience. Our mission is to
              make AI conversations more natural, helpful, and accessible to everyone.
            </p>

            <div className="about__features">
              <div className="about__feature">
                <h4>🚀 Innovation First</h4>
                <p>Constantly evolving with the latest AI advancements and user feedback.</p>
              </div>
              <div className="about__feature">
                <h4>🛡️ Privacy Focused</h4>
                <p>Your data is protected with enterprise-grade security and encryption.</p>
              </div>
              <div className="about__feature">
                <h4>🌟 User Centric</h4>
                <p>Designed with user experience and accessibility at the forefront.</p>
              </div>
            </div>
          </div>

          <div className="about__visual">
            <div className="about__stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="about__stat-card">
                  <div className="about__stat-number">{stat.number}</div>
                  <div className="about__stat-label">{stat.label}</div>
                  <div className="about__stat-description">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="about__tech-section">
          <h3 className="about__tech-title">Built with Modern Technology</h3>
          <div className="about__tech-grid">
            {technologies.map((tech, index) => (
              <div key={index} className="about__tech-item">
                <h4 className="about__tech-name">{tech.name}</h4>
                <p className="about__tech-description">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="about__mission">
          <div className="about__mission-content">
            <h3 className="about__mission-title">Our Mission</h3>
            <p className="about__mission-text">
              To bridge the gap between human creativity and artificial intelligence,
              creating a platform where technology enhances human potential rather than replacing it.
              We envision a future where AI conversations are as natural and meaningful as
              human interactions, empowering users to achieve more than they ever thought possible.
            </p>
            <div className="about__mission-values">
              <div className="about__value">
                <span className="about__value-icon">💡</span>
                <span>Innovation</span>
              </div>
              <div className="about__value">
                <span className="about__value-icon">🤝</span>
                <span>Collaboration</span>
              </div>
              <div className="about__value">
                <span className="about__value-icon">🎯</span>
                <span>Excellence</span>
              </div>
              <div className="about__value">
                <span className="about__value-icon">🌍</span>
                <span>Accessibility</span>
              </div>
            </div>

            <div className="about__cta">
              <button className="btn btn-primary btn-large" onClick={handleStartTrial}>
                Start Your Free Trial
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
