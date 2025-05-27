import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
      <div className="container">
        <div className="header__content">
          {/* Logo */}
          <div className="header__logo">
            <h2>TheInfini AI</h2>
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
            <button className="btn btn-secondary">Sign In</button>
            <button className="btn btn-primary">Get Started</button>
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
              <button className="btn btn-secondary mb-2">Sign In</button>
              <button className="btn btn-primary">Get Started</button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
