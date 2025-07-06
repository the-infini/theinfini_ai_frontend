import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleSignIn = () => {
    navigate('/signin');
    setIsMobileMenuOpen(false);
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/chat');
    } else {
      navigate('/signin');
    }
    setIsMobileMenuOpen(false);
  };

  const handleProfile = () => {
    navigate('/profile');
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
      <div className="container">
        <div className="header__content">
          {/* Logo */}
          <div className="header__logo">
            <h2>the infini ai</h2>
          </div>

          {/* Desktop Navigation */}
          <nav className="header__nav">
            <ul className="header__nav-list">
              <li>
                <button
                  onClick={() => scrollToSection('home')}
                  className="header__nav-link"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('features')}
                  className="header__nav-link"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="header__nav-link"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('about')}
                  className="header__nav-link"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="header__nav-link"
                >
                  Contact
                </button>
              </li>
            </ul>
          </nav>

          {/* CTA Buttons */}
          <div className="header__actions">
            {isAuthenticated ? (
              <>
                <button className="btn btn-secondary" onClick={handleProfile}>
                  {user?.firstName || 'Profile'}
                </button>
                <button className="btn btn-primary" onClick={handleGetStarted}>
                  Go to Chat
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-secondary" onClick={handleSignIn}>
                  Sign In
                </button>
                <button className="btn btn-primary" onClick={handleGetStarted}>
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="header__mobile-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className={`header__mobile-nav ${isMobileMenuOpen ? 'header__mobile-nav--open' : ''}`}>
          <ul className="header__mobile-nav-list">
            <li>
              <button
                onClick={() => scrollToSection('home')}
                className="header__mobile-nav-link"
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('features')}
                className="header__mobile-nav-link"
              >
                Features
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('pricing')}
                className="header__mobile-nav-link"
              >
                Pricing
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('about')}
                className="header__mobile-nav-link"
              >
                About
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('contact')}
                className="header__mobile-nav-link"
              >
                Contact
              </button>
            </li>
            <li className="header__mobile-actions">
              {isAuthenticated ? (
                <>
                  <button className="btn btn-secondary mb-2" onClick={handleProfile}>
                    {user?.firstName || 'Profile'}
                  </button>
                  <button className="btn btn-primary" onClick={handleGetStarted}>
                    Go to Chat
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-secondary mb-2" onClick={handleSignIn}>
                    Sign In
                  </button>
                  <button className="btn btn-primary" onClick={handleGetStarted}>
                    Get Started
                  </button>
                </>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
