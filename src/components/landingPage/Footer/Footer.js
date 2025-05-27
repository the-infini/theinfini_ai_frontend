import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'API Documentation', href: '#api' },
      { name: 'Integrations', href: '#integrations' }
    ],
    company: [
      { name: 'About Us', href: '#about' },
      { name: 'Blog', href: '#blog' },
      { name: 'Careers', href: '#careers' },
      { name: 'Contact', href: '#contact' }
    ],
    support: [
      { name: 'Help Center', href: '#help' },
      { name: 'Community', href: '#community' },
      { name: 'Status', href: '#status' },
      { name: 'Bug Reports', href: '#bugs' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' },
      { name: 'Cookie Policy', href: '#cookies' },
      { name: 'GDPR', href: '#gdpr' }
    ]
  };

  const socialLinks = [
    { name: 'Twitter', icon: '🐦', href: '#twitter' },
    { name: 'LinkedIn', icon: '💼', href: '#linkedin' },
    { name: 'GitHub', icon: '🐙', href: '#github' },
    { name: 'Discord', icon: '💬', href: '#discord' }
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId.replace('#', ''));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="contact" className="footer">
      <div className="container">
        <div className="footer__content">
          <div className="footer__main">
            <div className="footer__brand">
              <h3 className="footer__logo">TheInfini AI</h3>
              <p className="footer__description">
                Empowering conversations with advanced AI technology. 
                Experience the future of intelligent interactions today.
              </p>
              <div className="footer__social">
                {socialLinks.map((social, index) => (
                  <a 
                    key={index}
                    href={social.href}
                    className="footer__social-link"
                    aria-label={social.name}
                  >
                    <span>{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="footer__links">
              <div className="footer__link-group">
                <h4 className="footer__link-title">Product</h4>
                <ul className="footer__link-list">
                  {footerLinks.product.map((link, index) => (
                    <li key={index}>
                      <button 
                        onClick={() => scrollToSection(link.href)}
                        className="footer__link"
                      >
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="footer__link-group">
                <h4 className="footer__link-title">Company</h4>
                <ul className="footer__link-list">
                  {footerLinks.company.map((link, index) => (
                    <li key={index}>
                      <button 
                        onClick={() => scrollToSection(link.href)}
                        className="footer__link"
                      >
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="footer__link-group">
                <h4 className="footer__link-title">Support</h4>
                <ul className="footer__link-list">
                  {footerLinks.support.map((link, index) => (
                    <li key={index}>
                      <button 
                        onClick={() => scrollToSection(link.href)}
                        className="footer__link"
                      >
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="footer__link-group">
                <h4 className="footer__link-title">Legal</h4>
                <ul className="footer__link-list">
                  {footerLinks.legal.map((link, index) => (
                    <li key={index}>
                      <button 
                        onClick={() => scrollToSection(link.href)}
                        className="footer__link"
                      >
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="footer__newsletter">
            <div className="footer__newsletter-content">
              <h4 className="footer__newsletter-title">Stay Updated</h4>
              <p className="footer__newsletter-description">
                Get the latest updates on new features and AI advancements.
              </p>
              <div className="footer__newsletter-form">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="footer__newsletter-input"
                />
                <button className="btn btn-primary footer__newsletter-btn">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <div className="footer__bottom-content">
            <p className="footer__copyright">
              © {currentYear} TheInfini AI. All rights reserved.
            </p>
            <div className="footer__bottom-links">
              <span className="footer__status">
                <span className="footer__status-dot"></span>
                All systems operational
              </span>
              <button 
                onClick={scrollToTop}
                className="footer__back-to-top"
                aria-label="Back to top"
              >
                ↑ Back to top
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
