import React from 'react';
import {
  Header,
  HeroSection,
  FeaturesSection,
  AboutSection,
  CTASection,
  Footer
} from '../components/landingPage';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <AboutSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
